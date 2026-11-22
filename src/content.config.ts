import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const stringList =
  (separator: string | RegExp) =>
    z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform((value) => {
        if (value == null) return [];
        if (Array.isArray(value)) {
          return value.map((item) => String(item).trim()).filter(Boolean);
        }
        return value
          .split(separator)
          .map((item) => item.trim())
          .filter(Boolean);
      });

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,markdown}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    categories: stringList(/\s+/),
    tags: stringList(/,/),
    draft: z.boolean().default(false),
    description: z.string().optional(),
    updated: z.coerce.date().optional(),
    slug: z.string().optional()
  })
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    order: z.number().default(0),
    description: z.string(),
    repository_url: z.url(),
    demo_url: z.url().optional(),
    logo: z.string().optional(),
    story_url: z.string().optional(),
    collaboration: z.string().optional(),
    role: z.string().optional()
  })
});

export const collections = { blog, projects };
