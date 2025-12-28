// Toggle për menunë hamburger
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector("nav ul");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("show");
    });
  }

  // Validim forme (faqja contact.html)
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Faleminderit që na kontaktuat! Do ju përgjigjemi së shpejti.");
      form.reset();
    });
  }
});




document.addEventListener("DOMContentLoaded", () => {
  const thumbs = document.querySelectorAll('.lightbox-thumb');

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', e => {
      e.preventDefault();

      const images = thumb.dataset.images.split(',');
      let currentIndex = 0;
      let startX = 0;
      let lightbox, img, closeBtn;

      // Fshi lightbox e vjetër nëse ekziston
      const oldLightbox = document.querySelector('.lightbox');
      if (oldLightbox) oldLightbox.remove();

      // Krijojmë lightbox-in
      lightbox = document.createElement('div');
      lightbox.classList.add('lightbox');

      img = document.createElement('img');
      img.src = images[currentIndex];
      lightbox.appendChild(img);

      closeBtn = document.createElement('span');
      closeBtn.classList.add('close');
      closeBtn.innerHTML = '&times;';
      closeBtn.addEventListener('click', () => lightbox.remove());
      lightbox.appendChild(closeBtn);

      // Mesazhi swipe
      const swipeMsg = document.createElement('div');
      swipeMsg.classList.add('swipe-message');
      swipeMsg.textContent = "Rrëshqit majtas/djathtas për foton tjetër";
      lightbox.appendChild(swipeMsg);

      document.body.appendChild(lightbox);
      lightbox.classList.add('active');

      // Swipe functionality
      let moving = false;
      const startSwipe = (x) => { startX = x; moving = true; }
      const endSwipe = (x) => {
        if(!moving) return;
        let diff = x - startX;
        if(diff > 50 && currentIndex > 0) currentIndex--;
        else if(diff < -50 && currentIndex < images.length - 1) currentIndex++;
        else { img.style.transform = 'translateX(' + diff/5 + 'px)'; setTimeout(()=>img.style.transform='translateX(0)',150); }
        img.src = images[currentIndex];
        moving = false;
      }

      // Touch events për celular
      img.addEventListener('touchstart', ev => startSwipe(ev.touches[0].clientX));
      img.addEventListener('touchend', ev => endSwipe(ev.changedTouches[0].clientX));
      // Mouse events për desktop
      img.addEventListener('mousedown', ev => startSwipe(ev.clientX));
      img.addEventListener('mouseup', ev => endSwipe(ev.clientX));
    });
  });
});



