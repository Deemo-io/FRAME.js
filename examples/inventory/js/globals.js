var GAME_WIDTH = 800;
var GAME_HEIGHT = 600;
FRAME.init(GAME_WIDTH, GAME_HEIGHT, document.getElementById("canvas"));

var keyboard = new Keyboard();
var mouse = new Mouse();
var timestep = new Timestep();

var PIXEL_SIZE = 6;

var PLAYER_SPEED = 6;

var INVENTORY_SIZE = 32;
var INVENTORY_SQUARE_SIZE = 40;
var INVENTORY_SQUARE_COLOR = "#555";

function checkCollision(obj1, obj2) {
	if (obj1.width === undefined) {
		obj1.width = 1;
		obj1.height = 1;
	}
	if (obj2.width === undefined) {
		obj2.width = 1;
		obj2.height = 1;
	}
	
	return (obj1.x - obj1.width/2 < obj2.x + obj2.width/2 &&
			obj1.x + obj1.width/2 > obj2.x - obj2.width/2 &&
			obj1.y - obj1.height < obj2.y &&
			obj1.y > obj2.y - obj2.height);
}

////////////////////////
/////////IMAGES/////////
////////////////////////

FRAME.loadImage("assets/img/player/left_1.png", "playerLeft1");
FRAME.loadImage("assets/img/player/left_2.png", "playerLeft2");
FRAME.loadImage("assets/img/player/right_1.png", "playerRight1");
FRAME.loadImage("assets/img/player/right_2.png", "playerRight2");

FRAME.loadImage("assets/img/gear/helmet/1.png", "helmet1");
FRAME.loadImage("assets/img/gear/helmet/2.png", "helmet2");
FRAME.loadImage("assets/img/gear/helmet/3.png", "helmet3");
FRAME.loadImage("assets/img/gear/helmet/4.png", "helmet4");

FRAME.loadImage("assets/img/gear/body/3.png", "body3");

FRAME.loadImage("assets/img/gear/gloves/3.png", "gloves3");

FRAME.loadImage("assets/img/gear/boots/3.png", "boots3");