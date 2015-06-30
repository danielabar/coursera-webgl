
var gl;
var points;

var vPosition, vPosition2;
var bufferId, bufferId2;
var program;

var vertices = new Float32Array([-1, -1, 0, 1, 1, -1]);
var vertices2 = new Float32Array([-1, 1, 0, -1, 1, 1]);

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER,vertices, gl.STATIC_DRAW );

    
    bufferId2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId2 );
    gl.bufferData( gl.ARRAY_BUFFER,vertices2, gl.STATIC_DRAW );
        

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    gl.drawArrays( gl.TRIANGLES, 0, 3 );
    
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId2 );
    vPosition2 = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition2, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition2 );
    gl.drawArrays( gl.TRIANGLES, 0, 3 );
    
}
