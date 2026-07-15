const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'luxe_secret_key_2026_premium';

app.use(cors());
app.use(express.json());

// ─── In-Memory Database ───
let users = [];
let orders = [];
let contacts = [];

const products = [
  { id:1, name:'Sonic Pro Wireless', category:'Electronics', price:249, emoji:'🎧', rating:5, reviews:128, badge:'best', desc:'Premium noise-cancelling headphones with 40-hour battery life, spatial audio, and memory foam ear cushions.', stock:45, color:'Matte Black', material:'Aluminum / Leather' },
  { id:2, name:'Chrono Elite', category:'Accessories', price:399, emoji:'⌚', rating:5, reviews:89, badge:'new', desc:'Smart luxury timepiece with sapphire crystal display, heart-rate monitoring, and 14-day battery life.', stock:28, color:'Silver Titanium', material:'Titanium / Sapphire' },
  { id:3, name:'Velocity Runners', category:'Shoes', price:189, emoji:'👟', rating:5, reviews:215, badge:'best', desc:'Carbon-fiber performance sneakers with responsive cushioning and breathable knit upper.', stock:62, color:'Onyx Black', material:'Knit / Carbon Fiber' },
  { id:4, name:'Aura Diffuser', category:'Home', price:79, was:99, emoji:'💨', rating:4, reviews:56, badge:'sale', desc:'Ultrasonic aromatherapy diffuser with ambient LED lighting and 12-hour continuous mist.', stock:110, color:'Frost White', material:'Ceramic / Glass' },
  { id:5, name:'PixelCanvas 4K', category:'Electronics', price:599, emoji:'🖥️', rating:5, reviews:67, badge:'new', desc:'32" 4K OLED monitor with 144Hz refresh rate, HDR1000, and USB-C hub.', stock:15, color:'Space Gray', material:'Aluminum / Glass' },
  { id:6, name:'Nomad Backpack', category:'Accessories', price:149, emoji:'🎒', rating:4, reviews:143, badge:'', desc:'Minimalist waxed canvas backpack with RFID pocket and padded laptop compartment.', stock:88, color:'Tan', material:'Waxed Canvas / Leather' },
  { id:7, name:'Artisan Coffee Kit', category:'Home', price:59, emoji:'☕', rating:4, reviews:234, badge:'', desc:'Complete pour-over kit with ceramic carafe, dripper, filters, and specialty coffee sampler.', stock:200, color:'Natural', material:'Borocilicate Glass / Wood' },
  { id:8, name:'Orchid Perfume', category:'Beauty', price:129, emoji:'🌸', rating:5, reviews:98, badge:'new', desc:'Eau de parfum with top notes of bergamot, orchid heart, and vanilla base. 50ml.', stock:55, color:'-', material:'Glass Bottle' },
  { id:9, name:'Terra Planter Set', category:'Home', price:45, emoji:'🪴', rating:4, reviews:167, badge:'', desc:'Set of 3 matte ceramic planters with bamboo trays. Perfect for succulents and small plants.', stock:130, color:'Earth Tones', material:'Ceramic / Bamboo' },
  { id:10, name:'Lunar Desk Lamp', category:'Electronics', price:169, was:199, emoji:'💡', rating:5, reviews:72, badge:'sale', desc:'Adjustable LED desk lamp with wireless charging base, multiple color temps, and touch dimmer.', stock:40, color:'Moon White', material:'Aluminum / ABS' },
  { id:11, name:'Glide Yoga Mat', category:'Fitness', price:89, emoji:'🧘', rating:4, reviews:312, badge:'best', desc:'Extra-thick eco-friendly yoga mat with alignment lines and carrying strap. 6mm thick.', stock:175, color:'Deep Indigo', material:'Natural Tree Rubber / PU' },
  { id:12, name:'Ember Jacket', category:'Clothing', price:279, was:349, emoji:'🧥', rating:5, reviews:48, badge:'sale', desc:'Insulated waterproof jacket with recycled materials and hidden pocket system. 800 fill power.', stock:33, color:'Charcoal', material:'Recycled Polyester / Down' },
  { id:13, name:'SoloBrew', category:'Home', price:34, emoji:'🍵', rating:4, reviews:198, badge:'', desc:'Single-serve French press with double-wall vacuum insulation. Makes the perfect cup every time.', stock:250, color:'Matte Black', material:'Stainless Steel / Glass' },
  { id:14, name:'Vibe Wireless Earbuds', category:'Electronics', price:179, emoji:'🎵', rating:5, reviews:156, badge:'new', desc:'True wireless earbuds with adaptive ANC, 8hr battery, IPX5, and spatial audio.', stock:90, color:'Pearl White', material:'Silicone / ABS' },
  { id:15, name:'Stratos Watch Band', category:'Accessories', price:49, emoji:'📿', rating:4, reviews:87, badge:'', desc:'Premium Milanese loop band for Apple Watch. Magnetic closure, adjustable fit. 38-45mm.', stock:300, color:'Silver / Space Black', material:'Stainless Steel' },
  { id:16, name:'Cascade Water Bottle', category:'Fitness', price:39, emoji:'💧', rating:4, reviews:423, badge:'', desc:'Triple-insulated 32oz bottle with temp display. Cold 24hr, hot 12hr. BPA-free.', stock:500, color:'Ocean Blue', material:'Stainless Steel / Tritan' },
];

// ─── Auth Middleware ───
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

// ─── Products API ───
app.get('/api/products', (req, res) => {
  const { category, search, minPrice, maxPrice, sort } = req.query;
  let result = [...products];
  if (category && category !== 'all') result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));
  if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
  if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));
  if (sort === 'price_asc') result.sort((a, b) => a.price - b.price);
  if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
  if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
  if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
  res.json({ products: result, total: result.length });
});

app.get('/api/products/:id', (req, res) => {
  const p = products.find(x => x.id === Number(req.params.id));
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(p);
});

// ─── Auth API ───
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  if (users.find(u => u.email === email)) return res.status(409).json({ error: 'Email already registered' });
  const hash = await bcrypt.hash(password, 10);
  const user = { id: uuidv4(), name, email, password: hash, createdAt: new Date().toISOString() };
  users.push(user);
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt });
});

// ─── Orders API ───
app.get('/api/orders', auth, (req, res) => {
  const userOrders = orders.filter(o => o.userId === req.user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(userOrders);
});

app.post('/api/orders', auth, (req, res) => {
  const { items, shipping, payment } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'Cart is empty' });
  if (!shipping || !payment) return res.status(400).json({ error: 'Shipping and payment required' });
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const order = {
    id: uuidv4().slice(0, 8).toUpperCase(),
    userId: req.user.id,
    items, shipping, payment: { method: payment.method, last4: payment.last4 || '4242' },
    total, status: 'confirmed', createdAt: new Date().toISOString()
  };
  orders.push(order);
  res.json(order);
});

// ─── Contact API ───
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Name, email, and message required' });
  const entry = { id: uuidv4(), name, email, subject, message, createdAt: new Date().toISOString() };
  contacts.push(entry);
  res.json({ success: true, message: 'Message received. We\'ll be in touch soon.' });
});

// ─── Admin Stats (for dashboard display) ───
app.get('/api/admin/stats', auth, (req, res) => {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalUsers = users.length;
  const lowStock = products.filter(p => p.stock < 30).length;
  res.json({ totalOrders, totalRevenue, totalUsers, lowStock, productsCount: products.length });
});

app.listen(PORT, () => {
  console.log(`LUXE API running on http://localhost:${PORT}`);
});
