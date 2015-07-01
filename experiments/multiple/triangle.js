var gl;       // WebGL context

var render = function(clear, bufferId, program) {
  var vPosition;

  // Clear canvas if requested
  if (clear) {
    gl.clear( gl.COLOR_BUFFER_BIT );
  }

  // Outer program already calls this, but still needed here again
  gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );

  // Associate shader variables with data buffer
  vPosition = gl.getAttribLocation( program, 'vPosition' );
  gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );

  // Draw triangle
  gl.drawArrays( gl.TRIANGLES, 0, 3 );
};

window.onload = function init() {

  // Initialize WebGL context
  var canvas = document.getElementById( 'gl-canvas' );
  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( 'WebGL isnt available' ); }

  // Setup canvas
  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor( 0.15, 0.17, 0.15, 0.8 );

  // Load shaders
  var program = initShaders( gl, 'vertex-shader', 'fragment-shader' );
  gl.useProgram( program );

  // Load triangle 1 onto the GPU
  var triangle1 = new Float32Array([-1, -1, 0, 0, 1, -1]);
  var bufferId1 = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, bufferId1 );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(triangle1), gl.STATIC_DRAW );

  // Load triangle 2 onto the GPU
  var triangle2 = new Float32Array([-1, 1, 0, 0, 1, 1]);
  var bufferId2 = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, bufferId2 );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(triangle2), gl.STATIC_DRAW );

  // Draw the triangles
  render(true, bufferId1, program);
  render(false, bufferId2, program);
};
