// Smoke test for the Pizzeria game.
//
//     node tools/pizza_test.mjs
//
// Same shape as tools/term_test.mjs: runs against assets/js/pizza.js directly,
// no Hugo build, no minified identifiers, Node only, no dependencies.
//
// The source is an IIFE that exports nothing, so the one thing this does to it
// is expose the rules and a handle on the round before the closing brace.
import { readFileSync } from 'node:fs';

const src = readFileSync('assets/js/pizza.js', 'utf8').replace(
  /\}\(\)\);\s*$/,
  `globalThis.__pizza = {
     makeOrder, check, scoreFor, toppings: TOPPINGS, menu: MENU,
     start: startGame, put, toggle, action,
     peek: () => ({ phase, score, combo, left, served, order, have: have.slice() })
   };\n}());\n`,
);

// The page's DOM. Nothing here reads back what the game writes — the round is
// inspected through peek() above, not through the stubs.
const stubEl = () => ({
  dataset: {},
  classList: { add() {}, remove() {} },
  style: {},
  hidden: true,
  disabled: false,
  textContent: '',
  focus() {}, addEventListener() {}, appendChild() {}, setAttribute() {},
  getContext: () => new Proxy({}, { get: () => () => {} }),
});

globalThis.document = {
  getElementById: stubEl, createElement: stubEl, createTextNode: stubEl,
  body: stubEl(), addEventListener() {},
};
globalThis.window = { addEventListener() {} };

// The shift clock runs on requestAnimationFrame, so frames are handed in by
// hand below: a whole round plays out without waiting a real minute.
let frame = null;
globalThis.requestAnimationFrame = (cb) => { frame = cb; return 1; };
globalThis.cancelAnimationFrame = () => {};

new Function(src)();

const g = globalThis.__pizza;
const { makeOrder, check, scoreFor, toppings, menu } = g;

let failed = 0;
const is = (label, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${!ok && detail ? `  -> ${detail}` : ''}`);
  if (!ok) failed++;
};

// ---- the pantry and the menu -------------------------------------------

const keys = toppings.map((t) => t.key);
is('eight toppings — two full rows of four',
  keys.length === 8 && toppings.every((t) => t.name && /^#[0-9a-f]{6}$/.test(t.color)));
is('no two toppings share a colour', new Set(toppings.map((t) => t.color)).size === 8);

is('every recipe is made of real toppings',
  menu.every((p) => p.want.every((k) => keys.includes(k))));
is('no recipe asks for the same topping twice',
  menu.every((p) => new Set(p.want).size === p.want.length));
is('no two pizzas share a name', new Set(menu.map((p) => p.name)).size === menu.length);
// Two pizzas with the same toppings under different names would be unfair:
// the cookbook could not tell them apart either.
is('no two pizzas share a recipe',
  new Set(menu.map((p) => [...p.want].sort().join('+'))).size === menu.length);
is('every size from one to four topping is on the menu',
  [1, 2, 3, 4].every((n) => menu.some((p) => p.want.length === n)));

// ---- orders -------------------------------------------------------------

// Difficulty ramp: one topping, then two from order 3, three from 6, four from 9.
const sizes = [1, 2, 3, 5, 6, 8, 9, 30].map((n) => makeOrder(n).want.length);
is('orders get longer as the shift goes on',
  String(sizes) === '1,1,2,2,3,3,4,4', String(sizes));

const many = Array.from({ length: 300 }, (_, i) => makeOrder(i + 1));
is('every order is a pizza off the menu',
  many.every((o) => menu.some((p) => p.name === o.pizza
    && String([...p.want].sort()) === String([...o.want].sort()))));
is('every order has a customer', many.every((o) => typeof o.customer === 'string' && o.customer));
is('orders keep their number', makeOrder(7).no === 7);
// The ticket only names the pizza, so the order must not hand the answer over
// in some other field.
is('an order carries a name, not a recipe on a plate',
  typeof makeOrder(9).pizza === 'string');

is('order of the toppings does not matter',
  check(['salami', 'oliven'], ['oliven', 'salami']).ok);
is('a missing topping is reported',
  String(check(['salami', 'oliven'], ['salami']).missing) === 'oliven');
is('an extra topping is reported',
  String(check(['salami'], ['salami', 'ananas']).extra) === 'ananas');
is('missing and extra can happen at once', (() => {
  const r = check(['salami', 'pilze'], ['salami', 'ananas']);
  return !r.ok && String(r.missing) === 'pilze' && String(r.extra) === 'ananas';
})());
is('a bare pizza is wrong unless nothing was ordered', !check(['salami'], []).ok);

const order3 = { no: 3, customer: 'Tisch 4', want: ['salami', 'pilze', 'oliven'] };
is('more toppings pay more',
  scoreFor(order3, 1) > scoreFor({ ...order3, want: ['salami', 'pilze'] }, 1));
is('the streak multiplies the score', scoreFor(order3, 3) === scoreFor(order3, 1) * 3);
is('the streak multiplier is capped at x5', scoreFor(order3, 9) === scoreFor(order3, 5));

// ---- a round, frame by frame -------------------------------------------

let now = 0;
const step = (ms) => { now += ms; frame(now); };

g.start();
is('a round starts on the topping phase with a full clock',
  g.peek().phase === 'belegen' && g.peek().left === 60000, JSON.stringify(g.peek()));

step(0);
for (let i = 0; i < 4; i++) step(250);
is('the clock runs down', g.peek().left === 59000, String(g.peek().left));

// A backgrounded tab freezes rAF, then resumes with one huge timestamp jump.
const before = g.peek().left;
step(30000);
is('a tab in the background pauses the shift instead of eating it',
  before - g.peek().left === 250, String(before - g.peek().left));

// A drop lands via put(); dropping the same tile twice must not stack it.
g.put('ananas');
g.put('ananas');
is('the same ingredient cannot be dropped twice',
  String(g.peek().have) === 'ananas', String(g.peek().have));
g.toggle('ananas');
is('the number key takes it off again', g.peek().have.length === 0);

g.peek().order.want.forEach(g.put);
g.action();
is('the oven takes the pizza', g.peek().phase === 'ofen');
step(200);
is('and needs a moment', g.peek().phase === 'ofen');
for (let i = 0; i < 3; i++) step(250);
is('after which it is ready to go out', g.peek().phase === 'liefern', g.peek().phase);

g.put('zwiebeln');
is('nothing goes on a pizza that is already in the oven',
  g.peek().have.length === g.peek().order.want.length, String(g.peek().have));

const good = g.peek();
g.action();
is('a correct delivery scores, extends the shift and raises the streak',
  g.peek().score > 0 && g.peek().left > good.left && g.peek().combo === 2,
  JSON.stringify(g.peek()));
is('and the next order is already on the counter',
  g.peek().phase === 'belegen' && g.peek().have.length === 0);

// One topping too many.
const kept = g.peek().score;
const wrong = keys.find((k) => !g.peek().order.want.includes(k));
g.peek().order.want.forEach(g.put);
g.put(wrong);
g.action();
for (let i = 0; i < 5; i++) step(250);
const beforeMiss = g.peek().left;
g.action();
is('a wrong delivery pays nothing, resets the streak and costs time',
  g.peek().score === kept && g.peek().combo === 1 && g.peek().left === beforeMiss - 4000,
  JSON.stringify(g.peek()));

for (let i = 0; i < 600 && g.peek().phase !== 'ende'; i++) step(250);
is('the shift ends when the clock hits zero',
  g.peek().phase === 'ende' && g.peek().left === 0, JSON.stringify(g.peek()));

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
