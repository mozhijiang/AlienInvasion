window.addEventListener("load",function(){
    game.initialize("canvas",data.sprites,startGame);
});

function startGame(){
    game.setBoard(0,new StarField(20,1,30,true));
    game.setBoard(1,new StarField(40,0.6,60));
    game.setBoard(2,new StarField(60,1.0,50));
    game.setBoard(3,new TitleScreen("外来物种入侵","按空格键开始游戏",playGame));
}
function StarField(speed,opacity,numStars,clear){
    var stars = document.createElement("canvas");
    stars.width = game.width;
    stars.height = game.height;
    var context = stars.getContext && stars.getContext("2d");
    var offset = 0;
    if(clear){
        context.fillStyle = "#000";
        context.fillRect(0,0,stars.width,stars.height);
    }
    context.fillStyle = "#FFF";
    context.globalAlpha = opacity;
    for(var i = 0; i < numStars; i++){
        context.fillRect(
            Math.floor(Math.random() * stars.width),
            Math.floor(Math.random() * stars.height),
            2,
            2
        );
    }
    
    this.draw = function(context){
        var intOffset = Math.floor(offset);
        var remaining = stars.height - intOffset;
        if(intOffset > 0){
            context.drawImage(
                stars,
                0,
                remaining,
                stars.width,
                intOffset,
                0,
                0,
                stars.width,
                intOffset
            );
        }
        if(remaining > 0){
            context.drawImage(
                stars,
                0,
                0,
                stars.width,
                remaining,
                0,
                intOffset,
                stars.width,
                remaining
            );
        }
    }
    this.step = function(dt){
        offset += dt * speed;
        offset = offset % stars.height;
    }
}
function TitleScreen(title,subtitle,callback,argument){
    this.step = function(){
        if(game.keys['fire'] && callback) callback(argument ? argument : null);
    }
    this.draw = function(context){
        context.fillStyle = "#FFFFFF";
        context.textAlign = "center";
        context.font = "40px Arial";
        context.fillText(title,game.width/2,game.height/2);
        context.font = "20px Arial";
        context.fillText(subtitle,game.width/2,game.height/2 + 40);
    }
}
function playGame(levelIndex){
    var board = new GameBoard();
    board.add(new PlayerShip());
    board.add(new Level(levelIndex ? levelIndex : 0,next));
    game.setBoard(3,board);
}
function next(levelIndex){
    if(data.level[++levelIndex]){
        game.setBoard(3,new TitleScreen("继续下一关!","按空格键继续",playGame,levelIndex));
    }else{
        winGame();
    }
}
function winGame(){
    game.setBoard(3,new TitleScreen("你赢了!","按空格键继续",playGame));
}
function loseGame(){
    game.setBoard(3,new TitleScreen("你输了!","按空格键继续",playGame))
}

function PlayerShip(){
    this.setup("ship",{reloadTime : 10});
    this.x = game.width / 2 - this.w / 2;
    this.y = game.height - 10 - this.h;
    this.event = function (event){
        if(event === "left" && this.x > 0){
            this.x-= 2;
        }else if(event === "right" && this.x + this.w < game.width){
            this.x+= 2;
        }else if(event === "top" && this.y > 0){
            this.y-= 2;
        }else if(event === "bottom" && this.y + this.h < game.height){
            this.y+= 2;
        }else if(event === "fire" && this.reloadTime < 0){
            this.reloadTime = 10;
            this.board.add(new PlayerMissile(this.x,this.y + this.h / 2));
            this.board.add(new PlayerMissile(this.x + this.w,this.y + this.h / 2));
        }
    }
    this.step = function(){
        this.reloadTime--;
        for(event in game.keys){
            if(game.keys[event]){
                this.event(event);
            }
        }
    };
    this.draw = function(context){
        spriteSheet.draw(context,'ship',this.x,this.y,this.frame);
    }
}
PlayerShip.prototype = new Sprite();
PlayerShip.prototype.type = data.OBJECT_PLAYER;
PlayerShip.prototype.hit = function(damage){
    if(this.board.remove(this)){
        this.board.add(new Explosion(
            this.x + this.w / 2 , 
            this.y + this.h /2,
            loseGame 
            ));
    }
}

function PlayerMissile(x,y){
    this.setup("missile",{damege : 10});
    this.x = x;
    this.y = y;
}
PlayerMissile.prototype = new Sprite();
PlayerMissile.prototype.type = data.OBJECT_PLAYER_PROJECTILE;
PlayerMissile.prototype.step = function(){
    this.y -= data.starField.speed * 300;
    var collision = this.board.collide(this,data.OBJECT_ENEMY);
    if(collision){
        collision.hit(this.damege);
        this.board.remove(this);
    }else if(this.y < -this.h){
        this.board.remove(this)
    };
}

function Enemy(blueprint,override){
    this.merge(this.baseParameters);
    this.setup(blueprint.sprite,blueprint);
    if(override)this.merge(override);
}
Enemy.prototype = new Sprite();
Enemy.prototype.type = data.OBJECT_ENEMY;
Enemy.prototype.baseParameters = {
    A : 0,
    B : 0,
    C : 0,
    D : 0,
    E : 0,
    F : 0,
    G : 0,
    H : 0,
    t : 0,
    firePercentage : 0.01,
    reloadTime: 0.75,
    reload : 0
}
Enemy.prototype.step = function(dt){
    this.t += dt;
    this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);
    this.vy = this.E + this.F * Math.sin(this.G * this.t + this.H);
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    var collision = this.board.collide(this,data.OBJECT_PLAYER);
    if(collision){
        collision.hit(this.damege);
        this.board.remove(this);
        this.board.add(new Explosion(this.x + this.w / 2 , this.y + this.h /2 ));
    }
    if(this.reload <= 0 && Math.random() < this.firePercentage){
        this.relaod = this.reloadTime;
        if(this.missiles == 2){
            this.board.add(new EnemyMissile(this.x + this.w , this.y + this.h / 2));
            this.board.add(new EnemyMissile(this.x , this.y + this.h / 2));
        }else{
            this.board.add(new EnemyMissile(this.x + this. w / 2 , this.y + this.h));
        }
    }
    this.reload -= dt;
    if(this.y > game.height || this.x < -this.w || this.x > game.width){
        this.board.remove(this);
    }
};
Enemy.prototype.hit = function(damage){
    this.health -= damage;
    if(this.health <= 0){
        if(this.board.remove(this)){
            this.board.add(new Explosion(this.x + this.w / 2 , this.y + this.h /2 ));
        }
    }
}

function EnemyMissile(x,y){
    this.setup('enemyMissile',{vy : 200 , damage : 10});
    this.x = x - this.w / 2;
    this.y = y;
}
EnemyMissile.prototype = new Sprite();
EnemyMissile.prototype.type = data.OBJECT_ENEMY_PROJECTILE;
EnemyMissile.prototype.step = function(dt){
    this.y += this.vy * dt;
    var collision = this.board.collide(this,data.OBJECT_PLAYER);
    if(collision){
        collision.hit(this.damage);
        this.board.remove(this);
    }else if(this.y > game.height){
        this.board.remove(this);
    }
}

function Explosion(centerX,centerY,callback){
    this.setup('explosion',{frame : 0});
    this.x = centerX - this.w / 2;
    this.y = centerY - this.h / 2;
    this.subFrame = 0;
    this.callback = callback ? callback : undefined;
}
Explosion.prototype = new Sprite();
Explosion.prototype.step = function(dt){
    this.frame = Math.floor(this.subFrame++ / 3);
    if(this.subFrame >= 36){
        this.board.remove(this);
        if(this.callback)this.callback();
    }
}