// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const categoryEnum = z.enum(['逻辑', '哲学', '随笔', '项目']);

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    /** 可选；省略则仅出现在首页「全部」中，不记入任一具体分类侧栏 */
    category: categoryEnum.optional(),
    tags: z.array(z.string()).min(1).max(5).optional(),
    series: z.string().optional(),
    draft: z.boolean().default(false),
    updated: z.coerce.date().optional(),
    layout: z.string().optional(),
  }),
});

export const collections = { blog };