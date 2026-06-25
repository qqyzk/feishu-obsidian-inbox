import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const file of ["manifest.json", "main.js", "styles.css"]) {
  copyFileSync(file, join(dist, file));
}

console.log("Prepared Obsidian plugin release assets in dist/");
