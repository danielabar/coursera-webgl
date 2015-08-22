/**
 * Cylinder
 *
 * Normals:
 * https://class.coursera.org/webgl-001/forum/thread?thread_id=342
 */
(function(window, ShapeCommon) {
  'use strict';

  var triangleNormal = function(a, b, c) {
    var t1 = subtract(b, a),
      t2 = subtract(c, a),
      normal = normalize(cross(t2, t1));

    normal = vec3(normal);
    return normal;
  };

  var computeNormal = function (a, b, c){
    var t1 = subtract(b, a);
    var t2 = subtract(c, b);
    var normal = vec3(cross(t1, t2));
    return normal;
  };

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

      /**
       * Normals Summary:
       * For each vertex we calculate normal as the average of normals of the faces to which the vertex belongs.
       *
       * Normals Details:
       * First we create an array of the same size as the vertex array (each vertex should have its own normal)
       * and fill it up with zero vectors [0, 0, 0].
       * Then we loop through the faces of the mesh.
       * For each face we calculate normal of the face using the "Normals for triangle",
       * and for each vertex forming the face we add the calculated normal to the corresponding entry in the normals array
       * (we use indices of the vertices to localize appropriate entries).
       * Then we loop through the normals array and normalize each normal.
       */

      for (var kn=0; kn<=300; kn++) {
        uniqueNormals[kn] = vec3(0.0, 0.0, 0.0);
      }
      // Index tube connecting top and bottom
      for (var k=1; k<=n-1; k++) {

        // Special handling to "wrap it up"
        if (k === n-1) {

          // first triangle
          ftn = computeNormal(uniqueVertices[k], uniqueVertices[1], uniqueVertices[k + offset]);
          indices.push(k);
          vertices.push(uniqueVertices[k]);
          // normals.push(ftn);
          uniqueNormals[k] = add(ftn, uniqueNormals[k]);

          indices.push(1);
          vertices.push(uniqueVertices[1]);
          // normals.push(ftn);
          uniqueNormals[1] = add(ftn, uniqueNormals[1]);

          indices.push(k + offset);
          vertices.push(uniqueVertices[k + offset]);
          // normals.push(ftn);
          uniqueNormals[k + offset] = add(ftn, uniqueNormals[k + offset]);

          // second triangle
          stn = computeNormal(uniqueVertices[1], uniqueVertices[1+offset], uniqueVertices[k+offset]);
          indices.push(1);
          vertices.push(uniqueVertices[1]);
          // normals.push(stn);
          uniqueNormals[1] = add(stn, uniqueNormals[1]);

          indices.push(1 + offset);
          vertices.push(uniqueVertices[1+offset]);
          // normals.push(stn);
          uniqueNormals[1 + offset] = add(stn, uniqueNormals[1 + offset]);

          indices.push(k + offset);
          vertices.push(uniqueVertices[k+offset]);
          // normals.push(stn);
          uniqueNormals[k + offset] = add(stn, uniqueNormals[k + offset]);

        } else {

          // first triangle
          ftn = computeNormal(uniqueVertices[k], uniqueVertices[k+1], uniqueVertices[k + 1 + offset]);
          indices.push(k);
          vertices.push(uniqueVertices[k]);
          // normals.push(ftn);
          uniqueNormals[k] = add(ftn, uniqueNormals[k]);

          indices.push(k+1);
          vertices.push(uniqueVertices[k+1]);
          // normals.push(ftn);
          uniqueNormals[k+1] = add(ftn, uniqueNormals[k+1]);

          indices.push(k + 1 + offset);
          vertices.push(uniqueVertices[k+1+offset]);
          // normals.push(ftn);
          uniqueNormals[k+1+offset] = add(ftn, uniqueNormals[k+1+offset]);

          // second triangle
          stn = computeNormal(uniqueVertices[k], uniqueVertices[k+1+offset], uniqueVertices[k+offset]);
          indices.push(k);
          vertices.push(uniqueVertices[k]);
          // normals.push(stn);
          uniqueNormals[k] = add(stn, uniqueNormals[k]);

          indices.push(k + 1 + offset);
          vertices.push(uniqueVertices[k+1+offset]);
          // normals.push(stn);
          uniqueNormals[k+1+offset] = add(stn, uniqueNormals[k+1+offset]);

          indices.push(k + offset);
          vertices.push(uniqueVertices[k+offset]);
          // normals.push(stn);
          uniqueNormals[k+offset] = add(stn, uniqueNormals[k+offset]);
        }

      }

      for (var knn=1; knn<=n-1; knn++) {
        var curNormal = uniqueNormals[knn];
        var nn = normalize(curNormal);
        uniqueNormals[knn] = nn;
      }

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
