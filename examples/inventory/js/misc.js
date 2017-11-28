class InvSquare extends Actor {
	constructor(x, y, w, h, col, equip) {
		super(x, y);
		this.width = w;
		this.height = h;
		this.color = col;
		if (equip === undefined) this.equipSlot = false;
		else this.equipSlot = equip;
	}
	update(realTime) {
		
	}
	render() {
		this.ctx.fillStyle = this.color;
		this.ctx.fillRect(-this.width / 2, -this.height, this.width, this.height);
	}
}

class Item extends Actor {
	constructor(x, y, img) {
		super(x||0, y||0);
		this.type = "empty";
		this.dropped = true;
		this.image = img;
		this.width = this.image.width * PIXEL_SIZE;
		this.height = this.image.height * PIXEL_SIZE;
		this.equipped = false;
		
		if (this.width > INVENTORY_SQUARE_SIZE || this.height > INVENTORY_SQUARE_SIZE) {
			var ratio = INVENTORY_SQUARE_SIZE / this.width;
			if (this.height > this.width) {
				ratio = INVENTORY_SQUARE_SIZE / this.height;
			}
			this.width = this.image.width * PIXEL_SIZE * ratio;
			this.height = this.image.height * PIXEL_SIZE * ratio;
		}
	}
}

class Helmet extends Item {
	constructor(id, x, y) {
		super(x, y, FRAME.getImage("helmet" + id));
		this.id = id;
		this.type = "helmet";
	}
	render() {
		this.ctx.drawImage(this.image, -this.width / 2, -this.height, this.width, this.height);
	}
}

class Boots extends Item {
	constructor(id, x, y) {
		super(x, y, FRAME.getImage("boots" + id));
		this.id = id;
		this.type = "boots";
	}
	render() {
		this.ctx.drawImage(this.image, -this.width / 2, -this.height, this.width, this.height);
	}
}

class Gloves extends Item {
	constructor(id, x, y) {
		super(x, y, FRAME.getImage("gloves" + id));
		this.id = id;
		this.type = "gloves";
	}
	render() {
		this.ctx.drawImage(this.image, -this.width / 2, -this.height, this.width, this.height);
	}
}

class Body extends Item {
	constructor(id, x, y) {
		super(x, y, FRAME.getImage("body" + id));
		this.id = id;
		this.type = "body";
	}
	render() {
		this.ctx.drawImage(this.image, -this.width / 2, -this.height, this.width, this.height);
	}
}