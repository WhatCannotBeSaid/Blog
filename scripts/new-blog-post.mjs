import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogDir = path.join(__dirname, "..", "src", "content", "blog");

const arg = process.argv.slice(2).join(" ").trim();
if (!arg) {
  console.error("用法: npm run new-post -- <标题或相对路径.md>");
  console.error("示例: npm run new-post -- 读书笔记");
  console.error("示例: npm run new-post -- series/part-1.md");
  process.exit(1);
}

let rel = arg.replace(/\\/g, "/").replace(/^\/+/, "");
if (!rel.endsWith(".md")) {
  rel += ".md";
}

const illegal = /[<>:"|?*\x00-\x1f]/;
if (illegal.test(rel) || rel.includes("..")) {
  console.error("无效路径:", rel);
  process.exit(1);
}

const target = path.join(blogDir, rel);
if (fs.existsSync(target)) {
  console.error("已存在:", target);
  process.exit(1);
}

fs.mkdirSync(path.dirname(target), { recursive: true });

const title = path.basename(rel, ".md");
const today = new Date();
const y = today.getFullYear();
const m = String(today.getMonth() + 1).padStart(2, "0");
const d = String(today.getDate()).padStart(2, "0");

const fileBody = `---
title: ${title}
date: ${y}-${m}-${d}
description: 
category: 随笔
tags:
  - 未分类
draft: false
---

`;

fs.writeFileSync(target, fileBody, "utf8");
console.log("已创建", path.relative(path.join(__dirname, ".."), target));
