import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const dbPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'tienda.db');
const db = new DatabaseSync(dbPath);
const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(projectDir, 'dist');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS cart_items (
    cart_id TEXT NOT NULL,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (cart_id, product_id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

// Precios en centavos de USD. La imagen se resuelve al leer (ver withImage).
const seed = [
  ['Harina P.A.N. 1 kg', 'Despensa', 250, 'La harina de maíz precocida para arepas, empanadas y hallacas. Un clásico en toda mesa venezolana.', 100],
  ['Café Arauca 200 g', 'Despensa', 600, 'Café tostado y molido gourmet de Venezuela, de sabor intenso y aroma inconfundible.', 60],
  ['Queso de mano 500 g', 'Despensa', 650, 'Queso blanco fresco y suave, ideal para arepas y cachapas.', 25],
  ['Papelón Montalban 500 g', 'Despensa', 250, 'Papelón natural granulado, ideal para la limonada con papelón o el guarapo.', 40],
  ['Ron Santa Teresa Gran Reserva 1 L', 'Bebidas', 3000, 'Ron añejo venezolano de la casa fundada en 1796, de 40% de alcohol.', 10],
  ['Maltín Polar botella', 'Bebidas', 150, 'Bebida de malta sin alcohol, refrescante y nutritiva.', 50],
  ['Chocolate El Rey 70% cacao', 'Dulces', 450, 'Chocolate negro hecho con cacao fino venezolano.', 35],
  ['Cacao de Chuao 250 g', 'Dulces', 1200, 'Cacao en polvo de la región de Chuao, famoso por su calidad mundial.', 0],
  ['Galleta Cocosette 50 g', 'Dulces', 120, 'Galleta rellena de crema con coco, la golosina de la infancia.', 45],
  ['Hamaca artesanal wayuu', 'Artesanías', 8500, 'Hamaca tejida a mano por artesanas wayuu, con colores vivos.', 6],
  ['Mochila wayuu', 'Artesanías', 4500, 'Mochila tejida a crochet con diseños tradicionales wayuu.', 14],
  ['Cuatro venezolano', 'Artesanías', 6500, 'El instrumento nacional de Venezuela, de cuatro cuerdas y madera de cedro.', 8]
];
if (db.prepare('SELECT COUNT(*) AS n FROM products').get().n === 0) {
  const ins = db.prepare("INSERT INTO products (name, category, price, image, description, stock) VALUES (?, ?, ?, '', ?, ?)");
  for (const [name, cat, price, desc, stock] of seed) ins.run(name, cat, price, desc, stock);
}

const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
};
const verifyPassword = (password, stored) => {
  const [salt, hash] = stored.split(':');
  const a = Buffer.from(hash, 'hex');
  const b = scryptSync(password, salt, 64);
  return a.length === b.length && timingSafeEqual(a, b);
};
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });
const newSession = (userId) => {
  const token = randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, userId);
  return token;
};
const userFromToken = (req) => {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  if (!token) return null;
  return db.prepare('SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?').get(token) ?? null;
};

const app = express();
app.use(express.json());

app.post('/api/auth/register', (req, res) => {
  const name = String(req.body.name ?? '').trim();
  const email = String(req.body.email ?? '').trim().toLowerCase();
  const password = String(req.body.password ?? '');
  if (name.length < 2) return res.status(400).json({ error: 'Ingresá tu nombre' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Email inválido' });
  if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
  }
  const { lastInsertRowid } = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name, email, hashPassword(password));
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(lastInsertRowid);
  res.status(201).json({ token: newSession(user.id), user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const email = String(req.body.email ?? '').trim().toLowerCase();
  const password = String(req.body.password ?? '');
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Email o contraseña incorrectos' });
  }
  res.json({ token: newSession(user.id), user: publicUser(user) });
});

app.get('/api/auth/me', (req, res) => {
  const user = userFromToken(req);
  if (!user) return res.status(401).json({ error: 'No autenticado' });
  res.json({ user: publicUser(user) });
});

app.post('/api/auth/logout', (req, res) => {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  res.json({ ok: true });
});

const imagesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');
const slugify = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const placeholder = (name) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450"><rect width="600" height="450" fill="#e5e7eb"/><text x="300" y="235" font-family="sans-serif" font-size="30" fill="#6b7280" text-anchor="middle">${escapeXml(name)}</text></svg>`
  );

// Usa public/images/<slug-del-nombre>.<ext> si existe; si no, un cuadro gris con el nombre
const withImage = (p) => {
  if (!p) return p;
  const slug = slugify(p.name);
  for (const ext of ['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg']) {
    if (existsSync(path.join(imagesDir, `${slug}.${ext}`))) return { ...p, image: `/images/${slug}.${ext}` };
  }
  return { ...p, image: placeholder(p.name) };
};

const getProduct = (id) => withImage(db.prepare('SELECT * FROM products WHERE id = ?').get(id));
const cartItems = (cartId) =>
  db.prepare(`
    SELECT p.id AS productId, p.name, p.price, p.image, p.stock, ci.quantity
    FROM cart_items ci JOIN products p ON p.id = ci.product_id
    WHERE ci.cart_id = ? ORDER BY p.name
  `).all(cartId).map((i) => ({ ...i, image: withImage({ name: i.name, image: i.image }).image }));

app.get('/api/products', (_req, res) => {
  res.json(db.prepare('SELECT * FROM products ORDER BY id').all().map(withImage));
});

app.get('/api/products/:id', (req, res) => {
  const p = getProduct(Number(req.params.id));
  if (!p) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(p);
});

const validCart = (req, res, next) => {
  if (!/^[\w-]{8,64}$/.test(req.params.cartId)) return res.status(400).json({ error: 'Carrito inválido' });
  next();
};

app.get('/api/cart/:cartId', validCart, (req, res) => res.json(cartItems(req.params.cartId)));

// Fija la cantidad de un producto en el carrito (0 lo elimina), validando stock
const setQuantity = (cartId, productId, quantity) => {
  const product = getProduct(productId);
  if (!product) return { status: 404, error: 'Producto no encontrado' };
  if (!Number.isInteger(quantity) || quantity < 0) return { status: 400, error: 'Cantidad inválida' };
  if (quantity > product.stock) return { status: 409, error: `Stock insuficiente (disponible: ${product.stock})` };
  if (quantity === 0) {
    db.prepare('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?').run(cartId, productId);
  } else {
    db.prepare(`
      INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)
      ON CONFLICT(cart_id, product_id) DO UPDATE SET quantity = excluded.quantity
    `).run(cartId, productId, quantity);
  }
  return null;
};

app.post('/api/cart/:cartId/items', validCart, (req, res) => {
  const { cartId } = req.params;
  const productId = Number(req.body.productId);
  const add = Number(req.body.quantity ?? 1);
  const current = db.prepare('SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?').get(cartId, productId);
  const err = setQuantity(cartId, productId, (current?.quantity ?? 0) + add);
  if (err) return res.status(err.status).json({ error: err.error });
  res.json(cartItems(cartId));
});

app.put('/api/cart/:cartId/items/:productId', validCart, (req, res) => {
  const err = setQuantity(req.params.cartId, Number(req.params.productId), Number(req.body.quantity));
  if (err) return res.status(err.status).json({ error: err.error });
  res.json(cartItems(req.params.cartId));
});

app.delete('/api/cart/:cartId/items/:productId', validCart, (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?').run(req.params.cartId, Number(req.params.productId));
  res.json(cartItems(req.params.cartId));
});

app.use(express.static(distDir));
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
  const indexFile = path.join(distDir, 'index.html');
  if (!existsSync(indexFile)) return next();
  res.sendFile(indexFile, (err) => {
    if (err) next(err);
  });
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => console.log(`Servidor en http://localhost:${port}`));
