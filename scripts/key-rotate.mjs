#!/usr/bin/env node
import { spawn } from "child_process";

const child = spawn("pnpm", ["--filter", "@ai/api", "key:rotate"], { stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code ?? 0));
