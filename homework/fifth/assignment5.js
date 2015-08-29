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
    lastMouseY = null,
    texSize = 64,
    checkerboardImage, fileImage,
    textureType = 'file';

  var buildCheckerboard = function() {
    var image1 = [];
    for (var i =0; i<texSize; i++) {
      image1[i] = [];
    }
    for (var i =0; i<texSize; i++) {
      for ( var j = 0; j < texSize; j++) {
        image1[i][j] = new Float32Array(4);
      }
    }
    for (var i =0; i<texSize; i++) {
      for (var j=0; j<texSize; j++) {
        var c = (((i & 0x8) == 0) ^ ((j & 0x8)  == 0));
        image1[i][j] = [c, c, c, 1];
      }
    }

    // Convert floats to ubytes for texture
    var checkImage = new Uint8Array(4*texSize*texSize);
    for ( var i = 0; i < texSize; i++ ) {
      for ( var j = 0; j < texSize; j++ ) {
        for(var k =0; k<4; k++) {
          checkImage[4*texSize*i+4*j+k] = 255*image1[i][j][k];
        }
      }
    }

    return checkImage;
  };

  var configureTexture = function(image) {
    texture = gl.createTexture();

    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    if (textureType === 'file') {
      gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image );
    }

    if (textureType === 'pattern') {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
    }

    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.uniform1i(gl.getUniformLocation(program, 'texture'), 0);
  };

  var adjustCanvas = function() {
    var width = canvas.clientWidth,
      height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    // uncomment if can get perspective working
    // projectionMatrix = perspective(fov, (width/height), near, far);
    // gl.uniformMatrix4fv(uProjection, false, flatten(perspective));
  };

  var render = function() {
    adjustCanvas();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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

  var handleMouseDown = function(evt) {
    mouseDown = true;
    lastMouseX = evt.clientX;
    lastMouseY = evt.clientY;
  };

  var handleMouseUp = function() {
    mouseDown = false;
  };

  var handleMouseMove = function(evt) {
    if (!mouseDown) {
      return;
    }
    var newX = evt.clientX;
    var newY = evt.clientY;

    var deltaX = newX - lastMouseX;
    theta[1] -= deltaX / 10;

    var deltaY = newY - lastMouseY;
    theta[0] -= deltaY / 10;

    modelViewMatrix = buildModelViewMatrix();

    lastMouseX = newX;
    lastMouseY = newY;
  };

  var handleTextureSelection = function(evt) {
    if (evt.target.id === 'fileTexture') {
      textureType = 'file';
      configureTexture(fileImage);
    }
    if (evt.target.id === 'patternTexture') {
      textureType = 'pattern';
      configureTexture(checkerboardImage);
    }
  };

  var App = {

    init: function() {

      // Setup canvas
      canvas = document.getElementById('gl-canvas');
      gl = WebGLUtils.setupWebGL( canvas, {preserveDrawingBuffer: true} );
      if ( !gl ) { alert( 'WebGL isn\'t available' ); }

      // Register event handlers
      canvas.onmousedown = handleMouseDown;
      document.onmouseup = handleMouseUp;
      document.onmousemove = handleMouseMove;
      document.getElementById('textureSelection').addEventListener('click', handleTextureSelection);

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

      // Initialize textures
      checkerboardImage = buildCheckerboard();
      fileImage = new Image();
      fileImage.onload = function() {
          configureTexture( fileImage );
          render();
      };
      fileImage.onerror = function() {
        console.error('Unable to load image');
      };
      fileImage.src = 'images/SA2011_black.gif';

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
