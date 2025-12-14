(function() {
  'use strict';

  const _app = window.__app || {};
  window.__app = _app;

  const debounce = (fn, delay) => {
    let timer = null;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  const throttle = (fn, limit) => {
    let waiting = false;
    return function(...args) {
      if (!waiting) {
        fn.apply(this, args);
        waiting = true;
        setTimeout(() => { waiting = false; }, limit);
      }
    };
  };

  const isInViewport = (element, offset = 0) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) - offset &&
      rect.bottom >= offset
    );
  };

  class BurgerMenu {
    constructor() {
      this.nav = document.querySelector('.c-nav#main-nav');
      this.toggle = document.querySelector('.c-nav__toggle');
      this.navList = document.querySelector('.c-nav__list');
      this.body = document.body;
      
      if (!this.nav || !this.toggle || !this.navList) return;
      
      this.init();
    }

    init() {
      this.toggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleMenu();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen()) {
          this.close();
        }
      });

      document.addEventListener('click', (e) => {
        if (this.isOpen() && !this.nav.contains(e.target)) {
          this.close();
        }
      });

      const navLinks = document.querySelectorAll('.c-nav__link');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (this.isOpen()) {
            this.close();
          }
        });
      });

      window.addEventListener('resize', debounce(() => {
        if (window.innerWidth >= 1024 && this.isOpen()) {
          this.close();
        }
      }, 150), { passive: true });
    }

    isOpen() {
      return this.nav.classList.contains('is-open');
    }

    toggleMenu() {
      if (this.isOpen()) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.nav.classList.add('is-open');
      this.toggle.setAttribute('aria-expanded', 'true');
      this.body.classList.add('u-no-scroll');
    }

    close() {
      this.nav.classList.remove('is-open');
      this.toggle.setAttribute('aria-expanded', 'false');
      this.body.classList.remove('u-no-scroll');
    }
  }

  class SmoothScroll {
    constructor() {
      this.init();
    }

    init() {
      const isHomepage = location.pathname === '/' || location.pathname === '/index.html' || location.pathname.endsWith('/index.html');

      if (!isHomepage) {
        const sectionLinks = document.querySelectorAll('a[href^="#"]');
        sectionLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href && href !== '#' && href !== '#!' && href.length > 1) {
            link.setAttribute('href', '/' + href);
          }
        });
      }

      document.addEventListener('click', (e) => {
        let target = e.target;
        while (target && target.tagName !== 'A') {
          target = target.parentElement;
        }

        if (!target) return;

        const href = target.getAttribute('href');
        if (!href || !href.startsWith('#') || href === '#' || href === '#!') return;

        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          e.preventDefault();

          const header = document.querySelector('.l-header');
          const headerHeight = header ? header.offsetHeight : 80;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    }
  }

  class ActiveMenu {
    constructor() {
      this.init();
    }

    init() {
      const navLinks = document.querySelectorAll('.c-nav__link');
      let currentPath = location.pathname;

      if (currentPath === '' || currentPath === '/') {
        currentPath = '/index.html';
      }

      navLinks.forEach(link => {
        let linkPath = link.getAttribute('href');

        if (!linkPath) return;

        if (linkPath.startsWith('#')) {
          linkPath = '/index.html';
        }

        let normalizedLinkPath = linkPath;
        if (normalizedLinkPath === '/' || normalizedLinkPath === '') {
          normalizedLinkPath = '/index.html';
        }

        if (normalizedLinkPath === currentPath || 
            (currentPath === '/index.html' && (linkPath === '/' || linkPath === '/index.html'))) {
          link.setAttribute('aria-current', 'page');
          link.classList.add('active');
        } else {
          link.removeAttribute('aria-current');
          link.classList.remove('active');
        }
      });
    }
  }

  class ScrollSpy {
    constructor() {
      this.sections = document.querySelectorAll('[id]');
      this.navLinks = document.querySelectorAll('.c-nav__link');
      
      if (this.sections.length === 0 || this.navLinks.length === 0) return;
      
      this.init();
    }

    init() {
      window.addEventListener('scroll', throttle(() => {
        this.updateActiveLink();
      }, 100), { passive: true });

      this.updateActiveLink();
    }

    updateActiveLink() {
      const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
      const header = document.querySelector('.l-header');
      const headerHeight = header ? header.offsetHeight : 80;

      let current = '';

      this.sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight - 100;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
          current = section.getAttribute('id');
        }
      });

      this.navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          const id = href.substring(1);
          if (id === current) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        }
      });
    }
  }

  class ImageLoader {
    constructor() {
      this.init();
    }

    init() {
      const images = document.querySelectorAll('img');

      images.forEach(img => {
        if (!img.hasAttribute('loading') && 
            !img.classList.contains('c-logo__img') && 
            !img.hasAttribute('data-critical')) {
          img.setAttribute('loading', 'lazy');
        }

        if (!img.classList.contains('img-fluid')) {
          img.classList.add('img-fluid');
        }

        img.addEventListener('error', function() {
          const failedImg = this;
          const isLogo = failedImg.classList.contains('c-logo__img');

          const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f0f0f0"/><text x="50%" y="50%" fill="%23999" font-family="Arial" font-size="18" text-anchor="middle" dominant-baseline="middle">Image not available</text></svg>';
          const svgDataUrl = 'data:image/svg+xml,' + encodeURIComponent(svg);

          failedImg.src = svgDataUrl;
          failedImg.style.objectFit = 'contain';

          if (isLogo) {
            failedImg.style.maxHeight = '40px';
          }
        });
      });
    }
  }

  class FormValidator {
    constructor() {
      this.forms = document.querySelectorAll('.c-form');
      this.validators = {
        name: {
          pattern: /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/,
          message: 'Naam moet 2-50 tekens bevatten (alleen letters, spaties, koppeltekens en apostroffen)'
        },
        email: {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'Voer een geldig e-mailadres in'
        },
        phone: {
          pattern: /^[\d\s+\-()]{10,20}$/,
          message: 'Voer een geldig telefoonnummer in (10-20 cijfers)'
        },
        message: {
          minLength: 10,
          message: 'Bericht moet minimaal 10 tekens bevatten'
        }
      };
      
      if (this.forms.length === 0) return;
      
      this.init();
    }

    init() {
      this.forms.forEach(form => {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.handleSubmit(form);
        });

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
          input.addEventListener('blur', () => {
            this.validateField(input);
          });

          input.addEventListener('input', () => {
            if (input.classList.contains('has-error')) {
              this.validateField(input);
            }
          });
        });
      });
    }

    validateField(field) {
      const fieldName = field.getAttribute('name');
      const fieldValue = field.value.trim();
      const isRequired = field.hasAttribute('required') || field.hasAttribute('aria-required');
      
      this.clearError(field);

      if (isRequired && !fieldValue) {
        this.showError(field, 'Dit veld is verplicht');
        return false;
      }

      if (fieldValue) {
        if (fieldName === 'name') {
          if (!this.validators.name.pattern.test(fieldValue)) {
            this.showError(field, this.validators.name.message);
            return false;
          }
        }

        if (field.type === 'email' || fieldName === 'email') {
          if (!this.validators.email.pattern.test(fieldValue)) {
            this.showError(field, this.validators.email.message);
            return false;
          }
        }

        if (field.type === 'tel' || fieldName === 'phone') {
          if (!this.validators.phone.pattern.test(fieldValue)) {
            this.showError(field, this.validators.phone.message);
            return false;
          }
        }

        if (fieldName === 'message') {
          if (fieldValue.length < this.validators.message.minLength) {
            this.showError(field, this.validators.message.message);
            return false;
          }
        }
      }

      if (field.type === 'checkbox' && isRequired) {
        if (!field.checked) {
          this.showError(field, 'U moet akkoord gaan met deze voorwaarde');
          return false;
        }
      }

      return true;
    }

    showError(field, message) {
      field.classList.add('has-error');
      
      let errorElement = field.parentElement.querySelector('.c-form__error');
      
      if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'c-form__error';
        errorElement.setAttribute('role', 'alert');
        field.parentElement.appendChild(errorElement);
      }
      
      errorElement.textContent = message;
      field.setAttribute('aria-invalid', 'true');
    }

    clearError(field) {
      field.classList.remove('has-error');
      field.removeAttribute('aria-invalid');
      
      const errorElement = field.parentElement.querySelector('.c-form__error');
      if (errorElement) {
        errorElement.remove();
      }
    }

    validateForm(form) {
      const fields = form.querySelectorAll('input, textarea, select');
      let isValid = true;

      fields.forEach(field => {
        if (!this.validateField(field)) {
          isValid = false;
        }
      });

      return isValid;
    }

    async handleSubmit(form) {
      if (!this.validateForm(form)) {
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:8px;"></span>Verzenden...';
      }

      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      try {
        const response = await fetch('process.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();

        if (result.success) {
          this.showNotification('Uw bericht is succesvol verzonden!', 'success');
          form.reset();
          
          setTimeout(() => {
            window.location.href = 'thank_you.html';
          }, 1000);
        } else {
          this.showNotification(result.message || 'Er is een fout opgetreden. Probeer het later opnieuw.', 'error');
        }
      } catch (error) {
        this.showNotification('Er is een fout opgetreden. Controleer uw internetverbinding en probeer het opnieuw.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    }

    showNotification(message, type) {
      let container = document.getElementById('notification-container');
      
      if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;max-width:350px;';
        document.body.appendChild(container);
      }

      const notification = document.createElement('div');
      notification.className = `c-notification c-notification--${type}`;
      notification.style.cssText = `
        padding: 16px 20px;
        margin-bottom: 12px;
        background: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease-out;
      `;
      notification.textContent = message;
      
      container.appendChild(notification);

      setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
      }, 10);

      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          container.removeChild(notification);
        }, 300);
      }, 5000);
    }
  }

  class ScrollAnimations {
    constructor() {
      this.elements = document.querySelectorAll('.c-card, .c-feature, .c-feature-card, .c-offer-card, .c-mission-card, .c-goal-card, .c-team-card, .c-benefit-card, .c-service-card, .c-service-category, .c-specialized-service, .c-contact-item, .c-privacy-card');
      
      if (this.elements.length === 0) return;
      
      this.init();
    }

    init() {
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
              entry.target.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
            }, 50);
            
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      this.elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        setTimeout(() => {
          observer.observe(element);
        }, index * 50);
      });
    }
  }

  class CountUpAnimation {
    constructor() {
      this.statsElements = document.querySelectorAll('.c-stats__value');
      
      if (this.statsElements.length === 0) return;
      
      this.init();
    }

    init() {
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.hasAttribute('data-counted')) {
            this.animateValue(entry.target);
            entry.target.setAttribute('data-counted', 'true');
          }
        });
      }, observerOptions);

      this.statsElements.forEach(element => {
        observer.observe(element);
      });
    }

    animateValue(element) {
      const text = element.textContent;
      const number = parseInt(text.replace(/\D/g, ''));
      const suffix = text.replace(/[\d\s]/g, '');
      
      if (isNaN(number)) return;

      const duration = 2000;
      const stepTime = 30;
      const steps = duration / stepTime;
      const increment = number / steps;
      
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        
        if (current >= number) {
          element.textContent = number + suffix;
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(current) + suffix;
        }
      }, stepTime);
    }
  }

  class RippleEffect {
    constructor() {
      this.buttons = document.querySelectorAll('.c-btn, .c-button, .c-nav__link, .c-card, .c-feature-card');
      
      if (this.buttons.length === 0) return;
      
      this.init();
    }

    init() {
      this.buttons.forEach(button => {
        button.addEventListener('click', (e) => {
          this.createRipple(e, button);
        });
      });
    }

    createRipple(event, button) {
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        top: ${y}px;
        left: ${x}px;
        pointer-events: none;
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
      `;

      const existingRipple = button.querySelector('.ripple-effect');
      if (existingRipple) {
        existingRipple.remove();
      }

      ripple.className = 'ripple-effect';
      
      if (button.style.position === '' || button.style.position === 'static') {
        button.style.position = 'relative';
      }
      
      if (button.style.overflow === '') {
        button.style.overflow = 'hidden';
      }

      button.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
  }

  class ScrollToTop {
    constructor() {
      this.createButton();
      this.init();
    }

    createButton() {
      this.button = document.createElement('button');
      this.button.className = 'c-scroll-to-top';
      this.button.setAttribute('aria-label', 'Scroll naar boven');
      this.button.innerHTML = '↑';
      this.button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-secondary) 100%);
        color: #fff;
        border: none;
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 999;
      `;
      
      document.body.appendChild(this.button);
    }

    init() {
      window.addEventListener('scroll', throttle(() => {
        if (window.pageYOffset > 300) {
          this.button.style.opacity = '1';
          this.button.style.visibility = 'visible';
        } else {
          this.button.style.opacity = '0';
          this.button.style.visibility = 'hidden';
        }
      }, 100), { passive: true });

      this.button.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }

  class HoverEffects {
    constructor() {
      this.init();
    }

    init() {
      const cards = document.querySelectorAll('.c-card, .c-feature-card, .c-offer-card, .c-service-card');
      
      cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
          this.style.transform = '';
        });
      });

      const buttons = document.querySelectorAll('.c-btn, .c-button');
      
      buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
          this.style.transform = '';
        });
      });
    }
  }

  const injectStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple-animation {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .c-nav.is-open .c-nav__list {
        height: calc(100vh - var(--header-h));
      }
    `;
    document.head.appendChild(style);
  };

  _app.init = () => {
    if (_app.initialized) return;
    _app.initialized = true;

    injectStyles();
    
    new BurgerMenu();
    new SmoothScroll();
    new ActiveMenu();
    new ScrollSpy();
    new ImageLoader();
    new FormValidator();
    new ScrollAnimations();
    new CountUpAnimation();
    new RippleEffect();
    new ScrollToTop();
    new HoverEffects();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _app.init);
  } else {
    _app.init();
  }
})();