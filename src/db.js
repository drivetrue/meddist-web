const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let SQL = null;
let db = null;

const DB_PATH = path.resolve(
  process.env.DATABASE_PATH || './data/app.sqlite'
);

function persist() {
  const data = db.export();
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function initDb() {
  if (db) return db;
  SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      sku        TEXT    NOT NULL UNIQUE,
      name       TEXT    NOT NULL,
      category   TEXT    NOT NULL DEFAULT 'Umum',
      price      REAL    NOT NULL DEFAULT 0,
      stock      INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const count = db.exec('SELECT COUNT(*) AS c FROM products')[0];
  if (count && count.values[0][0] === 0) {
    seed();
  }
  persist();
  return db;
}

function seed() {
  const items = [
    ['MED-001', 'Tensimeter Digital', 'Diagnostik', 450000, 25],
    ['MED-002', 'Oximeter Fingertip', 'Diagnostik', 180000, 60],
    ['MED-003', 'Termometer Infrared', 'Diagnostik', 220000, 40],
    ['MED-004', 'Nebulizer Portable', 'Terapi', 675000, 12],
    ['MED-005', 'Kursi Roda Standar', 'Mobilitas', 1250000, 8],
  ];
  const stmt = db.prepare(
    'INSERT INTO products (sku, name, category, price, stock) VALUES (?, ?, ?, ?, ?)'
  );
  for (const it of items) stmt.run(it);
  stmt.free();
}

function rowsToObjects(res) {
  if (!res || !res.length) return [];
  const { columns, values } = res[0];
  return values.map((row) => {
    const obj = {};
    columns.forEach((c, i) => (obj[c] = row[i]));
    return obj;
  });
}

function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const out = [];
  while (stmt.step()) out.push(stmt.getAsObject());
  stmt.free();
  return out;
}

function run(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.run(params);
  stmt.free();
  persist();
  return db.getRowsModified();
}

module.exports = { initDb, all, run, rowsToObjects, persist };
