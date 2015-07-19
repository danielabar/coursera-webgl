/**
 * DomUtils
 */
(function(window) {
  'use strict';

  var DomUtils = {

    getCheckedValue: function(id) {
      var checkedVal,
        values = document.getElementsByName(id);

      for (var i = 0; i < values.length; i++) {
        if (values[i].checked) {
            checkedVal = values[i].value;
            break;
        }
      }

      return checkedVal;
    }

  };

  window.DomUtils = DomUtils;

})(window);

/**
 * Maxwell
 */
(function(window, DomUtils) {
  'use strict';

  var DEFAULT_FILL_OPT = 1.0;

  var gl;
  var _program;
  var _fill = DEFAULT_FILL_OPT;

  var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, 3 );
  };

  var updateTriangle = function() {
    _fill = DomUtils.getCheckedValue('fill');

    var userOptionLoc = gl.getUniformLocation(_program, 'fUserOption');
    gl.uniform1f(userOptionLoc, _fill);

    render();
  };

  var Maxwell = {

    init: function() {
      document.getElementById('settings').addEventListener('change', updateTriangle);

      var canvas = document.getElementById( 'gl-canvas' );
      gl = WebGLUtils.setupWebGL( canvas );
      if ( !gl ) { alert( 'WebGL isn\'t available' ); }

      // Setup data
      var vertices = [-1, -1, 0, 1, 1, -1];

      // Configure WebGL
      gl.viewport( 0, 0, canvas.width, canvas.height );
      gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

      // Load shaders
      _program = initShaders( gl, 'vertex-shader', 'fragment-shader' );
      gl.useProgram( _program );

      // Load vertex data into the GPU
      var bufferId = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
      gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

      // Associate shader variables with vertex data buffer
      var vPosition = gl.getAttribLocation( _program, 'vPosition' );
      gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
      gl.enableVertexAttribArray( vPosition );

      // Load color data into the GPU
      var colors = [1, 0, 0, 0, 1, 0, 0, 0, 1];
      var cbufferId = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, cbufferId );
      gl.bufferData (gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

      // Associate shader variables with color data buffer
      var vColor = gl.getAttribLocation( _program, 'vColor' );
      gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
      gl.enableVertexAttribArray( vColor );

      updateTriangle();
    }

  };

  window.Maxwell = Maxwell;

}(window, window.DomUtils || (window.DomUtils = {})));

/**
 * App Init
 */
(function(Maxwell) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    Maxwell.init();
  });

}(window.Maxwell || (window.Maxwell = {})));
