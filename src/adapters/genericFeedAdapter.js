const SourceAdapter = require('./sourceAdapter');
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const { parse } = require('csv-parse/sync');

class GenericFeedAdapter extends SourceAdapter{
  constructor(config){
    super(config);
    this.type = 'generic_feed';
    this.name = config.name || 'GenericFeed';
  }

  async testConnection(url){
    try{
      const r = await axios.head(url, {timeout:5000});
      return {ok:true, status:r.status};
    }catch(e){
      return {ok:false, error: e.message};
    }
  }

  async fetchProducts(url){
    // supports JSON, JSONL, CSV, XML
    const r = await axios.get(url, {responseType: 'text', timeout: 15000});
    const ct = r.headers['content-type'] || '';
    const text = r.data;
    // json
    if(ct.includes('application/json') || url.endsWith('.json')){
      try{ const j = JSON.parse(text); return Array.isArray(j)? j : [j]; }catch(e){}
    }
    // jsonl
    if(text.trim().startsWith('{') && text.indexOf('\n')>0 && text.includes('\n')){
      const lines = text.split(/\r?\n/).filter(l=>l.trim());
      try{ return lines.map(l=>JSON.parse(l)); }catch(e){}
    }
    // csv
    if(ct.includes('text/csv') || url.endsWith('.csv')){
      const records = parse(text, {columns:true, skip_empty_lines:true});
      return records;
    }
    // xml
    if(ct.includes('xml') || text.trim().startsWith('<')){
      const p = new XMLParser({ignoreAttributes:false});
      const json = p.parse(text);
      // try to find arrays under common tags
      // naive: descend to find first array
      function findArray(obj){
        if(Array.isArray(obj)) return obj;
        if(typeof obj !== 'object' || obj === null) return null;
        for(const k of Object.keys(obj)){
          const res = findArray(obj[k]);
          if(res) return res;
        }
        return null;
      }
      const arr = findArray(json);
      if(arr) return arr;
      // fallback wrap
      return [json];
    }
    // fallback try parse json
    try{ const j = JSON.parse(text); return Array.isArray(j)? j : [j]; }catch(e){
      throw new Error('Unsupported feed format');
    }
  }

  normalizeProduct(raw){
    // map common fields conservatively; missing fields -> null
    return {
      id: raw.id ? String(raw.id) : null,
      source: this.name,
      merchant: raw.merchant || raw.store || null,
      title: raw.title || raw.name || null,
      description: raw.description || raw.desc || null,
      brand: raw.brand || null,
      category: raw.category || raw.categories || null,
      imageUrl: raw.image || raw.imageUrl || raw.picture || null,
      productUrl: raw.url || raw.productUrl || null,
      affiliateUrl: raw.affiliateUrl || null,
      price: raw.price ? Number(raw.price) : (raw.current_price?Number(raw.current_price):null),
      originalPrice: raw.original_price ? Number(raw.original_price) : (raw.list_price?Number(raw.list_price):null),
      salePrice: raw.sale_price ? Number(raw.sale_price) : null,
      currency: raw.currency || null,
      discountPercent: null,
      availability: raw.availability || raw.stock || null,
      condition: raw.condition || null,
      gtin: raw.gtin || null,
      ean: raw.ean || null,
      upc: raw.upc || null,
      mpn: raw.mpn || raw.model || null,
      sku: raw.sku || null,
      country: raw.country || null,
      language: raw.language || null,
      shippingCost: raw.shipping_cost?Number(raw.shipping_cost):(raw.shipping?Number(raw.shipping):null),
      shippingCountries: raw.shipping_countries || null,
      lastUpdated: raw.updated_at || raw.last_updated || null,
      sourceProductId: raw.id ? String(raw.id) : null
    };
  }
}

module.exports = GenericFeedAdapter;
