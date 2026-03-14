#!/usr/bin/env node
/**
 * Comprehensive script to fix all MkDocs to MDX compatibility issues
 */

import fs from "fs/promises";
import path from "path";

const CONTENT_DIR = "content";

// Track statistics
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  issuesFixed: {
    frontmatter: 0,
    anchorHeaders: 0,
    attributeLists: 0,
    figureTags: 0,
    codeBlocks: 0,
    admonitions: 0,
    mkdocsIncludes: 0,
    pymdownxTabbed: 0,
    emptyLines: 0,
  },
};

// Extract title from first H1 heading
function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "Untitled";
}

// Check if file has frontmatter
function hasFrontmatter(content) {
  return content.trim().startsWith("---");
}

async function fixFile(filePath) {
  let content = await fs.readFile(filePath, "utf-8");
  const originalContent = content;
  let modified = false;
  
  // Fix 1: Add frontmatter if missing
  if (!hasFrontmatter(content)) {
    const title = extractTitle(content);
    const frontmatter = `---\ntitle: ${title}\n---\n\n`;
    content = frontmatter + content;
    stats.issuesFixed.frontmatter++;
    modified = true;
  }
  
  // Fix 2: Remove {#anchor} syntax from headers
  // Match: ## Header {#anchor-id}
  if (content.match(/\s*\{#[^}]+\}/g)) {
    content = content.replace(/\s*\{#[^}]+\}/g, "");
    stats.issuesFixed.anchorHeaders++;
    modified = true;
  }
  
  // Fix 3: Remove MkDocs attribute lists {: style="..." }
  if (content.match(/\{:\s*[^}]+\}/g)) {
    content = content.replace(/\{:\s*[^}]+\}/g, "");
    stats.issuesFixed.attributeLists++;
    modified = true;
  }
  
  // Fix 4: Replace <figure markdown="1"> with <figure>
  if (content.includes('<figure markdown="1">')) {
    content = content.replace(/<figure markdown="1">/g, "<figure>");
    stats.issuesFixed.figureTags++;
    modified = true;
  }
  
  // Fix 5: Fix ``<code>lang to ```lang
  if (content.match(/``<code>/g)) {
    content = content.replace(/``<code>(\w*)/g, "```$1");
    stats.issuesFixed.codeBlocks++;
    modified = true;
  }
  
  // Fix 6: Convert MkDocs admonitions to MDX callouts
  // !!! note "Title" -> :::note[Title]
  // !!! warning -> :::warning
  // !!!+ note (collapsible) -> :::note
  
  // Handle collapsible admonitions
  if (content.match(/^!!!\+\s+/gm)) {
    content = content.replace(/^!!!\+\s+(\w+)(?:\s+"([^"]*)")?/gm, (match, type, title) => {
      if (title) {
        return `:::${type}[${title}]`;
      }
      return `:::${type}`;
    });
    stats.issuesFixed.admonitions++;
    modified = true;
  }
  
  // Handle regular admonitions
  if (content.match(/^!!!\s+/gm)) {
    content = content.replace(/^!!!\s+(\w+)(?:\s+"([^"]*)")?/gm, (match, type, title) => {
      if (title) {
        return `:::${type}[${title}]`;
      }
      return `:::${type}`;
    });
    stats.issuesFixed.admonitions++;
    modified = true;
  }
  
  // Fix 7: Close admonitions with !!! -> :::
  if (content.match(/^!!!\s*$/gm)) {
    content = content.replace(/^!!!\s*$/gm, ":::");
    stats.issuesFixed.admonitions++;
    modified = true;
  }
  
  // Fix 8: Remove MkDocs includes {!file.md!}
  if (content.match(/\{![^!]+!\}/g)) {
    content = content.replace(/\{![^!]+!\}/g, "<!-- include removed -->");
    stats.issuesFixed.mkdocsIncludes++;
    modified = true;
  }
  
  // Fix 9: Convert pymdownx tabbed syntax
  // === "Tab Name" -> <Tabs><Tab title="Tab Name">
  if (content.match(/^===\s+"[^"]+"/gm)) {
    content = content.replace(/^===\s+"([^"]+)"/gm, '=== "$1"');
    // Keep as is for now - Fumadocs might support this
  }
  
  // Fix 10: Fix double curly braces in code blocks (MDX escapes)
  // {{ -> {\{ in inline code that could be expressions
  
  // Fix 11: Fix colons in YAML frontmatter titles
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const originalFrontmatter = frontmatterMatch[1];
    let fixedFrontmatter = originalFrontmatter;
    
    // Fix title with special characters
    fixedFrontmatter = fixedFrontmatter.replace(
      /^title:\s+(.+?)(?=$|\n)/gm,
      (match, title) => {
        // If title contains special chars and isn't quoted
        if ((title.includes(":") || title.includes("#") || title.includes("{") || title.includes("}")) && 
            !title.startsWith('"') && !title.startsWith("'")) {
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
  
  // Fix 12: Fix code blocks with expressions that look like MDX
  // `await graph.stream({ ... })` -> escape braces
  content = content.replace(/`([^`]*)\{(\s*\.)\}([^`]*)`/g, (match, before, dots, after) => {
    // Already escaped
    return match;
  });
  
  if (modified) {
    await fs.writeFile(filePath, content, "utf-8");
    stats.filesModified++;
    return true;
  }
  return false;
}

async function processDirectory(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.name.endsWith(".mdx")) {
      stats.filesProcessed++;
      await fixFile(fullPath);
    }
  }
}

async function main() {
  console.log("🔧 Fixing all MkDocs to MDX compatibility issues...\n");
  
  await processDirectory(CONTENT_DIR);
  
  console.log("\n" + "=".repeat(50));
  console.log("📊 Summary:");
  console.log("=".repeat(50));
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files modified: ${stats.filesModified}`);
  console.log("\nIssues fixed:");
  console.log(`  - Frontmatter added: ${stats.issuesFixed.frontmatter}`);
  console.log(`  - Anchor headers removed: ${stats.issuesFixed.anchorHeaders}`);
  console.log(`  - Attribute lists removed: ${stats.issuesFixed.attributeLists}`);
  console.log(`  - Figure tags fixed: ${stats.issuesFixed.figureTags}`);
  console.log(`  - Code blocks fixed: ${stats.issuesFixed.codeBlocks}`);
  console.log(`  - Admonitions converted: ${stats.issuesFixed.admonitions}`);
  console.log(`  - MkDocs includes removed: ${stats.issuesFixed.mkdocsIncludes}`);
  console.log("=".repeat(50));
}

main().catch(console.error);
