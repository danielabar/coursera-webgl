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

    middaySun: function() {
      var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 ),
        lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 ),
        materialDiffuse =  vec4( 1.0, 1.0, 1.0, 1.0 ),
        materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

      return {
        lightPosition: vec4(0.0, 1.0, 1.0, 0.0 ),
        lightAmbient: vec4(0.7, 0.6, 0.7, 1.0),
        materialShininess: 10.0,
        diffuseProduct: mult(lightDiffuse, materialDiffuse),
        specularProduct: mult(lightSpecular, materialSpecular),
        theta: 0.0
      };
    }

  };

  window.Light = Light;

})(window);
