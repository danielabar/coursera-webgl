var gl;       // WebGL context

var render = function(clear, bufferId, program, numVerticies) {
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

  gl.drawArrays( gl.TRIANGLES, 0, numVerticies );
};

window.onload = function init() {

  // Initialize WebGL context
  var canvas = document.getElementById( 'gl-canvas' );
  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( 'WebGL isnt available' ); }

  // Setup canvas
  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor( 0.15, 0.17, 0.15, 0.4 );

  // Load shaders
  var program = initShaders( gl, 'vertex-shader', 'fragment-shader' );
  gl.useProgram( program );

  // Load a rectangle onto the GPU (composed of two triangles, points of second triangle start where first one left off)
  var rectangle = new Float32Array([
    -1, -1, -1, 1, 1, 1,
    1, 1, 1, -1, -1, -1
  ]);
  var bufferId = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
  gl.bufferData( gl.ARRAY_BUFFER, rectangle, gl.STATIC_DRAW );

  render(true, bufferId, program, rectangle.length/2);
};
