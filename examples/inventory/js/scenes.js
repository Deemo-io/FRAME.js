class SceneManager {
	constructor() {
		this.scenes = new Map();
		this.currentScene = "";
		this.prevScene = "";
	}
	addScene(name, scene) {
		this.scenes.set(name, scene);
	}
	change(name) {
		if (this.scenes.get(this.currentScene) != undefined) {
			this.scenes.get(this.currentScene).onUnload();
		}
		this.prevScene = this.currentScene;
		this.currentScene = name;
		this.scenes.get(this.currentScene).onLoad();
	}
	update(realTime) {
		this.scenes.get(this.currentScene).update(realTime);
	}
	render() {
		this.scenes.get(this.currentScene).render();
	}
}

class Scene {
	constructor(manager) {
		this.manager = manager;
	}
	update(realTime) {}
	render() {}
	onLoad() {}
	onUnload() {}
}

class BarScene extends Scene {
	constructor(manager) {
		super(manager);
		
		player = new Player(200, 200);
		this.spaceText = new Text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "Press SPACE to access your inventory");
		this.spaceText.justify = "center";
		
		this.spaceEnabled = true;
	}
	update(realTime) {
		items.update(realTime);
		characters.update(realTime);
		
		for (var i = 0; i < items.objects.length; i++) {
			if (checkCollision(player, items.objects[i])) {
				if (items.objects[i].dropped == true) {
					player.pickUp(items.objects[i]);
				}
			}
		}
		
		if (keyboard[32] && this.spaceEnabled) {
			this.manager.change("inventory");
			this.spaceEnabled = false;
		}
		if (keyboard[32] == false) {
			this.spaceEnabled = true;
		}
	}
	render() {
		this.spaceText.draw();
		items.draw();
		characters.draw();
	}
	onLoad() {
		characters.clear();
		items.clear();
		characters.add(player);
		items.add(new Body(3, 600, 200));
		items.add(new Gloves(3, 500, 300));
		items.add(new Boots(3, 500, 200));
		items.add(new Helmet(3, 500, 500));
		items.add(new Helmet(4, 300, 500));
	}
}

class InvScene extends Scene {
	constructor(manager) {
		super(manager);
		
		this.playerx = 0;
		this.playery = 0;
		this.playerrot = 0;
		this.playerImage = player.image;
		this.spaceEnabled = false;
		this.playerFacingRight = true;
	}
	update(realTime) {
		player.inventory.update(realTime);
		
		if (keyboard[32] && this.spaceEnabled) {
			this.manager.change("bar");
		}
		if (keyboard[32] == false) {
			this.spaceEnabled = true;
		}
	}
	render() {
		player.draw();
		player.inventory.draw();
	}
	onLoad() {
		this.playerx = player.x;
		this.playery = player.y;
		this.playerrot = player.rotation;
		this.playerFacingRight = player.facingRight;
		player.facingRight = true;
		player.setScale(4);
		player.x = GAME_WIDTH / 2;
		player.y = 420;
		player.rotation = 0;
		player.image = player.rightIdleImage;
		this.spaceEnabled = false;
	}
	onUnload() {
		player.facingRight = this.playerFacingRight;
		player.setScale(1);
		player.x = this.playerx;
		player.y = this.playery;
		player.rotation = this.playerrot;
		player.image = this.playerImage;
	}
}