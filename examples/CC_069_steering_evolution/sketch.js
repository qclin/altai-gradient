// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain

// Steering Evolution
// Another version:
// https://github.com/shiffman/NOC-S17-2-Intelligence-Learning/tree/master/week2-evolution/01_evolve_steering

// Part 1: [TBA]
// Part 2: [TBA]
// Part 3: [TBA]
// Part 4: [TBA]
// Part 5: [TBA]

var vehicles = [];
var food = [];
var poison = [];

var debug;
// grid
var numberOfRows;
var numberOfColumns;
var xStep;
var yStep;
var positions = [];
var lines = [];

function setup() {
  createCanvas(1980, 1080);
  for (var i = 0; i < 100; i++) {
    var x = random(width);
    var y = random(height);
    vehicles[i] = new Vehicle(x, y);
  }

  for (var i = 0; i < 40; i++) {
    var x = random(width);
    var y = random(height);
    food.push(createVector(x, y));
  }

  for (var i = 0; i < 20; i++) {
    var x = random(width);
    var y = random(height);
    poison.push(createVector(x, y));
  }

  debug = createCheckbox();
  numberOfColumns = 20;
  numberOfRows = 10;
  xStep = width/numberOfColumns;
  yStep = height/numberOfRows;
  for(var x = 0; x < width; x += xStep){
    for(var y = 0; y < height; y += yStep){
      var p = createVector(x, y);
      positions.push(p);
    }
  }


}

function mouseDragged() {
  vehicles.push(new Vehicle(mouseX, mouseY));
}

function draw() {
  background(255, 255, 255, 0.8);
  if (random(1) < 0.1) {
    var x = random(width);
    var y = random(height);
    food.push(createVector(x, y));
  }

  if (random(1) < 0.01) {
    var x = random(width);
    var y = random(height);
    poison.push(createVector(x, y));
  }


  for (var i = 0; i < food.length; i++) {
    fill(0, 255, 0);
    noStroke();
    ellipse(food[i].x, food[i].y, 4, 4);
  }

  for (var i = 0; i < poison.length; i++) {
    fill(255, 0, 0);
    noStroke();
    ellipse(poison[i].x, poison[i].y, 4, 4);
  }

  for (var i = vehicles.length - 1; i >= 0; i--) {
    vehicles[i].boundaries();
    vehicles[i].behaviors(food, poison);
    vehicles[i].update();
    vehicles[i].display();

    var newVehicle = vehicles[i].clone();
    if (newVehicle != null) {
      vehicles.push(newVehicle);
    }

    if (vehicles[i].dead()) {
      var x = vehicles[i].position.x;
      var y = vehicles[i].position.y;
      food.push(createVector(x, y));
      vehicles.splice(i, 1);
    }

  }
  fill(0, 0, 0);
  stroke(0, 1);
  for(var i = 0; i < positions.length; i++){
    rect(positions[i].x, positions[i].y, 3, 3);
    line(positions[i].x, positions[i].y,positions[i].x+10, positions[i].y+10);
  }

}
