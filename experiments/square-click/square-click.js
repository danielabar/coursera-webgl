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

  // FIXME First click is not drawing a square
  var addSquare = function(evt) {
    evt.preventDefault();

    var bottomLeftX = evt.clientX;
    var bottomLeftY = evt.clientY + SIZE_PX;

    var bottomRightX = evt.clientX + SIZE_PX;
    var bottomRightY = evt.clientY + SIZE_PX;

    var topRightX = evt.clientX + SIZE_PX;
    var topRightY = evt.clientY;

    var topLeftX = evt.clientX;
    var topLeftY = evt.clientY;

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
    _numDrawn += 1;
  };

  var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, _numDrawn * 6 );
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
