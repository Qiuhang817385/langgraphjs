#!/usr/bin/env node
/**
 * Script to copy docs and docs_cn content to content directory
 * Converts .md files to .mdx and creates meta.json files
 */

import fs from "fs/promises";
import path from "path";

const SOURCE_DIRS = {
  en: "../docs/docs",
  cn: "../docs_cn/docs",
};

const TARGET_DIRS = {
  en: "content/docs",
  cn: "content/docs_cn",
};

// Directories to exclude
const EXCLUDE_DIRS = new Set(["node_modules", ".git", "__pycache__", ".ipynb_checkpoints"]);

// Binary file extensions to copy as-is
const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp",
  ".mp4", ".webm", ".mov", ".avi",
  ".pdf", ".zip", ".tar", ".gz",
  ".woff", ".woff2", ".ttf", ".otf", ".eot",
]);

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function copyFile(src, dest) {
  const content = await fs.readFile(src);
  await fs.writeFile(dest, content);
}

function convertFrontmatter(content) {
  // Convert MkDocs style frontmatter to MDX frontmatter
  // Already compatible, just return as-is
  return content;
}

function convertMarkdownContent(content) {
  // Convert MkDocs-specific syntax to standard Markdown/MDX
  
  // Convert !!! admonitions to standard blockquotes or MDX components
  content = content.replace(
    /!!!\s+(\w+)\s+"([^"]*)"\n/g,
    (match, type, title) => `:::${type}[${title}]\n`
  );
  content = content.replace(/!!!\s+(\w+)\n/g, (match, type) => `:::${type}\n`);
  content = content.replace(/^!!!$/gm, ":::");
  
  // Convert ==== to #######
  content = content.replace(/\n===\s+"([^"]*)"\s+===\n/g, "\n### $1\n");
  
  // Convert === header === to ### header
  content = content.replace(/\n={3,}\s*([^=]+)\s*={3,}\n/g, "\n### $1\n");
  
  // Convert {!...!} includes (simplified - just remove them for now)
  content = content.replace(/\{!([^!]+)!\}/g, "<!-- include: $1 -->");
  
  // Convert pymdownx.tabbed syntax
  content = content.replace(/===\s+"([^"]*)"/g, "=== $1");
  
  return content;
}

async function processMarkdownFile(src, dest) {
  let content = await fs.readFile(src, "utf-8");
  
  // Convert content
  content = convertMarkdownContent(content);
  content = convertFrontmatter(content);
  
  // Change extension to .mdx
  const destMdx = dest.replace(/\.md$/, ".mdx");
  await fs.writeFile(destMdx, content, "utf-8");
  console.log(`  MDX: ${path.relative(process.cwd(), destMdx)}`);
}

async function processDirectory(srcDir, destDir) {
  await ensureDir(destDir);
  
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.name.startsWith(".") || EXCLUDE_DIRS.has(entry.name)) {
      continue;
    }
    
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(srcPath, destPath);
    } else if (entry.name.endsWith(".md")) {
      await processMarkdownFile(srcPath, destPath);
    } else if (BINARY_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      await copyFile(srcPath, destPath);
      console.log(`  BIN: ${path.relative(process.cwd(), destPath)}`);
    }
  }
}

async function createMetaFiles(dir, isCn = false) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  // Check if there are subdirectories or markdown files
  const hasSubdirs = entries.some(e => e.isDirectory());
  const hasMarkdown = entries.some(e => e.name.endsWith(".mdx"));
  
  if (!hasSubdirs && !hasMarkdown) {
    return;
  }
  
  // Get page files (mdx without index)
  const pages = entries
    .filter(e => e.isFile() && e.name.endsWith(".mdx") && !e.name.startsWith("index"))
    .map(e => e.name.replace(".mdx", ""))
    .sort();
  
  // Get directories
  const dirs = entries
    .filter(e => e.isDirectory() && !e.name.startsWith("."))
    .map(e => e.name)
    .sort();
  
  // Create meta.json if needed
  if (pages.length > 0 || dirs.length > 0) {
    const metaPath = path.join(dir, "meta.json");
    let meta;
    
    try {
      meta = JSON.parse(await fs.readFile(metaPath, "utf-8"));
    } catch {
      meta = {};
    }
    
    // Set default title from directory name
    if (!meta.title) {
      const dirName = path.basename(dir);
      meta.title = dirName.charAt(0).toUpperCase() + dirName.slice(1).replace(/-/g, " ");
    }
    
    // Build pages array
    const allPages = [];
    if (entries.some(e => e.name === "index.mdx")) {
      allPages.push("index");
    }
    
    // Add directories and files
    for (const d of dirs) {
      allPages.push(d);
    }
    for (const p of pages) {
      if (!allPages.includes(p)) {
        allPages.push(p);
      }
    }
    
    if (allPages.length > 0) {
      meta.pages = allPages;
    }
    
    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2) + "\n", "utf-8");
    console.log(`  META: ${path.relative(process.cwd(), metaPath)}`);
  }
  
  // Recursively process subdirectories
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith(".")) {
      await createMetaFiles(path.join(dir, entry.name), isCn);
    }
  }
}

async function main() {
  console.log("\n=== Copying English docs ===");
  await processDirectory(SOURCE_DIRS.en, TARGET_DIRS.en);
  console.log("\n=== Creating meta files for English ===");
  await createMetaFiles(TARGET_DIRS.en, false);
  
  console.log("\n=== Copying Chinese docs ===");
  await processDirectory(SOURCE_DIRS.cn, TARGET_DIRS.cn);
  console.log("\n=== Creating meta files for Chinese ===");
  await createMetaFiles(TARGET_DIRS.cn, true);
  
  console.log("\n=== Done! ===");
}

main().catch(console.error);
