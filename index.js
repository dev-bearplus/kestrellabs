const mainScript = () => {
   gsap.registerPlugin(ScrollTrigger, SplitText, TextPlugin);
   ScrollTrigger.defaults({
      invalidateOnRefresh: true,
      scroller: ".main-inner",
   });
   const xSetter = (el) => gsap.quickSetter(el, 'x', 'px');
   const ySetter = (el) => gsap.quickSetter(el, 'y', 'px');
   const xGetter = (el) => gsap.getProperty(el, 'x');
   const yGetter = (el) => gsap.getProperty(el, 'y');

	const viewport = {
		get w() {
			return window.innerWidth;
		},
		get h() {
			return window.innerHeight;
		},
   };
   const cvUnit = (val, unit) => {
      let result;
      switch (true) {
         case unit === 'vw':
            result = window.innerWidth * (val / 100);
            break;
         case unit === 'vh':
            result = window.innerHeight * (val / 100);
            break;
         case unit === 'rem':
            result = val / 10 * parseFloat($('html').css('font-size'));
            break;
         default: break;
      }
      return result;
   }
   const isInViewport = (el, orientation = 'vertical') => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (orientation == 'horizontal') {
            return (
               rect.left <= (window.innerWidth) &&
               rect.right >= 0
            );
      } else {
            return (
               rect.top <= (window.innerHeight) &&
               rect.bottom >= 0
            );
      }
   }

   const isMouseInArea = (el, mousePos) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return mousePos.x >= rect.left && mousePos.x <= rect.right &&
            mousePos.y >= rect.top && mousePos.y <= rect.bottom;
   };
   const debounce = (func, timeout = 300) => {
         let timer

         return (...args) => {
            clearTimeout(timer)
            timer = setTimeout(() => { func.apply(this, args) }, timeout)
         }
   }
   const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
   const lerp = (a, b, t) => (1 - t) * a + t * b;
   const distance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
   const normalize = (mousePos, maxDis) => (mousePos / maxDis - 0.5) * 2;
   const getAllScrollTrigger = (fn) => {
      let triggers = ScrollTrigger.getAll();
      triggers.forEach(trigger => {
         if (fn === "refresh") {
            if (trigger.progress === 0) {
               trigger[fn]?.();
            }
         } else {
            trigger[fn]?.();
         }
      });
   };
   function documentHeightObserver(action, data, callback) {
      let resizeObserver;
      let debounceTimer;
      let observerEl = data?.next.container.querySelector('.main-content');
      let previousHeight = observerEl?.scrollHeight;

      function onRefresh() {
         clearTimeout(debounceTimer);
         debounceTimer = setTimeout(() => {
            const currentHeight = observerEl.scrollHeight;

            if (currentHeight !== previousHeight) {
                  if (smoothScroll.lenis) {
                     smoothScroll.lenis.resize();
                     getAllScrollTrigger("refresh");
                  }
                  if (callback) {
                     callback();
                  }
                  previousHeight = currentHeight;
            }
         }, 200);
      }

      if (action === "init") {
         if (!observerEl) return;
         resizeObserver = new ResizeObserver(onRefresh);
         resizeObserver.observe(observerEl);
      } else if (action === "disconnect") {
         if (resizeObserver) {
            resizeObserver.disconnect();
         }
      }
   };
   function resetScroll(data) {
      if (window.location.hash !== '') {
         if ($(window.location.hash).length >= 1) {
            $("html").animate({ scrollTop: $(window.location.hash).offset().top - 100 }, 1200);

            setTimeout(() => {
                  $("html").animate({ scrollTop: $(window.location.hash).offset().top - 100 }, 1200);
            }, 300);
         } else {
            scrollTop()
         }
      } else if (window.location.search !== '') {
         let searchObj = JSON.parse('{"' + decodeURI(location.search.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
         if (searchObj.sc) {
            if ($(`#${searchObj.sc}`).length >= 1) {
                  let target = `#${searchObj.sc}`;
                  setTimeout(() => {
                     smoothScroll.scrollTo(`#${searchObj.sc}`, {
                        offset: -100
                     })
                  }, 500);
                  barba.history.add(`${window.location.pathname + target}`, 'barba', 'replace');
            } else {
                  scrollTop()
            }
         }
      } else {
         scrollTop()
      }
   };
   function scrollTop(onComplete) {
      if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
      smoothScroll.scrollToTop({
         onComplete: () => {
            onComplete?.();
            getAllScrollTrigger("refresh");
         }
      });
   };
   const formSubmitEvent = (function () {
      const init = ({
         onlyWorkOnThisFormName,
         onSuccess,
         onFail
      }) => {
         let inputSubmit = $(`#${getIDFormName(onlyWorkOnThisFormName)} .input-submit-wrap .txt`);

         $(document).on('ajaxSend', function (event, xhr, settings) {
            if (settings.url.includes("https://webflow.com/api/v1/form/")) {
                  inputSubmit?.text('Please wait...');
                  console.log("please wait...")
            }
         });
         $(document).on('ajaxComplete', function (event, xhr, settings) {
            if (settings.url.includes("https://webflow.com/api/v1/form/")) {
                  const isSuccessful = xhr.status === 200
                  const isWorkOnAllForm = onlyWorkOnThisFormName == undefined
                  const isCorrectForm = !isWorkOnAllForm && settings.data.includes(getSanitizedFormName(onlyWorkOnThisFormName));

                  if (isWorkOnAllForm) {
                     if (isSuccessful) {
                        onSuccess?.()
                        inputSubmit?.text('Sent');
                     } else {
                        onFail?.()
                     }
                  } else if (isCorrectForm) {
                     if (isSuccessful) {
                        onSuccess?.()
                        inputSubmit?.text('Sent');
                     } else {
                        onFail?.()
                     }
                  }
            }
         });
      }
      function getIDFormName(name) {
         return name.toLowerCase().replaceAll(" ", "-");
      }
      function getSanitizedFormName(name) {
         return name.replaceAll(" ", "+")
      }
      return {
         init
      }
   })();
   class Marquee {
      constructor(list, item, duration = 40) {
         this.list = list;
         this.item = item;
         this.duration = duration;
      }
      setup(isReverse) {
         const cloneAmount = Math.ceil($(window).width() / this.list.width()) + 1;

         let itemClone = this.item.clone();
         let itemWidth = this.item.width();
         this.list.html('');
         new Array(cloneAmount).fill().forEach(() => {
            let html = itemClone.clone()
            html.css('animation-duration', `${Math.ceil(itemWidth / this.duration)}s`);
            if (isReverse) {
                  html.css('animation-direction', 'reverse');
            }
            html.addClass('marquee-left');
            this.list.append(html);
         });
      }
      play() {
         $(this.list).find('.marquee-left').addClass('anim');
      }
   }
	class SmoothScroll {
		constructor() {
			this.lenis = null;
			this.scroller = {
				scrollX: window.scrollX,
				scrollY: window.scrollY,
				velocity: 0,
				direction: 0,
			};
			this.lastScroller = {
				scrollX: window.scrollX,
				scrollY: window.scrollY,
				velocity: 0,
				direction: 0,
			};
		}

		init(data) {
			this.reInit(data);

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

      reInit(data) {
			if (this.lenis) {
				this.lenis.destroy();
			}
         this.lenis = new Lenis({
               content: data.next.container,
               wrapper: data.next.container,
               smoothTouch: false,
               infinite: false,
         })
			this.lenis.on("scroll", (e) => {
				this.updateOnScroll(e);
				ScrollTrigger.update();
			});
      }
      reachedThreshold(threshold) {
         if (!threshold) return false;
         const dist = distance(this.scroller.scrollX, this.scroller.scrollY, this.lastScroller.scrollX, this.lastScroller.scrollY);

         if (dist > threshold) {
            this.lastScroller = {...this.scroller };
            return true;
         }
         return false;
      }

		updateOnScroll(e) {
			this.scroller.scrollX = e.scroll;
			this.scroller.scrollY = e.scroll;
			this.scroller.velocity = e.velocity;
         this.scroller.direction = e.direction;
         if (header) {
            header.updateOnScroll(smoothScroll.lenis);
         };
		}

		start() {
			if (this.lenis) {
            this.lenis.start();
			}
         $('.body').css('overflow', 'initial');
		}

		stop() {
			if (this.lenis) {
				this.lenis.stop();
         }
         $('.body').css('overflow', 'hidden');
		}

		scrollTo(target, options = {}) {
			if (this.lenis) {
				this.lenis.scrollTo(target, options);
			}
		}

      scrollToTop(options = {}) {
         if (this.lenis) {
            this.lenis.scrollTo("top", { duration: .0001, immediate: true, lock: true, ...options });
         }
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
	const reinitializeWebflow = (data) => {
		if (!window.Webflow) return;

		try {
			window.Webflow.destroy();
			window.Webflow.ready();
			const ix2 = window.Webflow.require("ix2");
			if (ix2 && typeof ix2.init === "function") {
				ix2.init();
			}
			const forms = window.Webflow.require("forms");
			if (forms && typeof forms.ready === "function") {
				forms.ready();
			}
			["slider", "tabs", "dropdown", "navbar"].forEach((module) => {
				try {
					const mod = window.Webflow.require(module);
					if (mod && typeof mod.ready === "function") {
						mod.ready();
					}
				} catch (e) {}
			});
			if (window.Webflow.redraw) {
				window.Webflow.redraw.up();
         }

         if (data) {
            let parser = new DOMParser();
            let dom = parser.parseFromString(data.next.html, "text/html");
            let webflowPageId = $(dom).find("html").attr("data-wf-page");
            $("html").attr("data-wf-page", webflowPageId);
         }
		} catch (e) {
			console.warn("Webflow reinit failed:", e);
		}
   };
   class Mouse {
      constructor() {
         this.mousePos = {x: 0, y: 0};
         this.cacheMousePos = {...this.mousePos};
         this.lastMousePos = {...this.mousePos};
         this.normalizeMousePos = {
            current: {x: 0.5, y: 0.5},
            target: {x: 0.5, y: 0.5}
         };
         this.cursorRaf = null;
         this.init();

         // Add mouse move event listener
         window.addEventListener('mousemove', (e) => {
            this.mousePos = this.getPointerPos(e);
         });
         window.addEventListener('touchmove', () => {
            this.mousePos = this.getPointerPos(e);
         });
      }

      init() {
         if (viewport.w > 991) {
            requestAnimationFrame(this.update.bind(this));
         }
      }

      update() {
         this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
         this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);

         this.normalizeMousePos.target.x = this.mousePos.x / window.innerWidth;
         this.normalizeMousePos.target.y = this.mousePos.y / window.innerHeight;

         if (!this.cursorRaf) {
            this.cursorRaf = requestAnimationFrame(this.lerpCursorPos.bind(this));
         }
         // this.toggleCursor();
         requestAnimationFrame(this.update.bind(this));
      }

      getPointerPos(ev) {
         if (ev.touches) {
            return {
               x: ev.touches[0].clientX,
               y: ev.touches[0].clientY
            };
         }
         return {
            x: ev.clientX,
            y: ev.clientY
         };
      }

      lerpCursorPos = () => {
         this.normalizeMousePos.current.x = lerp(this.normalizeMousePos.current.x, this.normalizeMousePos.target.x, 0.1);
         this.normalizeMousePos.current.y = lerp(this.normalizeMousePos.current.y, this.normalizeMousePos.target.y, 0.1);

         const delta = distance(
            this.normalizeMousePos.target.x,
            this.normalizeMousePos.current.x,
            this.normalizeMousePos.target.y,
            this.normalizeMousePos.current.y
         );


         if (delta < 0.001 && this.cursorRaf) {
            cancelAnimationFrame(this.cursorRaf);
            this.cursorRaf = null;
            this.resetCursor();
            return;
         }
         else {
            this.cursorRaf = requestAnimationFrame(this.lerpCursorPos.bind(this));
            this.toggleCursor();
         }
      }

      reachedThreshold(threshold) {
         if (!threshold) return false;
         const dist = distance(this.mousePos.x, this.mousePos.y, this.lastMousePos.x, this.lastMousePos.y);
         if (dist > threshold) {
            this.lastMousePos = { ...this.mousePos };
            return true;
         }
         return false;
      }
      toggleCursor() {
         const hoverElements = $('[data-cursor]:hover');
         const cursor = $('.cursor-main');

         if (hoverElements.length) {
            xSetter(cursor)(this.normalizeMousePos.current.x * window.innerWidth);
            ySetter(cursor)(this.normalizeMousePos.current.y * window.innerHeight);

            // Get the last hovered element's cursor type (topmost element)
            const type = $(hoverElements[hoverElements.length - 1]).attr('data-cursor');
            switch (type) {
               case 'drag':
                     // Add drag cursor styling
                     cursor.removeClass('hidden');
                     $('.cursor-drag').addClass('active');
                     break;
               case 'hidden':
                     cursor.addClass('hidden');
                     break;
               default:
                     // Reset cursor to default
                     cursor.removeClass('hidden');
                     $('.cursor-drag').removeClass('active');
                     break;
            }
         }
         else {
            this.resetCursor();
         }
      }

      resetCursor() {
         // Reset cursor styles
         $('.cursor-drag').removeClass('active');
      }
   }
   const mouse = new Mouse();
	class Loader {
      constructor() {
         this.isLoaded = sessionStorage.getItem('isLoaded') === 'true' ? true : false;
         this.tlLoadDone = null;
         this.tlLoadMaster = null;
      }
      init(data) {
         this.tlLoading = gsap.timeline({
            paused: true
         })
         this.tlLoadMaster = gsap.timeline({
            paused: true,
            delay: this.isLoaded ? 0 : 1,
            duration:1,
            onStart: () => {
                  this.onceSetup(data);
            },
            onComplete: () => {
                  this.oncePlay(data);
            }
         })
         this.tlLoadMaster
            .to(this.tlLoading, { duration: this.tlLoading.totalDuration(), progress: 1, ease: 'none' })
      }
      play(data) {
          // requestAnimationFrame(() => {
          //     this.devMode(data);
          // })
          // return;
         this.tlLoadMaster.play();
      }
      devMode(data) {
         this.onceSetup(data);
         this.oncePlay(data);
         $('.loader').remove();
      }
      onceSetup(data) {
         globalHooks.triggerOnceSetup(data);
      }
      oncePlay(data) {
         globalHooks.triggerOncePlay(data);
         $('.loader').css('pointer-events', 'none');
         sessionStorage.setItem('isLoaded', true);
         if (viewport.w > 767) {
            $('.body').css({
               'overflow': 'initial',
               'position': 'relative',
               'max-height': 'none',
               'inset': 'auto'
            })
         }
      }
   }
   const loader = new Loader();

   class GlobalChange {
      constructor() {
         this.namespace = null;
      }
      init(data) {
         this.namespace = data.next.namespace;
         this.refreshOnBreakpoint();
         this.updateLink(data);
      }
      update(data) {
         this.updateLink(data);
         header.update(data);
      }
      updateLink(data) {
         $("a").each(function (index, link) {
            let href = $(this).attr("href").replace(/\/$/, "") || "/";

            if ($(this).attr('data-sub-link') && (!href.includes('#')) && (!href.includes('?sc='))) {
               $(this).attr('href', `${href}#${$(this).attr('data-sub-link')}`);
               $(this).attr('data-barba-history', 'replace');
            }

            const [urlPath, anchor] = href.includes('#') ? href.split('#') : href.includes('?sc=') ? href.split('?sc=') : [href, ''];

            $(this).toggleClass("w--current", href == `${window.location.pathname}${window.location.hash}`);
            $(this).attr('aria-current', $(this).hasClass('w--current') ? 'page' : '');

            if (!anchor) {
               return;
            }
            else {
               if (urlPath === `${window.location.pathname}` || urlPath === '') {
                  $(this).attr('href', `${window.location.pathname}#${anchor}`);
               }
               else {
                  $(this).attr('href', `${urlPath}?sc=${anchor}`);
               }
            }
         });
         $('a').on('click', function (e) {
            if ($(this).attr('data-sub-link')) {
               barba.history.add(`${window.location.pathname + `#${$(this).attr('data-sub-link')}`}`, 'barba', 'replace');

               requestAnimationFrame(() => {
                     setTimeout(() => {
                        $(`#${$(this).attr('data-sub-link')}`).trigger('click');
                     }, $(this).hasClass('w--current') ? 0 : 1000);

                     $("a").each(function (index, link) {
                        $(link).toggleClass("w--current", $(link).attr('href') == `${window.location.pathname}${window.location.hash}`);
                     });
               })
            }
         })
      }
      refreshOnBreakpoint() {
         const breakpoints = [479, 767, 991];
         const initialViewportWidth = viewport.w || document.documentElement.clientWidth;
         const breakpoint = breakpoints.find(bp => initialViewportWidth < bp) || breakpoints[breakpoints.length - 1];
         window.addEventListener('resize', debounce(function () {
            const newViewportWidth = viewport.w || document.documentElement.clientWidth;
            if ((initialViewportWidth < breakpoint && newViewportWidth >= breakpoint) ||
               (initialViewportWidth >= breakpoint && newViewportWidth < breakpoint)) {
               location.reload();
            }
         }));
      }
   }
   const globalChange = new GlobalChange();

   class GlobalHooks {
      constructor() {
      }
      triggerEvent(eventName, data) {
            const event = new CustomEvent(eventName, { detail: data });
            data.next.container.dispatchEvent(event);
      }
      triggerOnceSetup(data) {
            console.log('Global Hooks: onceSetup');
            this.triggerEvent("onceSetup", data);
      }
      triggerOncePlay(data) {
            console.log('Global Hooks: oncePlay');
            this.triggerEvent("oncePlay", data);
            requestAnimationFrame(() => window.scrollY === 0 && window.scrollTo(0, 1))
      }
      triggerEnterSetup(data) {
            console.log('Global Hooks: enterSetup');
            this.triggerEvent("enterSetup", data);
            requestAnimationFrame(() => window.scrollY === 0 && window.scrollTo(0, 1))
      }
      triggerEnterPlay(data) {
            console.log('Global Hooks: enterPlay');
            this.triggerEvent("enterPlay", data);
      }
   }
   const globalHooks = new GlobalHooks();

   class PageTrans {
      constructor() {
         this.tlLeave = null;
         this.tlEnter = null;
         this.el = document.querySelector('.trans');
      }
      leaveAnim(data) {
         this.tlLeave = gsap.timeline({
            onStart: () => {
               this.updateBeforeTrans.bind(this)(data);
            },
            onComplete: () => {
               this.updateAfterTrans.bind(this)(data);
            }
         })
         this.tlLeave
            .fromTo(data.current.container, {opacity: 1}, {duration: .6, opacity: 0})

         return this.tlLeave;
      }
      enterAnim(data) {
         this.tlEnter = gsap.timeline({
            delay: .5,
            onStart: () => {
               this.enterSetup(data);
               setTimeout(() => {
                     this.enterPlay(data);
               }, 100);
            },
         })

         this.tlEnter
            .fromTo(data.next.container, { opacity: 0 }, { duration: .6, opacity: 1, clearProps: 'all' }, 0)
         return this.tlEnter;
      }
      async play(data) {
         await pageTrans.leaveAnim(data).then(() => {
            pageTrans.enterAnim(data)
         })
      }
      enterSetup(data) {
         globalHooks.triggerEnterSetup(data);
      }
      enterPlay(data) {
         globalHooks.triggerEnterPlay(data);
      }
      updateBeforeTrans(data) {
         gsap.set(data.next.container, { opacity: 0, 'pointer-events': 'none', zIndex: 1 })
         smoothScroll.stop();
         smoothScroll.destroy();
         getAllScrollTrigger("kill");
         documentHeightObserver('disconnect');
         if (data.current.container) {
            $(data.current.container).css('z-index', 2);
         }
      }
      updateAfterTrans(data) {
         smoothScroll.reInit(data)
         scrollTop();
         resetScroll();
         smoothScroll.start();
         globalChange.update(data);

         documentHeightObserver('init', data);
         reinitializeWebflow(data);
         if (data.current.container) {
            data.current.container.remove();
         }
      }
   }
   const pageTrans = new PageTrans();

   class TriggerSetup {
      constructor() {
         this.tlTrigger = null;
         this.once = true;
      }
      setTrigger(triggerEl, onTrigger) {
         this.tlTrigger = gsap.timeline({
            scrollTrigger: {
               trigger: triggerEl,
               start: 'clamp(top bottom+=50%)',
               end: 'bottom top-=50%',
               onEnter: () => {
                     if (this.once) {
                        this.once = false;
                        this.onTrigger();
                     }
               },
               onEnterBack: () => {
                     if (this.once) {
                        this.once = false;
                        onTrigger();
                     }
               },
            }
         })
      }
      cleanTrigger() {
         if (this.isPlayed) {
            this.isPlayed = false;
         }
         if (!this.once) {
            this.once = true;
         }
            if (this.tlTrigger) {
               this.tlTrigger.kill();
               this.tlTrigger = null;
            }
      }
   }
   class Header {
      constructor() {
         this.el = null;
         this.isOpen = false;
      }
      init(data) {
         this.el = document.querySelector('.header');
         if (viewport.w <= 991) {
            this.toggleNav();
         }
      }
      update(data) {
         console.log("update link & mode")
      }
      updateOnScroll(inst) {
         this.toggleHide(inst);
         this.toggleScroll(inst);
      }
      toggleScroll(inst) {
         if (inst.scroll > $(this.el).height() * 1) {
            $(this.el).addClass("on-scroll");
         }
         else {
            $(this.el).removeClass("on-scroll");
         };
      }
      toggleHide(inst) {
         if (inst.direction == 1) {
            if (inst.scroll > ($(this.el).height() * 3)) {
               $(this.el).addClass('on-hide');
            }
         } else if (inst.direction == -1) {
            if (inst.scroll > ($(this.el).height() * 3)) {
               $(this.el).addClass("on-hide");
               $(this.el).removeClass("on-hide");
               setTimeout(() => {
                  if (
                     inst.scroll > ($(this.el).height() * 3) &&
                     inst.scroll === smoothScroll.scroller.scrollY
                     && inst.velocity === 0
                     && !$(this.el).hasClass('on-hide')
                     && !$(this.el).is(':hover')
                  ) {
                     $(this.el).addClass('on-hide');
                  }
               }, 2500);
            }
         }
         else {
            $(this.el).removeClass("on-hide");
         }
      }
      toggleNav() {
         $(this.el).find('.header-ham').on('click', this.handleClick.bind(this));
         $(this.el).find('.header-menu-link, .header-logo, .header-btn').on('click', () => setTimeout(() => this.close(), 800));
         $(window).on('click', (e) => {
            if (!$('.header-ham:hover').length)
               if (!$('.header-menu:hover').length)
                     this.close();
         })
      }
      handleClick(e) {
         e.preventDefault();
         this.isOpen ? this.close() : this.open();
      }
      open() {
         if (this.isOpen) return;
         $('.header').addClass('on-open-nav');
         $('.header-ham').addClass('active');
         this.isOpen = true;
         smoothScroll.lenis.stop();
      }
      close() {
            if (!this.isOpen) return;
            $('.header').removeClass('on-open-nav');
            $('.header-ham').removeClass('active');
            this.isOpen = false;
            smoothScroll.lenis.start();
      }
   }
   const header = new Header();
   class Footer extends TriggerSetup {
      constructor() {
         super();
         this.el = null;
         this.tlOverlap = null;
         this.raf = null;
      }
      trigger(data) {
         this.el = data.next.container.querySelector('.footer');
         super.setTrigger(this.el, this.onTrigger.bind(this));
      }
      onTrigger() {
         this.animationReveal();
         this.animationScrub();
         this.interact();
      }
      animationReveal() {
      }
      animationScrub() {
      }
      interact() {
         this.hoverLogo();
      }
      hoverLogo() {
         this.footerLogoWrap = $(this.el).find('.footer-img-wrap').get(0);
         this.raf = requestAnimationFrame(() => this.render());
         this.lastScrollY = smoothScroll.scroller.scrollY;
         this.lastMousePos = { ...mouse.cacheMousePos };
         this.currentX = 0;
         this.currentY = 0;
         this.targetX = 0;
         this.targetY = 0;
         this.isEntered = false;
      }

      render() {
         if (isMouseInArea(this.footerLogoWrap, mouse.mousePos)) {
            if (!this.isEntered) {
               this.onEnter();
               this.isEntered = true;
            }
            if (
               mouse.cacheMousePos.y !== this.lastMousePos.y ||
               mouse.cacheMousePos.x !== this.lastMousePos.x ||
               smoothScroll.scroller.scrollY !== this.lastScrollY) {
               this.updateTargetPosition();
            }
            this.moveElement();
         } else {
            if (this.isEntered) {
               this.onLeave();
               this.isEntered = false;
            }
         }
         this.lastScrollY = smoothScroll.scroller.scrollY;
         this.lastMousePos = { ...mouse.cacheMousePos };
         this.raf = requestAnimationFrame(this.render.bind(this));
      }

      onEnter() {
         if (this.footerLogoWrap) {
            const parentRect = this.footerLogoWrap.getBoundingClientRect();
            this.currentX = mouse.mousePos.x - parentRect.left;
            this.currentY = mouse.mousePos.y - parentRect.top;

            $('.footer-img-item.item2').css({
               '--mouse-x': `${cvUnit(this.currentX, 'rem')}px`,
               '--mouse-y': `${cvUnit(this.currentY, 'rem')}px`,
            });
         }

         gsap.to($(this.el).find('.footer-img-item.item2'), {
            opacity: 1,
            duration: 0.5,
            filter: 'blur(.5px) contrast(1.2)',
         });
         gsap.to($(this.el).find('.footer-img-item').eq(0), {
            opacity: .7,
            duration: 0.5
         });
      }

      onLeave() {
         gsap.to($(this.el).find('.footer-img-item.item2'), {
            opacity: 0,
            duration: 0.5,
            filter: 'blur(0px) contrast(1)',
         });
         gsap.to($(this.el).find('.footer-img-item').eq(0), {
            opacity: 1,
            duration: 0.5,
         });
      }

      updateTargetPosition() {
         if (!this.footerLogoWrap) return;
         const parentRect = this.footerLogoWrap.getBoundingClientRect();

         this.targetX = ((mouse.mousePos.x - parentRect.left) / parentRect.width) * 100;
         this.targetY = ((mouse.mousePos.y - parentRect.top) / parentRect.height) * 100;
      }

      moveElement() {
         if (!this.footerLogoWrap) return;

         this.currentX = lerp(this.currentX, this.targetX, 0.08);
         this.currentY = lerp(this.currentY, this.targetY, 0.08);
         gsap.set($('.footer-img-item.item2'), { '--mouse-x': `${this.currentX}%`, '--mouse-y': `${this.currentY}%` })
      }
      destroy() {
         if (this.raf) {
            cancelAnimationFrame(this.raf);
            this.raf = null;
         }
      }
   }

   const HomePage = {
      Hero: class {
         constructor() {
            this.el = null;
            this.tlOnce = null;
            this.tlEnter = null;
            this.tlTriggerEnter = null;
         }
         setup(data, mode) {
            this.el = data.next.container.querySelector('.home-hero-wrap');
            if (mode === 'once') {
               this.setupOnce(data);
            } else if (mode === 'enter') {
               this.setupEnter(data);
            }
            else return;
            this.interact();
         }
         setupOnce(data) {
            this.tlOnce = gsap.timeline({
               paused: true,
               delay: .3,
               onStart: () => {
                  $('[data-init-hidden]').removeAttr('data-init-hidden');
               }
            })

            this.animationReveal(this.tlOnce);
         }
         setupEnter(data) {
            this.tlEnter = gsap.timeline({
               paused: true,
               onStart: () => $('[data-init-hidden]').removeAttr('data-init-hidden')
            })

            this.tlTriggerEnter = gsap.timeline({
               scrollTrigger: {
                  trigger: this.el,
                  start: 'top bottom+=50%',
                  end: 'bottom top-=50%',
                  once: true,
                  onEnter: () => this.tlEnter.play(),
                  onEnterBack: () => this.tlEnter.play(),
                  onStart: () => $('[data-init-hidden]').removeAttr('data-init-hidden')
               }
            })

            this.animationReveal(this.tlEnter);
         }
         playOnce() {
            this.tlOnce.play();
         }
         playEnter() {
            // if (isInViewport(this.el)) {
            //     this.tlEnter.play();
            // }
         }
         animationReveal(timeline) {
            // new MasterTimeline({
            //    timeline,
            //    allowMobile: true,
            //    tweenArr: [
            //       // new TextTypewriter({ el: $(this.el).find('.home-hero-title .heading').get(0), speed: .5 }),
            //       // new TextTypewriter({ el: $(this.el).find('.home-hero-btn .txt').get(0), rtl: true, speed: .5 }),
            //       // new TextTypewriter({ el: $(this.el).find('.home-hero-sub .txt').get(0) }),
            //       // ...Array.from($(this.el).find('.home-hero-work-item')).flatMap((el, idx) => [
            //       //    new TextTypewriter({ el: $(this.el).find('.home-hero-work-item-title .txt').get(0), speed: .5 }),
            //       // ])
            //    ]
            // });
            let taglineMarquee = new Marquee(
               $(this.el).find('.home-hero-work'),
               $(this.el).find('.home-hero-work-inner'), 40);
            taglineMarquee.setup();
            taglineMarquee.play();

            gsap.to($(this.el).find('.home-hero-curor-line, .home-hero-img-plus'), {
               autoAlpha: 1,
               duration: 0.5
            });
         }
         interact() {
            if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && $(window).width() > 767) {
               this.initRuler();
               this.drawBox();
               this.drawImageContainer();
            }
         }
         initRuler() {
            this.rulerWrap = $(this.el).find('.home-hero-img-wrap').get(0);
            this.raf = requestAnimationFrame(() => this.render());
            this.lastScrollY = smoothScroll.scroller.scrollY;
            this.lastMousePos = { ...mouse.cacheMousePos };
            this.currentX = 0;
            this.currentY = 0;
            this.targetX = 0;
            this.targetY = 0;
            this.offset = cvUnit(16, 'rem');
            this.minX = this.offset;
            this.maxX = this.rulerWrap.offsetWidth - this.offset;
            this.minY = this.offset;
            this.maxY = this.rulerWrap.offsetHeight - this.offset;
         }
         render() {
            if (isMouseInArea(this.rulerWrap, mouse.mousePos) || isInViewport(this.el)) {
               if (
                  mouse.cacheMousePos.y !== this.lastMousePos.y ||
                  mouse.cacheMousePos.x !== this.lastMousePos.x ||
                  smoothScroll.scroller.scrollY !== this.lastScrollY) {
                     this.updateTargetPosition();
                     this.animateRuler();
                  }
            } else { }

            this.lastScrollY = smoothScroll.scroller.scrollY;
            this.lastMousePos = { ...mouse.cacheMousePos };
            this.raf = requestAnimationFrame(this.render.bind(this));
         }
         updateTargetPosition() {
            if (!this.rulerWrap) return;

            const parentRect = this.rulerWrap.getBoundingClientRect();
            this.targetX = mouse.mousePos.x - parentRect.left;
            this.targetY = mouse.mousePos.y - parentRect.top;
         }
         animateRuler() {
            if (!this.rulerWrap) return;
               this.currentX = lerp(this.currentX, this.targetX, 0.3);
               this.currentY = lerp(this.currentY, this.targetY, 0.3);

               // Clamp the values
               this.currentX = Math.max(this.minX, Math.min(this.currentX, this.maxX));
               this.currentY = Math.max(this.minY, Math.min(this.currentY, this.maxY));

               let normalizedX = normalize(this.currentX, this.rulerWrap.offsetWidth) * this.rulerWrap.offsetWidth / 2;
               let normalizedY = normalize(this.currentY, this.rulerWrap.offsetHeight) * this.rulerWrap.offsetHeight / 2;

               const isAtEdgeX = this.currentX === this.minX || this.currentX === this.maxX;
               const isAtEdgeY = this.currentY === this.minY || this.currentY === this.maxY;
               const isAtEdge = isAtEdgeX || isAtEdgeY;

               const currentScale = gsap.getProperty($(this.el).find('.home-hero-img-plus').get(0), 'scale') || 1;
               const scale = lerp(currentScale, isAtEdge ? 1.2 : 1, 0.08);

               const currentOpacityVertical = gsap.getProperty($(this.el).find('.home-hero-curor-line.line-vertical').get(0), 'opacity') || 1;
               const currentOpacityHorizontal = gsap.getProperty($(this.el).find('.home-hero-curor-line.line-horizital').get(0), 'opacity') || 1;
               const autoAlphaVertical = lerp(currentOpacityVertical, isAtEdgeX ? 0 : 1, 0.1);
               const autoAlphaHorizontal = lerp(currentOpacityHorizontal, isAtEdgeY ? 0 : 1, 0.1);

               const currentBackgroundColor = gsap.getProperty($(this.el).find('.home-hero-img-plus').get(0), 'backgroundColor');
               const currentColorAlpha = parseFloat(currentBackgroundColor.split(',')[3]) || 0;
               const targetColorAlpha = (isAtEdgeX && isAtEdgeY) ? 1 : 0;
               const lerpedColorAlpha = lerp(currentColorAlpha, targetColorAlpha, 0.08);
               const coordiX = normalizedX - $(this.el).find('.home-hero-img-coordi').width() / 2 - cvUnit(4, 'rem');
               const coordiY = normalizedY + $(this.el).find('.home-hero-img-coordi').height() / 2 + cvUnit(4, 'rem');
               gsap.set($(this.el).find('.home-hero-curor-line.line-vertical'), { x: normalizedX, autoAlpha: autoAlphaVertical });
               gsap.set($(this.el).find('.home-hero-curor-line.line-horizital'), { y: normalizedY, autoAlpha: autoAlphaHorizontal });
               gsap.set($(this.el).find('.home-hero-img-plus-line.line-vertical'), { autoAlpha: autoAlphaVertical });
               gsap.set($(this.el).find('.home-hero-img-plus-line.line-horizital'), { autoAlpha: autoAlphaHorizontal });
               gsap.set($(this.el).find('.home-hero-img-plus'), {
                  x: normalizedX,
                  y: normalizedY,
                  scale: scale,
                  backgroundColor: `rgba(241, 85, 52, ${lerpedColorAlpha})`,
                  color: `rgba(241, 85, 52, ${1 - lerpedColorAlpha})`
               });
               gsap.set($(this.el).find('.home-hero-img-coordi'), { autoAlpha: autoAlphaHorizontal });

               gsap.set($(this.el).find('.home-hero-img-coordi'), {
                  x: coordiX,
                  y: coordiY,
               });
               $('[data-control="x"]').text(normalizedX.toFixed(0));
               $('[data-control="y"]').text(normalizedY.toFixed(0));
         }
         drawBox() {
            this.box = null;
            let isOnDown = false;
            let isOnMove = false;
            const MOVEMENT_THRESHOLD = 2;

            const track = $(this.el).find('.home-hero-img-plus').get(0);

            const createBox = () => {
               this.box = document.createElement('div');
               this.box.className = 'home-hero-img-plus-box';
               this.box.style.display = 'block';
               this.box.style.position = 'absolute';
               this.box.style.top = `${mouse.mousePos.y}px`;
               this.box.style.left = `${mouse.mousePos.x}px`;
               this.box.style.border = '1px solid #F15534';
               this.box.style.zIndex = '100';
               this.rulerWrap.prepend(this.box);
               return this.box;
            }

            const handleOnDown = (e) => {
                // Prevent right-click from initiating box drawing
               if ((e && e.button === 2) || (e && e.which === 3)) return;
               if (this.box) {
                  this.box.remove();
                  this.box = null;
               };
               this.box = createBox();
               const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
               const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
               track.dataset.mouseXDownAt = clientX - this.rulerWrap.getBoundingClientRect().left;
               track.dataset.mouseYDownAt = clientY - this.rulerWrap.getBoundingClientRect().top;
               track.dataset.initialX = track.dataset.mouseXDownAt;
               track.dataset.initialY = track.dataset.mouseYDownAt;
               this.box.style.left = `${track.dataset.mouseXDownAt}px`;
               this.box.style.top = `${track.dataset.mouseYDownAt}px`;
               isOnDown = true;
            }
            const handleOnMove = (e) => {
               if (!isOnDown) return;
               const rect = this.rulerWrap.getBoundingClientRect();
               const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
               const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
               const currX = clientX - rect.left;
               const currY = clientY - rect.top;
               const initX = parseFloat(track.dataset.initialX);
               const initY = parseFloat(track.dataset.initialY);

              // persist as strings if other logic depends on dataset
               track.dataset.currentX = String(currX);
               track.dataset.currentY = String(currY);

               const movement = distance(currX, currY, initX, initY);
               if (movement > MOVEMENT_THRESHOLD) {
                  isOnMove = true;
                  track.dataset.mouseXDownAt = String(initX);
                  track.dataset.mouseYDownAt = String(initY);

                  let boxWidth = 0;
                  let boxHeight = 0;
                  let boxLeft = 0;
                  let boxTop = 0;
                  let finalDirection = '';

                  const moveRight = currX > initX;
                  const moveDown = currY > initY;

                  if (moveRight) {
                     boxWidth = currX - initX;
                     boxLeft = initX;
                     if (moveDown) {
                        finalDirection = '315deg';
                        boxHeight = currY - initY;
                        boxTop = initY;
                     } else {
                        finalDirection = '225deg';
                        boxHeight = initY - currY;
                        boxTop = currY;
                     }
                  } else {
                     boxWidth = initX - currX;
                     boxLeft = currX;
                     if (moveDown) {
                        finalDirection = '45deg';
                        boxHeight = currY - initY;
                        boxTop = initY;
                     } else {
                        finalDirection = '135deg';
                        boxHeight = initY - currY;
                        boxTop = currY;
                     }
                  }

                  this.box.style.background = `linear-gradient(${finalDirection}, rgba(241, 85, 52, 0.64) 0%, rgba(245, 245, 239, 0.00) 67.05%)`;
                  this.box.style.width = `${boxWidth}px`;
                  this.box.style.height = `${boxHeight}px`;
                  this.box.style.left = `${boxLeft}px`;
                  this.box.style.top = `${boxTop}px`;
               }
            }
            const handleOnUp = (e) => {
               track.dataset.mouseDownAt = "0";
               isOnDown = false;
               isOnMove = false;
               if (this.box) {
                  this.box.remove();
                  this.box = null;
               }
            }
            // Prevent native context menu on this area
            this.rulerWrap.oncontextmenu = (e) => { e.preventDefault(); return false; };

            this.rulerWrap.onmousedown = (e) => handleOnDown(e);
            this.rulerWrap.ontouchstart = (e) => handleOnDown(e);

            this.rulerWrap.onmouseup = (e) => handleOnUp(e);
            this.rulerWrap.ontouchend = (e) => handleOnUp(e);

            this.rulerWrap.onmousemove = (e) => handleOnMove(e);
            this.rulerWrap.ontouchmove = (e) => handleOnMove(e);
         }
         drawImageContainer() {
            const $img = $('.home-hero-img-inner img');
            const $container = $img.parent();
            const containerWidth = $container.width();
            const containerHeight = $container.height();
            const imgNaturalWidth = $img[0].naturalWidth;
            const imgNaturalHeight = $img[0].naturalHeight;

            const containerRatio = containerWidth / containerHeight;
            const imgRatio = imgNaturalWidth / imgNaturalHeight;

            let displayedWidth, displayedHeight;

            if (imgRatio > containerRatio) {
               displayedWidth = containerWidth;
               displayedHeight = containerWidth / imgRatio;
            } else {
               displayedHeight = containerHeight;
               displayedWidth = containerHeight * imgRatio;
            }
         }
         destroy() {
               if (this.tlOnce) {
                  this.tlOnce.kill();
               }
               if (this.tlEnter) {
                  this.tlEnter.kill();
               }
               if (this.tlTriggerEnter) {
                  this.tlTriggerEnter.kill();
               }
         }
      },
      Intro: class extends TriggerSetup {
         constructor() {
            super();
            this.el = null;
         }
         trigger(data) {
            this.el = data.next.container.querySelector('.home-intro-wrap');
            super.setTrigger(this.el, this.onTrigger.bind(this));
         }
         onTrigger() {
            this.animationScrub();
            this.animationReveal();
            this.interact();
         }
         animationReveal() {
            let partnerMarquee = new Marquee(
               $(this.el).find('.home-intro-partner-cms'),
               $(this.el).find('.home-intro-partner-list'), 40);
            partnerMarquee.setup();
            partnerMarquee.play();
         }
         animationScrub() {
         }
         interact() {
         }
         destroy() {
         }
      },
      Map: class extends TriggerSetup {
         constructor() {
            super();
            this.el = null;
            this.tl = null;
         }
         trigger(data) {
            this.el = data.next.container.querySelector('.home-map-wrap');
            super.setTrigger(this.el, this.onTrigger.bind(this));
         }
         onTrigger() {
            this.setup();
            this.interact();
         }
         setup() {
            let gap= cvUnit(12, 'rem');
            // get position left, right của .home-map-number[data-number='item1'] so với .home-map-main-img-inner
            const item1 = $(this.el).find('.home-map-number[data-number="item1"]').get(0);
            const parent = $(this.el).find('.home-map-main-img-inner').get(0);
            const item2 = $(this.el).find('.home-map-number[data-number="item2"]').get(0);
            const item3 = $(this.el).find('.home-map-number[data-number="item3"]').get(0);
            const parentRect = parent.getBoundingClientRect();
            const item1Rect = item1.getBoundingClientRect();
            const item2Rect = item2.getBoundingClientRect();
            const item3Rect = item3.getBoundingClientRect();
            const relativeLeft = item1Rect.left - parentRect.left + gap + item1Rect.width  ;
            const relativeTop = item1Rect.top - parentRect.top;
            const relativeLeft2 = item2Rect.left - parentRect.left + gap + item2Rect.width;
            const relativeTop2 = item2Rect.top - parentRect.top;
            const relativeLeft3 = item3Rect.left - parentRect.left + gap + item3Rect.width;
            const relativeTop3 = item3Rect.top - parentRect.top;

            $(this.el).find('.home-map-main-img-sub-hover[data-hover="item1"]').css({
               left: `${relativeLeft}px`,
               top: `${relativeTop}px`,
            });
            $(this.el).find('.home-map-main-img-sub-hover[data-hover="item2"]').css({
               left: `${relativeLeft2}px`,
               top: `${relativeTop2}px`,
            });
            $(this.el).find('.home-map-main-img-sub-hover[data-hover="item3"]').css({
               left: `${relativeLeft3}px`,
               top: `${relativeTop3}px`,
            });

            this.tl = gsap.timeline({
               scrollTrigger: {
                  trigger: this.el,
                  start: 'top top',
                  end: 'bottom top+=100%',
                  scrub: true,
                  markers: true,
               }
            });

            const totalDuration = 10;
            const segmentDuration = totalDuration / 10;

            this.tl
                 .fromTo($(this.el).find('.home-intel-inner:nth-child(1)'), { opacity: 0 }, { opacity: 1, ease: 'none' }, 0)
                 .fromTo($(this.el).find('.home-intel-inner:nth-child(1)'), { opacity: 1 }, { opacity: 0, ease: 'none' }, segmentDuration)
                 .fromTo($(this.el).find('.home-intel-inner:nth-child(2)'), { opacity: 0 }, { opacity: 1, ease: 'none' }, segmentDuration * 2)
                 .fromTo($(this.el).find('.home-intel-inner:nth-child(2)'), { opacity: 1 }, { opacity: 0, ease: 'none' }, segmentDuration * 3)
                 .to($(this.el).find('.home-map-main-img:nth-child(3)'), { opacity: 1, ease: 'none' }, segmentDuration * 4)
                 .to($(this.el).find('.home-map-main-img:nth-child(3) .home-map-img-svg path'), { x: 0, y: 0, ease: 'none' }, segmentDuration * 5)
                 .to($(this.el).find('.home-map-main-img:nth-child(4)'), { opacity: 1, ease: 'none' }, segmentDuration * 6)
                 .to($(this.el).find('.home-map-main-img:nth-child(5)'), { opacity: 1, ease: 'none' }, segmentDuration * 7)
                 .to($(this.el).find('.home-map-main-img:nth-child(6)'), { opacity: 1, ease: 'none' }, segmentDuration * 8)
                 .to($(this.el).find('.home-map-main-img:nth-child(7)'), { opacity: 1, ease: 'none', onStart: () => {
                     $(this.el).find('.home-map-main-img:nth-child(7)').addClass('active')
                 } }, segmentDuration * 9) 

         }
         interact() {
            $(this.el).find('.home-map-number').on('mouseenter', function() {
               console.log('mouseenter');
               $(this).parent().addClass('hover');
               let dataNumber = $(this).attr('data-number');
               $('.home-map-main-img-sub-hover[data-hover="' + dataNumber + '"]').addClass('hover')
            });
            $(this.el).find('.home-map-number').on('mouseleave', function() {
               $(this).parent().removeClass('hover');
               let dataNumber = $(this).attr('data-number');
               $('.home-map-main-img-sub-hover[data-hover="' + dataNumber + '"]').removeClass('hover')  
            });
            $(this.el).find('.home-map-number').on('click', function() {
               $(this).parent().toggleClass('active');
               let dataNumber = $(this).attr('data-number');
               $('.home-map-main-img-sub-hover[data-hover="' + dataNumber + '"]').toggleClass('active')
            });
         }
         destroy() {
         }
      },
      WhyUs: class extends TriggerSetup {
         constructor() {
            super();
            this.el = null;
         }
         trigger(data) {
            this.el = data.next.container.querySelector('.home-why-wrap');
            super.setTrigger(this.el, this.onTrigger.bind(this));
         }
         onTrigger() {
            this.animationScrub();
            this.animationReveal();
            this.interact();
         }
         animationScrub() {
         }
         animationReveal() {
         }
         interact() {
            this.stickerCard();
         }
         stickerCard() {
            this.stickerCardWrap = $(this.el).find('.home-why-main-wrap').get(0);
            this.raf = requestAnimationFrame(() => this.render());
            this.lastScrollY = smoothScroll.scroller.scrollY;
            this.lastMousePos = { ...mouse.cacheMousePos };
            this.isEntered = false;
         }
         render() {
            if (isMouseInArea(this.stickerCardWrap, mouse.mousePos) || isInViewport(this.stickerCardWrap)) {
               if (!this.isEntered) {
                  this.onEnter();
                  this.isEntered = true;
               }
               if (
                  mouse.cacheMousePos.y !== this.lastMousePos.y ||
                  mouse.cacheMousePos.x !== this.lastMousePos.x ||
                  smoothScroll.scroller.scrollY !== this.lastScrollY) {
                  this.moveLine();
               }
            }
            else {
               if (this.isEntered) {
                  this.onLeave();
                  this.isEntered = false;
               }
            }
            this.lastScrollY = smoothScroll.scroller.scrollY;
            this.lastMousePos = { ...mouse.cacheMousePos };
            this.raf = requestAnimationFrame(this.render.bind(this));
         }
         onEnter() {
            gsap.set($(this.el).find('.home-why-main-line'), { opacity: 1 })
            gsap.set($(this.el).find('.home-why-item-sticky'), { opacity: 1 })
         }
         onLeave() {
            gsap.set($(this.el).find('.home-why-main-line'), { opacity: 0 })
            gsap.set($(this.el).find('.home-why-item-sticky'), { opacity: 0 })
         }
         moveLine() {
            if (!this.stickerCardWrap) return;
            const lineElement = $(this.el).find('.home-why-main-line').get(0);
            if (lineElement) {
               let lineYCurr = yGetter(lineElement);
               let lineYMove = mouse.mousePos.y - this.stickerCardWrap.getBoundingClientRect().top - gsap.getProperty(this.stickerCardWrap, 'padding-top');
               gsap.set(lineElement, { y: lerp(lineYCurr, lineYMove, .2) });
               gsap.set($(this.el).find('.home-why-item-sticky'), { y: lerp(lineYCurr, lineYMove, .2) - $(this.el).find('.home-why-item-sticky').height() / 2 });
            }
         }
         destroy() {
            if (this.raf) {
               cancelAnimationFrame(this.raf);
               this.raf = null;
            }
         }
      },
      UseCase: class extends TriggerSetup {
         constructor() { super(); }
         trigger(data) {
            this.el = data.next.container.querySelector('.home-usecase-wrap');
            super.setTrigger(this.el, this.onTrigger.bind(this));
         }
         onTrigger() {
            this.animationScrub();
            this.interact();
         }
         animationScrub() {
         }
         interact() {
            const activeAccordion = (idx) => {
               $(this.el).find('.home-usecase-faq-item').eq(idx).toggleClass('active').siblings().removeClass('active');
               $(this.el).find('.home-usecase-faq-item').eq(idx).siblings().find('.home-usecase-faq-item-sub').slideUp();
               $(this.el).find('.home-usecase-faq-item').eq(idx).find('.home-usecase-faq-item-sub').slideToggle();
            }
            $(this.el).find('.home-usecase-faq-item-sub').hide();

            $(this.el).find('.home-usecase-faq-item').on('click', function() {
               activeAccordion($(this).index());
            });
            activeAccordion(0);
         }
         destroy() {
         }
      },
      Footer: class extends Footer {
         constructor() { super(); }
      }
   }

   class PageManager {
      constructor(page) {
         this.sections = Object.values(page).map(section => new section());

          // Bind event handlers
         this.boundSetupHandler = this.setupHandler.bind(this);
         this.boundOncePlayHandler = this.oncePlayHandler.bind(this);
         this.boundEnterPlayHandler = this.enterPlayHandler.bind(this);
      }

      initOnce(data) {
         const container = data.next.container;
         container.addEventListener("onceSetup", (event) => {
            this.boundSetupHandler({ detail: event.detail, mode: 'once' });
         });
         container.addEventListener("oncePlay", this.boundOncePlayHandler);
      }

      initEnter(data) {
         const container = data.next.container;
         container.addEventListener("enterSetup", (event) => {
            this.boundSetupHandler({ detail: event.detail, mode: 'enter' });
         });
         container.addEventListener("enterPlay", this.boundEnterPlayHandler);
      }

      oncePlayHandler(event) {
         this.sections.forEach(section => {
            if (section.playOnce) {
               section.playOnce(event.detail);
            }
         });
      }

      enterPlayHandler(event) {
         this.sections.forEach(section => {
            if (section.playEnter) {
               section.playEnter(event.detail);
            }
         });
      }

      setupHandler(event) {
         const data = event.detail;
         const mode = event.mode;
         this.sections.forEach(section => {
            if (section.trigger) {
               section.trigger(data);
            }
            if (section.setup) {
               section.setup(data, mode);
            }
         });
      }

      destroy(data) {
         const container = data.next.container;
         container.removeEventListener("onceSetup", this.boundSetupHandler);
         container.removeEventListener("oncePlay", this.boundOncePlayHandler);
         container.removeEventListener("enterSetup", this.boundSetupHandler);
         container.removeEventListener("enterPlay", this.boundEnterPlayHandler);

         this.sections.forEach(section => {
            if (section.destroy) {
               section.destroy();
            }
            if (section.cleanTrigger) {
               section.cleanTrigger();
            }
         });
      }
   }
   class HomePageManager extends PageManager {
      constructor(page) { super(page); }
   }
   const PageManagerRegistry = {
      home: new HomePageManager(HomePage),
   };

	const SCRIPT = {
      home: {
         namespace: 'home',
         afterEnter(data) {
            PageManagerRegistry.home.initEnter(data);
         },
         beforeLeave(data) {
            PageManagerRegistry.home.destroy(data);
         }
      },
	};

   let namespace = $('.main-inner').attr('data-barba-namespace');
   const VIEWS = Object.values(SCRIPT);

   barba.use(barbaPrefetch);
   barba.init({
      preventRunning: true,
      timeout: 5000,
      views: VIEWS,
      transitions: [
         {
            name: "default-transition",
            sync: true,

            beforeOnce(data) {
               smoothScroll.init(data);
               globalChange.init(data);
               documentHeightObserver("init", data)
            },
            once(data) {
               loader.init(data);
               loader.play(data);
               scrollTop(PageManagerRegistry[namespace]?.initOnce?.(data));
               resetScroll(data);
               header.init(data);
            },
            async leave(data) {
               await pageTrans.play(data);
            },
         },
      ],
   });
};

window.onload = mainScript;
