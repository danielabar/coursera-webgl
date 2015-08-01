/**
 * Shape
 */
(function(window) {
  'use strict';

  var Shape = {

    generate: function(shapeName) {
      return window[shapeName].generate();
    }

  };

  window.Shape = Shape;

})(window);
