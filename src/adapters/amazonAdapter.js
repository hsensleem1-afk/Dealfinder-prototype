const SourceAdapter = require('./sourceAdapter');

class AmazonAdapter extends SourceAdapter{
  constructor(config){
    super(config);
    this.type = 'amazon';
    this.name = config.name || 'Amazon';
  }
  isConfigured(){
    return !!(this.config && (this.config.accessKey || this.config.apiKey || this.config.url));
  }
  async authenticate(){ if(!this.isConfigured()) return { status: 'NOT_CONFIGURED' }; throw new Error('Not implemented'); }
  async testConnection(){ if(!this.isConfigured()) return { status: 'NOT_CONFIGURED' }; return { ok:false, error:'Not implemented' }; }
  async discoverSources(){ if(!this.isConfigured()) return { status: 'NOT_CONFIGURED' }; return []; }
  async fetchProducts(){ if(!this.isConfigured()) return { status: 'NOT_CONFIGURED' }; return []; }
  normalizeProduct(raw){ return null; }
  normalizeDeal(raw){ return null; }
  buildAffiliateLink(productId){ return null; }
}

module.exports = AmazonAdapter;
