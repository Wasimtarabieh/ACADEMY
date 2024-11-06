(function() {
  'use strict';

  // Polyfill for requestAnimationFrame and cancelAnimationFrame
  (function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
      window.cancelAnimationFrame =
        window[vendors[x] + 'CancelAnimationFrame'] ||
        window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() {
          callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }

    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
    }
  })();

  // Core utilities and setup
  var g = {};
  g.m = Math;
  g.mathProps = 'E LN10 LN2 LOG2E LOG10E PI SQRT1_2 SQRT2 abs acos asin atan ceil cos exp floor log round sin sqrt tan atan2 pow max min'.split(' ');
  for (var i = 0; i < g.mathProps.length; i++) {
    g[g.mathProps[i]] = g.m[g.mathProps[i]];
  }
  g.m.TWO_PI = g.m.PI * 2;

  g.isset = function(prop) {
    return typeof prop !== 'undefined';
  };

  g.log = function() {
    if (g.isset(g.config) && g.config.debug && window.console) {
      console.log.apply(console, arguments);
    }
  };

  // Group Class for managing collections
  g.Group = function() {
    this.collection = [];
    this.length = 0;
  };

  g.Group.prototype.add = function(item) {
    this.collection.push(item);
    this.length++;
  };

  g.Group.prototype.remove = function(index) {
    if (index < this.length) {
      this.collection.splice(index, 1);
      this.length--;
    }
  };

  g.Group.prototype.empty = function() {
    this.collection.length = 0;
    this.length = 0;
  };

  g.Group.prototype.each = function(action, asc) {
    var asc = asc || 0, i;
    if (asc) {
      for (i = 0; i < this.length; i++) {
        this.collection[i][action](i);
      }
    } else {
      i = this.length;
      while (i--) {
        this.collection[i][action](i);
      }
    }
  };

  // Utilities
  g.util = {};

  g.util.rand = function(min, max) {
    return g.m.random() * (max - min) + min;
  };

  g.util.randInt = function(min, max) {
    return g.m.floor(g.m.random() * (max - min + 1)) + min;
  };

  // State management
  g.states = {};

  g.addState = function(state) {
    g.states[state.name] = state;
  };

  g.setState = function(name) {
    if (g.state) {
      g.states[g.state].exit();
    }
    g.state = name;
    g.states[g.state].init();
  };

  g.currentState = function() {
    return g.states[g.state];
  };

  // Time management
  g.Time = function() {
    this.reset();
  };

  g.Time.prototype.reset = function() {
    this.now = Date.now();
    this.last = Date.now();
    this.delta = 60;
    this.ndelta = 1;
    this.elapsed = 0;
    this.nelapsed = 0;
    this.tick = 0;
  };

  g.Time.prototype.update = function() {
    this.now = Date.now();
    this.delta = this.now - this.last;
    this.ndelta = Math.min(Math.max(this.delta / (1000 / 60), 0.0001), 10);
    this.elapsed += this.delta;
    this.nelapsed += this.ndelta;
    this.last = this.now;
    this.tick++;
  };

  // Grid Entity
  g.Grid = function(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.tiles = [];
    for (var x = 0; x < cols; x++) {
      this.tiles[x] = [];
      for (var y = 0; y < rows; y++) {
        this.tiles[x].push('empty');
      }
    }
  };

  g.Grid.prototype.get = function(x, y) {
    if (this.tiles[x]) {
      return this.tiles[x][y];
    }
    return undefined;
  };

  g.Grid.prototype.set = function(x, y, val) {
    if (this.tiles[x]) {
      this.tiles[x][y] = val;
    }
  };

  // Board Tile Entity
  g.BoardTile = function(opt) {
    this.parentState = opt.parentState;
    this.parentGroup = opt.parentGroup;
    this.col = opt.col;
    this.row = opt.row;
    this.x = opt.x;
    this.y = opt.y;
    this.z = 0;
    this.w = opt.w;
    this.h = opt.h;
    this.elem = document.createElement('div');
    this.elem.style.position = 'absolute';
    this.elem.className = 'tile';
    this.parentState.stageElem.appendChild(this.elem);
    this.classes = {
      pressed: 0,
      path: 0,
      up: 0,
      down: 0,
      left: 0,
      right: 0
    };
    this.updateDimensions();
  };

  g.BoardTile.prototype.update = function() {
    for (var k in this.classes) {
      if (this.classes[k]) {
        this.classes[k]--;
      }
    }

    if (this.parentState.food.tile.col === this.col || this.parentState.food.tile.row === this.row) {
      this.classes.path = 1;
      if (this.col < this.parentState.food.tile.col) {
        this.classes.right = 1;
      } else {
        this.classes.right = 0;
      }
      if (this.col > this.parentState.food.tile.col) {
        this.classes.left = 1;
      } else {
        this.classes.left = 0;
      }
      if (this.row > this.parentState.food.tile.row) {
        this.classes.up = 1;
      } else {
        this.classes.up = 0;
      }
      if (this.row < this.parentState.food.tile.row) {
        this.classes.down = 1;
      } else {
        this.classes.down = 0;
      }
    } else {
      this.classes.path = 0;
    }

    if (this.parentState.food.eaten) {
      this.classes.path = 0;
    }
  };

  g.BoardTile.prototype.updateDimensions = function() {
    this.x = this.col * this.parentState.tileWidth;
    this.y = this.row * this.parentState.tileHeight;
    this.w = this.parentState.tileWidth - this.parentState.spacing;
    this.h = this.parentState.tileHeight - this.parentState.spacing;
    this.elem.style.left = this.x + 'px';
    this.elem.style.top = this.y + 'px';
    this.elem.style.width = this.w + 'px';
    this.elem.style.height = this.h + 'px';
  };

  g.BoardTile.prototype.render = function() {
    var classString = '';
    for (var k in this.classes) {
      if (this.classes[k]) {
        classString += k + ' ';
      }
    }
    this.elem.className = 'tile ' + classString;
  };

  // Snake Tile Entity
  g.SnakeTile = function(opt) {
    this.parentState = opt.parentState;
    this.parentGroup = opt.parentGroup;
    this.col = opt.col;
    this.row = opt.row;
    this.x = opt.x;
    this.y = opt.y;
    this.w = opt.w;
    this.h = opt.h;
    this.color = null;
    this.scale = 1;
    this.rotation = 0;
    this.blur = 0;
    this.alpha = 1;
    this.borderRadius = 0;
    this.borderRadiusAmount = 0;
    this.elem = document.createElement('div');
    this.elem.style.position = 'absolute';
    this.parentState.stageElem.appendChild(this.elem);
  };

  g.SnakeTile.prototype.update = function(i) {
    this.x = this.col * this.parentState.tileWidth;
    this.y = this.row * this.parentState.tileHeight;
    if (i === 0) {
      this.color = '#fff';
      this.blur = this.parentState.dimAvg * 0.03 + Math.sin(this.parentState.time.elapsed / 200) * this.parentState.dimAvg * 0.015;
      if (this.parentState.snake.dir === 'n') {
        this.borderRadius = this.borderRadiusAmount + '% ' + this.borderRadiusAmount + '% 0 0';
      } else if (this.parentState.snake.dir === 's') {
        this.borderRadius = '0 0 ' + this.borderRadiusAmount + '% ' + this.borderRadiusAmount + '%';
      } else if (this.parentState.snake.dir === 'e') {
        this.borderRadius = '0 ' + this.borderRadiusAmount + '% ' + this.borderRadiusAmount + '% 0';
      } else if (this.parentState.snake.dir === 'w') {
        this.borderRadius = this.borderRadiusAmount + '% 0 0 ' + this.borderRadiusAmount + '%';
      }
    } else {
      this.color = '#fff';
      this.blur = 0;
      this.borderRadius = '0';
    }
    this.alpha = 1 - (i / this.parentState.snake.tiles.length) * 0.6;
    this.rotation = (this.parentState.snake.justAteTick / this.parentState.snake.justAteTickMax) * 90;
    this.scale = 1 + (this.parentState.snake.justAteTick / this.parentState.snake.justAteTickMax) * 1;
  };

  g.SnakeTile.prototype.updateDimensions = function() {
    this.w = this.parentState.tileWidth - this.parentState.spacing;
    this.h = this.parentState.tileHeight - this.parentState.spacing;
  };

  g.SnakeTile.prototype.render = function(i) {
    this.elem.style.left = this.x + 'px';
    this.elem.style.top = this.y + 'px';
    this.elem.style.width = this.w + 'px';
    this.elem.style.height = this.h + 'px';
    this.elem.style.backgroundColor = 'rgba(255, 255, 255, ' + this.alpha + ')';
    this.elem.style.boxShadow = '0 0 ' + this.blur + 'px #fff';
    this.elem.style.borderRadius = this.borderRadius;
  };

  // Food Tile Entity
  g.FoodTile = function(opt) {
    this.parentState = opt.parentState;
    this.parentGroup = opt.parentGroup;
    this.col = opt.col;
    this.row = opt.row;
    this.x = opt.x;
    this.y = opt.y;
    this.w = opt.w;
    this.h = opt.h;
    this.blur = 0;
    this.scale = 1;
    this.hue = 100;
    this.opacity = 0;
    this.elem = document.createElement('div');
    this.elem.style.position = 'absolute';
    this.parentState.stageElem.appendChild(this.elem);
  };

  g.FoodTile.prototype.update = function() {
    this.x = this.col * this.parentState.tileWidth;
    this.y = this.row * this.parentState.tileHeight;
    this.blur = this.parentState.dimAvg * 0.03 + Math.sin(this.parentState.time.elapsed / 200) * this.parentState.dimAvg * 0.015;
    this.scale = 0.8 + Math.sin(this.parentState.time.elapsed / 200) * 0.2;

    if (this.parentState.food.birthTick || this.parentState.food.deathTick) {
      if (this.parentState.food.birthTick) {
        this.opacity = 1 - this.parentState.food.birthTick / 1;
      } else {
        this.opacity = this.parentState.food.deathTick / 1;
      }
    } else {
      this.opacity = 1;
    }
  };

  g.FoodTile.prototype.updateDimensions = function() {
    this.w = this.parentState.tileWidth - this.parentState.spacing;
    this.h = this.parentState.tileHeight - this.parentState.spacing;
  };

  g.FoodTile.prototype.render = function() {
    this.elem.style.left = this.x + 'px';
    this.elem.style.top = this.y + 'px';
    this.elem.style.width = this.w + 'px';
    this.elem.style.height = this.h + 'px';
    this.elem.style.transform = 'translateZ(0) scale(' + this.scale + ')';
    this.elem.style.backgroundColor = 'hsla(' + this.hue + ', 100%, 60%, 1)';
    this.elem.style.boxShadow = '0 0 ' + this.blur + 'px hsla(' + this.hue + ', 100%, 60%, 1)';
    this.elem.style.opacity = this.opacity;
  };

  // Snake Entity
  g.Snake = function(opt) {
    this.parentState = opt.parentState;
    this.dir = 'e';
    this.currDir = this.dir;
    this.tiles = [];
    for (var i = 0; i < 5; i++) {
      this.tiles.push(
        new g.SnakeTile({
          parentState: this.parentState,
          parentGroup: this.tiles,
          col: 8 - i,
          row: 3,
          x: (8 - i) * opt.parentState.tileWidth,
          y: 3 * opt.parentState.tileHeight,
          w: opt.parentState.tileWidth - opt.parentState.spacing,
          h: opt.parentState.tileHeight - opt.parentState.spacing
        })
      );
    }
    this.last = 0;
    this.updateTick = 10;
    this.updateTickMax = this.updateTick;
    this.updateTickLimit = 3;
    this.updateTickChange = 0.2;
    this.deathFlag = 0;
    this.justAteTick = 0;
    this.justAteTickMax = 1;
    this.justAteTickChange = 0.05;

    var i = this.tiles.length;
    while (i--) {
      this.parentState.grid.set(this.tiles[i].col, this.tiles[i].row, 'snake');
    }
  };

  g.Snake.prototype.updateDimensions = function() {
    var i = this.tiles.length;
    while (i--) {
      this.tiles[i].updateDimensions();
    }
  };

  g.Snake.prototype.update = function() {
    if (this.parentState.keys.up) {
      if (this.dir !== 's' && this.dir !== 'n' && this.currDir !== 's' && this.currDir !== 'n') {
        this.dir = 'n';
      }
    } else if (this.parentState.keys.down) {
      if (this.dir !== 'n' && this.dir !== 's' && this.currDir !== 'n' && this.currDir !== 's') {
        this.dir = 's';
      }
    } else if (this.parentState.keys.right) {
      if (this.dir !== 'w' && this.dir !== 'e' && this.currDir !== 'w' && this.currDir !== 'e') {
        this.dir = 'e';
      }
    } else if (this.parentState.keys.left) {
      if (this.dir !== 'e' && this.dir !== 'w' && this.currDir !== 'e' && this.currDir !== 'w') {
        this.dir = 'w';
      }
    }

    this.parentState.keys.up = 0;
    this.parentState.keys.down = 0;
    this.parentState.keys.right = 0;
    this.parentState.keys.left = 0;

    this.updateTick += this.parentState.time.ndelta;
    if (this.updateTick >= this.updateTickMax) {
      this.updateTick = this.updateTick - this.updateTickMax;

      this.tiles.unshift(
        new g.SnakeTile({
          parentState: this.parentState,
          parentGroup: this.tiles,
          col: this.tiles[0].col,
          row: this.tiles[0].row,
          x: this.tiles[0].col * this.parentState.tileWidth,
          y: this.tiles[0].row * this.parentState.tileHeight,
          w: this.parentState.tileWidth - this.parentState.spacing,
          h: this.parentState.tileHeight - this.parentState.spacing
        })
      );
      this.last = this.tiles.pop();
      if (this.parentState.stageElem.contains(this.last.elem)) {
        this.parentState.stageElem.removeChild(this.last.elem);
      }

      this.parentState.boardTiles.collection[
        this.last.col + this.last.row * this.parentState.cols
      ].classes.pressed = 2;

      var i = this.tiles.length;
      while (i--) {
        this.parentState.grid.set(this.tiles[i].col, this.tiles[i].row, 'snake');
      }
      this.parentState.grid.set(this.last.col, this.last.row, 'empty');

      if (this.dir === 'n') {
        this.currDir = 'n';
        this.tiles[0].row -= 1;
      } else if (this.dir === 's') {
        this.currDir = 's';
        this.tiles[0].row += 1;
      } else if (this.dir === 'w') {
        this.currDir = 'w';
        this.tiles[0].col -= 1;
      } else if (this.dir === 'e') {
        this.currDir = 'e';
        this.tiles[0].col += 1;
      }

      // Prevent the snake from going out of bounds
      if (this.tiles[0].col < 0 || this.tiles[0].col >= this.parentState.cols || this.tiles[0].row < 0 || this.tiles[0].row >= this.parentState.rows) {
        this.deathFlag = 1;
        clearTimeout(this.foodCreateTimeout);
        clearTimeout(this.powerUpCreateTimeout);
        document.getElementById('game-over-sound').play();
        document.getElementById('game-over').style.display = 'block';
      }

      if (this.parentState.grid.get(this.tiles[0].col, this.tiles[0].row) === 'snake') {
        this.deathFlag = 1;
        clearTimeout(this.foodCreateTimeout);
        clearTimeout(this.powerUpCreateTimeout);
        document.getElementById('game-over-sound').play();
        document.getElementById('game-over').style.display = 'block';
      }

      if (this.parentState.grid.get(this.tiles[0].col, this.tiles[0].row) === 'food') {
        this.tiles.push(
          new g.SnakeTile({
            parentState: this.parentState,
            parentGroup: this.tiles,
            col: this.last.col,
            row: this.last.row,
            x: this.last.col * this.parentState.tileWidth,
            y: this.last.row * this.parentState.tileHeight,
            w: this.parentState.tileWidth - this.parentState.spacing,
            h: this.parentState.tileHeight - this.parentState.spacing
          })
        );
        if (this.updateTickMax - this.updateTickChange > this.updateTickLimit) {
          this.updateTickMax -= this.updateTickChange;
        }
        this.parentState.score += 15; // Add 15 points for each food
        this.parentState.scoreElem.innerHTML = this.parentState.score;
        this.justAteTick = this.justAteTickMax;

        this.parentState.food.eaten = 1;
        if (this.parentState.stageElem.contains(this.parentState.food.tile.elem)) {
          this.parentState.stageElem.removeChild(this.parentState.food.tile.elem);
        }

        var _this = this;

        this.foodCreateTimeout = setTimeout(function() {
          _this.parentState.food = new g.Food({
            parentState: _this.parentState
          });
        }, 300);

        // Check for level up
        if (this.parentState.score >= 500 * (this.parentState.level + 1)) {
          this.parentState.level++;
          document.getElementById('next-level-sound').play();
          alert('Level up! Welcome to Level ' + (this.parentState.level + 1));
          this.parentState.init(); // Restart the game at the new level
        }
      }

      if (this.deathFlag) {
        document.getElementById('death-sound').play();
        g.setState('play');
      }
    }

    var i = this.tiles.length;
    while (i--) {
      this.tiles[i].update(i);
    }

    if (this.justAteTick > 0) {
      this.justAteTick -= this.justAteTickChange;
    } else if (this.justAteTick < 0) {
      this.justAteTick = 0;
    }
  };

  g.Snake.prototype.render = function() {
    var i = this.tiles.length;
    while (i--) {
      this.tiles[i].render(i);
    }
  };

  // Food Entity
  g.Food = function(opt) {
    this.parentState = opt.parentState;
    this.tile = new g.FoodTile({
      parentState: this.parentState,
      col: 0,
      row: 0,
      x: 0,
      y: 0,
      w: opt.parentState.tileWidth - opt.parentState.spacing,
      h: opt.parentState.tileHeight - opt.parentState.spacing
    });
    this.reset();
    this.eaten = 0;
    this.birthTick = 1;
    this.deathTick = 0;
    this.birthTickChange = 0.025;
    this.deathTickChange = 0.05;
  };

  g.Food.prototype.reset = function() {
    var empty = [];
    for (var x = 0; x < this.parentState.cols; x++) {
      for (var y = 0; y < this.parentState.rows; y++) {
        var tile = this.parentState.grid.get(x, y);
        if (tile === 'empty') {
          empty.push({ x: x, y: y });
        }
      }
    }
    var newTile = empty[g.util.randInt(0, empty.length - 1)];
    this.tile.col = newTile.x;
    this.tile.row = newTile.y;
  };

  g.Food.prototype.updateDimensions = function() {
    this.tile.updateDimensions();
  };

  g.Food.prototype.update = function() {
    this.tile.update();

    if (this.birthTick > 0) {
      this.birthTick -= this.birthTickChange;
    } else if (this.birthTick < 0) {
      this.birthTick = 0;
    }

    this.parentState.grid.set(this.tile.col, this.tile.row, 'food');
  };

  g.Food.prototype.render = function() {
    this.tile.render();
  };

  // Power-Up Entity
  g.PowerUp = function(opt) {
    this.parentState = opt.parentState;
    this.tile = new g.FoodTile({
      parentState: this.parentState,
      col: 0,
      row: 0,
      x: 0,
      y: 0,
      w: opt.parentState.tileWidth - opt.parentState.spacing,
      h: opt.parentState.tileHeight - opt.parentState.spacing
    });
    this.reset();
    this.type = this.getRandomType();
  };

  g.PowerUp.prototype.reset = function() {
    var empty = [];
    for (var x = 0; x < this.parentState.cols; x++) {
      for (var y = 0; y < this.parentState.rows; y++) {
        var tile = this.parentState.grid.get(x, y);
        if (tile === 'empty') {
          empty.push({ x: x, y: y });
        }
      }
    }
    var newTile = empty[g.util.randInt(0, empty.length - 1)];
    this.tile.col = newTile.x;
    this.tile.row = newTile.y;
  };

  g.PowerUp.prototype.getRandomType = function() {
    const types = ['speed', 'invincibility', 'sizeReduction'];
    return types[g.util.randInt(0, types.length - 1)];
  };

  g.PowerUp.prototype.updateDimensions = function() {
    this.tile.updateDimensions();
  };

  g.PowerUp.prototype.update = function() {
    this.tile.update();
  };

  g.PowerUp.prototype.render = function() {
    this.tile.render();
    this.tile.elem.style.backgroundColor = 'rgba(0, 255, 0, 0.5)'; // Green color for power-ups
  };

  g.PowerUp.prototype.activate = function() {
    switch (this.type) {
      case 'speed':
        this.parentState.snake.updateTickMax = Math.max(this.parentState.snake.updateTickLimit, this.parentState.snake.updateTickMax - 5);
        break;
      case 'invincibility':
        // Implement invincibility logic
        break;
      case 'sizeReduction':
        if (this.parentState.snake.tiles.length > 5) {
          this.parentState.snake.tiles.pop();
        }
        break;
    }
  };

  // Play State
  function StatePlay() {
    this.name = 'play';
  }

  StatePlay.prototype.init = function() {
    this.scoreElem = document.querySelector('.score');
    this.stageElem = document.querySelector('.stage');
    this.dimLong = 28;
    this.dimShort = 16;
    this.padding = 0.25;
    this.boardTiles = new g.Group();
    this.keys = {};
    this.foodCreateTimeout = null;
    this.powerUpCreateTimeout = null;
    this.score = 0;
    this.level = 0;
    this.scoreElem.innerHTML = this.score;
    this.time = new g.Time();
    this.getDimensions();
    if (this.winWidth < this.winHeight) {
      this.rows = this.dimLong;
      this.cols = this.dimShort;
    } else {
      this.rows = this.dimShort;
      this.cols = this.dimLong;
    }
    this.spacing = 1;
    this.grid = new g.Grid(this.cols, this.rows);
    this.resize();
    this.createBoardTiles();
    this.bindEvents();
    this.snake = new g.Snake({ parentState: this });
    this.food = new g.Food({ parentState: this });
    this.createPowerUp();
  };

  StatePlay.prototype.getDimensions = function() {
    this.winWidth = window.innerWidth;
    this.winHeight = window.innerHeight;
    this.activeWidth = this.winWidth - this.winWidth * this.padding;
    this.activeHeight = this.winHeight - this.winHeight * this.padding;
  };

  StatePlay.prototype.resize = function() {
    var _this = g.currentState();
    _this.getDimensions();
    _this.stageRatio = _this.rows / _this.cols;

    if (_this.activeWidth > _this.activeHeight / _this.stageRatio) {
      _this.stageHeight = _this.activeHeight;
      _this.stageElem.style.height = _this.stageHeight + 'px';
      _this.stageWidth = Math.floor(_this.stageHeight / _this.stageRatio);
      _this.stageElem.style.width = _this.stageWidth + 'px';
    } else {
      _this.stageWidth = _this.activeWidth;
      _this.stageElem.style.width = _this.stageWidth + 'px';
      _this.stageHeight = Math.floor(_this.stageWidth * _this.stageRatio);
      _this.stageElem.style.height = _this.stageHeight + 'px';
    }

    _this.tileWidth = ~~(_this.stageWidth / _this.cols);
    _this.tileHeight = ~~(_this.stageHeight / _this.rows);
    _this.dimAvg = (_this.activeWidth + _this.activeHeight) / 2;
    _this.spacing = Math.max(1, ~~(_this.dimAvg * 0.0025));

    _this.stageElem.style.marginTop = -_this.stageElem.offsetHeight / 2 + _this.headerHeight / 2 + 'px';

    _this.boardTiles.each('updateDimensions');
    _this.snake !== undefined && _this.snake.updateDimensions();
    _this.food !== undefined && _this.food.updateDimensions();
    _this.powerUp !== undefined && _this.powerUp.updateDimensions();
  };

  StatePlay.prototype.createBoardTiles = function() {
    for (var y = 0; y < this.rows; y++) {
      for (var x = 0; x < this.cols; x++) {
        this.boardTiles.add(
          new g.BoardTile({
            parentState: this,
            parentGroup: this.boardTiles,
            col: x,
            row: y,
            x: x * this.tileWidth,
            y: y * this.tileHeight,
            w: this.tileWidth - this.spacing,
            h: this.tileHeight - this.spacing
          })
        );
      }
    }
  };

  StatePlay.prototype.upOn = function() {
    g.currentState().keys.up = 1;
  };
  StatePlay.prototype.downOn = function() {
    g.currentState().keys.down = 1;
  };
  StatePlay.prototype.rightOn = function() {
    g.currentState().keys.right = 1;
  };
  StatePlay.prototype.leftOn = function() {
    g.currentState().keys.left = 1;
  };
  StatePlay.prototype.upOff = function() {
    g.currentState().keys.up = 0;
  };
  StatePlay.prototype.downOff = function() {
    g.currentState().keys.down = 0;
  };
  StatePlay.prototype.rightOff = function() {
    g.currentState().keys.right = 0;
  };
  StatePlay.prototype.leftOff = function() {
    g.currentState().keys.left = 0;
  };

  StatePlay.prototype.keydown = function(e) {
    e.preventDefault();
    var e = e.keyCode ? e.keyCode : e.which,
      _this = g.currentState();
    if (e === 38 || e === 87) {
      _this.upOn();
    }
    if (e === 39 || e === 68) {
      _this.rightOn();
    }
    if (e === 40 || e === 83) {
      _this.downOn();
    }
    if (e === 37 || e === 65) {
      _this.leftOn();
    }
  };

  StatePlay.prototype.bindEvents = function() {
    var _this = g.currentState();
    window.addEventListener('keydown', _this.keydown, false);
    window.addEventListener('resize', _this.resize, false);
    window.addEventListener('orientationchange', _this.resize, false); // Handle orientation change
  };

  StatePlay.prototype.step = function() {
    this.boardTiles.each('update');
    this.boardTiles.each('render');
    this.snake.update();
    this.snake.render();
    this.food.update();
    this.food.render();
    if (this.powerUp) {
      this.powerUp.update();
      this.powerUp.render();
      if (this.snake.tiles[0].col === this.powerUp.tile.col && this.snake.tiles[0].row === this.powerUp.tile.row) {
        this.powerUp.activate();
        if (this.stageElem.contains(this.powerUp.tile.elem)) {
          this.stageElem.removeChild(this.powerUp.tile.elem);
        }
        this.createPowerUp();
      }
    }
    this.time.update();
  };

  StatePlay.prototype.exit = function() {
    window.removeEventListener('keydown', this.keydown, false);
    window.removeEventListener('resize', this.resize, false);
    window.removeEventListener('orientationchange', this.resize, false); // Remove orientation change handler
    this.stageElem.innerHTML = '';
    this.grid.tiles = null;
    this.time = null;
  };

  StatePlay.prototype.createPowerUp = function() {
    var _this = this;
    this.powerUpCreateTimeout = setTimeout(function() {
      _this.powerUp = new g.PowerUp({ parentState: _this });
    }, 5000);
  };

  g.addState(new StatePlay());

  // Game setup
  g.config = {
    title: 'Snakely',
    debug: window.location.hash === '#debug' ? 1 : 0,
    state: 'play'
  };

  g.setState(g.config.state);
  g.time = new g.Time();

  g.step = function() {
    requestAnimationFrame(g.step);
    g.states[g.state].step();
    g.time.update();
  };

  window.addEventListener('load', g.step, false);

  function setupTouchControls() {
    const stage = document.querySelector('.stage');
    let touchStartX = 0;
    let touchStartY = 0;

    stage.addEventListener(
      'touchstart',
      function(event) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      },
      false
    );

    stage.addEventListener(
      'touchmove',
      function(event) {
        const touchEndX = event.touches[0].clientX;
        const touchEndY = event.touches[0].clientY;

        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX > 0) {
            g.currentState().keys.left = 1;
          } else {
            g.currentState().keys.right = 1;
          }
        } else {
          if (diffY > 0) {
            g.currentState().keys.up = 1;
          } else {
            g.currentState().keys.down = 1;
          }
        }
        event.preventDefault();
      },
      false
    );

    stage.addEventListener(
      'touchend',
      function(event) {
        g.currentState().keys.up = 0;
        g.currentState().keys.down = 0;
        g.currentState().keys.left = 0;
        g.currentState().keys.right = 0;
      },
      false
    );
  }

  setupTouchControls();

  document.getElementById('start-game').addEventListener('click', function() {
    document.getElementById('main-menu').style.display = 'none';
    document.querySelector('.score').style.display = 'block';
    document.querySelector('.stage').style.display = 'block';
    g.setState('play');
  });

  document.getElementById('settings').addEventListener('click', function() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('settings-menu').style.display = 'block';
  });

  document.getElementById('high-scores').addEventListener('click', function() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('high-scores-menu').style.display = 'block';
  });

  document.getElementById('back-to-main').addEventListener('click', function() {
    document.getElementById('settings-menu').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
  });

  document.getElementById('back-to-main-scores').addEventListener('click', function() {
    document.getElementById('high-scores-menu').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
  });

  document.getElementById('restart-game').addEventListener('click', function() {
    document.getElementById('game-over').style.display = 'none';
    document.querySelector('.score').style.display = 'block';
    document.querySelector('.stage').style.display = 'block';
    g.setState('play');
  });
})();
