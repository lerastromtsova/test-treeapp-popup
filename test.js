console.log("Test treeapp alert");

(function () {
  var oneTreePlanted = function (jQuery) {
    jQuery('body').prepend('');
    jQuery('[data-selector="treeapp-tree-counter"]').html('0');
    jQuery.ajax({
      url: "/cart.json?onetree=1",
      type: "GET",
      success: function (result) {
        var hasProductInCart = false;
        var variantId = '42106048872678';
        if (result.items != undefined) {
          for (var i = 0; i < result.items.length; i++) {
            if (result.items[i].variant_id == variantId) {
              hasProductInCart = true;
              break;
            }
          }
        }

        var popup = {

          checkoutClickTarget: false,

          init: function () {
            if(hasProductInCart){
              return;
            }
            this.prepareContent();
            this.eventListener();
          },

          prepareContent: function () {
            global.appendContent('<script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>');
            new swal(
              {
                title: "Plant a tree with your order",
                text: "Add a tree to your basket for 1 GBP",
                showCancelButton: true,
                showConfirmButton: true,
                showCloseButton: true,
                confirmButtonColor: "green",
                confirmButtonText: "YES",
                cancelButtonText: "NO",
                backdrop: true,
                customClass:'treeapp-popup',
                allowOutsideClick: true
              },
              function (isConfirmed) {
                console.log('1');
                if (isConfirmed) {
                  console.log('2');
                  global.addProductToCart();
                  (function waitForIt() {
                    setTimeout(function () {
                      global.checkHasProductInCart(function (result) {
                        if(result){
                          if (popup.checkoutClickTarget) {
                            jQuery(popup.checkoutClickTarget).click();
                          }
                        }else{
                          waitForIt();
                        }
                      });
                    }, 1000);
                  })();
                }else{
                  jQuery(popup.checkoutClickTarget).click();
                }
              }
            );
            console.log('Treeapp popup initialize');
          },

          findCheckoutLinks: function() {
            return '#checkout, form[action*="/cart"] button[type="submit"], form[action*="/cart"] input[type="submit"]';
          },

          onCheckoutClick: function(e){
            const formTypeEl = jQuery(this).parents('form').find('[name="form_type"]');
            if (formTypeEl.length > 0 && formTypeEl.val() === 'product') {
              return;
            }

            if (popup.checkoutClickTarget) {
              popup.checkoutClickTarget = null;
              return;
            }

            if(hasProductInCart){
              return;
            }
            e.preventDefault();
            popup.checkoutClickTarget = e.target || e.currentTarget;
            setTimeout(function () {
              jQuery(".treeapp-popup").css('visibility', 'visible');
              jQuery(".treeapp-sweet-overlay").css('visibility', 'visible');
            }, 150);
          },

          eventListener: function () {
            jQuery(document).on('click', popup.findCheckoutLinks(), popup.onCheckoutClick);
          }
        };

        popup.init();





        var widget = {

          init: function () {
            if(hasProductInCart){
              return;
            }
            this.prepareContent();
            this.eventListener();
          },

          prepareContent: function () {
            // global.appendContent(); styles go here
            console.log('Treeapp widget initialize');
          },

          clickHeader: function () {
            var icon = jQuery("#arrow-icon");
            var widget = jQuery(".treeapp-widget");
            if(widget.hasClass('active')){
              widget.css('height', '40px');
              widget.removeClass('active');
              icon.removeClass('icon-chevron-down').addClass('icon-chevron-up');
            }else{
              widget.css('height', '300px').addClass('active');
              icon.removeClass('icon-chevron-up').addClass('icon-chevron-down');
            }
          },

          clickWidgetBubble: function() {
            const widgetBubble = jQuery("#treeapp-widget-bubble");
            const widgetBubbleContainer = jQuery(".treeapp-widget-container ");
            widgetBubble.toggleClass("active");
            widgetBubbleContainer.removeAttr("style");
          },

          clickConfirmButton: function () {
            jQuery(".treeapp-header").click();
            global.addProductToCart();
            (function waitForIt() {
              setTimeout(function () {
                global.checkHasProductInCart(function (result) {
                  if(result){
                    window.location = '/cart';
                  }else{
                    waitForIt();
                  }
                });
              }, 1000);
            })();
          },

          eventListener: function () {
            var self = this;

            jQuery(document).on('click', ".treeapp-content-button-cancel", function () {
              jQuery(".treeapp-header").click();
            });

            jQuery(document).on('click', '.treeapp-widget-bubble-icon', function (){
              widget.clickWidgetBubble();
            });

            jQuery(document).on('click', '.treeapp-widget-bubble-header-title', function (){
              widget.clickWidgetBubble();
            });

            jQuery(document).on('click', '.treeapp-widget-bubble-content-button-cancel', function (){
              widget.clickWidgetBubble();
            });

            jQuery(document).on('click', '.treeapp-header', function (){
              widget.clickHeader();
            });

            jQuery(document).on('click', '.treeapp-content-button-confirm, .treeapp-widget-bubble-content-button-confirm', function () {
              self.clickConfirmButton();
            });
          }
        };

        widget.init();





      }
    });
  };

  var global = {

    jq: null,
    productId: '7556676026598',
    variantId: '42106048872678',

    init: function () {
      this.eventListener();
    },

    loadScript: function (url, callback) {
      var script = document.createElement("script");
      script.type = "text/javascript";
      if (script.readyState) {
        script.onreadystatechange = function () {
          if (script.readyState == "loaded" || script.readyState == "complete") {
            script.onreadystatechange = null;
            callback();
          }
        };
      } else {
        script.onload = function () {
          callback();
        };
      }
      script.src = url;
      document.getElementsByTagName("head")[0].appendChild(script);
    },

    appendContent: function (content) {
      this.jq(document.body).prepend(content);
    },

    checkHasProductInCart: function (callback) {
      var self = this;
      self.jq.ajax({
        url: "/cart.json?onetree=1",
        type: "GET",
        success: function (result) {
          var items = result.items;
          var hasProductInCart = false;
          if (items != undefined) {
            for (var i = 0; i < items.length; i++) {
              if (items[i].variant_id == global.variantId) {
                hasProductInCart = true;
                break;
              }
            }
          }
          setTimeout(function () {
            callback(hasProductInCart)
          }, 0);
        }
      });
    },

    addProductToCart: function (callback) {
      var quantity = 1;
      this.jq.post('/cart/add.js', {
        items: [{
          quantity: quantity,
          id: global.variantId,
          async: false
        }],
        success: function (){
          if(typeof callback === "function"){
            callback();
          }
        }
      });
    },

    deleteProductInCart: function () {
      this.jq.post('/cart/change.js', {
        quantity: 0,
        id: global.variantId,
        async: false
      });
    },

    eventListener: function () {
      var self = this;
      if ((typeof jQuery === 'undefined') || (parseFloat(jQuery.fn.jquery) < 1.7)) {
        self.loadScript('//ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js', function () {
          var jQuery311 = jQuery.noConflict(true);
          self.jq = jQuery311;
          oneTreePlanted(jQuery311);
        });
      } else {
        self.jq = jQuery;
        oneTreePlanted(jQuery);
      }
    }
  };

  global.init();


})();


