timestep = new Timestep();
mouse = new Mouse();
prevMousex = 0;
prevMousey = 0;
keyboard = new Keyboard();

window.onload = function() {
	FRAME.init(800, 600, document.getElementById("canvas"));
	ctx = FRAME.ctx;
	mouse = new Mouse();
	
	flowers = new Collection();
	for (var i = 0; i < 20; i++) {
		flowers.add(new Flower(Math.random() * 800, Math.random() * 600));
	}
	
	main();
}

function main() {
	FRAME.clearScreen();
	timestep.tick();
	prevMousex = mouse.x;
	prevMousey = mouse.y;
	mouse.update();
	
	flowers.objects.sort(function(a, b) {
		if (a.y > b.y) return 1;
		else return -1;
	});
	
	flowers.update(timestep.realTime);
	flowers.draw();
	
	requestFrame(main);
}

class Flower extends Actor {
	constructor(x, y) {
		super(x, y);
		
		this.width = 20;
		this.height = 20;
		this.flowerx = 0;
		this.flowery = -25;
		this.xVel = 0;
		this.yVel = 0;
	}
	update(realTime) {
		var tempx = this.x;
		var tempy = this.y;
		this.x += this.flowerx;
		this.y += this.flowery;
		if (checkCollision(mouse, this)) {
			this.xVel += (mouse.x - prevMousex);
			this.yVel += (mouse.y - prevMousey);
		}
		this.x = tempx;
		this.y = tempy;
		
		this.xVel += (0 - this.flowerx) * 0.1;
		this.yVel += (-25 - this.flowery) * 0.1;
		this.flowerx += this.xVel;
		this.flowery += this.yVel;
		this.xVel *= 0.9;
		this.yVel *= 0.9;
	}
	render() {
		this.ctx.beginPath();
		this.ctx.moveTo(0,0);
		this.ctx.lineTo(this.flowerx, this.flowery);
		this.ctx.strokeStyle="#111";
		this.ctx.stroke();
		this.ctx.fillStyle = "#F33323";
		this.ctx.fillRect(this.flowerx - this.width/2, this.flowery - this.height/2, this.width, this.height);
	}
}

function checkCollision(obj1, obj2) {
	if (obj1.width === undefined) obj1.width = 1;
	if (obj1.height === undefined) obj1.height = 1;
	
	return (obj1.x - obj1.width/2 < obj2.x + obj2.width/2 &&
			obj1.x + obj1.width/2 > obj2.x - obj2.width/2 &&
			obj1.y - obj1.height/2 < obj2.y + obj2.height/2 &&
			obj1.y + obj1.height/2 > obj2.y - obj2.height/2);
}