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
    zoom = 5.3,
    eyeTheta = 30.0,
    eyePhi = 30.0,
    eyeAtX = 0.8,
    eyeAtY = -0.4,
    eyeAtZ = 1.0,
    viewMatrix = mat4(),
    modelViewMatrix = mat4(),
    fovy = 45.0,
    near = 1.0,
    far = -1.0,
    projectionMatrix = mat4(),
    shapeColor = vec4(1.0, 1.0, 1.0, 1.0),
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
    var width = canvas.clientWidth - 300,
      height = canvas.clientHeight - 500;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);

    projectionMatrix = perspective(fovy, canvas.width / canvas.height, near, far);
    gl.uniformMatrix4fv(gl.getUniformLocation( program, 'projectionMatrix' ), false, flatten(projectionMatrix) );
  };

  var render = function() {
    adjustCanvas();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'modelViewMatrix' ), false, flatten(modelViewMatrix) );
    gl.drawElements(gl.TRIANGLES, shape.indices.length, gl.UNSIGNED_SHORT, 0);

    setTimeout(
      function () {requestAnimFrame( render );},
      1000 / 60
    );
  };

  var buildViewMatrix = function() {
    var at = vec3(eyeAtX, eyeAtY, eyeAtZ);
    var up = vec3(0.0, 1.0, 0.0);
    var eye = vec3(
      zoom * Math.sin(radians(eyeTheta)) * Math.cos(radians(eyePhi)),
      zoom * Math.sin(radians(eyeTheta)) * Math.sin(radians(eyePhi)),
      zoom * Math.cos(radians(eyeTheta))
    );
    return lookAt(eye, at, up);
  };

  var buildModelViewMatrix = function() {
    var modelMatrix = mat4();

    modelMatrix = mult(modelMatrix, rotate(theta[0], [1, 0, 0] ));
    modelMatrix = mult(modelMatrix, rotate(theta[1], [0, 1, 0] ));
    modelMatrix = mult(modelMatrix, rotate(theta[2], [0, 0, 1] ));

    return mult(viewMatrix, modelMatrix);
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

  var handlePatternTextureSelection = function(evt) {
    textureType = 'pattern';
    configureTexture(checkerboardImage);
  };

  var loadTextureFile = function(textureFileUrl) {
    fileImage = new Image();
    fileImage.onload = function() {
        configureTexture( fileImage );
        render();
    };
    fileImage.onerror = function() {
      console.error('Unable to load image: ' + textureFileUrl);
    };
    fileImage.src = textureFileUrl;
  };

  var handleFileTextureSelection = function(evt) {
    var textureFileUrl = 'images/' + evt.target.dataset.textureFile;
    textureType = 'file';
    loadTextureFile(textureFileUrl);
  };

  var handleCameraControl = function() {
    near = document.getElementById('cameraNear').valueAsNumber;
    far = document.getElementById('cameraFar').valueAsNumber;
    fovy = document.getElementById('cameraFovy').valueAsNumber;
    // no need to rebuild projection matrix here, handled in render
  };

  var handleEyeControl = function() {
    zoom = document.getElementById('eyeZoom').valueAsNumber;
    eyeTheta = document.getElementById('eyeTheta').valueAsNumber;
    eyePhi = document.getElementById('eyePhi').valueAsNumber;
    eyeAtX = document.getElementById('eyeAtX').valueAsNumber;
    eyeAtY = document.getElementById('eyeAtY').valueAsNumber;
    eyeAtZ = document.getElementById('eyeAtZ').valueAsNumber;

    viewMatrix = buildViewMatrix();
    modelViewMatrix = buildModelViewMatrix();
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
      document.getElementById('patternTextureSelection').addEventListener('click', handlePatternTextureSelection);
      document.getElementById('fileTextureSelection').addEventListener('click', handleFileTextureSelection);
      document.getElementById('cameraControl').addEventListener('change', handleCameraControl);
      document.getElementById('eyeControl').addEventListener('change', handleEyeControl);

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
      loadTextureFile('images/moon.gif');
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
