var numberOfRows; 
var numberOfColumns; 

var xStep; 
var yStep; 

var positions = [];
var lines = [];

function setup(){

  createCanvas(2000, 1000); 
  background(255); 
  noStroke(); 

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

function draw(){
  fill(0, 0, 0); 
  stroke(0, 1);
  
  for(var i = 0; i < positions.length; i++){ 
    rect(positions[i].x, positions[i].y, 3, 3);
    line(positions[i].x, positions[i].y,positions[i].x+10, positions[i].y+10); 
  }

  // for (var x = 0; x < width; x += width / numberOfColumns) {
		// for (var y = 0; y < height; y += height / numberOfRows) {
		// 	stroke(0);
		// 	strokeWeight(1);
		// 	line(x, 0, x, height);
		// 	line(0, y, width, y);
		// }
  //  }
}
