## Rotation

Positive rotation is counter-clockwise, looking down the positive axis towards the origin.

## Scaling

Reflection is a special case of scaling, corresponds to negative scale factors

## WebGL and Transformations

Model-View Transformation

Getting the object from a model into the world.

Camera: Projection Transformation

Output of vertex shader is:

q = P * MV * p

### Current Transformation Matrix (CTM)

Generally the product of the Projection matrix and ModelView matrix

### Matrix Multiplication Order

Last operation specified is the first executed in the program.
Think of it like a stack - last added is first popped off.
