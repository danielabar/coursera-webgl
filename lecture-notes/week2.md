# Week 2 Lecture Notes

## Event Loop

* Every program should have a render function
* Static application only needs to execute render once
* In dynamic application, redrawing of the display must be triggered by an event

OpenGL is not object oriented (historical), so there are different named functions for variations in input
(no overloading).

## WebGL and GLSL

Action happens in shaders (because they run in the GPU).

## Vertex Shader

```
// Input from application -> vPosition must link to variable in application
attribute vec4 vPosition;

void
main()
{
  // simply output whatever we put in
  gl_Position = vPosition;
}
```

Attribtues are properties of verticies. Every vertex has a position (simplest attribute).

`vec4` is a built in type of 4 dimensional vector.
GLSL has types such as float, int etc, but also additional types like vectors and matricies.

`gl_Position` is a built in variable. Every vertex shader _must_ output `gl_Position`.

Each shader is an entire program.

## Fragment Shader

Processes fragments outputted from the Rasterizer.

At minimum, the fragment shader must send out a color for that fragment.

Fragment shaders are also writen in GLSL.

Simple example that makes every fragment red:

```
// Specify what precision is sent to the frame buffer
precision mediump float;

void
main()
{
  // 0 is no red, 1.0 is fully red, etc for green and blue.
  gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}
```

`gl_FragColor` is a built in variable.

## Square Example

Note that a vertex is not just a point in space. It also contains other attributes such as color, texture co-ordinates, normal direction, etc.

This code creates a **vertex buffer object** (VBO) on the GPU, and makes it the current VBO:

```javascript
var bufferId = gl.createBuffer();
gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
```

Other VBOs can contain data such as colors and texture co-ordinates.

`flatten` is defined in `Common/MV.js` that converts JavaScript array object to a C-like array required by OpenGL.

`gl.STATIC_DRAW` allows GPU to optimize.

This code associates shader variables with variables in the JavaScript:

```javascript
var vPosition = gl.getAttribLocation( program, "vPosition" );

// Describe what vPosition looks like: 2 dimensional, floating point
gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );

gl.enableVertexAttribArray( vPosition );
```

This code draws the square (must draw two triangles to make a square):

```javascript
function render() {
  gl.clear( gl.COLOR_BUFFER_BIT );

  // start at first (i.e. 0th) vertex, there are 4 of them
  gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
}
```

`gl.TRIANGLE_FAN` is more efficient than repeated triangles if you're drawing triangles that share vertecies.
This can draw `n` triangles, but the first vertex is always fixed.

`gl.TRIANGLE_STRIP` takes a long list of vetecies, 4th vertex forms a triangle with previous two and so on.
So each vertex after third one always generates a new triangle.

Be careful with order of vertecies in data array with respect to the gl draw mode.

GL_TRIANGLES are filled shapes. To get a triangle with a border, need to draw a triangle with a LINE_LOOP outside of it.

## Coordinate Systems

Can use any coordinate system you like. Use units that are natural to the problem space.
Are called _object, world, model or problem_ coordinates.

Viewing device (camera) is specified in object coordiantes.

Display is a physical device so it wrks in _window_ or _screen_ coordinates.

Vertex shaders output _clip coordiantes_, a normalized system that internals of the implementation must work with.

Input to fragment shader is in _window coordinates_.

## WebGL Camera

By default, camera is at the origin in object coordinates, pointing in -z direction.
That is, the -z's are in _front_ of the camera.

A real camera only sees what's in front of it, but the WebGL camera can also see behind itself.

Default viewing volume is a box centered at the origin with sides of length 2.
Everything outside of the viewing volume is automatically clipped out and will not appear on the display.

Coordinate system is a right-handed system,
i.e can use thumb, index and middle fingers of your right hand to determine:
* `x` goes off to the right - thumb
* `y` goes up - index finter
* `z` comes out of the display - middle finger pointing towards youx`

(right, top, far)     ===   (1, 1, -1)   === (x, y, z)
(left, bottom, near)  ===   (-1, -1, -1) === (x, y, z)

## Orthographic Viewing

Takes all (x,y,z) coordinates and sets the z's to 0.
Pushes all points to the z=0 plane.

2D is a special case of 3D, where the z plane is 0.

## Viewport

Don't need to use entire display (i.e. all of the width and height declared on canvas element).
Can define the viewport to be a subset of the display size:

```javascript
gl.viewport(x, y, w, h);
```

Arguments to `gl.viewport` are provided in pixels:

`x, y` : left, bottom point where the viewport starts
`w, h` : width and height of viewport

If not otherwise specified, by default the viewport = canvas size.

## Transformation and Viewing

Transformation functions (carried out with a projection matrix) are used to translate between different coordinate systems.

Preferably, transformations should be defined in the shaders, although technically can also be done in application code (slower).
