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
      * https://en.wikibooks.org/wiki/OpenGL_Programming/Bounding_box
      */
    boundingBox: function(verteces) {
      var minP = {x: 0.0, y: 0.0, z: 0.0},
        maxP = {x: 0.0, y: 0.0, z: 0.0},
        curX, curY, curZ;

      for (var i=0; i<verteces.length-3; i+=3) {
        curX = verteces[i];
        curY = verteces[i+1];
        curZ = verteces[i+2];

        if (curX < minP.x) { minP.x = curX; }
        if (curY < minP.y) { minP.y = curY; }
        if (curZ < minP.z) { minP.z = curZ; }
        if (curX > maxP.x) { maxP.x = curX; }
        if (curY > maxP.y) { maxP.y = curX; }
        if (curZ > maxP.z) { maxP.z = curX; }
      }

      var bbSize = {
        x: maxP.x - minP.x,
        y: maxP.y - minP.y,
        z: maxP.z - minP.z
      };

      var bbCenter = {
        x: (minP.x + maxP.x)/2,
        y: (minP.y + maxP.y)/2,
        z: (minP.z + maxP.z)/2
      };

      var unitCube = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
      ];

      var indices = [
        1, 0, 3,
        3, 2, 1,
        2, 3, 7,
        7, 6, 2,
        3, 0, 4,
        4, 7, 3,
        6, 5, 1,
        1, 2, 6,
        4, 5, 6,
        6, 7, 4,
        5, 4, 0,
        0, 1, 5
      ];

      return {
        v: unitCube,
        i: indices,
        s: [bbSize.x, bbSize.y, bbSize.z],
        t: [bbCenter.x, bbCenter.y, bbCenter.z]
      };
    }

  };

  window.Shape = Shape;

})(window);
