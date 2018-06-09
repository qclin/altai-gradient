
function setup() {
	createCanvas(windowWidth, windowHeight);
	background(100);
}


function draw(){


  var c1 = color(255, 0, 100, 200);
  var c2 = color(100, 100, 255, 200);
    translate(width / 2, height / 2);

    var countSteps = 200;
    for (var i = 0; i <= countSteps; i++) {
      var r = map(i, 0, countSteps, 200, 0);
      var c = lerpColor(c1, c2, map(i, 0, countSteps, 0, 1));
      stroke(c);
      strokeWeight(4);
      var countSegments = 100;
      beginShape();
        for (var j = 0; j < countSegments; j++) {
          var x = r * cos(map(j, 0, countSegments, 0, 2 * PI));
          var y = r * sin(map(j, 0, countSegments, 0, 2 * PI));
          // vertex(x + r * noise(x / 100, y / 100, 0), y + r * noise(x / 100, y / 100, 100));
  				vertex(x * noise(x) *r, y * noise(y)* r);

        }
      endShape(CLOSE);
    }
}
