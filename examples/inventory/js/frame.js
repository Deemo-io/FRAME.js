var FRAME = {ctx:null, canvas:null, game_width:0, game_height:0, scaleX:1, scaleY:1, x:0, y:0, smoothing:false, images: new Map(), sounds: new Map(), extraX:0, extraY:0, shakeAmount:0, shakeDuration:0};
FRAME.resize = function() {
	var stageWidth = window.innerWidth;
	var stageHeight = window.innerHeight;
	
	var ratio = stageWidth / stageHeight;
	
	if (ratio > FRAME.game_width / FRAME.game_height) {
		FRAME.scaleY = FRAME.scaleX = stageHeight / FRAME.game_height;
	}
	else {
		FRAME.scaleX = FRAME.scaleY = stageWidth / FRAME.game_width;
	}
	if (stageWidth > 1000) FRAME.scaleX = FRAME.scaleY;
	
	FRAME.canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	FRAME.canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	FRAME.x = stageWidth / 2 - FRAME.game_width * FRAME.scaleX / 2;
	FRAME.y = stageHeight / 2 - FRAME.game_height * FRAME.scaleY / 2;
	
	FRAME.ctx.imageSmoothingEnabled = FRAME.smoothing;
}
FRAME.init = function(w, h, canvas) {
	FRAME.game_width = w;
	FRAME.game_height = h;
	FRAME.canvas = canvas;
	FRAME.ctx = canvas.getContext("2d");
	
	window.addEventListener( 'resize', FRAME.resize, false );
	FRAME.resize();
}
FRAME.shake = function(amt, dur) {
	FRAME.shakeAmount = amt;
	FRAME.shakeDuration = dur;
}
FRAME.clearScreen = function() {
	FRAME.ctx.setTransform(FRAME.scaleX, 0, 0, FRAME.scaleY, FRAME.x + FRAME.extraX, FRAME.y + FRAME.extraY);
	FRAME.ctx.clearRect(-FRAME.x / FRAME.scaleX, -FRAME.y / FRAME.scaleY, document.body.clientWidth / FRAME.scaleX, document.body.clientHeight / FRAME.scaleY);
	
	//screen shake
	FRAME.extraX = (Math.random() * (FRAME.shakeAmount * FRAME.shakeDuration) * 2) - (FRAME.shakeAmount * FRAME.shakeDuration);
	FRAME.extraY = (Math.random() * (FRAME.shakeAmount * FRAME.shakeDuration) * 2) - (FRAME.shakeAmount * FRAME.shakeDuration);
	
	FRAME.shakeDuration -= 0.015;
	if (FRAME.shakeDuration <= 0) {
		FRAME.shakeDuration = 0;
	}
}
FRAME.loadImage = function(path, name) {
	var img = new Image();
	img.src = path;
	FRAME.images.set(name, img);
}
FRAME.getImage = function(name) {
	return FRAME.images.get(name);
}
FRAME.loadSound = function(path, name, loop, vol) {
	var audio = new Howl({
		src: [path],
		loop: loop||false,
		volume: vol||1.0
	});
	
	FRAME.sounds.set(name, audio);
}
FRAME.playSound = function(name) {
	if (FRAME.sounds.get(name).loop() == false || FRAME.sounds.get(name).loop() == true && PLAY_MUSIC == true) {
		FRAME.sounds.get(name).play();
	}
}
FRAME.stopSound = function(name) {
	FRAME.sounds.get(name).stop();
}

requestFrame = ( window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function( callback ) {
		window.setTimeout(callback, 1000 / 60);
	});
	
class Actor {
	constructor(x, y, rot, ctx) {
		this.age = 0;
		this.ctx = ctx || FRAME.ctx;
		this.x = x || 0;
		this.y = y || 0;
		this.rotation = rot || 0;
	}
	render() {}
	draw() {
		this.ctx.translate(this.x, this.y);
		this.ctx.rotate(this.rotation);
		this.render();
		this.ctx.rotate(-this.rotation);
		this.ctx.translate(-this.x, -this.y);
	}
	update(deltaTime) {
		this.age += deltaTime;
	}
}

class ImageStrip {
	constructor() {
		this.images = [];
		this.iter = 0;
		this.update = 0.0;
		
		this.add = function(img) {
			this.images.push(img);
		}
		this.step = function(onceEvery, realTime) {
			this.update += realTime;
			if (this.update >= onceEvery) {
				this.iter += 1;
				if (this.iter >= this.images.length) {
					this.iter = 0;
				}
				this.update = 0.0;
			}
			return this.images[this.iter];
		}
	}
}

class Collection {
	constructor(ctx) {
		this.objects = [];
		this.x = 0;
		this.y = 0;
		this.rotation = 0;
		this.ctx = ctx || FRAME.ctx;
	}
	add(obj) {
		this.objects.push(obj);
	}
	remove(obj) {
		var index = this.objects.indexOf(obj);
		if (index != -1) {
			this.objects.splice(index, 1);
		}
	}
	clear() {
		this.objects.splice(0, this.objects.length);
	}
	update(deltaTime) {
		for (var i = 0; i < this.objects.length; i++) {
			this.objects[i].update(deltaTime);
		}
	}
	draw() {
		for (var i = 0; i < this.objects.length; i++) {
			this.ctx.translate(this.x, this.y);
			this.ctx.rotate(this.rotation);
				this.objects[i].draw();
			this.ctx.rotate(-this.rotation);
			this.ctx.translate(-this.x, -this.y);
		}
	}
}

class Text {
	constructor(x, y, text, font, fillStyle, fontsize, justify, rot, ctx) {
		this.x = x || 0;
		this.y = y || 0;
		this.text = text || "";
		this.font = font || "Arial";
		this.fillStyle = fillStyle || "#333";
		this.fontsize = fontsize || 30;
		this.justify = justify || "left";
		this.rotation = rot || 0;
		this.ctx = ctx || FRAME.ctx;
		
		this.update = function(deltaTime) {}
		this.render = function() {}
		this.draw = function() {
			this.ctx.translate(this.x, this.y);
			this.ctx.rotate(this.rotation);
				this.ctx.font = this.fontsize + "px " + this.font;
				this.ctx.fillStyle = this.fillStyle;
				var textWidth = this.ctx.measureText(this.text).width;
				this.render();//whatever extra stuff
				if (this.justify == "left") {
					this.ctx.fillText(this.text, 0, this.fontsize);
				}
				else if (this.justify == "right") {
					this.ctx.fillText(this.text, -textWidth, this.fontsize);
				}
				else {
					this.ctx.fillText(this.text, -textWidth / 2, this.fontsize);
				}
			this.ctx.rotate(-this.rotation);
			this.ctx.translate(-this.x, -this.y);
		}
	}
}

Keyboard = function() {
	keys = [];
	
	function down(e) {
		keys[e.keyCode] = true;
	}
	function up(e) {
		keys[e.keyCode] = false;
	}
	window.addEventListener('keydown', down, false);
	window.addEventListener('keyup', up, false);
	
	return keys;
}

Mouse = function() {
	var mouse = {};
	mouse.x = 0;
	mouse.cx = 0;
	mouse.y = 0;
	mouse.xy = 0;
	mouse.clicking = false;
	
	mouse.update = function() {
		mouse.x = (-FRAME.x + mouse.cx) / FRAME.scaleX;
		mouse.y = (-FRAME.y + mouse.cy) / FRAME.scaleY;
	}
	function move(e) {
		mouse.cx = e.clientX;
		mouse.cy = e.clientY;
	}
	function down() {
		mouse.clicking = true;
	}
	function up() {
		mouse.clicking = false;
	}
	window.addEventListener('mousemove', move);
	window.addEventListener('mousedown', down);
	window.addEventListener('mouseup', up);
	
	return mouse;
}

class Timestep {
	constructor(target) {
		this.deltaTime = 0;
		this.realTime = 0;
		this.currentTime = 0;
		this.lastFrameTime = Date.now();
		this.targetFPS = target || 60;
		
		this.tick = function() {
			this.currentTime = Date.now();
			this.realTime = (this.currentTime - this.lastFrameTime) / 1000;
			this.lastFrameTime = this.currentTime;
			this.deltaTime = this.realTime / (1.0 / this.targetFPS);
		}
	}
}