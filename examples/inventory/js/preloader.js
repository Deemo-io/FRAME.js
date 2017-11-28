Preloader = function() {
	var loadingCanvas = document.createElement('canvas');
	loadingCanvas.id = "loadingCanvas";
	loadingCanvas.style.position = "absolute";
	loadingCanvas.style.top = 0;
	loadingCanvas.style.left = 0;
	loadingCanvas.style.opacity = 1.0;
	document.body.appendChild(loadingCanvas);
	var ctx = loadingCanvas.getContext("2d");
	var imageList = new Map();
	var data = {};
	
	requestFrame = ( window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function( callback ) {
		window.setTimeout(callback, 1000 / 60);
	});
	function loadImage(path, name) {
		var img = new Image();
		img.src = path;
		imageList.set(name, img);
	}
	function getImage(name) {
		return imageList.get(name);
	}
	
	loadImage('assets/img/deemo.png', 'deemo');
	
	class Actor {
		constructor(ctx, w, h) {
			this.width = w || 1;
			this.height = h || 1;
			this.ctx = ctx;
			this.x = 0;
			this.y = 0;
			this.rotation = 0;
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
	
	function intersect(actor, x, y) {
		return (x < actor.x + actor.width / 2 && x > actor.x - actor.width / 2 && y < actor.y + actor.height / 2 && y > actor.y - actor.height / 2)
	}
	
	function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
		if (typeof stroke == 'undefined') {
			stroke = true;
		}
		if (typeof radius === 'undefined') {
			radius = 5;
		}
		if (typeof radius === 'number') {
			radius = {tl: radius, tr: radius, br: radius, bl: radius};
		}
		else {
			var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
			for (var side in defaultRadius) {
				radius[side] = radius[side] || defaultRadius[side];
			}
		}
		ctx.beginPath();
		ctx.moveTo(x + radius.tl, y);
		ctx.lineTo(x + width - radius.tr, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
		ctx.lineTo(x + width, y + height - radius.br);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
		ctx.lineTo(x + radius.bl, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
		ctx.lineTo(x, y + radius.tl);
		ctx.quadraticCurveTo(x, y, x + radius.tl, y);
		ctx.closePath();
		if (fill) {
			ctx.fill();
		}
		if (stroke) {
			ctx.stroke();
		}
	}
	
	data.PERCENT = 0;
	var BACKGROUND = "#FFF";
	data.DONELOADING = false;
	
	var BAR_WIDTH = 250;
	var BAR_HEIGHT = 35;
	var BUTTON_WIDTH = 60;
	var BUTTON_HEIGHT = 60;
	data.STARTING = false;
	var mousex = 0;
	var mousey = 0;
	
	var deemoImg = new Actor(ctx);
	deemoImg.image = getImage('deemo');
	deemoImg.y = -30;
	deemoImg.render = function() {
		ctx.drawImage(deemoImg.image, -deemoImg.image.width / 2, -deemoImg.image.height / 2);
	}
	deemoImg.update = function() {
		deemoImg.width = deemoImg.image.width;
		deemoImg.height = deemoImg.image.height;
		if (data.STARTING == false) {
			deemoImg.y += ((document.body.clientHeight * 0.25) - deemoImg.y) * 0.05;
		}
		else {
			deemoImg.y += (-30 - deemoImg.y) * 0.05;;
		}
	}
	var background = new Actor(ctx);
	background.smallAlpha = 0.4;
	background.actualAlpha = 1.0;
	background.render = function() {
		ctx.globalAlpha = background.actualAlpha;
		ctx.fillStyle = "#FCF1D6";
		ctx.fillRect(0, 0, document.body.clientWidth+50, document.body.clientHeight+200);
		ctx.globalAlpha = background.smallAlpha;
		ctx.lineStyle = "#000";
		ctx.beginPath();
		var i = 0;
		var j = 0;
		while (j <= document.body.clientWidth / 50 + 1) {
			ctx.moveTo(50 * j, 0);
			i = 0;
			while (i <= document.body.clientHeight / 100 + 2) {
				ctx.lineTo(50 * j, -50 + 100 * i);
				ctx.lineTo(-50 + 50 * j, 100 * i);
				i++;
			}
			j++;
		}
		ctx.stroke();
		
		if (data.STARTING) {
			if (loadingCanvas !== null) loadingCanvas.style.opacity += (0 - loadingCanvas.style.opacity) * 0.05;
			background.actualAlpha += (0 - background.actualAlpha) * 0.05;
			background.smallAlpha += (0 - background.smallAlpha) * 0.05;
		}
		
		ctx.globalAlpha = 1.0;
	}
	var bar = new Actor(ctx);
	bar.atCenter = false;
	bar.x = -BAR_WIDTH / 2 - 5;
	bar.render = function() {
		ctx.globalAlpha = 0.2;
		ctx.fillStyle = "#000";
		roundRect(ctx, -BAR_WIDTH / 2 + 5, -BAR_HEIGHT / 2 + 5, BAR_WIDTH, BAR_HEIGHT, 10, true, false);
		ctx.globalAlpha = 1;
		ctx.fillStyle = "#333";
		roundRect(ctx, -BAR_WIDTH / 2, -BAR_HEIGHT / 2, BAR_WIDTH, BAR_HEIGHT, 10, true, false);
		ctx.fillStyle = "#00DDE5";
		roundRect(ctx, -BAR_WIDTH / 2-1, -BAR_HEIGHT / 2 - 0.5, (BAR_WIDTH+1.5) * data.PERCENT, BAR_HEIGHT+1, 10, true, false);
	}
	bar.update = function() {
		if (data.STARTING == false) {
			bar.x += ((document.body.clientWidth / 2) - bar.x) * 0.05;
			if (Math.abs(document.body.clientWidth / 2 - bar.x) < 1.0) {
				bar.atCenter = true;
			}
		}
		else {
			bar.x += ((-BAR_WIDTH / 2 - 5) - bar.x) * 0.05;
		}
	}
	var playButton = new Actor(ctx, 0, 0);
	playButton.inPosition = false;
	playButton.y = document.body.clientHeight + BUTTON_HEIGHT;
	playButton.render = function() {
		if (data.PERCENT >= 1.0) {
			ctx.fillStyle = "#000";
			ctx.globalAlpha = 0.2;
			roundRect(ctx, -playButton.width / 2 + 5, -playButton.height / 2 + 5, playButton.width, playButton.height, 10, true, false);
			ctx.globalAlpha = 1;
			ctx.fillStyle = "#333";
			roundRect(ctx, -playButton.width / 2, -playButton.height / 2, playButton.width, playButton.height,10, true, false);
			ctx.beginPath();
			ctx.fillStyle = "#FFF";
			ctx.moveTo( -playButton.width / 2 + 13, -playButton.height / 2 + 10);
			ctx.lineTo( -playButton.width / 2 + 13, playButton.height / 2 - 10);
			ctx.lineTo(playButton.width / 2 - 10, 0);
			ctx.closePath();
			ctx.fill();
		}
	}
	playButton.update = function() {
		if (data.PERCENT >= 1.0) {
			if (intersect(playButton, mousex, mousey)) {
				playButton.width += (BUTTON_WIDTH + 20 - playButton.width) * 0.1;
				playButton.height += (BUTTON_HEIGHT + 20 - playButton.height) * 0.1;
			}
			else {
				playButton.width += (BUTTON_WIDTH - playButton.width) * 0.1;
				playButton.height += (BUTTON_HEIGHT - playButton.height) * 0.1;
			}
			if (data.STARTING) {
				playButton.y += (document.body.clientHeight + (BUTTON_HEIGHT+20) / 2 - playButton.y) * 0.05;
			}
		}
		else {
			playButton.width = 20;
			playButton.height = 20;
		}
	}
	
	function main() {
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, document.body.clientWidth, document.body.clientHeight);
		
		background.draw();
		deemoImg.draw();
		bar.draw();
		playButton.draw();
		
		background.y -= 0.5;
		if (background.y <= -100) {
			background.y += 100;
		}
		if (data.PERCENT > 1.0) {
			data.PERCENT = 1.0;
		}
		else if (data.PERCENT * BAR_WIDTH < 10) {
			data.PERCENT = 20 / BAR_WIDTH;
		}
		deemoImg.update();
		bar.update();
		playButton.update();
		if (data.STARTING && background.actualAlpha <= 0.01 && loadingCanvas !== null) {
			window.removeEventListener('resize', resize, false);
			window.removeEventListener('mousemove', mouseMove, false);
			window.removeEventListener('click', mouseClick, false);
			loadingCanvas.width = 0;
			loadingCanvas.height = 0;
			loadingCanvas = null;
			data.DONELOADING = true;
		}
		
		requestFrame(main);
	}
	
	function resize() {
		loadingCanvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		loadingCanvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
		
		if (data.STARTING == false) {
			deemoImg.x = document.body.clientWidth / 2;
			
			if (bar.atCenter) {
				bar.x = document.body.clientWidth / 2;
			}
			bar.y = document.body.clientHeight / 2;
			
			playButton.x = document.body.clientWidth / 2;
			playButton.y = document.body.clientHeight * 0.65;
		}
	}
	
	function mouseMove(e) {
		mousex = e.clientX;
		mousey = e.clientY;
	}
	
	function mouseClick(e) {
		if (intersect(playButton, mousex, mousey) && data.PERCENT >= 1.0) {
			data.STARTING = true;
		}
		else if (intersect(deemoImg, mousex, mousey)) {
			window.open("https://deemo.io");
		}
	}
	
	window.addEventListener('resize', resize, false);
	window.addEventListener('mousemove', mouseMove, false);
	window.addEventListener('click', mouseClick, false);
	resize();
	main();
	return {
		data,
		BACKGROUND,
		BAR_WIDTH,
		BAR_HEIGHT,
		BUTTON_WIDTH,
		BUTTON_HEIGHT}
}();