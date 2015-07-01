var gl;       // WebGL context

var render = function() {
  gl.clear( gl.COLOR_BUFFER_BIT );
  gl.drawArrays( gl.TRIANGLES, 0, 3 );
};

window.onload = function init() {
  var canvas = document.getElementById( 'gl-canvas' );

  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( 'WebGL isnt available' ); }

  // Setup data
  var vertices = [-1, -1, 0, 1, 1, -1];

  //  Configure WebGL
  gl.viewport( 0, 0, canvas.width, canvas.height );

  // Set canvas background color
  gl.clearColor( 0.15, 0.17, 0.15, 0.8 );

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
};
