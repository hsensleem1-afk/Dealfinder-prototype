jest.mock('axios');
const axios = require('axios');

const { initDb } = require('../src/db');

describe('End-to-end sync using local sample feed', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.DATABASE_FILE = ':memory:';
    process.env.FEED_URLS = 'http://local.test/sample.json';
    initDb();
  });

  test('full pipeline persists products and deals', async () => {
    const sample = require('../data/sample-feed.json');
    axios.get.mockResolvedValueOnce({ headers: { 'content-type': 'application/json' }, data: JSON.stringify(sample) });

    // require registry and sync after setting FEED_URLS
    const { registry } = require('../src/registry');
    const { syncSource } = require('../src/engine/sync');
    const { listProducts } = require('../src/models/models');
    const { listDeals } = require('../src/models/models');

    const sources = registry.list();
    expect(sources.length).toBeGreaterThanOrEqual(1);
    const res = await syncSource('feed:0');
    expect(['completed','partial']).toContain(res.status);
    expect(res.productsProcessed).toBeGreaterThanOrEqual(1);
    expect(res.dealsCreated).toBeGreaterThanOrEqual(1);

    const products = listProducts();
    const deals = listDeals(10);
    expect(products.length).toBeGreaterThanOrEqual(1);
    expect(deals.length).toBeGreaterThanOrEqual(1);

    // check normalized fields
    const p = products.find(x=>x.gtin==='0001234560001');
    expect(p).toBeDefined();
    expect(p.title).toContain('Test Widget');
    const d = deals.find(x=>x.productId===p.id);
    expect(d).toBeDefined();
    expect(d.price).toBeCloseTo(49.99);
    expect(d.discountPercent).toBeCloseTo(Math.round((1 - (49.99/79.99))*100*100)/100);
  });
});
