class Grid{
  constructor(w, h){
    this.numberOfRows = 16;
    this.numberOfColumns = 16;

    this.xStep = w/this.numberOfColumns;
    this.yStep = h/this.numberOfRows;

    this.positions = [];
    this.lines = [];
    this.w = w;
    this.h = h;
    this.colors = [255, 0];
    this.strokealpha = [0, 0.2];
  }

  setup(){

    for(var x = 0; x < this.w; x += this.xStep * Math.floor(random(1, 3))){
      for(var y = 0; y < this.h; y += this.yStep * Math.floor(random(1, 3))){
        var p = createVector(x, y);
        this.positions.push(p);
      }
    }
  }


  display(){
    stroke(0, 1);
    fill(155);
    for(var i = 0; i < this.positions.length; i ++){
      rect(this.positions[i].x, this.positions[i].y, 3, 3);
      line(this.positions[i].x, this.positions[i].y, this.positions[i].x+10, this.positions[i].y+10);
    }
  }
}
