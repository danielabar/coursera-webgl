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
