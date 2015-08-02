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
