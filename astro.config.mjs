// @ts-check
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://yujinfan.me',
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      /* 与 CSS prefers-color-scheme 一致：浅色纸面 / 深色夜间 */
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColorScheme: 'light',
    },
    remarkPlugins: [remarkMath],
    /* trust + throwOnError 避免个别命令导致整段公式在 HTML 中丢失 */
    rehypePlugins: [[rehypeKatex, { throwOnError: false, trust: true }]],
  },
});
