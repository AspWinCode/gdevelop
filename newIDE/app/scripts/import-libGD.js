const shell = require('shelljs');
const path = require('path');

const destinationTestDirectory = '../node_modules/libGD.js-for-tests-only';

if (shell.mkdir('-p', destinationTestDirectory).stderr) {
  shell.echo('❌ Error while creating node_modules folder for libGD.js');
}

// Pinned to a known-working build (see Binaries/embuild/GDevelop.js README / deploy notes):
// this deployment has no .git history, so the upstream script's commit/branch-based
// download logic always falls back to downloading GDevelop 'master' latest, which can be
// a newer, incompatible version vs. the Extensions/ bundled in this source tree. Skip all
// of that and just use the libGD.js/libGD.wasm already checked into newIDE/app/public.
if (
  shell.test('-f', '../public/libGD.js') &&
  shell.test('-f', '../public/libGD.wasm')
) {
  shell.echo('ℹ️  Using pinned libGD.js/libGD.wasm already present in public/ (skipping download).');
  shell.cp('../public/libGD.js', destinationTestDirectory + '/index.js');
  shell.cp('../public/libGD.wasm', destinationTestDirectory + '/libGD.wasm');
  shell.echo('✅ Copied pinned libGD.js to node_modules folder for tests.');
} else {
  shell.echo('❌ No public/libGD.js or public/libGD.wasm found. This pinned build requires them to be committed.');
  shell.exit(1);
}
