import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv(path) {
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

const env = loadEnv(resolve(__dirname, '.env'));
const pluginsDir = env.OBSIDIAN_PLUGINS_DIR;

if (!pluginsDir) {
  console.log('deploy-local: OBSIDIAN_PLUGINS_DIR not set in .env, skipping local copy.');
  process.exit(0);
}

const target = resolve(pluginsDir, 'splinter-deployer');
mkdirSync(target, { recursive: true });

for (const file of ['manifest.json', 'main.js']) {
  const src = resolve(__dirname, file);
  if (!existsSync(src)) {
    console.log(`deploy-local: ${file} missing, skipping.`);
    continue;
  }
  copyFileSync(src, resolve(target, file));
}

console.log(`deploy-local: copied plugin into ${target}`);
