const { calcDiscount, calcTotalPrice, scoreDeal, syncSource } = require('../src/engine/sync');
const { registry } = require('../src/registry');

describe('sync engine utilities', () => {
  test('calcDiscount works', () => {
    expect(calcDiscount(200, 150)).toBeCloseTo(25.00);
    expect(calcDiscount(null, 150)).toBeNull();
  });

  test('calcTotalPrice works', () => {
    expect(calcTotalPrice(10, 2)).toBe(12);
    expect(calcTotalPrice(10, null)).toBe(10);
  });

  test('scoreDeal deterministic', () => {
    const deal = { price: 10, originalPrice: 20, discountPercent: 50, shippingCost: 2, affiliateUrl: 'http://x' };
    const s = scoreDeal(deal);
    expect(typeof s).toBe('number');
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(100);
  });

  test('syncSource returns NOT_CONFIGURED for missing source', async () => {
    const res = await syncSource('nope');
    expect(res.status).toBe('NOT_CONFIGURED');
  });

  test('syncSource handles adapter with malformed items without crashing', async () => {
    // register a mock adapter
    registry.register('mock:1', {
      config: { url: 'http://mock' },
      fetchProducts: async () => { return [ { id: 'ok', price: 10 }, null, { id: 'bad', price: 'NaN' } ]; },
      normalizeProduct: (raw) => { if(!raw) throw new Error('invalid'); return { id: raw.id, source: 'mock', price: Number(raw.price), originalPrice: null, shippingCost: null, sourceProductId: raw.id } }
    });

    const res = await syncSource('mock:1');
    // should process at least one product and record errors
    expect(res.productsProcessed).toBeGreaterThanOrEqual(1);
    expect(res.errors).toBeGreaterThanOrEqual(1);
    expect(['completed','failed','NOT_CONFIGURED']).toContain(res.status);
  });
});
