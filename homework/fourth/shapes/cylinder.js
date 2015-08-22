/**
 * Cylinder
 */
(function(window, ShapeCommon) {
  'use strict';

  var Cylinder = {

    generate: function() {
      var uniqueVertices = [],
        vertices = [],
        indices = [],
        uniqueNormals = [],
        normals = [],
        bottomCap = [],
        topCap = [],
        n = 40,
        startAngle = 0,
        ftn, stn;

      bottomCap.push(vec4(0.0, 0.0, 0.0, 1.0));
      bottomCap = bottomCap.concat(ShapeCommon.createNgon(n, startAngle, 0.0));

      topCap.push(vec4(0.0, 0.0, -1.9, 1.0));
      topCap = topCap.concat(ShapeCommon.createNgon(n, startAngle, -1.9));

      uniqueVertices = bottomCap.concat(topCap);

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

      // Index top cap
      var offset = n+1;
      for (var j=0; j<n; j++) {
        if (j === n-1) {
          indices.push(offset);
          vertices.push(uniqueVertices[offset]);
          normals.push(vec3(0.0, 1.0, 0.0));

          indices.push(n + offset);
          vertices.push(uniqueVertices[n + offset]);
          normals.push(vec3(0.0, 1.0, 0.0));

          indices.push(1 + offset);
          vertices.push(uniqueVertices[1 + offset]);
          normals.push(vec3(0.0, 1.0, 0.0));

        } else {
          indices.push(offset);
          vertices.push(uniqueVertices[offset]);
          normals.push(vec3(0.0, 1.0, 0.0));

          indices.push(j+1 + offset);
          vertices.push(uniqueVertices[j+1 + offset]);
          normals.push(vec3(0.0, 1.0, 0.0));

          indices.push(j+2 + offset);
          vertices.push(uniqueVertices[j+2 + offset]);
          normals.push(vec3(0.0, 1.0, 0.0));
        }
      }

      // Initialize unique normals with zero vectors
      for (var kn=0; kn<=uniqueVertices.length; kn++) {
        uniqueNormals[kn] = vec3(0.0, 0.0, 0.0);
      }

      // Index tube connecting top and bottom
      for (var k=1; k<=n-1; k++) {

        // Special handling to "wrap it up"
        if (k === n-1) {

          // first triangle
          ftn = ShapeCommon.computeNormal(uniqueVertices[k], uniqueVertices[1], uniqueVertices[k + offset]);
          indices.push(k);
          vertices.push(uniqueVertices[k]);
          uniqueNormals[k] = add(ftn, uniqueNormals[k]);

          indices.push(1);
          vertices.push(uniqueVertices[1]);
          uniqueNormals[1] = add(ftn, uniqueNormals[1]);

          indices.push(k + offset);
          vertices.push(uniqueVertices[k + offset]);
          uniqueNormals[k + offset] = add(ftn, uniqueNormals[k + offset]);

          // second triangle
          stn = ShapeCommon.computeNormal(uniqueVertices[1], uniqueVertices[1+offset], uniqueVertices[k+offset]);
          indices.push(1);
          vertices.push(uniqueVertices[1]);
          uniqueNormals[1] = add(stn, uniqueNormals[1]);

          indices.push(1 + offset);
          vertices.push(uniqueVertices[1+offset]);
          uniqueNormals[1 + offset] = add(stn, uniqueNormals[1 + offset]);

          indices.push(k + offset);
          vertices.push(uniqueVertices[k+offset]);
          uniqueNormals[k + offset] = add(stn, uniqueNormals[k + offset]);

        } else {

          // first triangle
          ftn = ShapeCommon.computeNormal(uniqueVertices[k], uniqueVertices[k+1], uniqueVertices[k + 1 + offset]);
          indices.push(k);
          vertices.push(uniqueVertices[k]);
          uniqueNormals[k] = add(ftn, uniqueNormals[k]);

          indices.push(k+1);
          vertices.push(uniqueVertices[k+1]);
          uniqueNormals[k+1] = add(ftn, uniqueNormals[k+1]);

          indices.push(k + 1 + offset);
          vertices.push(uniqueVertices[k+1+offset]);
          uniqueNormals[k+1+offset] = add(ftn, uniqueNormals[k+1+offset]);

          // second triangle
          stn = ShapeCommon.computeNormal(uniqueVertices[k], uniqueVertices[k+1+offset], uniqueVertices[k+offset]);
          indices.push(k);
          vertices.push(uniqueVertices[k]);
          uniqueNormals[k] = add(stn, uniqueNormals[k]);

          indices.push(k + 1 + offset);
          vertices.push(uniqueVertices[k+1+offset]);
          uniqueNormals[k+1+offset] = add(stn, uniqueNormals[k+1+offset]);

          indices.push(k + offset);
          vertices.push(uniqueVertices[k+offset]);
          uniqueNormals[k+offset] = add(stn, uniqueNormals[k+offset]);
        }

      }

      // Normalize unique normals
      for (var knn=0; knn<uniqueNormals.length; knn++) {
        var curNormal = uniqueNormals[knn];
        var nn = normalize(curNormal);
        uniqueNormals[knn] = nn;
      }

      // Fill normals array with unique normals
      for (var k2=1; k2<=n-1; k2++) {
        if (k2 === n-1) {
          normals.push(uniqueNormals[k2]);
          normals.push(uniqueNormals[1]);
          normals.push(uniqueNormals[k2+offset]);
          normals.push(uniqueNormals[1]);
          normals.push(uniqueNormals[1+offset]);
          normals.push(uniqueNormals[k2+offset]);
        } else {
          normals.push(uniqueNormals[k2]);
          normals.push(uniqueNormals[k2+1]);
          normals.push(uniqueNormals[k2+1+offset]);
          normals.push(uniqueNormals[k2]);
          normals.push(uniqueNormals[k2+1+offset]);
          normals.push(uniqueNormals[k2+offset]);
        }
      }

      return {
        v: vertices,
        i: indices,
        n: normals
      };
    }

  };

  window.Cylinder = Cylinder;

})(window, window.ShapeCommon);
