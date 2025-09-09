// Albumet me fotot
const albums = {
  makeup: ["images1.jpeg","images2.jpeg","images3.jpeg"],
  thonj: ["images2.jpeg","images4.jpeg","images.jpeg"],
  floket: ["images3.jpeg","images.jpeg","images1.jpeg"],
  depilim: ["images4.jpeg","images1.jpeg","images3.jpeg"],
  qerpiket: ["images.jpeg","images2.jpeg","images.jpeg"]
};

let currentAlbum = [];
let currentIndex = 0;

const albumLightbox = document.getElementById("album-lightbox");
const albumImg = document.getElementById("album-lightbox-img");
const albumTooltip = document.getElementById("album-tooltip");
const closeBtn = document.getElementById("album-lightbox-close");
let scrollTop;

// Hap lightbox
function openLightbox() {
  scrollTop = window.scrollY || document.documentElement.scrollTop;
  document.body.classList.add('no-scroll');
  albumLightbox.classList.add('show');
  albumTooltip.style.opacity = 1;
  setTimeout(() => albumTooltip.style.opacity = 0, 2500);
}

// Mbyll lightbox
function closeLightbox() {
  albumLightbox.classList.remove('show');
  document.body.classList.remove('no-scroll');
  window.scrollTo(0, scrollTop);
}

// Shfaq foton aktuale
function showPhoto(index) {
  albumImg.src = currentAlbum[index];
}

// Foto tjetër
// Foto tjetër
function nextPhoto() {
  if (currentIndex < currentAlbum.length - 1) {
    currentIndex++;
    showPhoto(currentIndex);
  } else {
    // nëse je në fund → bëj animacion shake majtas
    albumImg.classList.add("shake-left");
    setTimeout(() => albumImg.classList.remove("shake-left"), 400);
  }
}

// Foto më parë
function prevPhoto() {
  if (currentIndex > 0) {
    currentIndex--;
    showPhoto(currentIndex);
  } else {
    // nëse je në fillim → bëj animacion shake djathtas
    albumImg.classList.add("shake-right");
    setTimeout(() => albumImg.classList.remove("shake-right"), 400);
  }
}

// Klik mbi album
document.querySelectorAll(".album").forEach(a => {
  a.addEventListener("click", () => {
    const group = a.dataset.group;
    currentAlbum = albums[group];
    currentIndex = 0;
    showPhoto(currentIndex);
    openLightbox();
  });
});

// Butoni close
closeBtn.onclick = closeLightbox;

// Tastet
document.addEventListener("keydown", e => {
  if(albumLightbox.classList.contains("show")){
    if(e.key === "ArrowRight") nextPhoto();
    if(e.key === "ArrowLeft") prevPhoto();
    if(e.key === "Escape") closeLightbox();
  }
});

// Swipe për touch
let startX = 0;
albumImg.addEventListener("touchstart", e => startX = e.touches[0].clientX);
albumImg.addEventListener("touchend", e => {
  let endX = e.changedTouches[0].clientX;
  if(endX < startX - 50) nextPhoto();
  else if(endX > startX + 50) prevPhoto();
});

  const dateInput = document.getElementById('rezervim-date');
  const today = new Date().toISOString().split('T')[0]; // merr datën e sotme YYYY-MM-DD
  dateInput.value = today; // vendos si default në input
