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
    beginShape();
    var i;

    for (var j=0; j<=this.n; j++) {

      var gradColor = lerpColor(this.huFrom, this.huTo, cos(j));
      var gradColor2 = lerpColor(this.huFrom, this.huTo, sin(j));
      fill(color(this.huFrom.levels[0], this.huFrom.levels[1], this.huFrom.levels[2], 155));
      stroke(color(gradColor2.levels[0], gradColor2.levels[1], gradColor2.levels[2], 155));

      i=j%this.n;
      px=this.x+this.points[i].x+this.dia*noisefactor*(1-2*noise(noisescale*(this.points[i].x+this.x+this.offset1), noisescale*(this.points[i].y+this.y+this.offset1)));
      py=this.y+this.points[i].y+this.dia*noisefactor*(1-2*noise(noisescale*(this.points[i].x+this.x+this.offset2), noisescale*(this.points[i].y+this.y+this.offset2)));

      vertex(px, py);
      /// here create an array to store the points of the blob edges
      let point = createVector(px, py);
      this.path.push(point);

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
