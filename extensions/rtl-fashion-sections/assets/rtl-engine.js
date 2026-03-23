/**
 * RTL Engine - JavaScript Enhancements
 * Handles dynamic RTL adjustments and third-party script compatibility
 */

(function() {
  'use strict';

  const RTLEngine = {
    config: {
      rtlLanguages: ['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'yi'],
      debug: false
    },

    init() {
      this.detectRTL();
      this.setupObservers();
      this.handleThirdPartyScripts();
      this.setupCartDrawer();
      this.setupNavigation();
      
      if (this.config.debug) {
        console.log('[RTL Engine] Initialized for locale:', document.documentElement.lang);
      }
    },

    /**
     * Detect if current page should be RTL
     */
    detectRTL() {
      const htmlLang = document.documentElement.lang;
      const bodyClass = document.body.classList;
      
      if (this.config.rtlLanguages.includes(htmlLang) || bodyClass.contains('rtl-layout')) {
        this.enableRTL();
      }
    },

    /**
     * Enable RTL mode
     */
    enableRTL() {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('data-rtl', 'true');
      document.body.classList.add('rtl-layout');
      
      // Fix lazy-loaded images
      this.fixLazyImages();
      
      // Re-initialize sliders/carousels if present
      this.fixSliders();
      
      // Fix Shopify predictive search
      this.fixPredictiveSearch();
    },

    /**
     * Setup mutation observer for dynamic content
     */
    setupObservers() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          // Handle dynamically added content
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1) { // Element node
                this.processNode(node);
              }
            });
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    },

    /**
     * Process newly added nodes
     */
    processNode(node) {
      // Fix Shopify section rendering API content
      if (node.classList && node.classList.contains('shopify-section')) {
        this.fixSection(node);
      }
      
      // Fix cart items when updated
      if (node.classList && node.classList.contains('cart-item')) {
        this.fixCartItem(node);
      }
      
      // Fix product cards
      if (node.querySelectorAll) {
        const cards = node.querySelectorAll('.card, .product-card');
        cards.forEach(card => this.fixProductCard(card));
      }
    },

    /**
     * Fix lazy-loaded images (srcset direction)
     */
    fixLazyImages() {
      document.querySelectorAll('img[data-srcset], img[data-src]').forEach(img => {
        // Images don't need directional changes, but we ensure they load correctly
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
      });
    },

    /**
     * Fix Shopify sliders/carousels
     */
    fixSliders() {
      // Dawn theme slider
      if (window.Slider) {
        const sliders = document.querySelectorAll('.slider');
        sliders.forEach(slider => {
          slider.style.direction = 'rtl';
        });
      }
      
      // Fix slideshow arrows
      document.querySelectorAll('.slideshow__control').forEach(control => {
        control.style.transform = 'scaleX(-1)';
      });
    },

    /**
     * Fix predictive search dropdown
     */
    fixPredictiveSearch() {
      const searchInput = document.querySelector('input[type="search"]');
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          setTimeout(() => {
            const results = document.querySelector('.predictive-search');
            if (results) {
              results.style.direction = 'rtl';
              results.style.textAlign = 'right';
            }
          }, 100);
        });
      }
    },

    /**
     * Setup cart drawer for RTL
     */
    setupCartDrawer() {
      // Watch for cart drawer opening
      const cartTriggers = document.querySelectorAll('[data-drawer-id="cart-drawer"], .js-drawer-open-cart, [href="/cart"]');
      
      cartTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
          setTimeout(() => {
            const cartDrawer = document.querySelector('.cart-drawer, #cart-drawer');
            if (cartDrawer) {
              cartDrawer.style.direction = 'rtl';
              this.fixCartItems();
            }
          }, 50);
        });
      });
    },

    /**
     * Fix all cart items
     */
    fixCartItems() {
      document.querySelectorAll('.cart-item').forEach(item => {
        this.fixCartItem(item);
      });
    },

    /**
     * Fix individual cart item
     */
    fixCartItem(item) {
      item.style.direction = 'rtl';
      const details = item.querySelector('.cart-item__details');
      if (details) {
        details.style.textAlign = 'right';
      }
    },

    /**
     * Fix product card layout
     */
    fixProductCard(card) {
      card.style.direction = 'rtl';
      const info = card.querySelector('.card__information, .product-card__info');
      if (info) {
        info.style.textAlign = 'right';
      }
    },

    /**
     * Fix dynamically rendered section
     */
    fixSection(section) {
      section.style.direction = 'rtl';
      
      // Fix any sliders within the section
      const sliders = section.querySelectorAll('.slider, .slideshow');
      sliders.forEach(slider => {
        slider.style.direction = 'rtl';
      });
    },

    /**
     * Setup mobile navigation
     */
    setupNavigation() {
      // Mobile menu drawer
      const menuTrigger = document.querySelector('.header__icon--menu, [data-drawer-id="menu-drawer"]');
      if (menuTrigger) {
        menuTrigger.addEventListener('click', () => {
          setTimeout(() => {
            const drawer = document.querySelector('.menu-drawer, #menu-drawer');
            if (drawer) {
              drawer.style.direction = 'rtl';
              drawer.style.textAlign = 'right';
            }
          }, 50);
        });
      }
    },

    /**
     * Handle compatibility with third-party apps
     */
    handleThirdPartyScripts() {
      // Wait for third-party scripts to load
      window.addEventListener('load', () => {
        // Common app: Judge.me reviews
        if (window.jdgm) {
          this.fixJudgeMe();
        }
        
        // Common app: Loox reviews
        if (window.loox) {
          this.fixLoox();
        }
        
        // Common app: Yotpo
        if (window.yotpo) {
          this.fixYotpo();
        }
        
        // Klaviyo forms
        if (window._klOnload) {
          this.fixKlaviyo();
        }
      });
    },

    /**
     * Fix Judge.me reviews widget
     */
    fixJudgeMe() {
      document.querySelectorAll('.jdgm-widget').forEach(widget => {
        widget.style.direction = 'rtl';
      });
    },

    /**
     * Fix Loox reviews
     */
    fixLoox() {
      document.querySelectorAll('.loox-reviews-default').forEach(widget => {
        widget.style.direction = 'rtl';
      });
    },

    /**
     * Fix Yotpo widgets
     */
    fixYotpo() {
      document.querySelectorAll('.yotpo').forEach(widget => {
        widget.style.direction = 'rtl';
      });
    },

    /**
     * Fix Klaviyo forms
     */
    fixKlaviyo() {
      // Watch for Klaviyo form injection
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.classList.contains('klaviyo-form')) {
              node.style.direction = 'rtl';
            }
          });
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    },

    /**
     * Utility: Check if element is in RTL mode
     */
    isRTL() {
      return document.documentElement.getAttribute('dir') === 'rtl';
    },

    /**
     * Utility: Force RTL mode (for testing)
     */
    forceRTL() {
      this.enableRTL();
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => RTLEngine.init());
  } else {
    RTLEngine.init();
  }

  // Expose to global scope for debugging
  window.RTLEngine = RTLEngine;
})();
