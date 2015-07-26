/**
 * App
 */
(function(window, CoordUtils, ColorUtils) {
  'use strict';

  var _gl,
    _program,
    _canvas,
    _verteces,
    _colors;

  var render = function() {
    _gl.clear( _gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);
    _gl.drawArrays( _gl.TRIANGLES, 0, _verteces.length );
  };

  var setupVerteces = function() {
    _verteces = [
      vec2(-1, -1),
      vec2(0, 1),
      vec2(1, -1)
    ];
  };

  var setupColors = function() {
    _colors = [
      vec3(1, 0, 0),
      vec3(0, 1, 0),
      vec3(0, 0, 1)
    ];
  };

  var App = {

    init: function() {

      // Setup canvas
      _canvas = document.getElementById('gl-canvas');
      _gl = WebGLUtils.setupWebGL( _canvas, {preserveDrawingBuffer: true} );
      if ( !_gl ) { alert( 'WebGL isn\'t available' ); }

      // Configure WebGL
      _gl.viewport( 0, 0, _canvas.width, _canvas.height );
      _gl.clearColor(0.0, 0.0, 0.0, 1.0);
      _gl.enable(_gl.DEPTH_TEST);

      // Load shaders
      _program = initShaders( _gl, 'vertex-shader', 'fragment-shader' );
      _gl.useProgram( _program );

      // Define data
      setupVerteces();
      setupColors();

      // Load vertex data into the GPU
      var bufferId = _gl.createBuffer();
      _gl.bindBuffer( _gl.ARRAY_BUFFER, bufferId );
      _gl.bufferData( _gl.ARRAY_BUFFER, flatten(_verteces), _gl.STATIC_DRAW );

      // Associate shader variables with vertex data buffer
      var vPosition = _gl.getAttribLocation( _program, 'vPosition' );
      _gl.vertexAttribPointer( vPosition, 2, _gl.FLOAT, false, 0, 0 );
      _gl.enableVertexAttribArray( vPosition );

      // Load color data into the GPU
      var cbufferId = _gl.createBuffer();
      _gl.bindBuffer( _gl.ARRAY_BUFFER, cbufferId );
      _gl.bufferData (_gl.ARRAY_BUFFER, flatten(_colors), _gl.STATIC_DRAW );

      // Associate shader variables with color data buffer
      var vColor = _gl.getAttribLocation( _program, 'vColor' );
      _gl.vertexAttribPointer( vColor, 3, _gl.FLOAT, false, 0, 0 );
      _gl.enableVertexAttribArray( vColor );

      render();
    }

  };

  window.App = App;

}(window, window.CoordUtils, window.ColorUtils));


/**
 * App Init
 */
(function(App) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    App.init();
  });

}(window.App || (window.App = {})));
