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

  var Cylinder = {

    generate: function() {
      var uniqueVertices = [],
        vertices = [],
        indices = [],
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

      // Index tube connecting top and bottom
      for (var k=1; k<=n-1; k++) {

        // Special handling to "wrap it up"
        if (k === n-1) {

          // first triangle
          ftn = triangleNormal(uniqueVertices[k], uniqueVertices[1], uniqueVertices[k + offset]);
          indices.push(k);
          vertices.push(uniqueVertices[k]);
          normals.push(ftn);

          indices.push(1);
          vertices.push(uniqueVertices[1]);
          normals.push(ftn);

          indices.push(k + offset);
          vertices.push(uniqueVertices[k + offset]);
          normals.push(ftn);

          // second triangle
          stn = triangleNormal(uniqueVertices[1], uniqueVertices[1+offset], uniqueVertices[k+offset]);
          indices.push(1);
          vertices.push(uniqueVertices[1]);
          normals.push(stn);

          indices.push(1 + offset);
          vertices.push(uniqueVertices[1+offset]);
          normals.push(stn);

          indices.push(k + offset);
          vertices.push(uniqueVertices[k+offset]);
          normals.push(stn);

        } else {

          // first triangle
          ftn = triangleNormal(uniqueVertices[k], uniqueVertices[k+1], uniqueVertices[k + 1 + offset]);
          indices.push(k);
          vertices.push(uniqueVertices[k]);
          normals.push(ftn);

          indices.push(k+1);
          vertices.push(uniqueVertices[k+1]);
          normals.push(ftn);

          indices.push(k + 1 + offset);
          vertices.push(uniqueVertices[k+1+offset]);
          normals.push(ftn);

          // second triangle
          stn = triangleNormal(uniqueVertices[k], uniqueVertices[k+1+offset], uniqueVertices[k+offset]);
          indices.push(k);
          vertices.push(uniqueVertices[k]);
          normals.push(stn);

          indices.push(k + 1 + offset);
          vertices.push(uniqueVertices[k+1+offset]);
          normals.push(stn);

          indices.push(k + offset);
          vertices.push(uniqueVertices[k+offset]);
          normals.push(stn);
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
