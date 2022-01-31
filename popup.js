(function () {
  let treeappPlugin = function (jQuery) {
    jQuery('body').prepend('');
    jQuery('[data-selector="treeapp-tree-counter"]').html('0');
    jQuery.ajax({
      url: "/cart.json?onetree=1",
      type: "GET",
      success: function (result) {
        let hasProductInCart = false;
        const variantId = '42106048872678';
        if (result.items !== undefined) {
          for (var i = 0; i < result.items.length; i++) {
            if (result.items[i].variant_id === variantId) {
              hasProductInCart = true;
              break;
            }
          }
        }

        let popup = {

          checkoutClickTarget: false,

          init: function () {
            if (hasProductInCart) {
              return;
            }
            this.prepareContent();
            this.eventListener();
          },

          prepareContent: function () {
            global.appendContent('<script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>');
            swal.fire(
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
                customClass: 'treeapp-popup',
                allowOutsideClick: true
              }
            ).then((result) => {
                if (result.isConfirmed) {
                  global.addProductToCart();
                  location.reload();
                } else {
                  jQuery(popup.checkoutClickTarget).click();
                }
              }
            );
            console.log('Treeapp popup initialize');
          },
        }
        popup.init()
      }
    })
  }

  let global = {

    jq: null,
    productId: '7556676026598',
    variantId: '42106048872678',

    init: function () {
      this.eventListener();
    },

    loadScript: function (url, callback) {
      let script = document.createElement("script");
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

    addProductToCart: function (callback) {
      let quantity = 1;
      let data = {
        items: [{
          quantity: quantity,
          id: global.variantId,
          async: false
        }]
      };
      this.jq.post('/cart/add.js', data, function(data) { console.log(data);}, "json");
    },

    eventListener: function () {
      let self = this;
      if ((typeof jQuery === 'undefined') || (parseFloat(jQuery.fn.jquery) < 1.7)) {
        self.loadScript('//ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js', function () {
          var jQuery311 = jQuery.noConflict(true);
          self.jq = jQuery311;
          treeappPlugin(jQuery311);
        });
      } else {
        self.jq = jQuery;
        treeappPlugin(jQuery);
      }
    }
  };

  global.init();
})();