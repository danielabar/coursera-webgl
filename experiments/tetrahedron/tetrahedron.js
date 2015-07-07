(function(window) {
  'use strict';

  var gl;

  var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, 3 );
  };

  var Tetrahedron = {

    init: function() {
      var canvas = document.getElementById( 'gl-canvas' );
      gl = WebGLUtils.setupWebGL( canvas );
      if ( !gl ) { alert( 'WebGL isn\'t available' ); }

      // Setup data
      var vertices = [-1, -1, 0, 1, 1, -1];

      //  Configure WebGL
      gl.viewport( 0, 0, canvas.width, canvas.height );
      gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

      //  Load shaders and initialize attribute buffers
      var program = initShaders( gl, 'vertex-shader', 'fragment-shader' );
      gl.useProgram( program );

      // Load the data into the GPU
      var bufferId = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
      gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

      // Associate shader variables with data buffer
      var vPosition = gl.getAttribLocation( program, 'vPosition' );
      gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
      gl.enableVertexAttribArray( vPosition );

      render();
    }

  };

  window.Tetrahedron = Tetrahedron;

})(window);

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    window.Tetrahedron.init();
  });

})();
