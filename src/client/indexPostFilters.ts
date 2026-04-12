/** 首页文章列表：分类 / 标签 / 搜索筛选、URL 同步、分页（每页最多 5 篇） */
const CAT_LEGACY = new Map<string, string>([
  ["essay", "随笔"],
  ["logic", "逻辑"],
  ["philosophy", "哲学"],
  ["tech", "逻辑"],
  ["math", "哲学"],
  ["read", "哲学"],
  ["project", "项目"],
]);

const CAT_VALID = new Set(["逻辑", "哲学", "随笔", "项目"]);
const PAGE_SIZE = 5;

function searchTokensFromQuery(raw: string): string[] {
  return raw
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function rowMatchesSearchTokens(row: Element, tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  const haystack = (row.getAttribute("data-search") || "").toLowerCase();
  return tokens.every((t) => haystack.includes(t));
}

export function initIndexPostFilters(): void {
  let category: string | null = null;
  let tags = new Set<string>();
  let listPage = 1;
  let searchQuery = "";

  const catButtons = document.querySelectorAll(".cat-btn");
  const tagBadges = document.querySelectorAll(".tag-badge");
  const postRows = document.querySelectorAll(".post-row");
  const postSearch = document.getElementById(
    "post-search",
  ) as HTMLInputElement | null;
  const filterStatus = document.getElementById("filter-status");
  const filterClear = document.getElementById("filter-clear");
  const emptyFilter = document.getElementById("empty-filter");
  const emptyFilterClear = document.getElementById("empty-filter-clear");
  const postsList = document.getElementById("posts-list");
  const inlineTags = document.querySelectorAll("[data-tag-inline]");
  const postPagination = document.getElementById("post-pagination");
  const postPagePrev = document.getElementById(
    "post-page-prev",
  ) as HTMLButtonElement | null;
  const postPageNext = document.getElementById(
    "post-page-next",
  ) as HTMLButtonElement | null;
  const postPageIndicator = document.getElementById("post-page-indicator");

  function readURL(): void {
    listPage = 1;
    const params = new URLSearchParams(window.location.search);
    let cat = params.get("cat");
    if (cat && CAT_LEGACY.has(cat)) cat = CAT_LEGACY.get(cat) ?? null;
    if (cat && !CAT_VALID.has(cat)) cat = null;
    category = cat || null;
    const tagsParam = params.get("tags");
    tags = new Set(tagsParam ? tagsParam.split(",").filter(Boolean) : []);
    searchQuery = params.get("q") ?? "";
    if (postSearch) postSearch.value = searchQuery;
  }

  function writeURL(): void {
    const params = new URLSearchParams();
    if (category) params.set("cat", category);
    if (tags.size > 0) params.set("tags", [...tags].join(","));
    const qTrim = searchQuery.trim();
    if (qTrim) params.set("q", qTrim);
    const url = params.toString()
      ? `${window.location.pathname}?${params}`
      : window.location.pathname;
    history.replaceState(null, "", url);
  }

  function updateView(): void {
    const tokens = searchTokensFromQuery(searchQuery);

    catButtons.forEach((btn) => {
      const cat = btn.getAttribute("data-cat");
      btn.classList.toggle("active", cat === (category || ""));
    });

    const fullyMatched: Element[] = [];
    const visibleTags = new Set<string>();

    postRows.forEach((row) => {
      const rowCat = row.getAttribute("data-category") || "";
      const rowTags = (row.getAttribute("data-tags") || "")
        .split(",")
        .filter(Boolean);
      const matchesCat = !category || rowCat === category;
      const matchesTags =
        tags.size === 0 || [...tags].every((t) => rowTags.includes(t));
      const rowMatchesFilters = matchesCat && matchesTags;
      const matchesSearch = rowMatchesSearchTokens(row, tokens);
      const fullMatch = rowMatchesFilters && matchesSearch;

      if (fullMatch) fullyMatched.push(row);

      if (category) {
        if (rowMatchesFilters) rowTags.forEach((t) => visibleTags.add(t));
        else if (matchesCat) rowTags.forEach((t) => visibleTags.add(t));
      } else if (rowMatchesFilters) {
        rowTags.forEach((t) => visibleTags.add(t));
      }
    });

    const matchTotal = fullyMatched.length;
    const totalListPages = Math.max(1, Math.ceil(matchTotal / PAGE_SIZE));
    if (listPage > totalListPages) listPage = totalListPages;
    if (listPage < 1) listPage = 1;

    const start = (listPage - 1) * PAGE_SIZE;
    const onPage = new Set(fullyMatched.slice(start, start + PAGE_SIZE));

    postRows.forEach((row) => {
      const rowCat = row.getAttribute("data-category") || "";
      const rowTags = (row.getAttribute("data-tags") || "")
        .split(",")
        .filter(Boolean);
      const matchesCat = !category || rowCat === category;
      const matchesTags =
        tags.size === 0 || [...tags].every((t) => rowTags.includes(t));
      const rowMatchesFilters = matchesCat && matchesTags;
      const matchesSearch = rowMatchesSearchTokens(row, tokens);
      const fullMatch = rowMatchesFilters && matchesSearch;

      if (!fullMatch) {
        row.classList.add("hidden");
      } else if (!onPage.has(row)) {
        row.classList.add("hidden");
      } else {
        row.classList.remove("hidden");
      }
    });

    tagBadges.forEach((badge) => {
      const tag = badge.getAttribute("data-tag");
      badge.classList.toggle("active", tag !== null && tags.has(tag));
      if (category) {
        badge.classList.toggle(
          "hidden",
          tag === null || !visibleTags.has(tag),
        );
      } else {
        badge.classList.remove("hidden");
      }
    });

    const hasFilter =
      Boolean(category) || tags.size > 0 || tokens.length > 0;
    /** 顶栏「筛选：…」不展示；分类 / 标签仅靠侧栏与 URL 体现 */
    if (filterStatus) filterStatus.style.display = "none";

    if (emptyFilter && postsList) {
      if (matchTotal === 0 && hasFilter) {
        emptyFilter.style.display = "block";
        postsList.style.display = "none";
      } else {
        emptyFilter.style.display = "none";
        postsList.style.display = "flex";
      }
    }

    if (postPagination && postPagePrev && postPageNext && postPageIndicator) {
      const showPager = postRows.length > 0 && totalListPages > 1;
      postPagination.hidden = !showPager;
      if (showPager) {
        postPagePrev.disabled = listPage <= 1;
        postPageNext.disabled = listPage >= totalListPages;
        postPageIndicator.textContent = `第 ${listPage} / ${totalListPages} 页 · 共 ${matchTotal} 篇`;
      }
    }

    writeURL();
  }

  function clearFilters(): void {
    category = null;
    tags.clear();
    searchQuery = "";
    if (postSearch) postSearch.value = "";
    listPage = 1;
    updateView();
  }

  catButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const raw = btn.getAttribute("data-cat");
      category = raw === null || raw === "" ? null : raw;
      tags.clear();
      listPage = 1;
      updateView();
    });
  });

  tagBadges.forEach((badge) => {
    badge.addEventListener("click", () => {
      const tag = badge.getAttribute("data-tag");
      if (!tag) return;
      if (tags.has(tag)) tags.delete(tag);
      else tags.add(tag);
      listPage = 1;
      updateView();
    });
  });

  inlineTags.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const tagName = el.getAttribute("data-tag-inline");
      if (!tagName) return;
      tags.clear();
      tags.add(tagName);
      listPage = 1;
      updateView();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  if (filterClear) filterClear.addEventListener("click", clearFilters);
  if (emptyFilterClear)
    emptyFilterClear.addEventListener("click", clearFilters);

  if (postPagePrev) {
    postPagePrev.addEventListener("click", () => {
      listPage = Math.max(1, listPage - 1);
      updateView();
      postsList?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }
  if (postPageNext) {
    postPageNext.addEventListener("click", () => {
      listPage += 1;
      updateView();
      postsList?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  if (postSearch) {
    postSearch.addEventListener("input", () => {
      searchQuery = postSearch.value;
      listPage = 1;
      updateView();
    });
  }

  readURL();
  updateView();
}
