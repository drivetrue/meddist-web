const express = require('express');
const { initDb, all, run, rowsToObjects } = require('./db');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/api/products', async (req, res) => {
  try {
    const rows = await all('SELECT id, sku, name, category, price, stock FROM products');
    res.json(rowsToObjects(rows));
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const {sku, name, category, price, stock} = req.body;
    run(
      'INSERT INTO products (sku, name, category, price, stock) VALUES (?, ?, ?, ?, ?)',
      [sku, name, category || 'Umum', price, stock],
    );
    res.json({message: 'Produk ditambahkan', sku});
  } catch (err) {
    res.status(400).json({error: err.message});
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const {sku, name, category, price, stock} = req.body;
    run(
      'UPDATE products SET sku=?, name=?, category=?, price=?, stock=? WHERE id=?',
      [sku, name, category || 'Umum', price, stock, req.params.id],
    );
    res.json({message: 'Produk diperbarui', sku});
  } catch (err) {
    res.status(400).json({error: err.message});
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    run('DELETE FROM products WHERE id=?', [req.params.id]);
    res.json({message: 'Produk dihapus'});
  } catch (err) {
    res.status(400).json({error: err.message});
  }
});

app.use((req, res) => res.status(404).send('Not found'));

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`MedDist API running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB init failed:', err);
    process.exit(1);
  });

module.exports = app;