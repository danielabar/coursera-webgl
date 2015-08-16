/**
 * Light
 */
(function(window) {
  'use strict';

  var calcProduct = function(lightVec, materialVec) {
    return mult(lightVec, materialVec);
  };

  var Light = {

    shinyHappy: function() {
      var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 ),
        lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 ),
        materialDiffuse =  vec4( 1.0, 0.8, 0.0, 1.0 ),
        materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

      return {
        lightPosition: vec4(1.0, 1.0, 1.0, 0.0 ),
        lightAmbient: vec4(0.7, 0.6, 0.7, 1.0),
        materialShininess: 40.0,
        diffuseProduct: mult(lightDiffuse, materialDiffuse),
        specularProduct: mult(lightSpecular, materialSpecular)
      };
    }

  };

  window.Light = Light;

})(window);
