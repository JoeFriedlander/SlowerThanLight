/*******************************************************/
// Slower Than Light / subLuminal
// Joe Friedlander 2021
/*******************************************************/

'use strict';

/*******************************************************/
// Create canvas
/*******************************************************/

let canvas = document.getElementById("gameCanvas");
let context = canvas.getContext("2d");

/*******************************************************/
// Imports
/*******************************************************/

import { Star } from './star.mjs';
import { Ship } from './ship.mjs';
import { setupInput} from './input.mjs'

/*******************************************************/
// Initial Setup
/*******************************************************/

Star.setupStars();
Ship.setupShips();
setupInput(canvas, context);
let background = new Image();
background.src = "data/img/mapfilled.jpg";

// Make sure the image is loaded first otherwise nothing will draw.
background.onload = function(){
    context.drawImage(background,0,0);   
}

/*******************************************************/
// Tick rates - One time setup of timers for events
/*******************************************************/

let shipProduceInterval = 6000;
let shipSendInterval = 200;
let aiInterval = 2000;

let shipProduceTimer = setInterval(function(){
  Star.starArray.forEach(star => {
    star.produceShip();
  });
}, shipProduceInterval);

let shipSendTimer = setInterval(function(){
  Star.starArray.forEach(star => {
    star.checkSendShip();
  });
}, shipSendInterval);

let enemyAI = setInterval(function(){
  Star.starArray.forEach(star => {
    if(star.controlledBy === "enemy") {
      for (let [key, value] of star.connectionMap) {
        let connectedStarObject = Star.starArray.filter(star => star.name === key)[0];
        if(connectedStarObject.controlledBy === "player" && star.numShips > connectedStarObject.numShips) {
          value.isActive = true;
        }
        else {
          value.isActive = false;
        }
      }
    }
  });
}, aiInterval);

// randomize ship send interval? could be neat. or every star has own timer
/*
setInterval(function(){
  clearInterval(shipSendInterval);
  randomShipSendInterval = (Math.random() * 400) + 200;
  shipSendInterval = setInterval(function(){
    Star.starArray.forEach(star => {
      star.checkSendShip();
    });
  }, randomShipSendInterval);
}, 600);
*/


/*******************************************************/
// Game loop
/*******************************************************/

function update() {

  // state. menu, playing, etc

  /*******************************************************/
  // Check win condition
  /*******************************************************/
console.log(Ship.numEnemyShips, Ship.numPlayerShips);
  if (Star.numEnemyStars <= 0 && Ship.numEnemyShips <= 0) {
    console.log('player wins');
  }
  else if (Star.numPlayerStars <= 0 && Ship.numPlayerShips <= 0) {
    console.log('enemy wins');
  }

  /*******************************************************/
  // Update state
  /*******************************************************/

  Ship.shipArray.forEach(ship => {
    ship.updateLocation();
    ship.checkInTransitFight(context);
    ship.checkArrivedAtStar(context);
  })

  /*******************************************************/
  // Render graphics
  /*******************************************************/
  
  //context.fillStyle = "#080516";
  context.fillStyle = "#30275c"
  // draw background stars
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalAlpha = 0.08;
  context.drawImage(background,0,0);   
  context.globalAlpha = 1;
  Star.drawAllStars(context);
  Ship.drawAllShips(context);

  // loop
  window.requestAnimationFrame(update);
}

update();