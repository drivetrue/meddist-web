# MedDist — Inventory Web App

Web inventory management untuk distributor alat kesehatan. Node.js + Express + SQLite (sql.js).

## Fitur
- CRUD produk (SKU, nama, kategori, harga, stok)
- Database SQLite lokal (sql.js, tanpa native compile)
- Dashboard HTML sederhana + REST API
- Environment config via `.env`

## Menjalankan

```bash
cp .env.example .env
npm install
npm start          # atau: npm run dev
```

Buka http://localhost:3000

## Struktur
```
src/server.js   # Express app + API routes
src/db.js       # sql.js init + query helpers
public/index.html  # Frontend single page
data/app.sqlite # Database (di-generate saat start, tidak di-commit)
```

## API

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /api/products | List semua produk |
| POST | /api/products | Tambah produk |
| PUT | /api/products/:id | Update produk |
| DELETE | /api/products/:id | Hapus produk |

## Secrets
JANGAN commit `.env`. Sediakan hanya `.env.example`.
