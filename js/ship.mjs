import { Star } from './star.mjs';

export class Ship {

  /*******************************************************/
  // Constructor
  /*******************************************************/
  constructor(sourceStar, controlledBy) {

    this.id = Ship.id;
    Ship.incId();

    this.state = 'inStar'
    this.inStarName = sourceStar.name;
    this.x = sourceStar.x;
    this.y = sourceStar.y;
    this.sourcePoint.x = sourceStar.x;
    this.sourcePoint.y = sourceStar.y;
    //this.shape.rect(this.x-20 + (i*10), this.y - 25, Ship.width, Ship.height);

    this.controlledBy = controlledBy
    this.controlledBy === "player" ? this.defaultColor = Ship.playerColor : this.defaultColor = Ship.enemyColor;
    this.controlledBy === "player" ? this.color = Ship.playerColor : this.color = Ship.enemyColor;
    this.controlledBy === "player" ? Ship.numPlayerShips++ : Ship.numEnemyShips++;
    this.shape = new Path2D();
    
    this.createTime = performance.now()
    this.rotationSpeed = 4000 + (Math.random() * 50000)
    this.orbitDirection = sourceStar.orbitDirection;
  }

  /*******************************************************/
  // Object management
  /*******************************************************/

  // holds all the ship objects
  static shipArray = [];
  // id uniquely identifies ship in array
  static id = 0;
  static incId = () => {Ship.id++}

  // holds player and enemy ship count
  static numPlayerShips = 0;
  static numEnemyShips = 0;

  /*******************************************************/
  // Holds state for individual ship
  /*******************************************************/

  state = '' // inStar, inTransit, inFight
  inStarName = ''
  sourceStar = ''
  destStar = ''
  // movement
  sourcePoint = {x:0, y:0}
  destPoint = {x:0, y:0}


  /*******************************************************/
  // Send ship to another star
  /*******************************************************/

  sendTo(destStar){
    destStar = Star.starArray.filter(star => star.name === destStar)[0];
    this.sourceStar = this.inStarName;
    this.inStarName = '';
    this.destStar = destStar;
    this.state = 'inTransit'
    this.x = this.sourcePoint.x;
    this.y = this.sourcePoint.y;
    this.destPoint.x = this.destStar.x;
    this.destPoint.y = this.destStar.y;
    //destStar.receiveShip(this);
  }

  /*******************************************************/
  // Update ship when arriving at star
  /*******************************************************/

  /*******************************************************/
  // Movement
  /*******************************************************/

  // distance a ship moves every update
  static distanceChange = .5;

  updateLocation(){
    if (this.state === 'inTransit') {
      let angle = Math.atan2(this.destPoint.y - this.sourcePoint.y, this.destPoint.x - this.sourcePoint.x);
      this.x += Math.cos(angle) * Ship.distanceChange;
      this.y += Math.sin(angle) * Ship.distanceChange;
      this.shape = new Path2D();
      this.shape.rect(this.x, this.y-5, Ship.width, Ship.height);
    }
    if (this.state == 'inStar') {
      let orbitRadius;
      this.orbitDirection == 1 ? orbitRadius = 18 : orbitRadius = 18;
      let currentTime = performance.now()
      let passedTime = currentTime - this.createTime;
      let angle = this.orbitDirection * (Math.PI * 2 * (passedTime / this.rotationSpeed) + this.rotationSpeed);//random value
      this.x = this.sourcePoint.x + Math.cos(angle) * orbitRadius
      this.y = this.sourcePoint.y + Math.sin(angle) * orbitRadius
      this.shape = new Path2D();
      this.shape.rect(this.x, this.y-5, Ship.width, Ship.height);
    }
  }

  /*******************************************************/
  // Arrive at star
  /*******************************************************/

  checkArrivedAtStar(context){

    // if ship in transit
    if (this.state === 'inTransit') {

      // and reached destination star
      if (context.isPointInPath(this.destStar.shape, this.x, this.y)) {

        // check if enemy star
        if (this.destStar.controlledBy !== this.controlledBy) {

          // if enemy star has any ships
          if (this.destStar.numShips >= 1) {
            
            //destroy one of each players ships. and update numships for that star
            //fix logic use filter to get 1 ship instead of loop through all
            //fix naming enemy vs other
            let destroyed = false;
            Ship.shipArray.forEach( enemyShip => {
              if(enemyShip.state === 'inStar' && enemyShip.inStarName === this.destStar.name && destroyed === false){
                this.destStar.destroyShip();
                Ship.shipArray = Ship.shipArray.filter( ship => ship.id !== this.id)
                Ship.shipArray = Ship.shipArray.filter( ship => ship.id !== enemyShip.id)
                destroyed = true;
              }
            })
          }
          // if enemy star has no ships, make star friendly
          else {
            this.destStar.changeControlTo(this.controlledBy);
          }
        }

        // if star is friendly, add ship
        if (this.destStar.controlledBy === this.controlledBy) {
          this.state = 'inStar'
          this.inStarName = this.destStar.name;
          this.sourcePoint.x = this.destStar.x
          this.sourcePoint.y = this.destStar.y
          this.orbitDirection = this.destStar.orbitDirection;
          this.destStar.receiveShip();
          this.shape = new Path2D();
          //this.shape.rect(this.x-20 + (this.destStar.numShips*10), this.y - 25, Ship.width, Ship.height);
          this.destStar = ''
        }
      }
    }
  }

  /*******************************************************/
  // Fight
  /*******************************************************/

  checkInTransitFight(context){
    if (this.state === 'inTransit' && this.controlledBy === 'player') {
      Ship.shipArray.forEach( enemyShip => {
        if(enemyShip.state === 'inTransit' && enemyShip.controlledBy === 'enemy'){
          // if they intersect destroy both (remove from ship array)
          if (context.isPointInPath(enemyShip.shape, this.x, this.y)) {
            Ship.shipArray = Ship.shipArray.filter( ship => ship.id !== this.id)
            Ship.shipArray = Ship.shipArray.filter( ship => ship.id !== enemyShip.id)
            Star.numPlayerShips--;
            Star.numEnemyShips--;
          }
      }
      })
    }
  }

  // check atStar fight
  // 

  /*******************************************************/
  // Setup ships for a level
  /*******************************************************/

  static setupShips() {
    Star.starArray.forEach(star => {
      for (let i=0; i<star.numShips; i++){
        Ship.shipArray.push(new Ship(star, star.controlledBy));
      }
    })
    Ship.shipArray.forEach(ship => {
      ship.updateLocation();
    })
  }

  /*******************************************************/
  // Draw
  /*******************************************************/

  // visual settings

  static width = 5
  static height = 10
  //static color = "#CC3363"
  //static color = "#598AF9"
  //static playerColor = "#9AD1D4"
  static playerColor = "#24d014"
  //player colorblind = O
  //enemy colorblind = X letter or shape
  // or make block and circle
  static enemyColor = "#C60000"
  static color = ""
  static defaultColor = ""

  static drawAllShips(context){
    Ship.shipArray.forEach(ship => {
        ship.draw(context);
      })
  }

  draw(context) {
    context.fillStyle = this.color;
    context.fill(this.shape); 
  }
}