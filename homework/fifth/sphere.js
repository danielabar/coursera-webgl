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
        indices = [],
        texCoords = {
          spherical: [],
          planar: [],
          cylindrical: []
        };

      for (var latNumber = 0; latNumber <= lats; ++latNumber) {
        for (var longNumber = 0; longNumber <= longs; ++longNumber) {
          var theta = latNumber * Math.PI / lats;
          var phi = longNumber * 2 * Math.PI / longs;
          var sinTheta = Math.sin(theta);
          var sinPhi = Math.sin(phi);
          var cosTheta = Math.cos(theta);
          var cosPhi = Math.cos(phi);

          var x = Math.sin(phi) * Math.sin(theta);
          var y = cosTheta;
          var z = Math.cos(phi) * Math.sin(theta)

          normals.push(x);
          normals.push(y);
          normals.push(z);

          texCoords.spherical.push(1 - (longNumber / longs));
          texCoords.spherical.push(1 - (latNumber / lats));

          texCoords.planar.push(x);
          texCoords.planar.push(y);

          // http://mathworld.wolfram.com/CylindricalCoordinates.html
          // http://keisan.casio.com/exec/system/1359534695
          texCoords.cylindrical.push(theta);
          texCoords.cylindrical.push(cosPhi);

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
        texCoords: texCoords
      };
    }

  };

  window.Sphere = Sphere;

})(window);
