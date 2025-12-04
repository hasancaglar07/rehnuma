import { load } from "cheerio";
import TurndownService from "turndown";
import { prisma } from "../src/db/prisma";
import { toExcerpt } from "../src/utils/excerpt";

type ImportedArticle = {
  slug: string;
  title: string;
  content: string;
  coverUrl?: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  categorySlug: string;
};

const BASE_URL = "https://yenidunyadergisi.com";
const LIST_PATH = "/hanimefendi";
const AUTHOR_PATH = "/yazarlar/hanimefendi-dergisi";
const turndown = new TurndownService({
  headingStyle: "atx"
});

async function fetchHtml(url: string) {
  const res = await fetch(url, {
    headers: {
      "user-agent": "rehnuma-importer/1.0 (+https://rehnuma)"
    }
  });
  if (!res.ok) throw new Error(`GET ${url} failed with ${res.status}`);
  return res.text();
}

function absoluteUrl(href: string) {
  try {
    return new URL(href, BASE_URL).toString();
  } catch {
    return null;
  }
}

function detectPageCount(html: string) {
  const $ = load(html);
  const pages = $(".pagination a")
    .map((_, el) => parseInt($(el).text().trim(), 10))
    .get()
    .filter((n) => !Number.isNaN(n));
  const max = pages.length ? Math.max(...pages) : 1;
  return Math.max(1, max);
}

function extractBlogLinks(html: string) {
  const $ = load(html);
  const links = new Set<string>();
  $(".post-card-1 a.img-link, .post-card-1 a.post-title, .post-card-1 h5 a, .post-card-1 h4 a").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    if (!href.includes("/blog/")) return;
    const abs = absoluteUrl(href);
    if (abs) links.add(abs.split("#")[0]);
  });
  return [...links];
}

function extractListLinks(html: string) {
  const $ = load(html);
  const links = new Set<string>();
  $(".post-card-1 a, article.post-card-1 a, .post-card-1 .img-link").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const abs = absoluteUrl(href);
    if (!abs) return;
    if (!abs.includes("/blog/") && !abs.includes("/hanimefendi/")) return;
    links.add(abs.split("#")[0]);
  });
  return [...links];
}

function parseSlug(url: string) {
  const { pathname } = new URL(url);
  const parts = pathname.split("/").filter(Boolean);
  const slug = parts.pop();
  if (!slug) throw new Error(`Slug parse failed for ${url}`);
  return slug;
}

function inferCategory(text: string) {
  const haystack = text.toLocaleLowerCase("tr-TR");
  const has = (keywords: string[]) => keywords.some((k) => haystack.includes(k));

  if (has(["şiir", "mısra", "dize", "poem", "edebiyat"])) return "siir-edebiyat";
  if (has(["evlilik", "nikah", "eş", "aile", "yuva", "sadakat", "gelin", "damat"])) return "aile-evlilik";
  if (has(["çocuk", "anne", "annelik", "evlat", "bebek", "genç", "ergen"])) return "annelik-cocuk";
  if (has(["ev ", "evde", "hayat", "huzur", "düzen", "mutfak", "yolculuğu", "hayatı"])) return "ev-ve-hayat";
  if (has(["dua", "iman", "kur", "kuran", "allah", "rab", "merhamet", "rahmet", "tasavvuf", "cihad", "seher", "kalp"])) {
    return "maneviyat-islami-ilimler";
  }
  return "maneviyat-islami-ilimler";
}

function cleanMarkdown(md: string) {
  return md.replace(/\u00a0/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

async function fetchArticle(url: string): Promise<ImportedArticle | null> {
  const html = await fetchHtml(url);
  const $ = load(html);

  const isHanimefendi = $(`a[href*='${AUTHOR_PATH}']`).length > 0 || $("a.author-name:contains('Hanımefendi')").length > 0;
  if (!isHanimefendi) {
    console.warn(`[skip] not Hanımefendi: ${url}`);
    return null;
  }

  const title = $("h1.entry-title, h1.post-title").first().text().trim();
  const main = $(".entry-main-content").first().clone();
  main.find("script, style, form").remove();
  const contentHtml = main.html()?.trim();

  if (!title || !contentHtml) {
    console.warn(`[skip] missing title/content for ${url}`);
    return null;
  }

  const markdown = cleanMarkdown(turndown.turndown(contentHtml));
  const slug = parseSlug(url);
  const coverUrl = $("figure img").first().attr("src") || undefined;
  const excerpt = toExcerpt(markdown, 200);
  const metaDescription = toExcerpt(markdown, 180);
  const categorySlug = inferCategory(`${title} ${markdown}`);

  return {
    slug,
    title,
    content: markdown,
    coverUrl,
    excerpt,
    metaTitle: title,
    metaDescription,
    categorySlug
  };
}

async function main() {
  const firstHtml = await fetchHtml(`${BASE_URL}${LIST_PATH}`);
  const listPageCount = detectPageCount(firstHtml);
  const listPages = Array.from({ length: listPageCount }, (_, i) => i + 1);

  const candidateListPages = new Set<string>();
  listPages.forEach((p) => candidateListPages.add(`${BASE_URL}${LIST_PATH}${p === 1 ? "" : `?page=${p}`}`));

  const hanimefendiDetailPages = new Set<string>();
  const blogLinks = new Set<string>();

  for (const pageUrl of candidateListPages) {
    const html = await fetchHtml(pageUrl);
    extractBlogLinks(html).forEach((u) => blogLinks.add(u));
    extractListLinks(html)
      .filter((u) => u.includes("/hanimefendi/") && !u.endsWith(LIST_PATH))
      .forEach((u) => hanimefendiDetailPages.add(u));
  }

  for (const detailUrl of hanimefendiDetailPages) {
    const html = await fetchHtml(detailUrl);
    extractBlogLinks(html).forEach((u) => blogLinks.add(u));
  }

  console.log(`Discovered ${blogLinks.size} candidate blog posts`);

  let imported = 0;
  let skipped = 0;
  for (const url of blogLinks) {
    try {
      const article = await fetchArticle(url);
      if (!article) {
        skipped += 1;
        continue;
      }

      const data = {
        title: article.title,
        slug: article.slug,
        content: article.content,
        coverUrl: article.coverUrl,
        audioUrl: null,
        status: "published" as const,
        isPaywalled: false,
        excerpt: article.excerpt,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        category: { connect: { slug: article.categorySlug } }
      };

      await prisma.article.upsert({
        where: { slug: article.slug },
        update: data,
        create: { ...data, publishedAt: new Date() }
      });

      imported += 1;
      console.log(`[ok] ${article.slug} -> ${article.categorySlug}`);
    } catch (error) {
      skipped += 1;
      console.warn(`[skip] ${url}`, error);
    }
  }

  console.log(`Done. Imported: ${imported}, skipped: ${skipped}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
