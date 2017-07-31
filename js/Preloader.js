
BasicGame.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;

	this.ready = false;

};

BasicGame.Preloader.prototype = {

	preload: function () {

		
		this.background = this.add.sprite(512, 200, 'preloaderBackground');
		this.background.anchor.x = 0.5;
		this.background.anchor.y = 0.5;
		this.preloadBar = this.add.sprite(512 - this.cache.getImage('preloaderBar').width / 2, 500, 'preloaderBar');
		this.preloadBar.anchor.x = 0;
		this.preloadBar.anchor.y = 1;

		
		this.load.setPreloadSprite(this.preloadBar);

		
		this.load.image('titlepage', 'assets/images/background.png');
		this.load.image('logo', 'assets/images/logo.png');
		this.load.image('station', 'assets/images/solar.png');
		this.load.image('solarPanel', 'assets/images/solarPanel.png');
		this.load.image('solarBattery', 'assets/images/solarBattery.png');
		this.load.image('bug', 'assets/images/bug.png');
		this.load.image('tower', 'assets/images/tower.png');
		this.load.image('shot', 'assets/images/shot.png');
		this.load.image('background', 'assets/images/background.png');
		this.load.image('buildingPanel', 'assets/images/buildingPanel.png');
		this.load.image('finalLabel', 'assets/images/finalLabel.png');
		this.load.image('winLabel', 'assets/images/winLabel.png');
		this.load.image('instructions', 'assets/images/instructions.png');
		this.load.atlas('playButton', 'assets/images/startBut.png', 'assets/images/startBut.json');
		this.load.atlas('spButton', 'assets/images/spBut.png', 'assets/images/spBut.json');
		this.load.atlas('sbButton', 'assets/images/sbBut.png', 'assets/images/sbBut.json');
		this.load.atlas('towButton', 'assets/images/towBut.png', 'assets/images/towBut.json');
		this.load.atlas('torButton', 'assets/images/torBut.png', 'assets/images/torBut.json');
		this.load.atlas('restartButton', 'assets/images/restartBut.png', 'assets/images/restartBut.json');
		
		this.load.bitmapFont('energyFont', 'assets/fonts/EnergyFontDark.png', 'assets/fonts/EnergyFontDark.fnt');
		this.load.audio('shoot', ['assets/music/effects/shoot.wav']);
		this.load.audio('build', ['assets/music/effects/constructionStart.wav']);
		this.load.audio('bugAttack', ['assets/music/effects/bugAttack.wav']);
		this.load.audio('bugDead', ['assets/music/effects/bugDead.wav']);
		this.load.audio('button', ['assets/music/effects/button.wav']);
		this.load.audio('explosion', ['assets/music/effects/explosion.wav']);

	},

	create: function () {

		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
		this.preloadBar.cropEnabled = false;

	},

	update: function () {

		
		
		if (this.cache.isSoundDecoded('build') && this.cache.isSoundDecoded('shoot') && this.cache.isSoundDecoded('bugAttack') && 
			this.cache.isSoundDecoded('bugDead') && this.cache.isSoundDecoded('button') && this.cache.isSoundDecoded('explosion') && this.ready == false)
		{
			this.ready = true;
			this.state.start('MainMenu');
		}

	}

};
