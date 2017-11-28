class Inventory extends Actor {
	constructor(player) {
		super(0, 0);
		this.objects = [];
		this.invSquareCollection = new Collection();
		this.selectedObject = null;
		this.selectedObjectIndex = -1;
		this.owner = player;
		
		this.helmetSquare = new InvSquare(290, 150, INVENTORY_SQUARE_SIZE, INVENTORY_SQUARE_SIZE, INVENTORY_SQUARE_COLOR, true);
		this.bodySquare = new InvSquare(500, 350, INVENTORY_SQUARE_SIZE, INVENTORY_SQUARE_SIZE, INVENTORY_SQUARE_COLOR, true);
		this.glovesSquare = new InvSquare(300, 280, INVENTORY_SQUARE_SIZE, INVENTORY_SQUARE_SIZE, INVENTORY_SQUARE_COLOR, true);
		this.bootsSquare = new InvSquare(310, 430, INVENTORY_SQUARE_SIZE, INVENTORY_SQUARE_SIZE, INVENTORY_SQUARE_COLOR, true);
		this.invSquareCollection.add(this.helmetSquare);
		this.invSquareCollection.add(this.bodySquare);
		this.invSquareCollection.add(this.glovesSquare);
		this.invSquareCollection.add(this.bootsSquare);
		
		for (var i = 0; i < INVENTORY_SIZE; i++) {
			this.objects[i] = null;
		}
		var y = 5 + 500;
		var x = 25;
		for (var i = 0; i < this.objects.length; i++) {
			this.invSquareCollection.add(new InvSquare(x, y, INVENTORY_SQUARE_SIZE, INVENTORY_SQUARE_SIZE, INVENTORY_SQUARE_COLOR));
			x += 50;
			if (x > GAME_WIDTH) {
				y += INVENTORY_SQUARE_SIZE + 10;
				x = 25;
			}
		}
	}
	update(realTime) {
		this.invSquareCollection.update(realTime);
		for (var i = 0; i < this.invSquareCollection.objects.length; i++) {
			if (checkCollision(this.invSquareCollection.objects[i], mouse)) {
				this.invSquareCollection.objects[i].color = "#EEE";
			}
			else {
				this.invSquareCollection.objects[i].color = INVENTORY_SQUARE_COLOR;
			}
			
			if (mouse.clicking && this.selectedObject == null && this.invSquareCollection.objects[i].color != INVENTORY_SQUARE_COLOR) {
				this.selectedObject = this.objects[i];
				this.selectedObjectIndex = i;
				break;
			}
		}
		if (this.selectedObject != null) {
			this.objects[this.selectedObjectIndex].x = mouse.x;
			this.objects[this.selectedObjectIndex].y = mouse.y;
			if (mouse.clicking == false) {
				var resolved = false;
				
				for (var i = 0; i < this.invSquareCollection.objects.length; i++) {
					if (checkCollision(this.invSquareCollection.objects[i], mouse)) {
						var swap = true;
						
						if (this.invSquareCollection.objects[i].equipSlot == true) {
							if (this.objects[this.selectedObjectIndex].type == "helmet" && this.invSquareCollection.objects[i] != this.helmetSquare) swap = false;
							if (this.objects[this.selectedObjectIndex].type == "body" && this.invSquareCollection.objects[i] != this.bodySquare) swap = false;
							if (this.objects[this.selectedObjectIndex].type == "gloves" && this.invSquareCollection.objects[i] != this.glovesSquare) swap = false;
							if (this.objects[this.selectedObjectIndex].type == "boots" && this.invSquareCollection.objects[i] != this.bootsSquare) swap = false;
						}
						
						if (swap == true) {
							//change items equipped
							if (this.invSquareCollection.objects[i].equipSlot == true) {
								if (this.objects[i] != null) this.owner.unequip(this.objects[i]);
								this.owner.equip(this.objects[this.selectedObjectIndex]);
							}
							if (this.invSquareCollection.objects[this.selectedObjectIndex].equipSlot == true) {
								this.owner.unequip(this.objects[this.selectedObjectIndex]);
								if (this.objects[i] != null) this.owner.equip(this.objects[i]);
							}
							
							//swap positions
							var tempx = this.invSquareCollection.objects[this.selectedObjectIndex].x;
							var tempy = this.invSquareCollection.objects[this.selectedObjectIndex].y;
							if (this.objects[this.selectedObjectIndex] != null) {
								this.objects[this.selectedObjectIndex].x = this.invSquareCollection.objects[i].x;
								this.objects[this.selectedObjectIndex].y = this.invSquareCollection.objects[i].y;
							}
							if (this.objects[i] != null) {
								this.objects[i].x = tempx;
								this.objects[i].y = tempy;
							}
							
							//swap array values
							var temp = this.objects[i];
							this.objects[i] = this.objects[this.selectedObjectIndex];
							this.objects[this.selectedObjectIndex] = temp;
							resolved = true;
						}
					}
				}
				if (resolved == false) {
					this.objects[this.selectedObjectIndex].x = this.invSquareCollection.objects[this.selectedObjectIndex].x;
					this.objects[this.selectedObjectIndex].y = this.invSquareCollection.objects[this.selectedObjectIndex].y;
				}
				
				this.selectedObject = null;
				this.selectedObjectIndex = -1;
			}
		}
	}
	render() {
		this.invSquareCollection.draw();
		for (var i = 0; i < this.objects.length; i++) {
			if (this.objects[i] != null) {
				this.objects[i].draw();
			}
		}
	}
	getFreeSlotIndex() {
		for (var i = 0; i < this.invSquareCollection.objects.length; i++) {
			if (this.objects[i] == null && this.invSquareCollection.objects[i].equipSlot == false) return i;
		}
		return -1;
	}
	addItem(item) {
		var index = this.getFreeSlotIndex();
		if (index != -1) {
			this.objects[this.getFreeSlotIndex()] = item;
			item.x = this.invSquareCollection.objects[index].x;
			item.y = this.invSquareCollection.objects[index].y;
			return true;
		}
		return false;
	}
}

class Character extends Actor {
	constructor(x, y) {
		super(x||0, y||0);
		
		this.inventory = new Inventory(this);
		
		this.width = 0;
		this.height = 0;
		this.scale = 1;
		
		this.helmetItem = null;
		this.bootsItem = null;
		this.glovesItem = null;
		this.bodyItem = null;
		this.helmet = null;
		this.boots = null;
		this.gloves = null;
		this.body = null;
	}
	equip(item) {
		item.equipped = true;
		if (item.type == "helmet") {
			this.helmetItem = item;
			this.helmet = new Helmet(this.helmetItem.id);
		}
		else if (item.type == "body") {
			this.bodyItem = item;
			this.body = new Body(this.bodyItem.id);
		}
		else if (item.type == "gloves") {
			this.glovesItem = item;
			this.gloves = new Gloves(this.glovesItem.id);
		}
		else if (item.type == "boots") {
			this.bootsItem = item;
			this.boots = new Boots(this.bootsItem.id);
		}
	}
	unequip(item) {
		item.equipped = false;
		if (item.type == "helmet") {
			this.helmetItem = null;
			this.helmet = null;
		}
		else if (item.type == "body") {
			this.bodyItem = null;
			this.body = null;
		}
		else if (item.type == "gloves") {
			this.glovesItem = null;
			this.gloves = null;
		}
		else if (item.type == "boots") {
			this.bootsItem = item;
			this.boots = null;
		}
	}
	pickUp(item) {
		item.dropped = false; 
		if (this.inventory.addItem(item) == true) {
			items.remove(item);
		}
	}
	setScale(scale) {
		this.scale = scale;
		this.width = this.image.width * PIXEL_SIZE * this.scale;
		this.height = this.image.height * PIXEL_SIZE * this.scale;
	}
}

class Player extends Character {
	constructor(x, y) {
		super(x, y);
		
		this.leftStrip = new ImageStrip();
		this.leftStrip.add(FRAME.getImage("playerLeft1"));
		this.leftStrip.add(FRAME.getImage("playerLeft2"));
		
		this.rightStrip = new ImageStrip();
		this.rightStrip.add(FRAME.getImage("playerRight1"));
		this.rightStrip.add(FRAME.getImage("playerRight2"));
		
		this.leftIdleImage = this.leftStrip.images[0];
		this.rightIdleImage = this.rightStrip.images[0];
		
		this.facingRight = false;
		this.image = this.leftIdleImage;
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
	}
	update(realTime) {
		var prevx = this.x;
		var prevy = this.y;
		
		if (keyboard[87] || keyboard[38]) {//w
			this.y -= PLAYER_SPEED;
		}
		if (keyboard[83] || keyboard[40]) {//s
			this.y += PLAYER_SPEED;
		}
		if (keyboard[65] || keyboard[37]) {//a
			this.x -= PLAYER_SPEED;
			this.facingRight = false;
		}
		if (keyboard[68] || keyboard[39]) {//d
			this.x += PLAYER_SPEED;
			this.facingRight = true;
		}
		
		if (this.x != prevx || this.y != prevy) {
			if (this.facingRight) {
				this.image = this.rightStrip.step(0.1, realTime);
				if (this.x != prevx) {
					this.rotation += (0.1 - this.rotation) * 0.2;
				}
			}
			else {
				this.image = this.leftStrip.step(0.1, realTime);
				if (this.x != prevx) {
					this.rotation += (-0.1 - this.rotation) * 0.2;
				}
			}
		}
		else {
			if (this.facingRight) {
				this.image = this.rightIdleImage;
			}
			else {
				this.image = this.leftIdleImage;
			}
		}
		this.rotation += (0 - this.rotation) * 0.1;
	}
	render() {
		this.ctx.drawImage(this.image, -this.width / 2, -this.height, this.width, this.height);
		if (this.helmetItem != null) {
			this.helmet.x = 0;
			this.helmet.width = this.helmet.image.width * PIXEL_SIZE * this.scale;
			this.helmet.height = this.helmet.image.height * PIXEL_SIZE * this.scale;
			if (this.image == this.leftIdleImage || this.image == this.rightIdleImage) {
				this.helmet.y = -8 * PIXEL_SIZE * this.scale;
			}
			else {
				this.helmet.y = -7 * PIXEL_SIZE * this.scale;
			}
			if (this.facingRight == false) this.ctx.scale(-1, 1);
			this.helmet.draw();
			if (this.facingRight == false) this.ctx.scale(-1, 1);
		}
		if (this.bodyItem != null) {
			this.body.x = 0;
			this.body.width = this.body.image.width * PIXEL_SIZE * this.scale;
			this.body.height = this.body.image.height * PIXEL_SIZE * this.scale;
			if (this.image == this.leftIdleImage || this.image == this.rightIdleImage) {
				this.body.y = -1 * PIXEL_SIZE * this.scale;
			}
			else {
				this.body.y = 0;
			}
			if (this.facingRight == false) this.ctx.scale(-1, 1);
			this.body.draw();
			if (this.facingRight == false) this.ctx.scale(-1, 1);
		}
		if (this.glovesItem != null) {
			this.gloves.x = 0;
			this.gloves.width = this.gloves.image.width * PIXEL_SIZE * this.scale;
			this.gloves.height = this.gloves.image.height * PIXEL_SIZE * this.scale;
			if (this.image == this.leftIdleImage || this.image == this.rightIdleImage) {
				this.gloves.y = -6 * PIXEL_SIZE * this.scale;
			}
			else {
				this.gloves.y = -5 * PIXEL_SIZE * this.scale;
			}
			if (this.facingRight == false) this.ctx.scale(-1, 1);
			this.gloves.draw();
			if (this.facingRight == false) this.ctx.scale(-1, 1);
		}
		if (this.bootsItem != null) {
			this.boots.x = 0;
			this.boots.width = this.boots.image.width * PIXEL_SIZE * this.scale;
			this.boots.height = this.boots.image.height * PIXEL_SIZE * this.scale;
			if (this.image == this.leftIdleImage || this.image == this.rightIdleImage) {
				this.boots.y = 0;
				if (this.facingRight == false) this.ctx.scale(-1, 1);
				this.boots.draw();
				if (this.facingRight == false) this.ctx.scale(-1, 1);
			}
		}
	}
}