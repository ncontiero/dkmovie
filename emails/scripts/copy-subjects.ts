import path from "node:path";
import fs from "fs-extra";
import { glob } from "tinyglobby";

const SOURCE_DIR = path.join(process.cwd(), "auth-emails");
const DEST_DIR = path.join(
  process.cwd(),
  "../dkmovie/templates/emails/account",
);

async function copySubjects() {
  console.log("📦 Starting copy of subject files...");

  try {
    const files = await glob("**/*_subject.txt", { cwd: SOURCE_DIR });

    if (files.length === 0) {
      console.warn('⚠️ No "_subject.txt" file found in:', SOURCE_DIR);
      return;
    }

    for (const file of files) {
      const sourcePath = path.join(SOURCE_DIR, file);
      const destDir = path.join(DEST_DIR, path.dirname(file));
      const destPath = path.join(destDir, path.basename(file));

      await fs.ensureDir(destDir);
      await fs.copy(sourcePath, destPath, { overwrite: true });
      console.log(`✅ Copied: ${file}`);
    }

    console.log(`🎉 Success! ${files.length} subject files copied.`);
  } catch (error) {
    console.error("❌ Error copying files:", error);
    process.exit(1);
  }
}

copySubjects();
