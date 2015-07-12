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
* Also need others, variables chan change
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
