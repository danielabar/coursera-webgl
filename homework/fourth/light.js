/**
 * Light
 */
(function(window, ColorUtils) {
  'use strict';

  var Light = {

    attenuationFactor: 0.2,

    defaultSource: function() {
      return {
        lightPosition: vec4(1.0, 1.0, 1.0, 0.0 ),
        lightAmbient: vec4( 1.0, 1.0, 1.0, 1.0 ),
        lightDiffuse: vec4( 1.0, 1.0, 1.0, 1.0 ),
        lightSpecular: vec4( 1.0, 1.0, 1.0, 1.0 ),
        theta: 0.0,
        rotation: 'INC',
        lightDistance: 0.0,
        attenuation: 1.0,
        enabled: true
      };
    },

    alternateSource: function() {
      return {
        lightPosition: vec4(-1.0, -1.0, 1.0, 0.0 ),
        lightAmbient: ColorUtils.hexToGLvec4('#333333'),
        lightDiffuse: ColorUtils.hexToGLvec4('#ffdd05'),
        lightSpecular: vec4( 1.0, 1.0, 1.0, 1.0 ),
        theta: 180.0,
        rotation: 'DEC',
        lightDistance: 0.0,
        attenuation: 1.0,
        enabled: false
      };
    },

    globalAmbient: function() {
      var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 ),
        lightSpecular = vec4( 0.0, 0.0, 0.0, 1.0 ),
        materialDiffuse =  vec4( 1.0, 1.0, 1.0, 1.0 ),
        materialSpecular = vec4( 0.0, 0.0, 0.0, 1.0 );

      return {
        lightPosition: vec4(1.0, 1.0, 1.0, 0.0 ),
        lightAmbient: vec4( 0.1, 0.1, 0.1, 1.0 ),
        diffuseProduct: mult(lightDiffuse, materialDiffuse),
        specularProduct: mult(lightSpecular, materialSpecular)
      };
    },

    numEnabled: function(lightSources) {
      var count = 0;
      for (var i=0; i<lightSources.length; i++) {
        if (lightSources[i].enabled) {
          count += 1;
        }
      }
      return count;
    },

    indexEnabled: function(lightSources) {
      var index = null;
      for (var i=0; i<lightSources.length; i++) {
        if (lightSources[i].enabled) {
          index = i;
          break;
        }
      }
      return index;
    },

    rotatePoint2D: function(theta, radius) {
      var thetaRad = radians(theta);
      var newX = radius * Math.cos(theta);
      var newY = radius * Math.sin(theta);
      return vec2(newX, newY);
    },

    rotatePoint3D: function(point, xAngle, yAngle) {
      var origX = point[0];
      var origY = point[1];
      var origZ = point[2];
      var xAngleRad = radians(xAngle);
      var yAngleRad = radians(yAngle);

      var newX = (Math.cos(yAngleRad) * origX) +
        (Math.sin(yAngleRad) * Math.sin(xAngleRad) * origY) -
        (Math.sin(yAngleRad) * Math.cos(xAngleRad) * origZ);

      var newY = (Math.cos(xAngleRad) * origY) +
        (Math.sin(xAngleRad) * origZ);

      var newZ = (Math.sin(yAngleRad) * origX) +
        (Math.cos(yAngleRad) * origY) +
        (Math.cos(yAngleRad) * Math.cos(xAngleRad) * origZ);

      return vec3(newX, newY, newZ);
    }

  };

  window.Light = Light;

})(window, window.ColorUtils);
