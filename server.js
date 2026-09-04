const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const apiRoutes = require('./src/routes/api');
const { initDb } = require('./src/db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Init DB
initDb();

app.use('/api', apiRoutes);

app.get('/health', (req, res) => res.json({status: 'ok'}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`DealFinder API running on http://localhost:${PORT}`));
