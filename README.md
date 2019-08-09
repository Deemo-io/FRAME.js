[![GitHub version](https://badge.fury.io/gh/zackseliger%2FFRAME.js.svg)](https://badge.fury.io/gh/zackseliger%2FFRAME.js) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
# FRAME.js
An extremely lightweight, minimalistic framework for HTML5 canvas.

### Table of Contents:
- [Canvas creation](#usage)
- [Resize handling](#resizing-and-camera)
- [the FRAME object](#FRAME)
- [Actors and grouping Actors](#actors-and-grouping-actors)
- [Asset management (images and audio)](#asset-management-and-animations)
- [Keyboard/Mouse management](#keyboard-and-mouse-input)
- [Text](#text)

FRAME.js does not interfere with the main game loop, allowing you to write your own.

## Usage
Creating a canvas that updates every frame looks something like this:

```javascript
window.onload = function() {
	FRAME.init(800,600);
  main();
}

function main() {
	FRAME.clearScreen();

  //update and render here

  //queues main() to be called again at render time.
  //Uses requestAnimationFrame by default and has fallbacks
  requestFrame(main);
}
```

FRAME.js has to be initialized before any other calls to it. `FRAME.init()` creates a canvas on the DOM with a specified virtual width and height. This will ensure those coordinates are always visible inside the canvas after resizing.

It should be noted that (0,0) is in the center. So in this example, -400 is the left side and 400 is the right side.
## Resizing and Camera
The center value is determined by `FRAME.x` and `FRAME.y`. This can be manipulated to move the camera.

(0,0) is the default center of the screen. The default resizing function ensures that the initial width and height are always visible, and scales the x and y axes proportionally so that the screen is as big as possible. The scale can be found with `FRAME.scaleX` and `FRAME.scaleY`, although they should be the same value
## FRAME
cannot be initialized
#### resize()
The default resize function. Ensures that initial width and height are always visible, and scales x and y axes proportionally.
#### init(w, h)
Initializes FRAME.js by creating a canvas on the DOM. `.game_width` and `.game_height` are set to `w` and `h`
#### shake(amt, duration)
Screen shake
#### clearScreen()
Call this every frame before rendering.
#### loadImage(path, name)
Loads image at `path` and saves it using `name`
#### getImage(name)
Returns image with given name
#### loadSound(path, name, ?loop, ?vol)
Loads sound at `path` and saves it using `name`. `loop` is a boolean and `vol` ranges from 0.0 to 1.0. Defaults are false and 1.0, respectively.
#### playSound(name)
Plays the sound with given name
#### stopSound(name)
Stops the sound with given name
#### .game_width and .game_height
set by calling `init()`
#### .scaleX and .scaleY
The scale of `.game_width` to actual width and `.game_height` to actual height. They are equal with the default resize function.
#### .x and .y
The position of the camera. Modify this when moving
#### .requestedResources and .gottenResources
`.requestedResources` is the amount of requested resources (via `loadImage()` and `loadSound()`) and `.gottenResources` is the amount of resources actually loaded.
## Actors and Grouping Actors
Each actor has `render()`, `draw()`, and `update()` functions. `render()` and `update()` are empty by default. `draw()` moves the context to `(x,y)` and rotates it to `rotation` and calls `render()`. Therefore, we should only modify `render()` and only call `draw()`.

### Actor
This is the basic unit in FRAME.js
#### Actor(?x, ?y, ?rot, ?ctx)
(x,y) defaults to (0,0) and rot defaults to 0. `ctx` refers to the canvas context and default to `FRAME.ctx`
#### render()
Empty by default. Override this method in your class extending Actor
#### draw()
Moves context to `(this.x, this.y)` and calls `render()`. Call this when drawing, do not override
#### update(?deltaTime)
Empty by default. Pass in deltaTime if you would like to use it. Override this method in your class extending Actor
#### .x and .y
x and y position
#### .rotation
In radians
#### .ctx
Canvas context, defaults to `FRAME.ctx`


Here is a basic example with actors:
```javascript
class Square extends Actor {
  update() {
    //move square to the right
    this.x += 3;
  }
  render() {
    //this draws a square with center at (this.x, this.y)
    this.ctx.fillStyle = "#222";
    this.ctx.fillRect(-25, -25, 50, 50);
  }
}

//initializes at the global scope. Important that we don't call the constructor
//here as FRAME.init isn't called yet
let testSquare = null;

window.onload = function() {
  FRAME.init(800, 600);

  testSquare = new Square(-400,0);

  main();
}

function main() {
  FRAME.clearScreen();

  testSquare.update();
  testSquare.draw();

  requestFrame(main);
}
```

We can use Collections to group actors. They have `update()` and `draw()` functions.

### Collections
#### Collection()
No-args constructor
#### add(obj)
Adds the specified Actor to the collection. `obj` is expected to have `update()` and `draw()` methods
#### remove(obj)
Removes the specified Actor from the collection. Must specify object, not index
#### clear()
Removes all objects from the collection.
#### update(?dt)
Update all objects in Collection. `dt` is optional but passed to objects if provided. Objects are removed if `obj.dead === true` after updating here.
#### draw()
Calls `draw()` on all objects in Collection.

## Asset Management and Animations
FRAME.js has built-in support for images, and relies on [Howler.js](https://github.com/goldfire/howler.js) for audio.

Images are loaded using `FRAME.loadImage(path, name)`, where 'path' is the path to that image and 'name' is the name that you will use to fetch the image. To get the image, the syntax is `FRAME.getImage(name)` where 'name' is the given name that you called in loadImage(). It returns an image, which can be used in `ctx.drawImage()`.

Similar methods are provided for audio, being `FRAME.loadSound(path, name)`, `FRAME.playSound(name)` and `FRAME.stopSound(name)`.

On calling `loadImage()` or `loadSound()`, `FRAME.requestedResources` will be incremented. On loading the asset, `FRAME.gottenResources` will be incremented, making it easy to keep track of how many assets have been loaded for a splash screen or loading screen.

FRAME.js also has basic support for animations using images in the form of the `ImageStrip` class. Below is a simple example of using ImageStrips in an actor class.
```javascript
class Player extends Actor {
  constructor(x,y) {
    super(x,y);

    //declare image strip and add the images 'walk1' and 'walk2'
    this.walkStrip = new ImageStrip();
    this.walkStrip.add(FRAME.getImage('walk1'));
    this.walkStrip.add(FRAME.getImage('walk2'));

    //declare width and height, assuming they are the same for both images
    this.image = this.walkStrip.images[0];//the first image, 'walk1'
    this.width = this.image.width;
    this.height = this.image.height;
  }
  update() {
    //sets our image to the current image on walkStrip. '12' refers to the
    //amount of time that must elapse to switch images. '1' refers to
    //the amount of time that has elapsed
    this.image = this.walkStrip.step(12,1);
  }
  render() {
    //we basically draw our image, centered at (this.x, this.y)
    this.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
  }
}
```

## Keyboard and Mouse input
These are currently the only types of input supported by FRAME.js.
### Keyboard
#### Keyboard()
`let key = new Keyboard()`. Find whether a key is pressed using `key[<index>]` where `index` is the key code testing for. Key codes can be found [here](https://keycode.info/).
### Mouse
#### Mouse()
No-args constructor
#### update()
Calculates velocities and 'real-world' coordinates for x and y (taking scale into account) and `prevClicking`.
#### .x and .y
x and y coordinates, taking scale into account
#### .xVel and .yVel
The amount that x and y coordinates have changed since last frame.
#### .clicking and .prevClicking
Whether any mouse button is clicking. `prevClicking` is the clicking state one frame ago.
#### .deltaY and .prevDeltaY
Amount that user is scrolling and amount that user was scrolling last frame

## Text
#### Text(?x, ?y, ?font, ?fillStyle, ?fontSize, ?justify, ?rot, ?ctx)
All are optional and have initial values, and can be changed afterwords
#### draw()
Draw the text
#### setFontSize(fontSize)
Changes the font size
#### setText(txt)
Changes the text
#### .justify
The justification of the text. "left", "center", and "right" are accepted values
#### .fillStyle
The color of the text. Think of ctx.fillStyle
#### .width
The width of the text.
