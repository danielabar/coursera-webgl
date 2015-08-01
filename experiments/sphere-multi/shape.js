/**
 * Shape
 */
(function(window) {
  'use strict';

  var Shape = {

    generate: function(shapeName) {
      return window[shapeName].generate();
    },

     /**
      * https://www.opengl.org/discussion_boards/showthread.php/163788-How-to-creat-the-bounding-box
      */
    boundingBox: function(verteces) {
      var minPoint = {x: 0.0, y: 0.0, z: 0.0},
        maxPoint = {x: 0.0, y: 0.0, z: 0.0},
        curX, curY, curZ;

      for (var i=0; i<verteces.length-3; i+=3) {
        curX = verteces[i];
        curY = verteces[i+1];
        curZ = verteces[i+2];

        if (curX < minPoint.x) { minPoint.x = curX; }
        if (curY < minPoint.y) { minPoint.y = curY; }
        if (curZ < minPoint.z) { minPoint.z = curZ; }
        if (curX > maxPoint.x) { maxPoint.x = curX; }
        if (curY > maxPoint.y) { maxPoint.y = curX; }
        if (curZ > maxPoint.z) { maxPoint.z = curX; }
      }

      /**
       * x1 = ?  ;  y1 = ? ;    // First diagonal point
  x2 = ?  ;  y2 = ? ;    // Second diagonal point

  xc = (x1 + x2)/2  ;  yc = (y1 + y2)/2  ;    // Center point
  xd = (x1 - x2)/2  ;  yd = (y1 - y2)/2  ;    // Half-diagonal

  x3 = xc - yd  ;  y3 = yc + xd;    // Third corner
  x4 = xc + yd  ;  y4 = yc - xd;    // Fourth corner
       */
      var centerPointX = (minPoint.x + maxPoint.x) / 2;
      var centerPointY = (minPoint.y + maxPoint.y) / 2;

      var halfDiagonalX = (minPoint.x - maxPoint.x) / 2;
      var halfDiagonalY = (minPoint.y - maxPoint.y) / 2;

      var thirdCornerX = (centerPointX - halfDiagonalY);
      var thirdCornerY = (centerPointY + halfDiagonalX);

      var fourthCornerX = (centerPointX + halfDiagonalY);
      var fourthCornerY = (centerPointY - halfDiagonalX);

      return [
        vec3(minPoint.x, minPoint.y, minPoint.z),
        vec3(thirdCornerX, thirdCornerY, minPoint.z),
        vec3(maxPoint.x, maxPoint.y, maxPoint.z),
        vec3(fourthCornerX, fourthCornerY, maxPoint.z)
      ];
    }

  };

  window.Shape = Shape;

})(window);
