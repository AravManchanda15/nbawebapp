// check-logos.js
import fs from "fs";
import path from "path";
import sharp from "sharp";
import teamAbbrMap from "./src/data/teamAbbrMap.js"; // adjust the path if needed

async function checkLogoSizes() {
  const logosDir = path.join(process.cwd(), "public", "logos");
  const allFilenames = new Set(Object.values(teamAbbrMap));

  for (const filename of allFilenames) {
    const filePath = path.join(logosDir, filename);

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${filename}`);
      continue;
    }

    try {
      // Get pixel dimensions
      const metadata = await sharp(filePath).metadata();
      const { width, height } = metadata;

      // Get file size in bytes
      const { size } = fs.statSync(filePath);

      // Check if it matches 43×43
      const matchesTarget = width === 43 && height === 43;

      console.log(
        `${filename}: ${width}×${height}px, ${size.toLocaleString()} bytes` +
        (matchesTarget ? " ✔️" : " ❌ (expected 43×43)") 
      );
    } catch (err) {
      console.error(`❌ Error reading ${filename}:`, err.message);
    }
  }
}

checkLogoSizes().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
