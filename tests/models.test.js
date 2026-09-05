const { initDb, getDb } = require('../src/db');
const { upsertProduct, findProductByIds } = require('../src/models/models');

beforeEach(() => {
  process.env.DATABASE_FILE = ':memory:';
  initDb();
});

describe('models deduplication', () => {
  test('find by GTIN', () => {
    const prod = { id: 'p1', gtin: 'g1', title: 'T1' };
    upsertProduct(prod);
    const found = findProductByIds({gtin: 'g1'});
    expect(found).not.toBeNull();
    expect(found.id).toBe('p1');
  });

  test('find by EAN then UPC then MPN then brand+title', () => {
    upsertProduct({id:'p2', ean:'e1', title:'X'});
    expect(findProductByIds({ean:'e1'}).id).toBe('p2');

    upsertProduct({id:'p3', upc:'u1', title:'Y'});
    expect(findProductByIds({upc:'u1'}).id).toBe('p3');

    upsertProduct({id:'p4', mpn:'m1', title:'Z'});
    expect(findProductByIds({mpn:'m1'}).id).toBe('p4');

    upsertProduct({id:'p5', brand:'B', title:'Model 100'});
    expect(findProductByIds({brand:'B', title:'Model'}).id).toBe('p5');
  });

  test('title substring matching', () => {
    upsertProduct({id:'p6', title:'The Best Gadget'});
    expect(findProductByIds({title:'Best Gadget'}).id).toBe('p6');
  });
});
