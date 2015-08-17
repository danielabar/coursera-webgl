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
    },

    rotatePoint3D: function(vec4Point, xAngle, yAngle) {
      var origX = vec4Point[0];
      var origY = vec4Point[1];
      var origZ = vec4Point[2];
      var origW = vec4Point[3];
      var xAngleRad = radians(xAngle);
      var yAngleRad = radians(yAngle);

      var newX = (Math.cos(yAngleRad) * origX) + (Math.sin(yAngleRad) * Math.sin(xAngleRad) * origY) - (Math.sin(yAngleRad) * Math.cos(xAngleRad) * origZ);
      var newY = (Math.cos(xAngleRad) * origY) + (Math.sin(xAngleRad) * origZ);
      var newZ = (Math.sin(yAngleRad) * origX) + (Math.cos(yAngleRad) * origY) + (Math.cos(yAngleRad) * Math.cos(xAngleRad) * origZ);

      return vec4(newX, newY, newZ, origW);
    }

  };

  window.Light = Light;

})(window);
