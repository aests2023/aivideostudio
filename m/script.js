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

  // 1-2. Mobile Dropdown Toggle for 'Services'
  const dropdownLi = document.querySelector('li.dropdown');
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  
  if (dropdownToggle && dropdownLi) {
    dropdownToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropdownLi.classList.toggle('open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!dropdownLi.contains(e.target)) {
        dropdownLi.classList.remove('open');
      }
    });
  }

  // 2. Active Nav Link Highlight based on current HTML filename
  const path = window.location.pathname;
  const currentPage = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .dropdown-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes(currentPage)) {
      link.classList.add('active');
      
      // 하위 메뉴가 활성화 상태인 경우 부모 '서비스' 칩 버튼도 활성화 상태로 표시
      if (link.classList.contains('dropdown-link')) {
        const parentToggle = link.closest('.dropdown')?.querySelector('.nav-link');
        if (parentToggle) {
          parentToggle.classList.add('active');
        }
      }
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
  const GOOGLE_SHEET_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxODU1sAOm8l-Ce0fz4jEDULzde6Edf0S9tI-b8oo6geQ_opB3Ibx__HlgW-9zJkfNBHg/exec';

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

  // 6. Dynamic Navigation Link Swap (Login -> Logout & MyPage/Admin)
  const navMenuElement = document.getElementById('navMenu');
  if (navMenuElement) {
    const loadFirebaseScripts = () => {
      return new Promise((resolve, reject) => {
        if (window.firebase && window.auth) {
          resolve();
          return;
        }
        
        const sApp = document.createElement('script');
        sApp.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js";
        sApp.onload = () => {
          const sAuth = document.createElement('script');
          sAuth.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js";
          sAuth.onload = () => {
            const isMobile = window.location.pathname.includes('/m/');
            const sConfig = document.createElement('script');
            sConfig.src = (isMobile ? "../" : "./") + "firebase-config.js?v=1.0.2";
            sConfig.onload = () => {
              resolve();
            };
            sConfig.onerror = reject;
            document.head.appendChild(sConfig);
          };
          sAuth.onerror = reject;
          document.head.appendChild(sAuth);
        };
        sApp.onerror = reject;
        document.head.appendChild(sApp);
      });
    };

    loadFirebaseScripts().then(() => {
      auth.onAuthStateChanged((user) => {
        const loginLink = navMenuElement.querySelector('a[href="login.html"]');
        if (loginLink && loginLink.parentElement) {
          const li = loginLink.parentElement;
          
          if (user) {
            const isPageMobile = window.location.pathname.includes('/m/');
            const dashboardPage = isAdmin(user.email) ? 'admin.html' : 'mypage.html';
            const dashboardText = isAdmin(user.email) ? '관리자' : '마이페이지';
            
            // Check if current page is dashboard to apply active highlighting
            const pathName = window.location.pathname;
            const currentPageName = pathName.substring(pathName.lastIndexOf('/') + 1) || 'index.html';
            const isActive = currentPageName.includes(dashboardPage);
            const activeClass = isActive ? 'active' : '';

            li.innerHTML = `<a href="${dashboardPage}" class="nav-link ${activeClass}">${dashboardText}</a>`;
            
            // Create and append logout link if it doesn't exist
            let logoutLi = document.getElementById('navLogoutLi');
            if (!logoutLi) {
              logoutLi = document.createElement('li');
              logoutLi.id = 'navLogoutLi';
              logoutLi.innerHTML = `<a href="#" id="navLogoutBtn" class="nav-link">로그아웃</a>`;
              li.parentNode.insertBefore(logoutLi, li.nextSibling);
              
              const logoutBtn = document.getElementById('navLogoutBtn');
              if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                  e.preventDefault();
                  if (confirm("로그아웃 하시겠습니까?")) {
                    auth.signOut().then(() => {
                      window.location.reload();
                    });
                  }
                });
              }
            }
          }
        }
      });
    }).catch(err => console.error("Firebase SDK loading failed:", err));
  }
});
