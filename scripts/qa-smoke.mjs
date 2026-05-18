import { spawn, spawnSync } from "node:child_process";
import path from "node:path";

const baseUrl = "http://127.0.0.1:3100";

const routes = [
  "/",
  "/login",
  "/dashboard",
  "/leads",
  "/leads/maya-henderson",
  "/borrowers",
  "/borrowers/maya-henderson",
  "/pipeline",
  "/partners",
  "/partners/elena-ruiz",
  "/tasks",
  "/notes",
  "/activity",
  "/files",
  "/campaigns",
  "/compliance",
  "/export",
  "/admin",
  "/audit-logs",
  "/programs",
  "/privacy",
  "/terms"
];

const requiredMortgageTerms = [
  "Conventional",
  "FHA",
  "VA",
  "DSCR",
  "Bank Statement",
  "P&L",
  "No Doc"
];

spawnSync("powershell", [
  "-NoProfile",
  "-ExecutionPolicy",
  "Bypass",
  "-Command",
  "if (Test-Path .next) { Remove-Item .next -Recurse -Force }"
], {
  cwd: process.cwd(),
  stdio: "ignore"
});

const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const server = spawn(process.execPath, [nextBin, "dev", "-p", "3100"], {
  cwd: process.cwd(),
  shell: false,
  stdio: ["ignore", "pipe", "pipe"]
});

let output = "";
server.stdout.on("data", (chunk) => {
  output += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  output += chunk.toString();
});

try {
  await waitForServer();

  const failures = [];
  for (const route of routes) {
    const response = await fetch(`${baseUrl}${route}`);
    const html = await response.text();

    if (response.status !== 200) {
      failures.push(`${route} returned ${response.status}`);
      continue;
    }

    if (html.includes("Application error") || html.includes("Unhandled Runtime Error")) {
      failures.push(`${route} includes a runtime error marker`);
    }
  }

  const programs = await (await fetch(`${baseUrl}/programs`)).text();
  for (const term of requiredMortgageTerms) {
    if (!programs.includes(term) && !programs.includes(term.replace("&", "&amp;"))) {
      failures.push(`Missing mortgage test data/program term: ${term}`);
    }
  }

  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(`QA smoke passed: ${routes.length} routes verified.`);
  }
} finally {
  server.kill();
}

async function waitForServer() {
  const started = Date.now();
  while (Date.now() - started < 60_000) {
    if (output.includes("Ready")) {
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/dashboard`);
      if (response.ok) {
        return;
      }
    } catch {
      // Server not ready yet.
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Dev server did not start. Output:\n${output}`);
}
