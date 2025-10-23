const mainScript = () => {
  const parseRem = (input) => input / 10 * parseFloat($('html').css('font-size'));

  const viewport = {
      get w() { return window.innerWidth; },
      get h() { return window.innerHeight; },
  };

  const device = { desktop: 991, tablet: 767, mobile: 479 };

  const debounce = (func, timeout = 300) => {
      let timer;
      return (...args) => {
          clearTimeout(timer);
          timer = setTimeout(() => func.apply(this, args), timeout);
      };
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  class SmoothScroll {
      constructor() {
          this.lenis = null;
          this.scroller = {
              scrollX: window.scrollX,
              scrollY: window.scrollY,
              velocity: 0,
              direction: 0
          };
          this.lastScroller = {
              scrollX: window.scrollX,
              scrollY: window.scrollY,
              velocity: 0,
              direction: 0
          };
      }

      init(data) {
          this.reinit(data);

          $.easing.lenisEase = function (t) {
              return Math.min(1, 1.001 - Math.pow(2, -10 * t));
          };

          gsap.ticker.add((time) => {
              if (this.lenis) {
                  this.lenis.raf(time * 1000);
              }
          });
          gsap.ticker.lagSmoothing(0);
      }

      reinit(data) {
          if (this.lenis) {
              this.lenis.destroy();
          }

          const wrapper = data
              ? data.next.container.querySelector('.main-inner')
              : document.querySelector('.main-inner');

          this.lenis = new Lenis({
              wrapper: wrapper || undefined,
          });

          this.lenis.on('scroll', (e) => {
              // this.updateOnScroll(e);
              ScrollTrigger.update();
          });
      }

      updateOnScroll(e) {
          this.scroller.scrollX = e.scroll;
          this.scroller.scrollY = e.scroll;
          this.scroller.velocity = e.velocity;
          this.scroller.direction = e.direction;
      }

      start() {
          if (this.lenis) {
              this.lenis.start();
          }
      }

      stop() {
          if (this.lenis) {
              this.lenis.stop();
          }
      }

      scrollTo(target, options = {}) {
          if (this.lenis) {
              this.lenis.scrollTo(target, options);
          }
      }

      scrollToTop() {
          this.scrollTo(0, { duration: 0, immediate: true });
      }

      destroy() {
          if (this.lenis) {
              gsap.ticker.remove((time) => {
                  this.lenis.raf(time * 1000);
              });
              this.lenis.destroy();
              this.lenis = null;
          }
      }
  }

  const smoothScroll = new SmoothScroll();

  const initGSAP = () => {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.defaults({
          invalidateOnRefresh: true,
          scroller: '.main-inner',
      });
  };

  const killAllScrollTriggers = () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  };

  const refreshScrollTriggers = () => {
      ScrollTrigger.refresh();
  };

  const updateCurrentNav = (url) => {
      const currentPath = new URL(url).pathname.replace(/\/$/, '') || '/';

      document.querySelectorAll('.w--current').forEach(el => {
          el.classList.remove('w--current');
          el.removeAttribute('aria-current');
      });

      document.querySelectorAll('a[href]').forEach(link => {
          const linkPath = link.getAttribute('href');
          if (!linkPath || linkPath.startsWith('#') || linkPath.startsWith('http') || linkPath.startsWith('mailto:') || linkPath.startsWith('tel:')) return;

          const normalizedLinkPath = linkPath.replace(/\/$/, '') || '/';
          if (normalizedLinkPath === currentPath) {
              link.classList.add('w--current');
              link.setAttribute('aria-current', 'page');
          }
      });
  };

  const reinitializeWebflow = () => {
      if (!window.Webflow) return;

      try {
          window.Webflow.destroy();
          window.Webflow.ready();
          const ix2 = window.Webflow.require('ix2');
          if (ix2 && typeof ix2.init === 'function') {
              ix2.init();
          }
          const forms = window.Webflow.require('forms');
          if (forms && typeof forms.ready === 'function') {
              forms.ready();
          }
          ['slider', 'tabs', 'dropdown', 'navbar'].forEach(module => {
              try {
                  const mod = window.Webflow.require(module);
                  if (mod && typeof mod.ready === 'function') {
                      mod.ready();
                  }
              } catch (e) {}
          });
          if (window.Webflow.redraw) {
              window.Webflow.redraw.up();
          }
      } catch (e) {
          console.warn('Webflow reinit failed:', e);
      }
  };

  class Loading extends HTMLElement {
      constructor() {
          super();
          this.el = this;
          this.isAnimating = false;
          this.tl = null;
      }

      connectedCallback() {
          this.initialLoad();
      }

      initialLoad() {
          this.tl = gsap.timeline({
              onComplete: () => {
                  this.querySelector('.loading').classList.add('loaded');
              }
          });

          this.tl.to('.loading-logo', { opacity: 0, duration: 0.6 }, '<=0.6');
      }

      show() {
          if (this.isAnimating) return Promise.resolve();
          this.isAnimating = true;

          return new Promise((resolve) => {
              this.querySelector('.loading').classList.remove('loaded');

              this.tl = gsap.timeline({
                  onComplete: () => {
                      this.isAnimating = false;
                      resolve();
                  }
              })
              .to('.loading-logo', {
                  opacity: 1,
                  duration: 0.3
              });
          });
      }

      hide() {
          if (this.isAnimating) return Promise.resolve();
          this.isAnimating = true;

          return new Promise((resolve) => {
              this.tl = gsap.timeline({
                  onComplete: () => {
                      this.isAnimating = false;
                      this.querySelector('.loading').classList.add('loaded');
                      resolve();
                  }
              })
              .to('.loading-logo', {
                  opacity: 0,
                  duration: 0.3
              })
          });
      }

      destroy() {
          if (this.tl) {
              this.tl.kill();
          }
          gsap.killTweensOf(this);
          gsap.killTweensOf('.loading-logo');
          gsap.killTweensOf('.loading-logo-path');
      }
  }
  if (!customElements.get('loading-wrap')) {
      customElements.define('loading-wrap', Loading);
  }

  class Header extends HTMLElement {
      constructor() {
          super();
          this.el = this;
          this.navEl = this.querySelector('.header-act');
          this.toggle = this.querySelector('.header-toggle-btn');
          this.allLinks = this.querySelectorAll('.header-link[data-link="section"]');
          this.allFooterLinks = document.querySelectorAll('.footer-link[href^="/#"]');
          this.currentPage = null;
          this.headerEl = this.querySelector('.header');
      }

      connectedCallback() {
          this.currentPage = document.querySelector('[data-barba-namespace]')?.getAttribute('data-barba-namespace');
          this.setup();
          this.interact();
      }

      setup() {
      }
      interact() {
      }
      updatePage(pageName) {
          this.currentPage = pageName;
      }
      toggleSticky(state) {
          if (state) {
              this.headerEl.classList.add('on-scroll')
          } else {
              this.headerEl.classList.remove('on-scroll')
          }
      }
      destroy() {
      }
  }

  if (!customElements.get('header-component')) {
      customElements.define('header-component', Header);
  }

  const HomePage = {
      'home-hero-wrap': class extends HTMLElement {
          constructor() {
              super();
              this.tlTrigger = null;
          }

          connectedCallback() {
              this.tlTrigger = gsap.timeline({
                  scrollTrigger: {
                      trigger: this,
                      start: 'top bottom+=50%',
                      end: 'bottom top-=50%',
                      once: true,
                      onEnter: () => {
                          this.onTrigger();
                      }
                  }
              });
          }

          onTrigger() {
              this.setup();
              this.interact();
          }

          setup() {
          }

          interact() {
          }

          destroy() {
              if (this.tlTrigger) {
                  this.tlTrigger.kill();
              }
          }
      }
  };

  const PricingPage = {
      'pricing-hero-wrap': class extends HTMLElement {
          constructor() {
              super();
              this.tlTrigger = null;
          }
      }
  };

  class PageManager {
      constructor(page) {
          if (!page || typeof page !== 'object') {
              throw new Error('Invalid page configuration');
          }

          this.registeredComponents = new Set();
          this.sections = [];

          Object.entries(page).forEach(([name, Component]) => {
              if (typeof Component !== 'function') {
                  throw new Error(`Section "${name}" must be a class constructor`);
              }

              if (!customElements.get(name)) {
                  try {
                      customElements.define(name, Component);
                      this.registeredComponents.add(name);
                  } catch (error) {
                      console.warn(`Custom element "${name}" is already registered`);
                  }
              }

              const elements = document.querySelectorAll(name);
              elements.forEach(el => {
                  if (!el._instance) {
                      el._instance = el;
                      this.sections.push(el);
                  }
              });
          });
      }

      destroy() {
          this.sections.forEach(section => {
              if (typeof section.destroy === 'function') {
                  section.destroy();
              }
              section._instance = null;
          });
          this.sections = [];
      }
  }

  const pageConfig = {
      home: HomePage,
      pricing: PricingPage,
  };

  let currentPageManager = null;
  let headerComponent = null;

  const updateHeader = (namespace) => {
      headerComponent = document.querySelector('header-component');
      if (headerComponent && smoothScroll.lenis) {
          smoothScroll.lenis.on('scroll', (inst) => {
              if (headerComponent) {
                  headerComponent.toggleSticky(inst.scroll >= headerComponent.clientHeight);
              }
          });
      }
  };

  const homePageManager = {
      init(data) {
          if (pageConfig.home) {
              currentPageManager = new PageManager(pageConfig.home);
          }
          updateHeader('home');
      },
      destroy(data) {
          if (currentPageManager) {
              currentPageManager.destroy();
              currentPageManager = null;
          }
      }
  };

  const pricingPageManager = {
      init(data) {
          if (pageConfig.pricing) {
              currentPageManager = new PageManager(pageConfig.pricing);
          }
          updateHeader('pricing');
      },
      destroy(data) {
          if (currentPageManager) {
              currentPageManager.destroy();
              currentPageManager = null;
          }
      }
  };

  const SCRIPT = {
      home: {
          namespace: 'home',
          afterEnter(data) {
              smoothScroll.reinit(data);
              homePageManager.init(data);
          },
          beforeLeave(data) {
              homePageManager.destroy(data);
          }
      },
      pricing: {
          namespace: 'pricing',
          afterEnter(data) {
              smoothScroll.reinit(data);
              pricingPageManager.init(data);
          },
          beforeLeave(data) {
              pricingPageManager.destroy(data);
          }
      }
  };

  const VIEWS = Object.values(SCRIPT);

  const initBarba = () => {
      barba.use(barbaPrefetch);
      barba.init({
          preventRunning: true,
          sync: false,
          timeout: 5000,
          views: VIEWS,

          transitions: [{
              name: 'default-transition',

              once({ next }) {
                  updateCurrentNav(next.url.href);
                  return Promise.resolve();
              },

              async leave({ current }) {
                  const done = this.async();

                  smoothScroll.stop();

                  killAllScrollTriggers();

                  await gsap.to(current.container, {
                      opacity: 0,
                      duration: 0.3,
                      ease: 'power2.in'
                  });

                  const loadingElement = document.querySelector('loading-wrap');
                  if (loadingElement) {
                      await loadingElement.show();
                  }

                  done();
              },

              async afterLeave({ current }) {
                  current.container.remove();
              },

              async beforeEnter({ next }) {
                  smoothScroll.scrollToTop();

                  gsap.set(next.container, { opacity: 0 });
              },

              async enter({ next }) {
                  smoothScroll.start();

                  await delay(50);

                  const loadingElement = document.querySelector('loading-wrap');
                  if (loadingElement) {
                      await loadingElement.hide();
                  }

                  gsap.set(next.container, { opacity: 1 });

                  refreshScrollTriggers();
              },

              async after({ next }) {
                  updateCurrentNav(next.url.href);

                  reinitializeWebflow();

                  await delay(100);
                  refreshScrollTriggers();
              }
          }]
      });
  };

  const init = () => {
      smoothScroll.init();

      initGSAP();

      initBarba();
  };

  init();
};

window.onload = mainScript;
