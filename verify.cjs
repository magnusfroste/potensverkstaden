/* verify.cjs — kontrollerar Potensverkstadens uppgifter oberoende av appen.
   Kör: node verify.cjs */
const fs = require('fs');
const vm = require('vm');

const ctx = { window: {}, console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('public/data.js', 'utf8'), ctx);
const BANK = ctx.window.BANK;

let fel = 0;
const fail = (m) => { console.log('FEL: ' + m); fel++; };

function num(s) {
  return Number(String(s).replace(/\s|\u00a0|\u202f/g, '').replace(',', '.'));
}

/* Prefix i grundenheten: (faktor som potens av tio, grundenhet) */
const PREFIX = {
  G: [9, ''], M: [6, ''], k: [3, ''], m: [-3, ''],
  'µ': [-6, ''], u: [-6, ''], n: [-9, '']
};

const sedda = new Set();
let antal = 0;

['niva1', 'niva2', 'niva3'].forEach((niva) => {
  const raderna = BANK[niva];
  if (!Array.isArray(raderna) || raderna.length !== 8) fail(niva + ' ska ha 8 uppgifter');
  raderna.forEach((p, i) => {
    antal++;
    const namn = niva + '#' + (i + 1) + ' ' + p.n + (p.pre || '');
    const a = num(p.a);
    if (!(a >= 1 && a < 10)) fail(namn + ': siffran framför tian är ' + p.a + ', ska vara 1 ≤ a < 10');
    if (!Number.isInteger(p.e)) fail(namn + ': exponenten är inte ett heltal');
    if (p.e < -12 || p.e > 12) fail(namn + ': exponenten ligger utanför stegens intervall');

    /* värdet som det står på skärmen */
    let varde = num(p.n);
    if (p.pre) {
      const bokstav = p.pre[0];
      const unit = p.pre.slice(1);
      if (!PREFIX[bokstav]) { fail(namn + ': okänt prefix ' + bokstav); return; }
      varde = varde * Math.pow(10, PREFIX[bokstav][0]);
      if (p.unit && p.unit !== unit) fail(namn + ': enhet ' + p.unit + ' matchar inte prefixet ' + p.pre);
      if (p.a === undefined) fail(namn + ': saknar siffra');
    }
    const utraknat = a * Math.pow(10, p.e);
    const skillnad = Math.abs(utraknat - varde) / Math.max(Math.abs(varde), 1e-300);
    if (skillnad > 1e-9) {
      fail(namn + ': ' + p.a + ' × 10^' + p.e + ' = ' + utraknat + ', men skärmen säger ' + varde);
    }

    /* felkorten som appen bygger: a*10 och a/10 – de får aldrig vara rätt */
    [10, 0.1].forEach((f) => {
      const d = a * f;
      if (d === a) fail(namn + ': felkortet blir samma som svaret');
      if (Math.abs(d * Math.pow(10, p.e) - varde) / Math.max(Math.abs(varde), 1e-300) < 1e-9) {
        fail(namn + ': ett felkort råkar ge rätt värde med rätt exponent');
      }
    });

    const nyckel = p.n + '|' + (p.pre || '');
    if (sedda.has(nyckel)) fail(namn + ': talet förekommer två gånger');
    sedda.add(nyckel);
  });
});

/* nivå 3 måste handla om prefix */
if (!BANK.niva3.every((p) => p.pre && p.unit)) fail('nivå 3 ska ha prefix och grundenhet i varje uppgift');
if (BANK.niva1.some((p) => p.e < 0)) fail('nivå 1 ska bara ha stora tal (positiv exponent)');
if (!BANK.niva2.every((p) => p.e < 0)) fail('nivå 2 ska bara ha små tal (negativ exponent)');

/* ---------- rösten: varje mening appen säger ska ha en mp3 ---------- */
const app = fs.readFileSync('public/app.js', 'utf8');
const ljudKod = fs.readFileSync('public/ljud/lines.js', 'utf8');
const roster = {};
ljudKod.replace(/"([^"]+)"\s*:\s*"([0-9a-f]+)"/g, (m, text, hash) => { roster[text] = hash; });

const literaler = [];
app.replace(/\btal\('((?:[^'\\]|\\.)*)'\)/g, (m, t) => { literaler.push(t.replace(/\\'/g, "'")); });
const byggda = [];
for (let n = 1; n <= 3; n++) {
  byggda.push('Nivå ' + n + ' klar. Du fick 0 stjärnor.');
  for (let k = 1; k <= 8; k++) {
    byggda.push('Nivå ' + n + ' klar. Du fick ' + k + (k === 1 ? ' stjärna.' : ' stjärnor.'));
  }
}
const alla = literaler.concat(byggda);
/* nivåintrot nås via tal(intro(n)) och fångas inte av literal-regexen */
alla.push('Nivå 1. Skriv talet i grundpotensform. Välj siffran framför tian och stega exponenten.');
alla.push('Nivå 2. Nu är talen små, så exponenten blir negativ.');
alla.push('Nivå 3. Läs prefixet och skriv talet i grundenheten. Giga är tio upphöjt till nio, mikro tio upphöjt till minus sex.');
if (!/Nivå 1\. Skriv talet i grundpotensform/.test(app)) fail('nivåintrot i appen matchar inte rösttexten');
const unika = [...new Set(alla)];
let saknas = 0;
unika.forEach((t) => {
  const fil = 'public/ljud/' + (roster[t] || '') + '.mp3';
  if (!roster[t]) { fail('ingen röstfil för: ' + t); saknas++; return; }
  if (!fs.existsSync(fil)) { fail('rösten pekar på saknad fil: ' + fil); saknas++; }
});

console.log('Uppgifter: ' + antal + ' (nivå 1: ' + BANK.niva1.length +
  ', nivå 2: ' + BANK.niva2.length + ', nivå 3: ' + BANK.niva3.length + ')');
console.log('Meningar i koden: ' + unika.length + ', röstfiler: ' + Object.keys(roster).length +
  ', saknade: ' + saknas);
console.log(fel === 0 ? '0 fel' : fel + ' fel');
process.exit(fel === 0 ? 0 : 1);