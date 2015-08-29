/**
 * App
 */
(function(window, Sphere) {
  'use strict';

  var gl,
    canvas,
    program,
    shape,
    theta = [45.0, 45.0, 45.0],
    modelMatrix = mat4(),
    viewMatrix = mat4(),
    modelViewMatrix = mat4(),
    projectionMatrix = mat4(),
    shapeColor = vec4(1.0, 0.0, 0.0, 1.0),
    texture,
    mouseDown = false,
    lastMouseX = null,
    lastMouseY = null;

  var configureTexture = function(image) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
  };

  var adjustCanvas = function() {
    var width = canvas.clientWidth,
      height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    // projectionMatrix = perspective(fov, (width/height), near, far);
    // gl.uniformMatrix4fv(uProjection, false, flatten(perspective));
  };

  var rotateModelView = function() {
    theta[0] += 1.0;
    theta[1] += 0.1;
    modelViewMatrix = buildModelViewMatrix();
  };

  var render = function() {
    adjustCanvas();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    rotateModelView();
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'modelViewMatrix' ), false, flatten(modelViewMatrix) );

    // if switch to perspective then this will be done in adjustCanvas
    gl.uniformMatrix4fv(gl.getUniformLocation( program, 'projectionMatrix' ), false, flatten(projectionMatrix) );

    gl.drawElements(gl.TRIANGLES, shape.indices.length, gl.UNSIGNED_SHORT, 0);

    setTimeout(
      function () {requestAnimFrame( render );},
      1000 / 60
    );
  };

  var buildProjectionMatrix = function() {
    var far = 10;
    var left = -3.0;
    var right = 3.0;
    var bottom = -3.0;
    var ytop =3.0;
    var near = -10;
    return ortho(left, right, bottom, ytop, near, far);
  };

  var buildViewMatrix = function() {
    var radius = 0.0;
    var theta  = radians(1.0);
    var phi    = radians(1.0);
    var at = vec3(0.0, 0.0, 0.0);
    var up = vec3(0.0, 1.0, 0.0);
    var eye = vec3(
      radius*Math.sin(theta)*Math.cos(phi),
      radius*Math.sin(theta)*Math.sin(phi),
      radius*Math.cos(theta)
    );
    return lookAt(eye, at, up);
  };

  var buildModelViewMatrix = function() {
    var modelMatrix = mat4();

    modelMatrix = mult(modelMatrix, rotate(theta[0], [1, 0, 0] ));
    modelMatrix = mult(modelMatrix, rotate(theta[1], [0, 1, 0] ));
    modelMatrix = mult(modelMatrix, rotate(theta[2], [0, 0, 1] ));

    return mult(modelMatrix, viewMatrix);
  };

  // var handleMouseDown = function(evt) {
  //   mouseDown = true;
  //   lastMouseX = evt.clientX;
  //   lastMouseY = evt.clientY;
  // };
  //
  // var handleMouseUp = function() {
  //   console.log('mouse up');
  //   mouseDown = false;
  // };
  //
  // var handleMouseMove = function(evt) {
  //   if (!mouseDown) {
  //     return;
  //   }
  //   console.log('mouse move');
  //   var newX = evt.clientX;
  //   var newY = evt.clientY;
  //
  //   var deltaX = newX - lastMouseX;
  //   theta[1] = radians(deltaX / 10);
  //   // var newRotationMatrix = mat4.create();
  //   // mat4.identity(newRotationMatrix);
  //   // mat4.rotate(newRotationMatrix, degToRad(deltaX / 10), [0, 1, 0]);
  //
  //   var deltaY = newY - lastMouseY;
  //   theta[0] = radians(deltaY / 10);
  //   // mat4.rotate(newRotationMatrix, degToRad(deltaY / 10), [1, 0, 0]);
  //   // mat4.multiply(newRotationMatrix, moonRotationMatrix, moonRotationMatrix);
  //
  //   lastMouseX = newX;
  //   lastMouseY = newY;
  //
  //   modelViewMatrix = buildModelViewMatrix();
  // };

  var App = {

    init: function() {

      // Setup canvas
      canvas = document.getElementById('gl-canvas');
      gl = WebGLUtils.setupWebGL( canvas, {preserveDrawingBuffer: true} );
      if ( !gl ) { alert( 'WebGL isn\'t available' ); }

      // Register mouse handlers for interaction
      // canvas.onmousedown = handleMouseDown;
      // canvas.onmouseup = handleMouseUp;
      // canvas.onmousemove = handleMouseMove;
      // document.onmouseup = handleMouseUp;
      // document.onmousemove = handleMouseMove;

      // Configure WebGL
      gl.viewport( 0, 0, canvas.width, canvas.height );
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      gl.enable(gl.POLYGON_OFFSET_FILL);
      gl.polygonOffset(1.0, 2.0);

      // Model and view
      shape = Sphere.generate();
      viewMatrix = buildViewMatrix();
      projectionMatrix = buildProjectionMatrix();
      modelViewMatrix = buildModelViewMatrix();

      // Load shaders
      program = initShaders(gl, 'vertex-shader', 'fragment-shader');
      gl.useProgram(program);

      // Load index data
      var iBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(shape.indices), gl.STATIC_DRAW);

      // Load vertex data
      var vBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(shape.vertices), gl.STATIC_DRAW);

      // Associate shader variable with vertex data buffer
      var vPosition = gl.getAttribLocation( program, 'vPosition' );
      gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
      gl.enableVertexAttribArray( vPosition );

      // Load texture data
      var tBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(shape.textureCoords), gl.STATIC_DRAW);

      // Associate shader variable with texture data buffer
      var vTexCoord = gl.getAttribLocation(program, 'vTexCoord');
      gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vTexCoord);

      // Send color
      gl.uniform4fv(gl.getUniformLocation(program, 'fColor'), flatten(shapeColor));

      // Initialize texture
      var image = new Image();
      image.src = 'images/SA2011_black.gif';
      image.onload = function() {
          configureTexture( image );
          render();
      };

    }

  };

  window.App = App;

}(window, window.Sphere));


/**
 * App Init
 */
(function(App) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    App.init();
  });

}(window.App || (window.App = {})));
