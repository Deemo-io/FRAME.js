let colors = ["#F33", "#EE8899", "#59E", "#3AF", "#7E8", "#3F1"];

class Particle extends Actor {
	constructor(x,y) {
		super(x,y);

		// stuff that modifies looks
		this.width = Math.random()*20+10;
		this.height = Math.random()*20+10;
		this.color = colors[Math.floor(Math.random()*colors.length)];
		this.maxLife = Math.random()*100+50;
		this.life = this.maxLife;

		// stuff that modifies behavior
		this.rotation = Math.random();
		this.rotationRate = (Math.random()-0.5)*0.2;
		this.xVel = (Math.random()-0.5)*5;
		this.yVel = -10;
	}
	update() {
		this.x += this.xVel;
		this.y += this.yVel;
		this.yVel += 0.3;
		this.rotation += this.rotationRate;

		this.life -= 1;

		// destroy particles when old
		if (this.life <= 0) this.dead = true;
	}
	render() {
		this.ctx.fillStyle = this.color;
		this.ctx.globalAlpha = this.life/this.maxLife;
		this.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
		this.ctx.globalAlpha = 1;
	}
}

// set up the scene
window.onload = function() {
	FRAME.init(800, 600);
	mouse = new Mouse();
	mainCollection = new Collection();

	main();
}

// the main loop
function main() {
	FRAME.clearScreen();
	mouse.update();

	// update and draw particles
	mainCollection.update();
	mainCollection.draw();

	// add new particles
	if (mouse.clicking) {
		mainCollection.add(new Particle(mouse.x, mouse.y));
	}

	FRAME.requestFrame(main);
}