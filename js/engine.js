var spriteSheet = new function(){
    this.map = {};
    this.load = function(spriteData,callback){
        this.map = spriteData;
        this.image = new Image();
        this.image.onload = callback;
        this.image.src = data.spritesUrl;
    };
    this.draw = function(context,sprite,x,y,frame){
        var s = this.map[sprite];
        if(!frame)frame = 0;
        context.drawImage(
            this.image,
            s.sx + frame * s.w,
            s.sy,
            s.w,
            s.h,
            x,
            y,
            s.w,
            s.h
        );
    }
}
var game = new function(){
    var boards = [];
    this.keys = {
        left : false,
        top : false,
        right : false,
        bottom : false
    };
    var mobile;
    this.initialize = function(canvasId,spriteData,callback){
        this.canvas = $(`#${canvasId}`)[0];
        this.setupMobile();
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.context = this.canvas.getContext && this.canvas.getContext("2d");
        this.canvasMultiplier = 1;
        if(!this.context){
            alert("请更新你的浏览器");
            return;
        }
        this.setupInput();
        if(this.mobile)this.setBoard(4,new TouchControls());
        this.loop();
        spriteSheet.load(spriteData,callback);
    };
    this.setupInput = function(){
        window.addEventListener("keydown",function(e){
            if(data.keyCodes[e.keyCode]){
                game.keys[data.keyCodes[e.keyCode]] = true;
                e.preventDefault();                
            }
        });
        window.addEventListener("keyup",function(e){
            if(data.keyCodes[e.keyCode]){
                game.keys[data.keyCodes[e.keyCode]] = false;
                e.preventDefault();
            }
        })
    };
    this.loop = function(){
        for(var i = 0; i < boards.length; i++){
            if(boards[i]){
                boards[i].step(data.starField.speed);
                boards[i].draw(game.context);
            }
        }
        window.requestAnimationFrame(game.loop);
    }
    this.setBoard = function(num,board){
        boards[num] = board;
    }
    this.setupMobile = function(){
        var container = $("#container")[0];
        var hasTouch = !!('ontouchstart' in window);
        var width = window.innerWidth;
        var height = window.innerHeight;
        if(hasTouch)this.mobile = true;
        if(screen.width >= 1280 || !hasTouch)return false;
        if(width > height){
            alert("请旋转设备，然后单击ok");
            width = window.innerWidth;
            height = window.innerHeight;
        }
        this.canvas.style.position = "absolute";
        this.canvas.style.left = '0px';
        this.canvas.style.top = "0px";
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
}
function GameBoard(){
    var board = this;
    this.objects = [];
    this.cnt = [];

    this.add = function(object){
        object.board = this;
        this.objects.push(object);
        this.cnt[object.type] = (this.cnt[object.type] || 0) + 1;
        return object;
    };
    this.remove = function(object){
        var wasStillAlive = this.removed.indexOf(object) === -1;
        if(wasStillAlive)this.removed.push(object);
        return wasStillAlive;
        }

        this.resetRemoved = function(){
            this.removed = [];
        }
        this.finalizeRemoved = function(){
            for(var i = 0; i < this.removed.length; i++){
                var index = this.objects.indexOf(this.removed[i]);
                if(index != -1){
                    this.cnt[this.removed[i].type]--;
                    this.objects.splice(index,1);
                }
            }
        }
        this.iterate = function(funcName){
            var args = Array.prototype.slice.call(arguments,1);
            for(var i = 0; i < this.objects.length; i++){
                var object = this.objects[i];
                object[funcName].apply(object,args);
            }
        }
        this.detect = function(func){
            for(var i = 0, val = null; i < this.objects.length; i++){
                if(func.call(this.objects[i]))return this.objects[i];
            }
            return false;
        }
        this.step = function(speed){
            this.resetRemoved();
            this.iterate("step",speed);
            this.finalizeRemoved();
        }
        this.draw = function(context){
            this.iterate("draw",context);
        }
        this.overlap = function(object1,object2){
            return !(
                (object1.y + object1.h < object2.y) ||
                (object1.y > object2.y + object2.h) ||
                (object1.x + object1.w < object2.x) ||
                (object1.x > object2.x + object2.w)
            );
        }
        this.collide = function(object,type){
            return this.detect(function(){
                if(object != this){
                    var col = (!type || this.type & type) && board.overlap(object,this);
                    return col ? this : false;
                }
            })
        }
}
function Sprite() { };

Sprite.prototype.setup = function(sprite,props) {
  this.sprite = sprite;
  this.merge(props);
  this.frame = this.frame || 0;
  this.w =  spriteSheet.map[sprite].w;
  this.h =  spriteSheet.map[sprite].h;
};

Sprite.prototype.merge = function(props) {
  if(props) {
    for (var prop in props) {
      this[prop] = props[prop];
    }
  }
};

Sprite.prototype.draw = function(ctx) {
    spriteSheet.draw(ctx,this.sprite,this.x,this.y,this.frame);
};

Sprite.prototype.hit = function(damage) {
    this.board.remove(this);
};
function Level(levelIndex,callback) {
    this.levelData = [];
    log(data.level[levelIndex]);
    for(var i =0; i<data.level[levelIndex].length; i++) {
      this.levelData.push(Object.create(data.level[levelIndex][i]));
    }
    this.t = 0;
    this.levelIndex = levelIndex;
    this.callback = callback;
};
Level.prototype.step = function(dt) {
    var index = 0, remove = [], curShip = null;
    this.t += dt * 1000;
    while((curShip = this.levelData[index]) && (curShip[0] < this.t)) {
        if(this.t > curShip[1]) {
            remove.push(curShip);
        }else if(curShip[0] < this.t){
            var enemy = data.enemies[curShip[3]];
            var override = curShip[4];
            this.board.add(new Enemy(enemy,override));
            curShip[0] += curShip[2];
        }
        index++;
    }
    for(var i=0,len=remove.length;i<len;i++) {
        var index = this.levelData.indexOf(remove[i]);
        if(index != -1) this.levelData.splice(index,1);
    }
    if(this.levelData.length === 0 && this.board.cnt[data.OBJECT_ENEMY] === 0) {
        if(this.callback) this.callback(this.levelIndex);
    }
  };
  Level.prototype.draw = function(context){};
  function TouchControls(){
    var gutterWidth = 10;
    var unitWidth = game.width / 6;
    var blockWidth = unitWidth - gutterWidth;
    var yLoc = game.height - unitWidth;
    var leftX = gutterWidth;
    var leftY = yLoc;
    var topX = unitWidth + gutterWidth;
    var topY = yLoc - unitWidth;
    var rightX = 2 * unitWidth + gutterWidth;
    var rightY = yLoc;
    var bottomX = unitWidth + gutterWidth;
    var bottomY = yLoc;
    var fireX = 5 * unitWidth;
    var fireY = yLoc;
    var _this = this;
    var touchEvent = [];

    this.drawSquare = function(context,x,y,txt,on){
        context.globalAlpha = on ? 0.9 : 0.6;
        context.fillStyle = "#CCC";
        context.fillRect(x,y,blockWidth,blockWidth);
        context.fillStyle = "FFF";
        context.textAlign = "center";
        context.globalAlpha = 1;
        context.font = `bold ${3 * unitWidth / 4}px arial`;
        context.fillText(txt,x + blockWidth / 2,y + 3 * blockWidth / 4 + 5);
    }
    this.draw = function(context){
        context.save();
        this.drawSquare(
            context,
            leftX,
            leftY,
            '\u25C2',
            game.keys['left']
        );
        this.drawSquare(
            context,
            topX,
            topY,
            '\u25B4',
            game.keys['top']
        );
        this.drawSquare(
            context,
            rightX,
            rightY,
            '\u25B8',
            game.keys['right']
        );
        this.drawSquare(
            context,
            bottomX,
            bottomY,
            '\u25BE',
            game.keys['bottom']
        );
        this.drawSquare(
            context,
            fireX,
            fireY,
            'A',
            game.keys['fire']
        );
        context.restore();
    };
    this.step = function(){};
    this.trackTouch = function(e){
        e.preventDefault();
        var offsetLeft = game.canvas.offsetLeft;
        var offsetTop = game.canvas.offsetTop;
        for(var i = 0; i < e.changedTouches.length; i++){
            var touch = e.changedTouches[i];
            var x = touch.clientX - offsetLeft;
            var y = touch.clientY - offsetTop;
            var type = _this.getTouchType(x,y);
            if(e.type === "touchstart"){
                if(type){
                    game.keys[type] = true;
                    touchEvent[touch.identifier] = type;
                }
            }else if(e.type === "touchmove"){
                if(type){
                    game.keys[type] = true;
                }else{
                    game.keys[touchEvent[touch.identifier]] = false;
                }
            }else if(e.type === "touchend"){
                game.keys[touchEvent[touch.identifier]] = false;
            }
        }
    }
    this.getTouchType = function(x,y){
        if(x >= leftX && x <= leftX + unitWidth && y >= leftY && y <= leftY + unitWidth)
            return "left";
        else if(x >= topX && x <= topX + unitWidth && y >= topY && y <= topY + unitWidth)
            return "top";
        else if(x >= rightX && x <= rightX + unitWidth && y >= rightY && y <= rightY + unitWidth)
            return "right";
        else if(x >= bottomX && x <= bottomX + unitWidth && y >= bottomY && y <= bottomY + unitWidth)
            return "bottom";
        else if(x >= fireX && x <= fireX + unitWidth && y >= fireY && y <= fireY + unitWidth)
            return "fire";
    }
    game.canvas.addEventListener("touchstart",this.trackTouch);
    game.canvas.addEventListener("touchmove",this.trackTouch);
    game.canvas.addEventListener("touchend",this.trackTouch);
};
game.setupInput();