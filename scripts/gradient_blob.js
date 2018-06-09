///https://www.openprocessing.org/sketch/559923



class GradBlob {
	constructor(x, y, col1, col2, countSteps){
		this.x=x;
		this.y=y;
		this.noisescale=.001;
		this.noisefactor=2;
		this.col1 = col1;
		this.col2 = col2;
		this.countSteps; // 200
		this.countSegments; // 1000
	}

	display(){
		this.noisescale += 0.00001
		this.countSegments = 1000;
		push()
		translate(this.x, this.y);

		for (var i = 0; i <= this.countSteps; i++) {
			var r = map(i, 0, this.countSteps, 200, 0);
			var c = lerpColor(c1, c2, map(i, 0, this.countSteps, 0, 1));
			stroke(c);
			strokeWeight(40);
			beginShape();
				for (var j = 0; j < this.countSegments; j++) {
					var x = r * cos(map(j, 0, this.countSegments, 0, 2 * PI));
					var y = r * sin(map(j, 0, this.countSegments, 0, 2 * PI));
					vertex(x + r * noise(x* this.noisescale , y * this.noisescale , 10), y + r * noise(x* this.noisescale, y* this.noisescale, 100));
					// vertex(x * noise(x, y) *r, y * noise(y, x)* r);
				}
			endShape(CLOSE);
		}
		pop()
	}
}

// function draw() {
// 	var c1 = color(255, 0, 100, 10);
// 	var c2 = color(100, 100, 255, 10);
// }
