/**
 * App
 */
(function(window, ColorUtils, Shape, DomUtils, Light) {
  'use strict';

  var gl,
    _canvas,
    _shapes = [],
    _camera = {
      viewMatrix: mat4(),
      projectionMatrix: mat4(),
    },
    _lighting = true,
    _lightSource = Light.defaultSource();

  var renderShape = function(shape) {
    var modelViewMatrix;

    // Load shaders
    gl.useProgram(shape.program);

    // Load normal buffer onto GPU
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(shape.normals), gl.STATIC_DRAW );

    // Associate shader variables with normal data buffer
    var vNormal = gl.getAttribLocation( shape.program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    // Load vertex buffer onto GPU
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(shape.vertices), gl.STATIC_DRAW );

    // Associate shader variables with vertex data buffer
    var vPosition = gl.getAttribLocation( shape.program, 'vPosition' );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Uniform vars
    gl.uniformMatrix4fv(gl.getUniformLocation(shape.program, "modelViewMatrix" ), false, flatten(shape.modelViewMatrix) );
    gl.uniformMatrix3fv(gl.getUniformLocation( shape.program, "normalMatrix" ), false, flatten(shape.normalMatrix) );
    gl.uniformMatrix4fv(gl.getUniformLocation( shape.program, "projectionMatrix" ), false, flatten(_camera.projectionMatrix) );

    if (_lighting) {
      gl.uniform4fv( gl.getUniformLocation(shape.program, "ambientProduct"), flatten(shape.ambientProduct) );
      gl.uniform4fv( gl.getUniformLocation(shape.program, "diffuseProduct"), flatten(_lightSource.diffuseProduct) );
      gl.uniform4fv( gl.getUniformLocation(shape.program, "specularProduct"), flatten(_lightSource.specularProduct) );
      gl.uniform4fv( gl.getUniformLocation(shape.program, "lightPosition"), flatten(_lightSource.lightPosition) );
      gl.uniform1f( gl.getUniformLocation(shape.program, "shininess"), shape.materialShininess );
    } else {
      gl.uniform4fv(gl.getUniformLocation(shape.program, 'fColor'), shape.color);
    }

    // draw
    for( var i=0; i<shape.vertices.length; i+=3) {
      gl.drawArrays( gl.TRIANGLES, i, 3 );
    }

  };

  var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (var i=0; i<_shapes.length; i++) {
      renderShape(_shapes[i]);
    }

    updateLightPosition();

    setTimeout(
        function () {requestAnimFrame( render );},
        300
    );

  };

  /**
   *
   https://www.opengl.org/discussion_boards/showthread.php/139444-Easiest-way-to-rotate-point-in-3d-using-trig
   x= cos(yangle)* x + sin(yangle)*sin(xangle)*y - sin(yangle)*cos(xangle)*z
   y = 0 + cos(xangle)*y + sin(xangle)*z
   z= sin(yangle)*x + cos(yangle)*-sin(xangle) *y + cos(yangle)*cos(xangle)*z
   */
  var rotatePoint3D = function(vec4Point, xAngle, yAngle) {
    var origX = vec4Point[0];
    var origY = vec4Point[1];
    var origZ = vec4Point[2];
    var origW = vec4Point[3];
    var xAngleRad = radians(xAngle);
    var yAngleRad = radians(yAngle);

    var newX = (Math.cos(yAngleRad) * origX) + (Math.sin(yAngleRad) * Math.sin(xAngleRad) * origY) - (Math.sin(yAngleRad) * Math.cos(xAngleRad) * origZ);
    var newY = (Math.cos(xAngleRad) * origY) + (Math.sin(xAngleRad) * origZ);
    var newZ = (Math.sin(yAngleRad) * origX) + (Math.cos(yAngleRad) * origY) + (Math.cos(yAngleRad) * Math.cos(xAngleRad) * origZ);

    return vec4(newX, newY, newZ, origW);
  };

  var updateLightPosition = function() {
    _lightSource.theta += 1;
    _lightSource.lightPosition = rotatePoint3D(_lightSource.lightPosition, 0, _lightSource.theta);
  };

  var generateShape = function(shapeType) {
    var shape = {type: shapeType},
      shapeVI,
      materialAmbient;

    shapeVI = Shape.generate(shapeType);
    shape.normals = shapeVI.n;
    shape.vertices = shapeVI.v;

    if (_lighting) {
      shape.program = initShaders( gl, 'vertex-shader', 'fragment-shader' );
    } else {
      shape.program = initShaders( gl, 'vertex-shader', 'fragment-shader-simple' );
    }

    updateShapeWithUserSettings(shape);

    return shape;
  };

  var updateShapeWithUserSettings = function(shape) {
    var modelViewMatrix = mat4(),
      normalMatrix = mat4(),
      thetaOpts = [],
      scaleOpts = [],
      translateOpts = [];

    // Store the plain old color plus lit color in case user turns off lighting
    var selectedColor = ColorUtils.hexToGLvec4(document.getElementById('shapeColor').value);
    shape.color = selectedColor;
    shape.ambientProduct = mult(_lightSource.lightAmbient, selectedColor);
    shape.materialShininess = document.getElementById('materialShininess').valueAsNumber;

    thetaOpts = [
      document.getElementById('rotateX').valueAsNumber,
      document.getElementById('rotateY').valueAsNumber,
      document.getElementById('rotateZ').valueAsNumber
    ];

    scaleOpts = [
      document.getElementById('scaleX').valueAsNumber,
      document.getElementById('scaleY').valueAsNumber,
      document.getElementById('scaleZ').valueAsNumber
    ];

    translateOpts = [
      document.getElementById('translateX').valueAsNumber,
      document.getElementById('translateY').valueAsNumber,
      document.getElementById('translateZ').valueAsNumber
    ];

    // Calculate model matrix based on Translate, Rotate, Scale
    modelViewMatrix = mult(modelViewMatrix, translate(translateOpts[0], translateOpts[1], translateOpts[2]));
    modelViewMatrix = mult(modelViewMatrix, rotate(thetaOpts[0], [1, 0, 0] ));
    modelViewMatrix = mult(modelViewMatrix, rotate(thetaOpts[1], [0, 1, 0] ));
    modelViewMatrix = mult(modelViewMatrix, rotate(thetaOpts[2], [0, 0, 1] ));
    modelViewMatrix = mult(modelViewMatrix, genScaleMatrix(scaleOpts[0], scaleOpts[1], scaleOpts[2]));

    modelViewMatrix = mult(modelViewMatrix, _camera.viewMatrix);

    shape.modelViewMatrix = modelViewMatrix;

    // Calculate normal matrix
    normalMatrix = inverseMat3(flatten(shape.modelViewMatrix));
    normalMatrix = transpose(normalMatrix);
    shape.normalMatrix = normalMatrix;
  };

  var seedOneShape = function() {
    var shapeSelect = document.getElementById('shape');
    var shapeType = shapeSelect.options[shapeSelect.selectedIndex].value;
    _shapes.push(generateShape(shapeType, true));
  };

  var actionHandler = function(evt) {

    if (evt.target.id === 'newShape' || evt.target.id === 'newShapeIcon') {
      setDefaults();
      seedOneShape();
    }

    if (evt.target.id === 'clear' || evt.target.id === 'clearIcon') {
      _shapes = [];
      setDefaults();
    }

    if (evt.target.id === 'downloadShapeData' || evt.target.id === 'downloadShapeDataIcon') {
      var element = document.createElement('a');
      element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(_shapes, null, 2)));
      element.setAttribute('download', 'shapes.json');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }

    if (evt.target.id === 'lightSwitch') {
      if (document.getElementById('lightSwitch').checked) {
        _lighting = true;
        _shapes.forEach(function(shape) {
          shape.program = initShaders( gl, 'vertex-shader', 'fragment-shader' );
        });
      } else {
        _lighting = false;
        _shapes.forEach(function(shape) {
          shape.program = initShaders( gl, 'vertex-shader', 'fragment-shader-simple' );
        });
      }
    }
  };

  var changeHandler = function(evt) {
    if (evt.target.id !== 'lightSwitch' && (evt.target.id === 'shape' || _shapes.length === 0)) {
      seedOneShape();
    } else {
      var currentShape = _shapes[_shapes.length-1];
      updateShapeWithUserSettings(currentShape);
    }
  };

  var updateShapesWithLightSource = function() {
    for (var i=0; i<_shapes.length; i++) {
      _shapes[i].ambientProduct = mult(
        _lightSource.lightAmbient,
        _shapes[i].color
      );
    }
  };

  var updateLightSource = function() {
    var lightDiffuse = ColorUtils.hexToGLvec4(document.getElementById('lightDiffuse').value),
      materialDiffuse = ColorUtils.hexToGLvec4(document.getElementById('materialDiffuse').value),
      lightSpecular = ColorUtils.hexToGLvec4(document.getElementById('lightSpecular').value),
      materialSpecular = ColorUtils.hexToGLvec4(document.getElementById('materialSpecular').value),
      lightAmbient = ColorUtils.hexToGLvec4(document.getElementById('lightAmbient').value),
      lightType = DomUtils.getCheckedValue('lightType'),
      lightDistance = document.getElementById('lightDistance').valueAsNumber,
      // materialShininess = document.getElementById('materialShininess').valueAsNumber,
      curentLightAmbient = _lightSource.lightAmbient;

    if (!equal(curentLightAmbient, lightAmbient)) {
      updateShapesWithLightSource();
    }

    _lightSource.lightPosition = Light.initPosition(lightDistance, lightType);
    _lightSource.lightAmbient = lightAmbient;
    // _lightSource.materialShininess = materialShininess;
    _lightSource.diffuseProduct = mult(lightDiffuse, materialDiffuse);
    _lightSource.specularProduct = mult(lightSpecular, materialSpecular);

  };

  var lightHandler = function(evt) {
    updateLightSource();
  };

  var setDefaults = function() {
    document.getElementById('shapeColor').value = '#ff0000';

    document.getElementById('rotateX').value = 0;
    document.getElementById('rxv').value = 0;
    document.getElementById('rotateY').value = 0;
    document.getElementById('ryv').value = 0;
    document.getElementById('rotateZ').value = 0;
    document.getElementById('rzv').value = 0;

    document.getElementById('scaleX').value = 1.0;
    document.getElementById('sxv').value = 1.0;
    document.getElementById('scaleY').value = 1.0;
    document.getElementById('syv').value = 1.0;
    document.getElementById('scaleZ').value = 1.0;
    document.getElementById('szv').value = 1.0;

    document.getElementById('translateX').value = 0;
    document.getElementById('txv').value = 0;
    document.getElementById('translateY').value = 0;
    document.getElementById('tyv').value = 0;
    document.getElementById('translateZ').value = 0;
    document.getElementById('tzv').value = 0;

    document.getElementById('materialShininess').value = 10.0;
    document.getElementById('lightSwitch').checked = true;

    document.getElementById('lightDiffuse').value = '#ffffff';
    document.getElementById('materialDiffuse').value = '#ffffff';
    document.getElementById('lightSpecular').value = '#ffffff';
    document.getElementById('materialSpecular').value = '#ffffff';
    document.getElementById('lightAmbient').value = '#ffffff';
    document.getElementById('sunlight').checked = true;
    document.getElementById('lightDistance').value = 1.0;
    _lightSource = Light.defaultSource();
  };

  var App = {

    init: function() {

      // Setup canvas
      _canvas = document.getElementById('gl-canvas');
      gl = WebGLUtils.setupWebGL( _canvas, {preserveDrawingBuffer: true} );
      if ( !gl ) { alert( 'WebGL isn\'t available' ); }

      // Register event handlers
      document.getElementById('shapeSettings').addEventListener('click', actionHandler);
      document.getElementById('shapeSettings').addEventListener('change', changeHandler);
      document.getElementById('lightSettings1').addEventListener('change', lightHandler);

      // Configure WebGL
      gl.viewport( 0, 0, _canvas.width, _canvas.height );
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      gl.enable(gl.POLYGON_OFFSET_FILL);
      gl.polygonOffset(1.0, 2.0);

      // Camera view
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
      _camera.viewMatrix = lookAt(eye, at, up);

      // Camera projection
      var far = 10;
      var left = -3.0;
      var right = 3.0;
      var bottom = -3.0;
      var ytop =3.0;
      var near = -10;
      _camera.projectionMatrix = ortho(left, right, bottom, ytop, near, far);

      setDefaults();
      render();
    }

  };

  window.App = App;

}(window, window.ColorUtils, window.Shape, window.DomUtils, window.Light));


/**
 * App Init
 */
(function(App) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    App.init();
  });

}(window.App || (window.App = {})));
