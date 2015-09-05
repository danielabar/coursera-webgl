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
        imageData = new Uint8Array(4*texSize*texSize);

      for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
          var patchx = Math.floor(i/(texSize/numChecks));
          var patchy = Math.floor(j/(texSize/numChecks));

          var myVar = getRandomInt(0, 155);
          var myVar2 = getRandomInt(156, 255);

          if (patchx%2 ^ patchy%2) {
            // c = 255;
            c = myVar;
          } else {
            // c = 0;
            c = myVar2;
          }

          imageData[4*i*texSize+4*j] = getRandomInt(0, 255);
          imageData[4*i*texSize+4*j+1] = getRandomInt(0, 255);
          imageData[4*i*texSize+4*j+2] = getRandomInt(0, 255);
          // imageData[4*i*texSize+4*j] = c;
          // imageData[4*i*texSize+4*j+1] = c;
          // imageData[4*i*texSize+4*j+2] = c;
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
