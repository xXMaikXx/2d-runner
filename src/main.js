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

    this.jumpCount = 0;
    this.maxJumps = 2;

    this.playerName = '';
    this.isEnteringName = false;

    this.playerWidth = 50;
    this.playerNormalHeight = 50;
    this.playerDuckHeight = 25;
    this.isDucking = false;
    this.moveSpeed = 260;

    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;

    this.ground = this.add.rectangle(gameWidth / 2, gameHeight - 40, gameWidth, 80, 0x444444);
    this.physics.add.existing(this.ground, true);

    this.player = this.add.rectangle(120, gameHeight - 120, this.playerWidth, this.playerNormalHeight, 0x00ff00);
    this.physics.add.existing(this.player);

    this.player.body.setGravityY(800);
    this.player.body.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, this.ground);

    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

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

    this.controlsText = this.add.text(20, 55, 'W/Space = Springen | A/D = Bewegen | S = Ducken', {
      fontSize: '16px',
      color: '#ffffff'
    });

    this.highscoreText = this.add.text(gameWidth - 220, 20, '', {
      fontSize: '18px',
      color: '#ffffff'
    });

    this.updateHighscoreDisplay();
  }

  update(time, delta) {
    if (this.isGameOver) {
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        this.scene.restart();
      }
      return;
    }

    if (this.player.body.blocked.down) {
      this.jumpCount = 0;
    }

    this.score += delta * 0.01;
    this.scoreText.setText('Score: ' + Math.floor(this.score));

    this.gameSpeed += 0.002;

    this.handlePlayerMovement();
    this.handlePlayerDuck();
    this.handlePlayerJump();

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];

      obstacle.x -= this.gameSpeed;
      obstacle.body.updateFromGameObject();

      if (obstacle.x < -80) {
        obstacle.destroy();
        this.obstacles.splice(i, 1);
      }
    }
  }

  handlePlayerMovement() {
    if (this.aKey.isDown) {
      this.player.body.setVelocityX(-this.moveSpeed);
    } else if (this.dKey.isDown) {
      this.player.body.setVelocityX(this.moveSpeed);
    } else {
      this.player.body.setVelocityX(0);
    }
  }

  handlePlayerJump() {
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
      Phaser.Input.Keyboard.JustDown(this.wKey);

    if (jumpPressed && this.jumpCount < this.maxJumps) {
      if (this.isDucking) {
        this.setPlayerDuck(false);
      }

      const jumpPower = this.jumpCount === 0 ? -450 : -350;
      this.player.body.setVelocityY(jumpPower);
      this.jumpCount++;
    }
  }

  handlePlayerDuck() {
    const shouldDuck = this.sKey.isDown && this.player.body.blocked.down;

    if (shouldDuck && !this.isDucking) {
      this.setPlayerDuck(true);
    }

    if (!shouldDuck && this.isDucking) {
      this.setPlayerDuck(false);
    }
  }

  setPlayerDuck(duck) {
    const gameHeight = this.scale.height;
    const groundTop = gameHeight - 80;

    this.isDucking = duck;

    const newHeight = duck ? this.playerDuckHeight : this.playerNormalHeight;

    this.player.height = newHeight;
    this.player.setDisplaySize(this.playerWidth, newHeight);
    this.player.body.setSize(this.playerWidth, newHeight, true);

    this.player.y = groundTop - newHeight / 2;
    this.player.body.updateFromGameObject();
  }

  spawnObstacle() {
    if (this.isGameOver) return;

    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;

    const isBig = Phaser.Math.Between(0, 1);

    const height = isBig ? 120 : 60;
    const y = isBig ? gameHeight - 160 : gameHeight - 100;
    const color = isBig ? 0xff0000 : 0x00ffff;

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

    this.add.text(gameWidth / 2 - 150, 100, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000'
    });

    this.add.text(gameWidth / 2 - 120, 180, 'Name eingeben:', {
      fontSize: '24px',
      color: '#ffffff'
    });

    this.nameText = this.add.text(gameWidth / 2 - 120, 220, '', {
      fontSize: '28px',
      color: '#ffff00'
    });

    this.add.text(gameWidth / 2 - 120, 260, 'ENTER = speichern | R = Neustart', {
      fontSize: '18px',
      color: '#ffffff'
    });

    this.isEnteringName = true;

    this.input.keyboard.on('keydown', (event) => {
      if (!this.isEnteringName) return;

      if (event.key === 'Backspace') {
        this.playerName = this.playerName.slice(0, -1);
      } else if (event.key === 'Enter') {
        this.saveHighscore();
      } else if (event.key.length === 1 && this.playerName.length < 10) {
        this.playerName += event.key;
      }

      this.nameText.setText(this.playerName);
    });
  }

  saveHighscore() {
    const name = this.playerName || 'Spieler';
    const score = Math.floor(this.score);

    let scores = JSON.parse(localStorage.getItem('scores')) || [];

    scores.push({ name, score });
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 10);

    localStorage.setItem('scores', JSON.stringify(scores));

    this.isEnteringName = false;
    this.updateHighscoreDisplay();

    this.add.text(this.scale.width / 2 - 120, 310, 'Gespeichert! Drücke R', {
      fontSize: '24px',
      color: '#00ff00'
    });
  }

  updateHighscoreDisplay() {
    let scores = JSON.parse(localStorage.getItem('scores')) || [];

    if (scores.length === 0) {
      this.highscoreText.setText('Top 3\nKeine Scores');
      return;
    }

    const top3 = scores
      .slice(0, 3)
      .map((s, i) => `${i + 1}. ${s.name} - ${s.score}`)
      .join('\n');

    this.highscoreText.setText('Top 3\n' + top3);
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'app',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.RESIZE
  },
  physics: {
    default: 'arcade'
  },
  scene: [GameScene]
};

new Phaser.Game(config);