/** 文章页：标题点击回主页；文末「返回顶部」按钮 */
let postPageAbort: AbortController | null = null;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function initPostPageUI(): void {
  postPageAbort?.abort();
  postPageAbort = new AbortController();
  const { signal } = postPageAbort;

  const article = document.querySelector("article.prose");
  if (article) {
    article.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((el) => {
      el.setAttribute("title", "返回主页");
    });

    article.addEventListener(
      "click",
      (e) => {
        const n = e.target;
        const el = n instanceof Element ? n : n.parentElement;
        if (!el) return;
        if (el.closest("a, button")) return;
        const heading = el.closest("h1, h2, h3, h4, h5, h6");
        if (!heading || !article.contains(heading)) return;
        window.location.href = "/";
      },
      { signal },
    );
  }

  const topBtn = document.getElementById("post-end-top");
  if (topBtn instanceof HTMLButtonElement) {
    topBtn.addEventListener(
      "click",
      () => {
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
      },
      { signal },
    );
  }
}
