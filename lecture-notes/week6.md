## Position camera

Move camera frame to see negative and positive z's

Example using MV.js to rotate and translate camera (for example, to get a side view)

```javascript
var t = translate(0.0, 0.0, -d);
var ry = rotateY(90.0);
var m = mult(t, ry);

// or inline
var m = mult(translate(0.0, 0.0, -d), rotateY(90.0));

// send m to vertex shader to be applied to each vertex
```

Alternatively, use `lookAt(eye, at, up)` function in MV.js to construct the model view matrix:

at<sub>x</sub>, at<sub>y</sub>, at<sub>z</sub> is point on object camera should be looking at
eye<sub>x</sub>, eye<sub>y</sub>, eye<sub>z</sub> is point where camera is
up<sub>x</sub>, up<sub>y</sub>, up<sub>z</sub> is some point above the camera indicating direction???

## Projection

`modelViewMatrix` will generally include the modelling (translate, rotate, scale),
and the `lookAt` part.

`projectionMatrix` will be sent as a separate matrix.

### Basic vertex shader

```
attribute vec4 vPosition;
attribute vec4 vColor;
varying vec4 fColor;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vPosition;
  fColor = vColor;
}
```

### Default Orthographic Projection

__p__<sub>p</sub> = __Mp__

In practice, let M = I (identity matrix) and set the z term to zero later.

### Perspective

In perspective viewing, things that are farther away are smaller because they have a larger (in magnitude) z value.

Recall when going from Homogenous Coordinates (4D) back to 3D space, must divide the x, y, and z by w.

Consider q = Mp where

M =   1 0 0 0
      0 1 0 0
      0 0 1 0
      0 0 1/d 0

p =   x
      y
      z
      1

q =   x
      y
      x
      z/d

To get a perspective projection instead of the default orthographic projection, use the matrix M.
