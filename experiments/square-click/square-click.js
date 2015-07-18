/**
 * DomUtils
 */
(function(window) {
  'use strict';

  var DomUtils = {

    getCheckedValue: function(id) {
      var checkedVal,
        values = document.getElementsByName(id);

      for (var i = 0; i < values.length; i++) {
        if (values[i].checked) {
            checkedVal = values[i].value;
            break;
        }
      }

      return checkedVal;
    }

  };

  window.DomUtils = DomUtils;

})(window);


/**
 * Transformer
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

  var Transformer = {

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

  window.Transformer = Transformer;

})(window);


/**
 * App
 */
(function(window, Transformer, DomUtils) {
  'use strict';

  var gl,
    _program,
    _vBuffer,
    _cBuffer,
    _canvas,
    _numDrawn = 0,
    _sizePx = 10;

  var updateSettings = function(evt) {
    evt.preventDefault();
    _sizePx = parseInt(DomUtils.getCheckedValue('squareSize'), 10);
  };

  var addSquare = function(evt) {
    evt.preventDefault();

    var canvasPoint = Transformer.getRelativeCoords(evt);

    var bottomLeftX = canvasPoint.x;
    var bottomLeftY = canvasPoint.y + _sizePx;

    var bottomRightX = canvasPoint.x + _sizePx;
    var bottomRightY = canvasPoint.y + _sizePx;

    var topRightX = canvasPoint.x + _sizePx;
    var topRightY = canvasPoint.y;

    var topLeftX = canvasPoint.x;
    var topLeftY = canvasPoint.y;

    // 6 vertexes -> 2 triangles -> 1 square!
    var verteces = [
      Transformer.windowToClip(bottomLeftX, bottomLeftY, _canvas.width, _canvas.height),
      Transformer.windowToClip(bottomRightX, bottomRightY, _canvas.width, _canvas.height),
      Transformer.windowToClip(topRightX, topRightY, _canvas.width, _canvas.height),

      Transformer.windowToClip(topRightX, topRightY, _canvas.width, _canvas.height),
      Transformer.windowToClip(topLeftX, topLeftY, _canvas.width, _canvas.height),
      Transformer.windowToClip(bottomLeftX, bottomLeftY, _canvas.width, _canvas.height)
    ];

    var offset = sizeof.vec2 * 6 * _numDrawn;
    gl.bindBuffer(gl.ARRAY_BUFFER, _vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, offset, flatten(verteces));

    // Colors
    var r1 = Math.random();
    var g1 = Math.random();
    var b1 = Math.random();
    var colors = [
      r1, g1, b1,
      r1, g1, b1,
      r1, g1, b1,
      r1, g1, b1,
      r1, g1, b1,
      r1, g1, b1,
    ];
    var colorOffset = sizeof.vec3 * 6 * _numDrawn;
    gl.bindBuffer(gl.ARRAY_BUFFER, _cBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, colorOffset, flatten(colors));

    render();
    _numDrawn++;
  };

  var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, _numDrawn * 6 );
    window.requestAnimationFrame(render);
  };

  var App = {

    init: function() {

      // Setup canvas
      _canvas = document.getElementById('gl-canvas');
      gl = WebGLUtils.setupWebGL( _canvas );
      if ( !gl ) { alert( 'WebGL isn\'t available' ); }
      _canvas.addEventListener('click', addSquare);

      // Register settings handler
      document.getElementById('settings').addEventListener('change', updateSettings);

      // Configure WebGL
      gl.viewport( 0, 0, _canvas.width, _canvas.height );
      gl.clearColor(0.0, 0.0, 0.0, 1.0);

      // Load shaders
      _program = initShaders( gl, 'vertex-shader', 'fragment-shader' );
      gl.useProgram( _program );

      // Load an empty vertex buffer onto the GPU
      _vBuffer = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, _vBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(3, 6), gl.STATIC_DRAW );

      // Associate shader variables with vertex data buffer
      var vPosition = gl.getAttribLocation( _program, 'vPosition' );
      gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
      gl.enableVertexAttribArray( vPosition );

      // Load an empty color buffer onto the GPU
      _cBuffer = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, _cBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(3, 6), gl.STATIC_DRAW );

      // Associate shader variables with color data buffer
      var vColor = gl.getAttribLocation( _program, 'vColor' );
      gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
      gl.enableVertexAttribArray( vColor );

      render();
    }

  };

  window.App = App;

// }(window, window.Transformer, window.DomUtils || (window.DomUtils = {})));
}(window, window.Transformer, window.DomUtils));


/**
 * App Init
 */
(function(App) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    App.init();
  });

}(window.App || (window.App = {})));
