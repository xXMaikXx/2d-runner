import * as Phaser from 'phaser';

document.querySelector('#app').innerHTML = '';

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.isGameOver = false;
    this.score = 0;
    this.gameSpeed = 4;
    this.spawnDelay = 1500;
    this.hasSavedScore = false;

    this.jumpCount = 0;
    this.maxJumps = 2;

    this.createHtmlUi();

    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const groundHeight = 80;
    const groundY = gameHeight - groundHeight / 2;

    // Boden
    this.ground = this.add.rectangle(gameWidth / 2, groundY, gameWidth, groundHeight, 0x444444);
    this.physics.add.existing(this.ground, true);

    // Spieler
    this.player = this.add.rectangle(120, gameHeight - groundHeight - 25, 50, 50, 0x00ff00);
    this.physics.add.existing(this.player);

    this.player.body.setCollideWorldBounds(true);
    this.player.body.setGravityY(800);

    this.physics.add.collider(this.player, this.ground);

    // Tasten
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // Hindernisse
    this.obstacles = [];

    this.spawnEvent = this.time.addEvent({
      delay: this.spawnDelay,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });

    this.bestScoreText = this.add.text(20, 55, 'Bester Score: 0', {
      fontSize: '20px',
      color: '#ffff00'
    });

    this.highscoreTitle = this.add.text(gameWidth - 190, 20, 'Top 3', {
      fontSize: '24px',
      color: '#ffffff'
    });

    this.highscoreText = this.add.text(gameWidth - 190, 55, '', {
      fontSize: '18px',
      color: '#ffffff',
      lineSpacing: 6
    });

    this.updateHighscoreDisplay();

    this.scale.on('resize', this.handleResize, this);
  }

  update(time, delta) {
    if (this.isGameOver && Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.hideSaveUi();
      this.scene.restart();
    }

    if (this.isGameOver) return;

    // Jump Reset
    if (this.player.body.blocked.down) {
      this.jumpCount = 0;
    }

    this.score += delta * 0.01;
    this.scoreText.setText('Score: ' + Math.floor(this.score));

    this.gameSpeed += 0.002;
    this.spawnDelay -= 0.05;

    if (this.spawnDelay < 600) {
      this.spawnDelay = 600;
    }

    this.spawnEvent.delay = this.spawnDelay;

    // Double Jump
    if (
      Phaser.Input.Keyboard.JustDown(this.spaceKey) &&
      this.jumpCount < this.maxJumps
    ) {
      const jumpPower = this.jumpCount === 0 ? -450 : -350;
      this.player.body.setVelocityY(jumpPower);
      this.jumpCount++;
    }

    // Hindernisse bewegen
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];

      obstacle.x -= this.gameSpeed;
      obstacle.body.updateFromGameObject();

      if (obstacle.x < -50) {
        obstacle.destroy();
        this.obstacles.splice(i, 1);
      }
    }
  }

  // 🚀 NEU: verschiedene Hindernisse
  spawnObstacle() {
    if (this.isGameOver) return;

    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;

    const type = Phaser.Math.Between(0, 1);

    let height;
    let y;
    let color;

    if (type === 0) {
      // kleines Hindernis
      height = 60;
      y = gameHeight - 100;
      color = 0x00ffff;
    } else {
      // grosses Hindernis
      height = 120;
      y = gameHeight - 160;
      color = 0xff0000;
    }

    const obstacle = this.add.rectangle(gameWidth + 30, y, 40, height, color);

    this.physics.add.existing(obstacle);

    obstacle.body.setAllowGravity(false);
    obstacle.body.setImmovable(true);

    this.obstacles.push(obstacle);

    this.physics.add.collider(this.player, obstacle, this.gameOver, null, this);
  }

  gameOver() {
    if (this.isGameOver) return;

    this.isGameOver = true;
    this.player.body.setVelocity(0, 0);

    const gameWidth = this.scale.width;

    this.add.text(gameWidth / 2 - 180, 120, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000'
    });

    this.add.text(gameWidth / 2 - 200, 180, 'Drücke R zum Neustarten', {
      fontSize: '20px',
      color: '#ffffff'
    });

    this.add.text(gameWidth / 2 - 160, 220, 'Dein Score: ' + Math.floor(this.score), {
      fontSize: '24px',
      color: '#ffffff'
    });

    this.showSaveUi();
  }

  handleResize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;
    const groundHeight = 80;
    const groundY = height - groundHeight / 2;

    this.ground.setPosition(width / 2, groundY);
    this.ground.width = width;
    this.ground.height = groundHeight;
    this.ground.body.updateFromGameObject();

    this.scoreText.setPosition(20, 20);
    this.bestScoreText.setPosition(20, 55);
    this.highscoreTitle.setPosition(width - 190, 20);
    this.highscoreText.setPosition(width - 190, 55);
  }

  createHtmlUi() {}
  showSaveUi() {}
  hideSaveUi() {}
  saveHighscore() {}
  getHighscores() {}
  updateHighscoreDisplay() {}
  getTop10Lines() {}
}

const config = {
  type: Phaser.AUTO,
  parent: 'app',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [GameScene]
};

new Phaser.Game(config);