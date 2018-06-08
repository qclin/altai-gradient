"use strict";

class Boid {
  constructor(x, y, targetX, targetY, skipRate, col, maxSpeed, traceLength) {
    this.targetX = targetX;
    this.targetY = targetY;
    this.skipRate = skipRate;
    this.pos = createVector(x, y);
    this.vel = createVector(random(-1, 1), random(-1, 1));
    this.acc = createVector();

    this.history = [];
    this.traceLength = traceLength;
    this.maxSpeed = 5; // max speed;
    this.maxSteerForce = 0.1; // max steering force

    this.separateDistance = 10;
    this.neighborDistance = 10;
    this.scale = random(0.3, 0.98);
    this.fillColor = color(155);
    this.col = col
    this.sinAdj = random(0.1, 1.1);
  }
  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed); //***
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.angle = this.vel.heading();

    var v = createVector(this.pos.x, this.pos.y)
    this.history.push(v);
    if (this.history.length > this.traceLength){
      this.history.splice(0, 1);
    }

  }
  applyForce(force) {
    this.acc.add(force);

  }
  flock(others) {
    var target = createVector(this.targetX, this.targetY);
    // var seekForce = this.seek(target);
    var sepaForce = this.separate(others);
    var coheForce = this.cohesion(others);
    var alignForce = this.align(others);

    //adjustment

    //seekForce.mult(1.3);
    sepaForce.div(0.5);
    // this.applyForce(seekForce);
    this.applyForce(sepaForce);
    this.applyForce(coheForce);
    this.applyForce(alignForce);
  }
  seek(target) {
    var desired = p5.Vector.sub(target, this.pos);
    desired.setMag(this.maxSpeed);
    var steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxSteerForce);
    this.applyForce(steer);
    return steer;
  }

  separate(others) {
    //var
    var vector = createVector();
    var count = 0;
    //sum
    for (var i = 0; i < others.length; i++) {
      var other = others[i];
      var distance = this.pos.dist(other.pos);

      if (distance > 0 && distance < this.separateDistance) {
        var diff = p5.Vector.sub(this.pos, other.pos);
        diff.normalize();
        diff.div(distance);
        vector.add(diff); //sum
        count++;
      }
    }

    //avg
    if (count > 0) {
      vector.div(count); //avg
    }
    if (vector.mag() > 0) {
      vector.setMag(this.maxSpeed);
      vector.sub(this.vel); //desired velocity
      vector.limit(this.maxSteerForce);
      this.applyForce(vector);
      return vector;
    }
    return vector;
  }

  cohesion(others) {
    var position = createVector();
    var count = 0;
    for (var i = 0; i < others.length; i++) {
      var other = others[i];
      var distance = this.pos.dist(other.pos);
      if (distance > 0 && distance < this.neighborDistance) {
        position.add(other.pos);
        count++;
      }
    }
    if (count > 0) {
      position.div(count); //avg
      return this.seek(position);
    }
    return position;
  }

  align(others) {
    var velocity = createVector();
    var count = 0;
    for (var i = 0; i < others.length; i++) {
      var other = others[i];
      var distance = this.pos.dist(other.pos);
      if (distance > 0 && distance < this.neighborDistance) {
        velocity.add(other.vel); //sum
        count++;
      }
    }
    if (count > 0) {
      velocity.div(count); //avg
      velocity.setMag(this.maxSpeed);
      var steer = p5.Vector.sub(velocity, this.vel);
      steer.limit(this.maxSteerForce);
      return steer;
    }
    return velocity;
  }

  checkEdges() {
    // x
    if (this.pos.x < 0) {
      this.pos.x = width;
    } else if (this.pos.x > width) {
      this.pos.x = 0;
    }
    // y
    if (this.pos.y < 0) {
      this.pos.y = height;
    } else if (this.pos.y > height) {
      this.pos.y = 0;
    }
  }
  drawTraces(){
    for(var i = 0; i < this.history.length; i++){
      var pos = this.history[i];
      fill(100);
      ellipse(pos.x, pos.y, sin(0)*i+1, sin(0)*i+1);
    }
  }

  display() {
    // fill(this.col.to);
    fill(100);
    ellipse(this.pos.x, this.pos.y, 4, 4);
    // push();
    // translate(this.pos.x, this.pos.y);
    // rotate(this.angle);
    // noStroke();
    // // fill(255, 100);
    // // if(frameCount % 10 == 1){
    //   fill(color(this.col.from));
    // // }
    //
    // scale(this.scale);
    // ellipse(0, 0, 3, 3);
    // push();
    // var freq = frameCount * 0.1 * this.sinAdj;
    // var amp = 1 * this.sinAdj;
    // var Adj = sin(freq) * amp;
    // scale(this.scale * 0.98);
    // // triangle(0, 0, -7, 5 * Adj, -27, -5 * Adj);
    // pop();
    // //
    // // fill(0);
    // // scale(this.scale);
    // // ellipse(8 + Adj, 2 + Adj, 5, 5);
    // // stroke(0);
    // // line(20, -2 + Adj, 15 + Adj, -2 + Adj);
    // //
    // pop();
  }

  follow(path) {
    // Predict location 50 (arbitrary choice) frames ahead
    // This could be based on speed
    if(!path) return;
    let predict = this.vel.copy();
    predict.normalize();
    predict.mult(50);
    let predictLoc = p5.Vector.add(this.pos, predict);
    // Now we must find the normal to the path from the predicted location
    // We look at the normal for each line segment and pick out the closest one
    let normal = null;
    let target = null;
    let worldRecord = 1000000; // Start with a very high record distance that can easily be beaten
    // Loop through all points of the path
    for (let i = 0; i < path.length - 1; i++) {
      // Look at a line segment
      let a = path[i];
      let b = path[i + 1];
      //println(b);

      // Get the normal point to that line
      let normalPoint = getNormalPoint(predictLoc, a, b);
      // This only works because we know our path goes from left to right
      // We could have a more sophisticated test to tell if the point is in the line segment or not
      if (normalPoint.x < a.x || normalPoint.x > b.x) {
        // This is something of a hacky solution, but if it's not within the line segment
        // consider the normal to just be the end of the line segment (point b)
        normalPoint = b.copy();
      }

      // How far away are we from the path?
      let distance = p5.Vector.dist(predictLoc, normalPoint);
      // Did we beat the record and find the closest line segment?
      if (distance < worldRecord) {
        worldRecord = distance;
        // If so the target we want to steer towards is the normal
        normal = normalPoint;

        // Look at the direction of the line segment so we can seek a little bit ahead of the normal
        let dir = p5.Vector.sub(b, a);
        dir.normalize();
        // This is an oversimplification
        // Should be based on distance to path & velocity
        dir.mult(10);
        target = normalPoint.copy();
        target.add(dir);
      }
    }
    // Only if the distance is greater than the path's radius do we bother to steer
    // if (worldRecord > p.radius && target !== null) {
    //   this.seek(target);
    // }
    // Draw the debugging stuf
  }
}

function getNormalPoint(p, a, b) {
  // Vector from a to p
  let ap = p5.Vector.sub(p, a);
  // Vector from a to b
  let ab = p5.Vector.sub(b, a);
  ab.normalize(); // Normalize the line
  // Project vector "diff" onto line by using the dot product
  ab.mult(ap.dot(ab));
  let normalPoint = p5.Vector.add(a, ab);
  return normalPoint;
}
