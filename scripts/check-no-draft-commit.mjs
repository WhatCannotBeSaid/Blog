import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function git(cmd) {
  return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function getRepoRoot() {
  return git("git rev-parse --show-toplevel").trim();
}

function getStagedFiles() {
  const out = git("git diff --cached --name-only --diff-filter=ACMRT");
  return out
    .split(/\r?\n/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function readUtf8(absPath) {
  return fs.readFileSync(absPath, "utf8");
}

function extractFrontmatter(md) {
  // Only treat the very first YAML frontmatter block as frontmatter.
  if (!md.startsWith("---")) return null;
  const m = md.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(\r?\n|$)/);
  return m ? m[1] : null;
}

function isDraftTrue(frontmatter) {
  if (!frontmatter) return false;
  // Matches: draft: true (any whitespace), optional quotes not supported intentionally.
  return /^draft\s*:\s*true\s*$/im.test(frontmatter);
}

const repoRoot = getRepoRoot();
const staged = getStagedFiles();

const blogContentDir = path.posix.join("src", "content", "blog") + "/";
const candidates = staged.filter((p) => {
  const posix = p.replaceAll("\\", "/");
  return (
    posix.startsWith(blogContentDir) &&
    (posix.endsWith(".md") || posix.endsWith(".mdx"))
  );
});

const violating = [];
for (const rel of candidates) {
  const abs = path.join(repoRoot, rel);
  if (!fs.existsSync(abs)) continue; // e.g. rename edge cases
  const content = readUtf8(abs);
  const fm = extractFrontmatter(content);
  if (isDraftTrue(fm)) violating.push(rel.replaceAll("\\", "/"));
}

if (violating.length > 0) {
  const lines = [
    "",
    "✖ Commit blocked: staged posts marked as draft.",
    "  These files have `draft: true` in frontmatter:",
    ...violating.map((f) => `  - ${f}`),
    "",
    "Fix: set `draft: false` (or remove the field) before committing,",
    "or unstage the file(s) and keep them local.",
    "",
  ];
  process.stderr.write(lines.join("\n"));
  process.exit(1);
}

