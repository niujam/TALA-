// Firebase v10 Modular SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, orderBy, query, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDWWm5Io79yKkruWflnur0psqGo5JhCvlk",
    authDomain: "makina-me-qera-8cec2.firebaseapp.com",
    projectId: "makina-me-qera-8cec2",
    storageBucket: "makina-me-qera-8cec2.firebasestorage.app",
    messagingSenderId: "734985518754",
    appId: "1:734985518754:web:d095914cae047cd355e1fb",
    measurementId: "G-JCHBLH634N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Global Variables
let eshteNgarkimiFillestar = true;
let currentCar = { name: "", price: 0 };
let modalImages = [];
let currentModalIdx = 0;

console.log("Firebase v10 u lidh me sukses!");

// Universal Swipe Function
function shtoSwipe(element, callback) {
    let xNisja = null;
    element.addEventListener('touchstart', e => { xNisja = e.touches[0].clientX; }, {passive: true});
    element.addEventListener('touchend', e => {
        if (!xNisja) return;
        let xFundi = e.changedTouches[0].clientX;
        let dif = xNisja - xFundi;
        if (Math.abs(dif) > 50) callback(dif > 0 ? 1 : -1);
        xNisja = null;
    }, {passive: true});
}

// Display Cars Function
window.displayCars = function() {
    const gallery = document.getElementById("carGallery");
    if (!gallery) return;

    const carsRef = collection(db, "cars");
    const q = query(carsRef, orderBy("createdAt", "desc"));

    onSnapshot(q, (snap) => {
        gallery.innerHTML = "";
        const isAdmin = sessionStorage.getItem("isAdmin") === "true";

        snap.forEach(docSnap => {
            const car = docSnap.data();
            const carId = docSnap.id;
            const images = Array.isArray(car.images) ? car.images : [car.image || ""];
            const imagesSafe = JSON.stringify(images).split('"').join("&quot;");
            
            // Llogaritja e kohës për etiketën NEW
            let newBadgeHTML = "";
            if (car.createdAt) {
                const kohaAktuale = Date.now();
                const kohaStimit = car.createdAt.toDate().getTime();
                const dif = kohaAktuale - kohaStimit;
                const diteShtimit = dif / (1000 * 60 * 60 * 24);
                
                if (diteShtimit <= 3) {
                    newBadgeHTML = '<div class="new-badge">NEW</div>';
                }
            }
            
            let imgHTML = "", dotsHTML = "";
            images.forEach((imgUrl, idx) => {
                imgHTML += `<img src="${imgUrl}" class="carImg ${idx === 0 ? 'active' : ''}" onclick="window.openImageModal(${imagesSafe}, ${idx})">`;
                if (images.length > 1) dotsHTML += `<span class="dot ${idx === 0 ? 'active' : ''}" onclick="event.stopPropagation(); window.changeImg(this, ${idx})"></span>`;
            });

            gallery.innerHTML += `
                <div class="carCard" id="card-${carId}">
                    ${newBadgeHTML}
                    <button class="share-btn" onclick="shareCar('${car.name.replace(/'/g, "\\'")}', '${carId}')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                    </button>
                    <div class="slider" id="slider-${carId}">
                        <div class="slider-images">${imgHTML}</div>
                        <div class="dots-container">${dotsHTML}</div>
                    </div>
                    <h3>${car.name}</h3>
                    <p>€${car.price} / ditë</p>
                    ${isAdmin ? `
                        <div style="display:flex; gap:5px; margin-top:10px;">
                            <button onclick="deleteCar('${carId}')" style="background:red; color:white; border:none; padding:8px; border-radius:5px; flex:1;">Fshi</button>
                            <button onclick="editCar('${carId}')" style="background:orange; color:white; border:none; padding:8px; border-radius:5px; flex:1;">Edito</button>
                        </div>
                    ` : `<button class="order-btn" onclick="window.orderCar('${carId}', '${car.name}', ${car.price})">Porosit</button>`}
                </div>`;
            
            setTimeout(() => {
                const sElem = document.getElementById(`slider-${carId}`);
                if (sElem) shtoSwipe(sElem, (dir) => window.moveSlide(carId, dir));
            }, 300);
        });
    });
};

// Add Car Function (Firebase v10)
window.addCar = async function () {
    const name = document.getElementById("carName").value.trim();
    const price = document.getElementById("carPrice").value.trim();
    const files = document.getElementById("carFile").files;
    
    if (!name || !price || files.length === 0) return alert("Plotësoni të gjitha fushat!");
    
    const progressContainer = document.getElementById("uploadProgressContainer");
    const progressBar = document.getElementById("uploadProgressBar");
    const progressText = document.getElementById("progressText");
    
    try {
        progressContainer.style.display = "block";
        progressText.style.display = "block";
        
        const imageUrls = [];
        let completedUploads = 0;
        
        for (let file of files) {
            const storageRef = ref(storage, `cars/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);
            
            await new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        const totalProgress = ((completedUploads / files.length) + (progress / 100 / files.length)) * 100;
                        progressBar.style.width = totalProgress + "%";
                        progressText.textContent = `Duke ngarkuar: ${Math.round(totalProgress)}%`;
                    },
                    (error) => reject(error),
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        imageUrls.push(downloadURL);
                        completedUploads++;
                        resolve();
                    }
                );
            });
        }

        const carsRef = collection(db, "cars");
        await addDoc(carsRef, {
            name: name,
            price: Number(price),
            images: imageUrls,
            createdAt: serverTimestamp()
        });
        
        alert("Makina u shtua me sukses!");
        location.reload(); 
    } catch (e) {
        alert("Gabim gjatë shtimit: " + e.message);
    } finally {
        progressContainer.style.display = "none";
        progressText.style.display = "none";
    }
};

// Image Modal Functions
window.openImageModal = function(imgs, idx) {
    modalImages = imgs;
    currentModalIdx = idx;
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImg");
    
    if (!modal || !modalImg) return;

    window.updateModalView();
    modal.style.display = "flex";

    if (!modalImg.dataset.swipeLinked) {
        shtoSwipe(modalImg, (dir) => {
            currentModalIdx = (currentModalIdx + dir + modalImages.length) % modalImages.length;
            window.updateModalView();
        });
        modalImg.dataset.swipeLinked = "true";
    }
};

window.updateModalView = function() {
    document.getElementById("modalImg").src = modalImages[currentModalIdx];
    let dotsHTML = "";
    if (modalImages.length > 1) {
        modalImages.forEach((_, i) => {
            dotsHTML += `<span class="modal-dot ${i === currentModalIdx ? 'active' : ''}" onclick="window.changeModalImg(${i})"></span>`;
        });
    }
    const dotsCont = document.getElementById("modalDotsContainer");
    if(dotsCont) dotsCont.innerHTML = dotsHTML;
};

window.changeModalImg = function(idx) {
    currentModalIdx = idx;
    window.updateModalView();
};

window.closeImageModal = () => document.getElementById("imageModal").style.display = "none";

// Delete Car Function (Firebase v10)
window.deleteCar = async function(id) { 
    if(confirm("Je i sigurt që do ta fshish këtë makinë?")) {
        try {
            const carRef = doc(db, "cars", id);
            await deleteDoc(carRef); 
            alert("Makina u fshi me sukses!");
        } catch (e) {
            console.error("Gabim gjatë fshirjes:", e);
            alert("Nuk mund ta fshini: " + e.message);
        }
    }
};

// Edit Car Function (Firebase v10)
window.editCar = async function(id) { 
    const p = prompt("Vendos çmimin e ri (vetëm numër):"); 
    if (p !== null && p !== "") { 
        if (!isNaN(p)) {
            try {
                const carRef = doc(db, "cars", id);
                await updateDoc(carRef, { 
                    price: Number(p) 
                });
                alert("Çmimi u përditësua në €" + p);
            } catch (e) {
                console.error("Gabim gjatë editimit:", e);
                alert("Gabim gjatë editimit: " + e.message);
            }
        } else {
            alert("Ju lutem vendosni një numër të vlefshëm!");
        }
    }
};

// Slider Functions
window.moveSlide = function(cardId, dir) {
    const card = document.getElementById(`card-${cardId}`);
    if(!card) return;
    const imgs = card.querySelectorAll('.carImg');
    const dots = card.querySelectorAll('.dot');
    let idx = Array.from(imgs).findIndex(i => i.classList.contains('active'));
    
    imgs[idx].classList.remove('active'); 
    if(dots[idx]) dots[idx].classList.remove('active');
    
    idx = (idx + dir + imgs.length) % imgs.length;
    
    imgs[idx].classList.add('active'); 
    if(dots[idx]) dots[idx].classList.add('active');
};

window.changeImg = function(dot, idx) {
    const card = dot.closest('.carCard');
    const imgs = card.querySelectorAll('.carImg');
    const dots = card.querySelectorAll('.dot');
    
    imgs.forEach(i => i.classList.remove('active')); 
    dots.forEach(d => d.classList.remove('active'));
    
    imgs[idx].classList.add('active'); 
    dots[idx].classList.add('active');
};

// Auth State Listener
onAuthStateChanged(auth, (user) => {
    const isAdmin = !!user;
    sessionStorage.setItem("isAdmin", isAdmin);
    const adminSection = document.getElementById("adminSection");
    const logoutBtn = document.getElementById("logoutBtn");
    
    if (adminSection) adminSection.style.display = isAdmin ? "block" : "none";
    if (logoutBtn) logoutBtn.style.display = isAdmin ? "inline-block" : "none";
    
    if (typeof window.displayCars === 'function') window.displayCars();
});

// DOM Content Loaded Event
document.addEventListener("DOMContentLoaded", () => {
    // Secret Logo Click for Admin Access
    let klikime = 0;
    let kohaKlikimitTeFundit = 0;

    const logo = document.querySelector(".logo");
    if (logo) {
        logo.onclick = () => {
            const kohaTani = Date.now();
            if (kohaTani - kohaKlikimitTeFundit > 500) klikime = 0;
            kohaKlikimitTeFundit = kohaTani;
            klikime++;
            if (klikime === 5) window.location.href = "hyrje.html";
        };
    }

    // Modal Close Button
    const closeModal = document.getElementById("closeModal");
    if (closeModal) closeModal.onclick = () => document.getElementById("reservationModal").style.display = "none";

    // Confirm Order Button
    const confirmBtn = document.getElementById("confirmOrder");
    if (confirmBtn) {
        confirmBtn.onclick = async function() {
            const fullName = document.getElementById("fullName").value.trim();
            const phone = document.getElementById("clientPhone").value;
            const start = document.getElementById("startDate").value;
            const end = document.getElementById("endDate").value;
            
            if(!fullName || !phone || !start || !end) return alert("Plotësoni të gjitha fushat!");
            
            try {
                const ordersRef = collection(db, "orders");
                
                // Llogarit ditët dhe totalin
                const startDate = new Date(start);
                const endDate = new Date(end);
                const dif = endDate - startDate;
                const diteTotale = Math.ceil(dif / (1000 * 60 * 60 * 24)) + 1;
                const kostoja = diteTotale * currentCar.price;
                
                await addDoc(ordersRef, {
                    makina: currentCar.name,
                    cmimi: currentCar.price,
                    emri: fullName,
                    telefoni: phone,
                    nisja: start,
                    kthimi: end,
                    dite: diteTotale,
                    totali: kostoja,
                    timestamp: serverTimestamp(),
                    status: "në pritje"
                });
                alert("✅ Porosia juaj u dërgua me sukses!");
                document.getElementById("reservationModal").style.display = "none";
                
                // Pastro fushat pas dërgimit
                document.getElementById("fullName").value = "";
                document.getElementById("clientPhone").value = "";
                document.getElementById("startDate").value = "";
                document.getElementById("endDate").value = "";
            } catch (e) { 
                alert("Gabim: " + e.message); 
            }
        };
    }
    
    // Llogaritja e ditëve dhe çmimit
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    
    if (startDateInput && endDateInput) {
        const calculateDays = () => {
            const start = startDateInput.value;
            const end = endDateInput.value;
            
            if (start && end) {
                const startDate = new Date(start);
                const endDate = new Date(end);
                const dif = endDate - startDate;
                const days = Math.ceil(dif / (1000 * 60 * 60 * 24)) + 1; // +1 për të përfshirë edhe ditën e fillimit
                
                if (days > 0) {
                    document.getElementById("calculatedDays").innerText = days;
                    const total = days * currentCar.price;
                    document.getElementById("totalPrice").innerText = `Totali: €${total} (${days} ditë × €${currentCar.price})`;
                } else {
                    document.getElementById("calculatedDays").innerText = "0";
                    document.getElementById("totalPrice").innerText = `Çmimi ditor: €${currentCar.price}`;
                    alert("Data e mbarimit duhet të jetë pas datës së fillimit!");
                }
            }
        };
        
        startDateInput.addEventListener("change", calculateDays);
        endDateInput.addEventListener("change", calculateDays);
    }

    // Login Button
    const btnLogin = document.getElementById("btnLogin");
    if (btnLogin) {
        btnLogin.onclick = async () => {
            const email = document.getElementById("email").value;
            const pass = document.getElementById("pass").value;
            const loader = document.getElementById("loader");
            
            if (loader) loader.style.display = "block";
            
            try {
                await signInWithEmailAndPassword(auth, email, pass);
                window.location.href = "cars.html";
            } catch (e) { 
                alert("Gabim në hyrje: " + e.message); 
            } finally {
                if (loader) loader.style.display = "none";
            }
        };
    }
    
    // Logout Button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            try {
                await signOut(auth);
                sessionStorage.clear();
                location.reload();
            } catch (e) {
                alert("Gabim në dalje: " + e.message);
            }
        };
    }

    // Initialize order listener
    degjoPerPorosiTeReja();
});

// Order Car Modal
window.orderCar = (id, n, p) => {
    currentCar = { name: n, price: p };
    document.getElementById("modalCarName").innerText = n;
    document.getElementById("totalPrice").innerText = "Çmimi ditor: €" + p;
    document.getElementById("reservationModal").style.display = "flex";
    
    // Vendos datën minimale (sot)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("startDate").min = today;
    document.getElementById("endDate").min = today;
    
    // Pastro inputet
    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";
    document.getElementById("calculatedDays").innerText = "0";
};

// Listen for New Orders (Firebase v10)
function degjoPerPorosiTeReja() {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("timestamp", "desc"), limit(1));
    
    onSnapshot(q, (snapshot) => {
        if (eshteNgarkimiFillestar) { 
            eshteNgarkimiFillestar = false; 
            return; 
        }
        
        // KONTROLLO NËSE ËSHTË ADMIN
        const isAdmin = sessionStorage.getItem("isAdmin") === "true";
        
        snapshot.docChanges().forEach(change => { 
            if(change.type === "added" && isAdmin) {
                alert("🚨 POROSI E RE!"); 
            }
        });
    });
}

// Initialize display on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.displayCars);
} else {
    window.displayCars();
}

// Share Car Function
// Share Car Function - Versioni i përmirësuar
window.shareCar = async function(carName, carId) {
    event.stopPropagation(); // Ndalon klikimin që të aktivizojë slider-in
    
    const shareData = {
        title: `${carName} - Makina me Qera`,
        text: `Shiko këtë makinë të mrekullueshme: ${carName}`,
        url: window.location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
            showToast('✅ U shpërnda me sukses!');
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.log('Gabim gjatë shpërndarjes:', err);
            }
        }
    } else {
        // Fallback për desktop browsers
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            showToast('✅ Linku u kopjua në clipboard!');
        } catch {
            // Nëse clipboard nuk punon, shfaq alert
            prompt('Kopjo këtë link:', url);
        }
    }
};

// Toast Notification Helper
function showToast(message) {
    const toast = document.getElementById("custom-toast");
    if (toast) {
        toast.textContent = message;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3000);
    }
}