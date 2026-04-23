import * as Phaser from 'phaser';

document.querySelector('#app').innerHTML = '';

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.physics.world.setBounds(0, 0, 800, 600);

    this.isGameOver = false;
    this.score = 0;
    this.gameSpeed = 4;
    this.spawnDelay = 1500;
    this.hasSavedScore = false;

    this.createHtmlUi();

    // Boden
    this.ground = this.add.rectangle(400, 560, 800, 80, 0x444444);
    this.physics.add.existing(this.ground, true);

    // Spieler
    this.player = this.add.rectangle(120, 460, 50, 50, 0x00ff00);
    this.physics.add.existing(this.player);

    this.player.body.setCollideWorldBounds(true);
    this.player.body.setGravityY(800);

    this.physics.add.collider(this.player, this.ground);

    // Tasten
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    this.restartKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.R
    );

    // Hindernisse
    this.obstacles = [];

    this.spawnEvent = this.time.addEvent({
      delay: this.spawnDelay,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // Laufende Anzeige
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });

    this.bestScoreText = this.add.text(20, 55, 'Bester Score: 0', {
      fontSize: '20px',
      color: '#ffff00'
    });

    this.highscoreTitle = this.add.text(610, 20, 'Top 3', {
      fontSize: '24px',
      color: '#ffffff'
    });

    this.highscoreText = this.add.text(610, 55, '', {
      fontSize: '18px',
      color: '#ffffff',
      lineSpacing: 6
    });

    // Game Over Anzeige für Top 10
    this.gameOverTitleText = null;
    this.gameOverRestartText = null;
    this.gameOverScoreText = null;
    this.gameOverTop10Title = null;
    this.gameOverTop10Text = null;

    this.updateHighscoreDisplay();
  }

  update(time, delta) {
    if (this.isGameOver && Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.hideSaveUi();
      this.scene.restart();
    }

    if (this.isGameOver) return;

    // Score
    this.score += delta * 0.01;
    this.scoreText.setText('Score: ' + Math.floor(this.score));

    // Schwierigkeit erhöhen
    this.gameSpeed += 0.002;
    this.spawnDelay -= 0.05;

    if (this.spawnDelay < 600) {
      this.spawnDelay = 600;
    }

    this.spawnEvent.delay = this.spawnDelay;

    // Springen
    if (
      Phaser.Input.Keyboard.JustDown(this.spaceKey) &&
      this.player.body.blocked.down
    ) {
      this.player.body.setVelocityY(-450);
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

  spawnObstacle() {
    if (this.isGameOver) return;

    const obstacle = this.add.rectangle(830, 500, 40, 60, 0xff0000);
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

    this.gameOverTitleText = this.add.text(220, 120, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000'
    });

    this.gameOverRestartText = this.add.text(200, 180, 'Drücke R zum Neustarten', {
      fontSize: '20px',
      color: '#ffffff'
    });

    this.gameOverScoreText = this.add.text(240, 220, 'Dein Score: ' + Math.floor(this.score), {
      fontSize: '24px',
      color: '#ffffff'
    });

    const top10Lines = this.getTop10Lines();

    this.gameOverTop10Title = this.add.text(230, 280, 'Top 10 Highscores', {
      fontSize: '28px',
      color: '#ffff00'
    });

    this.gameOverTop10Text = this.add.text(230, 325, top10Lines, {
      fontSize: '20px',
      color: '#ffffff',
      lineSpacing: 8
    });

    this.showSaveUi();
  }

  createHtmlUi() {
    this.nameInput = document.createElement('input');
    this.nameInput.type = 'text';
    this.nameInput.placeholder = 'Dein Name';
    this.nameInput.maxLength = 15;

    this.saveButton = document.createElement('button');
    this.saveButton.textContent = 'Score speichern';

    this.messageBox = document.createElement('div');

    const commonStyle = {
      position: 'absolute',
      left: '20px',
      zIndex: '1000',
      padding: '8px',
      fontSize: '16px'
    };

    Object.assign(this.nameInput.style, commonStyle, {
      top: '620px',
      width: '180px',
      display: 'none'
    });

    Object.assign(this.saveButton.style, commonStyle, {
      top: '620px',
      left: '220px',
      cursor: 'pointer',
      display: 'none'
    });

    Object.assign(this.messageBox.style, {
      position: 'absolute',
      top: '660px',
      left: '20px',
      color: 'white',
      fontSize: '16px',
      zIndex: '1000',
      display: 'none'
    });

    document.body.appendChild(this.nameInput);
    document.body.appendChild(this.saveButton);
    document.body.appendChild(this.messageBox);

    this.saveButton.onclick = () => {
      this.saveHighscore();
    };
  }

  showSaveUi() {
    this.nameInput.style.display = 'block';
    this.saveButton.style.display = 'block';
    this.messageBox.style.display = 'block';
    this.messageBox.textContent = 'Name eingeben und Score speichern';
    this.nameInput.focus();
  }

  hideSaveUi() {
    this.nameInput.style.display = 'none';
    this.saveButton.style.display = 'none';
    this.messageBox.style.display = 'none';
    this.messageBox.textContent = '';
    this.nameInput.value = '';
    this.hasSavedScore = false;
  }

  saveHighscore() {
    if (this.hasSavedScore) {
      this.messageBox.textContent = 'Score wurde bereits gespeichert';
      return;
    }

    const playerName = this.nameInput.value.trim() || 'Spieler';
    const scoreValue = Math.floor(this.score);

    const highscores = this.getHighscores();

    highscores.push({
      name: playerName,
      score: scoreValue
    });

    highscores.sort((a, b) => b.score - a.score);

    const topTen = highscores.slice(0, 10);

    localStorage.setItem('runnerHighscores', JSON.stringify(topTen));

    this.hasSavedScore = true;
    this.messageBox.textContent = 'Score gespeichert';

    this.updateHighscoreDisplay();

    if (this.gameOverTop10Text) {
      this.gameOverTop10Text.setText(this.getTop10Lines());
    }
  }

  getHighscores() {
    const saved = localStorage.getItem('runnerHighscores');

    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved);
    } catch (error) {
      return [];
    }
  }

  updateHighscoreDisplay() {
    const highscores = this.getHighscores();

    if (highscores.length === 0) {
      this.highscoreText.setText('Noch keine\nEinträge');
      this.bestScoreText.setText('Bester Score: 0');
      return;
    }

    const topThree = highscores.slice(0, 3);

    const lines = topThree.map((entry, index) => {
      return `${index + 1}. ${entry.name} - ${entry.score}`;
    });

    this.highscoreText.setText(lines.join('\n'));
    this.bestScoreText.setText('Bester Score: ' + highscores[0].score);
  }

  getTop10Lines() {
    const highscores = this.getHighscores();

    if (highscores.length === 0) {
      return 'Noch keine Einträge';
    }

    const topTen = highscores.slice(0, 10);

    return topTen
      .map((entry, index) => `${index + 1}. ${entry.name} - ${entry.score}`)
      .join('\n');
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [GameScene]
};

new Phaser.Game(config);