#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const e2eDir = path.resolve(__dirname, '..');
const rootDir = path.resolve(e2eDir, '..');
const backendDir = path.join(rootDir, 'backend');

const mode = process.argv[2];

if (mode !== 'api' && mode !== 'ui') {
  console.error('[e2e] Usage: node scripts/run-tests.mjs <api|ui>');
  process.exit(1);
}

const TEST_DATABASE_URL =
  process.env['DATABASE_URL'] ?? 'postgresql://postgres:postgres@localhost:5433/todo_test';
const API_URL = process.env['API_URL'] ?? 'http://localhost:3000';
const APP_URL = process.env['APP_URL'] ?? 'http://localhost:4200';

const childProcesses = [];

function log(message) {
  console.log(`\n[e2e] ${message}`);
}

function fail(message, error) {
  console.error(`\n[e2e] ERROR: ${message}`);
  if (error) {
    console.error(error.message ?? String(error));
  }
  process.exit(1);
}

function parseDatabaseHostPort(databaseUrl) {
  try {
    const parsed = new URL(databaseUrl);
    const port = parsed.port ? Number(parsed.port) : 5432;
    return {
      host: parsed.hostname,
      port,
    };
  } catch {
    return { host: 'localhost', port: 5432 };
  }
}

function parseEnvFile(content) {
  const values = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex < 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

function setEnvValue(envContent, key, value) {
  const lineValue = value.includes(' ') ? `"${value}"` : value;
  const line = `${key}=${lineValue}`;
  const keyRegex = new RegExp(`^${key}=.*$`, 'm');

  if (keyRegex.test(envContent)) {
    return envContent.replace(keyRegex, line);
  }

  const suffix = envContent.endsWith('\n') ? '' : '\n';
  return `${envContent}${suffix}${line}\n`;
}

function generateJwtKeyPair() {
  const privateResult = spawnSync('openssl', ['genrsa', '2048'], {
    cwd: rootDir,
    encoding: 'utf8',
  });

  if (privateResult.error || privateResult.status !== 0 || !privateResult.stdout) {
    fail('Unable to generate JWT private key via OpenSSL.', privateResult.error);
  }

  const publicResult = spawnSync('openssl', ['rsa', '-pubout'], {
    cwd: rootDir,
    input: privateResult.stdout,
    encoding: 'utf8',
  });

  if (publicResult.error || publicResult.status !== 0 || !publicResult.stdout) {
    fail('Unable to generate JWT public key via OpenSSL.', publicResult.error);
  }

  return {
    privateKeyBase64: Buffer.from(privateResult.stdout, 'utf8').toString('base64'),
    publicKeyBase64: Buffer.from(publicResult.stdout, 'utf8').toString('base64'),
  };
}

function ensureRootEnv() {
  const envPath = path.join(rootDir, '.env');
  const envExamplePath = path.join(rootDir, '.env.example');

  if (!fs.existsSync(envPath)) {
    if (!fs.existsSync(envExamplePath)) {
      fail('.env and .env.example are both missing. Cannot bootstrap test environment.');
    }

    fs.copyFileSync(envExamplePath, envPath);
    log('Created .env from .env.example for test bootstrap');
  }

  let envContent = fs.readFileSync(envPath, 'utf8');
  const envValues = parseEnvFile(envContent);

  const hasPrivate = Boolean(envValues.JWT_PRIVATE_KEY_BASE64);
  const hasPublic = Boolean(envValues.JWT_PUBLIC_KEY_BASE64);

  if (!hasPrivate || !hasPublic) {
    log('Generating JWT keys in .env for backend auth');
    const keys = generateJwtKeyPair();
    envContent = setEnvValue(envContent, 'JWT_PRIVATE_KEY_BASE64', keys.privateKeyBase64);
    envContent = setEnvValue(envContent, 'JWT_PUBLIC_KEY_BASE64', keys.publicKeyBase64);
    fs.writeFileSync(envPath, envContent, 'utf8');
  }

  return parseEnvFile(fs.readFileSync(envPath, 'utf8'));
}

function resolveComposeCommand() {
  const dockerCompose = spawnSync('docker', ['compose', 'version'], {
    cwd: rootDir,
    stdio: 'ignore',
  });

  if (dockerCompose.status === 0) {
    return { command: 'docker', args: ['compose'] };
  }

  const legacyCompose = spawnSync('docker-compose', ['--version'], {
    cwd: rootDir,
    stdio: 'ignore',
  });

  if (legacyCompose.status === 0) {
    return { command: 'docker-compose', args: [] };
  }

  fail('Docker Compose is not available.');
}

function runSync(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? rootDir,
    env: options.env ?? process.env,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const error = new Error(`Command failed: ${command} ${args.join(' ')}`);
    error.exitCode = result.status ?? 1;
    throw error;
  }
}

function spawnTracked(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: options.cwd ?? rootDir,
    env: options.env ?? process.env,
    detached: true,
    stdio: options.stdio ?? 'inherit',
  });

  childProcesses.push(child);
  return child;
}

async function waitForHttp(url, timeoutMs) {
  const startedAt = Date.now();
  const targetUrl = new URL(url);
  const client = targetUrl.protocol === 'https:' ? https : http;

  while (Date.now() - startedAt < timeoutMs) {
    const isReady = await new Promise((resolve) => {
      const request = client.request(
        {
          hostname: targetUrl.hostname,
          port: targetUrl.port,
          path: `${targetUrl.pathname}${targetUrl.search}`,
          method: 'GET',
          timeout: 2000,
        },
        (response) => {
          response.resume();
          const statusCode = response.statusCode ?? 0;
          resolve(statusCode >= 200 && statusCode < 500);
        },
      );

      request.on('timeout', () => {
        request.destroy();
        resolve(false);
      });

      request.on('error', () => {
        resolve(false);
      });

      request.end();
    });

    if (isReady) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  fail(`Timeout waiting for ${url}`);
}

async function waitForPort(host, port, timeoutMs) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const connected = await new Promise((resolve) => {
      const socket = net.createConnection({ host, port });

      socket.once('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.once('error', () => {
        socket.destroy();
        resolve(false);
      });
    });

    if (connected) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  fail(`Timeout waiting for ${host}:${port}`);
}

async function runMigrationWithRetry(env) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      runSync('npm', ['run', 'db:migrate'], {
        cwd: backendDir,
        env,
      });
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }

      log(`Migration failed (attempt ${attempt}/${maxAttempts}), retrying in 2s...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

function killAllChildren() {
  for (const child of childProcesses) {
    if (typeof child.pid !== 'number') {
      continue;
    }

    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      if (!child.killed) {
        child.kill('SIGTERM');
      }
    }
  }
}

async function main() {
  const envFromFile = ensureRootEnv();
  const compose = resolveComposeCommand();

  const testEnv = {
    ...process.env,
    ...envFromFile,
    NODE_ENV: 'test',
    DATABASE_URL: TEST_DATABASE_URL,
    API_URL,
    APP_URL,
    ALLOWED_ORIGINS: APP_URL,
    PORT: '3000',
  };

  let stackStarted = false;
  let testExitCode = 1;

  const stopStack = () => {
    killAllChildren();
    if (!stackStarted) {
      return;
    }

    try {
      runSync(
        compose.command,
        [...compose.args, '-f', 'docker-compose.test.yml', 'down', '-v'],
        { cwd: rootDir, env: testEnv },
      );
    } catch (error) {
      console.error('\n[e2e] WARN: Failed to stop docker test stack cleanly.');
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  };

  process.on('SIGINT', () => {
    stopStack();
    process.exit(130);
  });

  process.on('SIGTERM', () => {
    stopStack();
    process.exit(143);
  });

  try {
    log('Starting test PostgreSQL (docker-compose.test.yml)');
    runSync(compose.command, [...compose.args, '-f', 'docker-compose.test.yml', 'up', '-d'], {
      cwd: rootDir,
      env: testEnv,
    });
    stackStarted = true;

    const { host, port } = parseDatabaseHostPort(TEST_DATABASE_URL);
    log(`Waiting for PostgreSQL at ${host}:${port}`);
    await waitForPort(host, port, 90_000);

    log('Running backend migrations on test database');
    await runMigrationWithRetry(testEnv);

    log('Starting backend');
    spawnTracked('npm', ['run', 'start:dev'], {
      cwd: backendDir,
      env: testEnv,
    });

    await waitForHttp(`${API_URL}/health`, 90_000);

    if (mode === 'ui') {
      log('Starting frontend');
      spawnTracked('npm', ['run', 'start', '--', '--host', '0.0.0.0'], {
        cwd: path.join(rootDir, 'frontend'),
        env: testEnv,
        stdio: 'ignore',
      });

      await waitForHttp(APP_URL, 120_000);
    }

    const testScript = mode === 'api' ? 'test:api:raw' : 'test:ui:raw';
    log(`Running ${mode.toUpperCase()} tests`);

    const result = spawnSync('npm', ['run', testScript], {
      cwd: e2eDir,
      env: testEnv,
      stdio: 'inherit',
    });

    testExitCode = result.status ?? 1;
  } finally {
    stopStack();
  }

  process.exit(testExitCode);
}

main().catch((error) => {
  fail('Unhandled error in e2e runner.', error);
});
