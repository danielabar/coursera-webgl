'use strict';

var gl;
var program;

var originalTriangle = [
  vec2(-0.5, -0.5),
  vec2(0, 0.5),
  vec2(0.5, -0.5)
];

var render = function() {
  gl.clear( gl.COLOR_BUFFER_BIT );
  gl.drawArrays( gl.TRIANGLES, 0, 3 );
};

var loadBuffer = function(data) {
  // load data onto gpu
  var bufferId = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(data), gl.STATIC_DRAW );

  // associate shader variables with data buffer
  var vPosition = gl.getAttribLocation( program, 'vPosition' );
  gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );
};

var calculateRotation = function(vec2Point, theta) {
  var originalX = vec2Point[0];
  var originalY = vec2Point[1];
  var newX = (originalX * Math.cos(theta)) - (originalY * Math.sin(theta));
  var newY = (originalX * Math.sin(theta)) + (originalY * Math.cos(theta));
  return vec2(newX, newY);
};

var doRotate = function(evt) {
  evt.preventDefault();
  var input = document.getElementById('theta');

  if (input.checkValidity()) {
    var theta = input.valueAsNumber;
    var radians = (Math.PI / 180) * theta;

    var rotatedTriangle = [
      calculateRotation(originalTriangle[0], radians),
      calculateRotation(originalTriangle[1], radians),
      calculateRotation(originalTriangle[2], radians)
    ];

    loadBuffer(rotatedTriangle);
    render();
  }
};

var doReset = function(evt) {
  evt.preventDefault();
  loadBuffer(originalTriangle);
  render();
  document.getElementById('theta').value = 0;
};

window.onload = function init() {

  // register event handlers
  document.getElementById('theta').addEventListener('change', doRotate);
  document.getElementById('reset').addEventListener('click', doReset);

  // init
  var canvas = document.getElementById( 'gl-canvas' );
  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( 'WebGL isn\'t available' ); }

  // configure display
  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor( 0, 0, 0, 1.0 );

  // load shaders
  program = initShaders( gl, 'vertex-shader', 'fragment-shader' );
  gl.useProgram( program );

  // load the data into the GPU
  var bufferId = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(originalTriangle), gl.STATIC_DRAW );

  // associate shader variables with data buffer
  var vPosition = gl.getAttribLocation( program, 'vPosition' );
  gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );

  render();
};
