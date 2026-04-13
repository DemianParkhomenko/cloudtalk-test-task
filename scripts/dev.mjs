#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const envExamplePath = path.join(rootDir, '.env.example');
const envPath = path.join(rootDir, '.env');

const log = (message) => {
  console.log(`\n[dev] ${message}`);
};

const fail = (message, error) => {
  console.error(`\n[dev] ERROR: ${message}`);
  if (error) {
    console.error(error.message ?? String(error));
  }
  process.exit(1);
};

const runSync = ({ command, args, cwd = rootDir, env = process.env, label }) => {
  log(label);
  const result = spawnSync(command, args, {
    cwd,
    env,
    stdio: 'inherit',
  });

  if (result.error) {
    fail(`Failed to run: ${command} ${args.join(' ')}`, result.error);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const parseEnvFile = (content) => {
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
};

const setEnvValue = (envContent, key, value) => {
  const lineValue = value.includes(' ') ? `"${value}"` : value;
  const line = `${key}=${lineValue}`;
  const keyRegex = new RegExp(`^${key}=.*$`, 'm');

  if (keyRegex.test(envContent)) {
    return envContent.replace(keyRegex, line);
  }

  const suffix = envContent.endsWith('\n') ? '' : '\n';
  return `${envContent}${suffix}${line}\n`;
};

const resolveComposeCommand = () => {
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

  fail(
    'Docker Compose is not available. Install Docker Desktop (or docker-compose) and try again.',
  );
};

const generateJwtKeyPair = () => {
  log('Generating JWT RSA key pair for .env');

  const privateResult = spawnSync('openssl', ['genrsa', '2048'], {
    cwd: rootDir,
    encoding: 'utf8',
  });

  if (privateResult.error || privateResult.status !== 0 || !privateResult.stdout) {
    fail('Unable to generate private key with OpenSSL.', privateResult.error);
  }

  const privatePem = privateResult.stdout;

  const publicResult = spawnSync('openssl', ['rsa', '-pubout'], {
    cwd: rootDir,
    input: privatePem,
    encoding: 'utf8',
  });

  if (publicResult.error || publicResult.status !== 0 || !publicResult.stdout) {
    fail('Unable to derive public key with OpenSSL.', publicResult.error);
  }

  return {
    privateKeyBase64: Buffer.from(privatePem, 'utf8').toString('base64'),
    publicKeyBase64: Buffer.from(publicResult.stdout, 'utf8').toString('base64'),
  };
};

const ensureEnvFile = () => {
  if (!fs.existsSync(envPath)) {
    if (!fs.existsSync(envExamplePath)) {
      fail('.env.example is missing, cannot bootstrap local environment.');
    }

    fs.copyFileSync(envExamplePath, envPath);
    log('Created .env from .env.example');
  }

  let envContent = fs.readFileSync(envPath, 'utf8');
  const envValues = parseEnvFile(envContent);

  const hasPrivate = Boolean(envValues.JWT_PRIVATE_KEY_BASE64);
  const hasPublic = Boolean(envValues.JWT_PUBLIC_KEY_BASE64);

  if (!hasPrivate || !hasPublic) {
    const keys = generateJwtKeyPair();
    envContent = setEnvValue(envContent, 'JWT_PRIVATE_KEY_BASE64', keys.privateKeyBase64);
    envContent = setEnvValue(envContent, 'JWT_PUBLIC_KEY_BASE64', keys.publicKeyBase64);
    fs.writeFileSync(envPath, envContent, 'utf8');
    log('Stored generated JWT keys in .env');
  }

  return parseEnvFile(fs.readFileSync(envPath, 'utf8'));
};

const startServices = (envVars) => {
  const childEnv = {
    ...process.env,
    ...envVars,
  };

  log('Starting backend (http://localhost:3000) and frontend (http://localhost:4200)');

  const backend = spawn('npm', ['run', 'start:dev'], {
    cwd: path.join(rootDir, 'backend'),
    env: childEnv,
    stdio: 'inherit',
  });

  const frontend = spawn('npm', ['start'], {
    cwd: path.join(rootDir, 'frontend'),
    env: childEnv,
    stdio: 'inherit',
  });

  let shuttingDown = false;

  const shutdown = (signal) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    log(`Stopping services (${signal})...`);
    backend.kill('SIGTERM');
    frontend.kill('SIGTERM');
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  backend.on('exit', (code, signal) => {
    if (!shuttingDown) {
      shutdown(signal ?? `backend exit ${code ?? 0}`);
    }

    if (typeof code === 'number' && code !== 0) {
      process.exitCode = code;
    }
  });

  frontend.on('exit', (code, signal) => {
    if (!shuttingDown) {
      shutdown(signal ?? `frontend exit ${code ?? 0}`);
    }

    if (typeof code === 'number' && code !== 0) {
      process.exitCode = code;
    }
  });
};

const main = () => {
  const envVars = ensureEnvFile();

  runSync({
    command: 'npm',
    args: ['install'],
    cwd: rootDir,
    label: 'Installing dependencies (workspaces)',
  });

  const compose = resolveComposeCommand();
  runSync({
    command: compose.command,
    args: [...compose.args, 'up', '-d'],
    cwd: rootDir,
    label: 'Starting PostgreSQL with Docker Compose',
  });

  runSync({
    command: 'npm',
    args: ['run', 'db:migrate'],
    cwd: path.join(rootDir, 'backend'),
    env: {
      ...process.env,
      ...envVars,
    },
    label: 'Running database migrations',
  });

  runSync({
    command: 'npm',
    args: ['run', 'db:generate'],
    cwd: path.join(rootDir, 'backend'),
    env: {
      ...process.env,
      ...envVars,
    },
    label: 'Generating Prisma client',
  });

  startServices(envVars);
};

main();
