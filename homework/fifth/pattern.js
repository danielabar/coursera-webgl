/**
 * Pattern
 */
(function(window) {
  'use strict';

  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  var Pattern = {

    checkerboard: function(texSize, numChecks) {
      var c,
        imageData = new Uint8Array(4*texSize*texSize),
        patchx, patchy;

      for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
          patchx = Math.floor(i/(texSize/numChecks));
          patchy = Math.floor(j/(texSize/numChecks));

          if (patchx%2 ^ patchy%2) {
            c = 255;
          } else {
            c = 0;
          }

          imageData[4*i*texSize+4*j] = c;
          imageData[4*i*texSize+4*j+1] = c;
          imageData[4*i*texSize+4*j+2] = c;
          imageData[4*i*texSize+4*j+3] = 255;
        }
      }

      return imageData;
    },

    confetti: function(texSize, numChecks) {
      var c,
        imageData = new Uint8Array(4*texSize*texSize),
        patchx,
        patchy;

      for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
          patchx = Math.floor(i/(texSize/numChecks));
          patchy = Math.floor(j/(texSize/numChecks));

          // if (patchx%2 ^ patchy%2) {
          //   c = myVar;
          // } else {
          //   c = myVar2;
          // }

          imageData[4*i*texSize+4*j] = getRandomInt(0, 255);
          imageData[4*i*texSize+4*j+1] = getRandomInt(0, 255);
          imageData[4*i*texSize+4*j+2] = getRandomInt(0, 255);
          imageData[4*i*texSize+4*j+3] = 255;
        }
      }

      return imageData;
    },

    stripe: function(texSize) {
      var c,
        imageData = new Uint8Array(4*texSize*texSize),
        numChecksX = 30,
        numChecksY = 1,
        patchx,
        patchy;

      for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
          patchx = Math.floor(i/(texSize/numChecksX));
          patchy = Math.floor(j/(texSize/numChecksY));

          if (patchx%2 ^ patchy%2) {
            c = [0, 0, getRandomInt(100, 255)];
          } else {
            c = [getRandomInt(100, 255), 0, 0];
          }

          imageData[4*i*texSize+4*j] = c[0];
          imageData[4*i*texSize+4*j+1] = c[1];
          imageData[4*i*texSize+4*j+2] = c[2];
          imageData[4*i*texSize+4*j+3] = 255;
        }
      }

      return imageData;
    },

    sinusoid: function(texSize) {
      var imageData = new Uint8Array(4*texSize*texSize);

      for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
          imageData[4*i*texSize+4*j] = 127+127*Math.sin(0.1*i*j);
          imageData[4*i*texSize+4*j+1] = 127+127*Math.sin(0.1*i*j);
          imageData[4*i*texSize+4*j+2] = 127+127*Math.sin(0.1*i*j);
          imageData[4*i*texSize+4*j+3] = 255;
        }
      }
    }

  };

  window.Pattern = Pattern;

})(window);
