#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const plugin = 'fineco-it';

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', cwd: root });
}

run(`npx tsc -p tsconfig.fineco.json --outDir build --rootDir src`);

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
const zipPath = path.join('dist', `${plugin}.zip`);
const manifest = path.join('src/plugins', plugin, 'ZenmoneyManifest.xml');
const prefs = path.join('src/plugins', plugin, 'preferences.xml');
const indexJs = path.join('build/plugins', plugin, 'index.js');
run(`zip -j ${zipPath} ${manifest} ${prefs} ${indexJs}`);
