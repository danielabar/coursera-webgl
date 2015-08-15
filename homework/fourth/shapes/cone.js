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
        ftn, stn;

      bottomCap.push(0.0);
      bottomCap.push(0.0);
      bottomCap.push(0.0);
      bottomCap = bottomCap.concat(ShapeCommon.createNgon(n, startAngle, 0.0));

      topPoint.push(0.0);
      topPoint.push(0.0);
      topPoint.push(1.9);

      uniqueVertices = bottomCap.concat(topPoint);

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

      // Join top point to bottom cap
      for (var j=1; j<=n; j++) {
        if (j === n) {
          indices.push(n+1);
          indices.push(j);
          indices.push(1);
        } else {
          indices.push(n+1);
          indices.push(j);
          indices.push(j+1);
        }
      }

      return {
        v: uniqueVertices,
        i: indices
      };

    }

  };

  window.Cone = Cone;

})(window, window.ShapeCommon);
