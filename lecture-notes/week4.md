## Mouse and Position Input

Watch out for coflict in coordinate systems.

In application, if origin is at bottom left, x increases to the right and y increases upwards.

But in physical display devices such as monitors, y=0 starts at top, and y increases in downwards direction.

### Window Coordinates

Window coordinates are measured in pixels. For example, given a 512(w) x 512(h) display:
* (0, 0): top left corner
* (511, 511) or more generally (w-1, h-1): bottom right corner

When getting mouse position, browser provides this in window coordinates.
Need to convert these physical coordinates to application coordinates to use it in WebGL
(generally we're working in clip coordinates, normalized form).

Also need to account for the fact that y direction is reversed.

### Window to Clip Coordinates

(0,h) -> (-1, -1)
(w,0) -> (1, 1)

[Sample conversion code](../experiments/coordinates/coordinates.js)

### Returning Position from Click Event

Canvas specified in HTML file of size `canvas.width` x `canvas.height`.

Returned window coordinates are `event.clientX` and `event.clientY`.

Add a vertex to GPU for each click

```javascript
// keep track of how many verteces have already been sent over to buffer
var index = 0;

canvas.addEventListener('click', function(evt) {

  // assume a buffer has previously been setup to hold verteces
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

  // compute a new vector t, by transforming window coordinates to clip coordinates
  var t = vec2(-1 + 2*event.clientX/canvas.width,
    -1 + 2*(canvas.height - event.clientY)/canvas.height);

  // calculte offset based on how many verteces have already been sent over
  var offset = sizeof['vec2']*index;

  // buffer has already been setup, send the new vector t over,
  // skipping over the verteces already in the buffer
  gl.bufferSubData(gl.ARRAY_BUFFER, offset, t);

  // update counter
  index++;
});
```
