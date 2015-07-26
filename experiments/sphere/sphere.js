/**
 * App
 */
(function(window) {
  'use strict';

  var _gl,
    _program,
    _canvas,
    _vertices,
    _vertexColors,
    _indices;

  // a cube for now, to verify drawElements implementation
  var drawSphere = function() {
    _vertices = [
      vec3( -0.5, -0.5,  0.5 ),
      vec3( -0.5,  0.5,  0.5 ),
      vec3(  0.5,  0.5,  0.5 ),
      vec3(  0.5, -0.5,  0.5 ),
      vec3( -0.5, -0.5, -0.5 ),
      vec3( -0.5,  0.5, -0.5 ),
      vec3(  0.5,  0.5, -0.5 ),
      vec3(  0.5, -0.5, -0.5 )
    ];

    _vertexColors = [
      vec4( 0.0, 0.0, 0.0, 1.0 ),
      vec4( 1.0, 0.0, 0.0, 1.0 ),
      vec4( 1.0, 1.0, 0.0, 1.0 ),
      vec4( 0.0, 1.0, 0.0, 1.0 ),
      vec4( 0.0, 0.0, 1.0, 1.0 ),
      vec4( 1.0, 0.0, 1.0, 1.0 ),
      vec4( 1.0, 1.0, 1.0, 1.0 ),
      vec4( 0.0, 1.0, 1.0, 1.0 )
    ];

    _indices = [
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
  };

  var render = function() {
    _gl.clear( _gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);
    _gl.drawElements( _gl.TRIANGLES, _indices.length, _gl.UNSIGNED_BYTE, 0 );
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

      // Initialize data arrays
      drawSphere();

      // Load shaders
      _program = initShaders( _gl, 'vertex-shader', 'fragment-shader' );
      _gl.useProgram( _program );

      // Load index data onto GPU
      var iBuffer = _gl.createBuffer();
      _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, iBuffer);
      _gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(_indices), _gl.STATIC_DRAW);

      // Load color data buffer onto GPU
      var cBuffer = _gl.createBuffer();
      _gl.bindBuffer( _gl.ARRAY_BUFFER, cBuffer );
      _gl.bufferData( _gl.ARRAY_BUFFER, flatten(_vertexColors), _gl.STATIC_DRAW );

      // Associate shader variables with color data buffer
      var vColor = _gl.getAttribLocation( _program, 'vColor' );
      _gl.vertexAttribPointer( vColor, 4, _gl.FLOAT, false, 0, 0 );
      _gl.enableVertexAttribArray( vColor );

      // Load vertex buffer onto GPU
      var vBuffer = _gl.createBuffer();
      _gl.bindBuffer( _gl.ARRAY_BUFFER, vBuffer );
      _gl.bufferData( _gl.ARRAY_BUFFER, flatten(_vertices), _gl.STATIC_DRAW );

      // Associate shader variabels with vertex data buffer
      var vPosition = _gl.getAttribLocation( _program, 'vPosition' );
      _gl.vertexAttribPointer( vPosition, 3, _gl.FLOAT, false, 0, 0 );
      _gl.enableVertexAttribArray( vPosition );

      render();
    }

  };

  window.App = App;

}(window));


/**
 * App Init
 */
(function(App) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    App.init();
  });

}(window.App || (window.App = {})));
