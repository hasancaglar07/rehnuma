#!/usr/bin/env node

const { spawnSync } = require("child_process");

const env = { ...process.env, NEXT_TURBOPACK: "0" };

const result = spawnSync("npx", ["next", "dev", "--webpack"], {
  stdio: "inherit",
  env,
  shell: process.platform === "win32"
});

process.exit(result.status ?? 0);
