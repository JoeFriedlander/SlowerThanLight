import { Ship } from './ship.mjs';

export class Star {

  /*******************************************************/
  // Constructor
  /*******************************************************/
  constructor(name, x, y, numShips, controlledBy, connectedStars) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.numShips = numShips;

    this.orbitDirection = Math.random() < 0.5 ? 1 : -1;

    this.controlledBy = controlledBy
    this.controlledBy === "player" ? this.defaultColor = Star.playerColor : this.defaultColor = Star.enemyColor;
    this.controlledBy === "player" ? this.color = Star.playerColor : this.color = Star.enemyColor;
    this.controlledBy === "player" ? Star.numPlayerStars++ : Star.numEnemyStars++;
    this.shape = new Path2D();
    this.shape.arc(this.x, this.y, Star.radius, 0, 2 * Math.PI);
    //this.borderShape = new Path2D();
    //this.borderShape.arc(this.x, this.y, Star.borderRadius, 0, 2 * Math.PI);
    this.shapeHighlight = new Path2D();
    this.shapeHighlight.arc(this.x, this.y, Star.radius*6.5, 0, 2 * Math.PI);

    // Add each connected star's name to a map, will be used for arrows
    connectedStars.forEach(connectedStarName => {
      this.connectionMap.set(connectedStarName, {});
    })

  }

  /*******************************************************/
  // Object management - STATIC
  /*******************************************************/

  // holds all the star objects
  static starArray = [];

  // holds player and enemy star count
  static numPlayerStars = 0;
  static numEnemyStars = 0;

  /*******************************************************/
  // Adjacency list holds connections between stars
  // unused, each star holds own list of connections
  /*******************************************************/
/*
  static adjacencyList = new Map();

  static routes = [
    ['SOL', 'VEGA'],
    ['VEGA', 'ALPHA CENTAURI'],
    ['D', 'C'],
    ['E', 'C'],
    ['E', 'D'],
    ['D', 'VEGA']
  ]

  static addNode(starName) {
    Star.adjacencyList.set(starName, []);
  }

  static addEdge(origin, destination) {
    Star.adjacencyList.get(origin).push(destination);
    Star.adjacencyList.get(destination).push(origin);
    //add arrow
  }
*/
  /*******************************************************/
  // Constellation
  /*******************************************************/
  

  /*******************************************************/
  // Connection to other stars
  /*******************************************************/

  connectionMap = new Map();
  // Arrows point and direct ships to connected stars
  // starName points to path2d of arrow, isActive, isMouseOver


  isMouseOver = false;

  /*******************************************************/
  // Manage ships
  /*******************************************************/

  sendShip(destStar){
    // if source star has 1 or more ships
    if (this.numShips >=1) {
      // and is sent to different star
      if (this.name != destStar) {
        // and has an edge
        if (this.connectionMap.has(destStar)) {
            this.numShips--;
            let ship = Ship.shipArray.filter(ship => ship.inStarName == this.name)[0]
            //send ship
            ship.sendTo(destStar);
        }
      }
    }
  }

  checkSendShip(){
    for (let [key, value] of this.connectionMap) {
      if (value.isActive) {this.sendShip(key)}
    }
  }

  produceShip(){
    if(this.numShips < 10) {
      this.numShips++;
      Ship.shipArray.push(new Ship(this, this.controlledBy));
      this.controlledBy === "player" ? Star.numPlayerShips++ : Star.numEnemyShips++;
    }
  }

  receiveShip(){
    this.numShips++;
    this.controlledBy === "player" ? Star.numPlayerShips++ : Star.numEnemyShips++;
  }

  destroyShip(){
    this.numShips--;
    this.controlledBy === "player" ? Star.numPlayerShips-- : Star.numEnemyShips--;
  }

  /*******************************************************/
  // Player control of star
  /*******************************************************/

  changeControlTo(controlledBy){
    this.controlledBy = controlledBy;
    this.defaultColor = controlledBy === "player" ? Star.playerColor : Star.enemyColor;
    this.color = controlledBy === "player" ? Star.playerColor : Star.enemyColor;
    controlledBy === "player" ? Star.numPlayerStars++ : Star.numEnemyStars++;
    for (let [key, value] of this.connectionMap) {
      value.isActive = false;
    }
  }

  /*
  static printGraph(){
    for (let [key, value] of Star.adjacencyList) {
      console.log(key, value);
    }
  }
  */

  /*******************************************************/
  // Setup stars for a level
  /*******************************************************/

  //add level1, level2, etc separate list of stars as argument
  static setupStars(){
    Star.starArray.push(new Star("SOL", 250, 150, 10, "player", ["VEGA"]));
    Star.starArray.push(new Star("ALPHA CENTAURI", 350, 120, 10, "player", ["VEGA"]));
    Star.starArray.push(new Star("C", 450, 320, 1, "player", ["E", "D"]));
    Star.starArray.push(new Star("D", 520, 400, 2, "player", ["C", "E", "VEGA"]));
    Star.starArray.push(new Star("E", 275, 420, 1, "player", ["C", "D"]));
    Star.starArray.push(new Star("VEGA", 650, 220, 8, "enemy", ["ALPHA CENTAURI", "SOL", "D"]));

    //Star.starArray.forEach(star => { Star.addNode(star.name) });
    //Star.routes.forEach(route => { Star.addEdge(...route) });

    // Generate and add the arrows for each star
    let arrowLength = 50;
    Star.starArray.forEach(sourceStar => {
      for (let [key, value] of sourceStar.connectionMap) {
        let connectedStarObject = Star.starArray.filter(star => star.name === key)[0];
        let angle = Math.atan2(connectedStarObject.y - sourceStar.y, connectedStarObject.x - sourceStar.x);

        let tempX = sourceStar.x + arrowLength * Math.cos(angle) 
        let tempY = sourceStar.y + arrowLength * Math.sin(angle)
        let arrow = new Path2D();
        arrow.moveTo(sourceStar.x, sourceStar.y);
        arrow.lineTo(tempX, tempY);

        sourceStar.connectionMap.set(connectedStarObject.name, {arrowShape: arrow, isMouseOver: false, isActive: false});
      }
    })
  }

  /*******************************************************/
  // Draw
  /*******************************************************/

  // visual settings

  static radius = 9.5
  //static borderRadius = 11
  //static borderColor = "white"
  static playerColor = "#0b8f00"
  static enemyColor = "#9c0000"
  //#A40000
  static color = "";
  static defaultColor = "";
  static mouseOverColor = "white"
  static linkColor = "rgba(128,128,128,.5)"

  mouseOver(isMouseOver){
    if (isMouseOver && this.controlledBy === "player"){
      this.color = Star.mouseOverColor;
      this.isMouseOver = true;
    }
    else {
      this.color = this.defaultColor;
      this.isMouseOver = false;
    }
  }

  static drawAllStars(context){
    //context.shadowColor = "white"
    //context.shadowBlur = 30;
    Star.starArray.forEach(star => {
      star.draw(context)
    })
    //context.shadowColor = ""
    //context.shadowBlur = 0;
  }

  draw(context) {

    //draw lines
    context.fillStyle = this.color;
    context.strokeStyle = Star.linkColor;
    context.lineWidth = 1;
    context.setLineDash([5,20]);
    for (let [key, value] of this.connectionMap) {
      let connectedStarObject = Star.starArray.filter(connectedStar => connectedStar.name === key)[0]
      context.beginPath();
      context.moveTo(this.x, this.y);
      context.lineTo(connectedStarObject.x, connectedStarObject.y);
      context.stroke();
    }
    context.setLineDash([]);

    //border of star
    //context.lineWidth = 1;
    //context.fillStyle = Star.borderColor;
    //context.fill(this.borderShape);

    //name text
    //this.isMouseOver ? context.globalAlpha = 1 : context.globalAlpha = 0.5;  
    //context.globalAlpha = 0.5; 
    //context.fillStyle = "white"
    //context.font = "12pt MicrogrammaDExtendedBold";
    //context.fillText("" + this.name, this.x-18, this.y+30);
    //context.globalAlpha = 1;
    //number of ships text
    //context.fillStyle = "blue"
    //context.fillText("" + this.numShips, this.x-7, this.y+5);

    //arrow 
    context.lineWidth = 10;
    for (let [key, value] of this.connectionMap) {
      if (value.isActive) {
        context.strokeStyle = "white";
        context.stroke(value.arrowShape);
      }
      else if(this.isMouseOver && this.controlledBy === "player") {
        context.strokeStyle = "grey"
        context.stroke(value.arrowShape);
      }
    }

    //star
    context.fillStyle = this.defaultColor;
    context.fill(this.shape);
  }
}