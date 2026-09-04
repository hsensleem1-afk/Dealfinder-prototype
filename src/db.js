const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

let db;

function initDb(){
  const dbFile = process.env.DATABASE_FILE || './data/dealfinder.db';
  const dir = path.dirname(dbFile);
  if(!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive:true});
  db = new Database(dbFile);
  createTables();
}

function createTables(){
  // products
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      source TEXT,
      merchant TEXT,
      title TEXT,
      description TEXT,
      brand TEXT,
      category TEXT,
      imageUrl TEXT,
      productUrl TEXT,
      affiliateUrl TEXT,
      price REAL,
      originalPrice REAL,
      salePrice REAL,
      currency TEXT,
      discountPercent REAL,
      availability TEXT,
      condition TEXT,
      gtin TEXT,
      ean TEXT,
      upc TEXT,
      mpn TEXT,
      sku TEXT,
      country TEXT,
      language TEXT,
      shippingCost REAL,
      shippingCountries TEXT,
      lastUpdated TEXT,
      sourceProductId TEXT
    );
  `);

  // deals
  db.exec(`
    CREATE TABLE IF NOT EXISTS deals (
      dealId TEXT PRIMARY KEY,
      productId TEXT,
      source TEXT,
      merchant TEXT,
      price REAL,
      originalPrice REAL,
      salePrice REAL,
      currency TEXT,
      discountPercent REAL,
      couponCode TEXT,
      couponValue REAL,
      availability TEXT,
      shippingCost REAL,
      totalPrice REAL,
      affiliateUrl TEXT,
      detectedAt TEXT,
      lastCheckedAt TEXT,
      dealScore REAL,
      dealStatus TEXT
    );
  `);

  // sources
  db.exec(`
    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      name TEXT,
      type TEXT,
      config TEXT,
      status TEXT
    );
  `);

  // sync_runs
  db.exec(`
    CREATE TABLE IF NOT EXISTS sync_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sourceId TEXT,
      startedAt TEXT,
      finishedAt TEXT,
      status TEXT,
      productsProcessed INTEGER,
      dealsCreated INTEGER,
      dealsUpdated INTEGER,
      errors INTEGER,
      log TEXT
    );
  `);
}

function getDb(){
  if(!db) initDb();
  return db;
}

module.exports = { initDb, getDb };
