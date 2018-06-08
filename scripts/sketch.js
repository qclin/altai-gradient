var zones = [];
var repellers = [];
var boids = [];
var flock;

var boidsHistory = []

// Environment zones
var maxdia;
var noisescale=.001; //.001
var noisefactor=2;
var skipRate = 1;
var envInterval

var cosmos = [];
var showCosmo = false;
var altaiColors = [
  { from: "#D3D3D3", to: "#B8C6DB" },  // "Glacier
  { from: "#A7DFEF", to: "#20BF55" },  // "AlpineMeadow
  { from: "#F1A7F1", to: "#FAD0C4" }, // "Tundra
  { from: "#FFF", to: "#7AA493" },  // "HighlandFores
  { from: "#A8A0AF", to: "#9E768F" },  // "SwampForests
  { from: "#DED2BA", to: "#A83315" }, // "HighlandPrairie
  { from: "#ECD5A5", to: "#FF9566" } // "LowlandPrairie
]
var col;
var grid;
var milli;
// function preload(){
//   for(var i = 0; i < 4; i++){
//     cosmos.push(loadImage(`assets/cosmoSVG/cosmo_${i+1}.svg`));
//   }
// }

function setup() {
  createCanvas(windowWidth, windowHeight);
  grid = new Grid();
  grid.setup();
  maxdia=windowWidth/5;
  addZone1();
  addZone2();
  addZone3();
  addZone4();


}


function addZone1(){
    // var x = random(maxdia,width-maxdia);
    // var y = random(maxdia,height-maxdia);

    var x = random(width/2-maxdia/2,width/2+maxdia/2);
    var y = random(height/2 - maxdia/2,height/2-maxdia);
    addBlob(x, y);
}
function addZone2(){
    var x = random(width/2+maxdia/2,width-maxdia/2);
    var y = random(maxdia/2,height/2-maxdia);

    addBlob(x, y);
}
function addZone3(){
    var x = random(width/2-maxdia/2,width/2-maxdia/2);
    var y = random(height/2,height-maxdia);
    addBlob(x, y);
}
function addZone4(){
    var x = random(width/2+maxdia/2,width-maxdia/2);
    var y = random(height/2+maxdia,height-maxdia);
    addBlob(x, y);
}


function addBlob(x, y){
  noisescale += 0.000001
  var dia=maxdia*random(1, 1.2);

  // Choose, assign, splice
  var colorIndex = Math.floor(random(altaiColors.length))
  col = altaiColors[colorIndex];
  altaiColors.splice(colorIndex, 1);
  var one = new Blob(x, y, dia, int(dia/2), col);
  zones.push(one);

  var population = random(1, 50);
  var maxSpeed = random(.1, 1)
  skipRate += 1

  boids.push([]);

  /// BOID TYPE 0
  for (var i = 0; i < population; i++) {
    var posX = random(0,width);
    var posY = random(0,height);
    var traceLength = random(5, 100);
    boids[boids.length - 1].push(new Boid(posX, posY, x, y, skipRate, col, maxSpeed, traceLength));
  }

  // blue nodes
  setTimeout(function(){
    var repel = new smBlob(x, y, 20, 200, col); /// these could appear much later as clickacle into the cosmograms
    repellers.push(repel);

  }, 3000)


}

function mousePressed(){
  console.log("mousePressed -- clicked");
  for(var i = 0; i < repellers.length; i++){
    repellers[i].clicked();
  }
}

function draw() {
  background(255);
  grid.display();


  if(zones.length == 4){
    clearInterval(envInterval)
  }

  for (var i=0; i<zones.length; i++) {
    zones[i].display();
    var oneflock = boids[i];

    // var chooseCos = floor(random(0, cosmos.length))
    // image(cosmos[i], zones[i].x + sin(360) * 8, zones[i].y + sin(360) * 8);

    /// BOID TYPE 0
    var center = createVector(zones[i].x, zones[i].y)
    for (var j = 0; j < oneflock.length; j++) {
      var b = oneflock[j];

      if(minute()%2 == 1){
        console.log(' we are herer ----- ', minute()%4)
        b.seek(center);
      }else{
        // b.follow(zones[i].path);
      }
      b.flock(oneflock);

      // b.flock(oneflock);
      b.update();
      b.checkEdges();
      b.display();
      b.drawTraces();

      // boidsHistory[i].push(boids[i].pos);
    }
  }
  // for (var i=0; i<repellers.length; i++) {
  //   repellers[i].display();
  // }

  // /// BOID TYPE 1
  // flock.run();
  // flock.target(createVector(200, 200));

  // drawCosmos();

}

function drawCosmos(){
  milli = millis();
  // if( milli > 60 * 1000 ){
  //   image(cosmos[0], zones[0].x + sin(360) * 8, zones[0].y + sin(360) * 8);
  // }

  // if( milli > 1 * 1000 &&  milli < 25 * 1000){

  if(minute()%2 == 1){
    showCosmo = true;
  }else{
    showCosmo = false;

  }

  if(showCosmo){
    var centerX;
    var centerY;
    // var radius = 200/2;
    // var h = random(0, 360);
    // for (var r = radius; r > 0; --r) {
    //   fill(255);
    //   ellipse(zones[2].x, zones[2].y, r, r);
    //   h = (h + 1) % 360;
    // }
    noStroke();
    fill(255, 255, 255, 155);
    for(var i = 0; i< cosmos.length; i ++){
      // ellipse(zones[i].x, zones[i].y, 100, 100);
      image(cosmos[i], zones[i].x - cosmos[i].width/2, zones[i].y - cosmos[i].height/2);
    }

  }

}
