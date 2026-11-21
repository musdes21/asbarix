import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const app = read('src/app.html') + read('src/catalog-panels.html');
const script = read('src/assets/simplified-ui.js');
const css = read('src/assets/simplified-ui.css');
const build = read('src/build.mjs');

test('simplified UI assets compile and are linked into the built workspace', () => {
  assert.doesNotThrow(() => new vm.Script(script, { filename: 'simplified-ui.js' }));
  assert.match(build, /simplified-ui\.css/);
  assert.match(build, /simplified-ui\.js/);
  assert.match(css, /\.ui-fold/);
  assert.match(script, /DOMContentLoaded/);
});

test('all moved calculator controls exist in source markup', () => {
  const ids = [
    'sh-bleed', 'sh-gap', 'sh-margin', 'sh-spare', 'sh-price',
    'st-gap', 'st-side', 'st-price', 'st-supplier', 'st-rotwrap',
    'sale-rate', 'ac-t', 'ac-gap', 'ac-rotwrap',
    'inD', 'ind', 'inh', 'resetDims', 'bn-design',
    'sh-err', 'st-err', 'ac-err', 'errors'
  ];
  for (const id of ids) {
    assert.ok(app.includes('id="' + id + '"'), 'Missing expected calculator control: ' + id);
  }
});

test('navigation groups map to existing tabs and active tab mechanism', () => {
  for (const name of ['sheets', 'stickers', 'acrylic', 'banners', 'cups', 'suppliers', 'offset-products', 'gifts']) {
    assert.ok(app.includes('data-tab="' + name + '"'), 'Missing tab button: ' + name);
  }
  assert.match(script, /location\.hash/);
  assert.match(script, /tab\.click\(\)/);
});

test('production logic is left intact; folding remains opt-in and accessible', () => {
  assert.match(script, /document\.createElement\('details'\)/);
  assert.match(script, /document\.createElement\('summary'\)/);
  assert.match(script, /openOnError/);
  assert.doesNotMatch(script, /fetch\(|localStorage\.setItem|calculateQuote\s*=/);
});
