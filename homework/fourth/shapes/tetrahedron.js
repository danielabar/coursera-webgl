/**
 * Cone
 */
(function(window) {
  'use strict';

  var triangle = function (a, b, c, normalsArray, pointsArray) {
    var t1 = subtract(b, a),
      t2 = subtract(c, a),
      normal = normalize(cross(t2, t1));

    normal = vec4(normal);
    normal[3] = 0.0;

    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);

    pointsArray.push(a);
    pointsArray.push(b);
    pointsArray.push(c);
  };

  var divideTriangle = function(a, b, c, count, normalsArray, pointsArray) {
    if (count > 0) {

      var ab = mix(a, b, 0.5);
      var ac = mix(a, c, 0.5);
      var bc = mix(b, c, 0.5);

      ab = normalize(ab, true);
      ac = normalize(ac, true);
      bc = normalize(bc, true);

      divideTriangle(a, ab, ac, count - 1, normalsArray, pointsArray);
      divideTriangle(ab, b, bc, count - 1, normalsArray, pointsArray);
      divideTriangle(bc, c, ac, count - 1, normalsArray, pointsArray);
      divideTriangle(ab, bc, ac, count - 1, normalsArray, pointsArray);
    } else {
      triangle(a, b, c, normalsArray, pointsArray);
    }
  };

  var tetrahedron = function(a, b, c, d, n, normalsArray, pointsArray) {
    divideTriangle(a, b, c, n, normalsArray, pointsArray);
    divideTriangle(d, c, b, n, normalsArray, pointsArray);
    divideTriangle(a, d, b, n, normalsArray, pointsArray);
    divideTriangle(a, c, d, n, normalsArray, pointsArray);
  };

  var Tetrahedron = {

    generate: function() {
      var vertices = [],
        normals = [],
        numTimesToSubdivide = 4,
        va = vec4(0.0, 0.0, -1.0,1),
        vb = vec4(0.0, 0.942809, 0.333333, 1),
        vc = vec4(-0.816497, -0.471405, 0.333333, 1),
        vd = vec4(0.816497, -0.471405, 0.333333,1);

      tetrahedron(va, vb, vc, vd, numTimesToSubdivide, normals, vertices);

      return {
        v: vertices,
        n: normals
      };

    }

  };

  window.Tetrahedron = Tetrahedron;

})(window);
