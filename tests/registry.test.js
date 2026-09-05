describe('SourceRegistry bootstrapping', () => {
  beforeEach(() => {
    jest.resetModules();
  });
  test('bootstraps from FEED_URLS env', () => {
    process.env.FEED_URLS = 'http://a.example/feed.json,http://b.example/feed.csv';
    const { registry } = require('../src/registry');
    const list = registry.list();
    expect(list.length).toBe(2);
    const adapter = registry.get('feed:0');
    expect(adapter).toBeDefined();
    expect(adapter.config.url).toBe('http://a.example/feed.json');
  });
});
