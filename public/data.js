/* Potensverkstaden — uppgifter.
   Varje uppgift: n = talet som visas, a = rätt siffra framför tian,
   e = rätt exponent, pre/unit = prefix och grundenhet (nivå 3).
   Värdena är kontrollerade av verify.cjs mot en oberoende uträkning. */
window.BANK = {
  niva1: [
    { n: '6 800 000', a: '6,8', e: 6 },
    { n: '54 000', a: '5,4', e: 4 },
    { n: '320 000 000', a: '3,2', e: 8 },
    { n: '7 200', a: '7,2', e: 3 },
    { n: '91 000 000', a: '9,1', e: 7 },
    { n: '480 000', a: '4,8', e: 5 },
    { n: '12 500', a: '1,25', e: 4 },
    { n: '3 400 000', a: '3,4', e: 6 }
  ],
  niva2: [
    { n: '0,000 42', a: '4,2', e: -4 },
    { n: '0,000 007', a: '7', e: -6 },
    { n: '0,025', a: '2,5', e: -2 },
    { n: '0,000 000 8', a: '8', e: -7 },
    { n: '0,000 36', a: '3,6', e: -4 },
    { n: '0,000 000 000 5', a: '5', e: -10 },
    { n: '0,000 006 4', a: '6,4', e: -6 },
    { n: '0,000 19', a: '1,9', e: -4 }
  ],
  niva3: [
    { n: '3,2', pre: 'GHz', a: '3,2', e: 9, unit: 'Hz' },
    { n: '5', pre: 'µm', a: '5', e: -6, unit: 'm' },
    { n: '12', pre: 'nm', a: '1,2', e: -8, unit: 'm' },
    { n: '8', pre: 'mm', a: '8', e: -3, unit: 'm' },
    { n: '2,4', pre: 'km', a: '2,4', e: 3, unit: 'm' },
    { n: '860', pre: 'MHz', a: '8,6', e: 8, unit: 'Hz' },
    { n: '40', pre: 'µs', a: '4', e: -5, unit: 's' },
    { n: '7,5', pre: 'GJ', a: '7,5', e: 9, unit: 'J' }
  ]
};