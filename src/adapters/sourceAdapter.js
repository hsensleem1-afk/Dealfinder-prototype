class SourceAdapter {
  constructor(config){
    this.config = config || {};
  }
  async authenticate(){ throw new Error('Not implemented') }
  async testConnection(){ throw new Error('Not implemented') }
  async discoverSources(){ throw new Error('Not implemented') }
  async fetchProducts(){ throw new Error('Not implemented') }
  async fetchDeals(){ throw new Error('Not implemented') }
  normalizeProduct(raw){ throw new Error('Not implemented') }
  normalizeDeal(raw){ throw new Error('Not implemented') }
  buildAffiliateLink(productId){ throw new Error('Not implemented') }
}

module.exports = SourceAdapter;
