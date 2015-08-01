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
        startAngle = 1;

      bottomCap.push(0.0);
      bottomCap.push(0.0);
      bottomCap.push(0.0);
      bottomCap = bottomCap.concat(ShapeCommon.createNgon(n, startAngle, 0.0));

      topCap.push(0.0);
      topCap.push(0.0);
      topCap.push(-1.0);
      topCap = topCap.concat(ShapeCommon.createNgon(n, startAngle, -1.0));

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

      /**
       * let circle1 be lower and circle2 be upper circle ,
       * for each point on ith index in circle 1
       * 1st triangle{ circle1[i], circle1[i+1], circle2[i]}
       * second triangle {circle1[i+1], circle2[i] , circle2[i+1] }
       * make sure last connects to first (wrapped).
       */
      // Index tube connecting top and bottom
      for (var k=1; k<n-1; k++) {

        // if (k === n) {
        //   // first triangle
        //   indices.push(k);
        //   indices.push(1);
        //   indices.push(offset);
        //
        //   // second triangle
        //   indices.push(1);
        //   indices.push(k + offset);
        //   indices.push(1 + offset);
        // }

        // first triangle
        indices.push(k);
        indices.push(k+1);
        indices.push(k + 1 + offset);

        // second triangle
        indices.push(k);
        indices.push(k + offset);
        indices.push(k+1 + offset);
      }

      return {
        v: vertices,
        i: indices
      };
    }

  };

  window.Cylinder = Cylinder;

})(window, window.ShapeCommon);
