## Init Shaders Process

* Read shaders
* Compile shaders
* Create a program object
* Link everything together
* Link variables in application with variables in shaders
  * Vertex attributes
  * Uniform variables

### Program Object

Can contain multiple shaders and other GLSL functions.

### Reading a shader

* Shaders are added to program and compiled
* Pass a null terminated string (shaders expect C string, not JavaScript string)

  ```javascript
  gl.shaderSource( fragShdr, fragElem.text );
  ```

* If shader is in HTML, can get it into application via `getElementById`.
This is ok for relatively small shader programs.
* If shader is in a file (myshader.glsl), need to write a reader to convert the file into a string.
This is preferable for longer shader programs.

### Precision Declaration

* Must specify desired precision in fragment shaders (artefact inherited from OpenGL ES,
  which must work on simple embedded devides that may not support 32 bit floating point)
* all implementations must support `mediump`
* Use proprocessor directive `#ifdef` to check fi `highp` supported, otherwise default to `mediump`

  ```
  #ifdef GL_FRAGMENT_SHADER_PRECISION_HIGH
    precision highp float;
  #else
    precision mediump float;
  #endif

  varying vec4 fcolor;
  void main(void) {
    gl_FragColor = fcolor;
  }
  ```

## GLSL

### Data Types

* C types: int, float, bool
* Vectors: float `vec2`, `vec3`, `vec4` (also int `ivec` and boolean `bvec`)
* Matricies: `mat2`, `mat3`, `mat4` (stored by columns, referenced `m[row][column]`)
* C++ style constructors
  ```
  vec3 a = vec3(1.0, 2.0, 3.0)
  vec2 b = vec2(a)
  ```

### No Pointers

* There are no pointers in GLSL
* Can use C type structs which can be copied back fromfunctions
* Matrices and vectors are basic types, can be passed into and output from GLSL functions
  ```
  mat3 func(mat3 a)
  ```
* Variables passed by copying

### Qualifiers

* Some of same qualifiers as C/C++ such as `const`
* Also need others, variables can change
  * Once per primitive (uniform qualified)
  * Once per vertex (attribute qualified)
  * Once per fragment (varying qualified)
  * At any time in the application

Vertex attributes output by the vertex shader are interpolated by the rasterizer into fragment attributes.

#### Attribute Qualifier

* attribute-qualified variables can change at most once per vertex
* `gl_Position` is an example that is built in
* User defined
  ```
  attribute vec4 color
  attribute float temperature
  attribute vec3 velocity
  ```

#### Uniform Qualified

* Variables that are constant for an entire primitive
* Can be changed in application and sent to shaders
* Cannot be changed in shader
* Used to pass information to shader such as the time or a rotation angle for transformations

#### Varying Qualified

* Variables that are passed from vertex shader to fragment shader
* Automatically interpolated by the rasterizer
* With WebGL, GLSL uses the varying qualifier in both shaders (kind of confusing)
  ```
  varying vec4 color;
  ```
* More recent versions of WeGL use `out` in vertex shader and `in` in fragment shader
  ```
  out vec4 color;   // vertex shader
  in vec4 color;    // fragment shader
  ```

### Naming Convention

* Attributes passed to vertex shader have names beginning with `v` (vPosition, vColor) in both the application and the shader
(_different_ entities with the _same_ name)
* Varying variables sent from vertex shader to fragment shader begin with `f` (fColor) in both shaders (_must_ have same name)
* Uniform variables (defined in application, but an be used anywhere) are unadorned and can have same name in application and shaders

#### Example: Vertex Shader

```
attribute vec4 vColor;      // attribute comes from application
varying vec4 fColor;        // varying will be sent to fragment shader

void main() {
  gl_Position = vPosition;  // main passes through position via built in variable gl_Position
  fColor = vColor;          // fColor is set equal to input color from app, it's varying, therefore it goes OUT to the rasterizer
}
```

#### Corresponding Fragment Shader

This example shows how a fragment shader can get color information as input from the vertex shader,
which may have gotten it from the application.

```
precision mediump float;

varying vec3 fColor;      // varying in fragment shader is an INput variable

void main() {
  gl_FragColor = fColor;  // set required built in variable gl_FragColor
}
```

### Sending Colors from Application

For example, set a color for each vertex. Process is exactly the same as setting vertex positions.

```javascript

// Make a color buffer the present buffer
var cBuffer = gl.createBuffer();
gl.bindBuffer (gl.ARRAY_BUFFER, cBuffer );

// Put data in the color buffer (colors is not shown in this code)
gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

// Get attribtue location (result from linking of the shaders)
var vColor = gl.getAttribLocation( program, 'vColor' );

// This example is sending RGB colors, so there's 3 values for each color
gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray( vColor );
```

### Sending a Uniform Variable

Application

```javascript
vec4 color = vec4(1.0, 0.0, 0.0, 1.0);
colorLoc = gl.getUniformLocation( program, 'color');
gl.uniform4f( colorLoc, color);   // send over 4 variable color represented as floats
```

Fragment shader (similar in vertex shader)

```
uniform vec4 color;   // uniform qualifier means this variable is unchanged for ALL instantiations of this shader

void main() {
  gl_FragColor = color;
}
```

### Operators and Functions

* Standard C functions (trigonometric, arithmetic)
* Geometry helper functions (normalize, reflect, length)
* Overloading of vector and matrix types
  ```
  mat 4 a;
  vec4 b, c, d;
  c = b * a;    // a column vector stored as a 1d array
  d = a * b;    // a row vector stored as a 1d array
  ```

### Swizzling and Selection

* Can refer to array elements by using `[]` or selection (.) operator with
  - x, y, z, w (positions x width, y height, z depth, w fourth dimension)
  - r, g, b, a (color red, green, blue, alpha)
  - s, t, p, q (texture coordinates)
  - a[2], a.b, a.z, a.p are the same

* Swizzling operator lets us manipulate components
  ```
  vec4 a, b;
  a.yz = vec2(1.0, 2.0, 3.0, 4.0);
  b = a.yxzw;   // swaps x and y axes
  ```

## Color

### Attributes

* Attributes determine appearance of objects
  - color (points, lines, polygons)
  - size and width (points, lines)
  - stipple pattern such as dashed, dotted, etc. (lines, polygons)
  - polygone mode
    - display as filled: solid color or stripple pattern
    - display edges
    - display verticies
* Only a few (gl_PointSize) are supported by WebGL functions

### RGB Color

* Additive
* EAch color component is stored separately in the frame buffer
* Usually 8 bits per component in buffer
* Color values can range from 0.0 (none) to 1.0 (all) using floats
or over the range from 0 to 255 using unsigned bytes

### Setting Colors

* Colors are ultimately set in the fragment shader, but can be determined in either shader or in the application
* Application color: pass to vertex shader as a uniform variable or as a vertex attribute
* Vertex shader color: pass to fragment shader as varying variable
* Fragment color: can alter via shader code

### Smooth Color

Rasterizer takes information passed in on vertex by vertex basis and interpolates that across the entity.

* Default is _smooth_ shading: Raserizer interpolates vector colors across visible polygons
* Alternative is _flat shading_: Color of first vertex determines fill color, handle in shader

Application to draw a multi colored triangle (Maxwell Triangle), gradient from red, green, blue

```javascript
var colors = [1, 0, 0, 0, 1, 0, 0, 0, 1];   // red: 1, 0, 0   green: 0, 1, 0    blue: 0, 0, 1
var cbufferId = gl.createBuffer();
gl.bindBuffer( gl.ARRAY_BUFFER, cbufferId );
gl.bufferData (gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

var vColor = gl.getAttribLocation( program, 'vColor' );   // vColor is an attribute in the vertex shader
gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
gl.enableVertexAttribArray( vColor );
```

Vertex Shader

```
attribute vec4 vPosition;
attribute vec4 vColor;
varying vec4 fColor;    // to pass vColor through to rasterizer

void main() {
  gl_Position = vPosition;
  fColor = vColor;
}
```

Fragment Shader

What comes in to fragment shader is NOT the `varying fColor`, it's the _interpolated_ values of the color sent out from the vertex shader.

Vertex shader is executed 3 times, fragment shader is executed many times.

```
precision mediump float;
varying vec4 fColor;

void main() {
  gl_FragColor = fColor;
}
```

### Sending a Uniform Variable

Application to draw in a solid color

```javascript
var color = vec4(1.0, 0.0, 0.0, 1.0);
var colorLoc = gl.getUniformLocation( program, 'color');
gl.uniform4f( colorLoc, color);
```

Fragment Shader

```
uniform vec4 color;

void main() {
  gl_FragColor = color;
}
```

## Animation

### Callbacks

Programming interface for event driven inpput uses _callback functions_ or _event handlers_.

* Define a callback for each event the graphics system recognizes
* Browser enters the _event loop_, and responds to those events for which it has callbacks registered
* Callback function is executed when event occurs

Consider 4 points of a rotating square in a circle, with circle centered at origin:

* Top right (-sin &theta;, cos &theta;)
* Top left (cos &theta;, sin &theta;)
* Bottom left (-cos &theta;, -sin &theta;)
* Bottom right (sin &theta;, -cos &theta;)

Animate display by re-rendering for different values of &theta;

How to change the verteces to effect a rotation?

### Simple but slow

Constantly sending data to the GPU.

```javascript
for (var theta = 0.0; theta < thetaMax; theta += dTheta) {
  verteces[0] = vec2(Math.sin(theta), Math.cos(theta));
  verteces[1] = vec2(Math.sin(theta), -Math.cos(theta));
  verteces[2] = vec2(-Math.sin(theta), -Math.cos(theta));
  verteces[3] = vec2(-Math.sin(theta), Math.cos(theta));

  gl.bufferSubData(...)
  render();
}
```

`gl.bufferSubData` does the same thing that `gl.bufferData` does but it assumes the buffer already exists and replaces the data that's in there.

### Complex but faster

* Send original verteces to vertex shader
* Send &theta; to shader as a uniform variabe
* Compute verteces in vertex shader (using trigonometry functions built into GLSL)
* Render recursively (i.e. have the render function call itself)

```javascript
// vertex shader has uniform variable named theta
var thetaLoc = gl.getUniformLocation(program, 'theta');

var render = function() {

  // clear the frame buffer
  gl.clear(gl.COLOR_BUFFER_BIT);

  // increment theta
  theta += 0.1;

  // send new value of theta over to theta location as a uniform variable
  gl.uniform1f(thetaLoc, theta);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // infinite recursion
  render();
};
```

Vertex shader calculates the rotation

```
// input passed in from application
attribute vec4 vPosition;
uniform float theta;

void main() {
  gl_Position.x = -sin(theta) * vPosition.x + cos(theta) * vPosition.x;
  gl_Position.y = = sin(theta) * vPosition.y + cos(theta) * vPosition.y;
  gl_Position.z = 0.0;
  gl_Position.w = 1.0;
}
```

### Double Buffering

What is the relationship between when things are displayed on the display and when changes are being made to the frame buffer?
These two things are _decoupled_.

Things can be changing very quickly in frame buffer, but display process that takes the data from frame buffer and puts it on the display happens at a fixed rate. Typically in a browser this latter process happens 60 x / sec.

To avoid seeing a partially rendered display, _double buffering_ is used. Browser maintains two buffers:

* Front buffer: This is what's displayed
* Back buffer: The application draws into here

When we finish drawing into the back buffer, a _buffer swap_ can be performed.
The new data in back buffer moves to the front buffer to be displayed, and back buffer is cleared to make room for new data.

This process happens automatically.

### Triggering a Buffer Swap

* Browsers refresh display at ~60 Hz (this is a redisplay of the front buffer, NOT a buffer swap)
* Trigger a buffer swap through an event, options:
  * Interval timer
  * requestAnimFrame

Interval timer executes a function after a specified number of milliseconds. Also generates a buffer swap.

```javascript
setInterval(render, interval)
```

Interval of `0` generates buffer swaps as fast as possible.

#### Request Animation Frame

`requestAnimFrame` requests the browser to execute a function as soon as possible,
at the next time its going to update the display.

```javascript
var render = function() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  theta += 1;
  gl.uniform1f(thetaLoc, theta);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimFrame(render);
};
```

#### Interval and RequestAnimFrame

```javascript
var render = function() {
  setTimeout(function() {
    requestAnimFrame(render);
    gl.clear(gl.COLOR_BUFFER_BIT);
    theta += 1;
    gl.uniform1f(thetaLoc, theta);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, 100);
}
```

## Keyboard and Sliders

### Using keydown Event

`event.keyCode` returns unicode character representing key pressed.

```javascript
window.addEventListener('keydown', function() {
  switch (event.keyCode) {
    case 49:                    // '1' key
      direction = !direction;
      break;
    case 50:                    // '2' key
      delay /= 2.0;
      break;
    case 51:                    // '3' key
      delay *= 2.0;
      break;
  }
});
```

Above version requires that you know the unicode values, otherwise can do this instead:

```javascript
window.onkeydown = function(event) {
  var key = String.fromCharCode(event.keyCode);
  switch (key) {
    case '1':
      direction = !direction;
      break;
    case '2':
      delay /= 2.0;
      break;
    case '3':
      delay *= 2.0;
      break;
  }
}
```

### Slider Element

Puts slider on page. Give it an identifier, min/max values, step size to generate an event, and initial value.

```html
<div>
  speed 0
  <input id="slide" type="range" min="0" max="100" step="10" value="50" />
  100
</div>
```

Listen for slider change

```javascript
document.getElementById('slide').onchange = function() {
  delay = event.srcElement.value;
};
```
