//scenes
var manager = new SceneManager();

var player;
var characters = new Collection();
var items = new Collection();

function main() {
	FRAME.clearScreen();
	timestep.tick();
	mouse.update();
	
	characters.objects.sort(function(a, b) {
		if (a.y > b.y) return 1;
		else return -1;
	});
	
	manager.update(timestep.realTime);
	manager.render();
	
	//black bars
	FRAME.ctx.fillStyle = "#222";
	FRAME.ctx.fillRect(0, -FRAME.y / FRAME.scaleY, GAME_WIDTH + 1, (window.innerHeight - GAME_HEIGHT * FRAME.scaleY) / 2 / FRAME.scaleY + 1);
	FRAME.ctx.fillRect(0, GAME_HEIGHT, GAME_WIDTH + 1, (window.innerHeight - GAME_HEIGHT * FRAME.scaleY) / 2 / FRAME.scaleY + 1);
	
	FRAME.ctx.fillRect(-FRAME.x / FRAME.scaleX, -FRAME.y / FRAME.scaleY, (window.innerWidth - GAME_WIDTH * FRAME.scaleX) / 2 / FRAME.scaleX + 1, window.innerHeight / FRAME.scaleY + 1);
	FRAME.ctx.fillRect(GAME_WIDTH, -FRAME.y / FRAME.scaleY, (window.innerWidth - GAME_WIDTH * FRAME.scaleX) / 2 / FRAME.scaleX + 1, window.innerHeight / FRAME.scaleY + 1);
	
	requestFrame(main);
}

window.onload = function() {
	manager.addScene("bar", new BarScene(manager));
	manager.addScene("inventory", new InvScene(manager));
	manager.change("bar");
	
	FRAME.width = GAME_WIDTH;
	FRAME.height = GAME_HEIGHT;
	
	main();
}