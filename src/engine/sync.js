const { upsertProduct, upsertDeal, findProductByIds } = require('../models/models');
const { registry } = require('../registry');
const crypto = require('crypto');

function calcDiscount(originalPrice, price){
  if(!originalPrice || !price) return null;
  if(originalPrice <= 0) return null;
  return Math.round((1 - (price / originalPrice)) * 100 * 100) / 100;
}

function calcTotalPrice(price, shippingCost){
  if(price == null) return null;
  if(shippingCost == null) return price;
  return Number((Number(price) + Number(shippingCost)).toFixed(2));
}

function scoreDeal(deal){
  // Simple deterministic scoring based on completeness and discount
  let score = 0;
  if(deal.price!=null) score += 40;
  if(deal.originalPrice!=null) score += 20;
  if(deal.discountPercent!=null) score += Math.min(30, deal.discountPercent);
  if(deal.shippingCost!=null) score += 5;
  if(deal.affiliateUrl) score += 5;
  return Math.min(100, Math.round(score));
}

async function syncSource(sourceId){
  const adapter = registry.get(sourceId);
  const result = {
    sourceId,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    status: 'running',
    productsProcessed: 0,
    dealsCreated: 0,
    dealsUpdated: 0,
    errors: 0,
    log: ''
  };

  if(!adapter) {
    result.status = 'NOT_CONFIGURED';
    result.finishedAt = new Date().toISOString();
    return result;
  }

  const url = adapter.config.url;
  if(!url){
    result.status = 'NOT_CONFIGURED';
    result.finishedAt = new Date().toISOString();
    return result;
  }

  try{
    const raw = await adapter.fetchProducts(url);
    for(const item of raw){
      try{
        const product = adapter.normalizeProduct(item);
        // deduplicate
        const existing = findProductByIds({gtin:product.gtin, ean:product.ean, upc:product.upc, mpn:product.mpn, brand:product.brand, title:product.title});
        let productId;
        if(existing){
          productId = existing.id;
        }else{
          productId = crypto.randomUUID();
        }
        product.id = productId;
        // calc
        product.discountPercent = calcDiscount(product.originalPrice, product.price);
        // upsert
        upsertProduct(product);
        result.productsProcessed++;
        // deal
        const deal = {
          dealId: crypto.createHash('sha1').update(sourceId + '|' + product.sourceProductId + '|' + (product.price||'')).digest('hex'),
          productId,
          source: product.source,
          merchant: product.merchant,
          price: product.price,
          originalPrice: product.originalPrice,
          salePrice: product.salePrice,
          currency: product.currency,
          discountPercent: product.discountPercent,
          couponCode: null,
          couponValue: null,
          availability: product.availability,
          shippingCost: product.shippingCost,
          totalPrice: calcTotalPrice(product.price, product.shippingCost),
          affiliateUrl: product.affiliateUrl || product.productUrl,
          detectedAt: new Date().toISOString(),
          lastCheckedAt: new Date().toISOString(),
          dealScore: null,
          dealStatus: product.availability ? 'active' : 'unverified'
        };
        deal.dealScore = scoreDeal(deal);
        upsertDeal(deal);
        result.dealsCreated++;
      }catch(e){
        result.errors++;
        result.log += '\nItem error: ' + (e.message||String(e));
      }
    }
    result.status = 'completed';
  }catch(e){
    result.status = 'failed';
    result.log += '\nFetch error: ' + (e.message||String(e));
    result.errors++;
  }

  result.finishedAt = new Date().toISOString();
  return result;
}

module.exports = { calcDiscount, calcTotalPrice, scoreDeal, syncSource };
