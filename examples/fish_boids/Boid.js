"use strict";

class Boid {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-1, 1), random(-1, 1));
    this.acc = createVector();

    this.maxSpeed = 3; // max speed;
    this.maxSteerForce = 0.05; // max steering force

    this.separateDistance = 30;
    this.neighborDistance = 50;
    this.scale = random(0.3, 0.98);
    this.fillColor = color(255, random(200), random(50));
    this.sinAdj = random(0.1, 1.1);
  }
  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed); //***
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.angle = this.vel.heading();
  }
  applyForce(force) {
    this.acc.add(force);
  }
  flock(others) {
    var target = createVector(mouseX, mouseY);
    var seekForce = this.seek(target);
    var sepaForce = this.separate(others);
    var coheForce = this.cohesion(others);
    var alignForce = this.align(others);

    //adjustment

    //seekForce.mult(1.3);
    sepaForce.div(0.5);

    this.applyForce(seekForce);
    this.applyForce(sepaForce);
    this.applyForce(coheForce);
    this.applyForce(alignForce);

  }
  seek(target) {
    var desired = p5.Vector.sub(target, this.pos);
    desired.setMag(this.maxSpeed);
    var steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxSteerForce);
    //this.applyForce(steer);
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
      //this.applyForce(vector);
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
  display() {
    push();

    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    noStroke();
    // fill(255, 100);
    fill(this.fillColor);

    scale(this.scale);
    ellipse(0, 0, 35, 20);
    push();
    var freq = frameCount * 0.1 * this.sinAdj;
    var amp = 1 * this.sinAdj;
    var Adj = sin(freq) * amp;
    scale(this.scale * 0.98);
    triangle(0, 0, -27, 5 + 10 * Adj, -27, -10 * Adj - 5);
    pop();

    fill(0);
    scale(this.scale);
    ellipse(8 + Adj, 2 + Adj, 5, 5);
    stroke(0);
    line(20, -2 + Adj, 15 + Adj, -2 + Adj);

    pop();
  }
}
