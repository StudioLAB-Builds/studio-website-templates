const nav = document.querySelector(".nav");
const toggle = document.querySelector(".menu-toggle");

if (nav && toggle) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

const observer = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.16 })
  : null;

for (const element of document.querySelectorAll(".reveal")) {
  if (observer) {
    observer.observe(element);
  } else {
    element.classList.add("is-visible");
  }
}
