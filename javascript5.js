// ============================================================
//  javascript5.js  —  Makina me Qera  |  v3 FINAL
//  Firebase project: makina-me-qera-8cec2
// ============================================================

import { initializeApp }              from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs,
         deleteDoc, doc, updateDoc, serverTimestamp,
         query, orderBy, where }
                                       from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged }
                                       from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage, ref as sRef,
         uploadBytesResumable, getDownloadURL }
                                       from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// ─────────────────────────────────────────────────────────────
//  1.  FIREBASE CONFIG
//      ⚠️  Zëvendëso apiKey dhe appId me vlerat reale
//      nga Firebase Console > Project Settings > Web App
// ─────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyDWWm5Io79yKkruWflnur0psqGo5JhCvlk",  // ← NGA CONSOLE
  authDomain:        "makina-me-qera-8cec2.firebaseapp.com",
  projectId:         "makina-me-qera-8cec2",
  storageBucket:     "makina-me-qera-8cec2.firebasestorage.app",
  messagingSenderId: "734985518754",
  appId:             "1:734985518754:web:d095914cae047cd355e1fb"  // ← NGA CONSOLE
};

const app     = initializeApp(firebaseConfig);
const db      = getFirestore(app);
const auth    = getAuth(app);
const storage = getStorage(app);

// ─────────────────────────────────────────────────────────────
//  2.  BILINGUAL STRINGS  (AL / EN)
// ─────────────────────────────────────────────────────────────
const STRINGS = {
  al: {
    loading:        "⌛ Duke ngarkuar makinat, ju lutem prisni...",
    loadError:      "❌ Gabim gjatë ngarkimit të makinave.",
    noCars:         "Nuk ka makina ende.",
    noResults:      "Asnjë makinë nuk u gjet për",
    carsWord:       "makina",
    reserveBtn:     "🚗 Rezervo Tani",
    deleteBtn:      "🗑️ Fshi",
    totalLabel:     "Totali:",
    daysLabel:      "Ditë:",
    confirmBtn:     "✅ Konfirmo Rezervimin",
    sendingBtn:     "⏳ Duke dërguar...",
    sentBtn:        "✅ Rezervimi u dërgua!",
    toastReserved:  (c) => `✅ Rezervuar! Kodi: ${c}`,
    toastCopied:    "🔗 Linku u kopjua!",
    toastDeleted:   "🗑️ Makina u fshi!",
    toastAdded:     (n) => `✅ Makina "${n}" u shtua!`,
    toastFillAll:   "⚠️ Plotëso të gjitha fushat!",
    toastBadDates:  "⚠️ Datat nuk janë të vlefshme!",
    toastUploadErr: "❌ Gabim gjatë ngarkimit!",
    toastSaveErr:   "❌ Gabim dërgimi. Provo përsëri.",
    toastUnauth:    "❌ Nuk jeni i autorizuar!",
    toastDelErr:    "❌ Gabim gjatë fshirjes!",
    confirmDelete:  "Jeni i sigurt që doni të fshini këtë makinë?",
    uploading:      (p) => `Duke ngarkuar: ${p}%`,
    perDay:         "/ ditë",
    codeLabel:      "Kodi juaj i Konfirmimit",
    codeSub:        "Ruaje këtë kod për të ndjekur rezervimin tënd.",
    trackSearching: "⏳ Duke kërkuar...",
    trackNotFound:  (c) => `❌ Kodi <strong>${c}</strong> nuk u gjet.`,
    trackNoCode:    "⚠️ Vendos kodin e rezervimit.",
    trackErrSearch: "❌ Gabim gjatë kërkimit.",
    statusLabels:   { car:"Makina", client:"Klienti", dates:"Datat", status:"Statusi" },
    langBtn:        "🇬🇧 EN",
  },
  en: {
    loading:        "⌛ Loading cars, please wait...",
    loadError:      "❌ Error loading cars.",
    noCars:         "No cars yet.",
    noResults:      "No car found for",
    carsWord:       "cars",
    reserveBtn:     "🚗 Reserve Now",
    deleteBtn:      "🗑️ Delete",
    totalLabel:     "Total:",
    daysLabel:      "Days:",
    confirmBtn:     "✅ Confirm Booking",
    sendingBtn:     "⏳ Sending...",
    sentBtn:        "✅ Booking sent!",
    toastReserved:  (c) => `✅ Reserved! Code: ${c}`,
    toastCopied:    "🔗 Link copied!",
    toastDeleted:   "🗑️ Car deleted!",
    toastAdded:     (n) => `✅ Car "${n}" added!`,
    toastFillAll:   "⚠️ Please fill all fields!",
    toastBadDates:  "⚠️ Invalid dates!",
    toastUploadErr: "❌ Upload error!",
    toastSaveErr:   "❌ Send error. Try again.",
    toastUnauth:    "❌ Not authorized!",
    toastDelErr:    "❌ Delete error!",
    confirmDelete:  "Are you sure you want to delete this car?",
    uploading:      (p) => `Uploading: ${p}%`,
    perDay:         "/ day",
    codeLabel:      "Your Confirmation Code",
    codeSub:        "Save this code to track your booking.",
    trackSearching: "⏳ Searching...",
    trackNotFound:  (c) => `❌ Code <strong>${c}</strong> not found.`,
    trackNoCode:    "⚠️ Please enter your booking code.",
    trackErrSearch: "❌ Search error.",
    statusLabels:   { car:"Car", client:"Client", dates:"Dates", status:"Status" },
    langBtn:        "🇦🇱 AL",
  }
};

let lang = localStorage.getItem('mmq_lang') || 'al';
let S    = STRINGS[lang];

// ─────────────────────────────────────────────────────────────
//  3.  LANGUAGE TOGGLE
// ─────────────────────────────────────────────────────────────
function applyLanguage() {
  S = STRINGS[lang];
  localStorage.setItem('mmq_lang', lang);

  // Update all lang-btn elements
  document.querySelectorAll('.lang-btn').forEach(btn => (btn.textContent = S.langBtn));

  // Update elements with data-al / data-en attributes
  document.querySelectorAll('[data-al]').forEach(el => {
    el.textContent = lang === 'al' ? el.dataset.al : (el.dataset.en || el.dataset.al);
  });

  // Update nav drawer links
  document.querySelectorAll('.nav-drawer a[data-key]').forEach(a => {
    const v = S[a.dataset.key]; if (v) a.textContent = v;
  });

  // Re-render car count
  if (allCars.length > 0) updateCount(
    document.querySelectorAll('.carCard:not([style*="display: none"])').length
  );
}

window.toggleLang = function() {
  lang = lang === 'al' ? 'en' : 'al';
  applyLanguage();
  // Notify HTML pages to update placeholders
  document.dispatchEvent(new CustomEvent('mmq:lang', { detail: lang }));
  // Re-render gallery with new language strings
  const gallery = document.getElementById('carGallery');
  if (gallery && allCars.length > 0) {
    gallery.innerHTML = '';
    allCars.forEach(car => gallery.appendChild(buildCarCard(car)));
    // Re-apply active search filter
    const si = document.getElementById('searchInput');
    if (si && si.value.trim()) filterCars(si.value.trim());
  }
};

// ─────────────────────────────────────────────────────────────
//  4.  HAMBURGER MENU
// ─────────────────────────────────────────────────────────────
function initHamburger() {
  const btn     = document.getElementById('hamburgerBtn');
  const drawer  = document.getElementById('navDrawer');
  const overlay = document.getElementById('drawerOverlay');
  if (!btn) return;
  const toggle = () => {
    btn.classList.toggle('open');
    drawer?.classList.toggle('open');
    overlay?.classList.toggle('open');
  };
  btn.addEventListener('click', toggle);
  overlay?.addEventListener('click', toggle);
}

// ─────────────────────────────────────────────────────────────
//  5.  SECRET LOGO  (5 taps → hyrje.html)
// ─────────────────────────────────────────────────────────────
function initSecretLogo() {
  const logo = document.getElementById('secretLogo');
  if (!logo) return;
  let n = 0, t;
  logo.addEventListener('click', () => {
    // Nëse admin është i loguar → mos aktivizo sekuetin
    if (currentUser) return;
    n++;
    clearTimeout(t);
    // 250ms dritare — duhet 5 klikime brenda 250ms nga kliku i fundit
    t = setTimeout(() => (n = 0), 250);
    if (n >= 5) { n = 0; window.location.href = 'hyrje.html'; }
  });
}

// ─────────────────────────────────────────────────────────────
//  6.  AUTH
// ─────────────────────────────────────────────────────────────
let currentUser = null;

onAuthStateChanged(auth, user => {
  currentUser = user;
  const adminSec  = document.getElementById('adminSection');
  const logoutBtn = document.getElementById('logoutBtn');
  if (user) {
    if (adminSec)  adminSec.style.display  = 'block';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    document.querySelectorAll('.admin-only').forEach(el => (el.style.display = 'block'));
  } else {
    if (adminSec)  adminSec.style.display  = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
    document.querySelectorAll('.admin-only').forEach(el => (el.style.display = 'none'));
  }
});

document.getElementById('logoutBtn')?.addEventListener('click', () => signOut(auth));

// ─────────────────────────────────────────────────────────────
//  7.  TOAST
// ─────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('custom-toast');
  if (!t) return;
  t.innerHTML = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ─────────────────────────────────────────────────────────────
//  8.  LOAD CARS  ← the critical fix
//      • Tries orderBy('timestamp') first, falls back to unordered
//      • Reads BOTH `images[]` and `image` fields
//      • Reads BOTH `name`/`emri` and `price`/`cmimi` fields
// ─────────────────────────────────────────────────────────────
let allCars = [];

async function loadCars() {
  const gallery = document.getElementById('carGallery');
  if (!gallery) return;

  gallery.innerHTML = `<p class="gallery-msg">${S.loading}</p>`;

  try {
    let snap;
    try {
      snap = await getDocs(query(collection(db, 'cars'), orderBy('timestamp', 'desc')));
    } catch (_) {
      // If Firestore index doesn't exist yet, load without ordering
      snap = await getDocs(collection(db, 'cars'));
    }

    gallery.innerHTML = '';
    allCars = [];

    if (snap.empty) {
      gallery.innerHTML = `<p class="gallery-msg">${S.noCars}</p>`;
      updateCount(0);
      return;
    }

    snap.forEach(docSnap => {
      const car = { id: docSnap.id, ...docSnap.data() };
      allCars.push(car);
      gallery.appendChild(buildCarCard(car));
    });

    updateCount(allCars.length);

    // Apply URL ?search= param (coming from index5 search bar redirect)
    const urlSearch = new URLSearchParams(window.location.search).get('search');
    if (urlSearch) {
      const si = document.getElementById('searchInput');
      if (si) si.value = urlSearch;
      filterCars(urlSearch);
    }

  } catch (err) {
    console.error('loadCars:', err);
    gallery.innerHTML = `<p class="gallery-msg" style="color:var(--danger)">${S.loadError}</p>`;
  }
}

function updateCount(n) {
  const el = document.getElementById('carCount');
  if (el) el.textContent = `${n} ${S.carsWord}`;
}

// ─────────────────────────────────────────────────────────────
//  9.  BUILD CAR CARD
// ─────────────────────────────────────────────────────────────
function buildCarCard(car) {
  // Support legacy Albanian field names
  const carName  = car.name  || car.emri  || '—';
  const carPrice = car.price || car.cmimi || 0;
  const images   = Array.isArray(car.images) ? car.images
                 : (car.image ? [car.image] : []);

  const card = document.createElement('div');
  card.className    = 'carCard';
  card.dataset.name = carName.toLowerCase();

  // ── Slider HTML ──────────────────────────────
  let slider = '';
  if (images.length > 0) {
    slider += `<div class="slider" id="slider-${car.id}">`;

    // Share button
    slider += `<button class="share-btn" onclick="shareCar('${car.id}','${esc(carName)}')" title="Share">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    </button>`;

    // NEW badge
    if (car.timestamp) {
      try {
        if (Date.now() - car.timestamp.toDate().getTime() < 259200000)
          slider += `<span class="new-badge">NEW</span>`;
      } catch (_) {}
    }

    // Images
    images.forEach((src, i) => {
      slider += `<img src="${esc(src)}"
        class="carImg${i === 0 ? ' active' : ''}"
        data-carid="${car.id}" data-index="${i}"
        onclick="openImageModal('${car.id}',${i})"
        alt="${esc(carName)} ${i + 1}"
        loading="lazy">`;
    });

    if (images.length > 1) {
      slider += `<button class="prev" onclick="slideImg('${car.id}',-1,event)">&#8249;</button>`;
      slider += `<button class="next" onclick="slideImg('${car.id}',1,event)">&#8250;</button>`;
      slider += `<div class="dots-container" id="dots-${car.id}">`;
      images.forEach((_, i) => {
        slider += `<div class="dot${i===0?' active':''}" onclick="goToSlide('${car.id}',${i})"></div>`;
      });
      slider += `</div>`;
    }

    slider += `</div>`;
  } else {
    // No-image placeholder
    slider = `<div class="slider" id="slider-${car.id}"
      style="display:flex;align-items:center;justify-content:center;background:#1a1e2a;">
      <span style="font-size:3rem;">🚗</span></div>`;
  }

  // E disponueshme / e pazgavëndshme
  const unavailable = car.unavailable === true;

  // Admin controls (vetëm nëse je i loguar)
  const adminBtns = currentUser ? `
    <div class="admin-controls admin-only">
      <button class="adm-btn adm-toggle ${unavailable ? 'unavail' : 'avail'}"
              onclick="toggleAvail('${car.id}',${unavailable})">
        ${unavailable ? '🔴 E padisponueshme' : '🟢 E disponueshme'}
      </button>
      <button class="adm-btn adm-edit"
              onclick="editPrice('${car.id}',${carPrice})">
        ✏️ Ndrysho çmimin
      </button>
      <button class="adm-btn adm-delete"
              onclick="deleteCar('${car.id}')">
        🗑️ Fshi
      </button>
    </div>` : '';

  // Nëse e pazgavëndshme → fshih rezervo butonin
  const reserveSection = unavailable
    ? `<div class="unavail-badge">⛔ E padisponueshme</div>`
    : `<button class="reserve-btn"
         onclick="openModal('${car.id}','${esc(carName)}',${carPrice})">
         ${S.reserveBtn}
       </button>`;

  card.innerHTML = `
    ${slider}
    <div class="card-body ${unavailable ? 'card-unavail' : ''}">
      <h3>${esc(carName)}</h3>
      <div class="price-tag" id="price-${car.id}">€${carPrice} <span>${S.perDay}</span></div>
      ${adminBtns}
      ${reserveSection}
    </div>`;

  const sliderEl = card.querySelector('.slider');
  if (sliderEl) addSwipe(sliderEl, car.id);

  return card;
}

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─────────────────────────────────────────────────────────────
//  10. SLIDER CONTROLS
// ─────────────────────────────────────────────────────────────
window.slideImg = function(carId, dir, e) {
  if (e) e.stopPropagation();
  const sliderEl = document.getElementById('slider-' + carId);
  if (!sliderEl) return;
  const imgs  = sliderEl.querySelectorAll('.carImg');
  const dotsEl = document.getElementById('dots-' + carId);
  let cur = [...imgs].findIndex(i => i.classList.contains('active'));
  if (cur < 0) cur = 0;
  imgs[cur].classList.remove('active');
  dotsEl?.children[cur]?.classList.remove('active');
  cur = (cur + dir + imgs.length) % imgs.length;
  imgs[cur].classList.add('active');
  dotsEl?.children[cur]?.classList.add('active');
};

window.goToSlide = function(carId, idx) {
  const sliderEl = document.getElementById('slider-' + carId);
  if (!sliderEl) return;
  const imgs  = sliderEl.querySelectorAll('.carImg');
  const dotsEl = document.getElementById('dots-' + carId);
  imgs.forEach((img, i) => {
    img.classList.toggle('active', i === idx);
    dotsEl?.children[i]?.classList.toggle('active', i === idx);
  });
};

function addSwipe(sliderEl, carId) {
  let sx = 0;
  sliderEl.addEventListener('touchstart', e => (sx = e.touches[0].clientX), { passive: true });
  sliderEl.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) window.slideImg(carId, dx < 0 ? 1 : -1, null);
  });
}

// ─────────────────────────────────────────────────────────────
//  11. LIVE SEARCH
// ─────────────────────────────────────────────────────────────
function filterCars(term) {
  const gallery   = document.getElementById('carGallery');
  const noResults = document.getElementById('noResults');
  const termSpan  = document.getElementById('searchTerm');
  if (!gallery) return;

  // Ndaj termin në fjalë — psh "mercedes benz" → kërko çdo fjalë veç e veç
  const words = (term || '').toLowerCase().trim().split(/\s+/).filter(Boolean);
  let visible = 0;

  gallery.querySelectorAll('.carCard').forEach(card => {
    const name = (card.dataset.name || '').toLowerCase();
    // Karta shfaqet nëse ÇDO fjalë e termit gjendet brenda emrit
    const show = words.length === 0 || words.every(w => name.includes(w));
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  updateCount(visible);
  if (noResults) {
    noResults.style.display = (words.length > 0 && visible === 0) ? 'block' : 'none';
    if (termSpan) termSpan.textContent = term || '';
  }
}

// Wire search inputs + search button after DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const si  = document.getElementById('searchInput');
  const btn = document.getElementById('searchBtn');
  if (!si) return;

  const onCarsPage = !!document.getElementById('carGallery');

  // Live filter (cars.html) — input në kohë reale
  if (onCarsPage) {
    si.addEventListener('input', () => filterCars(si.value));
  }

  // Funksioni i kërkimit (index5 → redirect, cars → filter)
  function doSearch() {
    const val = si.value.trim();
    if (onCarsPage) {
      filterCars(val);
    } else {
      // index5.html → shko te cars.html me parametrin e kërkimit
      window.location.href = val
        ? `cars.html?search=${encodeURIComponent(val)}`
        : 'cars.html';
    }
  }

  // Enter key
  si.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

  // Butoni i kërkimit (nëse ekziston)
  if (btn) btn.addEventListener('click', doSearch);
});

// ─────────────────────────────────────────────────────────────
//  12. LIGHTBOX
// ─────────────────────────────────────────────────────────────
let lightboxCar = null;
let lightboxIdx = 0;

window.openImageModal = function(carId, idx) {
  lightboxCar = allCars.find(c => c.id === carId);
  if (!lightboxCar) return;
  lightboxIdx = idx;
  renderLightbox();
  const m = document.getElementById('imageModal');
  if (m) { m.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
};

function renderLightbox() {
  if (!lightboxCar) return;
  const imgs = Array.isArray(lightboxCar.images) ? lightboxCar.images
             : (lightboxCar.image ? [lightboxCar.image] : []);
  const mi = document.getElementById('modalImg');
  if (mi) mi.src = imgs[lightboxIdx] || '';
  const dc = document.getElementById('modalDotsContainer');
  if (dc) dc.innerHTML = imgs.map((_, i) =>
    `<div class="modal-dot${i===lightboxIdx?' active':''}" onclick="lightboxGo(${i})"></div>`
  ).join('');
}

window.lightboxGo = i => { lightboxIdx = i; renderLightbox(); };

window.closeImageModal = function() {
  const m = document.getElementById('imageModal');
  if (m) m.style.display = 'none';
  document.body.style.overflow = '';
  lightboxCar = null;
};

document.addEventListener('DOMContentLoaded', () => {
  const lbc = document.querySelector('.image-modal-content');
  if (!lbc) return;
  let sx = 0;
  lbc.addEventListener('touchstart', e => (sx = e.touches[0].clientX), { passive: true });
  lbc.addEventListener('touchend', e => {
    if (!lightboxCar) return;
    const imgs = Array.isArray(lightboxCar.images) ? lightboxCar.images : [lightboxCar.image];
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) {
      lightboxIdx = (lightboxIdx + (dx < 0 ? 1 : -1) + imgs.length) % imgs.length;
      renderLightbox();
    }
  });
});

// ─────────────────────────────────────────────────────────────
//  13. RESERVATION MODAL
// ─────────────────────────────────────────────────────────────
let selId = null, selName = '', selPrice = 0;

window.openModal = function(carId, carName, price) {
  selId = carId; selName = carName; selPrice = Number(price) || 0;

  const today = new Date().toISOString().split('T')[0];
  setText('modalCarName', carName);
  setText('totalPrice',   `${S.totalLabel} €0`);
  setText('calculatedDays', '0');
  setVal('fullName',    '');
  setVal('clientPhone', '');
  setVal('startDate',   '');
  setVal('endDate',     '');
  document.getElementById('startDate').min = today;
  document.getElementById('endDate').min   = today;

  const cb = document.getElementById('confirmCodeBox');
  if (cb) cb.style.display = 'none';

  const btn = document.getElementById('confirmOrder');
  if (btn) { btn.disabled = false; btn.textContent = S.confirmBtn; }

  const m = document.getElementById('reservationModal');
  if (m) { m.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
};

document.getElementById('closeModal')?.addEventListener('click', closeModal);
function closeModal() {
  const m = document.getElementById('reservationModal');
  if (m) m.style.display = 'none';
  document.body.style.overflow = '';
}

['startDate','endDate'].forEach(id =>
  document.getElementById(id)?.addEventListener('change', calcDays)
);

function calcDays() {
  const s = document.getElementById('startDate')?.value;
  const e = document.getElementById('endDate')?.value;
  if (!s || !e) return;
  const d = Math.ceil((new Date(e) - new Date(s)) / 86400000);
  setText('calculatedDays', d > 0 ? d : 0);
  setText('totalPrice', `${S.totalLabel} €${d > 0 ? d * selPrice : 0}`);
}

// ─────────────────────────────────────────────────────────────
//  14. CONFIRM CODE
// ─────────────────────────────────────────────────────────────
function generateConfirmCode() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'RENT-';
  for (let i = 0; i < 4; i++) code += c[Math.floor(Math.random() * c.length)];
  return code;
}

// ─────────────────────────────────────────────────────────────
//  15. SUBMIT RESERVATION
// ─────────────────────────────────────────────────────────────
window.procesiRezervimit = async function() {
  const emri     = document.getElementById('fullName')?.value.trim();
  const telefoni = document.getElementById('clientPhone')?.value.trim();
  const nisja    = document.getElementById('startDate')?.value;
  const kthimi   = document.getElementById('endDate')?.value;

  if (!emri || !telefoni || !nisja || !kthimi) { showToast(S.toastFillAll); return; }

  const dite = Math.ceil((new Date(kthimi) - new Date(nisja)) / 86400000);
  if (dite <= 0) { showToast(S.toastBadDates); return; }

  const totali = dite * selPrice;
  const confirmCode = generateConfirmCode();

  const btn = document.getElementById('confirmOrder');
  if (btn) { btn.disabled = true; btn.textContent = S.sendingBtn; }

  try {
    await addDoc(collection(db, 'orders'), {
      carId: selId, makina: selName, cmimi: selPrice,
      emri, telefoni, nisja, kthimi, dite, totali,
      confirmCode,
      status: 'në pritje',
      timestamp: serverTimestamp()
    });

    // Show confirmation code in modal
    const cb = document.getElementById('confirmCodeBox');
    const cd = document.getElementById('confirmCodeDisplay');
    const cl = document.getElementById('codeLabelText');
    const cs = document.getElementById('codeSubText');
    if (cb && cd) {
      cd.textContent = confirmCode;
      if (cl) cl.textContent = S.codeLabel;
      if (cs) cs.textContent = S.codeSub;
      cb.style.display = 'block';
    }

    if (btn) btn.textContent = S.sentBtn;
    showToast(S.toastReserved(confirmCode));

    setTimeout(() => {
      if (btn) { btn.disabled = false; btn.textContent = S.confirmBtn; }
      closeModal();
    }, 6000);

  } catch (err) {
    console.error('Reservation error:', err);
    showToast(S.toastSaveErr);
    if (btn) { btn.disabled = false; btn.textContent = S.confirmBtn; }
  }
};

// ─────────────────────────────────────────────────────────────
//  16. TRACK ORDER
// ─────────────────────────────────────────────────────────────
window.trackOrder = async function() {
  const input = document.getElementById('trackInput');
  const res   = document.getElementById('trackResult');
  if (!input || !res) return;

  const code = input.value.trim().toUpperCase();
  if (!code) { res.style.display = 'block'; res.className = 'not-found'; res.innerHTML = S.trackNoCode; return; }

  res.style.display = 'block'; res.className = ''; res.innerHTML = S.trackSearching;

  try {
    const snap = await getDocs(query(collection(db, 'orders'), where('confirmCode', '==', code)));
    if (snap.empty) {
      res.className = 'not-found'; res.innerHTML = S.trackNotFound(code);
    } else {
      const d = snap.docs[0].data();
      const emojiMap = { 'në pritje':'⏳','pending':'⏳','konfirmuar':'✅','confirmed':'✅','anuluar':'❌','cancelled':'❌' };
      const emoji = emojiMap[d.status] || '⏳';
      const L = S.statusLabels;
      res.className = 'found';
      res.innerHTML = `${emoji} <strong>${code}</strong><br>
        🚗 <strong>${L.car}:</strong> ${d.makina||'—'}<br>
        👤 <strong>${L.client}:</strong> ${d.emri||'—'}<br>
        📅 <strong>${L.dates}:</strong> ${d.nisja||'—'} → ${d.kthimi||'—'}<br>
        💰 <strong>Total:</strong> €${d.totali||'—'}<br>
        📌 <strong>${L.status}:</strong> ${d.status||'—'}`;
    }
  } catch (err) {
    res.className = 'not-found'; res.innerHTML = S.trackErrSearch;
  }
};

document.getElementById('trackInput')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') window.trackOrder();
});

// ─────────────────────────────────────────────────────────────
//  17. ADMIN — ADD CAR
// ─────────────────────────────────────────────────────────────
window.addCar = async function() {
  if (!currentUser) { showToast(S.toastUnauth); return; }

  const name  = document.getElementById('carName')?.value.trim();
  const price = parseFloat(document.getElementById('carPrice')?.value);
  const fi    = document.getElementById('carFile');
  const files = fi?.files;

  if (!name || !price || !files || files.length === 0) { showToast(S.toastFillAll); return; }

  const pc = document.getElementById('uploadProgressContainer');
  const pb = document.getElementById('uploadProgressBar');
  const pt = document.getElementById('progressText');
  if (pc) pc.style.display = 'block';
  if (pt) pt.style.display = 'block';

  try {
    const urls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ref  = sRef(storage, `cars/${Date.now()}_${file.name}`);
      const task = uploadBytesResumable(ref, file);
      await new Promise((res, rej) => {
        task.on('state_changed',
          s => {
            const p = Math.round(s.bytesTransferred / s.totalBytes * 100);
            if (pb) pb.style.width  = p + '%';
            if (pt) pt.textContent  = S.uploading(p);
          },
          rej,
          async () => { urls.push(await getDownloadURL(task.snapshot.ref)); res(); }
        );
      });
    }

    await addDoc(collection(db, 'cars'), { name, price, images: urls, timestamp: serverTimestamp() });
    showToast(S.toastAdded(name));
    document.getElementById('carName').value  = '';
    document.getElementById('carPrice').value = '';
    fi.value = '';
    if (pc) pc.style.display = 'none';
    if (pt) pt.style.display = 'none';
    if (pb) pb.style.width   = '0%';
    await loadCars();

  } catch (err) {
    console.error('addCar:', err);
    showToast(S.toastUploadErr);
    if (pc) pc.style.display = 'none';
  }
};

// ─────────────────────────────────────────────────────────────
//  18. ADMIN — DELETE CAR
// ─────────────────────────────────────────────────────────────
window.deleteCar = async function(carId) {
  if (!currentUser) return;
  if (!confirm(S.confirmDelete)) return;
  try {
    await deleteDoc(doc(db, 'cars', carId));
    showToast(S.toastDeleted);
    await loadCars();
  } catch (err) {
    console.error('deleteCar:', err);
    showToast(S.toastDelErr);
  }
};

// ─────────────────────────────────────────────────────────────
//  19. ADMIN — TOGGLE DISPONUESHMËRI
// ─────────────────────────────────────────────────────────────
window.toggleAvail = async function(carId, currentlyUnavailable) {
  if (!currentUser) return;
  const newVal = !currentlyUnavailable;
  const msg = newVal
    ? (lang === 'al' ? 'E shënuar si E PAZGAVËNDSHME' : 'Marked as UNAVAILABLE')
    : (lang === 'al' ? 'E shënuar si E DISPONUESHME'  : 'Marked as AVAILABLE');
  try {
    await updateDoc(doc(db, 'cars', carId), { unavailable: newVal });
    showToast('✅ ' + msg);
    await loadCars();
  } catch (err) {
    console.error('toggleAvail:', err);
    showToast('❌ Gabim!');
  }
};

// ─────────────────────────────────────────────────────────────
//  20. ADMIN — EDIT ÇMIMI
// ─────────────────────────────────────────────────────────────
window.editPrice = async function(carId, currentPrice) {
  if (!currentUser) return;
  const promptMsg = lang === 'al'
    ? `Çmimi aktual: €${currentPrice}\nShkruaj çmimin e ri:`
    : `Current price: €${currentPrice}\nEnter new price:`;
  const input = prompt(promptMsg);
  if (input === null) return;
  const newPrice = parseFloat(input);
  if (isNaN(newPrice) || newPrice <= 0) {
    showToast(lang === 'al' ? '⚠️ Çmim i pavlefshëm!' : '⚠️ Invalid price!');
    return;
  }
  try {
    await updateDoc(doc(db, 'cars', carId), { price: newPrice });
    showToast(lang === 'al' ? `✅ Çmimi u ndryshua: €${newPrice}` : `✅ Price updated: €${newPrice}`);
    await loadCars();
  } catch (err) {
    console.error('editPrice:', err);
    showToast('❌ Gabim!');
  }
};

// ─────────────────────────────────────────────────────────────
//  21. SHARE CAR
// ─────────────────────────────────────────────────────────────
window.shareCar = function(carId, carName) {
  const url = `${location.origin}${location.pathname}?car=${carId}`;
  if (navigator.share) navigator.share({ title: carName, url });
  else { navigator.clipboard?.writeText(url).catch(() => {}); showToast(S.toastCopied); }
};

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────
function setText(id, v) { const e = document.getElementById(id); if (e) e.textContent = v; }
function setVal(id, v)  { const e = document.getElementById(id); if (e) e.value       = v; }

// ─────────────────────────────────────────────────────────────
//  INIT  — called once on page load
// ─────────────────────────────────────────────────────────────
initHamburger();
initSecretLogo();
applyLanguage();
loadCars();
