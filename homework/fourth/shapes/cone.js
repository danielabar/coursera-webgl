/**
 * Cone
 */
(function(window, ShapeCommon) {
  'use strict';

  var Cone = {

    generate: function() {
      var uniqueVertices = [],
        vertices = [],
        indices = [],
        normals = [],
        bottomCap = [],
        topPoint = [],
        n = 30,
        startAngle = 1,
        tn;

      bottomCap.push(vec4(0.0, 0.0, 0.0, 1.0));
      bottomCap = bottomCap.concat(ShapeCommon.createNgon(n, startAngle, 0.0));

      topPoint.push(vec4(0.0, 0.0, -1.9, 1.0));

      uniqueVertices = bottomCap.concat(topPoint);

      // Index bottom cap
      for (var i=0; i<n; i++) {
        if (i === n-1) {

          indices.push(0);
          vertices.push(uniqueVertices[0]);
          normals.push(vec3(0.0, -1.0, 0.0));

          indices.push(n);
          vertices.push(uniqueVertices[n]);
          normals.push(vec3(0.0, -1.0, 0.0));

          indices.push(1);
          vertices.push(uniqueVertices[1]);
          normals.push(vec3(0.0, -1.0, 0.0));

        } else {

          indices.push(0);
          vertices.push(uniqueVertices[0]);
          normals.push(vec3(0.0, -1.0, 0.0));

          indices.push(i+1);
          vertices.push(uniqueVertices[i+1]);
          normals.push(vec3(0.0, -1.0, 0.0));

          indices.push(i+2);
          vertices.push(uniqueVertices[i+2]);
          normals.push(vec3(0.0, -1.0, 0.0));
        }
      }

      // Join top point to bottom cap
      for (var j=1; j<=n; j++) {
        if (j === n) {
          tn = ShapeCommon.triangleNormal(uniqueVertices[n+1], uniqueVertices[j], uniqueVertices[1]);
          indices.push(n+1);
          vertices.push(uniqueVertices[n+1]);
          normals.push(tn);

          indices.push(j);
          vertices.push(uniqueVertices[j]);
          normals.push(tn);

          indices.push(1);
          vertices.push(uniqueVertices[1]);
          normals.push(tn);

        } else {
          tn = ShapeCommon.triangleNormal(uniqueVertices[n+1], uniqueVertices[j], uniqueVertices[j+1]);
          indices.push(n+1);
          vertices.push(uniqueVertices[n+1]);
          normals.push(tn);

          indices.push(j);
          vertices.push(uniqueVertices[j]);
          normals.push(tn);

          indices.push(j+1);
          vertices.push(uniqueVertices[j+1]);
          normals.push(tn);
        }
      }

      return {
        v: vertices,
        i: indices,
        n: normals
      };

    }

  };

  window.Cone = Cone;

})(window, window.ShapeCommon);
