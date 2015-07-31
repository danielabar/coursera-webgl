/**
 * App
 */
(function(window, ColorUtils) {
  'use strict';

  var gl,
    _canvas,
    _shapes = [];

  var drawSphere = function(radius) {
    var lats = 30,
      longs = 30,
      vertices = [],
      indices = [];

    for (var latNumber = 0; latNumber <= lats; ++latNumber) {
      for (var longNumber = 0; longNumber <= longs; ++longNumber) {
        var theta = latNumber * Math.PI / lats;
        var phi = longNumber * 2 * Math.PI / longs;
        var sinTheta = Math.sin(theta);
        var sinPhi = Math.sin(phi);
        var cosTheta = Math.cos(theta);
        var cosPhi = Math.cos(phi);

        var x = cosPhi * sinTheta;
        var y = cosTheta;
        var z = sinPhi * sinTheta;

        vertices.push(radius * x);
        vertices.push(radius * y);
        vertices.push(radius * z);
      }
    }

    for (var latNumberI = 0; latNumberI < lats; ++latNumberI) {
      for (var longNumberI = 0; longNumberI < longs; ++longNumberI) {
        var first = (latNumberI * (longs+1)) + longNumberI;
        var second = first + longs + 1;
        indices.push(first);
        indices.push(second);
        indices.push(first+1);

        indices.push(second);
        indices.push(second+1);
        indices.push(first+1);
      }
    }

    return {
      v: vertices,
      i: indices
    };
  };

  var createNgon = function (n, startAngle, h) {
    var vertices = [],
		  dA = Math.PI*2 / n,
      r = 0.9,
      angle,
      x, y,
      z = 0.0;

    h = h ? h : 0.0;

    for (var i=0; i < n; i++) {
      angle = startAngle + dA*i;
      x = r * Math.cos(angle);
      y = r * Math.sin(angle);
      vertices.push(x);
      vertices.push(y + h);
      vertices.push(z);
    }
    return vertices;
  };

  var drawCylinder = function() {
    var vertices = [],
      indices = [],
      bottomCap = [],
      topCap = [],
      n = 30,
      startAngle = 1,
      h=0.5;

    bottomCap.push(0.0);
    bottomCap.push(0.0);
    bottomCap.push(0.0);
    bottomCap = bottomCap.concat(createNgon(n, startAngle));

    topCap.push(0.0);
    topCap.push(h);
    topCap.push(0.0);
    topCap = topCap.concat(createNgon(n, startAngle, h));
    vertices = bottomCap.concat(topCap);

    // Index bottom cap
    for (var i=0; i<n; i++) {
      if (i === n-1) {
        indices.push(0);
        indices.push(n);
        indices.push(1);
      } else {
        indices.push(0);
        indices.push(i+1);
        indices.push(i+2);
      }
    }

    // Index top cap
    var offset = n+1;
    for (var j=0; j<n; j++) {
      if (j === n-1) {
        indices.push(offset);
        indices.push(n + offset);
        indices.push(1 + offset);
      } else {
        indices.push(offset);
        indices.push(j+1 + offset);
        indices.push(j+2 + offset);
      }
    }

    // Index tube connecting top and bottom
    for (var k=1; i<n-1; k++) {

      // first triangle
      indices.push(k);
      indices.push(k+1);
      indices.push(k+1 + offset);

      // second triangle
      indices.push(k);
      indices.push(k + offset);
      indices.push(k+1 + offset);
    }

    console.dir(vertices);
    console.dir(indices);

    return {
      v: vertices,
      i: indices
    };
  };

  // var drawCylinder = function() {
  //   var lowerCapCenter = [],
  //     lowerCap,
  //     upperCap,
  //     upperCapCenter = [],
  //     indicies = [],
  //     n = 10,
  //     startAngle = 1,
  //     h = 0.5,
  //     totalVerteces;
  //
  //   lowerCapCenter.push(0.0);
  //   lowerCapCenter.push(0.0);
  //   lowerCapCenter.push(0.0);
  //
  //   lowerCap = createNgon(n, startAngle);
  //
  //   upperCap = createNgon(n, startAngle, h);
  //
  //   upperCapCenter.push(0.0);
  //   upperCapCenter.push(0.0 + h);
  //   upperCapCenter.push(0.0);
  //
  //   /**
  //    * let circle1 be lower and circle2 be upper circle ,
  //    * for each point on ith index in circle 1
  //    * 1st triangle{ circle1[i], circle1[i+1], circle2[i]}
  //    * second triangle {circle1[i+1], circle2[i] , circle2[i+1] }
  //    * make sure last connects to first (wrapped).
  //    */
  //   for (var i=0; i<lowerCap.length; i++) {
  //     // first triangle
  //     indicies.push(lowerCap[i]);
  //     indicies.push(lowerCap[i+1]);
  //     indicies.push(upperCap[i]);
  //
  //     // second triangle
  //     indicies.push(lowerCap[i+1]);
  //     indicies.push(upperCap[i]);
  //     indicies.push(upperCap[i+1]);
  //   }
  //
  //   totalVerteces = lowerCapCenter.concat(lowerCap.concat(upperCapCenter.concat(upperCap)));
  //
  //   return {
  //     v: totalVerteces,
  //     i: indicies,
  //     pointsInCap: n+1
  //   };
  //
  // };

  var drawCube = function() {

    var vertices = [
      vec3( -0.5, -0.5,  0.5 ),
      vec3( -0.5,  0.5,  0.5 ),
      vec3(  0.5,  0.5,  0.5 ),
      vec3(  0.5, -0.5,  0.5 ),
      vec3( -0.5, -0.5, -0.5 ),
      vec3( -0.5,  0.5, -0.5 ),
      vec3(  0.5,  0.5, -0.5 ),
      vec3(  0.5, -0.5, -0.5 )
    ];

    var indices = [
      1, 0, 3,
      3, 2, 1,
      2, 3, 7,
      7, 6, 2,
      3, 0, 4,
      4, 7, 3,
      6, 5, 1,
      1, 2, 6,
      4, 5, 6,
      6, 7, 4,
      5, 4, 0,
      0, 1, 5
    ];

    return {
      v: vertices,
      i: indices
    };
  };

  var renderAll = function(shapes) {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    shapes.forEach(function(shape) {

      // Load shaders
      gl.useProgram(shape.program);

      // Load index data onto GPU
      var iBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(shape.indices), gl.STATIC_DRAW);

      // Load vertex buffer onto GPU
      var vBuffer = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, flatten(shape.vertices), gl.STATIC_DRAW );

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
      gl.uniform3fv(scaleLoc, shape.scale);
      gl.uniform3fv(translateLoc, shape.translate);
      gl.uniform4fv(colorLoc, shape.color);

      // TODO Should have module per shape with draw method
      // if (shape.type === 'cylinder') {
        /**
          1) draw lower cap using drawArrays from 0th vertex to 3*n th vertex (1st center to end of first circle) using gl.TRIANGLE_FAN (as center is common for each triangle)
          2) draw middle curve using drawElements () call for vertices of circle1 and circle2 part of vertex buffer using indices Array (send using flatten())
          3) draw upper cap, same as first circle cap , but with center2 and circle2 points using gl.TriangleFAN
        */
        // temp experiment - draw lower cap as line loop
        // gl.drawArrays( gl.LINE_LOOP, 0, shape.data.pointsInCap );
      // } else {
        gl.drawElements( gl.LINE_LOOP, shape.indices.length, gl.UNSIGNED_SHORT, 0 );
      // }

    });
  };

  var addShape = function(shapeOption) {
    var shape = {type: shapeOption},
      shapeVI;

    shape.program = initShaders( gl, 'vertex-shader', 'fragment-shader' );

    if (shapeOption === 'sphere') {
      shapeVI = drawSphere(1);
    }

    if (shapeOption === 'cylinder') {
      shapeVI = drawCylinder(1);
    }

    if (shapeOption === 'cube') {
      shapeVI = drawCube(1);
    }

    shape.vertices = shapeVI.v;
    shape.indices = shapeVI.i;
    shape.data = shapeVI;

    shape.color = ColorUtils.hexToGLvec4(document.getElementById('shapeColor').value);
    shape.theta = [
      document.getElementById('rotateX').valueAsNumber,
      document.getElementById('rotateY').valueAsNumber,
      document.getElementById('rotateZ').valueAsNumber
    ];
    shape.scale = [
      document.getElementById('scaleX').valueAsNumber,
      document.getElementById('scaleY').valueAsNumber,
      document.getElementById('scaleZ').valueAsNumber
    ];
    shape.translate = [
      document.getElementById('translateX').valueAsNumber,
      document.getElementById('translateY').valueAsNumber,
      document.getElementById('translateZ').valueAsNumber
    ];

    return shape;
  };

  var update = function(evt) {
    var shapeSelect = document.getElementById('shape');
    var shapeOption = shapeSelect.options[shapeSelect.selectedIndex].value;
    if (evt.target.id === 'addShape' || evt.target.id === 'addShapeIcon') {
      _shapes.push(addShape(shapeOption));
      renderAll(_shapes);
    }
  };

  var App = {

    init: function() {

      // Setup canvas
      _canvas = document.getElementById('gl-canvas');
      gl = WebGLUtils.setupWebGL( _canvas, {preserveDrawingBuffer: true} );
      if ( !gl ) { alert( 'WebGL isn\'t available' ); }

      // Register settings event handlers
      document.getElementById('settings').addEventListener('click', update);

      // Configure WebGL
      gl.viewport( 0, 0, _canvas.width, _canvas.height );
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.enable(gl.DEPTH_TEST);

      renderAll(_shapes);
    }

  };

  window.App = App;

}(window, window.ColorUtils));


/**
 * App Init
 */
(function(App) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    App.init();
  });

}(window.App || (window.App = {})));
