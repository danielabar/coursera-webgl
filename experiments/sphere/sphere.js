/**
 * App
 */
(function(window) {
  'use strict';

  var gl,
    _program,
    _canvas,
    _vertices = [],
    _vertexColors = [],
    _indices = [],
    _theta = [30, 60, 0],
    _thetaLoc;

  // https://www.webkit.org/blog-files/webgl/Earth.html
  var drawSphere = function(radius) {
    var lats = 30,
      longs = 30;

      for (var latNumber = 0; latNumber <= lats; ++latNumber) {
        for (var longNumber = 0; longNumber <= longs; ++longNumber) {
            var theta = latNumber * Math.PI / lats;
            var phi = longNumber * 2 * Math.PI / longs;
            var sinTheta = Math.sin(theta);
            var sinPhi = Math.sin(phi);
            var cosTheta = Math.cos(theta);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;

            _vertices.push(radius * x);
            _vertices.push(radius * y);
            _vertices.push(radius * z);

            _vertexColors.push(vec4( Math.random(), Math.random(), Math.random(), 1.0 ));
        }
    }

    for (var latNumberI = 0; latNumberI < lats; ++latNumberI) {
        for (var longNumberI = 0; longNumberI < longs; ++longNumberI) {
            var first = (latNumberI * (longs+1)) + longNumberI;
            var second = first + longs + 1;
            _indices.push(first);
            _indices.push(second);
            _indices.push(first+1);

            _indices.push(second);
            _indices.push(second+1);
            _indices.push(first+1);
        }
    }

  };


  var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.drawElements( gl.TRIANGLES, _indices.length, gl.UNSIGNED_SHORT, 0 );
    gl.uniform3fv(_thetaLoc, _theta);
    gl.drawElements( gl.LINE_LOOP, _indices.length, gl.UNSIGNED_SHORT, 0 );
  };

  var App = {

    init: function() {

      // Setup canvas
      _canvas = document.getElementById('gl-canvas');
      gl = WebGLUtils.setupWebGL( _canvas, {preserveDrawingBuffer: true} );
      if ( !gl ) { alert( 'WebGL isn\'t available' ); }

      // Configure WebGL
      gl.viewport( 0, 0, _canvas.width, _canvas.height );
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.enable(gl.DEPTH_TEST);

      // Initialize data arrays
      drawSphere(0.8);

      // Load shaders
      _program = initShaders( gl, 'vertex-shader', 'fragment-shader' );
      gl.useProgram( _program );

      // Load index data onto GPU
      var iBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(_indices), gl.STATIC_DRAW);

      // Load color data buffer onto GPU
      var cBuffer = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, flatten(_vertexColors), gl.STATIC_DRAW );

      // Associate shader variables with color data buffer
      var vColor = gl.getAttribLocation( _program, 'vColor' );
      gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
      gl.enableVertexAttribArray( vColor );

      // Load vertex buffer onto GPU
      var vBuffer = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, flatten(_vertices), gl.STATIC_DRAW );

      // Associate shader variables with vertex data buffer
      var vPosition = gl.getAttribLocation( _program, 'vPosition' );
      gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
      gl.enableVertexAttribArray( vPosition );

      // Uniform vars for user specified parameters
      _thetaLoc = gl.getUniformLocation(_program, 'theta');

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
