
BasicGame.Game = function (game) {

    

    this.game;      
    this.add;       
    this.camera;    
    this.cache;     
    this.input;     
    this.load;      
    this.math;      
    this.sound;     
    this.stage;     
    this.time;      
    this.tweens;    
    this.state;     
    this.world;     
    this.particles; 
    this.physics;   
    this.rnd;       
    
};

BasicGame.Game.prototype = {

    create: function () {

        //start physics system
        this.physics.startSystem(Phaser.Physics.ARCADE);
        
        //set background
        this.background = this.add.sprite(0, 0, 'background');
        
        this.gameMode = 'play';

        //object groups
        this.shadows = this.add.group();
        this.eatableConstructions = this.add.group();
        this.towers = [];
        this.towersSprites = this.add.group();
        this.bugs = this.add.group();
        //console.log(this.bugs);
        this.shots = this.add.group();
        //crete power balance
        this.game.energyBalance = {
            consumption: 0,
            production: 0,
            capacity: 5,
            powerLeft: 0,
            update: function(regime){
                if (this.powerLeftCheck(regime)>0)
                {
                    this.powerLeft = this.powerLeftCheck(regime);    
                }             
                /*console.log('power left '+this.powerLeft);
                console.log('consumption '+this.consumption);
                console.log('production '+this.production);*/
            },
            powerLeftCheck: function(regime){
                if (regime==='day') {
                    return Math.min(this.capacity, this.powerLeft - this.consumption + this.production);    
                } else {
                    return Math.min(this.capacity, this.powerLeft - this.consumption);
                }
                
            }
        }
        

        this.input.onDown.add(this.showBuildingMenu, this);
        //energy left interface
        this.energyBalanceText = this.add.bitmapText(this.game.width*0.98, this.game.height*0.02, 'energyFont', 'Balance 0', 32);
        this.energyBalanceText.anchor.x = 1;
        this.energyBalanceText.anchor.y = 0;
        this.energyCapacityText = this.add.bitmapText(this.game.width*0.98, this.game.height*0.07, 'energyFont', 'Capacity '+this.game.energyBalance.capacity, 32);
        this.energyCapacityText.anchor.x = 1;
        this.energyCapacityText.anchor.y = 0;
        this.insufficientEnergyText = this.add.bitmapText(this.game.width*0.5, this.game.height*0.02, 'energyFont', 'Insufficient Energy', 32);
        this.insufficientEnergyText.anchor.x = 0.5;
        this.insufficientEnergyText.anchor.y = 0.5;
        this.insufficientEnergyText.alpha = 0;
        //building panel
        this.buildingMenu = this.add.group();
        this.buildingMenuSub = this.buildingMenu.create(0, 0, 'buildingPanel');
        this.constructionStatusText = this.game.make.bitmapText(this.buildingMenuSub.width/ 2, this.buildingMenuSub.height *0.02, 
            'energyFont', 'Ready for construction', 20);
        this.constructionStatusText.anchor.x = 0.5;
        this.constructionStatusText.anchor.y = 0;
        this.buildingMenu.add(this.constructionStatusText);
        this.spBut = this.game.make.button(this.buildingMenuSub.width/ 2, this.buildingMenuSub.height *0.4, 
            'spButton', this.buildSolarPanel, this, 'out', 'out', 'down', 'out');
        this.spBut.anchor.x = 0.5;
        this.spBut.anchor.y = 0.5;
        this.spBut.inputEnabled = false;
        this.buildingMenu.add(this.spBut);
        this.sbBut = this.game.make.button(this.buildingMenuSub.width/ 2, this.buildingMenuSub.height *0.6, 
            'sbButton', this.buildSolarBattery, this, 'out', 'out', 'down', 'out');
        this.sbBut.anchor.x = 0.5;
        this.sbBut.anchor.y = 0.5;
        this.sbBut.inputEnabled = false;
        this.buildingMenu.add(this.sbBut);
        this.towBut = this.game.make.button(this.buildingMenuSub.width/ 2, this.buildingMenuSub.height *0.8, 
            'towButton', this.buildTower, this, 'out', 'out', 'down', 'out');
        this.towBut.anchor.x = 0.5;
        this.towBut.anchor.y = 0.5;
        this.towBut.inputEnabled = false;
        this.buildingMenu.add(this.towBut);
        this.buildingMenu.alpha = 0;
        //declare constants
        this.nextBuildPos = new Phaser.Point(0, 0);
        this.spawnTime = 25000;
        this.game.constructionReady = true;
        this.insufficientEnergy = false;
        this.tints = [0x4d4d4d, 0x4d4d4d, 0x4d4d4d, 0x9c9c9c, 0xb8b8b8, 0xd2d2d2, 0xe0e0e0, 0xececec, 0xf3f3f3, 0xf8f8f8, 0xffffff , 0xffffff, 0xffffff, 0xffffff, 0xffffff, 0xffffff, 0xf8f8f8, 0xf3f3f3,
            0xececec, 0xe0e0e0, 0xd2d2d2, 0xb8b8b8, 0x9c9c9c, 0x4d4d4d];

        //greate main station
        this.station = new SolarStation(new Phaser.Point(this.game.width/2, this.game.height/2), this.game);
        this.station.create()
        this.physics.arcade.enable(this.station.sprite, Phaser.Physics.ARCADE);
        this.eatableConstructions.add(this.station.sprite);
        this.shadows.add(this.station.shadow);
        this.station.sprite.events.onKilled.add(this.endGame, this);
        //bugs affairs
        this.time.events.add(8000, this.addBackgroundBug, this);
        this.waveSchedule = {
            "1-22": 10,
            "1-24": 15,
            "2-3": 10,
            "2-23": 15,
            "3-1": 30,
            "3-3": 10,
            "3-22": 10,
            "3-24": 10,
            "4-1": 10,
            "4-2": 20,
            "4-3": 30,
            "4-4": 40,
            "4-6": 40
        };
        this.wavesLaunched = [];
        //add power check loop
        this.powerTimer = this.time.create(false);
        this.powerTimer.loop(999, this.measurePowerBalance, this);
        this.powerTimer.start();
        this.measurePowerBalance();
        //add day/night timer
        this.dayNightTimer = this.time.create(false);
        this.dayNightTimer.loop(15000, this.hourChange, this);
        this.dayNightTimer.start();
        this.currentHour = 8;
        this.currentDay = 1;
        this.currentTimeOfDay = 'day';
        this.game.currentTint = this.tints[this.currentHour-1];
        //day night information
        this.dayText = this.add.bitmapText(0, this.game.height * 0.05, 'energyFont', 'Day '+this.currentDay, 24);
        this.dayText.anchor.x = 0;
        this.dayText.anchor.y = 0;
        this.hourText = this.add.bitmapText(0, this.game.height * 0.1, 'energyFont', 'Hour '+this.currentHour, 24);
        this.hourText.anchor.x = 0;
        this.hourText.anchor.y = 0;
        this.regimeText = this.add.bitmapText(0, this.game.height * 0.15, 'energyFont', 'Regime '+this.currentTimeOfDay, 24);
        this.regimeText.anchor.x = 0;
        this.regimeText.anchor.y = 0;
        
        
        
        //set initial tinit
        this.changeTint();
        //set sound effects
        this.buildSound = this.add.audio('build');
        this.bugAttackSound = this.add.audio('bugAttack');
        this.bugDeadSound = this.add.audio('bugDead');
        this.buttonSound = this.add.audio('button');
        this.explosionSound = this.add.audio('explosion');
        this.game.shootSound = this.add.audio('shoot');
        //set instructions
        this.instructions = this.add.sprite(this.game.width/2, this.game.height/2, 'instructions');
        this.instructions.anchor.x = 0.5;
        this.instructions.anchor.y = 0.5;
        this.game.paused = true;
        this.input.onUp.add(this.unpause, this);
    },

    update: function () {

        if (this.gameMode === 'play') {
            this.physics.arcade.overlap(this.eatableConstructions, this.bugs, this.damageConstruction, null, this);
            this.physics.arcade.overlap(this.bugs, this.shots, this.damageBug, null, this);
            for (var i in this.towers){
                this.towers[i].shoot(this.bugs);
            };    
        }     
        
        //gather corps)
        this.bugs.forEachDead(function(item){
            item.destroy();
        }, this);
        this.eatableConstructions.forEachDead(function(item){
            item.destroy();
        }, this);
        this.shots.forEachDead(function(item){
            item.destroy();
        }, this);
    },

    endGame: function () {

        this.gameMode = 'end';
        this.finalLabel = this.add.sprite(this.game.width/2, this.game.height * 0.2, 'finalLabel');
        this.finalLabel.anchor.x = 0.5;
        this.finalLabel.anchor.y = 0;
        this.restartBut = this.add.button(this.game.width/2, this.game.height * 0.8, 'restartButton', this.restartGame, 
            this, 'out', 'out', 'down', 'out');
        this.restartBut.anchor.x = 0.5;
        this.restartBut.anchor.y = 0;

    },

    winGame: function() {
        this.gameMode = 'end';
        this.winLabel = this.add.sprite(this.game.width/2, this.game.height * 0.2, 'winLabel');
        this.winLabel.anchor.x = 0.5;
        this.winLabel.anchor.y = 0;
        this.restartBut = this.add.button(this.game.width/2, this.game.height * 0.8, 'restartButton', this.restartGame, 
            this, 'out', 'out', 'down', 'out');
        this.restartBut.anchor.x = 0.5;
        this.restartBut.anchor.y = 0;
    },

    unpause: function() {
        if (this.game.paused){
            this.game.paused = false;
            this.instructions.alpha = 0;
        }
    },

    restartGame: function() {
        this.state.restart();
    },

    measurePowerBalance: function(){
        if (this.game.energyBalance.powerLeftCheck(this.currentTimeOfDay) <=0) {
            this.insufficientEnergy = true;
            this.reduceConsumption();
        } else if (this.insufficientEnergy){
            this.restoreConsumption();
        };
        
        if (this.insufficientEnergy) {
            this.insufficientEnergyText.alpha = 1;
        } else {
            this.insufficientEnergyText.alpha = 0;
        }        
        this.game.energyBalance.update(this.currentTimeOfDay);
        this.energyBalanceText.setText('Balance '+Math.round(this.game.energyBalance.powerLeft*10)/10);
        this.energyCapacityText.setText('Capacity '+this.game.energyBalance.capacity);
    },

    reduceConsumption: function(){
        //console.log('reduce');
        this.towers.forEach(function(item){
            if (item.active){
                item.deactivate();
                item.forciblyDeactivated= true;    
            }            
        });
        if(this.game.energyBalance.powerLeftCheck(this.currentTimeOfDay)<=0 && this.station.active) {
            this.station.deactivate();
            this.station.forciblyDeactivated = true;
        }
    },

    restoreConsumption: function(){
        //console.log('restore');
        if (this.station.forciblyDeactivated){
            this.station.activate()
            if (this.game.energyBalance.powerLeftCheck(this.currentTimeOfDay)<=0){
                this.station.deactivate();
            } else {
                //console.log('station activated');
                this.station.forciblyDeactivated = false;                
            }
        } else {
            this.towers.forEach(function(item){
                if (item.forciblyDeactivated){
                    item.activate();    
                }                
            });
            if (this.game.energyBalance.powerLeftCheck(this.currentTimeOfDay)>0)
            {
                this.towers.forEach(function(item){
                    if (item.forciblyDeactivated){
                        item.forciblyDeactivated = false;    
                    }                    
                });
                this.insufficientEnergy = false;
            } else {
                this.towers.forEach(function(item){
                    if (item.forciblyDeactivated){
                        item.deactivate();
                    }
                });
            }
        }
    },

    hourChange: function(){
        if (this.currentHour>23){
            this.currentHour = 1;
            this.currentDay++;
            this.dayText.setText('Day '+this.currentDay);
            this.hourText.setText('Hour '+this.currentHour);
        } else {
            this.currentHour++;
            this.hourText.setText('Hour '+this.currentHour);
        }
        this.currentTimeOfDay = (this.currentHour>=8 && this.currentHour<22) ? "day":"night";
        this.regimeText.setText('Regime '+this.currentTimeOfDay);
        this.changeTint();
        this.checkWaveSchedule();
        this.checkWin();
    },

    checkWin: function(){
        if (this.currentDay===4 && this.currentHour===8){
            this.winGame();
        }
    },

    checkWaveSchedule: function(){
        var dateKey = ""+this.currentDay+"-"+this.currentHour;
        if (!(dateKey in this.wavesLaunched)){
            if (dateKey in this.waveSchedule){
                this.addBugWave(this.waveSchedule[dateKey]);
                this.wavesLaunched.push(dateKey);
            }
        }
    },

    changeTint: function(){
        this.game.currentTint = this.tints[this.currentHour-1];
        this.eatableConstructions.setAll('tint', this.game.currentTint);
        this.towersSprites.setAll('tint', this.game.currentTint);
        this.bugs.setAll('tint', this.game.currentTint);
        this.shots.setAll('tint', this.game.currentTint);
        this.background.tint = this.game.currentTint;
        //console.log('current color tint '+this.game.currentTint);
    },

    showBuildingMenu: function(pointer){
        //console.log('in show');
        var pointerX = pointer.position.x;
        var pointerY = pointer.position.y;
        var onConstructionSprite = false;
        this.towersSprites.forEach(function(item){
            onConstructionSprite = (onConstructionSprite || item.body.hitTest(pointerX, pointerY));
            /*console.log('hit test '+item.body.hitTest(pointerX, pointerY));
            console.log('operand result '+onConstructionSprite);
            console.log('construction '+item);*/
        }, this);
        this.eatableConstructions.forEach(function(item){
            onConstructionSprite = (onConstructionSprite || item.body.hitTest(pointerX, pointerY));
            /*console.log('hit test '+item.body.hitTest(pointerX, pointerY));
            console.log('operand result '+onConstructionSprite);
            console.log('construction '+item);*/
        }, this);
        if (!onConstructionSprite)
        {
            this.input.onDown.remove(this.showBuildingMenu, this);
            pointer.position.copyTo(this.nextBuildPos);
            this.buildingMenu.x = pointer.position.x;
            this.buildingMenu.y = pointer.position.y;
            this.buildingMenu.alpha = 1;
            var closeToConstructions = this.checkClose(pointer.position)
            if (this.game.constructionReady && this.currentTimeOfDay==='day' && !closeToConstructions) {
                this.constructionStatusText.setText('Ready for construction');
                this.spBut.inputEnabled = true;
                this.sbBut.inputEnabled = true;
                this.towBut.inputEnabled = true;
            } else if (!this.game.constructionReady) {
                this.constructionStatusText.setText('Ongoing construction\nyou can`t build\nclick to try again');
            } else if (this.currentTimeOfDay==='night') {
                this.constructionStatusText.setText('You can not build\nat night');
            } else if (closeToConstructions) {
                this.constructionStatusText.setText('Too close to buildings\nyou can`t build');
            }
            
            this.input.onDown.add(this.buildingMenuClick, this);
        }        
    },

    checkClose: function(pos){
        var posX = pos.x;
        var posY = pos.y;
        var close = false;
        this.towersSprites.forEach(function(item){
            var intersect = false;
            if ((Math.abs(posX - item.x)<43) && (Math.abs(posY - item.y)<43))
            {
                intersect = true;
            }
            close = (close || intersect);            
        }, this);
        this.eatableConstructions.forEach(function(item){
            var intersect = false;
            if ((Math.abs(posX - item.x)<(43/2 + item.width/2)) && (Math.abs(posY - item.y)<(43/2 + item.height/2)))
            {
                intersect = true;
            }
            close = (close || intersect);            
        }, this);
        return close;
    },

    buildingMenuClick: function(pointer){
        /*console.log('x left '+this.buildingMenu.x);
        console.log('x right '+(this.buildingMenu.x+ this.buildingMenuSub.width));
        console.log('y top '+this.buildingMenu.y);
        console.log('y bottom '+(this.buildingMenu.y + this.buildingMenuSub.height));
        console.log('pointer x ' + pointer.position.x);
        console.log('pointer y ' + pointer.position.y);*/
        if ((pointer.position.x > this.buildingMenu.x) && (pointer.position.x < this.buildingMenu.x + this.buildingMenuSub.width) &&
                    (pointer.position.y > this.buildingMenu.y) && (pointer.position.y< this.buildingMenu.y + this.buildingMenuSub.height)){
            //this.input.onDown.addOnce(this.buildingMenuClick, this);
            //console.log('inside');
        } else {
            this.hideBuildingMenu();
            this.input.onDown.add(this.showBuildingMenu, this);
            ///console.log('outside');
        }
    },

    hideBuildingMenu: function(){
        this.buildingMenu.alpha = 0;
        this.spBut.inputEnabled = false;
        this.sbBut.inputEnabled = false;
        this.towBut.inputEnabled = false;
    },

    buildSolarPanel: function(){
        this.hideBuildingMenu();
        this.addConstruction(this.nextBuildPos, 'solarPanel');
    },

    buildSolarBattery: function(){
        this.hideBuildingMenu();
        this.addConstruction(this.nextBuildPos, 'solarBattery');  
    },

    buildTower: function(){
        this.hideBuildingMenu();
        this.addConstruction(this.nextBuildPos, 'tower');
    },

    buildTorch: function(){
        this.hideBuildingMenu();
        this.addConstruction(this.nextBuildPos, 'torch');  
    },

    addConstruction: function(pos, type) {
        this.input.onDown.add(this.showBuildingMenu, this);
        if (type === 'tower') {
            var construction = new Tower(pos, this.game, this.shots);
            construction.create();
            this.physics.arcade.enable(construction.sprite, Phaser.Physics.ARCADE);
            construction.sprite.body.allowRotation = false;
            this.towersSprites.add(construction.sprite);
            this.towers.push(construction);
            this.shadows.add(construction.shadow);
        } else if (type === 'solarPanel') {
            var construction = new SolarPanel(pos, this.game);
            construction.create();
            this.physics.arcade.enable(construction.sprite, Phaser.Physics.ARCADE);
            construction.sprite.body.allowRotation = false;
            this.eatableConstructions.add(construction.sprite);
            this.shadows.add(construction.shadow);
        } else if (type === 'solarBattery'){
            var construction = new SolarBattery(pos, this.game);
            construction.create();
            this.physics.arcade.enable(construction.sprite, Phaser.Physics.ARCADE);
            construction.sprite.body.allowRotation = false;
            this.eatableConstructions.add(construction.sprite);
            this.shadows.add(construction.shadow);
        } else if (type === 'torch') {

        }

        this.buildSound.play();
        
    },

    addBackgroundBug: function(){
        this.addBug();
        this.spawnTime *= 0.99;
        var randomSpawnTime = this.rnd.integerInRange(1000, Math.round(this.spawnTime));
        this.time.events.add(randomSpawnTime, this.addBackgroundBug, this);
    },

    addBugWave: function(number){
        for (var i =0; i<number; i++) {
            this.time.events.add(i*100, this.addBug, this);
        }
    },

    addBug: function() {
        var side = this.rnd.integerInRange(1, 4);
        var newBugPos = new Phaser.Point(20, 20);
        switch(side){
            case 1:
                newBugPos.x = this.game.width - 20;
                newBugPos.y = this.rnd.integerInRange(20, this.game.height - 20);
                break;
            case 2:
                newBugPos.x = this.rnd.integerInRange(20, this.game.width - 20);
                newBugPos.y = 20;
                break;
            case 3:
                newBugPos.x = 20;
                newBugPos.y = this.rnd.integerInRange(20, this.game.height - 20);
                break;
            case 4:
                newBugPos.x = this.rnd.integerInRange(20, this.game.width - 20);;
                newBugPos.y = this.game.height - 20;
                break;
        }
        var bug = new SpaceBug(newBugPos, this.game);
        bug.create();
        this.physics.arcade.enable(bug.sprite, Phaser.Physics.ARCADE);
        bug.sprite.body.allowRotation = false;
        this.setPath(bug.sprite);        
        this.bugs.add(bug.sprite);
        
    },

    damageConstruction: function(buildingSprite, bugSprite) {
        //console.log(bugSprite);
        if (!bugSprite.inBounce && !buildingSprite.big.underConstruction)
        {
            this.bugAttackSound.play();
            bugSprite.inBounce = true;
            buildingSprite.damage(bugSprite.attackForce);
            if (!buildingSprite.alive){
                this.explosionSound.play();
            }
            var xBugBounce = bugSprite.x - bugSprite.body.velocity.x; 
            var yBugBounce = bugSprite.y - bugSprite.body.velocity.y;
            var bugBounceTween = this.add.tween(bugSprite).to({x: xBugBounce, y: yBugBounce}, 1000, Phaser.Easing.Linear.None, true);
            bugBounceTween.onComplete.add(this.setPath, this, 0, bugSprite);
            //console.log(buildingSprite.health);
        }        
    },

    damageBug: function(bugSprite, shotSprite) {
        this.bugDeadSound.play();
        bugSprite.damage(shotSprite.attackForce);
        shotSprite.kill();
    },

    setPath: function(bugSprite) {
        //console.log(bugSprite);
        bugSprite.rotation = this.physics.arcade.moveToObject(bugSprite, this.station, 40);        
        if (bugSprite.inBounce) {
            //console.log(bugSprite.inBounce);
            bugSprite.inBounce=false;
        }
                
    },

};

function SolarStation(position, game){
    this.image = 'station';
    this.x = position.x;
    this.y = position.y;
    this.position = new Phaser.Point(this.x, this.y);
    this.factory = game.add;
    this.game = game;
    this.time = game.time;
    this.health = 100;
    this.capacity = 0;
    this.consumption = 0.2;
    this.production = 0;
    this.constructionTime = 0;
    this.__proto__ = ConstructionBehavior;  
};

function Tower(position, game, shotsGroup){
    this.image = 'tower';
    this.x = position.x;
    this.y = position.y;
    this.position = new Phaser.Point(this.x, this.y);
    this.factory = game.add;
    this.health = 100;
    this.shootRadius = 100;
    this.readyToShoot = true;
    this.timeToReload = 1000;
    this.game = game;
    this.time = game.time;
    this.physics = game.physics.arcade;
    this.shotsGroup = shotsGroup;
    this.capacity = 0;
    this.consumption = 0.1;
    this.production = 0;
    this.constructionTime = 3000;
    this.__proto__ = ConstructionBehavior;

    this.shoot = function(aimsGroup){
        //console.log(this.readyToShoot);
        var aim = this.findAim(aimsGroup);
        //console.log('find aim '+aim);
        if (aim!=null)
        {
            this.game.shootSound.play();
            var shot = new Shot(new Phaser.Point(this.x, this.y), this.game);
            shot.create();
            //console.log(this.physics);
            this.physics.enable(shot.sprite, Phaser.Physics.ARCADE);
            shot.sprite.body.allowRotation = false;
            shot.sprite.rotation = this.physics.moveToObject(shot.sprite, aim, 150);
            this.shotsGroup.add(shot.sprite);

            this.readyToShoot = false;
            this.time.events.add(this.timeToReload, this.reload, this);
            //console.log('aim position '+aim.position);
            //console.log('this position '+this.position);
        }        
    };

    this.findAim = function(aimsGroup){
        if (this.readyToShoot && this.active)
        {
            if (aimsGroup.children.length > 0)
            {
                var aims = aimsGroup.children.slice();
                var towerPos = new Phaser.Point(this.x, this.y);
                aims.sort(function(a, b){
                    var aDist = towerPos.distance(a.position);
                    var bDist = towerPos.distance(b.position);
                    return aDist-bDist;
                });
                //console.log(aims);
                if ((this.position.distance(aims[0].position)) < this.shootRadius)
                {
                    //console.log(aims[0]);
                    return aims[0];
                } else {
                    return null;
                }
            }
        } else {
            return null;
        }
    };

    this.reload = function(){
        //console.log('reload call');
        this.readyToShoot = true;
    }
};

function SolarPanel(position, game){
    this.image = 'solarPanel';
    this.x = position.x;
    this.y = position.y;
    this.position = new Phaser.Point(this.x, this.y);
    this.factory = game.add;
    this.game = game;
    this.time = game.time;
    this.health = 50;
    this.capacity = 0;
    this.consumption = 0;
    this.production = 0.1;
    this.constructionTime = 3000;
    this.__proto__ = ConstructionBehavior;  
};

function SolarBattery(position, game){
    this.image = 'solarBattery';
    this.x = position.x;
    this.y = position.y;
    this.position = new Phaser.Point(this.x, this.y);
    this.factory = game.add;
    this.game = game;
    this.time = game.time;
    this.health = 50;
    this.capacity = 10;
    this.consumption = 0;
    this.production = 0;
    this.constructionTime = 5000;
    this.__proto__ = ConstructionBehavior;  
};

ConstructionBehavior = {

    create: function() {

        this.sprite = this.factory.sprite(this.x, this.y, this.image);
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.sprite.alpha = 0.5;
        this.sprite.health = this.health;
        this.sprite.big = this;
        this.active = false;
        this.forciblyDeactivated = false;
        if (this.image === 'tower'){
            this.sprite.inputEnabled = true;
            this.sprite.events.onInputUp.add(this.changeActivityStatus, this);
        }
        this.underConstruction = true;
        this.sprite.events.onAddedToGroup.add(this.changeTintOfNew, this);
        this.sprite.events.onKilled.add(this.destroy, this);

        this.shadow = this.factory.sprite(this.x, this.y, this.image);
        this.shadow.anchor.x = 0.4;
        this.shadow.anchor.y = 0.4;
        this.shadow.tint = 0x000000;
        this.shadow.alpha = 0.5;
        this.construct();
    },

    construct: function() {
        //console.log('construction start for '+this.constructionTime);
        this.time.events.add(this.constructionTime, this.endOfConstruction, this);
        this.game.constructionReady = false;
    },

    endOfConstruction: function() {
        //console.log('construction end');
        this.game.constructionReady = true;
        this.underConstruction = false;
        this.activate();
    },

    activate: function() {
        //console.log('building activated');
        this.sprite.alpha = 1;
        this.active = true;
        this.game.energyBalance.consumption += this.consumption;
        this.game.energyBalance.production += this.production;
        this.game.energyBalance.capacity += this.capacity;
    },

    deactivate: function() {
        this.active = false;
        this.sprite.alpha = 0.5;
        this.game.energyBalance.consumption -= this.consumption;
        this.game.energyBalance.production -= this.production;
        this.game.energyBalance.capacity -= this.capacity;  
    },

    changeActivityStatus: function(){
        //console.log('active before change '+this.active);
        //console.log('FD before change '+this.forciblyDeactivated);
        if (!this.underConstruction)
        {
            if (this.active) {
                this.deactivate()
            } else {
                if (this.forciblyDeactivated){
                    this.forciblyDeactivated = false;
                } else {
                    this.activate();
                }
            }
        }
        //console.log('active after change '+this.active);
        //console.log('FD after change '+this.forciblyDeactivated);
    },


    changeTintOfNew: function(){
        this.sprite.tint = this.game.currentTint;
        //console.log('tint of new called');
    },

    destroy: function() {
        this.deactivate()
        this.shadow.destroy();
        this.image = null;
        this.x = null;
        this.y = null;
        this.position = null;
        this.factory = null;
        this.game = null;
        this.health = null;
        this.capacity = null;
        this.consumption = null;
        this.production = null;
        this.__proto__ = null;
    }
};

function SpaceBug(position, game){
    this.image = 'bug';
    this.x = position.x;
    this.y = position.y;
    this.position = new Phaser.Point(this.x, this.y);
    this.factory = game.add;
    this.game = game;
    this.__proto__ = CreaturesBehavior;
    this.attackForce = 10;
    this.health = 10;
};

function Shot(position, game){
    this.image = 'shot';
    this.x = position.x;
    this.y = position.y;
    this.position = new Phaser.Point(this.x, this.y);
    this.factory = game.add;
    this.game = game;
    this.__proto__ = CreaturesBehavior;
    this.attackForce = 10;
    this.health = 10;
};

CreaturesBehavior = {

    create: function() {
        this.sprite = this.factory.sprite(this.x, this.y, this.image);
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.sprite.health = this.health;
        this.sprite.attackForce = this.attackForce;
        this.sprite.inBounce = false;
        this.sprite.big = this;
        this.sprite.checkWorldBounds = true;
        this.sprite.events.onOutOfBounds.add(this.crossBounds, this);
        this.sprite.events.onAddedToGroup.add(this.changeTintOfNew, this);
    },

    changeTintOfNew: function(){
        this.sprite.tint = this.game.currentTint;
        //console.log('tint of new called');
    },

    crossBounds: function(){
        this.sprite.destroy();
        //console.log('out of bounds');
    }
}
