#!/usr/bin/env node
/**
 * Fix additional MDX compatibility issues
 */

import fs from "fs/promises";
import path from "path";

const CONTENT_DIR = "content";

async function fixFile(filePath) {
  let content = await fs.readFile(filePath, "utf-8");
  let modified = false;
  
  // Fix: Remove any remaining markdown="1" attributes
  if (content.includes('markdown="1"')) {
    content = content.replace(/\s*markdown="1"/g, "");
    modified = true;
  }
  
  // Fix: Convert ???+ note to :::note (collapsible admonitions with different syntax)
  if (content.match(/^\?\?\?\+\s+/gm)) {
    content = content.replace(/^\?\?\?\+\s+(\w+)(?:\s+"([^"]*)")?/gm, (match, type, title) => {
      if (title) {
        return `:::${type}[${title}]`;
      }
      return `:::${type}`;
    });
    modified = true;
  }
  
  // Fix: Convert ??? note to :::note
  if (content.match(/^\?\?\?\s+/gm)) {
    content = content.replace(/^\?\?\?\s+(\w+)(?:\s+"([^"]*)")?/gm, (match, type, title) => {
      if (title) {
        return `:::${type}[${title}]`;
      }
      return `:::${type}`;
    });
    modified = true;
  }
  
  // Fix: Close ??? admonitions
  if (content.match(/^\?\?\?\s*$/gm)) {
    content = content.replace(/^\?\?\?\s*$/gm, ":::");
    modified = true;
  }
  
  // Fix: Convert === "Tab Name" to <Tabs><Tab title="Tab Name">
  // For now, just convert to simple bold text to avoid parsing issues
  if (content.match(/^===\s+"[^"]+"/gm)) {
    content = content.replace(/^===\s+"([^"]+)"/gm, '**$1**');
    modified = true;
  }
  
  // Fix: Handle expressions in inline code that might break MDX
  // `obj.method({ ... })` - escape the braces
  content = content.replace(/`([^`]*)\{(\s*\.\.\.\s*[^}]*)\}([^`]*)`/g, (match, before, inside, after) => {
    // This is in inline code, wrap with backticks properly
    return `<code>{\`${before}{${inside}}${after}\`}</code>`;
  });
  
  // Fix: Handle nested braces in code
  if (content.includes('{{')) {
    content = content.replace(/\{\{/g, '{\\{');
    modified = true;
  }
  
  // Fix: Remove HTML comments that might cause issues
  // <!-- ... --> - keep them but ensure they're valid
  
  // Fix: Handle special characters in YAML frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const originalFrontmatter = frontmatterMatch[1];
    let fixedFrontmatter = originalFrontmatter;
    
    // Quote titles with special characters
    fixedFrontmatter = fixedFrontmatter.replace(
      /^title:\s*(.+?)(?=$|\n)/gm,
      (match, title) => {
        const trimmed = title.trim();
        // Check if needs quoting
        if ((trimmed.includes(':') || trimmed.includes('#') || trimmed.includes('{') || 
             trimmed.includes('}') || trimmed.includes('[') || trimmed.includes(']') ||
             trimmed.startsWith('"') || trimmed.startsWith("'")) &&
            !(trimmed.startsWith('"') && trimmed.endsWith('"')) &&
            !(trimmed.startsWith("'") && trimmed.endsWith("'"))) {
          // Escape any existing quotes
          const escaped = trimmed.replace(/"/g, '\\"');
          return `title: "${escaped}"`;
        }
        return match;
      }
    );
    
    if (fixedFrontmatter !== originalFrontmatter) {
      content = content.replace(frontmatterMatch[0], `---\n${fixedFrontmatter}\n---`);
      modified = true;
    }
  }
  
  if (modified) {
    await fs.writeFile(filePath, content, "utf-8");
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
  console.log("🔧 Fixing additional MDX issues...\n");
  const count = await processDirectory(CONTENT_DIR);
  console.log(`\n✅ Fixed ${count} additional files`);
}

main().catch(console.error);
