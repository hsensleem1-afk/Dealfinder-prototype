const GenericFeedAdapter = require('./adapters/genericFeedAdapter');

class SourceRegistry{
  constructor(){
    this.adapters = new Map();
  }
  register(id, adapter){
    this.adapters.set(id, adapter);
  }
  get(id){
    return this.adapters.get(id);
  }
  list(){
    return Array.from(this.adapters.keys());
  }
}

const registry = new SourceRegistry();

// bootstrap with GenericFeedAdapter instances configured from env
const feedUrls = (process.env.FEED_URLS || '').split(',').map(s=>s.trim()).filter(Boolean);
feedUrls.forEach((url, idx)=>{
  const id = `feed:${idx}`;
  registry.register(id, new GenericFeedAdapter({name: `GenericFeed-${idx}`, url}));
});

module.exports = { registry, GenericFeedAdapter };
