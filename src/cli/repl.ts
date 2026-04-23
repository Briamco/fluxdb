#!/usr/bin/env node
import * as readline from 'readline';
import * as path from 'path';
import pm2 from 'pm2';
import { Tokenizer } from '../parser/tokenizer';
import { Parser } from '../parser/parser';

const tokenizer = new Tokenizer();
const parser = new Parser();
const API_URL = 'http://localhost:3000';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
};

const APP_NAME = 'fluxdb-server';
const SERVER_PATH = path.join(__dirname, '../server/app.js');

async function main() {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    const command = args[0].toLowerCase();
    switch (command) {
      case 'start':
        await startServer();
        process.exit(0);
      case 'stop':
        await stopServer();
        process.exit(0);
      case 'status':
        await serverStatus();
        process.exit(0);
      case 'logs':
        showLogs();
        return;
      case 'startup':
        console.log(`${COLORS.yellow}To enable FluxDB to start on system boot, run:${COLORS.reset}`);
        console.log(`  ${COLORS.bright}pm2 startup${COLORS.reset}`);
        console.log(`  ${COLORS.bright}pm2 save${COLORS.reset}`);
        process.exit(0);
    }
  }

  // Check if server is running before starting REPL
  try {
    const res = await fetch(`${API_URL}/keys`);
    if (!res.ok) throw new Error();
  } catch {
    console.log(`${COLORS.red}Error: FluxDB server is not running.${COLORS.reset}`);
    console.log(`${COLORS.yellow}Run ${COLORS.bright}flux start${COLORS.reset}${COLORS.yellow} to launch it in the background.${COLORS.reset}`);
    process.exit(1);
  }

  startREPL();
}

function startServer(): Promise<void> {
  return new Promise((resolve) => {
    pm2.connect((err) => {
      if (err) {
        console.error(err);
        process.exit(2);
      }

      pm2.start(
        {
          script: SERVER_PATH,
          name: APP_NAME,
        },
        (err) => {
          if (err) {
            console.error(`${COLORS.red}Error starting server: ${err.message}${COLORS.reset}`);
          } else {
            console.log(`${COLORS.green}FluxDB server started successfully in background.${COLORS.reset}`);
          }
          pm2.disconnect();
          resolve();
        }
      );
    });
  });
}

function stopServer(): Promise<void> {
  return new Promise((resolve) => {
    pm2.connect((err) => {
      if (err) {
        console.error(err);
        process.exit(2);
      }

      pm2.stop(APP_NAME, (err) => {
        if (err) {
          console.error(`${COLORS.red}Error stopping server: ${err.message}${COLORS.reset}`);
        } else {
          console.log(`${COLORS.green}FluxDB server stopped.${COLORS.reset}`);
        }
        pm2.disconnect();
        resolve();
      });
    });
  });
}

function serverStatus(): Promise<void> {
  return new Promise((resolve) => {
    pm2.connect((err) => {
      if (err) {
        console.error(err);
        process.exit(2);
      }

      pm2.describe(APP_NAME, (err, list) => {
        if (err || !list || list.length === 0) {
          console.log(`${COLORS.red}FluxDB server is not running.${COLORS.reset}`);
        } else {
          const proc = list[0];
          console.log(`${COLORS.cyan}Status: ${COLORS.bright}${proc.pm2_env?.status}${COLORS.reset}`);
          console.log(`${COLORS.cyan}CPU: ${proc.monit?.cpu}%`);
          console.log(`${COLORS.cyan}Memory: ${Math.round((proc.monit?.memory || 0) / 1024 / 1024)}MB`);
        }
        pm2.disconnect();
        resolve();
      });
    });
  });
}

function showLogs() {
  console.log(`${COLORS.yellow}Streaming logs for FluxDB (Ctrl+C to exit)...${COLORS.reset}`);
  const { spawn } = require('child_process');
  spawn('pm2', ['logs', APP_NAME], { stdio: 'inherit' });
}

function startREPL() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${COLORS.cyan}${COLORS.bright}flux > ${COLORS.reset}`,
  });

  console.log(`${COLORS.magenta}${COLORS.bright}
  ███████╗██╗     ██╗   ██╗██╗  ██╗██████╗ ██████╗ 
  ██╔════╝██║     ██║   ██║╚██╗██╔╝██╔══██╗██╔══██╗
  █████╗  ██║     ██║   ██║ ╚███╔╝ ██║  ██║██████╔╝
  ██╔══╝  ██║     ██║   ██║ ██╔██╗ ██║  ██║██╔══██╗
  ██║     ███████╗╚██████╔╝██╔╝ ██╗██████╔╝██████╔╝
  ╚═╝     ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═════╝ 
${COLORS.reset}`);
  console.log(`${COLORS.dim}In-memory JSON Document Store${COLORS.reset}\n`);
  console.log(`${COLORS.yellow}Available Commands:${COLORS.reset}`);
  console.log(`  ${COLORS.bright}set${COLORS.reset} <key> <value> [ttl]`);
  console.log(`  ${COLORS.bright}get${COLORS.reset} <key>`);
  console.log(`  ${COLORS.bright}del${COLORS.reset} <key>`);
  console.log(`  ${COLORS.bright}exists${COLORS.reset} <key>`);
  console.log(`  ${COLORS.bright}keys${COLORS.reset}`);
  console.log(`  ${COLORS.bright}find${COLORS.reset} <collection> <path> <op> <val>`);
  console.log(`  ${COLORS.bright}clear${COLORS.reset}, ${COLORS.bright}exit${COLORS.reset}\n`);

  rl.prompt();

  rl.on('line', async (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) {
      rl.prompt();
      return;
    }

    try {
      const tokens = tokenizer.tokenize(trimmed);
      const command = parser.parse(tokens);

      switch (command.type) {
        case 'exit':
          rl.close();
          return;

        case 'set':
          await handleSet(command.args);
          break;

        case 'get':
          await handleGet(command.args);
          break;

        case 'del':
          await handleDel(command.args);
          break;

        case 'exists':
          await handleExists(command.args);
          break;

        case 'keys':
          await handleKeys();
          break;

        case 'clear':
          console.clear();
          break;

        case 'find':
          await handleFind(command.args);
          break;

        default:
          console.log(`${COLORS.red}Unknown command: ${command.type}${COLORS.reset}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`${COLORS.red}Error: ${message}${COLORS.reset}`);
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log(`\n${COLORS.magenta}${COLORS.bright}Goodbye!${COLORS.reset}`);
    process.exit(0);
  });
}

async function handleSet(args: unknown[]) {
  if (args.length < 2) {
    console.log(`${COLORS.yellow}Usage: set <key> <value> [ttl]${COLORS.reset}`);
    return;
  }

  const key = args[0] as string;
  let ttl: number | undefined;
  let value: unknown;

  if (args.length > 2 && typeof args[args.length - 1] === 'number') {
    ttl = args[args.length - 1] as number;
    value = getValueFromArgs(args.slice(1, -1));
  } else {
    value = getValueFromArgs(args.slice(1));
  }

  const res = await fetch(`${API_URL}/set`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value, ttl }),
  });
  const data = await res.json();
  console.log(`${COLORS.green}${JSON.stringify(data)}${COLORS.reset}`);
}

function getValueFromArgs(args: unknown[]): unknown {
  if (args.length === 0) return null;
  if (args.length === 1) return args[0];
  if (typeof args[0] === 'object' && args[0] !== null) return args[0];
  return args.join(' ');
}

function printData(data: unknown) {
  if (data === undefined || data === null) {
    console.log(`${COLORS.dim}null${COLORS.reset}`);
  } else {
    const json = JSON.stringify(data, null, 2);
    // Very basic syntax highlighting for JSON
    const highlighted = json
      .replace(/"([^"]+)":/g, `${COLORS.blue}"$1"${COLORS.reset}:`)
      .replace(/: "([^"]+)"/g, `: ${COLORS.green}"$1"${COLORS.reset}`)
      .replace(/: (\d+)/g, `: ${COLORS.yellow}$1${COLORS.reset}`);
    console.log(highlighted);
  }
}

async function handleGet(args: unknown[]) {
  if (args.length < 1) {
    console.log(`${COLORS.yellow}Usage: get <key>${COLORS.reset}`);
    return;
  }
  const key = args[0] as string;
  const res = await fetch(`${API_URL}/get?key=${encodeURIComponent(key)}`);
  const data = await res.json();
  printData(data.value);
}

async function handleKeys() {
  const res = await fetch(`${API_URL}/keys`);
  const data = await res.json();
  printData(data.keys);
}

async function handleDel(args: unknown[]) {
  if (args.length < 1) {
    console.log(`${COLORS.yellow}Usage: del <key>${COLORS.reset}`);
    return;
  }
  const key = args[0] as string;
  const res = await fetch(`${API_URL}/del?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
  const data = await res.json();
  console.log(`${COLORS.green}${JSON.stringify(data)}${COLORS.reset}`);
}

async function handleExists(args: unknown[]) {
  if (args.length < 1) {
    console.log(`${COLORS.yellow}Usage: exists <key>${COLORS.reset}`);
    return;
  }
  const key = args[0] as string;
  const res = await fetch(`${API_URL}/exists?key=${encodeURIComponent(key)}`);
  const data = await res.json();
  console.log(`${COLORS.green}${JSON.stringify(data)}${COLORS.reset}`);
}

async function handleFind(args: unknown[]) {
  if (args.length < 1) {
    console.log(`${COLORS.yellow}Usage: find <collection> [path op val]${COLORS.reset}`);
    return;
  }

  const collection = args[0] as string;
  let url = `${API_URL}/find?collection=${encodeURIComponent(collection)}`;

  if (args.length >= 4) {
    const path = args[1] as string;
    const op = args[2] as string;
    const val = getValueFromArgs(args.slice(3));
    url += `&path=${encodeURIComponent(path)}&op=${encodeURIComponent(op)}&val=${encodeURIComponent(
      val as string | number | boolean
    )}`;
  }

  const res = await fetch(url);
  const data = await res.json();
  printData(data.results);
}

main();
