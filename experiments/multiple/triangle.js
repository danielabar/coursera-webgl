var gl;       // WebGL context

/*var render = function() {
  gl.clear( gl.COLOR_BUFFER_BIT );
  gl.drawArrays( gl.TRIANGLES, 0, 3 );
};
*/

window.onload = function init() {
  var canvas = document.getElementById( 'gl-canvas' );

  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( 'WebGL isnt available' ); }

  // Setup data
  var triangle1 = new Float32Array([-1, -1, 0, 1, 1, -1]);
  var triangle2 = new Float32Array([-1, 1, 0, -1, 1, 1]);

  //  Configure WebGL
  gl.viewport( 0, 0, canvas.width, canvas.height );

  // Set canvas background color
  gl.clearColor( 0.15, 0.17, 0.15, 0.8 );

  //  Load shaders and initialize attribute buffers
  var program = initShaders( gl, 'vertex-shader', 'fragment-shader' );
  gl.useProgram( program );

  // Load triangle 1 onto the GPU
  var bufferId1 = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, bufferId1 );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(triangle1), gl.STATIC_DRAW );

  // Load triangle 2 onto the GPU
  var bufferId2 = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, bufferId2 );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(triangle2), gl.STATIC_DRAW );

  // Prepare canvas for drawing
  gl.clear( gl.COLOR_BUFFER_BIT );

  // Render first triangle
  gl.bindBuffer( gl.ARRAY_BUFFER, bufferId1 );

  // Associate shader variables with data buffer for first triangle
  var vPosition1 = gl.getAttribLocation( program, 'vPosition' );
  gl.vertexAttribPointer( vPosition1, 2, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition1 );

  // Draw first triangle
  gl.drawArrays( gl.TRIANGLES, 0, 3 );

  // Render second triangle
  gl.bindBuffer( gl.ARRAY_BUFFER, bufferId2 );

  // Associate shader variables with data buffer for second triangle
  var vPosition2 = gl.getAttribLocation( program, 'vPosition' );
  gl.vertexAttribPointer( vPosition2, 2, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition2 );

  // Draw second triangle
  gl.drawArrays( gl.TRIANGLES, 0, 3 );

};
