import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const ROOT = process.cwd();
function decodeEntities(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
    if (code.startsWith("#x")) return String.fromCodePoint(Number.parseInt(code.slice(2), 16));
    if (code.startsWith("#")) return String.fromCodePoint(Number.parseInt(code.slice(1), 10));

    return {
      amp: "&",
      apos: "'",
      gt: ">",
      lt: "<",
      nbsp: " ",
      quot: "\""
    }[code.toLowerCase()] ?? entity;
  });
}

function textFromHtml(html) {
  return decodeEntities(html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function slugifyHeading(html) {
  const text = textFromHtml(html)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return text || "section";
}

function addHeadingIds(html) {
  const usedIds = new Map();

  return html.replace(/<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/g, (_match, level, attributes, body) => {
    const existingId = attributes.match(/\bid=["']([^"']+)["']/)?.[1];
    let id = existingId;

    if (!id) {
      const base = slugifyHeading(body);
      const occurrence = usedIds.get(base) ?? 0;
      usedIds.set(base, occurrence + 1);
      id = occurrence === 0 ? base : `${base}-${occurrence}`;
    }

    const remainingAttributes = attributes.replace(/\s+id=["'][^"']+["']/, "");
    return `<h${level}${remainingAttributes} id="${id}">${body}</h${level}>`;
  });
}

function markdownToHtml(source) {
  return addHeadingIds(marked.parse(source, { gfm: true, breaks: false }));
}

function toDate(value, fallback) {
  const date = value instanceof Date ? value : new Date(value ?? fallback);
  return Number.isNaN(date.getTime()) ? new Date(fallback) : date;
}

function dateParts(date, filename) {
  const filenameDate = filename.match(/^(\d{4})-(\d{2})-(\d{2})-/);
  if (filenameDate) return filenameDate.slice(1);

  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Africa/Johannesburg",
    year: "numeric"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return [values.year, values.month, values.day];
}

function normalizeCategories(value) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return value.trim().split(/\s+/).filter(Boolean);
  return [];
}

function normalizeTags(value) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return value.split(",").map((tag) => tag.trim()).filter(Boolean);
  return [];
}

function readMarkdownFiles(directory) {
  return readdirSync(directory)
    .filter((name) => /\.(?:md|markdown)$/i.test(name))
    .sort()
    .map((name) => ({ name, source: readFileSync(join(directory, name), "utf8") }));
}

function parsePost({ name, source, draft = false }) {
  const parsed = matter(source);
  const fileSlug = basename(name).replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.(?:md|markdown)$/i, "");
  const title = String(parsed.data.title ?? fileSlug.replace(/-/g, " "));
  const date = toDate(parsed.data.date, name.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? "1970-01-01");
  const categories = normalizeCategories(parsed.data.categories);
  const [year, month, day] = dateParts(date, name);
  const routeSegments = draft
    ? ["drafts", fileSlug]
    : [...categories, year, month, day, fileSlug];
  const previewUrl = `/${routeSegments.join("/")}`;
  const url = `${previewUrl}.html`;
  const body = parsed.content.replace(/<!--more-->/g, "");
  const excerptSource = parsed.content.split("<!--more-->")[0];
  const excerptHtml = markdownToHtml(excerptSource);
  const html = markdownToHtml(body);
  const excerptText = textFromHtml(excerptHtml);
  const wordCount = textFromHtml(html).split(/\s+/).filter(Boolean).length;
  const toc = [...html.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)]
    .map(([, id, heading]) => ({ id, title: textFromHtml(heading) }))
    .filter(({ title }) => title);

  return {
    categories,
    date,
    draft,
    excerptHtml,
    excerptText,
    html,
    previewUrl,
    tags: normalizeTags(parsed.data.tags),
    title,
    toc: toc.length > 1 ? toc : [],
    url,
    routeSegments,
    readingMinutes: Math.max(1, Math.floor(wordCount / 230))
  };
}

export function getPosts({ includeDrafts = false, contentRoot = ROOT } = {}) {
  const posts = readMarkdownFiles(join(contentRoot, "_posts")).map((file) => parsePost(file));
  if (includeDrafts) {
    posts.push(...readMarkdownFiles(join(contentRoot, "_drafts")).map((file) => parsePost({ ...file, draft: true })));
  }
  return posts.sort((left, right) => right.date.getTime() - left.date.getTime());
}

export function getPostByPath(pathSegments) {
  const requestedPath = pathSegments.join("/");
  return getPosts({ includeDrafts: process.env.NODE_ENV !== "production" })
    .find((post) => post.routeSegments.join("/") === requestedPath);
}

export function getPostHref(post, development = process.env.NODE_ENV !== "production") {
  return development ? post.previewUrl : post.url;
}

export function siteHref(url, development = process.env.NODE_ENV !== "production") {
  if (development && url.startsWith("/") && url.endsWith(".html")) return url.slice(0, -5);
  return url;
}

export function getProjects({ contentRoot = ROOT } = {}) {
  return readMarkdownFiles(join(contentRoot, "_projects"))
    .map(({ name, source }) => {
      const { data } = matter(source);
      return {
        title: String(data.title ?? basename(name, ".md")),
        order: Number(data.order ?? 0),
        description: String(data.description ?? ""),
        repositoryUrl: String(data.repository_url ?? ""),
        demoUrl: data.demo_url ? String(data.demo_url) : null,
        storyUrl: data.story_url ? String(data.story_url) : null,
        collaboration: data.collaboration ? String(data.collaboration) : null,
        role: data.role ? String(data.role) : null
      };
    })
    .sort((left, right) => left.order - right.order);
}

export function truncate(text, limit = 150) {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trimEnd()}…`;
}

export function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
