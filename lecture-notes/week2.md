# Week 2 Lecture Notes

## Event Loop

* Every program should have a render function
* Static application only needs to execute render once
* In dynamic application, redrawing of the display must be triggered by an event

OpenGL is not object oriented (historical), so there are different named functions for variations in input
(no overloading).

## WebGL and GLSL

Action happens in shaders (because they run in the GPU).

### Vertex Shader

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

### Fragment Shader

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
