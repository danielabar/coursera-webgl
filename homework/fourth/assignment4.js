/**
 * https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
 */
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (position === undefined || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

/**
 * App
 */
(function(window, ColorUtils, Shape, DomUtils, Light) {
  'use strict';

  var gl,
    _canvas,
    _shapes = [],
    _currentShape,
    _camera = {
      viewMatrix: mat4(),
      projectionMatrix: mat4(),
    },
    _lightSources = [
      Light.defaultSource(),
      Light.alternateSource()
    ],
    _globalAmbientLight = Light.globalAmbient();

  var renderShape = function(shape) {
    var modelViewMatrix;

    // Load shaders based on lighting
    var program;
    if (Light.numEnabled(_lightSources) <= 1) {
      program = shape.program1;
    } else {
      program = shape.program2;
    }
    gl.useProgram(program);

    // Load normal buffer onto GPU
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(shape.normals), gl.STATIC_DRAW );

    // Associate shader variables with normal data buffer
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    // Load vertex buffer onto GPU
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(shape.vertices), gl.STATIC_DRAW );

    // Associate shader variables with vertex data buffer
    var vPosition = gl.getAttribLocation( program, 'vPosition' );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Uniform vars
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix" ), false, flatten(shape.modelViewMatrix) );
    gl.uniformMatrix3fv(gl.getUniformLocation( program, "normalMatrix" ), false, flatten(shape.normalMatrix) );
    gl.uniformMatrix4fv(gl.getUniformLocation( program, "projectionMatrix" ), false, flatten(_camera.projectionMatrix) );

    var numL = Light.numEnabled(_lightSources);
    gl.uniform1f( gl.getUniformLocation(program, "shininess"), shape.materialShininess );
    switch (numL) {
      // User turned off both light sources, send global ambient lighting
      case 0:
        gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"), flatten(shape.globalAmbientProduct) );
        gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"), flatten(_globalAmbientLight.diffuseProduct) );
        gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), flatten(_globalAmbientLight.specularProduct) );
        gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(_globalAmbientLight.lightPosition) );
        gl.uniform1f( gl.getUniformLocation(program, "attenuation"), _globalAmbientLight.attenuation );
        break;
      case 1:
        // Only one light source enabled, send the selected one
        var lightIndex = Light.indexEnabled(_lightSources);
        gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"), flatten(shape.ambientProduct[lightIndex]) );
        gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"), flatten(shape.diffuseProduct[lightIndex]) );
        gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), flatten(shape.specularProduct[lightIndex]) );
        gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(_lightSources[lightIndex].lightPosition) );
        gl.uniform1f( gl.getUniformLocation(program, "attenuation"), _lightSources[lightIndex].attenuation );
        break;
      default:
        // Both light sources are enabled, send them all
        var allAmbient = shape.ambientProduct[0].concat(shape.ambientProduct[1]);
        var allDiffuse = shape.diffuseProduct[0].concat(shape.diffuseProduct[1]);
        var allSpecular = shape.specularProduct[0].concat(shape.specularProduct[1]);
        var allPos = _lightSources[0].lightPosition.concat(_lightSources[1].lightPosition);
        gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"), flatten(allAmbient) );
        gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"), flatten(allDiffuse) );
        gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), flatten(allSpecular) );
        gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(allPos) );
        gl.uniform1f( gl.getUniformLocation(program, "attenuationA"), _lightSources[0].attenuation );
        gl.uniform1f( gl.getUniformLocation(program, "attenuationB"), _lightSources[1].attenuation );
        break;
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
        1000 / 60
    );

  };

  // Orbit Rotation
  // var updateLightPosition = function() {
  //   _lightSource.theta += 0.1;
  //   var rotatedPoint = Light.rotatePoint3D(_lightSource.lightPosition, 0, _lightSource.theta);
  //
  //   _lightSource.lightPosition[0] = rotatedPoint[0];
  //   _lightSource.lightPosition[1] = rotatedPoint[1];
  //   _lightSource.lightPosition[2] = rotatedPoint[2];
  //
  //   if (_lightSource.theta >= 2*Math.PI) {
  //     _lightSource.theta = 0.0;
  //   }
  // };

  // Around the edge rotation
  var updateLightPosition = function() {
    if (Light.numEnabled(_lightSources) > 0) {
      for (var i=0; i<_lightSources.length; i++) {

        if (_lightSources[i].rotation === 'INC') {
          _lightSources[i].theta += 0.1;
        } else if (_lightSources[i].rotation === 'DEC') {
          _lightSources[i].theta -= 0.1;
        }
        var rotatedPoint = Light.rotatePoint2D(_lightSources[i].theta, 16);

        _lightSources[i].lightPosition[0] = rotatedPoint[0];
        _lightSources[i].lightPosition[1] = rotatedPoint[1];

        if (_lightSources[i].theta >= 2*Math.PI) {
          _lightSources[i].theta = 0.0;
        }
      }
    }
  };

  var generateShape = function(shapeType) {
    var shape = {type: shapeType},
      shapeVI,
      materialAmbient;

    shape.program1 = initShaders( gl, 'vertex-shader-1', 'fragment-shader-1' );
    shape.program2 = initShaders( gl, 'vertex-shader-2', 'fragment-shader-2' );

    shapeVI = Shape.generate(shapeType);
    shape.normals = shapeVI.n;
    shape.vertices = shapeVI.v;

    updateShapeWithUserSettings(shape);

    return shape;
  };

  var updateShapeWithUserSettings = function(shape) {
    var modelViewMatrix = mat4(), normalMatrix = mat4(),
      thetaOpts = [], scaleOpts = [], translateOpts = [],
      selectedColor, selectedDiffuse, selectedSpecular;

    // Material properties
    shape.hexAmbient = document.getElementById('shapeColor').value;
    selectedColor = ColorUtils.hexToGLvec4(shape.hexAmbient);
    shape.color = selectedColor;

    shape.hexDiffuse = document.getElementById('materialDiffuse').value;
    selectedDiffuse = ColorUtils.hexToGLvec4(shape.hexDiffuse);
    shape.materialDiffuse = selectedDiffuse;

    shape.hexSpecular = document.getElementById('materialSpecular').value;
    selectedSpecular = ColorUtils.hexToGLvec4(shape.hexSpecular);
    shape.materialSpecular = selectedSpecular;

    shape.materialShininess = document.getElementById('materialShininess').valueAsNumber;

    shape.ambientProduct = [];
    shape.diffuseProduct = [];
    shape.specularProduct = [];
    for (var j=0; j<_lightSources.length; j++) {
      shape.ambientProduct[j] = mult(_lightSources[j].lightAmbient, selectedColor);
      shape.diffuseProduct[j] = mult(_lightSources[j].lightDiffuse, selectedDiffuse);
      shape.specularProduct[j] = mult(_lightSources[j].lightSpecular, selectedSpecular);
    }
    shape.globalAmbientProduct = mult(_globalAmbientLight.lightAmbient, selectedColor);

    // TRS
    thetaOpts = [
      document.getElementById('rotateX').valueAsNumber,
      document.getElementById('rotateY').valueAsNumber,
      document.getElementById('rotateZ').valueAsNumber
    ];
    shape.thetaOpts = thetaOpts;

    scaleOpts = [
      document.getElementById('scaleX').valueAsNumber,
      document.getElementById('scaleY').valueAsNumber,
      document.getElementById('scaleZ').valueAsNumber
    ];
    shape.scaleOpts = scaleOpts;

    translateOpts = [
      document.getElementById('translateX').valueAsNumber,
      document.getElementById('translateY').valueAsNumber,
      document.getElementById('translateZ').valueAsNumber
    ];
    shape.translateOpts = translateOpts;

    // Calculate model matrix based on Translate, Rotate, Scale
    modelViewMatrix = mult(modelViewMatrix, translate(translateOpts[0], translateOpts[1], translateOpts[2]));
    modelViewMatrix = mult(modelViewMatrix, rotate(thetaOpts[0], [1, 0, 0] ));
    modelViewMatrix = mult(modelViewMatrix, rotate(thetaOpts[1], [0, 1, 0] ));
    modelViewMatrix = mult(modelViewMatrix, rotate(thetaOpts[2], [0, 0, 1] ));
    modelViewMatrix = mult(modelViewMatrix, genScaleMatrix(scaleOpts[0], scaleOpts[1], scaleOpts[2]));

    // Multiply model matrix by camera view to get the model view matrix
    modelViewMatrix = mult(modelViewMatrix, _camera.viewMatrix);
    shape.modelViewMatrix = modelViewMatrix;

    // Calculate normal matrix based on inverse-transpose of model view
    normalMatrix = inverseMat3(flatten(shape.modelViewMatrix));
    normalMatrix = transpose(normalMatrix);
    shape.normalMatrix = normalMatrix;
  };

  var seedOneShape = function(shapeType) {
    var generatedShape = generateShape(shapeType);
    _shapes.push(generatedShape);
    _currentShape = generatedShape;
    addToManagedList(generatedShape, _shapes.length);
  };

  var addToManagedList = function(shape, shapeNumber) {
    var managedList = document.getElementById('manageShapes');
    var option = document.createElement("option");
    option.text = shapeNumber + '-' + shape.type;
    option.value = shapeNumber - 1;
    option.selected = true;
    managedList.add(option);
  };

  var removeAllShapes = function() {
    _shapes = [];
    DomUtils.removeOptions('manageShapes');
  };

  var toolbarHandler = function(evt) {
    var clickedOnId = evt.target.id,
      shapeElement;

    if (clickedOnId.startsWith('shape')) {
      shapeElement = document.getElementById(clickedOnId);
      seedOneShape(shapeElement.dataset.shape);
    }

    if (clickedOnId === 'clearAll' || clickedOnId === 'clearAllIcon') {
      removeAllShapes();
    }

  };

  var loadShapeSettings = function(shape) {
    document.getElementById('shapeColor').value = shape.hexAmbient;
    document.getElementById('materialDiffuse').value = shape.hexDiffuse;
    document.getElementById('materialSpecular').value = shape.hexSpecular;
    document.getElementById('materialShininess').value = shape.materialShininess;

    document.getElementById('rotateX').value = shape.thetaOpts[0];
    document.getElementById('rotateY').value = shape.thetaOpts[1];
    document.getElementById('rotateZ').value = shape.thetaOpts[2];

    document.getElementById('scaleX').value = shape.scaleOpts[0];
    document.getElementById('scaleY').value = shape.scaleOpts[1];
    document.getElementById('scaleZ').value = shape.scaleOpts[2];

    document.getElementById('translateX').value = shape.translateOpts[0];
    document.getElementById('translateY').value = shape.translateOpts[1];
    document.getElementById('translateZ').value = shape.translateOpts[2];
  };

  var manageShapeHandler = function() {
    var manageShapeEl = document.getElementById('manageShapes');
    var selectedShapeIndex = manageShapeEl.options[manageShapeEl.selectedIndex].value;
    if (_shapes.length > 0 && selectedShapeIndex >= 0 && selectedShapeIndex < _shapes.length) {
      _currentShape = _shapes[selectedShapeIndex];
      loadShapeSettings(_currentShape);
    }
  };

  var changeHandler = function(evt) {
    updateShapeWithUserSettings(_currentShape);
  };

  var updateShapesWithLightSource = function() {

    for (var i=0; i<_shapes.length; i++) {
      _shapes[i].ambientProduct = [];
      _shapes[i].diffuseProduct = [];
      _shapes[i].specularProduct = [];
      for (var j=0; j<_lightSources.length; j++) {
        _shapes[i].ambientProduct[j] = mult(
          _lightSources[j].lightAmbient,
          _shapes[i].color
        );
        _shapes[i].diffuseProduct[j] = mult(
          _lightSources[j].lightDiffuse,
          _shapes[i].materialDiffuse
        );
        _shapes[i].specularProduct[j] = mult(
          _lightSources[j].lightSpecular,
          _shapes[i].materialSpecular
        );
      }
    }
  };

  var lightDomElementId = function(elemId, lightIndex) {
    if (lightIndex === 0) {
      return elemId;
    } else {
      return elemId + '2';
    }
  };

  var updateLightSource = function(lightIndex) {
    var enabled = document.getElementById(lightDomElementId('lightSwitch', lightIndex)).checked,
      lightDiffuse = ColorUtils.hexToGLvec4(document.getElementById(lightDomElementId('lightDiffuse', lightIndex)).value),
      lightSpecular = ColorUtils.hexToGLvec4(document.getElementById(lightDomElementId('lightSpecular', lightIndex)).value),
      lightAmbient = ColorUtils.hexToGLvec4(document.getElementById(lightDomElementId('lightAmbient', lightIndex)).value),
      lightDistance = document.getElementById(lightDomElementId('lightDistance', lightIndex)).valueAsNumber;

    _lightSources[lightIndex].enabled = enabled;
    _lightSources[lightIndex].lightAmbient = lightAmbient;
    _lightSources[lightIndex].lightDiffuse = lightDiffuse;
    _lightSources[lightIndex].lightSpecular = lightSpecular;
    _lightSources[lightIndex].lightDistance = lightDistance;
    _lightSources[lightIndex].attenuation = 1 / (1 + (Light.attenuationFactor * Math.pow(lightDistance, 2)));

    updateShapesWithLightSource();
  };

  var lightHandler = function(evt) {
    var target = evt.target.id;
    if (target.endsWith('2')) {
      updateLightSource(1);
    } else {
      updateLightSource(0);
    }
  };

  var setDefaults = function() {
    // Material
    document.getElementById('shapeColor').value = '#ff0000';
    document.getElementById('materialDiffuse').value = '#ffffff';
    document.getElementById('materialSpecular').value = '#ffffff';
    document.getElementById('materialShininess').value = 10.0;
    document.getElementById('mshiny').value = 10.0;

    document.getElementById('rotateX').value = 45;
    document.getElementById('rxv').value = 45;
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
    document.getElementById('translateZ').value = 1.0;
    document.getElementById('tzv').value = 1.0;

    // Light 1
    document.getElementById('lightSwitch').checked = true;
    document.getElementById('lightDiffuse').value = '#ffffff';
    document.getElementById('lightSpecular').value = '#ffffff';
    document.getElementById('lightAmbient').value = '#ffffff';
    document.getElementById('lightDistance').value = 0.0;
    _lightSources[0] = Light.defaultSource();

    // Light 2
    document.getElementById('lightSwitch2').checked = false;
    document.getElementById('lightDiffuse2').value = '#ffdd05';
    document.getElementById('lightSpecular2').value = '#ffffff';
    document.getElementById('lightAmbient2').value = '#333333';
    document.getElementById('lightDistance2').value = 0.0;
    _lightSources[1] = Light.alternateSource();
  };

  var App = {

    init: function() {

      // Setup canvas
      _canvas = document.getElementById('gl-canvas');
      _canvas.height = document.documentElement.clientHeight;
      _canvas.width = document.documentElement.clientWidth - document.getElementById('sideControls').clientWidth;
      gl = WebGLUtils.setupWebGL( _canvas, {preserveDrawingBuffer: true} );
      if ( !gl ) { alert( 'WebGL isn\'t available' ); }

      // Register event handlers
      document.getElementById('toolbar').addEventListener('click', toolbarHandler);
      document.getElementById('manageShapes').addEventListener('change', manageShapeHandler);
      document.getElementById('shapeSettings').addEventListener('change', changeHandler);
      document.getElementById('lightSettings1').addEventListener('change', lightHandler);
      document.getElementById('lightSettings2').addEventListener('change', lightHandler);

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
