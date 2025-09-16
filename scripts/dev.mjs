#!/usr/bin/env node
import { spawn } from "child_process";

const child = spawn("pnpm", ["dev"], { stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code ?? 0));
