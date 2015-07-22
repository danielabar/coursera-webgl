/**
 * DomUtils
 */
(function(window) {
  'use strict';

  var DomUtils = {

    getCheckedValue: function(elementName) {
      var checkedVal,
        values = document.getElementsByName(elementName);

      for (var i = 0; i < values.length; i++) {
        if (values[i].checked) {
            checkedVal = values[i].value;
            break;
        }
      }

      return checkedVal;
    },

    getCheckedNumber: function(elementName) {
      var val = this.getCheckedValue(elementName);
      return val ? parseInt(val, 10) : null;
    }

  };

  window.DomUtils = DomUtils;

})(window);

/**
 * ColorUtils
 */
(function(window) {
  'use strict';

  var ColorUtils = {

    // http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    hexToRgb: function(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
      } : null;
    },

    rgbToGL: function(rgb) {
      return rgb ? {
        r: rgb.r / 255,
        g: rgb.g / 255,
        b: rgb.b / 255
      } : null;
    },

    hexToGL: function(hex) {
      return this.rgbToGL(
        this.hexToRgb(hex)
      );
    }

  };

  window.ColorUtils = ColorUtils;

})(window);

/**
 * CoordUtils
 */
(function(window) {
  'use strict';

  var windowToClipX = function(clientX, width) {
    var numerator = 2 * clientX;
    var scaled = numerator / width;
    return -1 + scaled;
  };

  var windowToClipY = function(clientY, height) {
    var numerator = 2 * (height - clientY);
    var scaled = numerator / height;
    return -1 + scaled;
  };

  var CoordUtils = {

    // http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
    getRelativeCoords: function(event) {
      if (event.offsetX !== undefined && event.offsetY !== undefined) {
        return { x: event.offsetX, y: event.offsetY };
      } else {
        return { x: event.layerX, y: event.layerY };
      }
    },

    windowToClip: function(clientX, clientY, width, height) {
      var clipX = windowToClipX(clientX, width);
      var clipY = windowToClipY(clientY, height);
      return vec2(clipX, clipY);
    }

  };

  window.CoordUtils = CoordUtils;

})(window);

/**
 * App
 */
(function(window, CoordUtils, ColorUtils, DomUtils) {
  'use strict';

  var MAX_SHAPES = 10000;
  var VERTEX_PER_SHAPE = 4;       // 4 for the rectangle representing two triangles
  var VERTEX_PER_END_SHAPE = 6;   // 4 for the rectangle representing two triangles + dupe at each end to simulate a line break

  var _gl,
    _program,
    _vBuffer,
    _cBuffer,
    _canvas,
    _numDrawn = 0,
    _numEndDrawn = 0,
    _dragStartPoint,
    _rgbColor = {r: 1.0, g: 0.0, b: 0.0},
    _lineWidth = 1;

  var updateSettings = function(evt) {
    evt.preventDefault();
    _rgbColor = ColorUtils.hexToGL(document.getElementById('squareColor').value);
    _lineWidth = DomUtils.getCheckedNumber('lineWidth');
  };

  var addColor = function() {
    var colors = [];
    for (var i=0; i<VERTEX_PER_SHAPE; i++) {
      colors.push(_rgbColor.r, _rgbColor.g, _rgbColor.b);
    }
    var colorOffset = (sizeof.vec3 * VERTEX_PER_SHAPE * _numDrawn) + (sizeof.vec3 * VERTEX_PER_END_SHAPE * _numEndDrawn);
    _gl.bindBuffer(_gl.ARRAY_BUFFER, _cBuffer);
    _gl.bufferSubData(_gl.ARRAY_BUFFER, colorOffset, flatten(colors));
  };

  var addEndColor = function() {
    var colors = [];
    for (var i=0; i<VERTEX_PER_END_SHAPE; i++) {
      colors.push(_rgbColor.r, _rgbColor.g, _rgbColor.b);
    }
    var colorOffset = (sizeof.vec3 * VERTEX_PER_SHAPE * _numDrawn) + (sizeof.vec3 * VERTEX_PER_END_SHAPE * _numEndDrawn);
    _gl.bindBuffer(_gl.ARRAY_BUFFER, _cBuffer);
    _gl.bufferSubData(_gl.ARRAY_BUFFER, colorOffset, flatten(colors));
  };

  var drawEndLine = function(canvasPoint1, canvasPoint2) {
    var dx = canvasPoint2.x - canvasPoint1.x,
      dy = canvasPoint2.y - canvasPoint1.y,
      t = Math.sqrt(_lineWidth * _lineWidth / (dx * dx + dy * dy)),
      normalX = t * -dy,
      normalY = t * dx;

    var a = CoordUtils.windowToClip(canvasPoint1.x - normalX, canvasPoint1.y - normalY, _canvas.width, _canvas.height);
    var b = CoordUtils.windowToClip(canvasPoint1.x + normalX, canvasPoint1.y + normalY, _canvas.width, _canvas.height);
    var c = CoordUtils.windowToClip(canvasPoint2.x - normalX, canvasPoint2.y - normalY, _canvas.width, _canvas.height);
    var d = CoordUtils.windowToClip(canvasPoint2.x + normalX, canvasPoint2.y + normalY, _canvas.width, _canvas.height);

    var verteces = [ a, a, b, c, d, d ];

    var offset = (sizeof.vec2 * VERTEX_PER_SHAPE * _numDrawn) + (sizeof.vec2 * VERTEX_PER_END_SHAPE * _numEndDrawn) ;
    _gl.bindBuffer(_gl.ARRAY_BUFFER, _vBuffer);
    _gl.bufferSubData(_gl.ARRAY_BUFFER, offset, flatten(verteces));

    addEndColor();

    render();
    _numEndDrawn++;
  };

  var drawLine = function(canvasPoint1, canvasPoint2) {
    var dx = canvasPoint2.x - canvasPoint1.x,
      dy = canvasPoint2.y - canvasPoint1.y,
      t = Math.sqrt(_lineWidth * _lineWidth / (dx * dx + dy * dy)),
      normalX = t * -dy,
      normalY = t * dx;

    var a = CoordUtils.windowToClip(canvasPoint1.x - normalX, canvasPoint1.y - normalY, _canvas.width, _canvas.height);
    var b = CoordUtils.windowToClip(canvasPoint1.x + normalX, canvasPoint1.y + normalY, _canvas.width, _canvas.height);
    var c = CoordUtils.windowToClip(canvasPoint2.x - normalX, canvasPoint2.y - normalY, _canvas.width, _canvas.height);
    var d = CoordUtils.windowToClip(canvasPoint2.x + normalX, canvasPoint2.y + normalY, _canvas.width, _canvas.height);

    var verteces = [ a, b, c, d ];

    // var offset = (sizeof.vec2 * VERTEX_PER_SHAPE * _numDrawn) + (sizeof.vec2 * VERTEX_PER_END_SHAPE * _numEndDrawn) ;
    var offset = (sizeof.vec2 * VERTEX_PER_SHAPE * _numDrawn) + (sizeof.vec2 * VERTEX_PER_END_SHAPE * _numEndDrawn) ;
    _gl.bindBuffer(_gl.ARRAY_BUFFER, _vBuffer);
    _gl.bufferSubData(_gl.ARRAY_BUFFER, offset, flatten(verteces));

    addColor();

    render();
    _numDrawn++;
  };

  var render = function() {
    _gl.clear( _gl.COLOR_BUFFER_BIT );
    _gl.drawArrays( _gl.TRIANGLE_STRIP, 0, (_numDrawn * VERTEX_PER_SHAPE) + (_numEndDrawn * VERTEX_PER_END_SHAPE) );
  };

  var dragStart = function(evt) {
    _dragStartPoint = CoordUtils.getRelativeCoords(evt);
  };

  // Debounce?
  var dragging = function(evt) {
    var currentPoint;
    if (_dragStartPoint) {
      currentPoint = CoordUtils.getRelativeCoords(evt);
      drawLine(_dragStartPoint, currentPoint);
      _dragStartPoint = currentPoint;
    }
  };

  var dragEnd = function(evt) {
    var currentPoint = CoordUtils.getRelativeCoords(evt);
    drawEndLine(_dragStartPoint, currentPoint);
    _dragStartPoint = null;
  };

  var initBufferSize = function() {
    var sizeOfVertex = sizeof.vec2;
    var sizeOfLine = sizeOfVertex * 2;
    return sizeOfLine * MAX_SHAPES;
  };

  var App = {

    init: function() {

      // Setup canvas
      _canvas = document.getElementById('gl-canvas');
      _gl = WebGLUtils.setupWebGL( _canvas );
      if ( !_gl ) { alert( 'WebGL isn\'t available' ); }

      // Register settings event handler
      document.getElementById('settings').addEventListener('change', updateSettings);

      // Register canvas event handlers
      _canvas.addEventListener('mousedown', dragStart);
      _canvas.addEventListener('mousemove', dragging);
      _canvas.addEventListener('mouseup', dragEnd);

      // Configure WebGL
      _gl.viewport( 0, 0, _canvas.width, _canvas.height );
      _gl.clearColor(0.0, 0.0, 0.0, 1.0);
      _gl.lineWidth(_lineWidth);

      // Load shaders
      _program = initShaders( _gl, 'vertex-shader', 'fragment-shader' );
      _gl.useProgram( _program );

      // Load an empty vertex buffer onto the GPU
      _vBuffer = _gl.createBuffer();
      _gl.bindBuffer( _gl.ARRAY_BUFFER, _vBuffer );
      _gl.bufferData( _gl.ARRAY_BUFFER, initBufferSize(), _gl.STATIC_DRAW );

      // Associate shader variables with vertex data buffer
      var vPosition = _gl.getAttribLocation( _program, 'vPosition' );
      _gl.vertexAttribPointer( vPosition, 2, _gl.FLOAT, false, 0, 0 );
      _gl.enableVertexAttribArray( vPosition );

      // Load an empty color buffer onto the GPU
      _cBuffer = _gl.createBuffer();
      _gl.bindBuffer( _gl.ARRAY_BUFFER, _cBuffer );
      _gl.bufferData( _gl.ARRAY_BUFFER, initBufferSize(), _gl.STATIC_DRAW );

      // Associate shader variables with color data buffer
      var vColor = _gl.getAttribLocation( _program, 'vColor' );
      _gl.vertexAttribPointer( vColor, 3, _gl.FLOAT, false, 0, 0 );
      _gl.enableVertexAttribArray( vColor );

      render();
    }

  };

  window.App = App;

}(window, window.CoordUtils, window.ColorUtils, window.DomUtils));


/**
 * App Init
 */
(function(App) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    App.init();
  });

}(window.App || (window.App = {})));
