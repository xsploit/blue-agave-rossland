const header = document.querySelector(".top");
const links = [...header.querySelectorAll("nav a")];
const chapters = links.map(link => document.getElementById(link.hash.slice(1)));
const root = document.documentElement;
let activeLink;
let frame = 0;

function updateNavigation() {
  frame = 0;
  const readingLine = header.getBoundingClientRect().bottom + 44;
  const scrollableHeight = root.scrollHeight - root.clientHeight;
  const atEnd = scrollableHeight > 0 && window.scrollY >= scrollableHeight - 2;
  const nextLink = atEnd
    ? links.at(-1)
    : links[chapters.findLastIndex(chapter => chapter.getBoundingClientRect().top <= readingLine)];
  const progress = scrollableHeight > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollableHeight)) : 0;

  if (nextLink !== activeLink) {
    activeLink?.removeAttribute("aria-current");
    nextLink?.setAttribute("aria-current", "location");
    activeLink = nextLink;
  }
  header.style.setProperty("--page-progress", progress);
}

function scheduleNavigation() {
  if (!frame) frame = requestAnimationFrame(updateNavigation);
}

function measureHeader() {
  root.style.setProperty("--nav-height", `${header.offsetHeight}px`);
  scheduleNavigation();
}

measureHeader();
window.addEventListener("scroll", scheduleNavigation, { passive: true });
window.addEventListener("resize", measureHeader);
window.addEventListener("load", scheduleNavigation);

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-entering");
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: .12 });

  chapters.forEach(chapter => observer.observe(chapter));
}
