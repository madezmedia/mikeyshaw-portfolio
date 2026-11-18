// @astrojs/vercel 7.x only knows Node 18 and 20, and falls back to nodejs18.x on newer Node.
// Vercel no longer offers Node 18 or 20, so point every function at Node 24 after the build.
// Remove this script when the project moves to Astro 5 and @astrojs/vercel 8+.
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const RUNTIME = 'nodejs24.x';
const root = '.vercel/output/functions';
let changed = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name === '.vc-config.json') {
      const cfg = JSON.parse(readFileSync(p, 'utf8'));
      if (cfg.runtime && cfg.runtime.startsWith('nodejs') && cfg.runtime !== RUNTIME) {
        cfg.runtime = RUNTIME;
        writeFileSync(p, JSON.stringify(cfg, null, '\t'));
        changed++;
      }
    }
  }
}

if (existsSync(root)) walk(root);
console.log(`fix-vercel-runtime: set ${changed} function(s) to ${RUNTIME}`);
