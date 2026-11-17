const path = require("node:path");
const { spawn } = require("node:child_process");

const rootDir = path.resolve(__dirname, "..");
const appDir = path.join(rootDir, "apps/web");
const nextCli = path.join(appDir, "node_modules/.bin/next");

const next = spawn(process.execPath, [nextCli, "dev", "-p", "3000"], {
  cwd: appDir,
  env: process.env,
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => next.kill(signal));
}

next.on("error", (error) => {
  console.error("Could not start the Anagu Next.js web app.", error);
  process.exitCode = 1;
});

next.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exitCode = code ?? 1;
});
