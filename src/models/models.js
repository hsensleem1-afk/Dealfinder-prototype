// Minimal models wrapping SQL for products and deals
const { getDb } = require('../db');
const crypto = require('crypto');

function upsertProduct(product){
  const db = getDb();
  const stmt = db.prepare(`INSERT OR REPLACE INTO products (
    id, source, merchant, title, description, brand, category, imageUrl, productUrl, affiliateUrl,
    price, originalPrice, salePrice, currency, discountPercent, availability, condition, gtin, ean, upc,
    mpn, sku, country, language, shippingCost, shippingCountries, lastUpdated, sourceProductId
  ) VALUES (
    @id, @source, @merchant, @title, @description, @brand, @category, @imageUrl, @productUrl, @affiliateUrl,
    @price, @originalPrice, @salePrice, @currency, @discountPercent, @availability, @condition, @gtin, @ean, @upc,
    @mpn, @sku, @country, @language, @shippingCost, @shippingCountries, @lastUpdated, @sourceProductId
  )`);
  stmt.run(product);
}

function upsertDeal(deal){
  const db = getDb();
  const stmt = db.prepare(`INSERT OR REPLACE INTO deals (
    dealId, productId, source, merchant, price, originalPrice, salePrice, currency, discountPercent,
    couponCode, couponValue, availability, shippingCost, totalPrice, affiliateUrl, detectedAt, lastCheckedAt, dealScore, dealStatus
  ) VALUES (
    @dealId, @productId, @source, @merchant, @price, @originalPrice, @salePrice, @currency, @discountPercent,
    @couponCode, @couponValue, @availability, @shippingCost, @totalPrice, @affiliateUrl, @detectedAt, @lastCheckedAt, @dealScore, @dealStatus
  )`);
  stmt.run(deal);
}

function findProductByIds({gtin, ean, upc, mpn, brand, title}){
  const db = getDb();
  if(gtin){
    const r = db.prepare('SELECT * FROM products WHERE gtin = ?').get(gtin);
    if(r) return r;
  }
  if(ean){
    const r = db.prepare('SELECT * FROM products WHERE ean = ?').get(ean);
    if(r) return r;
  }
  if(upc){
    const r = db.prepare('SELECT * FROM products WHERE upc = ?').get(upc);
    if(r) return r;
  }
  if(mpn){
    const r = db.prepare('SELECT * FROM products WHERE mpn = ?').get(mpn);
    if(r) return r;
  }
  if(brand && title){
    const r = db.prepare('SELECT * FROM products WHERE brand = ? AND title LIKE ?').get(brand, `%${title}%`);
    if(r) return r;
  }
  if(title){
    const r = db.prepare('SELECT * FROM products WHERE title LIKE ?').get(`%${title}%`);
    if(r) return r;
  }
  return null;
}

function listDeals(limit = 50){
  const db = getDb();
  return db.prepare('SELECT * FROM deals ORDER BY detectedAt DESC LIMIT ?').all(limit);
}

function getDealById(id){
  const db = getDb();
  return db.prepare('SELECT * FROM deals WHERE dealId = ?').get(id);
}

function listProducts(q){
  const db = getDb();
  if(!q) return db.prepare('SELECT * FROM products LIMIT 100').all();
  const like = `%${q}%`;
  return db.prepare(`SELECT * FROM products WHERE (
    title LIKE @q OR description LIKE @q OR brand LIKE @q OR category LIKE @q OR merchant LIKE @q OR gtin LIKE @q OR ean LIKE @q OR upc LIKE @q OR mpn LIKE @q
  ) LIMIT 200`).all({q: like});
}

module.exports = { upsertProduct, upsertDeal, findProductByIds, listDeals, getDealById, listProducts };
