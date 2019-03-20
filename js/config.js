var data = {
    spritesUrl : "./images/sprites.png",
    keyCodes : {
        37 : "left",
        38 : "top",
        39 : "right",
        40 : "bottom",
        32 : "fire"
    },
    sprites : {
        ship : {
            sx : 0,
            sy : 0,
            w : 37,
            h : 42,
            frames : 0
        },
        missile : {
            sx : 0,
            sy : 30,
            w : 2,
            h : 10,
            frames : 0
        },
        enemyPurple : {
            sx : 37,
            sy : 0,
            w : 42,
            h :43,
            frames : 0
        },
        enemyBee : {
            sx : 79,
            sy : 0,
            w : 37,
            h : 43,
            frames : 0
        },
        enemyShip : {
            sx : 116,
            sy : 0,
            w : 42,
            h : 43,
            frames : 0
        },
        enemyCircle : {
            sx : 158,
            sy : 0,
            w : 32,
            h : 33,
            frames : 0
        },
        explosion : {
            sx : 0,
            sy : 64,
            w : 64,
            h : 64,
            frames : 12
        }
    },
    enemies : {
        straight: {
            x: 0,
            y: -50,
            sprite: 'enemyShip',
            health: 20,
            E: 100
        },
        ltr:{
            x: 0,
            y: -100,
            sprite: 'enemyPurple',
            health: 20, 
            B: 75,
            C: 1,
            E: 100,
            missiles: 2
        },
        circle : {
            x : 250,
            y : -50,
            sprite : "enemyCircle",
            health : 10,
            A : 0,
            B : -200,
            C : 1,
            E : 20,
            F : 200,
            G : 1,
            H : Math.PI / 2 
        },
        wiggle : {
            x : 100,
            y : -50,
            sprite : "enemyBee",
            health : 30,
            B : 100,
            C : 4,
            E : 100
        },
        step : {
            x : 0,
            y : -50,
            sprite : "enemyCircle",
            health : 10,
            B : 150,
            C : 1.1,
            E : 60
        }
    },
    level : [
        [
            [0,4000,300,'step'],
            [6000,13000,500,'ltr'],
            [10000,16000,300,'circle'],
            [10000,16000,300,'circle',{x : 200}],
            [17800,20000,500,'straight',{ x: 50 }],
            [18200,20000,500,'straight',{ x: 90 }],
            [18200,20000,500,'straight',{ x: 10 }],
            [18400,20000,300,'circle'],
            [22000,25000,400,'wiggle',{ x: 400 }],
            [22000,25000,400,'wiggle',{ x: 350 }],
            [22000,25000,400,'wiggle',{ x: 300 }],
            [22000,25000,400,'wiggle',{ x: 150 }],
            [22000,25000,400,'wiggle',{ x: 100 }],
            [22000,25000,400,'wiggle',{ x: 50 }]
        ],
        [
            [0,4000,300,'step'],
            [0,4000,300,'circle'],
            [6000,16000,500,'ltr'],
            [10000,16000,300,'step'],
            [10000,16000,300,'circle'],
            [17800,20000,500,'straight',{ x: 50 } ],
            [17800,20000,500,'straight',{ x: 90 } ],
            [17800,20000,500,'straight',{ x: 140 } ],
            [17800,20000,500,'straight',{ x: 190 } ],
            [17800,20000,500,'straight',{ x: 240 } ],
            [17800,20000,500,'straight',{ x: 300 } ],
            [17800,20000,500,'straight',{ x: 360 } ],
            [18000,20000,300,'step'],
            [18000,20000,300,'circle'],
            [22000,25000,400,'wiggle',{ x: 400 }],
            [22000,25000,400,'wiggle',{ x: 350 }],
            [22000,25000,400,'wiggle',{ x: 300 }],
            [22000,25000,400,'wiggle',{ x: 250 }],
            [22000,25000,400,'wiggle',{ x: 200 }],
            [22000,25000,400,'wiggle',{ x: 150 }],
            [22000,25000,400,'wiggle',{ x: 100 }],
            [22000,25000,400,'wiggle',{ x: 50 }]
        ]
    ],
    starField : {
        speed : 0.02
    },
    OBJECT_PLAYER : 1,
    OBJECT_PLAYER_PROJECTILE : 2,
    OBJECT_ENEMY : 4,
    OBJECT_ENEMY_PROJECTILE : 8,
    OBJECT_POWERUP : 16,
};