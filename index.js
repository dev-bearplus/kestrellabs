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
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const viewport = {
		get w() {
			return window.innerWidth;
		},
		get h() {
			return window.innerHeight;
		},
   };
   function multiLineText(el){
      let line = $(el).find('.line-anim');
      let textMapLine = $(el).find('.bp-line');
      let lineClone = line.clone();
      if(textMapLine.length >1){
          line.remove();
          textMapLine.each((idx, item) => {
            $(item).css({
               position: 'relative',
               width: 'max-content'
               });
            $(item).append(lineClone.clone());
          })
      }
  }
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
   function initNumberIndex(el) {
      $(el).each((index, item) => {
         $(item).find('.number-index').text(index<=9 ? `0${index + 1}` : index + 1);
      });
   }
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
         let inputSubmit = $(`#${getIDFormName(onlyWorkOnThisFormName)} button[type="submit"] .heading`);

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

   class ParallaxImage {
      constructor({ el, scaleOffset = 0.1 }) {
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
         const scalePercent = 100 + 5 + ((this.scaleOffset - 0.1) * 100);
         gsap.set(this.el, {
            width: scalePercent + '%',
            height: $(this.el).hasClass('img-abs') ? scalePercent + '%' : 'auto'
         });
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
                  let percent = this.elWrap.getBoundingClientRect().top / total;
                  gsap.quickSetter(this.el, 'y', 'px')(-dist * percent * 1.2);
                  gsap.set(this.el, { scale: 1 + (percent * this.scaleOffset) });
               }
            }
      }
   }
   class Marquee {
      constructor(list, item, duration = 40, direction) {
         this.list = list;
         this.item = item;
         this.duration = duration;
         this.direction = direction || 'left';
      }
      setup() {
         let itemWidth = this.item.width();
         console.log('item', this.item)
         const windowWidth = $(window).width();

         // Validate to prevent invalid array length
         if (!itemWidth || itemWidth <= 0 || !windowWidth || windowWidth <= 0) {
            console.warn('Marquee: Invalid dimensions', { itemWidth, windowWidth });
            return;
         }

         const cloneAmount = Math.ceil(windowWidth / itemWidth) + 1;

         // Extra safety check
         if (!Number.isFinite(cloneAmount) || cloneAmount <= 0 || cloneAmount > 1000) {
            console.warn('Marquee: Invalid cloneAmount', cloneAmount);
            return;
         }

         let itemClone = this.item.clone();
         this.list.html('');
         new Array(cloneAmount).fill().forEach(() => {
            let html = itemClone.clone()
            html.css('animation-duration', `${Math.ceil(itemWidth / this.duration)}s`);
            if(this.direction == 'left') {
               html.addClass('marquee-left');
            } else {
               html.addClass('marquee-right');
            }
            this.list.append(html);
         });
      }
      play() {
         if(this.direction == 'left') {
            $(this.list).find('.marquee-left').addClass('anim');
         } else {
            $(this.list).find('.marquee-right').addClass('anim');
         }
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
               wrapper: data?.next?.container || document.querySelector('.main-inner'),
               content: data?.next?.container?.querySelector('.main-content') || document.querySelector('.main-content'),
               syncTouch: true,
               smoothWheel: true,
               smoothTouch: false,
               infinite: false,
         })
         let scrollTimeout = null;
			this.lenis.on("scroll", (e) => {
				this.updateOnScroll(e);
            ScrollTrigger.update();

            clearTimeout(scrollTimeout);
            if (Math.abs(e.velocity) > 0.1) {
               data?.next?.container.classList.remove('lenis-stopped');
            }

            scrollTimeout = setTimeout(() => {
               data?.next?.container.classList.add('lenis-stopped');
            }, 150);
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
         if($('.header-menu').hasClass('active')) {
            $('.header-menu').removeClass('active');
         }
		}

		start() {
			if (this.lenis) {
            this.lenis.start();
			}
         console.log('start');
         $('.body').css('overflow', 'initial');
		}

		stop() {
			if (this.lenis) {
				this.lenis.stop();
         }
         console.log('stop');
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
   function mapFormToObject(ele) {
      return ([...new FormData(ele).entries()].reduce(
         (prev, cur) => {
            const name = cur[0];
            const val = cur[1];
            return { ...prev, [name]: val };
         },
         {}
      ));
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
         let currentViewportWidth = viewport.w - cvUnit(16, 'rem');
         let currentViewportHeight = viewport.h - cvUnit(16, 'rem');
         let widthHexagon = currentViewportHeight*200/231;
         let borderHeight = $('.main-deco-inner .line-horizital.top').css('height');
         if(viewport.w > 991){
            this.tlLoadMaster
            .to('.loading .hexagon-animated', {duration: 0.3,'--loading-logo-dasharray': 200, ease: 'power1.out'})
            .to('.loading .hexagon-animated', {duration: 0.2, '--loading-logo-dasharray': 350, ease: 'power1.out'})
            .to('.loading .hexagon-animated', {duration: 0.4, '--loading-logo-dasharray': 380, ease: 'none'})
            .to('.loading .hexagon-animated', {duration: 0.3, '--loading-logo-dasharray': 686, ease: 'power2.in'})
            .to('.loading .hexagon-animated', {'width': widthHexagon, 'height': currentViewportHeight, duration: .4, delay: .2, ease: 'power1.out'})
            .to('.loading .hexagon-number', { autoAlpha: 0, duration: .4 }, '<=0')
            .to('.loading .hexagon-animated',{ 'width': currentViewportWidth, duration: .6 }, '<=0.3')
            .to('.loading .hexagon-stroke', {'clip-path': 'polygon(50% 0%, 100% 0%, 100% 100%, 51% 100%, 0% 100%, 0% 0%)', duration: .6}, '<=0')
            .to('.loading .hexagon-stroke-inner', {'clip-path': 'polygon(50% 0%, 100% 0%, 100% 100%, 51% 100%, 0% 100%, 0% 0%)', 'inset': `${borderHeight}`, duration: .6}, '<=0')
            .eventCallback('onUpdate', () => {
               const currentDashProgress = gsap.getProperty('.loading .hexagon-animated', '--loading-logo-dasharray')/686;
               $('.hexagon-number .heading').text(`${(currentDashProgress * 100).toFixed(0) < 10 ? '0' : ''}${(currentDashProgress * 100).toFixed(0)}`);
               if(currentDashProgress >= 1) {
                  $('.hexagon-stroke').addClass('active');
                  $('.hexagon-animated .embed-ic').addClass('hidden')
               }
            });
         }
         else {
            this.tlLoadMaster
            .to('.loading .hexagon-animated', {duration: 0.3,'--loading-logo-dasharray': 200, ease: 'power1.out'})
            .to('.loading .hexagon-animated', {duration: 0.2, '--loading-logo-dasharray': 350, ease: 'power1.out'})
            .to('.loading .hexagon-animated', {duration: 0.4, '--loading-logo-dasharray': 380, ease: 'none'})
            .to('.loading .hexagon-animated', {duration: 0.3, '--loading-logo-dasharray': 686, ease: 'power2.in'})
            .to('.loading .hexagon-animated', {'width':  currentViewportWidth, 'height': currentViewportHeight, duration: .4, delay: .2, ease: 'power1.out'})
            .to('.loading .hexagon-number', { autoAlpha: 0, duration: .4 }, '<=0')
            .to('.loading .hexagon-stroke', {'clip-path': 'polygon(50% 0%, 100% 0%, 100% 100%, 51% 100%, 0% 100%, 0% 0%)', duration: .4}, '<=0')
            .to('.loading .hexagon-stroke-inner', {'clip-path': 'polygon(50% 0%, 100% 0%, 100% 100%, 51% 100%, 0% 100%, 0% 0%)', 'inset': `${borderHeight}`, duration: .4}, '<=0')
            .eventCallback('onUpdate', () => {
               const currentDashProgress = gsap.getProperty('.loading .hexagon-animated', '--loading-logo-dasharray')/686;
               $('.hexagon-number .heading').text(`${(currentDashProgress * 100).toFixed(0) < 10 ? '0' : ''}${(currentDashProgress * 100).toFixed(0)}`);
               if(currentDashProgress >= 1) {
                  $('.hexagon-stroke').addClass('active');
                  $('.hexagon-animated .embed-ic').addClass('hidden')
               }
            });
         }
      }
      play(data) {
         this.tlLoadMaster.play();
      }
      onceSetup(data) {
         globalHooks.triggerOnceSetup(data);
      }
      oncePlay(data) {
         globalHooks.triggerOncePlay(data);
         $('.loading').addClass('loaded');
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
                        console.log('click data sub link:',$(`#${$(this).attr('data-sub-link')}`));
                        // $(`#${$(this).attr('data-sub-link')}`).trigger('click');
                        smoothScroll.scrollTo(`#${$(this).attr('data-sub-link')}`, {
                           offset: 0
                        });
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
         this.el = document.querySelector('.main-deco');
         this.widthLineVertical = this.el.querySelector('.line-vertical').offsetWidth;
      }
      leaveAnim(data) {
         // Store promise để chờ HubSpot load
         this.hubspotLoadPromise = null;

         if(data.next.namespace === 'schedule') {
            if (window.HubSpotConversations) {
               window.HubSpotConversations.widget.remove();
            }
            $('script[src*="MeetingsEmbedCode.js"]').remove();

            this.hubspotLoadPromise = new Promise((resolve) => {
               $.getScript('https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js')
                  .done(() => {
                     console.log('HubSpot script loaded');
                     resolve();
                  })
                  .fail(() => {
                     console.warn('HubSpot script failed to load');
                     resolve();
                  });
            });
         }

         this.tlLeave = gsap.timeline({
            onStart: () => {
               this.updateBeforeTrans.bind(this)(data);
            },
            onComplete: () => {
               this.updateAfterTrans.bind(this)(data);
            }
         })
         // this.tlLeave
         //    .fromTo(data.current.container, {opacity: 1}, {duration: .6, opacity: 0})
         this.tlLeave
               .fromTo('html', {'--trans-percent': '0%'}, {'--trans-percent': '50%', duration: .6, ease: 'power1.inOut'})
               .fromTo('html', {'--size--line': '0'}, {'--size--line': this.widthLineVertical, duration: .6, ease: 'power1.inOut'}, '<=0')
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
            .fromTo('html', {'--trans-percent': '50%'}, {'--trans-percent': '0%', duration: .6, ease: 'power1.out'})
            .fromTo('html', {'--size-line': this.widthLineVertical}, {'--size-line': 0, duration: .6, ease: 'power1.inOut'}, '<=0')
      return this.tlEnter;
      }
      async play(data) {
         await pageTrans.leaveAnim(data).then(async () => {
            if (pageTrans.hubspotLoadPromise) {
               await pageTrans.hubspotLoadPromise;
            }
            pageTrans.enterAnim(data)
         })
      }
      enterSetup(data) {
         reinitializeWebflow(data);
         globalHooks.triggerEnterSetup(data);
      }
      enterPlay(data) {
         globalHooks.triggerEnterPlay(data);
      }
      updateBeforeTrans(data) {
         // gsap.set(data.next.container, { opacity: 0, 'pointer-events': 'none', zIndex: 1 })
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
         this.listDependent = [];
         this.hideTimeout = null;
      }
      init(data) {
         this.el = document.querySelector('.header');
         if (viewport.w <= 991) {
            this.toggleNav();
         }
      }
      update(data) {
         if($(this.el).find('.header-menu').hasClass('active')) {
            $(this.el).find('.header-menu').removeClass('active');
         }
         if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
         }
         this.updateOnScroll(smoothScroll.lenis);
      }
      updateOnScroll(inst) {
         viewport.w > 991 && this.toggleHide(inst);
         this.toggleScroll(inst);
         this.onHideDependent();
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
            if (inst.scroll > ($(this.el).height() * 5)) {
               $(this.el).addClass('on-hide');
            }
         } else if (inst.direction == -1) {
            if (inst.scroll > ($(this.el).height() * 5)) {
               $(this.el).addClass("on-hide");
               $(this.el).removeClass("on-hide");

               if (
                  inst.scroll > ($(this.el).height() * 5) &&
                  inst.scroll === smoothScroll.scroller.scrollY
                  && inst.velocity === 0
                  && !$(this.el).hasClass('on-hide')
                  && !$(this.el).is(':hover')
               ) {
                  this.hideTimeout = setTimeout(() => {
                     $(this.el).addClass('on-hide');
                  }, 100);
               }
            }
         }
         else {
            $(this.el).removeClass("on-hide");
         }
      }
      registerDependent(dependentEl) {
         this.listDependent.push(dependentEl);
      }
      unregisterDependent(dependentEl) {
         if (this.listDependent.includes(dependentEl)) {
            this.listDependent = this.listDependent.filter((item) => item !== dependentEl);
         }
      }
      onHideDependent() {
         let heightHeader = $(this.el).height() - cvUnit(1, 'rem');
         if(!$(this.el).hasClass('on-hide')) {
            this.listDependent.forEach((item) => {
               $(item).css('top', heightHeader);
            });
         } else {
            this.listDependent.forEach((item) => {
               $(item).css('top', 0);
            });
         }
      }
      toggleNav() {
         $(this.el).find('.heading-menu-btn').on('click', () => {
            $(this.el).find('.header-menu').toggleClass('active');
         });
         if(viewport.w < 991) {
            $(this.el).find('.header-menu-item.has-submenu').on('click', function(e){
               e.preventDefault();
               $(this).toggleClass('active');
               $(this).next('.header-menu-dropdown').slideToggle();
            });
         }
      }
      open() {
         if (this.isOpen) return;
         $(this.el).addClass('on-open-nav');
         $(this.el).find('.header-ham').addClass('active');
         this.isOpen = true;
         smoothScroll.lenis.stop();
      }
      close() {
         if (!this.isOpen) return;
         $(this.el).removeClass('on-open-nav');
         $(this.el).find('.header-ham').removeClass('active');
         this.isOpen = false;
         smoothScroll.lenis.start();
      }
   }
   const header = new Header();
   class Footer  {
      constructor() {
         this.el = null;
         this.tlOverlap = null;
         this.raf = null;
         this.tlForm = null;
         this.tlTitle = null;
         this.tlMenu = null;
         this.tlInfo = null;
         this.tlLogo = null;
         this.tlImg = null;
         this.copyright = null;
      }
      init(data) {
         this.el = data.next.container.querySelector('.footer');
         this.onTrigger();
      }
      onTrigger() {
         this.animationReveal();
         this.interact();
      }
      animationReveal() {
         console.log('onTrigger footer');
         this.tlTitle = gsap.timeline({
            scrollTrigger: {
               trigger: $(this.el).find('.footer-title-wrap'),
               start: 'top+=55% bottom',
               once: true,
            }
         });
         new MasterTimeline({
            timeline:this.tlTitle,
            triggerInit: this.el,
            tweenArr: [
               new FadeSplitText({ el: $(this.el).find('.footer-title').get(0) }),
            ]
         });
         this.tlForm = gsap.timeline({
            scrollTrigger: {
               trigger: $(this.el).find('.footer-form-wrap'),
               start: 'top+=55% bottom',
               once: true,
            }
         });
         new MasterTimeline({
            timeline:this.tlForm,
            triggerInit: this.el,
            tweenArr: [
               new FadeSplitText({ el: $(this.el).find('.footer-form-label .txt').get(0) }),
               new FadeSplitText({ el: $(this.el).find('.footer-form-title .txt').get(0) }),
               new FadeIn({ el: $(this.el).find('.footer-form'), type: 'bottom' }),
            ]
         });
         this.tlMenu = gsap.timeline({
            scrollTrigger: {
               trigger: $(this.el).find('.footer-menu'),
               start: 'top+=55% bottom',
               once: true,
            }
         });
         $(this.el).find('.footer-menu-item').each((index, item) => {
            new MasterTimeline({
               stagger: 0.05,
               timeline:this.tlMenu,
               triggerInit: this.el,
               tweenArr: [
                  new FadeSplitText({ el: $(item).find('.footer-menu-item-label .txt').get(0) }),
                  ...Array.from($(item).find('.footer-menu-item-link')).flatMap((item) => [
                     new FadeSplitText({ el: $(item).find('.txt').get(0) }),
                  ]),
               ]
            });
         });
         this.tlInfo = gsap.timeline({
            scrollTrigger: {
               trigger: $(this.el).find('.footer-info-wrap'),
               start: 'top+=55% bottom',
               once: true,
            }
         });
         $(this.el).find('.footer-info-item').each((index, item) => {
            new MasterTimeline({
               timeline:this.tlInfo,
               triggerInit: this.el,
               tweenArr: [
                  ...Array.from($(item).find('.footer-info-item-label')).flatMap((el) => [
                     new FadeSplitText({ el: $(el).find('.txt').get(0) }),
                  ]),
                  ...Array.from($(item).find('.footer-info-item-title')).flatMap((el) => [
                     new FadeSplitText({ el: $(el).find('.txt').get(0) }),
                  ]),
               ]
            });
         });
         this.tlLogo = gsap.timeline({
            scrollTrigger: {
               trigger: $(this.el).find('.footer-logo'),
               start: 'top+=55% bottom',
               once: true,
            }
         });
         new MasterTimeline({
            timeline:this.tlLogo,
            triggerInit: this.el,
            tweenArr: [
               new ScaleInset({ el: $(this.el).find('.footer-logo-inner').get(0) }),
            ]
         });
         this.tlImg = gsap.timeline({
            scrollTrigger: {
               trigger: $(this.el).find('.footer-img-wrap'),
               start: 'top+=55% bottom',
               once: true,
            }
         });
         new MasterTimeline({
            timeline:this.tlImg,
            triggerInit: this.el,
            tweenArr: [
               new ScaleInset({ el: $(this.el).find('.footer-img-item').eq(0).get(0) }),
               ...Array.from($(this.el).find('.footer-img-plus')).flatMap((item) => [
                  new ScaleInset({ el: $(item).get(0) }),
               ]),
            ]
         });
         this.copyright = gsap.timeline({
            scrollTrigger: {
               trigger: $(this.el).find('.footer-copyright-wrap'),
               start: 'top+=35% bottom',
               once: true,
            }
         });
         new MasterTimeline({
            timeline:this.copyright,
            triggerInit: this.el,
            tweenArr: [
               new FadeSplitText({ el: $(this.el).find('.footer-copyright-txt .txt').get(0) }),
               ...Array.from($(this.el).find('.footer-policy-item')).flatMap((item) => [
                  new FadeSplitText({ el: $(item).find('.txt').get(0) }),
               ]),
            ]
         });
      }
      interact() {
         this.hoverLogo();
         this.validForm();
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
      validForm() {
         //debouce on input
         const debounce = (func, timeout = 100) => {
            let timer;
            return (...args) => {
               clearTimeout(timer);
               timer = setTimeout(() => func.apply(this, args), timeout);
            };
         };
         $(this.el).find('.footer-form input').on('input', debounce((e) => {
            const value = $(e.currentTarget).val();
            if (emailRegex.test(value)) { 
               $(e.currentTarget).parent().find('button[type="submit"]').addClass('active');
            } else {
               $(e.currentTarget).parent().find('button[type="submit"]').removeClass('active');
            }
         }, 300));
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
         if (this.tlTitle) {
            this.tlTitle.kill();
         }
         if (this.tlForm) {
            this.tlForm.kill();
         }
         if (this.tlMenu) {
            this.tlMenu.kill();
         }
         if (this.tlInfo) {
            this.tlInfo.kill();
         }
         if (this.tlLogo) {
            this.tlLogo.kill();
         }
         if (this.tlImg) {
            this.tlImg.kill();
         }
         if (this.copyright) {
            this.copyright.kill();
         }
      }
   }
   const footer = new Footer();
   class Cta  {
      constructor() {
         this.el = null;
         this.tlContent = null;
         this.tlImage = null;
      }
      init(data) {
         this.el = data.next.container.querySelector('.home-cta-wrap');
         this.onTrigger();
      }
      onTrigger() {
         this.animationReveal();
         this.interact();
      }
      animationReveal() {
         this.tlContent = gsap.timeline({
            scrollTrigger: {
               trigger: $(this.el).find('.home-cta-main'),
               start: 'top+=40% bottom',
               once: true,
            }
         });
         new MasterTimeline({
            timeline:this.tlContent,
            triggerInit: this.el,
            stagger: 0.15,
            tweenArr: [
               ...Array.from($(this.el).find('.home-cta-head-item-txt')).flatMap((item) => [
                  new FadeIn({ el: $(item), type: 'bottom' }),
               ]),
               new FadeSplitText({ el: $(this.el).find('.home-cta-main-item-title .heading').get(0) }),
               new FadeSplitText({ el: $(this.el).find('.home-cta-main-item-sub .txt').get(0) }),
               new FadeIn({ el: $(this.el).find('.home-cta-main-item-btn'), type: 'bottom' }),
            ]
         });
         this.tlImage = gsap.timeline({
            scrollTrigger: {
               trigger: $(this.el).find('.home-cta-deco'),
               start: 'top+=40% bottom',
               once: true,
            }
         });
         new MasterTimeline({
            timeline:this.tlImage,
            triggerInit: this.el,
            tweenArr: [
               new ScaleInset({ el: $(this.el).find('.home-cta-deco-item-img').get(0) }),
            ]
         });
      }
      interact() {
      }
      destroy() {
         if (this.tlContent) {
            this.tlContent.kill();
         }
         if (this.tlImage) {
            this.tlImage.kill();
         }
      }
   }
   const cta = new Cta();
   const HomePage = {
      Hero: class {
         constructor() {
            this.el = null;
            this.tlOnce = null;
            this.tlEnter = null;
            this.tlTriggerEnter = null;
            this.taglineMarquee = null;
         }
         setup(data, mode) {
            this.el = data.next.container.querySelector('.home-hero-wrap');
            this.taglineMarquee = new Marquee($(this.el).find('.home-hero-work'), $(this.el).find('.home-hero-work-inner'), 40);
            if (mode === 'once') {
               this.setupOnce(data);
            } else if (mode === 'enter') {
               this.setupEnter(data);
            }
            else return;
            this.taglineMarquee.setup();
            this.interact();
         }
         setupOnce(data) {
            this.tlOnce = gsap.timeline({
               paused: true,
               delay: .3,  
               onComplete: () => {
                  gsap.to($(this.el).find(' .home-hero-img-plus'), {
                     autoAlpha: 1,
                     duration: 0.5
                  });
                  gsap.to($(this.el).find('.home-hero-curor-line'), {
                     autoAlpha: .16,
                     duration: 0.5
                  });
                  this.rotateText()
                  this.taglineMarquee.play();
               }
            })

            this.animationReveal(this.tlOnce);
         }
         setupEnter(data) {
            this.tlEnter = gsap.timeline({
               paused: true,
               onComplete: () => {
                  this.rotateText();
                  this.taglineMarquee.play();
               }
            })

            this.tlTriggerEnter = gsap.timeline({
               scrollTrigger: {
                  trigger: this.el,
                  start: 'top bottom+=50%',
                  end: 'bottom top-=50%',
                  once: true,
                  onEnter: () => this.tlEnter.play(),
                  onEnterBack: () => this.tlEnter.play(),
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
            let headingFlipping = new FlipText($(this.el).find('.home-hero-title-wrap').get(0), {});
            headingFlipping.setup();
            headingFlipping.play();
         }
         animationReveal(timeline) {
            new MasterTimeline({
               timeline:timeline,
               allowMobile: true,
               tweenArr: [
                  new FadeIn({ el: $(this.el).find('.home-hero-img-inner'), type: 'center' }),
                  new FadeIn({ el: $(this.el).find('.home-hero .bg-border'), type: 'none' }),
                  new FadeSplitText({ el: $(this.el).find('.home-hero-title:first-child .heading').get(0), delay: .1 }),
                  new FadeSplitText({ el: $(this.el).find('.home-hero-sub .txt:first-child').get(0), delay: .1 }),
                  new FadeSplitText({ el: $(this.el).find('.home-hero-btn .txt').get(0) }),
                  new FadeIn({ el: $(this.el).find('.home-hero-btn .btn-bg-ic:first-child'), type: 'bottom' }),
                  new FadeIn({ el: $(this.el).find('.home-hero-work'), type: 'bottom' }),
               ]
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

            // Lerp and clamp current positions
            this.currentX = Math.max(this.minX, Math.min(lerp(this.currentX, this.targetX, 0.3), this.maxX));
            this.currentY = Math.max(this.minY, Math.min(lerp(this.currentY, this.targetY, 0.3), this.maxY));

            // Cache DOM elements and dimensions
            const $el = $(this.el);
            const $verticalLine = $el.find('.home-hero-curor-line.line-vertical');
            const $horizontalLine = $el.find('.home-hero-curor-line.line-horizital');
            const $plus = $el.find('.home-hero-img-plus');
            const $interact = $el.find('.home-hero-interact');
            const $coordi = $el.find('.home-hero-img-coordi');

            const interactWidth = $interact.width();
            const interactHeight = $interact.height();
            const coordiWidth = $coordi.width();
            const coordiHeight = $coordi.height();
            const padding = cvUnit(4, 'rem');
            const edgeThreshold = cvUnit(20, 'rem');

            // Calculate normalized positions
            const halfWidth = this.rulerWrap.offsetWidth / 2;
            const halfHeight = this.rulerWrap.offsetHeight / 2;
            const normalizedX = normalize(this.currentX, this.rulerWrap.offsetWidth) * halfWidth;
            const normalizedY = normalize(this.currentY, this.rulerWrap.offsetHeight) * halfHeight;

            // Edge detection
            const isAtEdgeX = this.currentX === this.minX || this.currentX === this.maxX;
            const isAtEdgeY = this.currentY === this.minY || this.currentY === this.maxY;
            const isAtChangeCoordiX = this.currentX <= this.minX + coordiWidth + edgeThreshold;
            const isAtChangeCoordiY = this.currentY >= this.maxY - coordiHeight - edgeThreshold;
            const isAtChangeInteractX = this.currentX <= this.maxX - interactWidth - edgeThreshold;
            const isAtChangeInteractY = this.currentY >= this.maxY - interactHeight - edgeThreshold;

            // Calculate lerped values
            const currentScale = gsap.getProperty($plus.get(0), 'scale') || 1;
            const scale = lerp(currentScale, (isAtEdgeX || isAtEdgeY) ? 1.2 : 1, 0.08);

            const currentOpacityVertical = gsap.getProperty($verticalLine.get(0), 'opacity') || .16;
            const currentOpacityHorizontal = gsap.getProperty($horizontalLine.get(0), 'opacity') || .16;
            const autoAlphaVertical = lerp(currentOpacityVertical, isAtEdgeX ? 0 : .16, 0.1);
            const autoAlphaHorizontal = lerp(currentOpacityHorizontal, isAtEdgeY ? 0 : .16, 0.1);

            const currentBgColor = gsap.getProperty($plus.get(0), 'backgroundColor');
            const currentColorAlpha = parseFloat(currentBgColor.split(',')[3]) || 0;
            const targetColorAlpha = (isAtEdgeX && isAtEdgeY) ? 1 : 0;
            const lerpedColorAlpha = lerp(currentColorAlpha, targetColorAlpha, 0.08);

            // Calculate positions with cached dimensions
            const interactHalfWidth = interactWidth / 2 + padding;
            const interactHalfHeight = interactHeight / 2 + padding;
            const coordiHalfWidth = coordiWidth / 2 + padding;
            const coordiHalfHeight = coordiHeight / 2 + padding;

            const interactX = isAtChangeInteractX
               ? normalizedX + interactHalfWidth
               : normalizedX - interactHalfWidth;

            const interactY = isAtChangeInteractY
               ? normalizedY - interactHalfHeight
               : normalizedY + interactHalfHeight;

            const defaultCoordiX = normalizedX - coordiHalfWidth;
            const coordiX = normalizedX >= 0
               ? defaultCoordiX
               : normalizedX + coordiHalfWidth;

            const defaultCoordiY = !isAtChangeCoordiX
               ? normalizedY + coordiHalfHeight
               : normalizedY - coordiHalfHeight;
            const coordiY = normalizedY >= 0
               ? normalizedY - coordiHalfHeight
               : defaultCoordiY;

            // Apply all transforms
            gsap.set($verticalLine, { x: normalizedX, autoAlpha: autoAlphaVertical });
            gsap.set($horizontalLine, { y: normalizedY, autoAlpha: autoAlphaHorizontal });
            gsap.set($plus, {
               x: normalizedX,
               y: normalizedY,
               scale: scale,
               color: `rgba(241, 85, 52, ${1 - lerpedColorAlpha})`
            });
            gsap.set($interact, {
               x: interactX,
               y: isAtChangeInteractX ? interactY : normalizedY - interactHalfHeight,
               autoAlpha: 1 - lerpedColorAlpha
            });
            gsap.set($coordi, {
               x: isAtChangeCoordiX ? coordiX : defaultCoordiX,
               y: isAtChangeCoordiY ? coordiY : defaultCoordiY,
               autoAlpha: 1 - lerpedColorAlpha
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
                        if (!$('.home-hero-interact').hasClass('hidden')) {
                           $('.home-hero-interact').addClass('hidden');
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
            if (this.raf) {
               this.raf = null;
            }
            cancelAnimationFrame(this.raf);
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
            this.tlStickFade = null;
            this.tlBody = null;
            this.tlPartner = null;
         }
         trigger(data) {
            this.el = data.next.container.querySelector('.home-intro-wrap');
            super.setTrigger(this.el, this.onTrigger.bind(this));
         }
         onTrigger() {
            this.setup();
            viewport.w > 767 && this.animationReveal();
            this.animationScrub();
            this.interact();
         }
         setup() {
            
            this.tlStickFade = gsap.timeline({
               scrollTrigger: {
                  trigger: $(this.el).find('.home-intro-content-title').get(0),
                  start: 'center bottom+=10%',
                  end: `center top+=40%`,
                  scrub: true,
               }
            });
            this.tlBody = gsap.timeline({
               scrollTrigger: {
                  trigger: $(this.el).find('.home-intro-body').get(0),
                  start: 'top+=45% bottom',
               }
            });
            this.tlPartner = gsap.timeline({
               scrollTrigger: {
                  trigger: $(this.el).find('.home-intro-partner-wrap').get(0),
                  start: 'top+=55% bottom',
               }
            });
            let title = new SplitText( $(this.el).find('.home-intro-content-title .heading').get(0), {type: 'chars,words, lines'});
            this.tlStickFade.fromTo(title.chars, {color: '#b3b3af'}, { color: '#282828', stagger: 0.03 })
            $(this.el).find('.about-inves-logo-list').each((index, item) => {
               let direction = $(item).attr('data-direction');
               let marqueeLogo = new Marquee($(item).closest('.about-inves-logo-cms'),$(item), 40, direction);
               marqueeLogo.setup();
               marqueeLogo.play();
            });
         }
         animationReveal() {
            new MasterTimeline({
               timeline:this.tlBody,
               tweenArr: [
                  new ScaleInset({ el: $(this.el).find('.home-intro-img-inner').get(0) }),
                  new FadeSplitText({ el: $(this.el).find('.home-intro-content-title .heading').get(0), duration: .6, stagger: .004, isDisableRevert: true, splitType: 'words' }),
                  new FadeIn({ el: $(this.el).find('.home-intro-btn-txt .txt'), type: 'center', delay: 1 }),
                  new FadeIn({ el: $(this.el).find('.home-intro-btn-ic'), type: 'center', delay: 1 }),
               ]
            });
            new MasterTimeline({
               timeline:this.tlPartner,
               tweenArr: [
                  ...Array.from($(this.el).find('.home-intro-partner-label-wrap')).flatMap((item, index) => {
                    return [
                      new FadeSplitText({ el: $(item).find('.home-intro-partner-label .txt').get(0), delay: index * 0.1}),
                    ] 
                  }),
                  ...Array.from($(this.el).find('.home-intro-partner-inner')).flatMap((item, index) => {
                    return [
                      new FadeIn({ el: $(item), type: 'bottom', delay: index * 0.1 }),
                    ]
                  })
               ]
            });
         }
         animationScrub() {
            new ParallaxImage({ el: $(this.el).find('.home-intro-img-inner img').get(0) });
         }
         interact() {
         }
         destroy() {
            if (this.tlStickFade) {
               this.tlStickFade.kill();
            }
            if (this.tlBody) {
               this.tlBody.kill();
            }
            if (this.tlPartner) {
               this.tlPartner.kill();
            }
         }
      },
      Problem: class extends TriggerSetup {
         constructor() {
            super();
            this.el = null;
            this.tlHead = null;
            this.tlBody = null;
         }
         trigger(data) {
            this.el = data.next.container.querySelector('.home-problem-wrap');
            super.setTrigger(this.el, this.onTrigger.bind(this));
         }
         onTrigger() {
            this.setup();
            this.animationReveal();
         }
         setup() {
            this.tlHead = gsap.timeline({
               scrollTrigger: {
                  trigger: $(this.el).find('.home-problem-head').get(0),
                  start: 'top+=65% bottom',
               },
            });
            this.tlBody = gsap.timeline({
               scrollTrigger: {
                  trigger: $(this.el).find('.home-problem-content').get(0),
                  start: 'top+=55% bottom',
               },
            });
            if(viewport.w < 768) {
               this.swiperCard();
            }
         }
         animationReveal() {
            new MasterTimeline({
               timeline:this.tlHead,
               tweenArr: [
                  new FadeSplitText({ el: $(this.el).find('.home-problem-label .txt').get(0) }),
                  new FadeSplitText({ el: $(this.el).find('.home-problem-sub .txt').get(0) }),
                  new FadeSplitText({ el: $(this.el).find('.home-problem-title .heading').get(0)}),
               ]
            });
            $('.home-problem-item').each((index, item) => {
               new MasterTimeline({
                  timeline:this.tlBody,
                  stagger: 0.05,
                  tweenArr: [
                     new FadeSplitText({ el: $(item).find('.home-problem-item-head-title .txt').get(0)}),
                     new FadeSplitText({ el: $(item).find('.home-problem-item-head-num .txt').get(0)}),
                     new ScaleInset({ el: $(item).find('.home-problem-item-img').get(0) }),
                     new FadeSplitText({ el: $(item).find('.home-problem-item-title .heading').get(0)}),
                     new FadeSplitText({ el: $(item).find('.home-problem-item-sub .txt').get(0)}),

                  ]
               });
            });
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
               on: {
                  touchEnd: (swiper) => {
                     smoothScroll.start();                     
                   },
                  slideChange: function(swiper) {
                     smoothScroll.stop();
                     // check index active of swiper slide
                     const indexActive = swiper.activeIndex;
                     $('.home-problem-pagi-item').removeClass('active');
                     $('.home-problem-pagi-item').eq(indexActive).addClass('active');
                  }
               }
            });
         }
         destroy() {
            if(this.tlHead) {
               this.tlHead.kill();
            }
            if(this.tlBody) {
               this.tlBody.kill();
            }
         }
      },
      Map: class extends TriggerSetup {
         constructor() {
            super();
            this.el = null;
            this.tl = null;
            this.tlContent = null;
            this.tlStickFade = null;
         }
         trigger(data) {
            this.el = data.next.container.querySelector('.home-map-wrap');
            super.setTrigger(this.el, this.onTrigger.bind(this));
         }
         onTrigger() {
            this.setup();
            this.animationReveal();
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

            $(this.el).find('.home-map-number-wrap').each((index, item) => {
               let number = $(item).find('.home-map-number').get(0);
               const numberRect = number.getBoundingClientRect();
               const relativeLeft = numberRect.left - parentRect.left + gap + numberRect.width;
               const relativeTop = numberRect.top - parentRect.top;

               $(this.el).find(`.home-map-main-img-sub-hover`).eq(index).css({
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
            $(document).on('click', (e) => {
               if (!$(e.target).closest('.home-map-number').length) {
                  $(this.el).find('.home-map-number-wrap').removeClass('active');
                  $(this.el).find('.home-map-main-img-sub-hover').removeClass('active');
               }
            });
         }
         animationReveal() {
            this.tlContent = gsap.timeline({
               paused: true,
            });
            new MasterTimeline({
               timeline:this.tlContent,
               triggerInit: this.el,
               stagger: 0.05,
               tweenArr: [
                  new FadeSplitText({ el: $(this.el).find('.home-map-content-label .txt').get(0) }),
                  new FadeSplitText({ el: $(this.el).find('.home-map-content-title .heading').get(0) }),
                  new FadeSplitText({ el: $(this.el).find('.home-map-content-sub .txt').get(0) }),
                  ...Array.from($(this.el).find('.home-map-content-item')).flatMap((item, index) => {
                    return [
                      new ScaleInset({ el: $(item).find('.home-map-content-item-ic').get(0), elInner: $(item).find('.home-map-content-item-ic-inner').get(0) }),
                      new FadeSplitText({ el: $(item).find('.home-map-content-item-title .txt').get(0)}),
                    ]
                  })
               ]
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
            if(viewport.w > 767) {
               this.tlStickFade
                  .fromTo($(this.el).find('.home-map-main-inner'), { y: -($(this.el).find('.home-map-inner').height()) }, { y: 0, ease: 'none' }, 0)
            }
            this.tl = gsap.timeline({
               scrollTrigger: {
                  trigger: this.el,
                  start: 'top 50%',
                  end: viewport.w > 767 ? `bottom-=${cvUnit(30, 'vh')} bottom` : `bottom-=${cvUnit(180, 'vh')} top`,
                  scrub: true,
                  onUpdate: (self) => {
                     if (self.isActive) {
                        $(this.el).find('.home-map').removeClass('expanded');
                     }
                     else {
                        if (self.progress === 1) {
                           setTimeout(() => {
                              this.tlContent.play();
                           }, 200);
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
                        $('.home-map-main-img-sub-hover').removeClass('active');
                        $('.home-map-number-wrap').removeClass('active');
                        activeItems.delete('item8');
                     }
                  }
               });
         }
         destroy() {
            if (this.tlStickFade) {
               this.tlStickFade.kill();
            }
            if(this.tl) {
               this.tl.kill();
            }
            if(this.tlContent) {
               this.tlContent.kill();
            }
         }
      },
      Platform: class extends TriggerSetup {
         constructor() {
            super();
            this.el = null;
            this.tl = null;
            this.tlContent = null;
            this.tlImage = null;
         }
         trigger(data) {
            this.el = data.next.container.querySelector('.home-platform-wrap');
            super.setTrigger(this.el, this.onTrigger.bind(this));
         }
         onTrigger() {
            this.setup();
            this.animationReveal();
            this.animationScrub()
            this.interact();
         }
         setup() {
            if(viewport.w > 991) {
               let centerStick = (viewport.h - $(this.el).find('.home-platform-content-inner').height()) / 2;
               $(this.el).find('.home-platform-content-inner').css('top', `${centerStick}px`);
            }
         }
         interact() {}
         animationReveal() {
            this.tlContent = gsap.timeline({
               scrollTrigger: {
                  trigger: $(this.el).find('.home-platform-content').get(0),
                  start: 'top+=40% bottom',
                  once: true,
               }
            });
            new MasterTimeline({
               timeline:this.tlContent,
               tweenArr: [
                  new FadeIn({el: $(this.el).find('.home-platform-content-inner.active .home-platform-content-number').get(0)}),
                  new FadeSplitText({ el: $(this.el).find('.home-platform-content-inner.active .home-platform-content-title .heading').get(0) }),
                  new FadeSplitText({ el: $(this.el).find('.home-platform-content-inner.active .home-platform-content-sub .txt').get(0) }),
                  new FadeIn({el: $(this.el).find('.home-platform-content-inner.active .home-intro-btn-inner'), type: "bottom"}),
               ]
            });
            $('.home-platform-img-item').each((index, item) => {
               this.tlImage = gsap.timeline({
                  scrollTrigger: {
                     trigger: item,
                     start: 'top+=45% bottom',
                     once: true
                  }                  
               });
               new MasterTimeline({
                  timeline:this.tlImage,
                  tweenArr: [
                     new ScaleInset({el: $(item).find('.home-platform-img-item-inner').get(0)}),
                  ]
               });
            });
         }
         animationScrub() {
            $(this.el).find('.home-platform-img-item-inner img').each((_, item) => new ParallaxImage({ el: item }));

            const contentItems = $(this.el).find('.home-platform-content-inner');
            const totalItems = contentItems.length;

            this.tl = gsap.timeline({
               scrollTrigger: {
                  trigger: $(this.el).find('.home-platform-content').get(0),
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: true,
                  onUpdate: (self) => {
                     const progress = self.progress;
                     const itemThreshold = 1 / totalItems;

                     contentItems.each((index, item) => {
                        const startProgress = index * itemThreshold;
                        const endProgress = (index + 1) * itemThreshold;
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
            if (this.tl) {
               this.tl.kill();
               this.tl = null;
            }
         }
      },
      WhyUs: class extends TriggerSetup {
         constructor() {
            super();
            this.el = null;
            this.raf = null;
            this.tlContent = null;
            this.tlImages = [];
         }
         trigger(data) {
            this.el = data.next.container.querySelector('.home-why-wrap');
            super.setTrigger(this.el, this.onTrigger.bind(this));
         }
         onTrigger() {
            this.animationReveal();
            viewport.w > 767 && this.animationScrub();
            this.interact();
         }
         animationScrub() {
            $(this.el).find('.home-why-item-img img').each((_, item) => new ParallaxImage({ el: item }));
         }
         animationReveal() {
            this.tlContent = gsap.timeline({
               scrollTrigger: {
                  trigger: $(this.el).find('.home-why-head').get(0),
                  start: 'top+=50% bottom',
                  once: true,
               }
            });
            new MasterTimeline({
               timeline:this.tlContent,
               tweenArr: [
                  new FadeSplitText({ el: $(this.el).find('.home-why-label .txt').get(0) }),
                  new FadeSplitText({ el: $(this.el).find('.home-why-title .heading').get(0) }),
                  new FadeSplitText({ el: $(this.el).find('.home-why-sub .txt').get(0) }),
                  new FadeSplitText({ el: $(this.el).find('.home-why-sub-cta .txt').get(0) }),
               ]
            });
            $('.home-why-item-img').each((index, item) => {
               let tlImage = gsap.timeline({
                  scrollTrigger: {
                     trigger: item,
                     start: 'top+=45% bottom',
                     once: true
                  }                  
               });
               this.tlImages.push(tlImage);
               new MasterTimeline({
                  timeline:tlImage,
                  tweenArr: [
                     new ScaleInset({el: $(item).find('.home-why-item-img-inner').get(0)}),
                  ]
               });
            });
         }
         interact() {
            if(viewport.w > 991) {
               this.stickerCard();
            }
            else if (viewport.w <= 767) {
               this.swiperCard();
            }
            $(this.el).find('.home-why-item').on('mouseenter', function() {
               $(this).addClass('active');
            });
            $(this.el).find('.home-why-item').on('mouseleave', function() {
               $(this).removeClass('active');
            });
         }
         stickerCard() {
            this.stickerCardWrap = $(this.el).find('.home-why-main-wrap').get(0);
            this.raf = requestAnimationFrame(() => this.render());
            this.lastScrollY = smoothScroll.scroller.scrollY;
            this.lastMousePos = { ...mouse.cacheMousePos };
            this.isEntered = false;
         }
         swiperCard() {
            $(this.el).find('.home-why-main-cms').addClass('swiper');
            $(this.el).find('.home-why-main').addClass('swiper-wrapper');
            $(this.el).find('.home-why-item').addClass('swiper-slide');
            new Swiper($(this.el).find('.home-why-main-cms').get(0), {
               slidesPerView: 1,
               spaceBetween: cvUnit(12, 'rem'),
               pagination: {
                  el: $(this.el).find('.home-why-pagi').get(0),
                  bulletClass: 'home-why-pagi-item',
                  bulletActiveClass: 'active',
                  clickable: true,
               },
               on: {
                   touchEnd: (swiper) => {
                     smoothScroll.start();
                     
                   },
                   
                   slideChange: (swiper) => {
                     smoothScroll.stop();
                  },
                  // touchEnd: (swiper) => {
                  //    smoothScroll.start();
                  // }
               }
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
            // gsap.set($(this.el).find('.home-why-item-sticky'), { opacity: 1 })
         }
         onLeave() {
            gsap.set($(this.el).find('.home-why-main-line'), { opacity: 0 })
            // gsap.set($(this.el).find('.home-why-item-sticky'), { opacity: 0 })
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
            if (this.tlContent) {
               this.tlContent.kill();
            }
            if (this.tlImages.length > 0) {
               this.tlImages.forEach(tl => {
                  tl.kill();
               });
               this.tlImages = null;
            }
         }
      },
      UseCase: class extends TriggerSetup {
         constructor() { 
            super(); 
            this.el = null;
            this.tlContent = null;
            this.tlImage = null;
            this.tlList = null;
         }
         trigger(data) {
            this.el = data.next.container.querySelector('.home-usecase-wrap');
            super.setTrigger(this.el, this.onTrigger.bind(this));
         }
         onTrigger() {
            this.setup();
            this.animationReveal(); 
            this.animationScrub();
            this.interact();
         }
         setup() {
            initNumberIndex($(this.el).find('.home-usecase-faq-item'));
         }
         animationScrub() {
            $(this.el).find('.home-usecase-img-item img').each((_, item) => new ParallaxImage({ el: item }));
         }
         animationReveal() {
            this.tlImage = gsap.timeline({
               scrollTrigger: {
                  trigger: $(this.el).find('.home-usecase-img-list').get(0),
                  start: 'top+=35% bottom',
                  once: true,
               }
            });
            new MasterTimeline({
               timeline:this.tlImage,
               triggerInit: this.el,
               tweenArr: [
                  new ScaleInset({ el: $(this.el).find('.home-usecase-img-item:first-child').get(0) }),
               ]
            });
            this.tlContent = gsap.timeline({
               scrollTrigger: {
                  trigger: $(this.el).find('.home-usecase-title-wrap').get(0),
                  start: 'top+=30% bottom',
                  once: true,
               }
            });
            new MasterTimeline({
               timeline:this.tlContent,
               triggerInit: this.el,
               tweenArr: [
                  new FadeSplitText({ el: $(this.el).find('.home-usecase-label .txt').get(0) }),
                  new FadeSplitText({ el: $(this.el).find('.home-usecase-title .heading').get(0) }),
               ]
            });
            this.tlList = gsap.timeline({
               scrollTrigger: {
                  trigger: $(this.el).find('.home-usecase-faq-list').get(0),
                  start: 'top+=65% bottom',
                  once: true,
               }
            });
            $(this.el).find('.home-usecase-faq-item').each((index, item) => {
               new MasterTimeline({
                  timeline:this.tlList,
                  triggerInit: this.el,
                  stagger: 0.03,
                  tweenArr: [
                     index === 0 ? new ScaleLine({ el: $(item).find('.line.top').get(0), type: 'left' }) : null,
                     new FadeSplitText({ el: $(item).find('.home-usecase-faq-item-numb .txt').get(0) }),
                     new FadeSplitText({ el: $(item).find('.home-usecase-faq-item-title .heading').get(0) }),
                     new FadeIn({ el: $(item).find('.home-usecase-faq-item-tag'), type: 'bottom' }),
                     new FadeIn({ el: $(item).find('.home-usecase-faq-item-ic'), type: 'bottom' }),
                     index === 0 ? new FadeSplitText({ el: $(item).find('.home-usecase-faq-item-sub .txt').get(0) }) : null,
                     new ScaleDash({ el: $(item).find('.line.bot').get(0), type: 'left' }),
                  ].filter(Boolean)
               });
            })
         }
         interact() {
            const activeAccordion = (idx) => {
               $(this.el).find('.home-usecase-img-item').eq(idx).addClass('active').siblings().removeClass('active');
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
            if (this.tlContent) {
               this.tlContent.kill();
            }
            if (this.tlImage) {
               this.tlImage.kill();
            }
            if (this.tlList) {
               this.tlList.kill();
            }
         }
      },
      Cta: class {
         constructor() {
         }
         setup(data) {
            cta.init(data);
         }
      },
      footer: class {
         constructor() {
         }
         setup(data) {
            footer.init(data);
         }
      },

   }
   const ProductPage = {
      Hero: class {
         constructor() {
            this.el = null;
            this.tlOnce = null;
            this.tlEnter = null;
            this.tlTriggerEnter = null;
         }
         setup(data, mode) {
            this.el = data.next.container.querySelector('.product-hero-wrap');
            if (mode === 'once') {
               this.setupOnce(data);
            } else if (mode === 'enter') {
               this.setupEnter(data);
            }
            else return;
            this.animMarquee();
         }
         setupOnce(data) {
            this.tlOnce = gsap.timeline({
               paused: true,
               delay: .3,
               onStart: () => {
                  $('[data-init-hidden]').removeAttr('data-init-hidden');
               }
            })

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

         }
         playOnce() {
            this.tlOnce.play();
         }
         animMarquee() {
            let partnerMarquee = new Marquee(
               $(this.el).find('.about-inves-logo-cms'),
               $(this.el).find('.about-inves-logo-list'), 40);
            partnerMarquee.setup();
            partnerMarquee.play();
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
      Key: class extends TriggerSetup {
         constructor() {
            super();
            this.el = null;
         }
         trigger(data) {
            this.el = data.next.container.querySelector('.product-key-wrap');
            super.setTrigger(this.el, this.onTrigger.bind(this));
         }
         onTrigger() {
            this.animationScrub();
            this.setup();
            this.interact();
         }
         setup() {
            if(viewport.w < 992) {
               this.swiperCard();
            }
            initNumberIndex($(this.el).find('.product-key-main-title-inner'));
            initNumberIndex($(this.el).find('.product-key-main-left-main'));
            initNumberIndex($(this.el).find('.product-key-tab-item'));
         }
         animationScrub() {
            const tabItems = $(this.el).find('.product-key-tab-item');
            tabItems.eq(0).addClass('active');
            const items = $(this.el).find('.product-key-main-title-inner');
            header.registerDependent($(this.el).find('.product-key-tab-wrap'));

            items.each((index, item) => {
               let itemImgPrev = $(this.el).find('.product-key-main-img-main').eq(index - 1);
               let itemImgCurrent = $(this.el).find('.product-key-main-img-main').eq(index);
               let itemLabelPrev = $(this.el).find('.product-key-main-left-main').eq(index - 1);
               let itemLabelCurrent = $(this.el).find('.product-key-main-left-main').eq(index);
               let limitProgress = viewport.w > 767 ? 0.5 : 0.45;
               let heightHeader = $(header.el).height();
               const tlItem = gsap.timeline({
                  scrollTrigger: {
                     trigger: item,
                     start: 'top bottom',
                     end: viewport.w > 767 ? 'bottom bottom' : 'top bottom',
                     scrub: true,
                     onUpdate: (self) => {
                        if(index > 0) {
                           const progress = self.progress;
                           let prevItemClip = 1 - progress;

                           gsap.set(itemImgPrev, { 'clip-path': `inset(0 0 ${progress*100}% 0)` });
                           gsap.set(itemImgCurrent, { 'clip-path': `inset(${prevItemClip*100}% 0 0 0)` });
                           gsap.set(itemLabelPrev, { 'clip-path': `inset(0 0 ${progress*100}% 0)` });
                           gsap.set(itemLabelCurrent, { 'clip-path': `inset(${prevItemClip*100}% 0 0 0)` });
                           if(progress > limitProgress) {
                              tabItems.removeClass('active');
                              tabItems.eq(index).addClass('active');
                           }
                        }
                     },
                     // onEnter: () => {
                     //    console.log('start');
                     //    tabItems.removeClass('active');
                     //    tabItems.eq(index).addClass('active');
                     // },
                     onEnterBack: (self) => {
                        tabItems.removeClass('active');
                        viewport.w < 768 ? tabItems.eq(index-1).addClass('active') : tabItems.eq(index).addClass('active');
                     },
                     // onLeaveEnter: () => {
                     //    tabItems.removeClass('active');
                     //    tabItems.eq(index).addClass('active');
                     // }
                  }
               });
               tlItem.to(item, { opacity: 1, y: 0, stagger: 0.1 });

               const tlParallax = gsap.timeline({
                  scrollTrigger: {
                     trigger: $(item).find('.product-key-main-title').get(0),
                     start: `top-=${cvUnit(10, 'vh')} bottom`,
                     end: `bottom+=${cvUnit(10, 'vh')} top`,
                     endTrigger: $(item).find('.product-key-main-sub').get(0),
                     scrub: true,
                  }
               })
               gsap.set($(item).find('.product-key-main-title, .product-key-main-sub'), {
                  scale: 0.95,
                  transformOrigin: ` 0% var(--transform-y-origin)`,
                  'transform-style': 'preserve-3d',
                  rotateX: 10,
                  perspective: cvUnit(500, 'rem'),
                  color: '#b4b4b0'
               });
               tlParallax
                  .to($(item).find('.product-key-main-title, .product-key-main-sub'),
                  {
                     keyframes: {
                        scale: [.95, 1, .95],
                        rotateX: [-10, 0, 10],
                        '--transform-y-origin': ['0%', '100%', '0%'],
                        color: ['#b4b4b0', '#282828', '#b4b4b0'],
                     }
                  },
               )
            });
         }
         interact() {
            let heightTab = $('.product-key-tab-wrap').height();
            $('.product-key-tab-item').on('click', function() {
               const index = $(this).index();
               $('.product-key-tab-item').removeClass('active');
               $(this).addClass('active');
               smoothScroll.scrollTo($('.product-key-main-title-inner').eq(index).get(0), { duration: 1, offset: index > 0 ? heightTab*-1 : heightTab*-1 - 1 });
            });
         }
         swiperCard() {
            $('.product-key-tab-cms').addClass('swiper');
            $('.product-key-tab-list').addClass('swiper-wrapper');
            $('.product-key-tab-item').addClass('swiper-slide');
            new Swiper('.product-key-tab-cms', {
               slidesPerView: 'auto',
               spaceBetween: 0,
            });
         }
         destroy() {
            header.unregisterDependent($(this.el).find('.product-key-tab-wrap'));
         }
      },
      How : class extends TriggerSetup {
         constructor() {
            super();
            this.el = null;
            this.tl = null;
         }
         trigger(data) {
            this.el = data.next.container.querySelector('.product-how-wrap');
            super.setTrigger(this.el, this.onTrigger.bind(this));
         }
         onTrigger() {
            if(viewport.w > 767) {
               this.animationScrub();
            }
            this.interact();
         }
         animationScrub() {
            this.tl = gsap.timeline({
               scrollTrigger: {
                  trigger: $('.product-how-inner').get(0),
                  start: 'bottom bottom',
                  endTrigger: $('.product-how-inner').get(0),
                  end: 'bottom top',
                  scrub: true,
               }
            });
            const items = $(this.el).find('.product-how-item');
            gsap.set(items, { yPercent: 100 });
            items.each((index, item) => {
               this.tl.to(item, { yPercent: 0, stagger: 1, onComplete: () => {
                  $(item).addClass('active');
               }, onReverseComplete: () => {
                  $(item).removeClass('active');
               }});
            });
         }
         interact() {
         }
         destroy() {
            if (this.tl) {
               this.tl.kill();
            }
         }
      },
      Faq: class extends TriggerSetup {
         constructor() {
            super();
            this.el = null;
         }
         trigger(data) {
            this.el = data.next.container.querySelector('.product-faq-wrap');
            super.setTrigger(this.el, this.onTrigger.bind(this));
         }
         onTrigger() {
            this.interact();
         }
         interact() {
            const activeAccordion = (idx) => {
               $(this.el).find('.product-faq-item').eq(idx).toggleClass('active').siblings().removeClass('active');
               $(this.el).find('.product-faq-item').eq(idx).siblings().find('.product-faq-item-sub').slideUp();
               $(this.el).find('.product-faq-item').eq(idx).find('.product-faq-item-sub').slideToggle();
            }
            $(this.el).find('.product-faq-item-sub').hide();

            $(this.el).find('.product-faq-item').on('click', function() {
               activeAccordion($(this).index());
            });
         }
         destroy() {
         }
      },
      footer: class {
         constructor(data) {
         }
         setup(data) {
            footer.init(data);
         }
      },
   }
   const PricingPage = {
      Hero: class {
         constructor() {
            this.el = null;
            this.tlOnce = null;
            this.tlEnter = null;
            this.tlTriggerEnter = null;
         }
         setup(data, mode) {
            this.el = data.next.container.querySelector('.pricing-hero-wrap');
            if (mode === 'once') {
               this.setupOnce(data);
            } else if (mode === 'enter') {
               this.setupEnter(data);
            }
            else return;
            if(viewport.w < 991 && viewport.w >= 768) {
               this.swiperCard();
            }
            this.animationScrub();
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

         }
         playOnce() {
            this.tlOnce.play();
         }
         interact() {
            $(this.el).find('.pricing-hero-tab-item').on('click', (e) => {
               const type = $(e.currentTarget).attr('data-type');
               $('.pricing-hero-tab-item').removeClass('active');
               $(e.currentTarget).addClass('active');
               if(type == 'year') {
                  $(this.el).find('.pricing-hero-package-item-title-wrap').addClass('active');
               } else {
                  $(this.el).find('.pricing-hero-package-item-title-wrap').removeClass('active');
               }
            });
         }
         animationScrub() {
            viewport.w > 991 && header.registerDependent($(this.el).find('.pricing-hero-package-wrap'));
            viewport.w < 768 && header.registerDependent($(this.el).find('.pricing-hero-tab-wrap'));
         }
         swiperCard() {
            $(this.el).find('.pricing-hero-package-block').remove();
            $(this.el).find('.pricing-hero-package-wrap').addClass('swiper');
            $(this.el).find('.pricing-hero-package').addClass('swiper-wrapper');
            $(this.el).find('.pricing-hero-package-item').addClass('swiper-slide');
            new Swiper($(this.el).find('.pricing-hero-package-wrap').get(0), {
               slidesPerView: 'auto',
               spaceBetween: 0,
               pagination: {
                  el: $(this.el).find('.pricing-hero-pagi').get(0),
                  bulletClass: 'pricing-hero-pagi-item',
                  bulletActiveClass: 'active',
                  clickable: true,
               },
               on: {
                  touchEnd: (swiper) => {
                     smoothScroll.start();                     
                   },
                   
                   slideChange: (swiper) => {
                     smoothScroll.stop();
                  },
               }
            });
         }
         destroy() {
            header.unregisterDependent($(this.el).find('.pricing-hero-package-wrap'));
            header.unregisterDependent($(this.el).find('.pricing-hero-tab-wrap'));

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
      Faq: class extends TriggerSetup {
         constructor() {
            super();
            this.el = null;
         }
         trigger(data) {
            this.el = data.next.container.querySelector('.product-faq-wrap');
            super.setTrigger(this.el, this.onTrigger.bind(this));
         }
         onTrigger() {
            this.interact();
         }
         interact() {
            const activeAccordion = (idx) => {
               $(this.el).find('.product-faq-item').eq(idx).toggleClass('active').siblings().removeClass('active');
               $(this.el).find('.product-faq-item').eq(idx).siblings().find('.product-faq-item-sub').slideUp();
               $(this.el).find('.product-faq-item').eq(idx).find('.product-faq-item-sub').slideToggle();
            }
            $(this.el).find('.product-faq-item-sub').hide();

            $(this.el).find('.product-faq-item').on('click', function() {
               activeAccordion($(this).index());
            });
         }
         destroy() {
         }
      },
      footer: class {
         constructor(data) {
         }
         setup(data) {
            footer.init(data);
         }
      },
   }
   const ContactPage = {
      Hero: class {
         constructor() {
            this.el = null;
            this.tlOnce = null;
            this.tlEnter = null;
            this.tlTriggerEnter = null;
         }
         setup(data, mode) {
            this.el = data.next.container.querySelector(".contact-hero-wrap");
            if (mode === "once") {
               this.setupOnce(data);
            } else if (mode === "enter") {
               this.setupEnter(data);
            } else return;
            this.interact();
         }
         setupOnce(data) {
            this.tlOnce = gsap.timeline({
               paused: true,
               delay: 0.3,
               onStart: () => {
                  $("[data-init-hidden]").removeAttr("data-init-hidden");
               },
            });
         }
         setupEnter(data) {
            this.tlEnter = gsap.timeline({
               paused: true,
               onStart: () =>
                  $("[data-init-hidden]").removeAttr("data-init-hidden"),
            });

            this.tlTriggerEnter = gsap.timeline({
               scrollTrigger: {
                  trigger: this.el,
                  start: "top bottom+=50%",
                  end: "bottom top-=50%",
                  once: true,
                  onEnter: () => this.tlEnter.play(),
                  onEnterBack: () => this.tlEnter.play(),
                  onStart: () =>
                  $("[data-init-hidden]").removeAttr("data-init-hidden"),
               },
            });

         }
         playOnce() {
            this.tlOnce.play();
         }
         interact() {
            const $form = $(this.el).find("#contact-form");
            $(this.el).find(".contact-hero-form-input").on("input", function () {
               if ($(this).val()) {
                  $(this).parent().addClass("active");
               } else {
                  $(this).parent().removeClass("active");
               }
            });
            const onSuccessForm = (formID) => {
               setTimeout(() => {
                  $(this.el).find(formID).trigger("reset");
                  $(this.el).find(".input-field-grp").removeClass("filled");
                  this.submitHubspot();
               }, 1000);
            };

            formSubmitEvent.init({
               onlyWorkOnThisFormName: "Contact Form",
               onSuccess: () => onSuccessForm("#contact-form"),
            });
            $('button[type="submit"]').on("pointerenter", function () {
               if ($(this).prop("disabled")) {
                  $(this).prop("disabled", false);
               }
            });
            $form.find('[type="submit"]').on("click", function (e) {
               const data = mapFormToObject($form.get(0));
               let isValid = true;
               requiredNames.forEach(function (name) {
                  if (!Object.prototype.hasOwnProperty.call(data, name)) return;
                  const v = String(data[name] ?? "").trim();
                  let hasError = false;
                  if (name === "Phone-Number") {
                     hasError = v !== "" && !/^\d+$/.test(v);
                  } else if (name === "Email") {
                     hasError = v !== "" && !emailRegex.test(v);
                  }
                  const $input = $form.find('[name="' + name + '"]');
                  const $parent = $input.parent();
                  if (hasError) {
                     $parent.addClass("error");
                     isValid = false;
                  } else {
                     $parent.removeClass("error");
                  }
               });
               if (!isValid) {
                  e.preventDefault();
               }
            });
            const requiredNames = ["First-Name", "Last-Name", "Phone-Number", "Email"];
            const updateSubmitState = function ($f) {
               let allFilled = true;
               requiredNames.forEach(function (name) {
                  const $input = $f.find('[name="' + name + '"]');
                  if ($input.length) {
                  const v = String($input.val() ?? "").trim();
                  if (v.length === 0) allFilled = false;
                  }
               });
               const $btn = $f.find('[type="submit"]');
               if (allFilled) $btn.removeClass("disable");
               else $btn.addClass("disable");
            };
            updateSubmitState($form);
            $form.on(
            "input change",
            '[name="First-Name"], [name="Last-Name"], [name="Phone-Number"], [name="Email"]',
            function () {
               updateSubmitState($form);
            }
            );
         }
         submitHubspot() {
            const hubspot = {
            portalId: 145687733,
            formId: "69790463-8651-4e07-ad64-45f9c23549e9",
            fields: [
               { name: "firstname", value: (data) => data["First name"] },
               { name: "lastname", value: (data) => data["Last name"] },
               { name: "phone", value: (data) => data["Phone number"] },
               { name: "email", value: (data) => data["Email"] },
               { name: "message", value: (data) => data["Message"] },
            ],
            };
            const { portalId, formId, fields } = hubspot;
            let url = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;
            const data = mapFormToObject($form.get(0));
            const mapField = (data) => {
               if (!fields.length) return [];

               const result = fields.map((field) => {
                  const { name, value } = field;
                  if (!value) {
                  return {
                     name,
                     value: data[name] || "",
                  };
                  } else {
                  const getValue = value(data);
                  return {
                     name,
                     value: getValue || "",
                  };
                  }
               });
               return result;
            };
            const mappedFields = mapField(data);
            const dataSend = {
               fields: mappedFields,
               context: {
                  pageUri: window.location.href,
                  pageName: "Contact page",
               },
            };
            $.ajax({
               url: url,
               method: "POST",
               data: JSON.stringify(dataSend),
               dataType: "json",
               headers: {
                  accept: "application/json",
                  "Access-Control-Allow-Origin": "*",
               },
               contentType: "application/json",
               success: function (response) {
                  console.log(response);
               },
               error: function (xhr, resp, text) {
                  console.log(xhr, resp, text);
               },
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
      footer: class {
         constructor(data) {
         }
         setup(data) {
            footer.init(data);
         }
      },
   };
   const AboutPage = {
      Hero: class {
         constructor() {
            this.el = null;
            this.tlOnce = null;
            this.tlEnter = null;
            this.tlTriggerEnter = null;
            this.tlImage = null;
            this.animationFrameGrind = null;
            this.tlScrubContent = null;
         }
         setup(data, mode) {
            this.el = data.next.container.querySelector('.about-hero-wrap');
            if (mode === 'once') {
               this.setupOnce(data);
            } else if (mode === 'enter') {
               this.setupEnter(data);
            }
            else return;
         }
         setupOnce(data) {
            this.tlOnce = gsap.timeline({
               paused: true,
               delay: 0.4,
               onStart: () => {
                  console.log(';lllllsetupOnce');
                  this.interact();
                  $('[data-init-hidden]').removeAttr('data-init-hidden');
               }
            })
            this.tlOnce.to({}, { duration: 0.01 });
         }
         setupEnter(data) {
            this.tlEnter = gsap.timeline({
               paused: true,
               onStart: () => {
                  $('[data-init-hidden]').removeAttr('data-init-hidden');
                  this.interact();
               }
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
            this.tlEnter.to({}, { duration: 0.01 });
         }
         playOnce() {
            this.tlOnce.play();
         }
         interact() {
            this.animateImage();
         }
         animateImage() {
            const $img = $('.about-hero-item:nth-child(2) img');
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
            $('.about-hero-item-deco').css({
               width: `${displayedWidth}px`,
               height: `${displayedHeight}px`,
            });
            if(viewport.w > 991) {
               header.registerDependent($(this.el).find('.about-hero-main'));
            }
            this.tlImage = gsap.timeline({
            });
            let imageItems = $(this.el).find('.about-hero-item');
            imageItems.each((index, item) => {
               if(index == 0) return;
               if(index == imageItems.length - 1) {
                  this.tlImage.to(imageItems.not(imageItems.last()), {opacity: 0, duration: 1});
                  this.tlImage.fromTo($(item).find('svg path').eq(0), {opacity: 0}, {opacity: 1, duration: 1.2, onStart: () => {
                     $(this.el).find('.about-hero-bg').addClass('active');
                     this.updateGrind();
                  }}, '<=.3');
                  this.tlImage.fromTo($(item).find('svg path').eq(1), {opacity: 0}, {opacity: 1, duration: 1}, '<=.5');
               } else {
                  this.tlImage
                     .fromTo(item, {opacity: 0}, {opacity: 1, duration: .8})
                     .fromTo($(item).find('.about-hero-item-deco-item.item-deco-brand'), {opacity: 0}, {opacity: 1, duration: .6, stagger: 0.05})
                     .fromTo($(item).find('.about-hero-item-deco-item.item-deco-normal'), {opacity: 0}, {opacity: 1, duration: .6, stagger: 0.1}, '<=.4');
               }
            });
            if(viewport.w > 991) {
               let heightContent = $(this.el).find('.about-intro').outerHeight();
               let heightHero = $(this.el).find('.about-hero').height() + heightContent;
               $(this.el).find('.about-hero').css({height: `${heightHero}px`,});
               this.tlScrubContent = gsap.timeline({
                  scrollTrigger: {
                     trigger: this.el,
                     start: 'top-=1px top',
                     end: `bottom bottom`,
                     scrub: true,
                  }
               });
               this.tlScrubContent.fromTo($(this.el).find('.about-intro-wrap'),{height: 0}, {height: `${heightContent}px`, ease: 'none'});  
            }
         }
         updateGrind() {
            $('.about-hero-item svg path').eq(0).css('stroke-dashoffset', `${parseFloat($('.about-hero-item svg path').eq(0).css('stroke-dashoffset')) + .6}px`)
            this.animationFrameGrind = requestAnimationFrame(this.updateGrind.bind(this))
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
            if (this.tlImage) {
               this.tlImage.kill();
            }
            if (this.tlScrubContent) {
               this.tlScrubContent.kill();
            }
            if(viewport.w > 991) {
               header.unregisterDependent($(this.el).find('.about-hero-main'));
            }
            if(this.animationFrameGrind) {
               cancelAnimationFrame(this.animationFrameGrind);
            }
         }
      },
      Team: class extends TriggerSetup {
         constructor() {
            super();
            this.el = null;
         }
         trigger(data) {
            this.el = data.next.container.querySelector('.about-team-wrap');
            super.setTrigger(this.el, this.onTrigger.bind(this));
            this.popup = this.el.querySelector('.about-team-popup');
         }
         onTrigger() {
            this.interact();
         }
         setup () {
            $(this.el).find('.about-team-popup').remove();
            $('.body-inner').append(this.popup);

         }
         interact() {
            $(this.el).find('.about-team-item').each((index, item) => {
               let itemOpens =$(item).find('[data-popup="open"]');
               itemOpens.each((index, itemOpen) => {
                  $(itemOpen).on('click', () => {
                     let parent = $(itemOpen).closest('.about-team-item');
                     $('.about-team-popup').addClass('active');
                     $('.main').addClass('has-popup')
                     smoothScroll.stop();
                     parent.find('[data-team]').each((index, item) => {
                        let nameData = $(item).attr('data-team');
                        if(nameData == 'image') {
                           let src = $(item).attr('src');
                           $(`.about-team-popup [data-team=${nameData}]`).attr('src', src);
                        }
                        else if(nameData == 'linkin') {
                           let linkin = $(item).attr('href');
                           $(`.about-team-popup [data-team=${nameData}]`).attr('href', linkin);
                        }
                        else if(nameData == 'description') {
                           let description = $(item).html();
                           $(`.about-team-popup [data-team=${nameData}]`).html(description);
                        }
                        else {
                           let text = $(item).text();
                           $(`.about-team-popup [data-team=${nameData}]`).text(text);
                        }
                     });
                  });
               });
            });
            $('.about-team-popup-close').on('click', () => {
               $('.about-team-popup').removeClass('active');
               $('.main').removeClass('has-popup');
               smoothScroll.start();
            });
            $('.about-team-popup').on('click', (e) => {
               if(!$(e.target).closest('.about-team-popup-content').length) {
                  $('.about-team-popup').removeClass('active');
                  $('.main').removeClass('has-popup');
                  smoothScroll.start();
               }
            });
         }
         destroy() {
            $('.about-team-popup').remove();
            $(this.el).find('.about-team').append(this.popup);
         }
      },
      Inves: class extends TriggerSetup {
         constructor() {
            super();
            this.el = null;
         }
         trigger(data) {
            this.el = data.next.container.querySelector('.about-inves-wrap');
            super.setTrigger(this.el, this.onTrigger.bind(this));
         }
         onTrigger() {
            this.setup();
            this.interact();
         }
         setup() {
            $(this.el).find('.about-inves-logo-list').each((index, item) => {
               let direction = $(item).attr('data-direction');
               let marqueeLogo = new Marquee($(item).closest('.about-inves-logo-cms'),$(item), 40, direction);
               marqueeLogo.setup();
               marqueeLogo.play();
            });
         }
         interact() {
         }
         destroy() {

         }
      },
      Job: class extends TriggerSetup {
         constructor() { super(); }
         trigger(data) {
            this.el = data.next.container.querySelector('.about-job-wrap');
            super.setTrigger(this.el, this.onTrigger.bind(this));
         }
         onTrigger() {
            this.setup();
            this.interact();
         }
         setup() {
            new Swiper('.about-job-cms', {
               slidesPerView: 'auto',
               pagination: {
                  el: '.about-job-pagination',
                  clickable: true,
               },
               breakpoints: {
                  768: {
                     slidesPerView: 2,
                  },
               },
               navigation: {
                  nextEl: '.about-job-navi-item.item-next',
                  prevEl: '.about-job-navi-item.item-prev',
               },
               pagination: {
                  el: '.about-job-pagi',
                  type: "fraction",
                },
            });
         }
         interact() {

         }
         destroy() {

         }
      },
      footer: class {
         constructor(data) {
         }
         setup(data) {
            footer.init(data);
         }
      },
   };
   const SchedulePage = {
      Hero: class {
         constructor() {
            this.el = null;
            this.tlOnce = null;
            this.tlEnter = null;
            this.tlTriggerEnter = null;
         }
         setup(data, mode) {
            this.el = data.next.container.querySelector(".schedule-hero-wrap");
            if (mode === "once") {
               this.setupOnce(data);
            } else if (mode === "enter") {
               this.setupEnter(data);
            } else return;
            this.interact();
         }
         setupOnce(data) {
            this.tlOnce = gsap.timeline({
               paused: true,
               delay: 0.3,
               onStart: () => {
                  $("[data-init-hidden]").removeAttr("data-init-hidden");
               },
            });
         }
         setupEnter(data) {
            
            this.tlEnter = gsap.timeline({
               paused: true,
               onStart: () =>
                  $("[data-init-hidden]").removeAttr("data-init-hidden"),
            });

            this.tlTriggerEnter = gsap.timeline({
               scrollTrigger: {
                  trigger: this.el,
                  start: "top bottom+=50%",
                  end: "bottom top-=50%",
                  once: true,
                  onEnter: () => this.tlEnter.play(),
                  onEnterBack: () => this.tlEnter.play(),
                  onStart: () =>
                  $("[data-init-hidden]").removeAttr("data-init-hidden"),
               },
            });
         }
         playOnce() {
            this.tlOnce.play();
         }
         interact() {
           
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
            $('script[src*="MeetingsEmbedCode.js"]').remove();
         }
      },
      Footer: class extends Footer {
         constructor() {
            super();
         }
      },
   };
   const ResourcePage = {
      Hero: class {
         constructor() {
            this.el = null;
            this.tlOnce = null;
            this.tlEnter = null;
            this.tlTriggerEnter = null;
            this.masterTimeline = null;
            this.numberItem = 3;
         }
         setup(data, mode) {
            this.el = data.next.container.querySelector(".resource-hero-wrap");
            if (mode === "once") {
               this.setupOnce(data);
            } else if (mode === "enter") {
               this.setupEnter(data);
            } else return;
            this.initLoadMore();
            this.interact();
         }
         setupOnce(data) {
            this.tlOnce = gsap.timeline({
               paused: true,
               delay: 0.3,
               onStart: () => {
                  $("[data-init-hidden]").removeAttr("data-init-hidden");
               },
            });
            this.initContent(this.tlOnce);
         }
         setupEnter(data) {
            this.tlEnter = gsap.timeline({
               paused: true,
               onStart: () => {
                  $("[data-init-hidden]").removeAttr("data-init-hidden")
               }
            });
            this.initContent(this.tlEnter);
            this.tlTriggerEnter = gsap.timeline({
               scrollTrigger: {
                  trigger: this.el,
                  start: "top bottom+=50%",
                  end: "bottom top-=50%",
                  once: true,
                  onEnter: () => this.tlEnter.play(),
                  onEnterBack: () => this.tlEnter.play(),
                  onStart: () =>
                  $("[data-init-hidden]").removeAttr("data-init-hidden"),
               },
            });
         }
         playOnce() {
            this.tlOnce.play();
         }
         playEnter() {
            this.tlEnter.play();
         }
         interact() {
            $(this.el).find('.resource-hero-search-ic').on('click', () => {
               this.searchItem($(this.el).find('.resource-hero-search-input').val());
            });
            $(this.el).find('.resource-hero-search-form').on('keypress', (e) => {
               if(e.which === 13 ) {
                  e.preventDefault();
                  this.searchItem($(this.el).find('.resource-hero-search-input').val());
               }
            });
            $(this.el).find('.resource-hero-load').on('click', () => {
               this.loadMore();
            });
         }
         initContent(timeline) {
            $(this.el).find('.resource-hero-item').each((index, item) => {
               this.masterTimeline = new MasterTimeline({
                  triggerInit: item,
                  timeline: timeline,
                  stagger: 0.02,  
                  tweenArr: [
                     new ScaleLine({el: $(item).find('.line-vertical'), type: 'top'}),
                     new FadeIn({el: $(item).find('.resource-hero-item-date .txt')}),
                     new ScaleDash({el: $(item).find('.resource-hero-item-date .line').get(0), type: 'left'}),
                     new FadeIn({el: $(item).find('.resource-hero-item-img-inner').get(0), type: 'bottom'}),
                     new ScaleDash({el: $(item).find('.resource-hero-item-img .line').get(0), type: 'top'}),
                     new FadeSplitText({el: $(item).find('.resource-hero-item-title .heading'), isDisableRevert: true}),
                     new FadeSplitText({el: $(item).find('.resource-hero-item-sub .txt ')}),
                     new FadeIn({el: $(item).find('.resource-hero-item-link'), type: 'bottom'})
                  ]
               });
            });
         }
         searchItem(val){
            $(this.el).find('.resource-hero-load-wrap').hide();
            $(this.el).find('.resource-hero-item').hide();
            $(this.el).find('.resource-hero-item').each((index, item) => {
               let title = $(item).find('.resource-hero-item-title .heading');
               if(title.attr('data-title')?.toLowerCase().includes(val?.toLowerCase())){
                  $(item).show();
                  this.activeItem($(item));
               }
            });
         }
         activeItem(item){
            ScrollTrigger.refresh();
            new FadeIn({el: $(item).find('.resource-hero-item-img-inner').get(0)}),
            new ScaleLine({el: $(item).find('.line-vertical'), type: 'top'}),
            new FadeIn({el: $(item).find('.resource-hero-item-date .txt')}),
            new ScaleDash({el: $(item).find('.resource-hero-item-date .line').get(0), type: 'left'}),
            new FadeSplitText({el: $(item).find('.resource-hero-item-title .heading'), isDisableRevert: true}),
            new FadeIn({el: $(item).find('.resource-hero-item-sub .txt ')}),
            new FadeIn({el: $(item).find('.resource-hero-item-link'), type: 'bottom'})
         }
         initLoadMore() {
            if(this.numberItem >= $(this.el).find('.resource-hero-item').length) {
               $(this.el).find('.resource-hero-load-wrap').hide();
            }
            else {
               $(this.el).find('.resource-hero-item').each((index, item) => {
                  if(index >= this.numberItem) {
                     $(item).hide();
                     $(item).addClass('hide');
                  }
               });
            }
         }
         loadMore() {
            this.numberItem += 3;
            $(this.el).find('.resource-hero-item').each((index, item) => {
               if(index < this.numberItem) {
                  $(item).addClass('active');
               }
            });
            $(this.el).find('.resource-hero-item.hide.active').each((index, item) => {
                  $(item).show();
                  this.activeItem($(item));
                  $(item).removeClass('hide');
            });
            if(this.numberItem >= $(this.el).find('.resource-hero-item').length) {
               $(this.el).find('.resource-hero-load-wrap').hide();
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
            if(this.masterTimeline) {
               this.masterTimeline.destroy();
            }
            this.numberItem = 3;
            this.initLoadMore();
         }
      },
      Footer: class {
         constructor() {
         }
         setup(data) {
            footer.init(data);
         }
      },
   };
   const PolicyPage = {
      Hero: class {
         constructor() {
            this.el = null;
            this.tlOnce = null;
            this.tlEnter = null;
            this.tlTriggerEnter = null;
         }
         setup(data, mode) {
            this.el = data.next.container.querySelector(".policy-hero-wrap");
            if (mode === "once") {
               this.setupOnce(data);
            } else if (mode === "enter") {
               this.setupEnter(data);
            } else return;
            this.loadTermlyPolicy();
            this.interact();
         }
         setupOnce(data) {
            this.tlOnce = gsap.timeline({
               paused: true,
               delay: 0.3,
               onStart: () => {
                  $("[data-init-hidden]").removeAttr("data-init-hidden");
               },
            });
         }
         setupEnter(data) {
            this.tlEnter = gsap.timeline({
               paused: true,
               onStart: () =>
                  $("[data-init-hidden]").removeAttr("data-init-hidden"),
            });

            this.tlTriggerEnter = gsap.timeline({
               scrollTrigger: {
                  trigger: this.el,
                  start: "top bottom+=50%",
                  end: "bottom top-=50%",
                  once: true,
                  onEnter: () => this.tlEnter.play(),
                  onEnterBack: () => this.tlEnter.play(),
                  onStart: () =>
                  $("[data-init-hidden]").removeAttr("data-init-hidden"),
               },
            });

         }
         playOnce() {
            this.tlOnce.play();
         }
         interact() {
           const $el = $(this.el);
           const $tableList = $el.find('.policy-hero-table-list');
           const $tableHead = $el.find('.policy-hero-table-head');
           const $contentRichtext = $el.find('.policy-hero-content-richtext');
           const $contentHeaders = $contentRichtext.find('h2');
           const isMobile = viewport.w < 992;
           const SCROLL_OFFSET = -100;

           $tableList.on('click', '.policy-hero-table-item', (e) => {
            e.preventDefault();
            const $currentTarget = $(e.currentTarget);

            if(isMobile) {
               $tableList.slideUp();
               $tableHead.toggleClass('active');
            }

            const dataTitle = $currentTarget.attr('data-title');
            const content = $contentRichtext.find(`h2[data-title="${dataTitle}"]`)[0];

            smoothScroll.scrollTo(content, {
               offset: SCROLL_OFFSET,
               duration: 1,
            });

            $tableList.find('.policy-hero-table-item').removeClass('active');
            $currentTarget.addClass('active');
           });

           smoothScroll.lenis.on('scroll', () => {
            this.itemContentActiveCheck($contentHeaders);
           });

           if(isMobile){
            header.registerDependent($el.find('.policy-hero-table'));
            $tableHead.on('click', (e) => {
               console.log(e.currentTarget);
               $(e.currentTarget).toggleClass('active');
               $tableList.slideToggle();
            });
           } else {
            header.registerDependent($el.find('.policy-hero-table-inner'));
           }

           $contentRichtext.on('click', 'a', (e) => {
            const link = $(e.currentTarget).attr('href');
            if(link && link.startsWith('#')) {
               e.preventDefault();
               const id = link.substring(1);
               smoothScroll.scrollTo(`#${id}`, {
                  offset: SCROLL_OFFSET,
                  duration: 1,
               });
            }
           });
         }
         itemContentActiveCheck(el) {
            for (let i = 0; i < $(el).length; i++) {
                let top = $(el).eq(i).get(0).getBoundingClientRect().top;
                if (top > 0 && top - $(el).eq(i).height() < ($(window).height()/2)) {
                    $('.policy-hero-table-item').removeClass('active');
                    $('.policy-hero-table-item').eq(i).addClass('active');
                }
                }
          }
          initTableContent() {
            $(this.el).find('.policy-content-number').text($('.policy-hero-content-richtext h2').length);
            let titleLeft = $(this.el).find('.policy-hero-table-item').eq(0).clone();
            $(this.el).find('.policy-hero-table-item').remove();
            $(this.el).find('.policy-hero-content-richtext h2').each((i, el) => {
                $(el).attr('data-title', `toch-${i}`);
                let titleLeftClone = titleLeft.clone();
                if(i == 0) {
                    titleLeftClone.addClass('active');
                }
                let index = `${i+1}.`
                let cleanText = $(el).text().replace(/^\d+\.\s*/, '');
                titleLeftClone.find('.policy-hero-table-item-txt .txt').eq(0).text(index);
                titleLeftClone.find('.policy-hero-table-item-txt .txt').eq(1).text(cleanText);
                titleLeftClone.attr('data-title', `toch-${i}`);
                $(this.el).find('.policy-hero-table-list').append(titleLeftClone);
            })
          }
          async loadTermlyPolicy() {
            const id = $('[policyUUID]').attr('policyUUID');
            const fullUrl = `https://kestrellabs-bp.netlify.app/.netlify/functions/fetchPolicy?policyUUID=${id}`;
            
            try {
                $('.policy-hero-content-richtext').html('<div class="loading">Đang tải policy...</div>');
                
                const response = await fetch(fullUrl);      // ✅ Thêm await
                const data = await response.json();  
                data.content = data.content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
                $('.policy-hero-content-richtext').html(data.content);
                $('.policy-hero-content-richtext *:not(table):not(table, section)').removeAttr('style');
                $('.policy-hero-content-richtext *').removeAttr('align');
                this.initTableContent();
            } catch (error) {
                console.error('Error loading policy:', error);
                $('.policy-hero-content-richtext').html('<p class="error">Không thể tải policy. Vui lòng thử lại sau.</p>');
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
            if(viewport.w < 992){
               header.unregisterDependent($(this.el).find('.policy-hero-table'));
            }
            else {
               header.unregisterDependent($(this.el).find('.policy-hero-table-inner'));
            }
         }
      },

      Footer: class {
         constructor() {
         }
         setup(data) {
            footer.init(data);
         }
      },
   };
   const TpResourcePage = {
      Hero: class {
         constructor() {
            this.el = null;
            this.tlOnce = null;
            this.tlEnter = null;
            this.tlTriggerEnter = null;
         }
         setup(data, mode) {
            this.el = data.next.container.querySelector(".tp-resource-hero-wrap");
            if (mode === "once") {
               this.setupOnce(data);
            } else if (mode === "enter") {
               this.setupEnter(data);
            } else return;
            this.initTableContent();
            this.interact();
         }
         setupOnce(data) {
            this.tlOnce = gsap.timeline({
               paused: true,
               delay: 0.3,
               onStart: () => {
                  $("[data-init-hidden]").removeAttr("data-init-hidden");
               },
            });
         }
         setupEnter(data) {
            this.tlEnter = gsap.timeline({
               paused: true,
               onStart: () =>
                  $("[data-init-hidden]").removeAttr("data-init-hidden"),
            });

            this.tlTriggerEnter = gsap.timeline({
               scrollTrigger: {
                  trigger: this.el,
                  start: "top bottom+=50%",
                  end: "bottom top-=50%",
                  once: true,
                  onEnter: () => this.tlEnter.play(),
                  onEnterBack: () => this.tlEnter.play(),
                  onStart: () =>
                  $("[data-init-hidden]").removeAttr("data-init-hidden"),
               },
            });
         }
         playOnce() {
            this.tlOnce.play();
         }
         interact() {
            this.actionShare();
           $(this.el).find('.tp-resource-hero-table-item').on('click', (e) => {
            let dataTitle = $(e.currentTarget).closest('.tp-resource-hero-table-item').attr('data-title');
            let content = $(this.el).find(`.tp-resource-hero-content-richtext h2[data-title="${dataTitle}"]`).get(0);
            let offset = -100;
            smoothScroll.scrollTo(content, {
               offset: offset,
               duration: 1,
            });
            $(this.el).find('.tp-resource-hero-table-item').removeClass('active');
            $(e.currentTarget).closest('.tp-resource-hero-table-item').addClass('active');
           });
           smoothScroll.lenis.on('scroll', () => {
            this.itemContentActiveCheck($(this.el).find('.tp-resource-hero-content-richtext h2'));
           });
           if(viewport.w < 992){
            header.registerDependent($(this.el).find('.tp-resource-hero-table'));
            $(this.el).find('.tp-resource-hero-table-head').on('click', (e) => {
               $(e.currentTarget).closest('.tp-resource-hero-table-head').toggleClass('active');
               $(this.el).find('.tp-resource-hero-table-list').slideToggle();
            });
           }
           else {
            let heightTableContentWrap = $(this.el).find('.tp-resource-hero-table-content-wrap').outerHeight();
            let heightTableContent = $(this.el).find('.tp-resource-hero-table-content').outerHeight();
            if(heightTableContent > heightTableContentWrap) {
               $(this.el).find('.tp-resource-hero-table-content-wrap').attr('data-lenis-prevent', 'true');
            }
            header.registerDependent($(this.el).find('.tp-resource-hero-table-inner'));
           }
         }
         itemContentActiveCheck(el) {
            for (let i = 0; i < $(el).length; i++) {
                let top = $(el).eq(i).get(0).getBoundingClientRect().top;
                if (top > 0 && top - $(el).eq(i).height() < ($(window).height()/2)) {
                    $(this.el).find('.tp-resource-hero-table-item').removeClass('active');
                    $(this.el).find('.tp-resource-hero-table-item').eq(i).addClass('active');
                }
                }
          }
          initTableContent() {
            $(this.el).find('.tp-resource-content-number').text($('.tp-resource-hero-content-richtext h2').length);
            let titleLeft = $(this.el).find('.tp-resource-hero-table-item').eq(0).clone();
            $(this.el).find('.tp-resource-hero-table-item').remove();
            $(this.el).find('.tp-resource-hero-content-richtext h2').each((i, el) => {
                $(el).attr('data-title', `toch-${i}`);
                let titleLeftClone = titleLeft.clone();
                if(i == 0) {
                    titleLeftClone.addClass('active');
                }
                let index = `${i+1}.`
                let cleanText = $(el).text().replace(/^\d+\.\s*/, '');
                titleLeftClone.find('.tp-resource-hero-table-item-txt .txt').eq(0).text(index);
                titleLeftClone.find('.tp-resource-hero-table-item-txt .txt').eq(1).text(cleanText);
                titleLeftClone.attr('data-title', `toch-${i}`);
                $(this.el).find('.tp-resource-hero-table-list').append(titleLeftClone);
            })
          }
         actionShare() {
            $(this.el).find('.tp-resource-hero-share-item').on('click', function(e) {
                e.preventDefault();
                const shareType = $(this).data('share');
                const currentURL = window.location.href;
                const pageTitle = document.title;
                const encodedURL = encodeURIComponent(currentURL);
                const encodedTitle = encodeURIComponent(pageTitle);
                switch(shareType) {
                    case 'fb':
                        const facebookURL = `https://www.facebook.com/sharer/sharer.php?u=${encodedURL}`;
                        window.open(facebookURL, 'facebook-share', 'width=600,height=400,scrollbars=yes,resizable=yes');
                        break;

                    case 'x':
                        const twitterURL = `https://twitter.com/intent/tweet?url=${encodedURL}&text=${encodedTitle}`;
                        window.open(twitterURL, 'twitter-share', 'width=600,height=400,scrollbars=yes,resizable=yes');
                        break;

                    case 'linkin':
                        const linkedinURL = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedURL}`;
                        window.open(linkedinURL, 'linkedin-share', 'width=600,height=400,scrollbars=yes,resizable=yes');
                        break;

                    case 'link':
                        if (navigator.clipboard && window.isSecureContext) {
                            navigator.clipboard.writeText(currentURL).then(function() {
                                showCopySuccess();
                            }).catch(function(err) {
                                console.error('Failed to copy: ', err);
                                fallbackCopyTextToClipboard(currentURL);
                            });
                        } else {
                            fallbackCopyTextToClipboard(currentURL);
                        }
                        break;

                    default:
                        console.warn('Unknown share type:', shareType);
                }
            });
       
           function fallbackCopyTextToClipboard(text) {
               const textArea = document.createElement("textarea");
               textArea.value = text;
               textArea.style.position = "fixed";
               textArea.style.left = "-999999px";
               textArea.style.top = "-999999px";
               document.body.appendChild(textArea);
               textArea.focus();
               textArea.select();
               
               try {
                   const successful = document.execCommand('copy');
                   if (successful) {
                       showCopySuccess();
                   } else {
                       showCopyError();
                   }
               } catch (err) {
                   console.error('Fallback: Unable to copy', err);
                   showCopyError();
               }
               
               document.body.removeChild(textArea);
           }
       
            function showCopySuccess() {
               showNotification('Copied to clipboard', 'success');
            }
            function showCopyError() {
               showNotification('Failed to copy link.', 'error');
            }
            function showNotification(message, type) {
               $(this.el).find('.tp-resource-hero-share-item-tooltip .txt').text(message)
               $(this.el).find('.tp-resource-hero-share-item-tooltip').addClass('active');
               setTimeout(function() {
               $(this.el).find('.tp-resource-hero-share-item-tooltip').removeClass('active')
               }, 1000);
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
            if(viewport.w < 992){
               header.unregisterDependent($(this.el).find('.tp-resource-hero-table'));
            }
            else {
               header.unregisterDependent($(this.el).find('.tp-resource-hero-table-inner'));
            }
         }
      },

      Footer: class {
         constructor() {
         }
         setup(data) {
            footer.init(data);
         }
      },
   };
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
         // gsap.set('.header', { yPercent: -100})
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
               // gsap.to('.header', { yPercent: 0, duration: 1, ease: 'power2.inOut' });
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
   class PricingPageManager extends PageManager {
      constructor(page) { super(page); }
   }
   class ContactPageManager extends PageManager {
      constructor(page) { super(page); }
   }
   class AboutPageManager extends PageManager {
      constructor(page) { super(page); }
   }
   class SchedulePageManager extends PageManager {
      constructor(page) { super(page); }
   }
   class PolicyPageManager extends PageManager {
      constructor(page) { super(page); }
   }
   class ResourcePageManager extends PageManager {
      constructor(page) { super(page); }
   }
   class TpResourcePageManager extends PageManager {
      constructor(page) { super(page); }
   }
   const PageManagerRegistry = {
      home: new HomePageManager(HomePage),
      product: new ProductPageManager(ProductPage),
      pricing: new PricingPageManager(PricingPage),
      contact: new ContactPageManager(ContactPage),
      about: new AboutPageManager(AboutPage),
      schedule: new SchedulePageManager(SchedulePage),
      policy: new PolicyPageManager(PolicyPage),
      resource: new ResourcePageManager(ResourcePage),
      tpResource: new TpResourcePageManager(TpResourcePage),
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
      },
      pricing: {
         namespace: 'pricing',
         afterEnter(data) {
            PageManagerRegistry.pricing.initEnter(data);
         },
         beforeLeave(data) {
            PageManagerRegistry.pricing.destroy(data);
         }
      },
      contact: {
         namespace: 'contact',
         afterEnter(data) {
            PageManagerRegistry.contact.initEnter(data);
         },
         beforeLeave(data) {
            PageManagerRegistry.contact.destroy(data);
         }
      },
      about: {
         namespace: 'about',
         afterEnter(data) {
            PageManagerRegistry.about.initEnter(data);
         },
         beforeLeave(data) {
            PageManagerRegistry.about.destroy(data);
         }
      },
      schedule: {
         namespace: 'schedule',
         afterEnter(data) {
            PageManagerRegistry.schedule.initEnter(data);
         },
         beforeLeave(data) {
            PageManagerRegistry.schedule.destroy(data);
         }
      },
      policy: {
         namespace: 'policy',
         afterEnter(data) {
            PageManagerRegistry.policy.initEnter(data);
         },
         beforeLeave(data) {
            PageManagerRegistry.policy.destroy(data);
         }
      },
      resource: {
         namespace: 'resource',
         afterEnter(data) {
            PageManagerRegistry.resource.initEnter(data);
         },
         beforeLeave(data) {
            PageManagerRegistry.resource.destroy(data);
         }
      },
      tpResource: {
         namespace: 'tpResource',
         afterEnter(data) {
            PageManagerRegistry.tpResource.initEnter(data);
         },
         beforeLeave(data) {
            PageManagerRegistry.tpResource.destroy(data);
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
