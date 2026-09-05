const GenericFeedAdapter = require('./adapters/genericFeedAdapter');
const AwinAdapter = require('./adapters/awinAdapter');
const EbayAdapter = require('./adapters/ebayAdapter');
const AmazonAdapter = require('./adapters/amazonAdapter');
const CJAdapter = require('./adapters/cjAdapter');
const ImpactAdapter = require('./adapters/impactAdapter');
const RakutenAdapter = require('./adapters/rakutenAdapter');
const PartnerizeAdapter = require('./adapters/partnerizeAdapter');

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

// Register integration-ready affiliate adapter scaffolds. They will report NOT_CONFIGURED until env vars are provided.
registry.register('awin:default', new AwinAdapter({}));
registry.register('ebay:default', new EbayAdapter({}));
registry.register('amazon:default', new AmazonAdapter({}));
registry.register('cj:default', new CJAdapter({}));
registry.register('impact:default', new ImpactAdapter({}));
registry.register('rakuten:default', new RakutenAdapter({}));
registry.register('partnerize:default', new PartnerizeAdapter({}));

module.exports = { registry, GenericFeedAdapter };
