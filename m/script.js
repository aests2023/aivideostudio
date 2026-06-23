document.addEventListener('DOMContentLoaded', () => {
  let activeClickedCard = null;

  // 1. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // 2. Active Nav Link Highlight based on current HTML filename
  const path = window.location.pathname;
  const currentPage = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes(currentPage)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 3. YouTube Lightbox Modal on Card Click
  const portfolioCards = document.querySelectorAll('.portfolio-card');
  portfolioCards.forEach(card => {
    const videoId = card.getAttribute('data-youtube');
    if (videoId) {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        activeClickedCard = card;

        let lightbox = document.querySelector('.video-lightbox');
        if (!lightbox) {
          lightbox = document.createElement('div');
          lightbox.className = 'video-lightbox';
          
          const wrapper = document.createElement('div');
          wrapper.className = 'lightbox-wrapper';

          const container = document.createElement('div');
          container.className = 'lightbox-container';

          const closeBtn = document.createElement('button');
          closeBtn.className = 'lightbox-close-btn';
          closeBtn.innerHTML = '&times;';

          const backBtn = document.createElement('button');
          backBtn.className = 'lightbox-back-btn';
          backBtn.innerHTML = '<span>&larr;</span> 뒤로가기';

          wrapper.appendChild(container);
          wrapper.appendChild(closeBtn);
          wrapper.appendChild(backBtn);
          lightbox.appendChild(wrapper);
          document.body.appendChild(lightbox);

          const closeLightbox = () => {
            lightbox.style.opacity = '0';
            wrapper.style.transform = 'scale(0.95)';
            
            if (activeClickedCard) {
              activeClickedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            setTimeout(() => {
              const iframe = container.querySelector('iframe');
              if (iframe) iframe.remove();
              lightbox.style.display = 'none';
            }, 400);
          };

          closeBtn.addEventListener('click', closeLightbox);
          backBtn.addEventListener('click', closeLightbox);
          lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
              closeLightbox();
            }
          });
        }

        const wrapper = lightbox.querySelector('.lightbox-wrapper');
        const container = lightbox.querySelector('.lightbox-container');
        
        const oldIframe = container.querySelector('iframe');
        if (oldIframe) oldIframe.remove();

        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        iframe.title = "YouTube video player";
        iframe.frameBorder = "0";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.style.cssText = "width: 100%; height: 100%; border: none; display: block;";

        container.appendChild(iframe);
        
        lightbox.style.display = 'flex';
        lightbox.offsetHeight; // force reflow
        lightbox.style.opacity = '1';
        wrapper.style.transform = 'scale(1)';
      });
    }
  });

  // 4. Testimonial Slider
  const reviewTrack = document.getElementById('reviewTrack');
  const reviewSlides = document.querySelectorAll('.review-slide');
  let currentSlide = 0;

  if (reviewTrack && reviewSlides.length > 0) {
    setInterval(() => {
      currentSlide = (currentSlide + 1) % reviewSlides.length;
      reviewTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    }, 4000);
  }

  // 5. Consultation Form & Success Modal
  const GOOGLE_SHEET_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbw7ewaBs1Cb8wUgkpaTe5qwLbpFntdt49NQN9yykiMwpI9I-EuxnYqCySgj00nQ5nJ0bA/exec';

  const consultationForm = document.getElementById('consultationForm');
  const successModal = document.getElementById('successModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const submitBtn = consultationForm ? consultationForm.querySelector('.submit-btn') : null;

  if (consultationForm && successModal && closeModalBtn) {
    consultationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const clientName = document.getElementById('clientName').value.trim();
      const clientPhone = document.getElementById('clientPhone').value.trim();
      const clientEmail = document.getElementById('clientEmail').value.trim();
      const serviceType = document.getElementById('serviceType').value;
      const clientMessage = document.getElementById('clientMessage').value.trim();
      
      if (!clientName || !clientPhone || !clientEmail || !serviceType || !clientMessage) {
        alert('모든 필수 항목(*)을 채워주세요.');
        return;
      }
      
      const originalBtnText = submitBtn ? submitBtn.innerText : '무료 상담 신청하기';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = '전송 중...';
        submitBtn.style.opacity = '0.7';
      }

      const formData = new FormData();
      formData.append('name', clientName);
      formData.append('phone', clientPhone);
      formData.append('email', clientEmail);
      formData.append('service', serviceType);
      formData.append('message', clientMessage);

      const showSuccess = () => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = originalBtnText;
          submitBtn.style.opacity = '1';
        }
        successModal.classList.add('active');
        consultationForm.reset();
      };

      const isCorrectScriptUrl = GOOGLE_SHEET_WEB_APP_URL && GOOGLE_SHEET_WEB_APP_URL.includes('script.google.com');

      if (isCorrectScriptUrl) {
        fetch(GOOGLE_SHEET_WEB_APP_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: formData
        })
        .then(() => {
          showSuccess();
        })
        .catch(err => {
          console.error('스프레드시트 전송 실패:', err);
          showSuccess();
        });
      } else {
        setTimeout(showSuccess, 800);
      }
    });

    closeModalBtn.addEventListener('click', () => {
      successModal.classList.remove('active');
    });

    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        successModal.classList.remove('active');
      }
    });
  }
});
