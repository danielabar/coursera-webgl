/**
 * Shape
 */
(function(window) {
  'use strict';

  var Shape = {

    draw: function(shapeName) {
      return window[shapeName].draw();
    }

  };

  window.Shape = Shape;

})(window);
