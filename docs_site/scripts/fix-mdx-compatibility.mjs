#!/usr/bin/env node
/**
 * Fix common MkDocs to MDX compatibility issues
 */

import fs from "fs/promises";
import path from "path";

const CONTENT_DIR = "content/docs";

async function fixFile(filePath) {
  let content = await fs.readFile(filePath, "utf-8");
  let modified = false;
  
  // Fix 1: Remove {#anchor} syntax (MkDocs header anchors)
  if (content.match(/\s*\{#.+?\}/g)) {
    content = content.replace(/\s*\{#.+?\}/g, "");
    modified = true;
  }
  
  // Fix 2: Escape curly braces in inline code that might be interpreted as expressions
  // Match single backticks with curly braces
  if (content.match(/`[^`]*\{[^`]*`/g)) {
    content = content.replace(/`([^`]*)\{([^}]*)\}([^`]*)`/g, (match, before, inside, after) => {
      // Only escape if it looks like it could be an expression
      if (inside.includes("...") || inside.includes(":")) {
        return `<code>${before}{${inside}}${after}</code>`;
      }
      return match;
    });
    modified = true;
  }
  
  // Fix 3: Fix YAML frontmatter with colons in title (add quotes)
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const originalFrontmatter = frontmatterMatch[1];
    let fixedFrontmatter = originalFrontmatter;
    
    // Fix title: without quotes but with colons
    fixedFrontmatter = fixedFrontmatter.replace(
      /^title:\s+(.+?)(?=$|\n)/gm,
      (match, title) => {
        if (title.includes(":") && !title.startsWith('"') && !title.startsWith("'")) {
          return `title: "${title}"`;
        }
        return match;
      }
    );
    
    if (fixedFrontmatter !== originalFrontmatter) {
      content = content.replace(frontmatterMatch[0], `---\n${fixedFrontmatter}\n---`);
      modified = true;
    }
  }
  
  // Fix 4: Remove MkDocs attribute lists like {: style="..."}
  if (content.match(/\{:\s*[^}]+\}/g)) {
    content = content.replace(/\{:\s*[^}]+\}/g, "");
    modified = true;
  }
  
  // Fix 5: Replace <figure markdown="1"> with <figure>
  if (content.includes('<figure markdown="1">')) {
    content = content.replace(/<figure markdown="1">/g, "<figure>");
    modified = true;
  }
  
  if (modified) {
    await fs.writeFile(filePath, content, "utf-8");
    console.log(`✓ ${filePath}`);
    return true;
  }
  return false;
}

async function processDirectory(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let count = 0;
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      count += await processDirectory(fullPath);
    } else if (entry.name.endsWith(".mdx")) {
      if (await fixFile(fullPath)) {
        count++;
      }
    }
  }
  
  return count;
}

async function main() {
  console.log("Fixing MDX compatibility issues...\n");
  const count = await processDirectory(CONTENT_DIR);
  console.log(`\nFixed ${count} files`);
}

main().catch(console.error);
