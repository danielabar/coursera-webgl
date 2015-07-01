# Week 1 Lecture Notes

OpenGL can only deal with triangular polygons.

Each application will have a minimum of these pieces:

* Vertex shader
* Fragment shader
* HTML canvas

This course will use some pre-built common utilities provided by the instructor

* [webgl-utils.js](../Common/webgl-utils.js)
* [initShader.js](../Common/initShader.js)

_Vertex shader_ plays with the geometry. It takes in geometry in the form of verticies and outputs verticies.
In this course, the vertex shader will be defined in a script tag in the html. Example

```html
<script id="vertex-shader" type="x-shader/x-vertex">
attribute vec2 vPosition;

void
main()
{
    gl_Position = vec4(vPosition, 0.0, 1.0);
}
</script>
```

_Fragment shader_ outputs fragments, which can be thought of as pixels.
Each fragment corresponds to a location in the _frame buffer_. Example

```html
<script id="fragment-shader" type="x-shader/x-fragment">
precision mediump float;

void
main()
{
    // color format is red, green, blue, alpha transparency
    gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}
</script>
```

The script id's are used to reference the shaders in JavaScript. Example

```javascript
var program = initShaders( gl, "vertex-shader", "fragment-shader" );
```

When sending data to the GPU, WebGL needs a "C like" array

```javascript
// This array contains 3 two dimensional verticies:
//  {-1, -1}, {0, 1}, {1, -1}
var verticies = new Float32Array([-1, -1, 0, 1, 1, -1]);
```

To configure WebGL, for example to use entire canvas area

```html
<canvas id="gl-canvas" width="512" height="512">
  Oops ... your browser doesn't support the HTML5 canvas element
</canvas>

```

```javascript
var canvas = document.getElementById('gl-canvas');
gl = WebGLUtils.setupWebGL(canvas);
gl.viewport(0, 0, canvas.width, canvas.height);
// Clear canvas (i.e. frame buffer) to an opaque white background
gl.clearColor(1.0, 1.0, 1.0, 1.0);
```

The results of initializing the shaders are stored in a program object (i.e. container)

```javascript
var program = initShaders(gl, 'vertex-shader', 'fragment-shader');
```
