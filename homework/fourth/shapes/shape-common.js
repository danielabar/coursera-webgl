/**
 * ShapeCommon
 */
(function(window) {
  'use strict';

  var ShapeCommon = {

    createNgon: function (n, startAngle, z) {
      var vertices = [],
  		  dA = Math.PI*2 / n,
        r = 0.9,
        angle,
        x, y;

      for (var i=0; i < n; i++) {
        angle = startAngle + dA*i;
        x = r * Math.cos(angle);
        y = r * Math.sin(angle);
        vertices.push(vec4(x, y, z, 1.0));
      }
      return vertices;
    },

    triangleNormal: function(a, b, c) {
      var t1 = subtract(b, a),
        t2 = subtract(c, a),
        normal = normalize(cross(t2, t1));

      normal = vec3(normal);
      return normal;
    },

    computeNormal: function (a, b, c){
      var t1 = subtract(b, a);
      var t2 = subtract(c, a);
      var normal = vec3(cross(t2, t1));
      return normal;
    }
    // computeNormal: function (a, b, c){
    //   var t1 = subtract(b, a);
    //   var t2 = subtract(c, b);
    //   var normal = vec3(cross(t1, t2));
    //   return normal;
    // }

  };

  window.ShapeCommon = ShapeCommon;

})(window);
