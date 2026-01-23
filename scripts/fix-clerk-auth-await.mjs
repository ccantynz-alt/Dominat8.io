import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const TARGET_DIR = path.join(ROOT, "app", "api");

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, files);
    else if (e.isFile() && e.name === "route.ts") files.push(full);
  }
  return files;
}

function patchFile(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  let text = original;

  // Fix import: ensure server-side Clerk auth
  text = text.replace(
    /import\s*\{\s*auth\s*\}\s*from\s*["']@clerk\/nextjs["'];?/g,
    `import { auth } from "@clerk/nextjs/server";`
  );

  // Fix destructuring without await
  text = text.replace(
    /const\s*\{\s*userId\s*\}\s*=\s*auth\(\)\s*;/g,
    "const { userId } = await auth();"
  );

  text = text.replace(
    /const\s*\{\s*sessionClaims\s*\}\s*=\s*auth\(\)\s*;/g,
    "const { sessionClaims } = await auth();"
  );

  text = text.replace(
    /const\s*\{\s*userId\s*,\s*sessionClaims\s*\}\s*=\s*auth\(\)\s*;/g,
    "const { userId, sessionClaims } = await auth();"
  );

  text = text.replace(
    /const\s*\{\s*sessionClaims\s*,\s*userId\s*\}\s*=\s*auth\(\)\s*;/g,
    "const { sessionClaims, userId } = await auth();"
  );

  // Fix assignment without await: const x = auth();
  text = text.replace(
    /const\s+(\w+)\s*=\s*auth\(\)\s*;/g,
    "const $1 = await auth();"
  );

  // Ensure handlers are async if we used await auth()
  if (text.includes("await auth()")) {
    text = text.replace(/export\s+function\s+GET\s*\(/g, "export async function GET(");
    text = text.replace(/export\s+function\s+POST\s*\(/g, "export async function POST(");
    text = text.replace(/export\s+function\s+PUT\s*\(/g, "export async function PUT(");
    text = text.replace(/export\s+function\s+PATCH\s*\(/g, "export async function PATCH(");
    text = text.replace(/export\s+function\s+DELETE\s*\(/g, "export async function DELETE(");
  }

  const changed = text !== original;
  if (changed) fs.writeFileSync(filePath, text, "utf8");
  return changed;
}

function main() {
  const routes = walk(TARGET_DIR);

  let changedCount = 0;
  for (const f of routes) {
    if (patchFile(f)) {
      changedCount++;
      console.log(`✅ fixed: ${path.relative(ROOT, f)}`);
    }
  }

  console.log(`\nDone. Updated ${changedCount} route.ts files.\n`);
}

main();
