import { Star } from "./star.mjs";

/*******************************************************/
// Initial setup
/*******************************************************/

export function setupInput(canvas, context) {
  // disable right click menu
  canvas.oncontextmenu = function() {
    return false;
  };

  // fix position to canvas for mouse movement calculations
  let canvasPos = canvas.getBoundingClientRect();

/*******************************************************/
// Helper functions
/*******************************************************/

// throttles events to improve performance
// edited from user rsimp on stackoverflow. source https://stackoverflow.com/a/65620774
const throttle = (func, limit) => {
  let lastFunc;
  let lastRan = Date.now() - (limit + 1); //enforces a negative value on first run
  return function(...args) {
    const context = this;
    clearTimeout(lastFunc);
    lastFunc = setTimeout(() => {
      func.apply(context, args);
      lastRan = Date.now();
    }, limit - (Date.now() - lastRan)); //negative values execute immediately
  }
}

/*******************************************************/
// Mouse object
/*******************************************************/

const mouse = {
  x: 0,
  y: 0,
  mousedown: false
}


//?
let sourceStar = "";



/*******************************************************/
// Events
/*******************************************************/

// mouse down
canvas.addEventListener('mousedown', function(event){
  handleMouseDown();
})

function handleMouseDown() {
  // check if it's clicked over star
  /*
  Star.starArray.forEach(star => {
    if (star.isMouseOver) {
      sourceStar = star;
    }
  })
  */
 // check if clicked over arrow
  Star.starArray.forEach(star => {
    for (let [key, value] of star.connectionMap) {
            //star.controlledBy === "player" && 
      if (context.isPointInStroke(value.arrowShape, mouse.x, mouse.y)) {
        value.isActive = !value.isActive;
      }
    }
  })
/*
    // mouse up
    canvas.addEventListener('mouseup', function(event){
      handleMouseUp();
    })
  
    function handleMouseUp() {
      Star.starArray.forEach(destStar => {
        // check if mouse up over a star
        if (destStar.isMouseOver) { //&& sourceStar.controlledBy === "player"
          sourceStar.sendShip(destStar);
        }
      })
    }
*/
}

canvas.addEventListener('mousemove', throttle(handleMouseMove, 15));

  function handleMouseMove(event) {
    mouse.x = event.x - canvasPos.left;
    mouse.y = event.y - canvasPos.top;
    Star.starArray.forEach(star => {

      // star itself
      if (context.isPointInPath(star.shapeHighlight, mouse.x, mouse.y)) {
        star.mouseOver(true);
      }
      else {
        star.mouseOver(false);
      }

      // star's arrows
      for (let [key, value] of star.connectionMap) {
        if (context.isPointInStroke(value.arrowShape, mouse.x, mouse.y)) {
          value.isMouseOver = true;
        }
        else {
          value.isMouseOver = false;
        }
      }
    })
  }
}

