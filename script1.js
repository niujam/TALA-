// ========================
// Album Images
// ========================
const albums = {
  gatim1: [
    "dish6.jpeg",
    "dish7.jpeg",
    "dish8.jpeg"
  ],
  gatim2: [
    "dish2.jpeg",
    "dish4.jpeg",
    "dish6.jpeg"
  ],
  gatim3: [
    "dish3.jpeg",
    "dish2.jpeg",
    "dish1.jpeg"
  ],
  gatim4: [
    "dish4.jpeg",
    "dish1.jpeg",
    "dish3.jpeg"
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  // ========================
  // Single-page navigation
  // ========================
  const navLinks = document.querySelectorAll("nav a");
  const sections = document.querySelectorAll("main section");

  function hideAllSections() {
    sections.forEach(sec => (sec.style.display = "none"));
  }

  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      const href = link.getAttribute("href");
      if (href.startsWith("#")) {
        e.preventDefault();
        const targetId = href.substring(1);
        hideAllSections();
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.style.display = "block";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });

  // Show hero section initially
  const heroSection = document.getElementById("hero");
  if (heroSection) {
    hideAllSections();
    heroSection.style.display = "block";
  }

  // ========================
  // Lightbox
  // ========================
  const lightbox = document.getElementById("album-lightbox");
  const lbImg = document.getElementById("album-lightbox-img");
  const lbClose = document.getElementById("album-lightbox-close");
  const albumTooltip = document.getElementById("album-tooltip");

  let currentAlbum = [];
  let currentIndex = 0;
  let scrollTop = 0;

  function openLightbox(albumKey) {
    currentAlbum = albums[albumKey];
    currentIndex = 0;
    showPhoto(currentIndex);

    scrollTop = window.scrollY || document.documentElement.scrollTop;
    document.body.classList.add("no-scroll");
    lightbox.style.opacity = 1;
    lightbox.style.visibility = "visible";

    if (albumTooltip) {
      albumTooltip.style.opacity = 1;
      setTimeout(() => (albumTooltip.style.opacity = 0), 2500);
    }
  }

  function closeLightbox() {
    lightbox.style.opacity = 0;
    lightbox.style.visibility = "hidden";
    document.body.classList.remove("no-scroll");
    window.scrollTo(0, scrollTop);
  }

  function showPhoto(index) {
    lbImg.src = currentAlbum[index];
  }

  function nextPhoto() {
    if (currentIndex < currentAlbum.length - 1) {
      currentIndex++;
      showPhoto(currentIndex);
    } else {
      lbImg.classList.add("shake-left");
      setTimeout(() => lbImg.classList.remove("shake-left"), 400);
    }
  }

  function prevPhoto() {
    if (currentIndex > 0) {
      currentIndex--;
      showPhoto(currentIndex);
    } else {
      lbImg.classList.add("shake-right");
      setTimeout(() => lbImg.classList.remove("shake-right"), 400);
    }
  }

  // ========================
  // Event listeners
  // ========================
  if (lbClose) lbClose.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", e => {
    if (lightbox.style.visibility === "visible") {
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "Escape") closeLightbox();
    }
  });

  // Swipe for mobile
  let startX = 0;
  if (lbImg) {
    lbImg.addEventListener("touchstart", e => (startX = e.touches[0].clientX));
    lbImg.addEventListener("touchend", e => {
      const endX = e.changedTouches[0].clientX;
      if (endX < startX - 50) nextPhoto();
      else if (endX > startX + 50) prevPhoto();
    });
  }

  // ========================
  // Menu items -> album
  // ========================
  const menuItems = document.querySelectorAll(".menu-item");
  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      const albumKey = item.getAttribute("data-album");
      if (albums[albumKey]) {
        openLightbox(albumKey);
      }
    });
  });

  // ========================
  // Default date for reservation
  // ========================
  const dateInput = document.getElementById("reservation-date");
  if (dateInput) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }
});


const tooltip = document.getElementById("album-tooltip");
tooltip.style.opacity = 1;
setTimeout(() => tooltip.style.opacity = 0, 2000);