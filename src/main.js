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

    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;

    // Boden
    this.ground = this.add.rectangle(gameWidth / 2, gameHeight - 40, gameWidth, 80, 0x444444);
    this.physics.add.existing(this.ground, true);

    // Spieler
    this.player = this.add.rectangle(120, gameHeight - 120, 50, 50, 0x00ff00);
    this.physics.add.existing(this.player);

    this.player.body.setGravityY(800);
    this.player.body.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, this.ground);

    // Input
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

    // UI
    this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '24px' });

    this.highscoreText = this.add.text(gameWidth - 200, 20, '', {
      fontSize: '18px'
    });

    this.updateHighscoreDisplay();

    // Tastatur für Name
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

    if (
      Phaser.Input.Keyboard.JustDown(this.spaceKey) &&
      this.jumpCount < this.maxJumps
    ) {
      this.player.body.setVelocityY(this.jumpCount === 0 ? -450 : -350);
      this.jumpCount++;
    }

    for (let obstacle of this.obstacles) {
      obstacle.x -= this.gameSpeed;
      obstacle.body.updateFromGameObject();
    }
  }

  spawnObstacle() {
    if (this.isGameOver) return;

    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;

    const isBig = Phaser.Math.Between(0, 1);

    let height = isBig ? 120 : 60;
    let y = isBig ? gameHeight - 160 : gameHeight - 100;

    const obstacle = this.add.rectangle(gameWidth + 30, y, 40, height, 0xff0000);
    this.physics.add.existing(obstacle);
    obstacle.body.setAllowGravity(false);

    this.obstacles.push(obstacle);

    this.physics.add.collider(this.player, obstacle, this.gameOver, null, this);
  }

  gameOver() {
    this.isGameOver = true;

    const gameWidth = this.scale.width;

    this.add.text(gameWidth / 2 - 150, 100, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000'
    });

    this.add.text(gameWidth / 2 - 120, 180, 'Name eingeben:', {
      fontSize: '24px'
    });

    this.nameText = this.add.text(gameWidth / 2 - 120, 220, '', {
      fontSize: '28px',
      color: '#ffff00'
    });

    this.isEnteringName = true;
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

    this.add.text(200, 300, 'Gespeichert! Drücke R', {
      fontSize: '24px'
    });
  }

  updateHighscoreDisplay() {
    let scores = JSON.parse(localStorage.getItem('scores')) || [];

    if (scores.length === 0) {
      this.highscoreText.setText('Keine Scores');
      return;
    }

    const top3 = scores.slice(0, 3)
      .map((s, i) => `${i + 1}. ${s.name} - ${s.score}`)
      .join('\n');

    this.highscoreText.setText(top3);
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