/** 文章页：仅顶栏文章标题（.post-header h1）点击回主页；文末「返回顶部」按钮 */
let postPageAbort: AbortController | null = null;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function initPostPageUI(): void {
  postPageAbort?.abort();
  postPageAbort = new AbortController();
  const { signal } = postPageAbort;

  const article = document.querySelector("article.prose");
  const titleHeading = article?.querySelector(".post-header > h1");
  if (titleHeading instanceof HTMLElement) {
    titleHeading.setAttribute("title", "返回主页");
    titleHeading.addEventListener(
      "click",
      (e) => {
        const t = e.target;
        if (t instanceof Element && t.closest("a, button")) return;
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
