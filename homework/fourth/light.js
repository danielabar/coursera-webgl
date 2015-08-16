/**
 * Light
 */
(function(window) {
  'use strict';

  var Light = {

    // TODO: overhead natural sunlight
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
        specularProduct: mult(lightSpecular, materialSpecular)
      };
    },

    // TODO yellow spotlight
    spotlight: function() {
      var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 ),
        lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 ),
        materialDiffuse =  vec4( 1.0, 0.8, 0.0, 1.0 ),
        materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

      return {
        lightPosition: vec4(1.0, 1.0, 1.0, 1.0 ),
        lightAmbient: vec4(0.7, 0.6, 0.7, 1.0),
        materialShininess: 40.0,
        diffuseProduct: mult(lightDiffuse, materialDiffuse),
        specularProduct: mult(lightSpecular, materialSpecular)
      };
    }

  };

  window.Light = Light;

})(window);
