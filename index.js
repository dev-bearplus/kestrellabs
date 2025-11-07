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
               content: document.querySelector('.main-content'),
               wrapper: document.querySelector('.main-inner'),
               syncTouch: true,
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
   class ParallaxImage {
      constructor({ el, scaleOffset = 0.3 }) {
          this.el = el;
          this.elWrap = null;
          this.scaleOffset = scaleOffset;
          this.init();
      }
      init() {
          this.elWrap = this.el.parentElement;
          this.setup();
      }
      setup() {
          gsap.set(this.el, { height: '120%' });
          this.scrub();
      }
      scrub() {
          let dist = this.el.offsetHeight - this.elWrap.offsetHeight;
          let total = this.elWrap.getBoundingClientRect().height + window.innerHeight;
          this.updateOnScroll(dist, total);
          smoothScroll.lenis.on('scroll', () => {
              this.updateOnScroll(dist, total);
          });
      }
      updateOnScroll(dist, total) {
          if (this.el) {
              if (isInViewport(this.elWrap)) {
                  let percent = this.elWrap.getBoundingClientRect().bottom / total;
                  gsap.quickSetter(this.el, 'y', 'px')(-dist * percent * 1.2);
                  gsap.set(this.el, { scale: 1 + (percent * this.scaleOffset) });
              }
          }
      }
  }
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
         window.addEventListener('touchmove', (e) => {
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
   class FlipText {
      constructor(wrapEl, { onCycleComplete = () => {}, duration = 3 }) {
          this.wrapEl = wrapEl;
          this.tlMaster;
          this.onCycleComplete = onCycleComplete;
          this.duration = duration;
      }
      setup() {
          let allSlideItems = $(this.wrapEl).find('.text-rotate');
          this.tlMaster = gsap.timeline({
              paused: true,
              onComplete: () => {
                  this.tlMaster.progress(0);
              }
          });

          const DEFAULT = {
              duration: this.duration,
              ease: 'expo.inOut',
              transform: {
                  out: `translate3d(0px, ${cvUnit(25.5961, 'rem')}px, -${cvUnit(26.0468, 'rem')}px) rotateX(-91deg)`,
                  in: `translate3d(0px, -${cvUnit(25.5961, 'rem')}px, -${cvUnit(26.0468, 'rem')}px) rotateX(91deg)`,
              }
          }
          gsap.set(this.wrapEl, { perspective: cvUnit(82.5, 'rem') })
          gsap.set(allSlideItems, {
              transformOrigin: true
                  ? 'center center -.1em !important'
                  : 'center center -.26em !important',
          });

          allSlideItems.each((idx, text) => {
              if (idx == allSlideItems.length - 1) {
                  gsap.set(text, { transform: 'none', autoAlpha: 1 });
              } else {
                  gsap.set(text, { transform: DEFAULT.transform.out, autoAlpha: 0 });
              }
              let tlChild = gsap.timeline({});

              if (idx === allSlideItems.length - 1) {
                  tlChild
                      .set(text, { transform: 'none', autoAlpha: 1 })
                      .to(text, { transform: DEFAULT.transform.in, autoAlpha: 0, duration: DEFAULT.duration, ease: DEFAULT.ease, onStart: () => { this.onCycleComplete(idx) } }, '<=0')
                      .to(text, { duration: DEFAULT.duration * idx - 1 * DEFAULT.duration })
                      .set(text, { transform: DEFAULT.transform.out, autoAlpha: 0 })
                      .to(text, { transform: 'none', autoAlpha: 1, duration: DEFAULT.duration, ease: DEFAULT.ease });
              } else {
                  tlChild
                      .set(text, { transform: DEFAULT.transform.out, autoAlpha: 0 })
                      .to(text, { duration: DEFAULT.duration * idx }, '<=0')
                      .to(text, { transform: 'none', autoAlpha: 1, duration: DEFAULT.duration, ease: DEFAULT.ease })
                      .to(text, { transform: DEFAULT.transform.in, autoAlpha: 0, duration: DEFAULT.duration, ease: DEFAULT.ease, onStart: () => { this.onCycleComplete(idx) } })
                      .to(text, { duration: (allSlideItems.length - 2 - idx) * DEFAULT.duration });
              }
              this.tlMaster.add(tlChild, 0);
          });
          this.tlMaster.progress((1 / allSlideItems.length).toFixed(2));
      }
      play() {
          this.tlMaster.play();
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
            this.currentX = ((mouse.mousePos.x - parentRect.left) / parentRect.width) * 100;
            this.currentY = ((mouse.mousePos.y - parentRect.top) / parentRect.height) * 100;
            $('.footer-img-item.item2').css({ '--mouse-x': `${this.currentX}%`, '--mouse-y': `${this.currentY}%` });
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
            this.rotateText();
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
         rotateText() {
            let headingFlipping = new FlipText('.home-hero-title-wrap', {});
            headingFlipping.setup();
            headingFlipping.play();
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
            gsap.to($(this.el).find(' .home-hero-img-plus'), {
               autoAlpha: 1,
               duration: 0.5
            });
            gsap.to($(this.el).find('.home-hero-curor-line'), {
               autoAlpha: .16,
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
               const currentOpacityVerticalLine = gsap.getProperty($(this.el).find('.home-hero-curor-line.line-vertical').get(0), 'opacity') || .16;
               const currentOpacityHorizontalLine = gsap.getProperty($(this.el).find('.home-hero-curor-line.line-horizital').get(0), 'opacity') || .16;
               const autoAlphaVerticalLine = lerp(currentOpacityVerticalLine, isAtEdgeX ? 0 : .16, 0.1);
               const autoAlphaHorizontalLine = lerp(currentOpacityHorizontalLine, isAtEdgeY ? 0 : .16, 0.1);

               const currentBackgroundColor = gsap.getProperty($(this.el).find('.home-hero-img-plus').get(0), 'backgroundColor');
               const currentColorAlpha = parseFloat(currentBackgroundColor.split(',')[3]) || 0;
               const targetColorAlpha = (isAtEdgeX && isAtEdgeY) ? 1 : 0;
               const lerpedColorAlpha = lerp(currentColorAlpha, targetColorAlpha, 0.08);

               const defaultCoordiX = normalizedX - ($(this.el).find('.home-hero-img-coordi').width() / 2 + cvUnit(4, 'rem'));
               const coordiX = normalizedX >= 0
                  ? defaultCoordiX
                  : normalizedX + ($(this.el).find('.home-hero-img-coordi').width() / 2 + cvUnit(4, 'rem'));
               const defaultCoordiY = normalizedY + $(this.el).find('.home-hero-img-coordi').height() / 2 + cvUnit(4, 'rem');
               const coordiY = normalizedY >= 0
                  ? normalizedY - ($(this.el).find('.home-hero-img-coordi').height() / 2 + cvUnit(4, 'rem'))
                  : defaultCoordiY;

               gsap.set($(this.el).find('.home-hero-curor-line.line-vertical'), { x: normalizedX, autoAlpha: autoAlphaVerticalLine });
               gsap.set($(this.el).find('.home-hero-curor-line.line-horizital'), { y: normalizedY, autoAlpha: autoAlphaHorizontalLine });
               gsap.set($(this.el).find('.home-hero-img-plus'), {
                  x: normalizedX,
                  y: normalizedY,
                  scale: scale,
                  color: `rgba(241, 85, 52, ${1 - lerpedColorAlpha})`
               });
               gsap.set($(this.el).find('.home-hero-img-coordi'), { autoAlpha: 1 - lerpedColorAlpha });
               gsap.set($(this.el).find('.home-hero-img-coordi'), {
                  x: isAtEdgeX ? coordiX : defaultCoordiX,
                  y: isAtEdgeY ? coordiY : defaultCoordiY,
               });
               $('[data-control="x"]').text(this.targetX.toFixed(0));
               $('[data-control="y"]').text(this.targetY.toFixed(0));
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
                  // check each home-hero-img-deco active if box overlaps/touches deco
                  const boxRect = this.box.getBoundingClientRect();
                  $('.home-hero-img-deco').each((index, item) => {
                     const decoRect = $(item).get(0).getBoundingClientRect();

                     // Check if box and deco are overlapping (touching)
                     const isOverlapping = !(
                        boxRect.right < decoRect.left ||
                        boxRect.left > decoRect.right ||
                        boxRect.bottom < decoRect.top ||
                        boxRect.top > decoRect.bottom
                     );

                     if (isOverlapping) {
                        if (!$('.home-hero-intro').hasClass('hide')) {
                           $('.home-hero-intro').addClass('hide');
                        }
                        $(item).addClass('active');
                     } else {
                        // $(item).removeClass('active');
                     }
                  });
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
               // $('.home-hero-img-deco').removeClass('active');
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
            $('.home-hero-img-deco-main').css({
               width: `${displayedWidth}px`,
               height: `${displayedHeight}px`,
            });
            const IMG_HEIGHT = 829;
            const IMG_WIDTH = 1648;
            const calcVerticalPos = (imgY) => {
               return displayedHeight * imgY / IMG_HEIGHT + (containerHeight - displayedHeight) / 2;
            };
            const calcHorizontalClip = (imgX) => {
               return ((containerWidth - displayedWidth) / 2 + displayedWidth * imgX / IMG_WIDTH) / containerWidth * 100;
            };
            const calcHorizitalPos = (imgX) => {
               return displayedWidth * imgX / IMG_WIDTH + (containerWidth - displayedWidth) / 2;
            };
            const calcVerticalClip = (imgY) => {
               return ((containerHeight - displayedHeight) / 2 + displayedHeight * (1 - imgY / IMG_HEIGHT)) / containerHeight * 100;
            };
            const verticalLineStartY = 117;
            const verticalLineStartX = 348;
            const verticalLineHeight = 611;
            const verticalLineWidth = 926;

            // Left vertical line
            $('.home-hero-ruler-item.left .home-hero-ruler-item-line-vertical')
               .css('height', `${displayedHeight * verticalLineHeight / IMG_HEIGHT}px`)
               .css('top', `${calcVerticalPos(verticalLineStartY)}px`);

            // Right vertical line
            $('.home-hero-ruler-item.right .home-hero-ruler-item-line-vertical')
               .css('height', `${displayedHeight * verticalLineHeight / IMG_HEIGHT}px`)
               .css('top', `${calcVerticalPos(verticalLineStartY)}px`);

            // Top horizontal line
            $('.home-hero-ruler-item.top .home-hero-ruler-item-line-horizital')
               .css('width', `${displayedWidth * verticalLineWidth / IMG_WIDTH}px`)
               .css('left', `${calcHorizitalPos(verticalLineStartX)}px`);

            // Bottom horizontal line
            $('.home-hero-ruler-item.bot .home-hero-ruler-item-line-horizital')
            .css('width', `${displayedWidth * verticalLineWidth / IMG_WIDTH}px`)
            .css('left', `${calcHorizitalPos(verticalLineStartX)}px`);

            const horizontalLinesLeft = [
               { y: 116, x: 464 },
               { y: 319, x: 792 },
               { y: 502, x: 343 },
               { y: 671, x: 487 },
               { y: 728, x: 577 }
            ];
            const horizontalLinesRight = [
               { y: 116, x: 1146 },
               { y: 319, x: 767 },
               { y: 361, x: 635 },
               { y: 512, x: 481 },
               { y: 672, x: 606 },
               { y: 727, x: 606 }
            ];
            const verticalLinesTop = [
               { y: 303, x: 348 },
               { y: 713, x: 462 },
               { y: 715, x: 505 },
               { y: 510, x: 792 },
               { y: 510, x: 882 },
               { y: 468, x: 1014 },
               { y: 317, x: 1168 },
               { y: 207, x: 1274 }
            ];
            const verticalLinesBot = [
               { y: 505, x: 348 },
               { y: 604, x: 462 },
               { y: 729, x: 567 },
               { y: 604, x: 817 },
               { y: 671, x: 1043 },
               { y: 560, x: 1168 },
               { y: 618, x: 1274 },
            ];
            horizontalLinesLeft.forEach((line, index) => {
               // lọc qua từng .home-hero-ruler-item.left
               $('.home-hero-ruler-item.left').each((itemIndex, item) => {
                  const lineItem = $(item).find('.home-hero-ruler-item-line-horizital').eq(index);
                  lineItem.css('top', `${calcVerticalPos(line.y)}px`)
                     .css('--clip-half', `${calcHorizontalClip(line.x)}%`);
               });
               
            });
            horizontalLinesRight.forEach((line, index) => {
               const invertedClip = 100 - calcHorizontalClip(line.x);
               $('.home-hero-ruler-item.right').each((itemIndex, item) => {
                  const lineItem = $(item).find('.home-hero-ruler-item-line-horizital').eq(index);
                  lineItem.css('top', `${calcVerticalPos(line.y)}px`)
                     .css('--clip-half', `${invertedClip}%`);
               });
            });
            verticalLinesTop.forEach((line, index) => {
               $('.home-hero-ruler-item.top').each((itemIndex, item) => {
                  const lineItem = $(item).find('.home-hero-ruler-item-line-vertical').eq(index);
                  lineItem.css('left', `${calcHorizitalPos(line.x)}px`)
                     .css('--clip-half', `${calcVerticalClip(line.y)}%`);
               });
            });
            verticalLinesBot.forEach((line, index) => {
               const invertedClip = 100 - calcVerticalClip(line.y);
               $('.home-hero-ruler-item.bot').each((itemIndex, item) => {
                  const lineItem = $(item).find('.home-hero-ruler-item-line-vertical').eq(index);
                  lineItem.css('left', `${calcHorizitalPos(line.x)}px`)
                     .css('--clip-half', `${invertedClip}%`);
               });
            });
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
            this.setup();
            this.interact();
         }
         setup() {
            this.tlStickFade = gsap.timeline({
               scrollTrigger: {
                  trigger: this.el.querySelector('.home-intro-content'),
                  start: 'center bottom+=10%',
                  end: `center top+=40%`,
                  scrub: true,
               }
            });
            let title = new SplitText( $(this.el).find('.home-intro-content-title .heading').get(0), {type: 'chars, lines'});
            this.tlStickFade.fromTo(title.chars, {color: '#b3b3af'}, { color: '#282828', stagger: 0.03 })
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
      Problem: class extends TriggerSetup {
         constructor() {
            super();
            this.el = null;
         }
         trigger(data) {
            this.el = data.next.container.querySelector('.home-problem-wrap');
            super.setTrigger(this.el, this.onTrigger.bind(this));
         }
         onTrigger() {
            this.setup();
         }
         setup() {
            if(viewport.w < 768) {
               this.swiperCard();
            }
         }
         swiperCard() {
            $('.home-problem-cms').addClass('swiper');
            $('.home-problem-list').addClass('swiper-wrapper');
            $('.home-problem-item').addClass('swiper-slide');
            new Swiper('.home-problem-cms', {
               slidesPerView: 'auto',
               spaceBetween: 0,
               pagination: {
                  el: '.home-problem-pagi',
                  bulletClass: 'home-problem-pagi-item',
                  bulletActiveClass: 'active',
                  clickable: true,  
               },
            });
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
            this.animationScrub()
         }
         setup() {
            this.initPositionItem();
         }
         initPositionItem() {
            const gap = cvUnit(12, 'rem');
            const parent = $(this.el).find('.home-map-main-img-inner').get(0);
            const parentRect = parent.getBoundingClientRect();

            ['item1', 'item2', 'item3'].forEach((itemName) => {
               const item = $(this.el).find(`.home-map-number[data-number="${itemName}"]`).get(0);
               const itemRect = item.getBoundingClientRect();
               const relativeLeft = itemRect.left - parentRect.left + gap + itemRect.width;
               const relativeTop = itemRect.top - parentRect.top;

               $(this.el).find(`.home-map-main-img-sub-hover[data-hover="${itemName}"]`).css({
                  left: `${relativeLeft}px`,
                  top: `${relativeTop}px`,
               });
            });
         }
         interact() {
            $(this.el).find('.home-map-number').on('mouseenter', function() {
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
               if ($(this).parent().hasClass('active')) {
                  $(this).parent().removeClass('active');
                  let dataNumber = $(this).attr('data-number');
                  $('.home-map-main-img-sub-hover[data-hover="' + dataNumber + '"]').removeClass('active')
               } else {
                  $('.home-map-number-wrap').removeClass('active');
                  $('.home-map-main-img-sub-hover').removeClass('active');
                  $(this).parent().addClass('active');
                  let dataNumber = $(this).attr('data-number');
                  $('.home-map-main-img-sub-hover[data-hover="' + dataNumber + '"]').addClass('active')
               }
            });
            $(document).on('click', function(e) {
               if (!$(e.target).closest('.home-map-number').length) {
                  $(this.el).find('.home-map-number-wrap').removeClass('active');
                  $('.home-map-main-img-sub-hover').removeClass('active');
               }
            });
         }
         animationScrub() {
            this.tlStickFade = gsap.timeline({
               scrollTrigger: {
                  trigger: this.el,
                  start: 'top bottom',
                  end: `top top`,
                  scrub: true
               }
            });
            this.tlStickFade
               .fromTo($(this.el).find('.home-map-main-inner'), { y: -($(this.el).find('.home-map-inner').height()) }, { y: 0, ease: 'none' }, 0)
            this.tl = gsap.timeline({
               scrollTrigger: {
                  trigger: this.el,
                  start: 'top 50%',
                  end: `bottom-=${cvUnit(100, 'vh')} bottom`,
                  scrub: true,
                  onToggle: (self) => {
                     if (self.isActive) {
                        $(this.el).find('.home-map').removeClass('expanded');
                     }
                     else {
                        if (self.progress === 1) {
                           $(this.el).find('.home-map').addClass('expanded');
                        }
                     }
                     setTimeout(() => {
                        this.initPositionItem();
                     }, 410);
                  }
               }
            });

            $(this.el).find('.home-intel-inner').each((idx, item) => {
               this.tl
                     .fromTo(item, { autoAlpha: idx === 0 ? 1 : 0, y: cvUnit(3, 'rem'), scale: 1.04 }, { autoAlpha: 1, y: 0, scale: 1 }, '>=0')
                     .fromTo(item, { autoAlpha: 1, y: 0, scale: 1 }, { autoAlpha: 0, y: -cvUnit(3, 'rem'), scale: .96 }, '>=.5');
               gsap.set(item, { autoAlpha: 0 });
            })
            gsap.set($(this.el).find('.home-map-main-img .home-map-img-svg path'), { opacity: 0, scale: 1.1 })

            const activeItems = new Set();
            const introWrap = $('.home-map-intro');
            const introItem = $('.home-map-intro-content-item');
            const introItemContent = $('.home-map-intro-content');
            const activeIntro = index => {
               introItemContent.css('height', introItem.eq(index).outerHeight() + 'px');
               introItem.removeClass('active').eq(index).addClass('active');
            };
            const introStep = (itemKey, introIdx) => ({
               opacity: 1,
               onUpdate: function() {
                  const progress = this.progress();
                  if (progress > 0 && progress < 1) {
                     if (!activeItems.has(itemKey)) {
                        activeIntro(introIdx);
                        activeItems.add(itemKey);
                     }
                  } else if (activeItems.has(itemKey)) {
                     introItem.removeClass('active');
                     activeItems.delete(itemKey);
                  }
               }
            });

            this.tl
               .to($(this.el).find('.home-map-main-img:nth-child(3) .home-map-main-img-inner'), {
                  opacity: 1,
                  onUpdate: function() {
                     const progress = this.progress();
                     if (progress === 0) {
                        introWrap.removeClass('active');
                     }
                     if (progress > 0 && progress < 1 && !activeItems.has('item3')) {
                        introWrap.addClass('active');
                        activeIntro(0);
                        activeItems.add('item3');
                     } else if ((progress === 0 || progress === 1) && activeItems.has('item3')) {
                        activeItems.delete('item3');
                        $('.home-map-main-img:nth-child(3) .home-map-img-svg').removeClass('filter');
                     }
                  },
                  onComplete: () => {
                     $('.home-map-main-img:nth-child(3) .home-map-img-svg').addClass('filter');
                  },
               }, "-=.5")
               .to($(this.el).find('.home-map-main-img .home-map-img-svg path'), {
                  scale: 1,
                  opacity: 1,
                  x: 0,
                  y: 0,
                  stagger: { amount: 0.02, from: 'random' }
               }, "<=0")

               // Use shared logic for similar steps
               .to($(this.el).find('.home-map-main-img:nth-child(4) .home-map-main-img-inner'), introStep('item4', 0))
               .to($(this.el).find('.home-map-main-img:nth-child(5) .home-map-main-img-inner'), introStep('item5', 1))
               .to($(this.el).find('.home-map-main-img:nth-child(6) .home-map-main-img-inner'), introStep('item6', 2))
               .to($(this.el).find('.home-map-main-img:nth-child(7) .home-map-main-img-inner'), introStep('item7', 3))

               .to($(this.el).find('.home-map-main-img:nth-child(8) .home-map-main-img-inner'), {
                  opacity: 1,
                  onUpdate: function() {
                     const progress = this.progress();
                     const item = $(this.targets()[0]).closest('.home-map-main-img');
                     if (progress === 0) {
                        introItem.removeClass('active');
                     }
                     if (progress > 0 && progress < 1 && !activeItems.has('item8')) {
                        item.addClass('active');
                        activeIntro(4);
                        activeItems.add('item8');
                     } else if ((progress === 0 || progress === 1) && activeItems.has('item8')) {
                        activeItems.delete('item8');
                     }
                  }
               });
         }
         destroy() {
         }
      },
      Platform: class extends TriggerSetup {
         constructor() {
            super();
            this.el = null;
         }
         trigger(data) {
            this.el = data.next.container.querySelector('.home-platform-wrap');
            super.setTrigger(this.el, this.onTrigger.bind(this));
         }
         onTrigger() {
            this.setup();
            this.interact();
            this.animationScrub()
         }
         setup() {
            $('.home-platform-img-item-inner img').each((index, item) => {
               new ParallaxImage({ el: item, scaleOffset: 0.1 });
            });
         }
         interact() {}
         animationScrub() {
            const contentItems = $(this.el).find('.home-platform-content-inner');
            const totalItems = contentItems.length;

            this.tl = gsap.timeline({
               scrollTrigger: {
                  trigger: '.home-platform-content',
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: true,
                  onUpdate: (self) => {
                     const progress = self.progress;
                     const itemThreshold = 1 / totalItems;

                     contentItems.each((index, item) => {
                        const startProgress = index * itemThreshold;
                        const endProgress = (index + 1) * itemThreshold;
                        console.log(progress, startProgress, endProgress);
                        if (progress >= startProgress && progress < endProgress) {
                           $(item).addClass('active');
                        } else {
                           $(item).removeClass('active');
                        }
                     });
                  }
               }
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
            if(viewport.w > 991) {
               this.stickerCard();
            }
            else if (viewport.w <= 767) {
               this.swiperCard();
            }
         }
         stickerCard() {
            this.stickerCardWrap = $(this.el).find('.home-why-main-wrap').get(0);
            this.raf = requestAnimationFrame(() => this.render());
            this.lastScrollY = smoothScroll.scroller.scrollY;
            this.lastMousePos = { ...mouse.cacheMousePos };
            this.isEntered = false;
         }
         swiperCard() {
            $('.home-why-main-cms').addClass('swiper');
            $('.home-why-main').addClass('swiper-wrapper');
            $('.home-why-item').addClass('swiper-slide');
            new Swiper('.home-why-main-cms', {
               slidesPerView: 1,
               spaceBetween: cvUnit(12, 'rem'),
               pagination: {
                  el: '.home-why-pagi',
                  bulletClass: 'home-why-pagi-item',
                  bulletActiveClass: 'active',
                  clickable: true,  
               },
            });
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
            this.setup();
            this.animationScrub();
            this.interact();
         }
         animationScrub() {
         }
         setup() {
         }
         interact() {
            const activeAccordion = (idx) => {
               $('.home-usecase-img-item').removeClass('active');
               $('.home-usecase-img-item').eq(idx).addClass('active');
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
   const ProductPage = {
      Key: class extends TriggerSetup {
         constructor() { super(); }
         trigger(data) {
            this.el = data.next.container.querySelector('.product-key-wrap');
            super.setTrigger(this.el, this.onTrigger.bind(this));
         }
         onTrigger() {
            this.animationScrub();
            this.interact();
         }
         animationScrub() {
            const parent = $(this.el).find('.product-key-main-title-wrap');
            const items = $(this.el).find('.product-key-main-title-inner');

            items.each((index, item) => {
               let itemImgPrev = $('.product-key-main-img-main').eq(index - 1);
               let itemImgCurrent = $('.product-key-main-img-main').eq(index);
               let itemLabelPrev = $('.product-key-main-left-main').eq(index - 1);
               let itemLabelCurrent = $('.product-key-main-left-main').eq(index);
               const tlItem = gsap.timeline({
                  scrollTrigger: {
                     trigger: item,
                     start: 'top bottom',
                     end: 'bottom bottom',
                     scrub: true,
                     markers: true,
                     onUpdate: (self) => {
                        if(index > 0) {
                           const progress = self.progress;
                           let prevItemClip = 1 - progress;
   
                           gsap.set(itemImgPrev, { 'clip-path': `inset(0 0 ${progress*100}% 0)` });
                           gsap.set(itemImgCurrent, { 'clip-path': `inset(${prevItemClip*100}% 0 0 0)` });
                           gsap.set(itemLabelPrev, { 'clip-path': `inset(0 0 ${progress*100}% 0)` });
                           gsap.set(itemLabelCurrent, { 'clip-path': `inset(${prevItemClip*100}% 0 0 0)` });
                           if(progress > 0.65) {
                              $(items).removeClass('active');
                              $(item).addClass('active');
                           }  
                        }
                     },
                     onEnter: () => {
                        console.log('start');
                        $('.product-key-tab-item').removeClass('active');
                        $('.product-key-tab-item').eq(index).addClass('active');
                     },
                     onEnterBack: () => {
                        $('.product-key-tab-item').removeClass('active');
                        $('.product-key-tab-item').eq(index).addClass('active');
                     },
                     onLeaveEnter: () => {
                        $('.product-key-tab-item').removeClass('active');
                        $('.product-key-tab-item').eq(index).addClass('active');
                     }
                  }
               });
               tlItem.to(item, { opacity: 1, y: 0, stagger: 0.1 });
            });
         }
         interact() {
            let heightTab = $('.product-key-tab-wrap').height();
            $('.product-key-tab-item').on('click', function() {
               const index = $(this).index();
               $('.product-key-tab-item').removeClass('active');
               $(this).addClass('active');
               smoothScroll.scrollTo($('.product-key-main-title-inner').eq(index).get(0), { duration: 1, offset: heightTab*-1 });
            });
         }
      },
      How : class extends TriggerSetup {
         constructor() { super(); }
         trigger(data) {
            this.el = data.next.container.querySelector('.product-how-wrap');
            super.setTrigger(this.el, this.onTrigger.bind(this));
         }
         onTrigger() {
            this.animationScrub();
            this.interact();
         }
         animationScrub() {
         }
         interact() {
         }
         destroy() {
         }
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
   class ProductPageManager extends PageManager {
      constructor(page) { super(page); }
   }
   const PageManagerRegistry = {
      home: new HomePageManager(HomePage),
      product: new ProductPageManager(ProductPage),
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
      product: {
         namespace: 'product',
         afterEnter(data) {
            PageManagerRegistry.product.initEnter(data);
         },
         beforeLeave(data) {
            PageManagerRegistry.product.destroy(data);
         }
      }
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
