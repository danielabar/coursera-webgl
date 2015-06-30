# Interactive Computer Graphics with WebGL

> Learning WebGL from Coursera, University of New Mexico [course](https://www.coursera.org/course/webgl)

## How to use this project

Install [Node.js](https://nodejs.org/)

Install grunt cli (Mac users add `sudo`)

```
npm install -g grunt-cli
```

Add html and js to homework directory and test in browser.

Add a link to each homework assignment in [index.html](index.html)

When ready to deploy, run

```
grunt deploy
```

Your site should be available at `http://{your github username}.github.io/coursera-webgl/`

## Reference Sample Code

Download `Common` and `Examples` from instructor's [website](http://www.cs.unm.edu/~angel/COURSERA/CODE/)

```bash
wget -r -nH --cut-dirs=4 --no-parent --reject="index.html*" http://www.cs.unm.edu/~angel/COURSERA/CODE/Common/
wget -r -nH --cut-dirs=4 --no-parent --reject="index.html*" http://www.cs.unm.edu/~angel/COURSERA/CODE/EXAMPLES/
```

## Week 1

OpenGL can only deal with triangular polygons.
