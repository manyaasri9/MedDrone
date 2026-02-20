// ===== DATA =====
const medicines = [
  { id:1, name:'Ibuprofen 400mg', type:'pain', icon:'💊', color:'#ff6b6b22', desc:'Fast-acting pain and fever relief for adults. 24 tablets per pack.', price:8.99 },
  { id:2, name:'Paracetamol 500mg', type:'pain', icon:'🔴', color:'#ff4d4d22', desc:'Gentle pain relief and fever reducer. Suitable for all ages.', price:5.99 },
  { id:3, name:'Vitamin C 1000mg', type:'vitamin', icon:'🍊', color:'#ff980022', desc:'High-dose immune support. Effervescent tablets, 30 count.', price:12.49 },
  { id:4, name:'Vitamin D3 2000IU', type:'vitamin', icon:'☀️', color:'#ffd70022', desc:'Essential bone and immune health. Softgels, 60 count.', price:14.99 },
  { id:5, name:'DayQuil Cold & Flu', type:'cold', icon:'🤧', color:'#38bdf822', desc:'Non-drowsy multi-symptom cold relief. 24-hour formula.', price:11.99 },
  { id:6, name:'NyQuil Night Relief', type:'cold', icon:'🌙', color:'#6366f122', desc:'Nighttime cold & flu relief for restful sleep.', price:13.49 },
  { id:7, name:'Aspirin 81mg', type:'heart', icon:'❤️', color:'#ef444422', desc:'Daily low-dose aspirin for cardiovascular support.', price:7.49 },
  { id:8, name:'Omega-3 Fish Oil', type:'heart', icon:'🐟', color:'#0ea5e922', desc:'Premium omega-3 for heart and brain health. 90 softgels.', price:19.99 },
  { id:9, name:'Probiotics 10B CFU', type:'digestive', icon:'🦠', color:'#22c55e22', desc:'10 billion live cultures for gut health. Refrigerator-free.', price:24.99 },
  { id:10, name:'Antacid Tablets', type:'digestive', icon:'🟡', color:'#eab30822', desc:'Fast heartburn and indigestion relief. Berry flavor, 48 count.', price:6.99 },
  { id:11, name:'Zinc + Elderberry', type:'vitamin', icon:'🫐', color:'#a855f722', desc:'Immune boosting combo. Gummy format, 60 gummies.', price:16.99 },
  { id:12, name:'Melatonin 5mg', type:'cold', icon:'😴', color:'#8b5cf622', desc:'Natural sleep aid. Dissolving tablets for fast action.', price:9.49 },
];

let cart = {};
let selectedDelivery = { name: 'Express Drone', price: 4.99 };
let activeCategory = 'all';

// ===== NAV =====
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => { b.classList.remove('active'); b.classList.add('inactive'); });
  document.getElementById('page-' + page).classList.add('active');
  document.getElementById('nav-' + page).classList.remove('inactive');
  document.getElementById('nav-' + page).classList.add('active');
  if (page === 'checkout') updateCheckout();
  if (page === 'medicine') renderMeds();
  window.scrollTo(0,0);
}

// ===== SIGN IN =====
function doSignIn() {
  showPage('medicine');
  renderMeds();
}

// ===== MEDICINE =====
function renderMeds(list) {
  const grid = document.getElementById('medicineGrid');
  const data = list || medicines.filter(m => activeCategory === 'all' || m.type === activeCategory);
  grid.innerHTML = data.map(m => `
    <div class="med-card">
      <div class="med-icon" style="background:${m.color}">${m.icon}</div>
      <h3>${m.name}</h3>
      <div class="med-type">${m.type.toUpperCase()}</div>
      <div class="med-desc">${m.desc}</div>
      <div class="med-footer">
        <div class="med-price">$${m.price.toFixed(2)}</div>
        <button class="add-btn ${cart[m.id] ? 'added' : ''}" id="addbtn-${m.id}" onclick="addToCart(${m.id})">${cart[m.id] ? '✓ Added' : '+ Add'}</button>
      </div>
    </div>
  `).join('');
}

function filterCat(cat, el) {
  activeCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderMeds();
}

function filterMeds() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const filtered = medicines.filter(m => m.name.toLowerCase().includes(q) || m.type.includes(q));
  renderMeds(filtered);
}

function addToCart(id) {
  const med = medicines.find(m => m.id === id);
  cart[id] = (cart[id] || 0) + 1;
  updateCartBar();
  renderMeds();
}

function updateCartBar() {
  const count = Object.values(cart).reduce((a,b) => a+b, 0);
  const total = Object.entries(cart).reduce((sum,[id,qty]) => {
    return sum + medicines.find(m=>m.id==id).price * qty;
  }, 0);
  document.getElementById('cartCount').textContent = count;
  document.getElementById('cartTotal').textContent = '$' + total.toFixed(2);
  const bar = document.getElementById('cartBar');
  bar.classList.toggle('visible', count > 0);
}

// ===== CHECKOUT =====
function selectDelivery(el, name, price) {
  document.querySelectorAll('.delivery-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  selectedDelivery = { name, price };
  updateCheckout();
}

function updateCheckout() {
  const items = Object.entries(cart);
  const orderDiv = document.getElementById('orderItems');
  if (!items.length) { orderDiv.innerHTML = '<div style="color:var(--muted);font-size:0.9rem">No items in cart. <a style="color:var(--teal);cursor:pointer" onclick="showPage(\'medicine\')">Browse medicines</a></div>'; }
  else {
    orderDiv.innerHTML = items.map(([id,qty]) => {
      const m = medicines.find(med=>med.id==id);
      return `<div class="order-item">
        <span class="order-item-name">${m.icon} ${m.name}</span>
        <span class="order-item-qty">×${qty}</span>
        <span class="order-item-price">$${(m.price*qty).toFixed(2)}</span>
      </div>`;
    }).join('');
  }
  const subtotal = items.reduce((s,[id,q])=>s+medicines.find(m=>m.id==id).price*q, 0);
  const tax = subtotal * 0.05;
  const grand = subtotal + tax + selectedDelivery.price;
  document.getElementById('subtotalVal').textContent = '$' + subtotal.toFixed(2);
  document.getElementById('deliveryVal').textContent = '$' + selectedDelivery.price.toFixed(2);
  document.getElementById('taxVal').textContent = '$' + tax.toFixed(2);
  document.getElementById('grandTotal').textContent = '$' + grand.toFixed(2);
}

function placeOrder() {
  document.getElementById('successModal').classList.add('show');
}

function goToDrone() {
  document.getElementById('successModal').classList.remove('show');
  showPage('drone');
}

// ===== DRONE CAMERA =====
let stream = null;

async function connectCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    const video = document.getElementById('cameraVideo');
    video.srcObject = stream;
    video.style.display = 'block';
    document.getElementById('cameraPlaceholder').style.display = 'none';
    document.getElementById('cameraFeed').classList.add('camera-active');
    document.getElementById('connectBtn').style.display = 'none';
    document.getElementById('stopBtn').style.display = 'inline-flex';
    document.getElementById('snapBtn').disabled = false;
    startDroneSimulation();
  } catch(e) {
    // fallback: show simulated feed
    document.getElementById('cameraPlaceholder').innerHTML = `
      <div style="width:100%;height:100%;background:linear-gradient(135deg,#0a0f1e,#0d2030,#0a1a20);display:flex;align-items:center;justify-content:center;flex-direction:column;position:relative">
        <div style="font-size:5rem;animation:float 3s ease-in-out infinite">🏙️</div>
        <div style="font-family:Syne,sans-serif;color:var(--teal);font-size:0.9rem;margin-top:12px">Simulated Drone View — City Approach</div>
      </div>`;
    document.getElementById('cameraFeed').classList.add('camera-active');
    document.getElementById('connectBtn').style.display = 'none';
    document.getElementById('stopBtn').style.display = 'inline-flex';
    startDroneSimulation();
  }
}

function stopCamera() {
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  const video = document.getElementById('cameraVideo');
  video.style.display = 'none'; video.srcObject = null;
  document.getElementById('cameraPlaceholder').style.display = 'flex';
  document.getElementById('cameraPlaceholder').innerHTML = `<div class="drone-anim">🚁</div><h3>Drone Camera Offline</h3><p>Click "Connect Camera" to view the live drone feed from your device camera</p>`;
  document.getElementById('cameraFeed').classList.remove('camera-active');
  document.getElementById('connectBtn').style.display = 'inline-flex';
  document.getElementById('stopBtn').style.display = 'none';
  document.getElementById('snapBtn').disabled = true;
}

function takeSnapshot() {
  const video = document.getElementById('cameraVideo');
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 640; canvas.height = video.videoHeight || 480;
  canvas.getContext('2d').drawImage(video, 0, 0);
  const a = document.createElement('a');
  a.download = 'drone-snapshot.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
}

function startDroneSimulation() {
  let bat = 78, alt = 42, spd = 28, dist = 1.8;
  setInterval(() => {
    bat = Math.max(0, bat - 0.05);
    alt += (Math.random() - 0.5) * 2;
    spd += (Math.random() - 0.5) * 3;
    dist = Math.max(0, dist - 0.005);
    spd = Math.max(0, Math.min(50, spd));
    alt = Math.max(10, Math.min(100, alt));
    document.getElementById('hudBat').textContent = 'BAT: ' + bat.toFixed(0) + '%';
    document.getElementById('hudAlt').textContent = 'ALT: ' + alt.toFixed(0) + 'm';
    document.getElementById('hudSpeed').textContent = 'SPD: ' + spd.toFixed(0) + 'km/h';
    const eta = Math.max(0, (dist / (spd / 3600 * 1000)) / 60);
    document.getElementById('hudEta').textContent = 'ETA: ' + eta.toFixed(0) + 'min';
    document.getElementById('batBar').style.width = bat + '%';
    document.getElementById('altBar').style.width = (alt) + '%';
    document.getElementById('spdBar').style.width = (spd / 50 * 100) + '%';
    document.getElementById('distBar').style.width = (dist / 3 * 100) + '%';
  }, 800);
}