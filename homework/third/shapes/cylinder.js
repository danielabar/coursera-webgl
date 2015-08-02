/**
 * Cylinder
 */
(function(window, ShapeCommon) {
  'use strict';

  var Cylinder = {

    generate: function() {
      var vertices = [],
        indices = [],
        bottomCap = [],
        topCap = [],
        n = 30,
        startAngle = 0;

      bottomCap.push(0.0);
      bottomCap.push(0.0);
      bottomCap.push(0.0);
      bottomCap = bottomCap.concat(ShapeCommon.createNgon(n, startAngle, 0.0));

      topCap.push(0.0);
      topCap.push(0.0);
      topCap.push(-1.9);
      topCap = topCap.concat(ShapeCommon.createNgon(n, startAngle, -1.9));

      vertices = bottomCap.concat(topCap);

      // Index bottom cap
      for (var i=0; i<n; i++) {
        if (i === n-1) {
          indices.push(0);
          indices.push(n);
          indices.push(1);
        } else {
          indices.push(0);
          indices.push(i+1);
          indices.push(i+2);
        }
      }

      // Index top cap
      var offset = n+1;
      for (var j=0; j<n; j++) {
        if (j === n-1) {
          indices.push(offset);
          indices.push(n + offset);
          indices.push(1 + offset);
        } else {
          indices.push(offset);
          indices.push(j+1 + offset);
          indices.push(j+2 + offset);
        }
      }

      // Index tube connecting top and bottom
      for (var k=1; k<=n-1; k++) {

        // Special handling to "wrap it up"
        if (k === n-1) {

          // first triangle
          indices.push(k);
          indices.push(1);
          indices.push(k + offset);

          // second triangle
          indices.push(k);
          indices.push(1 + offset);
          indices.push(k + offset);

        } else {

          // first triangle
          indices.push(k);
          indices.push(k+1);
          indices.push(k + 1 + offset);

          // second triangle
          indices.push(k);
          indices.push(k + offset);
          indices.push(k + 1 + offset);
        }

      }

      return {
        v: vertices,
        i: indices
      };
    }

  };

  window.Cylinder = Cylinder;

})(window, window.ShapeCommon);
