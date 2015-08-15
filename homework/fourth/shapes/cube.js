/**
 * Cube
 */
(function(window) {
  'use strict';

  var quad = function(a, b, c, d, vertices, pointsArray, normalsArray) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    normal = vec3(normal);
    normal = normalize(normal);


    pointsArray.push(vertices[a]);
    normalsArray.push(normal);

    pointsArray.push(vertices[b]);
    normalsArray.push(normal);

    pointsArray.push(vertices[c]);
    normalsArray.push(normal);

    pointsArray.push(vertices[a]);
    normalsArray.push(normal);

    pointsArray.push(vertices[c]);
    normalsArray.push(normal);

    pointsArray.push(vertices[d]);
    normalsArray.push(normal);
  };

  var makeCube = function(vertices, pointsArray, normalsArray) {
    quad( 1, 0, 3, 2, vertices, pointsArray, normalsArray );
    quad( 2, 3, 7, 6, vertices, pointsArray, normalsArray );
    quad( 3, 0, 4, 7, vertices, pointsArray, normalsArray );
    quad( 6, 5, 1, 2, vertices, pointsArray, normalsArray );
    quad( 4, 5, 6, 7, vertices, pointsArray, normalsArray );
    quad( 5, 4, 0, 1, vertices, pointsArray, normalsArray );
  };

  var Cube = {

    generate: function() {
      var uniqueVertices = [
          vec4( -0.5, -0.5,  0.5, 1.0 ),
          vec4( -0.5,  0.5,  0.5, 1.0 ),
          vec4( 0.5,  0.5,  0.5, 1.0 ),
          vec4( 0.5, -0.5,  0.5, 1.0 ),
          vec4( -0.5, -0.5, -0.5, 1.0 ),
          vec4( -0.5,  0.5, -0.5, 1.0 ),
          vec4( 0.5,  0.5, -0.5, 1.0 ),
          vec4( 0.5, -0.5, -0.5, 1.0 )
        ],
        pointsArray = [],
        normalsArray = [];

      makeCube(uniqueVertices, pointsArray, normalsArray);

      return {
        v: pointsArray,
        n: normalsArray
      };

    }

  };

  window.Cube = Cube;

})(window);
