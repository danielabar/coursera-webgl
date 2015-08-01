/**
 * App
 */
(function(window, ColorUtils, Shape) {
  'use strict';

  var gl,
    _canvas,
    _shapes = [],
    _editing = true;

  var renderShape = function(shape, isBorder) {
    // Load shaders
    gl.useProgram(shape.program);

    // Load index data onto GPU
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(shape.indices), gl.STATIC_DRAW);

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
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Uniform vars for user specified parameters
    var colorLoc = gl.getUniformLocation(shape.program, 'fColor');
    var thetaLoc = gl.getUniformLocation(shape.program, 'theta');
    var scaleLoc = gl.getUniformLocation(shape.program, 'scale');
    var translateLoc = gl.getUniformLocation(shape.program, 'translate');

    gl.uniform3fv(thetaLoc, shape.theta);

    if (isBorder) {
      gl.uniform3fv(scaleLoc, shape.border.scale);
    } else {
      gl.uniform3fv(scaleLoc, shape.scale);
    }

    gl.uniform3fv(translateLoc, shape.translate);

    if (isBorder) {
        gl.uniform4fv(colorLoc, vec4(1.0, 1.0, 1.0, 1.0));
    } else {
      gl.uniform4fv(colorLoc, shape.color);
    }

    if (isBorder) {
      gl.drawArrays( gl.LINE_LOOP, 0, shape.border.vertices.length/3 );
    } else {
      gl.drawElements( gl.LINE_LOOP, shape.indices.length, gl.UNSIGNED_SHORT, 0 );
    }
  };

  var render = function(shapes, oneShape) {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (oneShape) {
      renderShape(oneShape, true);
      renderShape(oneShape);
    }

    shapes.forEach(function(shape) {
      renderShape(shape);
    });

  };

  var addShape = function(shapeType, editing) {
    var shape = {type: shapeType},
      shapeVI;

    shape.program = initShaders( gl, 'vertex-shader', 'fragment-shader' );

    if (editing) {
      shapeVI = Shape.generate(shapeType, {outlineOnly: true});
    } else {
      shapeVI = Shape.generate(shapeType);
    }
    shape.vertices = shapeVI.v;
    shape.indices = shapeVI.i;

    shape.color = ColorUtils.hexToGLvec4(document.getElementById('shapeColor').value);

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

  var update = function(evt) {
    var shapeSelect = document.getElementById('shape');
    var shapeType = shapeSelect.options[shapeSelect.selectedIndex].value;

    if (evt.target.id === 'commitShape' || evt.target.id === 'commitShapeIcon') {
      _editing = false;
      _shapes.push(addShape(shapeType));
      render(_shapes);

      document.getElementById('commitShape').classList.add( 'toggle' );
      document.getElementById('newShape').classList.remove( 'toggle' );
    }

    if (evt.target.id === 'newShape' || evt.target.id === 'newShapeIcon') {
      _editing = true;
      setDefaults();
      edit();

      document.getElementById('newShape').classList.add( 'toggle' );
      document.getElementById('commitShape').classList.remove( 'toggle' );
    }

    if (evt.target.id === 'clear' || evt.target.id === 'clearIcon') {
      _editing = true;
      _shapes = [];

      // Re-seed the system with one shape
      setDefaults();
      edit();

      document.getElementById('newShape').classList.add( 'toggle' );
      document.getElementById('commitShape').classList.remove( 'toggle' );
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
    document.getElementById('shape').value = 'Sphere';
    document.getElementById('shapeColor').value = '#ff0000';

    document.getElementById('rotateX').value = 0;
    document.getElementById('rxv').value = 0;
    document.getElementById('rotateY').value = 0;
    document.getElementById('ryv').value = 0;
    document.getElementById('rotateZ').value = 0;
    document.getElementById('rzv').value = 0;

    document.getElementById('scaleX').value = 0.2;
    document.getElementById('sxv').value = 0.2;
    document.getElementById('scaleY').value = 0.2;
    document.getElementById('syv').value = 0.2;
    document.getElementById('scaleZ').value = 0.2;
    document.getElementById('szv').value = 0.2;

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

      // Register settings event handlers
      document.getElementById('settings').addEventListener('click', update);
      document.getElementById('settings').addEventListener('change', edit);

      // Configure WebGL
      gl.viewport( 0, 0, _canvas.width, _canvas.height );
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.enable(gl.DEPTH_TEST);

      // Seed the system with one shape
      setDefaults();
      edit();
    }

  };

  window.App = App;

}(window, window.ColorUtils, window.Shape));


/**
 * App Init
 */
(function(App) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    App.init();
  });

}(window.App || (window.App = {})));
