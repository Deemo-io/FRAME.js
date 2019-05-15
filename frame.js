var FRAME = {ctx:null, canvas:null, game_width:0, game_height:0, scaleX:1, scaleY:1, x:0, y:0, smoothing:false, images: new Map(), sounds: new Map(), extraX:0, extraY:0, shakeAmount:0, shakeDuration:0, requestedResources:0, gottenResources:0, defaultFont: "Arial"};
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

	FRAME.ctx.imageSmoothingEnabled = FRAME.smoothing;
}
FRAME.init = function(w, h) {
	FRAME.game_width = w;
	FRAME.game_height = h;

	//making canvas and changing margins
	var canvas = document.createElement('canvas');
	canvas.style.position = "absolute";
	document.body.style.margin = "0";
	document.body.style.padding = "0";
	document.body.appendChild(canvas);

	//configure canvas for drawing
	FRAME.canvas = canvas;
	FRAME.ctx = canvas.getContext("2d");
	window.addEventListener('resize', FRAME.resize, false);
	FRAME.resize();

	//modifying functions to make them more performant
	FRAME.ctx.oldDrawImage = FRAME.ctx.drawImage;
	FRAME.ctx.drawImage = function(img,x,y,w,h) {
		FRAME.ctx.oldDrawImage(img,Math.floor(x),Math.floor(y),Math.floor(w),Math.floor(h));
	}
}
FRAME.shake = function(amt, dur) {
	FRAME.shakeAmount = amt;
	FRAME.shakeDuration = dur;
}
FRAME.clearScreen = function() {
	FRAME.ctx.setTransform(FRAME.scaleX, 0, 0, FRAME.scaleY, FRAME.x + FRAME.canvas.width/2 + FRAME.extraX, FRAME.y + FRAME.canvas.height/2 + FRAME.extraY);
	FRAME.ctx.clearRect(-FRAME.x/FRAME.scaleX - FRAME.canvas.width/2/FRAME.scaleX, -FRAME.y/FRAME.scaleY - FRAME.canvas.height/2/FRAME.scaleY, FRAME.canvas.width / FRAME.scaleX, FRAME.canvas.height / FRAME.scaleY);

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
	var p = new Promise(function(resolve, reject) {
		img.src = path;
		img.onload = resolve(path);
		img.onerror = reject(path);
		FRAME.requestedResources++;
	});
	p.then(function(path){
		FRAME.images.set(name, img);
		FRAME.gottenResources++;
	}, function(path) {
		console.log(path+" couldn't be loaded.");
	});
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
	FRAME.requestedResources++;

	audio.once('load', function(){
		FRAME.sounds.set(name, audio);
		FRAME.gottenResources++;
	});
}
FRAME.playSound = function(name) {
	var id = -1;
	id = FRAME.sounds.get(name).play();
	return id;
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
		this.rotation = rot || 0.0;
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

class ImageActor extends Actor {
	constructor(x, y, img, size=1) {
		super(x, y);

		this.image = img;
		this.width = this.image.width * size;
		this.height = this.image.height * size;
	}
	render() {
		this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
	}
}

class ImageStrip {
	constructor() {
		this.images = [];
		this.iter = 0;
		this.update = 0.0;
	}
	add(img) {
		this.images.push(img);
	}
	step(onceEvery, realTime) {
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

class Collection {
	constructor(ctx) {
		this.objects = [];
		this.x = 0;
		this.y = 0;
		this.rotation = 0;
		this.ctx = ctx || FRAME.ctx;
		this.scaleX = 1;
		this.scaleY = 1;
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
			if (this.objects[i].dead !== undefined && this.objects[i].dead === true) {
				this.remove(this.objects[i]);
				i--;
			}
		}
	}
	draw() {
		FRAME.ctx.scale(this.scaleX,this.scaleY);
		for (var i = 0; i < this.objects.length; i++) {
			this.ctx.translate(this.x, this.y);
			this.ctx.rotate(this.rotation);
				this.objects[i].draw();
			this.ctx.rotate(-this.rotation);
			this.ctx.translate(-this.x, -this.y);
		}
		FRAME.ctx.scale(1/this.scaleX,1/this.scaleY);
	}
}

class Text {
	constructor(x, y, text, font, fillStyle, fontSize, justify, rot, ctx) {
		this.x = x || 0;
		this.y = y || 0;
		this.text = text || "";
		this.font = font || FRAME.defaultFont;
		this.fillStyle = fillStyle || "#333";
		this.fontSize = fontSize || 30;
		this.justify = justify || "left";
		this.rotation = rot || 0;
		this.ctx = ctx || FRAME.ctx;

		this.ctx.font = this.fontSize + "px " + this.font;
		this.width = this.ctx.measureText(this.text).width;
	}
	update(deltaTime) {}
	render() {}
	draw() {
		this.ctx.translate(this.x, this.y);
		this.ctx.rotate(this.rotation);
			this.ctx.font = this.fontSize + "px " + this.font;
			this.ctx.fillStyle = this.fillStyle;
			this.width = this.ctx.measureText(this.text).width;
			this.render();//whatever extra stuff
			if (this.justify == "left") {
				this.ctx.fillText(this.text, 0, this.fontSize);
			}
			else if (this.justify == "right") {
				this.ctx.fillText(this.text, -this.width, this.fontSize);
			}
			else {
				this.ctx.fillText(this.text, -this.width / 2, this.fontSize);
			}
		this.ctx.rotate(-this.rotation);
		this.ctx.translate(-this.x, -this.y);
	}
	setFontSize(fontSize) {
		this.fontSize = fontSize;
		this.ctx.font = this.fontSize + "px " + this.font;
		this.width = this.ctx.measureText(this.text).width;
	}
	setText(txt) {
		this.text = txt;
		this.ctx.font = this.fontSize + "px " + this.font;
		this.width = this.ctx.measureText(this.text).width;
	}
}

Keyboard = function() {
	keys = [];
	
	function down(e) {
		if (e.keyCode <= 40 && e.keyCode >= 37 || e.keyCode == 32)
			e.preventDefault();
		
		keys[e.keyCode] = true;
	}
	function up(e) {
		if (e.keyCode <= 40 && e.keyCode >= 37 || e.keyCode == 32)
			e.preventDefault();
		
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
	mouse.cy = 0;
	mouse.y = 0;
	mouse.xy = 0;
	mouse.xVel = 0;
	mouse.yVel = 0;
	mouse.clicking = false;
	mouse.prevClicking = false;
	mouse.checkClick = true;
	mouse.deltaY = 0;
	mouse.prevDeltaY = 0;

	mouse.update = function() {
		var prevx = mouse.x;
		var prevy = mouse.y;
		mouse.x = (-FRAME.x + mouse.cx - window.innerWidth/2) / FRAME.scaleX;
		mouse.y = (-FRAME.y + mouse.cy - window.innerHeight/2) / FRAME.scaleY;

		mouse.xVel = mouse.x - prevx;
		mouse.yVel = mouse.y - prevy;

		if (mouse.prevDeltaY != 0) mouse.deltaY = 0;
		mouse.prevDeltaY = mouse.deltaY;

		if (mouse.checkClick)
			mouse.prevClicking = mouse.clicking;
		else
			mouse.checkClick = true;
	}
	function move(e) {
		mouse.cx = e.clientX;
		mouse.cy = e.clientY;
	}
	function down() {
		mouse.clicking = true;
		mouse.prevClicking = false;
		mouse.checkClick = false;
	}
	function up() {
		mouse.clicking = false;
		mouse.prevClicking = true;
		mouse.checkClick = false;
	}
	function wheel(e) {
		mouse.deltaY = e.deltaY;
	}
	FRAME.canvas.addEventListener('mousemove', move);
	FRAME.canvas.addEventListener('mousedown', down);
	FRAME.canvas.addEventListener('mouseup', up);
	FRAME.canvas.addEventListener('wheel', wheel);

	return mouse;
}

class Timestep {
	constructor(target) {
		this.deltaTime = 0;
		this.realTime = 0;
		this.currentTime = 0;
		this.lastFrameTime = Date.now();
		this.targetFPS = target || 60;
	}
	tick() {
		this.currentTime = Date.now();
		this.realTime = (this.currentTime - this.lastFrameTime) / 1000;
		this.lastFrameTime = this.currentTime;
		this.deltaTime = this.realTime / (1.0 / this.targetFPS);
	}
}
