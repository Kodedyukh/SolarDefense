
BasicGame.MainMenu = function (game) {

	this.music = null;
	this.playButton = null;

};

BasicGame.MainMenu.prototype = {

	create: function () {

		
		this.buttonSound = this.add.audio('button');

		this.add.sprite(0, 0, 'titlepage');

		this.playButton = this.add.button(400, 600, 'playButton', this.startGame, this, 'out', 'out', 'down', 'out');

		this.logo = this.add.sprite(512, 230, 'logo');
		this.logo.anchor.x = 0.5;
		this.logo.anchor.y = 0;

	},


	startGame: function (pointer) {

		
		this.buttonSound.play();

		
		this.state.start('Game');

	}

};
