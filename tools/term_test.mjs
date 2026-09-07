// Smoke test for the Über terminal's dispatcher.
//
//     node tools/term_test.mjs
//
// Runs against assets/js/terminal.js directly: no Hugo build, no scraping a
// <script> block out of rendered HTML, and no minified identifiers. Node only,
// no dependencies.
//
// The source is an IIFE that exports nothing, so the one thing this does to it
// is expose `run` on globalThis before the closing brace.
import { readFileSync } from 'node:fs';

const src = readFileSync('assets/js/terminal.js', 'utf8')
  .replace(/\}\(\)\);\s*$/, 'globalThis.__run = run;\n}());\n');

// The data the page would normally hand over in #term-data.
const DATA = JSON.stringify({
  projects: [
    { name: 'Pizzateig-Rechner', slug: 'pizzateig-rechner', desc: 'Teig.', url: 'https://pizza.example' },
    { name: 'Tatort Logbuch', slug: 'tatort-logbuch', desc: 'Folgen.', url: 'https://tatort.example' },
  ],
  github: 'tobiasschuerg',
  mailUser: 'kontakt',
  mailHost: 'example.eu',
});

const stubEl = () => ({
  dataset: { terminal: DATA },
  classList: { add() {}, remove() {} },
  style: {},
  children: [],
  hidden: true,
  textContent: '',
  innerHTML: '',
  focus() {}, addEventListener() {}, appendChild() {}, removeChild() {},
  getContext: () => new Proxy({}, { get: () => () => {} }),
});

globalThis.document = { getElementById: stubEl, createElement: stubEl, body: stubEl(), addEventListener() {} };
globalThis.window = {
  matchMedia: () => ({ matches: false }),
  addEventListener() {},
  innerWidth: 800, innerHeight: 600, devicePixelRatio: 1,
  open: (...args) => { globalThis.__opened = args; },
};
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = () => {};

new Function(src)();

let failed = 0;
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${!ok && detail ? `  -> ${detail}` : ''}`);
  if (!ok) failed++;
};

const [helpOut, helpKind] = globalThis.__run('help');
check('help returns a result', helpKind === 'res' && /help/.test(helpOut));

const [lsOut] = globalThis.__run('ls projekte');
check('ls projekte reads the injected project list', /pizzateig-rechner/.test(lsOut), lsOut);

globalThis.__run('open pizzateig-rechner');
check('open resolves a slug to its url', /pizza\.example/.test(globalThis.__opened?.[0] ?? ''), JSON.stringify(globalThis.__opened));

const [, errKind] = globalThis.__run('definitelynotacommand');
check('an unknown command is an error', errKind === 'err');

check('rm -rf returns the panic sentinel', globalThis.__run('rm -rf')[0] === '__panic__');
check('clear returns the clear sentinel', globalThis.__run('clear')[0] === '__clear__');
check('whoami produces output', globalThis.__run('whoami')[0].length > 0);
check('top reads the project list', /pizzateig|tatort/i.test(globalThis.__run('top')[0]));

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
