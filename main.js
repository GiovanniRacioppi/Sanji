const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  this.load.image('logo', 'assets/logo.png');
}

function create() {
  this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'logo');
}

const game = new Phaser.Game(config);
