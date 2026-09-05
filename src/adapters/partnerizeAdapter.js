const SourceAdapter = require('./sourceAdapter');

class PartnerizeAdapter extends SourceAdapter{
  constructor(config){
    super(config);
    this.type = 'partnerize';
    this.name = config.name || 'Partnerize';
  }
  isConfigured(){
    return !!(this.config && (this.config.apiKey || this.config.clientId || this.config.url));
  }
  async authenticate(){ if(!this.isConfigured()) return { status: 'NOT_CONFIGURED' }; throw new Error('Not implemented'); }
  async testConnection(){ if(!this.isConfigured()) return { status: 'NOT_CONFIGURED' }; return { ok:false, error:'Not implemented' }; }
  async discoverSources(){ if(!this.isConfigured()) return { status: 'NOT_CONFIGURED' }; return []; }
  async fetchProducts(){ if(!this.isConfigured()) return { status: 'NOT_CONFIGURED' }; return []; }
  normalizeProduct(raw){ return null; }
  normalizeDeal(raw){ return null; }
  buildAffiliateLink(productId){ return null; }
}

module.exports = PartnerizeAdapter;
