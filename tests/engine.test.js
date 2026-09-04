const { calcDiscount, calcTotalPrice } = require('../src/engine/sync');

test('discount calculation', ()=>{
  expect(calcDiscount(100, 75)).toBe(25);
  expect(calcDiscount(null, 75)).toBe(null);
});

test('total price calculation', ()=>{
  expect(calcTotalPrice(50, 5)).toBe(55);
  expect(calcTotalPrice(50, null)).toBe(50);
});
