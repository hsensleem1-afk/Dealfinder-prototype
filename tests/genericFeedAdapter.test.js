const GenericFeedAdapter = require('../src/adapters/genericFeedAdapter');
const axios = require('axios');
jest.mock('axios');

describe('GenericFeedAdapter', () => {
  test('normalizeProduct maps fields correctly', () => {
    const adapter = new GenericFeedAdapter({name: 'TestFeed'});
    const raw = {
      id: 123,
      merchant: 'Shop',
      title: 'Widget 3000',
      description: 'A great widget',
      brand: 'Acme',
      category: 'Gadgets',
      image: 'http://img',
      url: 'http://product',
      price: '19.99',
      original_price: '29.99',
      availability: 'in_stock',
      gtin: '0001',
      mpn: 'MPN123',
      shipping_cost: '4.50',
      updated_at: '2026-01-01T00:00:00Z'
    };
    const p = adapter.normalizeProduct(raw);
    expect(p.id).toBe('123');
    expect(p.source).toBe('TestFeed');
    expect(p.merchant).toBe('Shop');
    expect(p.title).toBe('Widget 3000');
    expect(p.price).toBeCloseTo(19.99);
    expect(p.originalPrice).toBeCloseTo(29.99);
    expect(p.gtin).toBe('0001');
    expect(p.mpn).toBe('MPN123');
    expect(p.shippingCost).toBeCloseTo(4.5);
    expect(p.lastUpdated).toBe('2026-01-01T00:00:00Z');
  });

  test('fetchProducts supports JSON', async () => {
    const adapter = new GenericFeedAdapter({name: 'TestFeed'});
    const data = JSON.stringify([{id:1, title:'A'}]);
    axios.get.mockResolvedValueOnce({headers:{'content-type':'application/json'}, data});
    const out = await adapter.fetchProducts('http://example.com/feed.json');
    expect(Array.isArray(out)).toBe(true);
    expect(out[0].id).toBe(1);
  });

  test('fetchProducts supports JSONL', async () => {
    const adapter = new GenericFeedAdapter({name: 'TestFeed'});
    const data = JSON.stringify({id:1}) + '\n' + JSON.stringify({id:2});
    axios.get.mockResolvedValueOnce({headers:{'content-type':'text/plain'}, data});
    const out = await adapter.fetchProducts('http://example.com/feed.jsonl');
    expect(Array.isArray(out)).toBe(true);
    expect(out.length).toBe(2);
    expect(out[1].id).toBe(2);
  });

  test('fetchProducts supports CSV', async () => {
    const adapter = new GenericFeedAdapter({name: 'TestFeed'});
    const csv = 'id,title\n1,One\n2,Two\n';
    axios.get.mockResolvedValueOnce({headers:{'content-type':'text/csv'}, data: csv});
    const out = await adapter.fetchProducts('http://example.com/feed.csv');
    expect(Array.isArray(out)).toBe(true);
    expect(out[0].id).toBe('1');
    expect(out[1].title).toBe('Two');
  });

  test('fetchProducts supports XML', async () => {
    const adapter = new GenericFeedAdapter({name: 'TestFeed'});
    const xml = '<items><item><id>1</id><title>One</title></item><item><id>2</id><title>Two</title></item></items>';
    axios.get.mockResolvedValueOnce({headers:{'content-type':'application/xml'}, data: xml});
    const out = await adapter.fetchProducts('http://example.com/feed.xml');
    expect(Array.isArray(out)).toBe(true);
    // parser may return objects with title as string
    expect(out.length).toBeGreaterThanOrEqual(1);
  });

  test('malformed feed throws descriptive error', async () => {
    const adapter = new GenericFeedAdapter({name: 'TestFeed'});
    axios.get.mockResolvedValueOnce({headers:{'content-type':'text/plain'}, data: '###not a feed###'});
    await expect(adapter.fetchProducts('http://example.com/invalid')).rejects.toThrow('Unsupported feed format');
  });
});
