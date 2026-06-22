document.addEventListener('DOMContentLoaded', () => {
  let activeClickedCard = null;
  
  // 1. Header Scroll Styling
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // 3. Scroll Reveal Animation (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal-el');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // 4. Active Nav Link on Scroll / Page Location
  const path = window.location.pathname;
  const currentPage = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  if (currentPage !== 'index.html' && currentPage !== '') {
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      // Highlight exact matches (e.g. services.html)
      if (href && href.includes(currentPage)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  } else {
    // Scroll Spy on index.html
    const sections = document.querySelectorAll('section');
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (
              (id === 'home' && href === 'index.html') ||
              (id === 'services' && href === 'services.html') ||
              (id === 'portfolio' && href === 'portfolio.html') ||
              (id === 'process' && href === 'process.html') ||
              (id === 'pricing' && href === 'pricing.html') ||
              (id === 'contact' && href === 'contact.html')
            ) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '-10% 0px -50% 0px'
    });

    sections.forEach(sec => {
      sectionObserver.observe(sec);
    });
  }

  // 5. Portfolio "Play on Hover" Film Simulation
  const portfolioCards = document.querySelectorAll('.portfolio-card');
  
  portfolioCards.forEach(card => {
    // data-preview 속성이 없는 카드는 호버 프리뷰 설정을 건너뜀 (인라인 iframe 직접 재생용)
    const previewType = card.getAttribute('data-preview');
    if (!previewType) return;

    const mediaContainer = card.querySelector('.portfolio-media');
    
    // Create elements for video preview simulation
    const overlay = document.createElement('div');
    overlay.className = 'simulation-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 1rem;
      opacity: 0;
      transition: opacity 0.3s ease;
      color: #FFFFFF;
      font-family: monospace;
      font-size: 0.75rem;
      z-index: 5;
      text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
      background: radial-gradient(circle, transparent 50%, rgba(0,0,0,0.4) 100%);
    `;
    
    // Header overlay: Blink indicator and text
    const topBar = document.createElement('div');
    topBar.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    `;
    
    const recDotWrapper = document.createElement('div');
    recDotWrapper.style.cssText = 'display: flex; align-items: center; gap: 0.4rem;';
    
    const recDot = document.createElement('span');
    recDot.style.cssText = `
      width: 8px;
      height: 8px;
      background-color: #E24C4C;
      border-radius: 50%;
      display: inline-block;
      animation: blink 1s infinite alternate;
    `;
    
    const recText = document.createElement('span');
    recText.innerText = 'PREVIEW';
    recText.style.fontWeight = 'bold';
    recText.style.letterSpacing = '1px';
    
    recDotWrapper.appendChild(recDot);
    recDotWrapper.appendChild(recText);
    
    const resText = document.createElement('span');
    resText.innerText = card.classList.contains('vertical') ? '9:16 vertical' : '16:9 4K';
    resText.style.opacity = '0.8';
    
    topBar.appendChild(recDotWrapper);
    topBar.appendChild(resText);
    
    // Bottom overlay: running timecode
    const bottomBar = document.createElement('div');
    bottomBar.style.cssText = `
      display: flex;
      justify-content: space-between;
      width: 100%;
    `;
    
    const timecodeVal = document.createElement('span');
    timecodeVal.innerText = '00:00:00:00';
    timecodeVal.style.fontSize = '0.85rem';
    
    const qualityBadge = document.createElement('span');
    qualityBadge.innerText = 'AI GEN';
    qualityBadge.style.cssText = `
      background-color: rgba(200, 142, 114, 0.8);
      padding: 0.1rem 0.4rem;
      border-radius: 2px;
      font-size: 0.65rem;
      letter-spacing: 0.5px;
    `;
    
    bottomBar.appendChild(timecodeVal);
    bottomBar.appendChild(qualityBadge);
    
    overlay.appendChild(topBar);
    overlay.appendChild(bottomBar);
    mediaContainer.appendChild(overlay);
    
    // Add Ken Burns and film grain animations to CSS on the fly
    if (!document.getElementById('simulation-animations')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'simulation-animations';
      styleSheet.innerText = `
        @keyframes blink {
          0% { opacity: 0.2; }
          100% { opacity: 1; }
        }
        @keyframes kenburns {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.08) translate(-1%, 0.5%); }
          100% { transform: scale(1.04) translate(0.5%, -0.5%); }
        }
        .simulate-play img {
          animation: kenburns 6s ease-in-out infinite alternate !important;
        }
        .noise-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.12;
          pointer-events: none;
          z-index: 4;
          transition: opacity 0.3s ease;
        }
      `;
      document.head.appendChild(styleSheet);
    }
    
    // Create film grain canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'noise-canvas';
    canvas.style.opacity = '0';
    mediaContainer.appendChild(canvas);
    
    let canvasInterval = null;
    const ctx = canvas.getContext('2d');
    
    const startNoise = () => {
      canvas.width = mediaContainer.clientWidth;
      canvas.height = mediaContainer.clientHeight;
      canvas.style.opacity = '0.12';
      
      canvasInterval = setInterval(() => {
        const w = canvas.width;
        const h = canvas.height;
        const imgData = ctx.createImageData(w, h);
        const data = imgData.data;
        const len = data.length;
        
        for (let i = 0; i < len; i += 4) {
          const val = Math.random() * 255;
          data[i] = val;
          data[i+1] = val;
          data[i+2] = val;
          data[i+3] = 45; // opacity
        }
        ctx.putImageData(imgData, 0, 0);
        
        // Draw occasional horizontal glitch line
        if (Math.random() > 0.96) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.fillRect(0, Math.random() * h, w, 2);
        }
      }, 50);
    };
    
    const stopNoise = () => {
      clearInterval(canvasInterval);
      canvas.style.opacity = '0';
    };

    // Hover timers
    let timer = null;
    let frames = 0;
    
    card.addEventListener('mouseenter', () => {
      if (card.querySelector('iframe')) return;
      overlay.style.opacity = '1';
      card.classList.add('simulate-play');
      startNoise();
      
      // Update timecode
      frames = 0;
      timer = setInterval(() => {
        frames += 4; // increment frames
        let f = frames % 30;
        let s = Math.floor(frames / 30) % 60;
        let m = Math.floor(frames / 1800) % 60;
        
        const fStr = f.toString().padStart(2, '0');
        const sStr = s.toString().padStart(2, '0');
        const mStr = m.toString().padStart(2, '0');
        
        timecodeVal.innerText = `00:${mStr}:${sStr}:${fStr}`;
      }, 133); // roughly 7.5 updates/sec, increments faster to look busy
    });
    
    card.addEventListener('mouseleave', () => {
      if (card.querySelector('iframe')) return;
      overlay.style.opacity = '0';
      card.classList.remove('simulate-play');
      stopNoise();
      clearInterval(timer);
      timecodeVal.innerText = '00:00:00:00';
    });

    // 5.1 Click to play YouTube in a popup lightbox modal
    const videoId = card.getAttribute('data-youtube');
    if (videoId) {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Stash reference to the clicked card
        activeClickedCard = card;

        // Create lightbox if it doesn't exist
        let lightbox = document.querySelector('.video-lightbox');
        if (!lightbox) {
          lightbox = document.createElement('div');
          lightbox.className = 'video-lightbox';
          lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(30, 27, 24, 0.92);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.4s ease;
            padding: 60px 20px 40px 20px;
            box-sizing: border-box;
          `;

          const wrapper = document.createElement('div');
          wrapper.className = 'lightbox-wrapper';
          wrapper.style.cssText = `
            position: relative;
            width: 100%;
            max-width: 960px;
            max-height: 100%;
            aspect-ratio: 16 / 9;
            transform: scale(0.95);
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          `;

          const container = document.createElement('div');
          container.className = 'lightbox-container';
          container.style.cssText = `
            width: 100%;
            height: 100%;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
            border-radius: var(--border-radius-md, 16px);
            overflow: hidden;
            background-color: #000000;
          `;

          const closeBtn = document.createElement('button');
          closeBtn.className = 'lightbox-close-btn';
          closeBtn.innerHTML = '&times;';
          closeBtn.style.cssText = `
            position: absolute;
            top: -45px;
            right: 0;
            background: none;
            border: none;
            color: #FFFFFF;
            font-size: 2.5rem;
            cursor: pointer;
            line-height: 1;
            transition: color 0.25s ease, transform 0.25s ease;
            outline: none;
            z-index: 10000;
          `;
          closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.color = 'var(--color-accent, #C88E72)';
            closeBtn.style.transform = 'scale(1.1)';
          });
          closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.color = '#FFFFFF';
            closeBtn.style.transform = 'scale(1)';
          });

          const backBtn = document.createElement('button');
          backBtn.className = 'lightbox-back-btn';
          backBtn.innerHTML = '<span>&larr;</span> 뒤로가기';
          backBtn.style.cssText = `
            position: absolute;
            top: -40px;
            left: 0;
            background: none;
            border: none;
            color: #FFFFFF;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: color 0.25s ease, transform 0.25s ease;
            outline: none;
            font-family: inherit;
            z-index: 10000;
            letter-spacing: 0.5px;
          `;
          backBtn.addEventListener('mouseenter', () => {
            backBtn.style.color = 'var(--color-accent, #C88E72)';
            backBtn.style.transform = 'translateX(-4px)';
          });
          backBtn.addEventListener('mouseleave', () => {
            backBtn.style.color = '#FFFFFF';
            backBtn.style.transform = 'translateX(0)';
          });

          // Responsive adjustments for mobile
          if (window.innerWidth <= 768) {
            closeBtn.style.top = '-40px';
            closeBtn.style.fontSize = '2rem';
            backBtn.style.top = '-36px';
            backBtn.style.fontSize = '0.9rem';
          }

          wrapper.appendChild(container);
          wrapper.appendChild(closeBtn);
          wrapper.appendChild(backBtn);
          lightbox.appendChild(wrapper);
          document.body.appendChild(lightbox);

          // Close handlers
          const closeLightbox = () => {
            lightbox.style.opacity = '0';
            wrapper.style.transform = 'scale(0.95)';
            
            // Smoothly scroll back to the active clicked card
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

        // Setup and show iframe
        const wrapper = lightbox.querySelector('.lightbox-wrapper');
        const container = lightbox.querySelector('.lightbox-container');
        
        // Remove old iframe if any
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
        
        // Display lightbox with animation
        lightbox.style.display = 'flex';
        // Force reflow
        lightbox.offsetHeight;
        lightbox.style.opacity = '1';
        wrapper.style.transform = 'scale(1)';
      });
    }
  });

  // 6. Testimonials Reviews Slider
  const reviewTrack = document.getElementById('reviewTrack');
  const sliderDots = document.querySelectorAll('.slider-dot');
  let currentSlide = 0;
  let autoplayTimer = null;

  const updateSlider = (index) => {
    if (!reviewTrack) return;
    currentSlide = index;
    reviewTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    sliderDots.forEach(dot => {
      if (parseInt(dot.getAttribute('data-index')) === currentSlide) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  };

  if (sliderDots.length > 0 && reviewTrack) {
    sliderDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.getAttribute('data-index'));
        updateSlider(index);
        resetAutoplay();
      });
    });

    const startAutoplay = () => {
      autoplayTimer = setInterval(() => {
        let nextSlide = (currentSlide + 1) % sliderDots.length;
        updateSlider(nextSlide);
      }, 5000);
    };

    const resetAutoplay = () => {
      clearInterval(autoplayTimer);
      startAutoplay();
    };

    startAutoplay();

    // Pause autoplay on mouse hover
    const sliderContainer = document.querySelector('.reviews-container');
    if (sliderContainer) {
      sliderContainer.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
      sliderContainer.addEventListener('mouseleave', startAutoplay);
    }
  }

  // 7. Consultation Form & Success Modal
  // 구글 스프레드시트 연동용 Apps Script Web App URL이 있을 경우 아래 공란에 붙여넣으세요.
  // 예시: 'https://script.google.com/macros/s/AKfycbwXYZ.../exec'
  const GOOGLE_SHEET_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbw7ewaBs1Cb8wUgkpaTe5qwLbpFntdt49NQN9yykiMwpI9I-EuxnYqCySgj00nQ5nJ0bA/exec';

  const consultationForm = document.getElementById('consultationForm');
  const successModal = document.getElementById('successModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const submitBtn = consultationForm ? consultationForm.querySelector('.submit-btn') : null;

  if (consultationForm && successModal && closeModalBtn) {
    consultationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Basic validation check
      const clientName = document.getElementById('clientName').value.trim();
      const clientPhone = document.getElementById('clientPhone').value.trim();
      const clientEmail = document.getElementById('clientEmail').value.trim();
      const serviceType = document.getElementById('serviceType').value;
      const clientMessage = document.getElementById('clientMessage').value.trim();
      
      if (!clientName || !clientPhone || !clientEmail || !serviceType || !clientMessage) {
        alert('모든 필수 항목(*)을 채워주세요.');
        return;
      }
      
      // 버튼 상태 로딩 중으로 변경
      const originalBtnText = submitBtn ? submitBtn.innerText : '무료 상담 신청하기';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = '신청서 전송 중...';
        submitBtn.style.opacity = '0.7';
      }

      // 구글 스프레드시트 전송용 FormData 생성
      const formData = new FormData();
      formData.append('name', clientName);
      formData.append('phone', clientPhone);
      formData.append('email', clientEmail);
      formData.append('service', serviceType);
      formData.append('message', clientMessage);

      const showSuccess = () => {
        // 버튼 복구
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = originalBtnText;
          submitBtn.style.opacity = '1';
        }
        // 완료 모달 오픈 및 양식 리셋
        successModal.classList.add('active');
        consultationForm.reset();
      };

      // 올바른 Apps Script 웹앱 URL 형식인지 체크 ('script.google.com' 포함 여부)
      const isCorrectScriptUrl = GOOGLE_SHEET_WEB_APP_URL && GOOGLE_SHEET_WEB_APP_URL.includes('script.google.com');

      if (isCorrectScriptUrl) {
        // mode: 'no-cors'를 적용하여 스프레드시트 리다이렉션으로 인한 CORS 이슈 방지
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
          showSuccess(); // 네트워크 오류 등의 경우에도 예비 작동
        });
      } else {
        // 주소가 비어있거나 스프레드시트 주소(docs.google.com)가 잘못 입력된 경우 경고 로그 출력 후 시뮬레이션 완료 처리
        if (GOOGLE_SHEET_WEB_APP_URL && GOOGLE_SHEET_WEB_APP_URL.includes('docs.google.com')) {
          console.warn('주의: 입력하신 주소는 스프레드시트 보기 주소입니다. 데이터를 전송하려면 구글 앱스 스크립트(Apps Script) 배포 후 획득한 "웹앱 URL(script.google.com/.../exec)" 주소를 입력해야 합니다.');
        }
        setTimeout(() => {
          showSuccess();
        }, 800);
      }
    });

    closeModalBtn.addEventListener('click', () => {
      successModal.classList.remove('active');
    });

    // Close modal by clicking outside content
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        successModal.classList.remove('active');
      }
    });
  }
});
