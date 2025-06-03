// resize-logos.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// 1) IMPORT teamAbbrMap safely. If your teamAbbrMap.js is ESM (export default),
//    require(...) will return an object like { default: { ... } }.
//    We grab .default if it’s there.
let raw = require("./src/data/teamAbbrMap.js");
const teamAbbrMap = raw.default || raw;

// 2) Verify that teamAbbrMap is indeed an object mapping strings → strings
if (
  typeof teamAbbrMap !== "object" ||
  teamAbbrMap === null ||
  Array.isArray(teamAbbrMap)
) {
  console.error(
    "⛔️  Expected teamAbbrMap to be an object of filename strings, but got:",
    teamAbbrMap
  );
  process.exit(1);
}

async function resizeAllLogos() {
  // 3) Collect every filename from teamAbbrMap (dedupe via Set)
  const allFilenames = new Set(Object.values(teamAbbrMap));

  // 4) Point to your logos folder (where the PNGs live)
  const logosDir = path.join(process.cwd(), "public", "logos");
  console.log("ℹ️  Looking for logos in:", logosDir);

  if (!fs.existsSync(logosDir)) {
    console.error(`⛔️  Logos directory not found: ${logosDir}`);
    process.exit(1);
  }

  for (const maybeFilename of allFilenames) {
    // 5) Log the raw “filename” value so we can see if it’s really a string
    console.log("→ Checking value from teamAbbrMap:", maybeFilename, typeof maybeFilename);

    if (typeof maybeFilename !== "string") {
      console.warn(
        `⚠️  Skipping non‐string value from teamAbbrMap:`,
        maybeFilename
      );
      continue;
    }

    const inputPath = path.join(logosDir, maybeFilename);
    const tempPath = path.join(logosDir, "temp_" + maybeFilename);

    if (!fs.existsSync(inputPath)) {
      console.warn(`⚠️  File not found (so skipping): ${inputPath}`);
      continue;
    }

    try {
      // 6) Resize to 43×43 px, write to a temp file
      await sharp(inputPath)
        .resize(43, 43, { fit: "contain" })
        .toFile(tempPath);

      // 7) Overwrite the original with our resized version
      fs.renameSync(tempPath, inputPath);
      console.log(`✅ Resized ${maybeFilename} → 43×43`);
    } catch (err) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      console.error(`❌ Error resizing ${maybeFilename}:`, err.message || err);
    }
  }
}

resizeAllLogos()
  .then(() => console.log("✅ All done!"))
  .catch((e) => {
    console.error("Unexpected error:", e);
    process.exit(1);
  });
