import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import open from "open";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STUDIOS_DIR = path.join(ROOT, "studios");
const PORT = Number(process.env.ADMIN_PORT || 4178);
const PUBLIC_BASE = process.env.PUBLIC_BASE || "https://studiolab-builds.github.io/studio-demos";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8"
};

function jsonResponse(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(payload)
  });
  res.end(payload);
}

function errorResponse(res, status, message) {
  jsonResponse(res, status, { error: message });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function listStudios() {
  if (!fs.existsSync(STUDIOS_DIR)) return [];
  return fs
    .readdirSync(STUDIOS_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((slug) => fs.existsSync(path.join(STUDIOS_DIR, slug, "templates.json")))
    .sort();
}

function readManifest(slug) {
  const manifestPath = path.join(STUDIOS_DIR, slug, "templates.json");
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

function writeManifest(slug, data) {
  const manifestPath = path.join(STUDIOS_DIR, slug, "templates.json");
  fs.writeFileSync(manifestPath, JSON.stringify(data, null, 2) + "\n");
}

function rebuildGalleries() {
  const result = spawnSync(process.execPath, [path.join(ROOT, "scripts", "build-studio-galleries.mjs")], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"]
  });
  return {
    ok: result.status === 0,
    stdout: result.stdout?.toString() ?? "",
    stderr: result.stderr?.toString() ?? ""
  };
}

function normaliseTemplate(t) {
  // Back-compat: legacy schema had status=visible|hidden (visibility role).
  // New schema: status=enabled|disabled|archived, visibility=visible|hidden.
  if (t.visibility === undefined && (t.status === "visible" || t.status === "hidden")) {
    t.visibility = t.status;
    t.status = "enabled";
  }
  if (t.visibility === undefined) t.visibility = "visible";
  if (!["enabled", "disabled", "archived"].includes(t.status)) t.status = "enabled";
  return t;
}

function studioSummary(slug) {
  const manifest = readManifest(slug);
  const templates = (Array.isArray(manifest.templates) ? manifest.templates : []).map(normaliseTemplate);
  const visible = templates.filter((t) => t.visibility === "visible");
  const hidden = templates.filter((t) => t.visibility === "hidden");
  const enabled = templates.filter((t) => t.status === "enabled");
  const disabled = templates.filter((t) => t.status === "disabled");
  const archived = templates.filter((t) => t.status === "archived");
  const live = templates.filter((t) => t.status === "enabled" && t.visibility === "visible");
  return {
    slug,
    name: manifest.studio?.name ?? slug,
    location: manifest.studio?.location ?? "",
    shareUrl: `${PUBLIC_BASE}/studios/${slug}/`,
    visibleCount: visible.length,
    hiddenCount: hidden.length,
    enabledCount: enabled.length,
    disabledCount: disabled.length,
    archivedCount: archived.length,
    liveCount: live.length,
    totalCount: templates.length,
    manifest
  };
}

function deleteDemoFolder(slug, demoPath) {
  // demoPath is the manifest 'path' field, e.g. "demos/demo-1-foo/"
  const studioDir = path.join(STUDIOS_DIR, slug);
  const trimmed = String(demoPath).replace(/^\/+|\/+$/g, "");
  if (!trimmed.startsWith("demos/")) {
    throw new Error(`Refusing to delete path outside demos/: ${demoPath}`);
  }
  const absolute = path.resolve(studioDir, trimmed);
  if (!absolute.startsWith(path.resolve(studioDir, "demos") + path.sep)) {
    throw new Error("Path traversal blocked");
  }
  if (fs.existsSync(absolute)) {
    fs.rmSync(absolute, { recursive: true, force: true });
  }
  return absolute;
}

function safeStaticPath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const normalized = path.normalize(decoded).replace(/^([/\\])+/, "");
  const absolute = path.join(ROOT, normalized);
  if (!absolute.startsWith(ROOT)) return null;
  return absolute;
}

function serveStatic(req, res, pathname) {
  let resolved = safeStaticPath(pathname === "/" ? "/index.html" : pathname);
  if (!resolved) return errorResponse(res, 400, "Bad path");

  if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
    resolved = path.join(resolved, "index.html");
  }
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("Not found");
  }

  const ext = path.extname(resolved).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  const stream = fs.createReadStream(resolved);
  res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
  stream.pipe(res);
}

async function handleApi(req, res, url) {
  const { pathname } = url;

  if (pathname === "/api/health" && req.method === "GET") {
    return jsonResponse(res, 200, { ok: true, version: 1, publicBase: PUBLIC_BASE });
  }

  if (pathname === "/api/studios" && req.method === "GET") {
    const studios = listStudios().map((slug) => {
      const summary = studioSummary(slug);
      const { manifest, ...rest } = summary;
      return rest;
    });
    return jsonResponse(res, 200, { studios, publicBase: PUBLIC_BASE });
  }

  const studioMatch = pathname.match(/^\/api\/studios\/([a-z0-9-]+)$/i);
  if (studioMatch && req.method === "GET") {
    const [, slug] = studioMatch;
    if (!listStudios().includes(slug)) return errorResponse(res, 404, "Studio not found");
    return jsonResponse(res, 200, studioSummary(slug));
  }

  const templateMatch = pathname.match(/^\/api\/studios\/([a-z0-9-]+)\/templates\/([a-z0-9-]+)$/i);
  if (templateMatch && req.method === "PATCH") {
    const [, slug, templateId] = templateMatch;
    if (!listStudios().includes(slug)) return errorResponse(res, 404, "Studio not found");

    let body;
    try {
      body = await readBody(req);
    } catch (err) {
      return errorResponse(res, 400, err.message);
    }

    const manifest = readManifest(slug);
    const template = manifest.templates?.find((t) => t.id === templateId);
    if (!template) return errorResponse(res, 404, "Template not found");
    normaliseTemplate(template);

    if (body.visibility !== undefined) {
      if (!["visible", "hidden"].includes(body.visibility)) {
        return errorResponse(res, 400, "visibility must be 'visible' or 'hidden'");
      }
      template.visibility = body.visibility;
    }
    if (body.status !== undefined) {
      if (!["enabled", "disabled", "archived"].includes(body.status)) {
        return errorResponse(res, 400, "status must be 'enabled', 'disabled', or 'archived'");
      }
      template.status = body.status;
    }
    if (body.order !== undefined && Number.isFinite(body.order)) {
      template.order = body.order;
    }

    // Enabling a demo whose folder is missing on disk is a hard error.
    if (body.status === "enabled" || body.visibility === "visible") {
      const demoDir = path.join(STUDIOS_DIR, slug, String(template.path).replace(/\/+$/, ""));
      if (!fs.existsSync(demoDir)) {
        return errorResponse(res, 409, `Demo folder missing on disk: ${template.path}. Cannot enable.`);
      }
    }

    writeManifest(slug, manifest);
    const build = rebuildGalleries();
    return jsonResponse(res, 200, {
      ok: true,
      template,
      summary: (() => {
        const { manifest: _m, ...rest } = studioSummary(slug);
        return rest;
      })(),
      build
    });
  }

  if (templateMatch && req.method === "DELETE") {
    const [, slug, templateId] = templateMatch;
    if (!listStudios().includes(slug)) return errorResponse(res, 404, "Studio not found");

    const manifest = readManifest(slug);
    const index = manifest.templates?.findIndex((t) => t.id === templateId);
    if (index === undefined || index < 0) return errorResponse(res, 404, "Template not found");
    const template = manifest.templates[index];

    let deletedPath = null;
    try {
      deletedPath = deleteDemoFolder(slug, template.path);
    } catch (err) {
      return errorResponse(res, 500, `Folder deletion failed: ${err.message}. Manifest unchanged.`);
    }

    manifest.templates.splice(index, 1);
    writeManifest(slug, manifest);
    const build = rebuildGalleries();
    return jsonResponse(res, 200, {
      ok: true,
      removed: { id: templateId, path: deletedPath },
      summary: (() => {
        const { manifest: _m, ...rest } = studioSummary(slug);
        return rest;
      })(),
      build
    });
  }

  const pathMatch = pathname.match(/^\/api\/studios\/([a-z0-9-]+)\/templates\/([a-z0-9-]+)\/local-path$/i);
  if (pathMatch && req.method === "GET") {
    const [, slug, templateId] = pathMatch;
    if (!listStudios().includes(slug)) return errorResponse(res, 404, "Studio not found");
    const manifest = readManifest(slug);
    const template = manifest.templates?.find((t) => t.id === templateId);
    if (!template) return errorResponse(res, 404, "Template not found");
    const absoluteDir = path.join(STUDIOS_DIR, slug, String(template.path).replace(/\/+$/, ""));
    const indexPath = path.join(absoluteDir, "index.html");
    return jsonResponse(res, 200, {
      ok: true,
      dir: absoluteDir,
      indexPath,
      exists: fs.existsSync(indexPath)
    });
  }

  if (pathname === "/api/rebuild" && req.method === "POST") {
    const build = rebuildGalleries();
    return jsonResponse(res, build.ok ? 200 : 500, build);
  }

  return errorResponse(res, 404, "Unknown API route");
}

const server = http.createServer(async (req, res) => {
  let url;
  try {
    url = new URL(req.url, `http://localhost:${PORT}`);
  } catch (err) {
    return errorResponse(res, 400, "Bad URL");
  }

  if (url.pathname.startsWith("/api/")) {
    try {
      await handleApi(req, res, url);
    } catch (err) {
      console.error("API error:", err);
      errorResponse(res, 500, err.message || "Internal error");
    }
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain" });
    return res.end("Method not allowed");
  }

  serveStatic(req, res, url.pathname);
});

server.listen(PORT, "127.0.0.1", () => {
  const url = `http://localhost:${PORT}/`;
  console.log(`\nStudioLAB admin running at ${url}`);
  console.log(`Public share base: ${PUBLIC_BASE}`);
  console.log("Press Ctrl+C to stop.\n");

  if (process.env.NO_OPEN !== "1") {
    setTimeout(() => {
      open(url).catch((err) => {
        console.warn(`Could not auto-open browser: ${err.message}`);
        console.warn(`Open ${url} manually.`);
      });
    }, 400);
  }
});
