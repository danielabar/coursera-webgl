/**
 * Transformer
 */
(function(window) {
  'use strict';

  var windowToClipX = function(clientX, width) {
    var numerator = 2 * clientX;
    var scaled = numerator / width;
    return -1 + scaled;
  };

  var windowToClipY = function(clientY, height) {
    var numerator = 2 * (height - clientY);
    var scaled = numerator / height;
    return -1 + scaled;
  };

  var Transformer = {

    // http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
    getRelativeCoords: function(event) {
      if (event.offsetX !== undefined && event.offsetY !== undefined) {
        return { x: event.offsetX, y: event.offsetY };
      } else {
        return { x: event.layerX, y: event.layerY };
      }
    },

    windowToClip: function(clientX, clientY, width, height) {
      var clipX = windowToClipX(clientX, width);
      var clipY = windowToClipY(clientY, height);
      return vec2(clipX, clipY);
    }

  };

  window.Transformer = Transformer;

})(window);

/**
 * App
 */
(function(window, Transformer) {
  'use strict';

  var SIZE_PX = 10;

  var gl,
    _program,
    _vBuffer,
    _canvas,
    _numDrawn = 0;

  var addSquare = function(evt) {
    evt.preventDefault();

    var canvasPoint = Transformer.getRelativeCoords(evt);

    var bottomLeftX = canvasPoint.x;
    var bottomLeftY = canvasPoint.y + SIZE_PX;

    var bottomRightX = canvasPoint.x + SIZE_PX;
    var bottomRightY = canvasPoint.y + SIZE_PX;

    var topRightX = canvasPoint.x + SIZE_PX;
    var topRightY = canvasPoint.y;

    var topLeftX = canvasPoint.x;
    var topLeftY = canvasPoint.y;

    // 6 vertexes -> 2 triangles -> 1 square!
    var verteces = [
      Transformer.windowToClip(bottomLeftX, bottomLeftY, _canvas.width, _canvas.height),
      Transformer.windowToClip(bottomRightX, bottomRightY, _canvas.width, _canvas.height),
      Transformer.windowToClip(topRightX, topRightY, _canvas.width, _canvas.height),

      Transformer.windowToClip(topRightX, topRightY, _canvas.width, _canvas.height),
      Transformer.windowToClip(topLeftX, topLeftY, _canvas.width, _canvas.height),
      Transformer.windowToClip(bottomLeftX, bottomLeftY, _canvas.width, _canvas.height)
    ];

    var offset = sizeof.vec2 * 6 * _numDrawn;

    gl.bindBuffer(gl.ARRAY_BUFFER, _vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, offset, flatten(verteces));

    render();
    _numDrawn++;
  };

  var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, _numDrawn * 6 );
    window.requestAnimationFrame(render);
  };

  var App = {

    init: function() {

      // Setup canvas
      _canvas = document.getElementById('gl-canvas');
      gl = WebGLUtils.setupWebGL( _canvas );
      if ( !gl ) { alert( 'WebGL isn\'t available' ); }
      _canvas.addEventListener('click', addSquare);

      // Configure WebGL
      gl.viewport( 0, 0, _canvas.width, _canvas.height );
      gl.clearColor(0.0, 0.0, 0.0, 1.0);

      // Load shaders
      _program = initShaders( gl, 'vertex-shader', 'fragment-shader' );
      gl.useProgram( _program );

      // Load an empty buffer onto the GPU
      _vBuffer = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, _vBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(3, 6), gl.STATIC_DRAW );

      // Associate shader variables with vertex data buffer
      var vPosition = gl.getAttribLocation( _program, 'vPosition' );
      gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
      gl.enableVertexAttribArray( vPosition );

      render();
    }

  };

  window.App = App;

}(window, window.Transformer || (window.Transformer = {})));

/**
 * App Init
 */
(function(App) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    App.init();
  });

}(window.App || (window.App = {})));
