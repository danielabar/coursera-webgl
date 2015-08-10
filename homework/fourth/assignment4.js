/**
 * App
 */
(function(window, ColorUtils, Shape, DomUtils) {
  'use strict';

  var gl,
    _canvas,
    _shapes = [],
    _editing = true,
    _camera = {
      modelViewMatrix: mat4(),
      projectionMatrix: mat4(),
      normalMatrix: mat4(),
      theta: 0,
      phi: 0,
      dz: 0,
      sx: 1,
      sy: 1,
      sz: 1
    },
    _cameraRotationInc = 15,
    _cameraDZInc = 0.5;

  var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
  var lightAmbient = vec4(0.7, 0.6, 0.7, 1.0);
  var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
  var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

  var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
  var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
  var materialShininess = 40.0;

  var diffuseProduct = mult(lightDiffuse, materialDiffuse);
  var specularProduct = mult(lightSpecular, materialSpecular);

  var ctm;
  var ambientColor, diffuseColor, specularColor;


  var renderShape = function(shape, isBorder) {
    var modelViewMatrix;

    // Load shaders
    gl.useProgram(shape.program);

    // Load normal buffer onto GPU
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(shape.normals), gl.STATIC_DRAW );

    // Associate shader variables with normal data buffer
    var vNormal = gl.getAttribLocation( shape.program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    // Load vertex buffer onto GPU
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    if (isBorder) {
      gl.bufferData( gl.ARRAY_BUFFER, flatten(shape.border.vertices), gl.STATIC_DRAW );
    } else {
      gl.bufferData( gl.ARRAY_BUFFER, flatten(shape.vertices), gl.STATIC_DRAW );
    }

    // Associate shader variables with vertex data buffer
    var vPosition = gl.getAttribLocation( shape.program, 'vPosition' );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Uniform vars for user specified parameters
    // var colorLoc = gl.getUniformLocation(shape.program, 'fColor');
    var thetaLoc = gl.getUniformLocation(shape.program, 'theta');
    var scaleLoc = gl.getUniformLocation(shape.program, 'scale');
    var translateLoc = gl.getUniformLocation(shape.program, 'translate');
    var modelViewMatrixLoc = gl.getUniformLocation(shape.program, "modelViewMatrix" );
    var projectionMatrixLoc = gl.getUniformLocation( shape.program, "projectionMatrix" );
    var normalMatrixLoc = gl.getUniformLocation( shape.program, "normalMatrix" );

    gl.uniform3fv(thetaLoc, shape.theta);

    if (isBorder) {
      gl.uniform3fv(scaleLoc, shape.border.scale);
    } else {
      gl.uniform3fv(scaleLoc, shape.scale);
    }

    gl.uniform3fv(translateLoc, shape.translate);

    // if (isBorder) {
    //     gl.uniform4fv(colorLoc, vec4(1.0, 1.0, 1.0, 1.0));
    // } else {
    //   gl.uniform4fv(colorLoc, shape.color);
    // }

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(_camera.modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(_camera.projectionMatrix) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(_camera.normalMatrix) );

    gl.uniform4fv( gl.getUniformLocation(shape.program, "ambientProduct"),flatten(shape.ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(shape.program, "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(shape.program, "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(shape.program, "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(shape.program, "shininess"),materialShininess );

    if (isBorder) {
      gl.drawArrays( gl.LINE_LOOP, 0, shape.border.vertices.length/3 );
    } else {
      // gl.drawElements( gl.LINE_LOOP, shape.indices.length, gl.UNSIGNED_SHORT, 0 );
      // for( var i=0; i<shape.vertices.length; i+=3) {
      //   gl.drawArrays( gl.TRIANGLES, i, 3 );
      //   gl.uniform4fv(colorLoc, flatten(vec4(1.0, 1.0, 1.0, 1.0)));
      //   gl.drawArrays( gl.LINE_LOOP, i, 3 );
      // }
      // for(var i=0; i<shape.vertices.length; i+=4) {
      //   // gl.uniform4fv(colorLoc, shape.color);
      //   gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
      //   gl.uniform4fv(colorLoc, flatten(vec4(1.0, 1.0, 1.0, 1.0)));
      //   gl.drawArrays( gl.LINE_LOOP, i, 4 );
      // }
      for( var i=0; i<shape.vertices.length; i+=3) {
        // var randColor = vec4(Math.random(), Math.random(), Math.random(), 1.0);
        // gl.uniform4fv(colorLoc, flatten(randColor));
        // gl.uniform4fv(colorLoc, flatten(shape.color));
        gl.drawArrays( gl.TRIANGLES, i, 3 );
        // gl.uniform4fv(colorLoc, flatten(vec4(1.0, 1.0, 1.0, 1.0)));
        // gl.drawArrays( gl.LINE_LOOP, i, 3 );
      }

    }
  };

  var render = function(shapes, oneShape) {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (oneShape) {
      // renderShape(oneShape, true);
      renderShape(oneShape);
    }

    shapes.forEach(function(shape) {
      renderShape(shape);
    });

  };

  var addShape = function(shapeType, editing) {
    var shape = {type: shapeType},
      shapeVI,
      materialAmbient;

    shape.program = initShaders( gl, 'vertex-shader', 'fragment-shader' );

    if (editing) {
      shapeVI = Shape.generate(shapeType, {outlineOnly: true});
    } else {
      shapeVI = Shape.generate(shapeType);
    }
    shape.vertices = shapeVI.v;
    shape.normals = shapeVI.n;

    materialAmbient = ColorUtils.hexToGLvec4(document.getElementById('shapeColor').value);
    shape.ambientProduct = mult(lightAmbient, materialAmbient);

    shape.theta = [
      document.getElementById('rotateX').valueAsNumber,
      document.getElementById('rotateY').valueAsNumber,
      document.getElementById('rotateZ').valueAsNumber
    ];

    if (editing) {
      shape.scale = [
        document.getElementById('scaleX').valueAsNumber * 1.1,
        document.getElementById('scaleY').valueAsNumber * 1.1,
        document.getElementById('scaleZ').valueAsNumber * 1.1
      ];
    } else {
      shape.scale = [
        document.getElementById('scaleX').valueAsNumber,
        document.getElementById('scaleY').valueAsNumber,
        document.getElementById('scaleZ').valueAsNumber
      ];
    }

    shape.translate = [
      document.getElementById('translateX').valueAsNumber,
      document.getElementById('translateY').valueAsNumber,
      document.getElementById('translateZ').valueAsNumber
    ];

    return shape;
  };

  var updateCamera = function(evt) {
    var t, ry, rx, s, modelView;

    if (evt.target.id === 'cameraCenter') {
      _camera.theta = 0;
      _camera.phi = 0;
    }

    // TODO Rotations should cycle back to 0 after 360
    if (evt.target.id === 'cameraUp') {
      _camera.theta -= _cameraRotationInc;
    }

    if (evt.target.id === 'cameraDown') {
      _camera.theta += _cameraRotationInc;
    }

    if (evt.target.id === 'cameraLeft') {
      _camera.phi -= _cameraRotationInc;
    }

    if (evt.target.id === 'cameraRight') {
      _camera.phi += _cameraRotationInc;
    }

    if (evt.target.id === 'zoomHome') {
      _camera.sx = 1.0;
      _camera.sy = 1.0;
      _camera.sz = 1.0;
    }

    if (evt.target.id === 'zoomIn') {
      _camera.sx += _cameraDZInc;
      _camera.sy += _cameraDZInc;
      _camera.sz += _cameraDZInc;
    }

    if (evt.target.id === 'zoomOut') {
      _camera.sx -= _cameraDZInc;
      _camera.sy -= _cameraDZInc;
      _camera.sz -= _cameraDZInc;
    }

    ry = rotateY(_camera.phi);
    rx = rotateX(_camera.theta);
    s = genScaleMatrix(_camera.sx, _camera.sy, _camera.sz);

    modelView = mat4();
    modelView = mult(modelView, ry);
    modelView = mult(modelView, rx);
    modelView = mult(modelView, s);

    _camera.modelViewMatrix = modelView;

    render(_shapes);
  };

  var update = function(evt) {
    var shapeSelect = document.getElementById('shape');
    var shapeType = shapeSelect.options[shapeSelect.selectedIndex].value;

    if (evt.target.id === 'commitShape' || evt.target.id === 'commitShapeIcon') {
      _editing = false;
      _shapes.push(addShape(shapeType));
      render(_shapes);

      document.getElementById('commitShape').classList.add( 'toggle' );
      document.getElementById('newShape').classList.remove( 'toggle' );
      document.getElementById('editMessage').classList.add( 'toggle' );
      document.getElementById('addMessage').classList.remove( 'toggle' );
      document.getElementById('cameraControls').classList.remove( 'toggle' );

      DomUtils.disableInputs();
    }

    if (evt.target.id === 'newShape' || evt.target.id === 'newShapeIcon') {
      _editing = true;

      DomUtils.enableInputs();
      setDefaults();
      edit();

      document.getElementById('newShape').classList.add( 'toggle' );
      document.getElementById('commitShape').classList.remove( 'toggle' );
      document.getElementById('addMessage').classList.add( 'toggle' );
      document.getElementById('editMessage').classList.remove( 'toggle' );
      document.getElementById('cameraControls').classList.add( 'toggle' );

    }

    if (evt.target.id === 'clear' || evt.target.id === 'clearIcon') {
      _editing = true;
      _shapes = [];

      // Re-seed the system with one shape
      DomUtils.enableInputs();
      setDefaults();
      edit();

      document.getElementById('newShape').classList.add( 'toggle' );
      document.getElementById('commitShape').classList.remove( 'toggle' );
      document.getElementById('addMessage').classList.add( 'toggle' );
      document.getElementById('editMessage').classList.remove( 'toggle' );
      document.getElementById('cameraControls').classList.add( 'toggle' );
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

  var edit = function() {
    if (_editing) {
      var shapeSelect = document.getElementById('shape');
      var shapeType = shapeSelect.options[shapeSelect.selectedIndex].value;
      var shapeToEdit = addShape(shapeType);

      shapeToEdit.border = addShape(shapeType, true);
      render(_shapes, shapeToEdit);
    }
  };

  var setDefaults = function() {
    // _camera = {
    //   modelViewMatrix: mat4(),
    //   theta: 0,
    //   phi: 0,
    //   dz: 0,
    //   sx: 1,
    //   sy: 1,
    //   sz: 1
    // };

    document.getElementById('shape').value = 'Tetrahedron';
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
  };

  var App = {

    init: function() {

      // Setup canvas
      _canvas = document.getElementById('gl-canvas');
      gl = WebGLUtils.setupWebGL( _canvas, {preserveDrawingBuffer: true} );
      if ( !gl ) { alert( 'WebGL isn\'t available' ); }

      // Register event handlers
      document.getElementById('settings').addEventListener('click', update);
      document.getElementById('settings').addEventListener('change', edit);
      document.getElementById('cameraControls').addEventListener('click', updateCamera);

      // Configure WebGL
      gl.viewport( 0, 0, _canvas.width, _canvas.height );
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      gl.enable(gl.POLYGON_OFFSET_FILL);
      gl.polygonOffset(1.0, 2.0);

      // For now construct this one time
      var at = vec3(0.0, 0.0, 0.0);
      var up = vec3(0.0, 1.0, 0.0);
      var near = -10;
      var far = 10;
      var radius = 1.5;
      var theta  = 0.0;
      var phi    = 0.0;
      var dr = 5.0 * Math.PI/180.0;
      var left = -3.0;
      var right = 3.0;
      var ytop =3.0;
      var bottom = -3.0;
      var eye = vec3(
        radius*Math.sin(theta) * Math.cos(phi),
        radius*Math.sin(theta) * Math.sin(phi),
        radius*Math.cos(theta)
      );
      _camera.modelViewMatrix = lookAt(eye, at , up);
      _camera.projectionMatrix = ortho(left, right, bottom, ytop, near, far);
      _camera.normalMatrix = [
        vec3(_camera.modelViewMatrix[0][0], _camera.modelViewMatrix[0][1], _camera.modelViewMatrix[0][2]),
        vec3(_camera.modelViewMatrix[1][0], _camera.modelViewMatrix[1][1], _camera.modelViewMatrix[1][2]),
        vec3(_camera.modelViewMatrix[2][0], _camera.modelViewMatrix[2][1], _camera.modelViewMatrix[2][2])
      ];

      // Seed the system with one shape
      setDefaults();
      edit();
    }

  };

  window.App = App;

}(window, window.ColorUtils, window.Shape, window.DomUtils));


/**
 * App Init
 */
(function(App) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    App.init();
  });

}(window.App || (window.App = {})));
