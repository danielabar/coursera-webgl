/**
 * Sphere
 */
(function(window) {
  'use strict';

  var Sphere = {

    generate: function(opts) {
      var lats = 30,
        longs = 30,
        radius = 1.0,
        vertices = [],
        normals = [],
        textureCoords = [],
        indices = [];

      for (var latNumber = 0; latNumber <= lats; ++latNumber) {
        for (var longNumber = 0; longNumber <= longs; ++longNumber) {
          var theta = latNumber * Math.PI / lats;
          var phi = longNumber * 2 * Math.PI / longs;
          var sinTheta = Math.sin(theta);
          var sinPhi = Math.sin(phi);
          var cosTheta = Math.cos(theta);
          var cosPhi = Math.cos(phi);

          var x = cosPhi * sinTheta;
          var y = cosTheta;
          var z = sinPhi * sinTheta;
          var u = 1 - (longNumber / longs);
          var v = 1 - (latNumber / lats);

          normals.push(x);
          normals.push(y);
          normals.push(z);

          textureCoords.push(u);
          textureCoords.push(v);

          vertices.push(radius * x);
          vertices.push(radius * y);
          vertices.push(radius * z);
        }
      }

      for (var latNumberI = 0; latNumberI < lats; ++latNumberI) {
        for (var longNumberI = 0; longNumberI < longs; ++longNumberI) {
          var first = (latNumberI * (longs+1)) + longNumberI;
          var second = first + longs + 1;
          indices.push(first);
          indices.push(second);
          indices.push(first+1);

          indices.push(second);
          indices.push(second+1);
          indices.push(first+1);
        }
      }

      return {
        vertices: vertices,
        indices: indices,
        normals: normals,
        textureCoords: textureCoords
      };
    }

  };

  window.Sphere = Sphere;

})(window);
