/* ===== 1) الوضع الداكن: نغيّر خاصية data-theme ونحفظ الاختيار ===== */
const root = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
try { if (localStorage.getItem('theme') === 'dark') root.dataset.theme = 'dark'; } catch (e) {}
function syncIcon(){ themeBtn.textContent = root.dataset.theme === 'dark' ? '☀️' : '🌙'; }
syncIcon();
themeBtn.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  syncIcon();
});

/* ===== 2) قائمة الجوال ===== */
const menu = document.getElementById('menu');
document.getElementById('menuBtn').addEventListener('click', () => menu.classList.toggle('open'));

/* ===== 3) الكتابة المتحركة في الصفحة الرئيسية ===== */
const typing = document.getElementById('typing');
if (typing) {
  const words = ['أتعلم HTML', 'أصمم بـ CSS', 'أضيف الحياة بـ JavaScript'];
  let w = 0, c = 0, del = false;
  (function tick(){
    const word = words[w];
    typing.textContent = word.slice(0, c);
    if (!del && c < word.length) c++;
    else if (!del) { del = true; return setTimeout(tick, 1200); }
    else if (c > 0) c--;
    else { del = false; w = (w + 1) % words.length; }
    setTimeout(tick, del ? 40 : 90);
  })();
}

/* ===== 4) إظهار الأقسام وتعبئة أشرطة المهارات عند التمرير ===== */
const obs = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    en.target.querySelectorAll('[data-w]').forEach(b => b.style.width = b.dataset.w + '%');
    obs.unobserve(en.target);
  });
}, { threshold: 0.2 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

/* ===== 5) التحقق من نموذج التواصل ===== */
const form = document.getElementById('form');
if (form) {
  const rules = {
    name:  v => v.trim().length >= 2 ? '' : 'اكتبي اسمك (حرفان على الأقل).',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'اكتبي بريدا صحيحا مثل name@mail.com',
    msg:   v => v.trim().length >= 10 ? '' : 'الرسالة قصيرة، اكتبي 10 أحرف على الأقل.'
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    for (const id in rules) {
      const input = document.getElementById(id);
      const msg = rules[id](input.value);
      document.getElementById('e-' + id).textContent = msg;
      input.classList.toggle('bad', !!msg);
      if (msg) valid = false;
    }
    document.getElementById('ok').classList.toggle('show', valid);
    if (valid) form.reset();
  });
}

/* ===== 6) المتجر التجريبي: المنتجات + التصفية + السلة ===== */
const grid = document.getElementById('products');
if (grid) {
  // كل منتج كائن (Object) داخل مصفوفة (Array)؛ لإضافة منتج جديد أضيفي سطرا هنا فقط
  const products = [
    { id: 1, name: 'حقيبة يد', price: 180, cat: 'إكسسوارات', img: 'bag' },
    { id: 2, name: 'ساعة ذكية', price: 420, cat: 'إلكترونيات', img: 'watch' },
    { id: 3, name: 'سماعة لاسلكية', price: 260, cat: 'إلكترونيات', img: 'headphones' },
    { id: 4, name: 'عطر فاخر', price: 310, cat: 'إكسسوارات', img: 'perfume' },
    { id: 5, name: 'كوب حراري', price: 65, cat: 'منزل', img: 'mug' },
    { id: 6, name: 'دفتر ملاحظات', price: 40, cat: 'منزل', img: 'notebook' }
  ];
  const cart = {};            // مثال: { 2: 1, 5: 3 } يعني منتج رقم 2 مرة، ومنتج رقم 5 ثلاث مرات
  let current = 'الكل';
  const $ = id => document.getElementById(id);

  function drawFilters() {
    const cats = ['الكل', ...new Set(products.map(p => p.cat))];
    $('filters').innerHTML = '';
    cats.forEach(c => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = c;
      b.className = c === current ? 'on' : '';
      b.onclick = () => { current = c; drawFilters(); drawProducts(); };
      $('filters').appendChild(b);
    });
  }

  function drawProducts() {
    grid.innerHTML = '';
    products.filter(p => current === 'الكل' || p.cat === current).forEach(p => {
      const d = document.createElement('div');
      d.className = 'card product';
      d.innerHTML = `<img src="images/${p.img}.jpg" alt="${p.name}" onerror="this.onerror=null;this.src='images/${p.img}.svg'">
        <div class="info"><h3>${p.name}</h3><div class="price">${p.price} ر.س</div>
        <button class="btn primary" type="button">أضف للسلة</button></div>`;
      d.querySelector('button').onclick = () => { cart[p.id] = (cart[p.id] || 0) + 1; drawCart(); };
      grid.appendChild(d);
    });
  }

  function drawCart() {
    const list = $('cartList'); list.innerHTML = '';
    let total = 0, count = 0;
    products.filter(p => cart[p.id]).forEach(p => {
      const q = cart[p.id]; total += p.price * q; count += q;
      const li = document.createElement('li');
      li.innerHTML = `<span>${p.name}</span><b>${p.price * q} ر.س</b>
        <div class="qty"><button type="button" aria-label="زيادة">+</button><span>${q}</span><button type="button" aria-label="إنقاص">−</button></div>`;
      const [plus, minus] = li.querySelectorAll('button');
      plus.onclick = () => { cart[p.id]++; drawCart(); };
      minus.onclick = () => { cart[p.id]--; if (!cart[p.id]) delete cart[p.id]; drawCart(); };
      list.appendChild(li);
    });
    $('cartTotal').textContent = total + ' ر.س';
    $('cartCount').textContent = count;
    $('cartEmpty').style.display = count ? 'none' : 'block';
    $('orderOk').classList.remove('show');
  }

  $('checkout').onclick = () => {
    if (!getUser()) { $('cartEmpty').style.display = 'block'; $('cartEmpty').innerHTML = 'سجّلي الدخول أولا لإتمام الطلب: <a href="login.html">دخول</a> أو <a href="register.html">إنشاء حساب</a>'; return; }
    if (!Object.keys(cart).length) { $('cartEmpty').textContent = 'أضيفي منتجا أولا قبل إتمام الطلب.'; return; }
    Object.keys(cart).forEach(k => delete cart[k]);
    drawCart();
    $('orderOk').classList.add('show');
  };

  drawFilters(); drawProducts(); drawCart();
}


/* ===== 7) الحسابات: تسجيل / دخول / خروج (تجريبي، محفوظ في المتصفح فقط) ===== */
function getUsers(){ try { return JSON.parse(localStorage.getItem('users') || '[]'); } catch (e) { return []; } }
function getUser(){ try { return JSON.parse(localStorage.getItem('currentUser')); } catch (e) { return null; } }
// نحفظ بصمة كلمة المرور (hash) وليس الكلمة نفسها
async function hashPass(p){
  if (window.crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(p));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 5381; for (const ch of p) h = ((h << 5) + h + ch.charCodeAt(0)) | 0; return 'x' + h;
}
// الشريط العلوي: أزرار الدخول/التسجيل أو اسم المستخدم وزر الخروج
(function drawAuth(){
  const box = document.getElementById('authBox'); if (!box) return;
  const u = getUser();
  if (u) {
    box.innerHTML = '<span class="hello">أهلا، ' + u.name.replace(/[<>&"]/g, '') + '</span><button class="btn" id="logout" type="button">خروج</button>';
    document.getElementById('logout').onclick = () => { localStorage.removeItem('currentUser'); location.href = 'index.html'; };
  } else {
    box.innerHTML = '<a class="btn ghost" href="login.html">تسجيل الدخول</a><a class="btn primary" href="register.html">إنشاء حساب</a>';
  }
})();
function setErr(id, msg){ const el = document.getElementById('e-' + id); if (el) el.textContent = msg; const inp = document.getElementById(id); if (inp) inp.classList.toggle('bad', !!msg); return !msg; }
const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const registerForm = document.getElementById('registerForm');
if (registerForm) registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const pass = document.getElementById('pass').value;
  const pass2 = document.getElementById('pass2').value;
  const ok = [
    setErr('name', name.length >= 2 ? '' : 'اكتبي اسمك (حرفان على الأقل).'),
    setErr('email', emailOk(email) ? '' : 'اكتبي بريدا صحيحا مثل name@mail.com'),
    setErr('pass', pass.length >= 6 ? '' : 'كلمة المرور 6 أحرف على الأقل.'),
    setErr('pass2', pass2 === pass ? '' : 'كلمتا المرور غير متطابقتين.')
  ].every(Boolean);
  if (!ok) return;
  const users = getUsers();
  if (users.some(u => u.email === email)) { document.getElementById('e-form').textContent = 'هذا البريد مسجل من قبل. جرّبي تسجيل الدخول.'; return; }
  users.push({ name, email, pass: await hashPass(pass) });
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify({ name, email }));
  location.href = 'index.html';
});

const loginForm = document.getElementById('loginForm');
if (loginForm) loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const pass = document.getElementById('pass').value;
  const ok = [
    setErr('email', emailOk(email) ? '' : 'اكتبي بريدا صحيحا.'),
    setErr('pass', pass ? '' : 'اكتبي كلمة المرور.')
  ].every(Boolean);
  if (!ok) return;
  const hashed = await hashPass(pass);
  const user = getUsers().find(u => u.email === email && u.pass === hashed);
  if (!user) { document.getElementById('e-form').textContent = 'البريد أو كلمة المرور غير صحيحة.'; return; }
  localStorage.setItem('currentUser', JSON.stringify({ name: user.name, email: user.email }));
  location.href = 'index.html';
});
