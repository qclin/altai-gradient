//bubbles Pierre MARZIN 09/2017
// reference https://www.openprocessing.org/sketch/445834
class Blob {

  constructor(x, y, dia, n, col){

    this.x=x;
    this.y=y;
    this.offset1=random(10);
    this.offset2=random(10);
    this.vx=random(-1, 1);
    this.vy=random(-1, 1);

    // this.vx=sin(this.angle);
    // this.vy=sin(this.angle);
    this.dia=dia;
    this.n=n;
    this.points=[];
    this.Y_AXIS = 1;
    this.X_AXIS = 2;
    this.huFrom = color(col.from);
    this.huTo = color(col.to);

    this.angle=TWO_PI/n;
    for (var i=0; i<n; i++) {
      this.points[i]=createVector(this.dia*sin(i*this.angle), this.dia*cos(i*this.angle));
    }

    this.path = [];
  }


  display () {
    var px, py;

    this.x+=this.vx*0.1;
    this.y+=this.vy*0.1;
    var collide=false;


    // put a loop out here

    var c1 = color(this.huFrom.levels[0], this.huFrom.levels[1], this.huFrom.levels[2], 155);
    var c2 = color(this.huTo.levels[0], this.huTo.levels[1], this.huTo.levels[2], 155);

    var countSteps = this.n;
  	for (var i = 0; i <= countSteps; i++) {


        var r = map(i, 0, j, 200, 0);
        var c = lerpColor(this.huFrom, this.huTo, map(i, 0, j, 0, 1));
        stroke(c);
        strokeWeight(4);


        beginShape();
        var i;
        var countSegments = 100;

        for (var j=0; j<=countSegments; j++) {

          i=j%this.n;

          var pointX = this.points[i].x;
          var pointY = this.points[i].y;


          px= this.x + pointX +this.dia*noisefactor
          //*(1-2*noise(noisescale*(pointX+this.x+this.offset1), noisescale*(pointY+this.y+this.offset1)));


          py=this.y + pointY +this.dia*noisefactor

          //*(1-2*noise(noisescale*(pointX+this.x+this.offset2), noisescale*(pointY+this.y+this.offset2)));

          //
          // var x = r * cos(map(j, 0, countSegments, 0, 2 * PI));
  				// var y = r * sin(map(j, 0, countSegments, 0, 2 * PI));
  				// vertex(x + r * noise(x / 100, y / 100, 0), y + r * noise(x / 100, y / 100, 100));
          //

          vertex(px, py);

          // let point = createVector(px, py);
          // this.path.push(point);

          if (!collide&&(px+this.vx<0||px+this.vx>width)){
            this.vx=-this.vx;
            collide=true;
          }
          if (py+this.vy<0||py+this.vy>height){
            this.vy=-this.vy;
            collide=true;
          }
        }
        endShape();


    }
  }

}
