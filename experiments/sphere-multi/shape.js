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
     *
        // min = minium coordinate of the box
        // max = maxium coordinate of the box
        Point min = V[0];
        Point max = V[0];
        for (i = 1; i < n; ++i)
        {
        if ( V[i].x < min.x ) min.x = V[i].x;
        if ( V[i].y < min.y ) min.y = V[i].y;
        if ( V[i].z < min.z ) min.z = V[i].z;
        if ( V[i].x > max.x ) max.x = V[i].x;
        if ( V[i].y > max.y ) max.y = V[i].y;
        if ( V[i].z > max.z ) max.z = V[i].z;
        }
     */
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

      return [
        vec3(minPoint.x, minPoint.y, minPoint.z),
        vec3(maxPoint.x, maxPoint.y, maxPoint.z)
      ];
    }

  };

  window.Shape = Shape;

})(window);
