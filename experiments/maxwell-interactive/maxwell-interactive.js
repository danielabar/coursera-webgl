(function(window) {
  'use strict';

  var gl;
  var _program;
  var _fill;

  var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, 3 );
  };

  var updateTriangle = function(evt) {
    evt.preventDefault();
    var fills = document.getElementsByName('fill');
    for (var i = 0; i < fills.length; i++) {
      if (fills[i].checked) {
          _fill = fills[i].value;
          break;
      }
    }
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

      //  Configure WebGL
      gl.viewport( 0, 0, canvas.width, canvas.height );
      gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

      //  Load shaders and initialize attribute buffers
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

      render();
    }

  };

  window.Maxwell = Maxwell;

})(window);

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    window.Maxwell.init();
  });

})();
