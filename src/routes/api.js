const express = require('express');
const router = express.Router();
const { registry } = require('../registry');
const { listDeals, getDealById, listProducts } = require('../models/models');
const { syncSource } = require('../engine/sync');

router.get('/health', (req, res) => res.json({status: 'ok'}));

router.get('/sources', (req, res) => {
  const ids = registry.list();
  const sources = ids.map(id=>({id, status: 'CONFIGURED'}));
  res.json(sources);
});

router.get('/products', (req, res) => {
  const q = req.query.q || null;
  res.json(listProducts(q));
});

router.get('/deals', (req, res) => {
  const deals = listDeals(100);
  if(!deals || deals.length===0){
    return res.json({message: 'NO_SOURCES_CONFIGURED', deals: []});
  }
  res.json(deals);
});

router.get('/deals/:id', (req, res) => {
  const id = req.params.id;
  const d = getDealById(id);
  if(!d) return res.status(404).json({error:'not_found'});
  res.json(d);
});

router.get('/search', (req, res) => {
  const q = req.query.q || '';
  res.json(listProducts(q));
});

router.get('/merchants', (req, res) => res.json([]));
router.get('/categories', (req, res) => res.json([]));

// trigger sync for a specific source (not scheduled)
router.post('/sync/:sourceId', async (req, res) => {
  const sourceId = req.params.sourceId;
  const result = await syncSource(sourceId);
  res.json(result);
});

module.exports = router;
