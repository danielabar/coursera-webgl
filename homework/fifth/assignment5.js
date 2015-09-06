/**
 * App
 */
(function(window, Sphere, DomUtils, Pattern) {
  'use strict';

  var gl,
    canvas,
    program,
    textureMappingMethod = 'spherical',
    shape,
    theta = [-46.69, 49.7, 45],
    modelMatrix = mat4(),
    zoom = 4.5,
    eyeTheta = 11.0,
    eyePhi = 93.0,
    eyeAtX = 0.5,
    eyeAtY = -0.9,
    eyeAtZ = 1.0,
    viewMatrix = mat4(),
    modelViewMatrix = mat4(),
    fovy = 63.0,
    near = 1.0,
    far = 10.0,
    projectionMatrix = mat4(),
    shapeColor = vec4(1.0, 1.0, 1.0, 1.0),
    texture,
    mouseDown = false,
    lastMouseX = null,
    lastMouseY = null,
    texSize = 64,
    numChecks = 8,
    patternImage, fileImage,
    textureType = 'file',
    normalMatrix = mat4(),
    cubeMapImages = {},
    cubeMap;

  var lightPosition = vec4(2.0, 3.0, 1.0, 0.0 );
  var lightAmbient = vec4(0.5, 0.5, 0.5, 1.0 );
  var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
  var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

  var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
  var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
  var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
  var materialShininess = 20.0;

  var ambientProduct = mult(lightAmbient, materialAmbient);
  var diffuseProduct = mult(lightDiffuse, materialDiffuse);
  var specularProduct = mult(lightSpecular, materialSpecular);

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

    projectionMatrix = perspective(fovy, canvas.width / canvas.height, near, far);
    gl.uniformMatrix4fv(gl.getUniformLocation( program, 'projectionMatrix' ), false, flatten(projectionMatrix) );
  };

  var render = function() {
    var vBuffer,
      vPosition;

    adjustCanvas();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'modelViewMatrix' ), false, flatten(modelViewMatrix) );

    if (textureType === 'reflection') {
      var nBuffer = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
      gl.bufferData( gl.ARRAY_BUFFER, flatten(shape.normals), gl.STATIC_DRAW );

      var vNormal = gl.getAttribLocation( program, "vNormal" );
      gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
      gl.enableVertexAttribArray( vNormal);

      vBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(shape.vertices), gl.STATIC_DRAW);

      vPosition = gl.getAttribLocation( program, "vPosition");
      gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vPosition);

      // Send normal matrix
      var normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
      gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );

      // Send lighting
      gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct) );
      gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct) );
      gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"),flatten(specularProduct) );
      gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition) );
      gl.uniform1f( gl.getUniformLocation(program, "shininess"),materialShininess );

    } else {
      var nBuffer2 = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer2);
      gl.bufferData( gl.ARRAY_BUFFER, flatten(shape.normals), gl.STATIC_DRAW );

      var vNormal2 = gl.getAttribLocation( program, "vNormal" );
      gl.vertexAttribPointer( vNormal2, 3, gl.FLOAT, false, 0, 0 );
      gl.enableVertexAttribArray( vNormal2);

      // Load index data
      var iBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(shape.indices), gl.STATIC_DRAW);

      // Load vertex data
      vBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(shape.vertices), gl.STATIC_DRAW);

      // Associate shader variable with vertex data buffer
      vPosition = gl.getAttribLocation( program, 'vPosition' );
      gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
      gl.enableVertexAttribArray( vPosition );

      // Load texture data
      var tBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(shape.texCoords[textureMappingMethod]), gl.STATIC_DRAW);

      // Associate shader variable with texture data buffer
      var vTexCoord = gl.getAttribLocation(program, 'vTexCoord');
      gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vTexCoord);

      // Send normal matrix
      var normalMatrixLoc2 = gl.getUniformLocation( program, "normalMatrix" );
      gl.uniformMatrix3fv(normalMatrixLoc2, false, flatten(normalMatrix) );

      // Send lighting
      gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct) );
      gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct) );
      gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"),flatten(specularProduct) );
      gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition) );
      gl.uniform1f( gl.getUniformLocation(program, "shininess"),materialShininess );
    }

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
    var modelMatrix = mat4(),
      mv;

    modelMatrix = mult(modelMatrix, rotate(theta[0], [1, 0, 0] ));
    modelMatrix = mult(modelMatrix, rotate(theta[1], [0, 1, 0] ));
    modelMatrix = mult(modelMatrix, rotate(theta[2], [0, 0, 1] ));

    mv = mult(viewMatrix, modelMatrix);

    normalMatrix = inverseMat3(flatten(mv));
    normalMatrix = transpose(normalMatrix);

    return mv;
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
    if (evt.target.dataset && evt.target.dataset.texturePattern) {
      program = initShaders(gl, 'vertex-shader', 'fragment-shader');
      gl.useProgram(program);

      patternImage = Pattern[evt.target.dataset.texturePattern](texSize, numChecks);
      textureType = 'pattern';
      configureTexture(patternImage);
    }
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

  var configureCubeMap = function() {
    cubeMap = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cubeMapImages.posx );
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cubeMapImages.negx );
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cubeMapImages.posy );
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cubeMapImages.negy );
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cubeMapImages.posz );
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cubeMapImages.negz );

    // format cube map texture
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.activeTexture( gl.TEXTURE0 );
    gl.uniform1i(gl.getUniformLocation(program, "texMap"),0);
  };

  var cubeMapLoaded = function() {
    if (cubeMapImages.posx && cubeMapImages.negx &&
        cubeMapImages.posy && cubeMapImages.negy &&
        cubeMapImages.posz && cubeMapImages.negz) {
      hideLoadingIndicator();
      configureCubeMap();
    }
  };

  var loadCubeMapImage = function(position, url, cb) {
    var fileImage = new Image();
    fileImage.onload = function() {
      cubeMapImages[position] = fileImage;
      cb();
    };
    fileImage.src = url;
  };

  var showLoadingIndicator = function() {
    var el = document.getElementById('loadingIndicator');
    el.classList.add('active');
  };

  var hideLoadingIndicator = function() {
    var el = document.getElementById('loadingIndicator');
    el.classList.remove('active');
  };

  var loadCubeMapImages = function(path) {
    loadCubeMapImage('negx', path.concat('negx.jpg'), cubeMapLoaded);
    loadCubeMapImage('negy', path.concat('posy.jpg'), cubeMapLoaded);
    loadCubeMapImage('negz', path.concat('negz.jpg'), cubeMapLoaded);
    loadCubeMapImage('posx', path.concat('posx.jpg'), cubeMapLoaded);
    loadCubeMapImage('posy', path.concat('posy.jpg'), cubeMapLoaded);
    loadCubeMapImage('posz', path.concat('posz.jpg'), cubeMapLoaded);
  };

  var handleMappingMethodSelection = function() {
    textureMappingMethod = DomUtils.getCheckedValue('textureMapping');
  };

  var handleFileTextureSelection = function(evt) {
    if (evt.target.dataset && evt.target.dataset.textureFile) {
      program = initShaders(gl, 'vertex-shader', 'fragment-shader');
      gl.useProgram(program);

      var textureFileUrl = 'images/' + evt.target.dataset.textureFile;
      textureType = 'file';
      loadTextureFile(textureFileUrl);
    }
  };

  var handleReflectionSelection = function(evt) {
    if (evt.target.dataset && evt.target.dataset.reflectionMap) {
      program = initShaders(gl, 'vertex-shader-2', 'fragment-shader-2');
      gl.useProgram(program);

      var reflectionFilesPath = 'images/'.concat(evt.target.dataset.reflectionMap, '/');
      textureType = 'reflection';
      showLoadingIndicator();
      loadCubeMapImages(reflectionFilesPath);
    }
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

  var handleNavToggle = function() {
    var nav = document.getElementById('nav'),
      navToggle = document.getElementById('navToggle');
    nav.classList.add('active');
    navToggle.classList.add('hide');
  };

  var handleNavClose = function(evt) {
    if (evt.target.id === 'navClose' || evt.target.id === 'navCloseIcon') {
      var nav = document.getElementById('nav'),
        navToggle = document.getElementById('navToggle');
      nav.classList.remove('active');
      navToggle.classList.remove('hide');
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
      document.getElementById('mappingMethodSelection').addEventListener('click', handleMappingMethodSelection);
      document.getElementById('patternTextureSelection').addEventListener('click', handlePatternTextureSelection);
      document.getElementById('fileTextureSelection').addEventListener('click', handleFileTextureSelection);
      document.getElementById('reflectionSelection').addEventListener('click', handleReflectionSelection);
      document.getElementById('cameraControl').addEventListener('change', handleCameraControl);
      document.getElementById('eyeControl').addEventListener('change', handleEyeControl);
      document.getElementById('navToggle').addEventListener('click', handleNavToggle);
      document.getElementById('nav').addEventListener('click', handleNavClose);

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

      // Initialize default file texture
      loadTextureFile('images/moon.gif');
    }

  };

  window.App = App;

}(window, window.Sphere, window.DomUtils, window.Pattern));


/**
 * App Init
 */
(function(App) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    App.init();
  });

}(window.App || (window.App = {})));
