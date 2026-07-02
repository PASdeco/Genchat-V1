import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const extensionEnvPath = join(root, "apps", "extension", ".env");
const extensionDistPath = join(root, "apps", "extension", "dist");
const releaseRoot = join(root, "release");
const releaseFolder = join(releaseRoot, "tester-extension");
const releaseZip = join(releaseRoot, "tester-extension.zip");

function readEnvValue(filePath, key) {
  const raw = readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [candidateKey, ...rest] = trimmed.split("=");
    if (candidateKey === key) {
      return rest.join("=").trim();
    }
  }
  return "";
}

async function verifyApi(baseUrl) {
  const response = await fetch(new URL("/api/v1/health", baseUrl));
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}.`);
  }
  const payload = await response.json();
  if (!payload || payload.ok !== true) {
    throw new Error("Health check returned an unexpected payload.");
  }
  return payload;
}

function run(command, args, cwd = root) {
  execFileSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
}

function buildInstallGuide(apiBase) {
  return [
    "GenChat tester build",
    "",
    "1. Open chrome://extensions",
    "2. Turn on Developer mode",
    "3. Click Load unpacked",
    "4. Select this tester-extension folder",
    "5. Open a GenLayer docs page or relevant X/Twitter post",
    "6. Click the GenChat bubble when it appears",
    "",
    `This build is wired to: ${apiBase}`,
    "",
    "If the extension was already loaded before, remove the old unpacked version first and load this one fresh.",
  ].join("\r\n");
}

function ensureCleanReleaseDir() {
  rmSync(releaseRoot, { recursive: true, force: true });
  mkdirSync(releaseRoot, { recursive: true });
}

async function main() {
  const apiBase =
    process.env.VITE_GENCHAT_API_BASE ||
    process.env.GENCHAT_API_BASE_URL ||
    (existsSync(extensionEnvPath) ? readEnvValue(extensionEnvPath, "VITE_GENCHAT_API_BASE") : "");

  if (!apiBase) {
    throw new Error("VITE_GENCHAT_API_BASE is missing. Set it in apps/extension/.env or pass it as an environment variable.");
  }
  if (!/^https?:\/\//i.test(apiBase)) {
    throw new Error("VITE_GENCHAT_API_BASE must be a full URL.");
  }
  if (/127\.0\.0\.1|localhost/i.test(apiBase)) {
    throw new Error("Tester release cannot point at localhost. Deploy the API first and update apps/extension/.env.");
  }

  const health = await verifyApi(apiBase);
  console.log("Verified live API:", health);

  run("npm", ["run", "build"]);

  ensureCleanReleaseDir();
  cpSync(extensionDistPath, releaseFolder, { recursive: true });
  writeFileSync(join(releaseRoot, "INSTALL.txt"), buildInstallGuide(apiBase), "utf8");
  copyFileSync(join(releaseRoot, "INSTALL.txt"), join(releaseFolder, "INSTALL.txt"));

  if (process.platform === "win32") {
    run("powershell", [
      "-NoProfile",
      "-Command",
      `Compress-Archive -Path '${releaseFolder}\\*' -DestinationPath '${releaseZip}' -Force`,
    ]);
  }

  console.log(`Tester release created at: ${releaseFolder}`);
  if (process.platform === "win32") {
    console.log(`Tester zip created at: ${releaseZip}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
