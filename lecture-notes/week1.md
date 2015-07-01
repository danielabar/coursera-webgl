# Week 1 Lecture Notes

WebGL is a JavaScript implementation of OpenGL ES 2.0 (embedded systems)

OpenGL can only deal with triangular polygons.

Each application will have a minimum of these three parts:

* Vertex shader
* Fragment shader
* HTML canvas

This course will use some pre-built common utilities provided by the instructor

* [webgl-utils.js](../Common/webgl-utils.js)
* [initShader.js](../Common/initShaders.js)

Shaders are written in OpenGL Shading Language (GLSL)

## Vertex Shader

_Vertex shader_ plays with the geometry. It takes in geometry in the form of verticies and outputs verticies.
The vertex shader will be defined in a script tag of type `x-shader/x-vertex` in the html.

In this example, the input is coming in as `vPosition` and being output as `gl_Position`

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

## Fragment Shader

_Fragment shader_ outputs fragments, which can be thought of as pixels (they may get modified later in the process).
Each fragment corresponds to a location in the _frame buffer_.

This example specifies that every pixel should be red: 1.0, green: 0.0, and blue 0.0 (which will render as all red).

```html
<script id="fragment-shader" type="x-shader/x-fragment">
precision mediump float;

void
main()
{
    // color format is red, green, blue, alpha (transparency)
    gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}
</script>
```

## Draw a Triangle

The hello world of WebGL is drawing a solid colored triangle.
This section describes the JavaScript that accomplishes it.

### Define variables

Define variables for the data to be sent to the gpu, and the WebGL context.

```javascript
var gl;
var points;
```

### Initialize WebGL Context

Initialize the WebGL context using the common utility

```javascript
var canvas = document.getElementById( "gl-canvas" );
gl = WebGLUtils.setupWebGL( canvas );
if ( !gl ) { alert( "WebGL isn't available" ); }
```

### Setup the data

Setup the data using a typed array. When sending data to the GPU, WebGL needs a "C like" array.
Use JavaScript's [Float32Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array) for this purpose.

In this example, the array contains 3 two-dimensional verticies:
* {-1, -1} : Bottom left corner of triangle
* { 0,  1} : Top middle point of triangle
* { 1, -1} : Bottom right corner of triangle

```javascript
var verticies = new Float32Array([-1, -1, 0, 1, 1, -1]);
```

Note at this point data has not yet been sent to the GPU, that will happen a little later in this example.

### Configure WebGL

Configure WebGL, or example, given the following html...

```html
<canvas id="gl-canvas" width="512" height="512">
  Oops ... your browser doesn't support the HTML5 canvas element
</canvas>

```

...use the entire canvas area (the canvas is the frame buffer)

```javascript
// Start at bottom left {0,0} and go all the way to top right of {512, 512} which is the canvas width and height respectively.
gl.viewport(0, 0, canvas.width, canvas.height);

// Clear canvas (i.e. frame buffer) to an opaque white background
gl.clearColor(1.0, 1.0, 1.0, 1.0);
```

### Load Shaders

Load shaders into the `program` variable, using the Common initShaders utility.
The common utility reads, compiles and links the shaders.

The id's from the html file are used to identify the shaders in javascript.

Note you can have multiple different fragment and vertex shaders,
and would switch between them, for example to have different colors and textures.

`useProgram` specifies which to use.

```javascript
var program = initShaders(gl, 'vertex-shader', 'fragment-shader');
gl.useProgram(program);
```

### Load Data onto GPU

Load the data that's in the verticies (recall the Float32Array that specifies the points of the triangle), onto the GPU

```javascript
// Setup buffer on the GPU using a WebGL function 'createBuffer'
var bufferId = gl.createBuffer();

// Tell WebGL this is the present buffer we're dealing with (ARRAY_BUFFER means its just a simple array)
gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );

// Put the data onto the GPU
gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW );
```

### Associate Shader Variables with Data Buffer

Align the names of the shaders with the names of the variables setup in previous step.

The three lines in this code would be repeated for each type of variable that you want to send over (eg: color, texture, etc.)

```javascript
// Extract value of vPosition variable from the program object
//  --> Recall 'program' contains the shaders, vertex shader has this line: gl_Position = vec4(vPosition, 0.0, 1.0);)
//  --> JavaScript variable could be named anything, but its easier to read the code if named the same as variable in vertex shader
//  --> use convention that variable name starting with lower case 'v' represents a vertex shader (and f for fragment shader)
var vPosition = gl.getAttribLocation( program, "vPosition" );

// Describe what the data looks like
//  --> Two dimensional floating point data
gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );

// Enable attribute array that was setup when we defined 'var vPosition = ...'
gl.enableVertexAttribArray( vPosition );

// Now that the data is all there, it can be rendered
render();
```

### Render

```javascript
var render = function() {
  // Clear the frame buffer (recall we setup clear color to be white)
  gl.clear( gl.COLOR_BUFFER_BIT );

  // Draw the data, tell WebGL what that data is describing, in our case, a single triangle because we only defined 3 verticies
  // --> draw triangles filled with the color that comes out of the fragment shader, starting with the first one (number 0), and there's 3 of them
  gl.drawArrays( gl.TRIANGLES, 0, 3 );
}
```

## Model Graphics Process

Computer graphics is about displaying geometry. There are two parts:
* Building geometric models
* Rendering (displaying the models)

The modeller produces geometry, which goes out to the renderer.

Renderer produces a realistic looking image.
