/**
 * Light
 */
(function(window) {
  'use strict';

  var Light = {

    initPosition: function(distance, type) {
      var w = (type === 'sunlight') ? 0.0 : 0.1;
      return vec4(1.0, 1.0, distance, w);
    },

    defaultSource: function() {
      var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 ),
        lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 ),
        materialDiffuse =  vec4( 1.0, 1.0, 1.0, 1.0 ),
        materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

      return {
        lightPosition: vec4(1.0, 1.0, 1.0, 0.0 ),
        lightAmbient: vec4( 1.0, 1.0, 1.0, 1.0 ),
        diffuseProduct: mult(lightDiffuse, materialDiffuse),
        specularProduct: mult(lightSpecular, materialSpecular),
        theta: 0.0
      };
    },

    rotatePoint2D: function(theta, radius) {
      var thetaRad = radians(theta);
      var newX = radius * Math.cos(theta);   // new x pos
      var newY = radius * Math.sin(theta);   // new y pos
      return vec2(newX, newY);
    }

  };

  window.Light = Light;

})(window);
