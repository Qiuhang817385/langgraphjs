#!/usr/bin/env node
/**
 * Script to add frontmatter to MDX files that don't have it
 */

import fs from "fs/promises";
import path from "path";

const CONTENT_DIR = "content";

// Extract title from first H1 heading
function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "Untitled";
}

// Check if file has frontmatter
function hasFrontmatter(content) {
  return content.trim().startsWith("---");
}

// Add frontmatter to file
async function addFrontmatter(filePath) {
  const content = await fs.readFile(filePath, "utf-8");
  
  if (hasFrontmatter(content)) {
    return false; // Already has frontmatter
  }
  
  const title = extractTitle(content);
  const frontmatter = `---
title: ${title}
---

`;
  
  await fs.writeFile(filePath, frontmatter + content, "utf-8");
  console.log(`✓ ${filePath}`);
  return true;
}

// Process directory recursively
async function processDirectory(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let count = 0;
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      count += await processDirectory(fullPath);
    } else if (entry.name.endsWith(".mdx")) {
      if (await addFrontmatter(fullPath)) {
        count++;
      }
    }
  }
  
  return count;
}

async function main() {
  console.log("Fixing frontmatter in MDX files...\n");
  const count = await processDirectory(CONTENT_DIR);
  console.log(`\nFixed ${count} files`);
}

main().catch(console.error);
