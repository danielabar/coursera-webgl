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
    _lightSources = [
      Light.defaultSource(true, 0.0),
      Light.defaultSource(true, 90.0)
    ];

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

    // experiment multiple light sources
    // var lightPosition1 = vec4(1.0, 1.0, 1.0, 0.0 );
    // var lightPosition2 = vec4(0.5, 0.5, 0.5, 0.0 );
    // var lightPosArr = [lightPosition1, lightPosition2];
    // gl.uniform4fv( gl.getUniformLocation(shape.program, "lightPositionTest"), flatten(lightPosArr) );

    // TODO: Call Light.numEnabled for value of cNumLight
    // TODO If no lights selected, send in cNumLight=1 with global ambient light
    glUniform1i( gl.getUniformLocation(shape.program, "cNumLight"), _lightSource.length );
    gl.uniform4fv( gl.getUniformLocation(shape.program, "ambientProduct"), flatten(shape.ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(shape.program, "diffuseProduct"), flatten(_lightSource.diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(shape.program, "specularProduct"), flatten(_lightSource.specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(shape.program, "lightPosition"), flatten(_lightSource.lightPosition) );
    gl.uniform1f( gl.getUniformLocation(shape.program, "shininess"), shape.materialShininess );

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

  // 3D Rotation
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

  // 2D Rotation
  var updateLightPosition = function() {
    for (var i=0; i<_lightSources.length; i++) {
      _lightSources[i].theta += 0.1;
      var rotatedPoint = Light.rotatePoint2D(_lightSources[i].theta, 16);

      _lightSources[i].lightPosition[0] = rotatedPoint[0];
      _lightSources[i].lightPosition[1] = rotatedPoint[1];

      if (_lightSources[i].theta >= 2*Math.PI) {
        _lightSources[i].theta = 0.0;
      }
    }
  };

  var generateShape = function(shapeType) {
    var shape = {type: shapeType},
      shapeVI,
      materialAmbient;

    shapeVI = Shape.generate(shapeType);
    shape.normals = shapeVI.n;
    shape.vertices = shapeVI.v;

    // FIXME handle no lights, for now, assume both light sources always on
    shape.program = initShaders( gl, 'vertex-shader', 'fragment-shader' );
    // if (_lightSource[0].enabled) {
    //   shape.program = initShaders( gl, 'vertex-shader', 'fragment-shader' );
    // } else {
    //   shape.program = initShaders( gl, 'vertex-shader', 'fragment-shader-simple' );
    // }

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
    // FIXME need contribution from both lights
    shape.ambientProduct = mult(_lightSource[0].lightAmbient, selectedColor);
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

    // Multiply model matrix by camera view to get the model view matrix
    modelViewMatrix = mult(modelViewMatrix, _camera.viewMatrix);
    shape.modelViewMatrix = modelViewMatrix;

    // Calculate normal matrix based on inverse-transpose of model view
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

  };

  var changeHandler = function(evt) {
    if (evt.target.id === 'shape' || _shapes.length === 0) {
      seedOneShape();
    } else {
      var currentShape = _shapes[_shapes.length-1];
      updateShapeWithUserSettings(currentShape);
    }
  };

  var updateShapesWithLightSource = function() {
    var ambientPerLight = [];

    for (var i=0; i<_shapes.length; i++) {
      for (var j=0; j<_lightSources.length; j++) {
        ambientPerLight.push(mult(
          _lightSources[j].lightAmbient,
          _shapes[i].color
        ));
      }
      _shapes[i].ambientProduct = add(tempAmb[0], tempAmb[1]);
    }
  };

  // var enableOrDisableLight = function(enabled) {
  //   if (enabled) {
  //     _shapes.forEach(function(shape) {
  //       shape.program = initShaders( gl, 'vertex-shader', 'fragment-shader' );
  //     });
  //   } else {
  //     _shapes.forEach(function(shape) {
  //       shape.program = initShaders( gl, 'vertex-shader', 'fragment-shader-simple' );
  //     });
  //   }
  // };

  var lightDomElementId = function(elemId, lightIndex) {
    if (lightIndex === 0) {
      return elemId;
    } else {
      return elemId + lightIndex;
    }
  };

  var updateLightSource = function(lightIndex) {
    var currentEnabled = _lightSource[lightIndex].enabled,
      enabled = document.getElementById(lightDomElementId('lightSwitch', lightIndex)).checked,
      lightDiffuse = ColorUtils.hexToGLvec4(document.getElementById(lightDomElementId('lightDiffuse', lightIndex)).value),
      materialDiffuse = ColorUtils.hexToGLvec4(document.getElementById(lightDomElementId('materialDiffuse', lightIndex)).value),
      lightSpecular = ColorUtils.hexToGLvec4(document.getElementById(lightDomElementId('lightSpecular', lightIndex)).value),
      materialSpecular = ColorUtils.hexToGLvec4(document.getElementById(lightDomElementId('materialSpecular', lightIndex)).value),
      lightAmbient = ColorUtils.hexToGLvec4(document.getElementById(lightDomElementId('lightAmbient', lightIndex)).value),
      lightType = DomUtils.getCheckedValue(lightDomElementId('lightType', lightIndex)),
      lightDistance = document.getElementById(lightDomElementId('lightDistance', lightIndex)).valueAsNumber,
      curentLightAmbient = _lightSource[lightIndex].lightAmbient;

    // FIXME handle turning off an individual light
    // if (currentEnabled !== enabled) {
    //   enableOrDisableLight(lightIndex, enabled);
    // }

    // FIXME this wasn't working even with a single light source
    // if (!equal(curentLightAmbient, lightAmbient)) {
    //   updateShapesWithLightSource();
    // }

    // _lightSource[lightIndex].enabled = enabled;
    _lightSource[lightIndex].lightPosition = Light.initPosition(lightDistance, lightType);
    _lightSource[lightIndex].lightAmbient = lightAmbient;
    _lightSource[lightIndex].diffuseProduct = mult(lightDiffuse, materialDiffuse);
    _lightSource[lightIndex].specularProduct = mult(lightSpecular, materialSpecular);

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
    document.getElementById('mshiny').value = 10.0;

    // Light 1
    document.getElementById('lightSwitch').checked = true;
    document.getElementById('lightDiffuse').value = '#ffffff';
    document.getElementById('materialDiffuse').value = '#ffffff';
    document.getElementById('lightSpecular').value = '#ffffff';
    document.getElementById('materialSpecular').value = '#ffffff';
    document.getElementById('lightAmbient').value = '#ffffff';
    document.getElementById('sunlight').checked = true;
    document.getElementById('lightDistance').value = 1.0;
    _lightSource[0] = Light.defaultSource(true, 0.0);

    // Light 2
    document.getElementById('lightSwitch2').checked = false;
    document.getElementById('lightDiffuse2').value = '#ffffff';
    document.getElementById('materialDiffuse2').value = '#ffffff';
    document.getElementById('lightSpecular2').value = '#ffffff';
    document.getElementById('materialSpecular2').value = '#ffffff';
    document.getElementById('lightAmbient2').value = '#ffffff';
    document.getElementById('sunlight2').checked = true;
    document.getElementById('lightDistance2').value = 1.0;
    _lightSource[1] = Light.defaultSource(true, 90.0);
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
