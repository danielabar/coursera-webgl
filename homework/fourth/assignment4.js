/**
 * App
 */
(function(window, ColorUtils, Shape, DomUtils) {
  'use strict';

  var gl,
    _canvas,
    _shapes = [],
    _camera = {
      modelViewMatrix: mat4(),
      projectionMatrix: mat4(),
      normalMatrix: mat4(),
    },
    _lighting = true;

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
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
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
      gl.uniform4fv( gl.getUniformLocation(shape.program, "ambientProduct"),flatten(shape.ambientProduct) );
      gl.uniform4fv( gl.getUniformLocation(shape.program, "diffuseProduct"),flatten(diffuseProduct) );
      gl.uniform4fv( gl.getUniformLocation(shape.program, "specularProduct"),flatten(specularProduct) );
      gl.uniform4fv( gl.getUniformLocation(shape.program, "lightPosition"),flatten(lightPosition) );
      gl.uniform1f( gl.getUniformLocation(shape.program, "shininess"),materialShininess );
    } else {
      gl.uniform4fv(gl.getUniformLocation(shape.program, 'fColor'), shape.color);
    }

    // draw
    for( var i=0; i<shape.vertices.length; i+=3) {
      gl.drawArrays( gl.TRIANGLES, i, 3 );
    }

  };

  var render = function(shapes) {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    shapes.forEach(function(shape) {
      renderShape(shape);
    });

  };

  var generateShape = function(shapeType, update) {
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

    if (update) {
      updateShapeWithUserSettings(shape);
    }

    return shape;
  };

  var updateShapeWithUserSettings = function(shape) {
    // var shapeSelect = document.getElementById('shape');
    // var shapeType = shapeSelect.options[shapeSelect.selectedIndex].value;
    // if (shape.type !== shapeType) {
    //   console.log('generating shapeType: ' + shapeType);
    //   shape = generateShape(shapeType, false);
    //   console.dir(shape);
    // }

    var modelView = mat4(),
      thetaOpts = [],
      scaleOpts = [],
      translateOpts = [],
      normalMatrix;

    // Store the plain old color plus lit color in case user turns off lighting
    var selectedColor = ColorUtils.hexToGLvec4(document.getElementById('shapeColor').value);
    shape.color = selectedColor;
    shape.ambientProduct = mult(lightAmbient, selectedColor);

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

    modelView = mult(modelView, translate(translateOpts[0], translateOpts[1], translateOpts[2]));
    modelView = mult(modelView, genScaleMatrix(scaleOpts[0], scaleOpts[1], scaleOpts[2]));

    normalMatrix = inverseMat3(flatten(modelView));
    normalMatrix = transpose(normalMatrix);

    modelView = mult(modelView, rotate(thetaOpts[0], [1, 0, 0] ));
    modelView = mult(modelView, rotate(thetaOpts[1], [0, 1, 0] ));
    modelView = mult(modelView, rotate(thetaOpts[2], [0, 0, 1] ));

    shape.modelViewMatrix = modelView;
    shape.normalMatrix = normalMatrix;
  };

  var seedOneShape = function() {
    var shapeSelect = document.getElementById('shape');
    var shapeType = shapeSelect.options[shapeSelect.selectedIndex].value;
    _shapes.push(generateShape(shapeType, true));
    render(_shapes);
  };

  var actionHandler = function(evt) {

    if (evt.target.id === 'newShape' || evt.target.id === 'newShapeIcon') {
      setDefaults();
      seedOneShape();
    }

    if (evt.target.id === 'clear' || evt.target.id === 'clearIcon') {
      _shapes = [];
      setDefaults();
      seedOneShape();
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
      render(_shapes);
    }
  };

  // TODO: Handle shape selection dropdown separately and make that generate a new shape
  // always edit the most recently added shape, would be nice to have picking and able to edit any older one
  var changeHandler = function() {
    var currentShape = _shapes[_shapes.length-1];
    updateShapeWithUserSettings(currentShape);
    render(_shapes);
  };

  var setDefaults = function() {
    document.getElementById('shape').value = 'Tetrahedron';
    // document.getElementById('shape').value = 'Sphere';
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

    // document.getElementById('lightSwtich').checked = true;
  };

  var App = {

    init: function() {

      // Setup canvas
      _canvas = document.getElementById('gl-canvas');
      gl = WebGLUtils.setupWebGL( _canvas, {preserveDrawingBuffer: true} );
      if ( !gl ) { alert( 'WebGL isn\'t available' ); }

      // Register event handlers
      document.getElementById('settings').addEventListener('click', actionHandler);
      document.getElementById('settings').addEventListener('change', changeHandler);

      // Configure WebGL
      gl.viewport( 0, 0, _canvas.width, _canvas.height );
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      gl.enable(gl.POLYGON_OFFSET_FILL);
      gl.polygonOffset(1.0, 2.0);

      // var at = vec3(0.0, 0.0, 0.0);
      // var up = vec3(0.0, 1.0, 0.0);
      // var radius = 1.5;
      // var theta  = 15.0;
      // var phi    = 0.0;
      // var dr = 5.0 * Math.PI/180.0;
      // var eye = vec3(
      //   radius*Math.sin(theta) * Math.cos(phi),
      //   radius*Math.sin(theta) * Math.sin(phi),
      //   radius*Math.cos(theta)
      // );
      // _camera.modelViewMatrix = lookAt(eye, at , up);

      // TODO Somehow user should be able to manipulate at least some of these
      var far = 10;
      var left = -3.0;
      var right = 3.0;
      var bottom = -3.0;
      var ytop =3.0;
      var near = -10;
      _camera.projectionMatrix = ortho(left, right, bottom, ytop, near, far);

      // var normalMatrix = inverseMat3(flatten(_camera.modelViewMatrix));
      // normalMatrix = transpose(normalMatrix);
      // _camera.normalMatrix = normalMatrix;

      // Seed the system with one shape
      setDefaults();
      seedOneShape();
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
