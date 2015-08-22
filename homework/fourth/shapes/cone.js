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
        uniqueNormals = [],
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

          indices.push(1);
          vertices.push(uniqueVertices[1]);
          normals.push(vec3(0.0, -1.0, 0.0));

          indices.push(n);
          vertices.push(uniqueVertices[n]);
          normals.push(vec3(0.0, -1.0, 0.0));

        } else {

          indices.push(0);
          vertices.push(uniqueVertices[0]);
          normals.push(vec3(0.0, -1.0, 0.0));

          indices.push(i+2);
          vertices.push(uniqueVertices[i+2]);
          normals.push(vec3(0.0, -1.0, 0.0));

          indices.push(i+1);
          vertices.push(uniqueVertices[i+1]);
          normals.push(vec3(0.0, -1.0, 0.0));
        }
      }

      // Initialize unique normals with zero vectors
      for (var kn=0; kn<=uniqueVertices.length; kn++) {
        uniqueNormals[kn] = vec3(0.0, 0.0, 0.0);
      }

      // Join top point to bottom cap
      for (var j=1; j<=n; j++) {

        // Special handling to "wrap it up"
        if (j === n) {

          tn = ShapeCommon.computeNormal(uniqueVertices[n+1], uniqueVertices[j], uniqueVertices[1]);
          indices.push(n+1);
          vertices.push(uniqueVertices[n+1]);
          uniqueNormals[n+1] = add(tn, uniqueNormals[n+1]);

          indices.push(j);
          vertices.push(uniqueVertices[j]);
          uniqueNormals[j] = add(tn, uniqueNormals[j]);

          indices.push(1);
          vertices.push(uniqueVertices[1]);
          uniqueNormals[1] = add(tn, uniqueNormals[1]);

        } else {

          tn = ShapeCommon.computeNormal(uniqueVertices[n+1], uniqueVertices[j], uniqueVertices[j+1]);
          indices.push(n+1);
          vertices.push(uniqueVertices[n+1]);
          uniqueNormals[n+1] = add(tn, uniqueNormals[n+1]);

          indices.push(j);
          vertices.push(uniqueVertices[j]);
          uniqueNormals[j] = add(tn, uniqueNormals[j]);

          indices.push(j+1);
          vertices.push(uniqueVertices[j+1]);
          uniqueNormals[j+1] = add(tn, uniqueNormals[j+1]);
        }
      }

      // Normalize unique normals
      for (var knn=0; knn<uniqueNormals.length; knn++) {
        var curNormal = uniqueNormals[knn];
        var nn = normalize(curNormal);
        uniqueNormals[knn] = nn;
      }

      // Fill normals array with unique normals
      for (var j2=1; j2<=n; j2++) {
        if (j === n) {
          normals.push(uniqueNormals[n+1]);
          normals.push(uniqueNormals[j2]);
          normals.push(uniqueNormals[1]);
        } else {
          normals.push(uniqueNormals[n+1]);
          normals.push(uniqueNormals[j2]);
          normals.push(uniqueNormals[j2+1]);
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
