import * as Phaser from 'phaser';

document.querySelector('#app').innerHTML = '';

const userAgent = navigator.userAgent.toLowerCase();

const isVsCodePreview =
  userAgent.includes('electron') ||
  userAgent.includes('visual studio code') ||
  userAgent.includes('vscode');

const audioAllowed = !isVsCodePreview;

class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    this.load.image('cyber-bg', 'assets/backgrounds/cyber_city_clean.png');
    this.load.audio('mainmenu-music', 'assets/music/mainmenu.mp3');
  }

  create() {
    this.ensureInitialVolumes();

    this.musicVolume = this.getSavedVolume('musicVolume', 0.2);
    this.sfxVolume = this.getSavedVolume('sfxVolume', 0.5);

    this.stopMenuMusic();

    this.menuMusic = this.sound.add('mainmenu-music', {
      volume: this.musicVolume,
      loop: true
    });

    if (audioAllowed) {
      this.menuMusic.play();
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.stopMenuMusic();
    });

    this.events.once(Phaser.Scenes.Events.DESTROY, () => {
      this.stopMenuMusic();
    });

    this.createBackground();
    this.createMainMenu();
  }

  stopMenuMusic() {
    if (this.menuMusic) {
      if (this.menuMusic.isPlaying || this.menuMusic.isPaused) {
        this.menuMusic.stop();
      }

      this.menuMusic.destroy();
      this.menuMusic = null;
    }
  }

  ensureInitialVolumes() {
    if (localStorage.getItem('volumeSettingsVersion') !== '2') {
      localStorage.setItem('musicVolume', '0.2');
      localStorage.setItem('sfxVolume', '0.5');
      localStorage.setItem('volumeSettingsVersion', '2');
    }
  }

  getSavedVolume(key, fallback) {
    const value = parseFloat(localStorage.getItem(key));
    return Number.isFinite(value) ? value : fallback;
  }

  createBackground() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.bg1 = this.add.image(0, 0, 'cyber-bg');
    this.bg1.setOrigin(0, 0);
    this.bg1.setDisplaySize(width, height);

    this.bg2 = this.add.image(width, 0, 'cyber-bg');
    this.bg2.setOrigin(0, 0);
    this.bg2.setDisplaySize(width, height);

    this.bgSpeed = 0.35;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.45);
  }

  update() {
    this.bg1.x -= this.bgSpeed;
    this.bg2.x -= this.bgSpeed;

    if (this.bg1.x <= -this.scale.width) {
      this.bg1.x = this.bg2.x + this.scale.width;
    }

    if (this.bg2.x <= -this.scale.width) {
      this.bg2.x = this.bg1.x + this.scale.width;
    }
  }

  clearMenu() {
    if (this.menuContainer) {
      this.menuContainer.destroy(true);
    }
  }

  createPanel(title) {
    this.clearMenu();

    const width = this.scale.width;
    const height = this.scale.height;

    this.menuContainer = this.add.container(0, 0);

    const glow = this.add.rectangle(width / 2, height / 2, 640, 640, 0xff00cc, 0.12);

    const panel = this.add.rectangle(width / 2, height / 2, 590, 590, 0x090014, 0.92);
    panel.setStrokeStyle(3, 0xff00cc, 1);

    const innerPanel = this.add.rectangle(width / 2, height / 2, 545, 545, 0x00111a, 0.22);
    innerPanel.setStrokeStyle(1, 0x00ffff, 0.9);

    const titleText = this.add.text(width / 2, height / 2 - 240, title, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '42px',
      color: '#ffffff'
    }).setOrigin(0.5);

    titleText.setShadow(0, 0, '#ff00cc', 18, true, true);

    this.menuContainer.add([glow, panel, innerPanel, titleText]);
  }

  createButton(x, y, text, callback) {
    const button = this.add.text(x, y, text, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#220033',
      padding: {
        x: 24,
        y: 10
      }
    });

    button.setOrigin(0.5);
    button.setInteractive({ useHandCursor: true });
    button.setShadow(0, 0, '#00ffff', 10, true, true);

    button.on('pointerover', () => button.setColor('#00ffff'));
    button.on('pointerout', () => button.setColor('#ffffff'));
    button.on('pointerdown', callback);

    this.menuContainer.add(button);

    return button;
  }

  createMainMenu() {
    this.createPanel('CYBER RUNNER');

    const centerX = this.scale.width / 2;
    const startY = this.scale.height / 2 - 130;

    const buttons = [
      {
        text: 'SPIELEN',
        action: () => {
          this.stopMenuMusic();
          this.sound.stopAll();
          this.scene.start('GameScene');
        }
      },
      { text: 'SPIELEINSTELLUNGEN', action: () => this.openPlaceholderMenu('SPIELEINSTELLUNGEN') },
      { text: 'ANZEIGEEINSTELLUNGEN', action: () => this.openPlaceholderMenu('ANZEIGEEINSTELLUNGEN') },
      { text: 'MUSIKEINSTELLUNGEN', action: () => this.openMusicMenu() },
      { text: 'TASTENBELEGUNG', action: () => this.openKeyMenu() },
      { text: 'HILFE', action: () => this.openHelpMenu() }
    ];

    buttons.forEach((btn, index) => {
      this.createButton(centerX, startY + index * 62, btn.text, btn.action);
    });
  }

  openPlaceholderMenu(title) {
    this.createPanel(title);

    const info = this.add.text(this.scale.width / 2, this.scale.height / 2 - 20, 'DIESES MENUE WIRD SPAETER ERWEITERT', {
      fontFamily: 'Consolas, Courier New, monospace',
      fontSize: '22px',
      color: '#00ffff'
    }).setOrigin(0.5);

    info.setShadow(0, 0, '#00ffff', 10, true, true);
    this.menuContainer.add(info);

    this.createButton(this.scale.width / 2, this.scale.height / 2 + 120, 'ZURUECK', () => this.createMainMenu());
  }

  openKeyMenu() {
    this.createPanel('TASTENBELEGUNG');

    const text = this.add.text(this.scale.width / 2, this.scale.height / 2 - 35, 'W / SPACE = SPRINGEN\nA / D = BEWEGEN\nS = DUCKEN\nESC = PAUSE\nR = NEUSTART NACH GAME OVER', {
      fontFamily: 'Consolas, Courier New, monospace',
      fontSize: '22px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 12
    }).setOrigin(0.5);

    text.setShadow(0, 0, '#00ffff', 10, true, true);
    this.menuContainer.add(text);

    this.createButton(this.scale.width / 2, this.scale.height / 2 + 170, 'ZURUECK', () => this.createMainMenu());
  }

  openHelpMenu() {
    this.createPanel('HILFE');

    const text = this.add.text(this.scale.width / 2, this.scale.height / 2 - 30, 'SPRINGE UEBER LUECKEN UND HINDERNISSE.\nSAMMLE COINS FUER EXTRA-PUNKTE.\nERREICHE DAS ENDE DES SONGS,\nUM DAS LEVEL ABZUSCHLIESSEN.', {
      fontFamily: 'Consolas, Courier New, monospace',
      fontSize: '21px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 12
    }).setOrigin(0.5);

    text.setShadow(0, 0, '#00ffff', 10, true, true);
    this.menuContainer.add(text);

    this.createButton(this.scale.width / 2, this.scale.height / 2 + 180, 'ZURUECK', () => this.createMainMenu());
  }

  openMusicMenu() {
    this.createPanel('MUSIKEINSTELLUNGEN');

    const centerX = this.scale.width / 2;

    const musicText = this.add.text(centerX, this.scale.height / 2 - 105, `MUSIKLAUTSTAERKE: ${Math.round(this.musicVolume * 100)}%`, {
      fontFamily: 'Consolas, Courier New, monospace',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    musicText.setShadow(0, 0, '#ff00cc', 10, true, true);

    const sfxText = this.add.text(centerX, this.scale.height / 2 + 5, `EFFEKTLAUTSTAERKE: ${Math.round(this.sfxVolume * 100)}%`, {
      fontFamily: 'Consolas, Courier New, monospace',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    sfxText.setShadow(0, 0, '#00ffff', 10, true, true);

    this.menuContainer.add([musicText, sfxText]);

    this.createButton(centerX - 135, this.scale.height / 2 - 55, '-', () => {
      this.musicVolume = Math.max(0, Math.round((this.musicVolume - 0.1) * 10) / 10);
      musicText.setText(`MUSIKLAUTSTAERKE: ${Math.round(this.musicVolume * 100)}%`);

      if (this.menuMusic) {
        this.menuMusic.setVolume(this.musicVolume);
      }
    });

    this.createButton(centerX + 135, this.scale.height / 2 - 55, '+', () => {
      this.musicVolume = Math.min(1, Math.round((this.musicVolume + 0.1) * 10) / 10);
      musicText.setText(`MUSIKLAUTSTAERKE: ${Math.round(this.musicVolume * 100)}%`);

      if (this.menuMusic) {
        this.menuMusic.setVolume(this.musicVolume);
      }
    });

    this.createButton(centerX - 135, this.scale.height / 2 + 55, '-', () => {
      this.sfxVolume = Math.max(0, Math.round((this.sfxVolume - 0.1) * 10) / 10);
      sfxText.setText(`EFFEKTLAUTSTAERKE: ${Math.round(this.sfxVolume * 100)}%`);
    });

    this.createButton(centerX + 135, this.scale.height / 2 + 55, '+', () => {
      this.sfxVolume = Math.min(1, Math.round((this.sfxVolume + 0.1) * 10) / 10);
      sfxText.setText(`EFFEKTLAUTSTAERKE: ${Math.round(this.sfxVolume * 100)}%`);
    });

    this.createButton(centerX, this.scale.height / 2 + 155, 'EINSTELLUNGEN SPEICHERN', () => {
      localStorage.setItem('musicVolume', String(this.musicVolume));
      localStorage.setItem('sfxVolume', String(this.sfxVolume));
      localStorage.setItem('volumeSettingsVersion', '2');
    });

    this.createButton(centerX, this.scale.height / 2 + 225, 'ZURUECK', () => this.createMainMenu());
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.spritesheet('player-run-sheet', 'assets/player/Dino_Idle_Animation.png', {
      frameWidth: 384,
      frameHeight: 864
    });

    this.load.image('cyber-bg', 'assets/backgrounds/cyber_city_clean.png');
    this.load.audio('level1-music', 'assets/music/level1.mp3');
    this.load.image('enemy1', 'assets/enemies/enemy1.png');
    this.load.image('goldcoin', 'assets/coins/goldcoin.png');

    for (let i = 1; i <= 10; i++) {
      this.load.image(`cyber-platform-${i}`, `assets/platforms/cyber_platform_${i}.png`);
    }
  }

  create() {
    this.musicVolume = this.getSavedVolume('musicVolume', 0.2);
    this.sfxVolume = this.getSavedVolume('sfxVolume', 0.5);

    this.isGameOver = false;
    this.isPaused = false;
    this.isLevelComplete = false;

    this.score = 0;
    this.gameSpeed = 3;
    this.speedIncrease = 0.00035;

    this.levelDurationMs = 247000;
    this.levelElapsedMs = 0;

    this.jumpCount = 0;
    this.maxJumps = 2;

    this.playerName = '';
    this.isEnteringName = false;
    this.scoreSaved = false;

    this.isDucking = false;
    this.moveSpeed = 260;

    this.worldFallLimit = this.scale.height + 250;

    this.platformVisualHeight = 130;
    this.platformSurfaceOffset = -6;
    this.platformColliderHeight = 18;

    this.enemyMinDistance = 260;

    this.platformKeys = [];

    for (let i = 1; i <= 10; i++) {
      this.platformKeys.push(`cyber-platform-${i}`);
    }

    this.platforms = [];
    this.obstacles = [];
    this.coins = [];

    this.stopLevelMusic();

    this.levelMusic = this.sound.add('level1-music', {
      volume: this.musicVolume,
      loop: false
    });

    if (audioAllowed) {
      this.levelMusic.play();
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.stopLevelMusic();
    });

    this.events.once(Phaser.Scenes.Events.DESTROY, () => {
      this.stopLevelMusic();
    });

    this.drawCyberpunkBackground();

    this.platformGroup = this.physics.add.staticGroup();
    this.createLevelPath();

    this.anims.create({
      key: 'player-run-anim',
      frames: this.anims.generateFrameNumbers('player-run-sheet', {
        start: 0,
        end: 3
      }),
      frameRate: 8,
      repeat: -1
    });

    const firstPlatform = this.platforms[0];

    this.player = this.physics.add.sprite(
      120,
      firstPlatform.surfaceY - 90,
      'player-run-sheet',
      0
    );

    this.player.setScale(0.22);
    this.player.setOrigin(0.5, 0.5);
    this.player.play('player-run-anim');

    this.player.body.setGravityY(800);
    this.player.body.setCollideWorldBounds(false);
    this.player.body.setSize(150, 230);
    this.player.body.setOffset(115, 420);

    this.physics.add.collider(this.player, this.platformGroup);

    this.keys = this.input.keyboard.addKeys({
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      r: Phaser.Input.Keyboard.KeyCodes.R,
      esc: Phaser.Input.Keyboard.KeyCodes.ESC
    });

    this.time.addEvent({
      delay: 1800,
      callback: this.spawnObstacleOnPath,
      callbackScope: this,
      loop: true
    });

    this.time.addEvent({
      delay: 2300,
      callback: this.spawnCoinOnPath,
      callbackScope: this,
      loop: true
    });

    this.createHud();
    this.createPauseMenu();

    this.updateHighscoreDisplay();

    this.input.keyboard.on('keydown', this.handleNameInput, this);
  }

  stopLevelMusic() {
    if (this.levelMusic) {
      if (this.levelMusic.isPlaying || this.levelMusic.isPaused) {
        this.levelMusic.stop();
      }

      this.levelMusic.destroy();
      this.levelMusic = null;
    }
  }

  getSavedVolume(key, fallback) {
    const value = parseFloat(localStorage.getItem(key));
    return Number.isFinite(value) ? value : fallback;
  }

  update(time, delta) {
    if (
      Phaser.Input.Keyboard.JustDown(this.keys.esc) &&
      !this.isGameOver &&
      !this.isLevelComplete &&
      !this.isEnteringName
    ) {
      this.togglePause();
    }

    if (this.isPaused) {
      this.updateUiGlow(time);
      return;
    }

    this.moveCyberpunkBackground();
    this.updateUiGlow(time);

    if (this.isGameOver || this.isLevelComplete) {
      if (!this.isEnteringName && Phaser.Input.Keyboard.JustDown(this.keys.r)) {
        this.sound.stopAll();
        this.stopLevelMusic();
        this.physics.world.resume();
        this.scene.start('MenuScene');
      }

      return;
    }

    this.levelElapsedMs += delta;
    this.updateLevelTimer();

    if (this.levelElapsedMs >= this.levelDurationMs) {
      this.levelComplete();
      return;
    }

    if (this.player.y > this.worldFallLimit) {
      this.gameOver();
      return;
    }

    if (this.player.body.blocked.down) {
      this.jumpCount = 0;
    }

    this.score += delta * 0.01;
    this.updateScoreText();

    this.gameSpeed += this.speedIncrease;

    this.handleMovement();
    this.handleDuck();
    this.handleJump();

    this.movePlatforms();
    this.moveObstacles();
    this.moveCoins();
  }

  createHud() {
    this.uiDepth = 900;

    this.scorePanel = this.add.container(20, 20);
    this.scorePanel.setDepth(this.uiDepth);

    const scoreBg = this.add.rectangle(0, 0, 240, 72, 0x090014, 0.78);
    scoreBg.setOrigin(0, 0);
    scoreBg.setStrokeStyle(2, 0xff00cc, 0.95);

    this.scoreGlow = this.add.rectangle(0, 0, 240, 72, 0xff00cc, 0.12);
    this.scoreGlow.setOrigin(0, 0);

    const scoreLabel = this.add.text(18, 10, 'SCORE', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '15px',
      color: '#00ffff'
    });

    scoreLabel.setShadow(0, 0, '#00ffff', 8, true, true);

    this.scoreText = this.add.text(18, 30, '000000', {
      fontFamily: 'Consolas, Courier New, monospace',
      fontSize: '28px',
      color: '#ffffff'
    });

    this.scoreText.setShadow(0, 0, '#ff00cc', 12, true, true);

    this.scorePanel.add([this.scoreGlow, scoreBg, scoreLabel, this.scoreText]);

    this.controlsPanel = this.add.container(20, 102);
    this.controlsPanel.setDepth(this.uiDepth);

    const controlsBg = this.add.rectangle(0, 0, 430, 34, 0x000000, 0.38);
    controlsBg.setOrigin(0, 0);
    controlsBg.setStrokeStyle(1, 0x00ffff, 0.45);

    this.controlsText = this.add.text(
      12,
      8,
      'W/SPACE SPRINGEN   A/D BEWEGEN   S DUCKEN   ESC PAUSE',
      {
        fontFamily: 'Consolas, Courier New, monospace',
        fontSize: '13px',
        color: '#bffcff'
      }
    );

    this.controlsPanel.add([controlsBg, this.controlsText]);

    this.highscorePanel = this.add.container(this.scale.width - 265, 20);
    this.highscorePanel.setDepth(this.uiDepth);

    const highBg = this.add.rectangle(0, 0, 245, 128, 0x090014, 0.78);
    highBg.setOrigin(0, 0);
    highBg.setStrokeStyle(2, 0x00ffff, 0.95);

    this.highGlow = this.add.rectangle(0, 0, 245, 128, 0x00ffff, 0.1);
    this.highGlow.setOrigin(0, 0);

    const highTitle = this.add.text(16, 12, 'TOP 3 RUNS', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '16px',
      color: '#ff66ff'
    });

    highTitle.setShadow(0, 0, '#ff00cc', 8, true, true);

    this.highscoreText = this.add.text(16, 42, '', {
      fontFamily: 'Consolas, Courier New, monospace',
      fontSize: '16px',
      color: '#ffffff',
      lineSpacing: 8
    });

    this.highscoreText.setShadow(0, 0, '#00ffff', 6, true, true);

    this.highscorePanel.add([this.highGlow, highBg, highTitle, this.highscoreText]);

    this.timerPanel = this.add.container(this.scale.width / 2 - 150, 20);
    this.timerPanel.setDepth(this.uiDepth);

    const timerBg = this.add.rectangle(0, 0, 300, 72, 0x090014, 0.78);
    timerBg.setOrigin(0, 0);
    timerBg.setStrokeStyle(2, 0xff9900, 0.95);

    const timerTitle = this.add.text(18, 10, 'LEVEL 1 TRACK', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '15px',
      color: '#ffcc66'
    });

    timerTitle.setShadow(0, 0, '#ff9900', 8, true, true);

    this.timerText = this.add.text(18, 33, '04:07', {
      fontFamily: 'Consolas, Courier New, monospace',
      fontSize: '24px',
      color: '#ffffff'
    });

    this.timerText.setShadow(0, 0, '#ff9900', 10, true, true);

    this.progressBg = this.add.rectangle(110, 45, 165, 8, 0x221100, 1);
    this.progressBg.setOrigin(0, 0.5);

    this.progressBar = this.add.rectangle(110, 45, 0, 8, 0xff9900, 1);
    this.progressBar.setOrigin(0, 0.5);

    this.timerPanel.add([timerBg, timerTitle, this.timerText, this.progressBg, this.progressBar]);
  }

  updateUiGlow(time) {
    const pulse = 0.08 + Math.sin(time * 0.006) * 0.04;

    this.scoreGlow?.setAlpha(pulse);
    this.highGlow?.setAlpha(pulse);

    if (this.pausePanelGlow && this.isPaused) {
      this.pausePanelGlow.setAlpha(0.12 + Math.sin(time * 0.006) * 0.05);
    }

    if (this.gameOverPanelGlow && (this.isGameOver || this.isLevelComplete)) {
      this.gameOverPanelGlow.setAlpha(0.12 + Math.sin(time * 0.006) * 0.05);
    }
  }

  updateScoreText() {
    const score = String(Math.floor(this.score)).padStart(6, '0');
    this.scoreText.setText(score);
  }

  updateLevelTimer() {
    const remainingMs = Math.max(0, this.levelDurationMs - this.levelElapsedMs);
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    this.timerText.setText(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);

    const progress = Phaser.Math.Clamp(this.levelElapsedMs / this.levelDurationMs, 0, 1);
    this.progressBar.width = 165 * progress;
  }

  createPauseMenu() {
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;

    this.pauseOverlay = this.add.container(0, 0);
    this.pauseOverlay.setDepth(1000);
    this.pauseOverlay.setVisible(false);

    const darkBg = this.add.rectangle(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, 0x000000, 0.68);

    this.pausePanelGlow = this.add.rectangle(gameWidth / 2, gameHeight / 2, 470, 300, 0xff00cc, 0.14);

    const panel = this.add.rectangle(gameWidth / 2, gameHeight / 2, 430, 260, 0x0a0015, 0.96);
    panel.setStrokeStyle(3, 0xff00cc, 1);

    const title = this.add.text(gameWidth / 2, gameHeight / 2 - 82, 'PAUSE', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '50px',
      color: '#ffffff'
    }).setOrigin(0.5);

    title.setShadow(0, 0, '#ff00cc', 18, true, true);

    const subTitle = this.add.text(gameWidth / 2, gameHeight / 2 - 35, 'SYSTEM ANGEHALTEN', {
      fontFamily: 'Consolas, Courier New, monospace',
      fontSize: '15px',
      color: '#00ffff'
    }).setOrigin(0.5);

    const resumeButton = this.add.text(gameWidth / 2, gameHeight / 2 + 28, 'WEITER SPIELEN', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#220033',
      padding: { x: 28, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    resumeButton.setShadow(0, 0, '#00ffff', 10, true, true);
    resumeButton.on('pointerover', () => resumeButton.setColor('#00ffff'));
    resumeButton.on('pointerout', () => resumeButton.setColor('#ffffff'));
    resumeButton.on('pointerdown', () => this.togglePause());

    const menuButton = this.add.text(gameWidth / 2, gameHeight / 2 + 88, 'ZURUECK ZUM HAUPTMENUE', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#220033',
      padding: { x: 22, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuButton.setShadow(0, 0, '#ff00cc', 10, true, true);
    menuButton.on('pointerover', () => menuButton.setColor('#ff99ff'));
    menuButton.on('pointerout', () => menuButton.setColor('#ffffff'));
    menuButton.on('pointerdown', () => {
      this.sound.stopAll();
      this.stopLevelMusic();
      this.physics.world.resume();
      this.scene.start('MenuScene');
    });

    this.pauseOverlay.add([darkBg, this.pausePanelGlow, panel, title, subTitle, resumeButton, menuButton]);
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    this.pauseOverlay.setVisible(this.isPaused);

    if (this.isPaused) {
      this.physics.world.pause();
      this.player.anims.pause();

      if (this.levelMusic?.isPlaying) {
        this.levelMusic.pause();
      }
    } else {
      this.physics.world.resume();
      this.player.anims.resume();

      if (this.levelMusic?.isPaused && audioAllowed) {
        this.levelMusic.resume();
      }
    }
  }

  drawCyberpunkBackground() {
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;

    this.bg1 = this.add.image(0, 0, 'cyber-bg');
    this.bg1.setOrigin(0, 0);
    this.bg1.setDisplaySize(gameWidth, gameHeight);

    this.bg2 = this.add.image(gameWidth, 0, 'cyber-bg');
    this.bg2.setOrigin(0, 0);
    this.bg2.setDisplaySize(gameWidth, gameHeight);

    this.bgSpeed = 0.6;
  }

  moveCyberpunkBackground() {
    this.bg1.x -= this.bgSpeed;
    this.bg2.x -= this.bgSpeed;

    if (this.bg1.x <= -this.scale.width) {
      this.bg1.x = this.bg2.x + this.scale.width;
    }

    if (this.bg2.x <= -this.scale.width) {
      this.bg2.x = this.bg1.x + this.scale.width;
    }
  }

  createLevelPath() {
    const gameHeight = this.scale.height;

    this.pathPattern = [
      { width: 390, gap: 100, y: gameHeight - 120 },
      { width: 280, gap: 120, y: gameHeight - 165 },
      { width: 340, gap: 110, y: gameHeight - 145 },
      { width: 240, gap: 135, y: gameHeight - 200 },
      { width: 420, gap: 115, y: gameHeight - 245 },
      { width: 300, gap: 145, y: gameHeight - 195 },
      { width: 360, gap: 120, y: gameHeight - 150 },
      { width: 220, gap: 115, y: gameHeight - 185 },
      { width: 460, gap: 130, y: gameHeight - 230 },
      { width: 260, gap: 125, y: gameHeight - 170 }
    ];

    let x = 180;

    for (const p of this.pathPattern) {
      this.createCyberPlatformAsset(x, p.y, p.width);
      x += p.width + p.gap;
    }
  }

  createCyberPlatformAsset(x, y, width) {
    const assetKey = Phaser.Utils.Array.GetRandom(this.platformKeys);

    const platform = this.add.image(x, y, assetKey);
    platform.setOrigin(0.5, 0.5);
    platform.setDisplaySize(width, this.platformVisualHeight);

    platform.platformWidth = width;
    platform.platformHeight = this.platformVisualHeight;
    platform.surfaceOffset = this.platformSurfaceOffset;
    platform.surfaceY = y + this.platformSurfaceOffset;
    platform.assetKey = assetKey;

    const collider = this.add.rectangle(
      x,
      platform.surfaceY + this.platformColliderHeight / 2,
      width * 0.86,
      this.platformColliderHeight,
      0x000000,
      0
    );

    this.physics.add.existing(collider, true);
    this.platformGroup.add(collider);

    platform.collider = collider;

    this.platforms.push(platform);
  }

  movePlatforms() {
    for (const platform of this.platforms) {
      platform.x -= this.gameSpeed;
      platform.surfaceY = platform.y + platform.surfaceOffset;
      platform.collider.x = platform.x;
      platform.collider.y = platform.surfaceY + this.platformColliderHeight / 2;
      platform.collider.body.updateFromGameObject();

      if (platform.x + platform.platformWidth / 2 < -100) {
        this.recyclePlatform(platform);
      }
    }
  }

  recyclePlatform(platform) {
    const rightMost = this.platforms.reduce((max, p) => {
      return p.x + p.platformWidth / 2 > max.x + max.platformWidth / 2 ? p : max;
    }, this.platforms[0]);

    const nextData = Phaser.Utils.Array.GetRandom(this.pathPattern);

    const newX = rightMost.x + rightMost.platformWidth / 2 + nextData.gap + nextData.width / 2;
    const newY = nextData.y;
    const newWidth = nextData.width;

    platform.collider.destroy();
    platform.destroy();

    this.platforms = this.platforms.filter((p) => p !== platform);

    this.createCyberPlatformAsset(newX, newY, newWidth);
  }

  getPlatformNearRightSide() {
    const candidates = this.platforms.filter((p) => {
      return p.x > this.scale.width + 50 && p.x < this.scale.width + 700;
    });

    if (candidates.length === 0) return null;

    return Phaser.Utils.Array.GetRandom(candidates);
  }

  spawnObstacleOnPath() {
    if (this.isGameOver || this.isPaused || this.isLevelComplete) return;

    const platform = this.getPlatformNearRightSide();
    if (!platform) return;

    const nearbyObstacle = this.obstacles.find((o) => {
      return Math.abs(o.x - platform.x) < this.enemyMinDistance;
    });

    if (nearbyObstacle) return;

    const size = Phaser.Math.Between(70, 95);

    const x = platform.x + Phaser.Math.Between(
      -platform.platformWidth / 2 + 60,
      platform.platformWidth / 2 - 60
    );

    const y = platform.surfaceY - size / 2 + 8;

    const obstacle = this.physics.add.image(x, y, 'enemy1');

    const scale = size / Math.max(obstacle.width, obstacle.height);

    obstacle.setScale(scale);
    obstacle.setRotation(0);
    obstacle.setAngle(0);
    obstacle.setOrigin(0.5, 0.5);
    obstacle.setImmovable(true);
    obstacle.body.setAllowGravity(false);

    obstacle.body.setSize(
      obstacle.width * 0.62,
      obstacle.height * 0.62,
      true
    );

    obstacle.body.updateFromGameObject();

    this.obstacles.push(obstacle);

    this.physics.add.collider(
      this.player,
      obstacle,
      this.gameOver,
      null,
      this
    );
  }

  spawnCoinOnPath() {
    if (this.isGameOver || this.isPaused || this.isLevelComplete) return;

    const platform = this.getPlatformNearRightSide();
    if (!platform) return;

    const x = platform.x + Phaser.Math.Between(
      -platform.platformWidth / 2 + 50,
      platform.platformWidth / 2 - 50
    );

    const y = platform.surfaceY - Phaser.Math.Between(55, 95);

    this.spawnCoin(x, y);
  }

  spawnCoin(x, y) {
    const coin = this.physics.add.image(x, y, 'goldcoin');

    coin.setOrigin(0.5, 0.5);
    coin.setDisplaySize(42, 42);

    coin.body.setAllowGravity(false);
    coin.body.setCircle(18);
    coin.body.setOffset((coin.width - 36) / 2, (coin.height - 36) / 2);
    coin.body.updateFromGameObject();

    this.coins.push(coin);
  }

  moveObstacles() {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];

      obstacle.x -= this.gameSpeed;

      obstacle.setRotation(0);
      obstacle.setAngle(0);

      obstacle.body.updateFromGameObject();

      if (obstacle.x < -150) {
        obstacle.destroy();
        this.obstacles.splice(i, 1);
      }
    }
  }

  moveCoins() {
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];

      coin.x -= this.gameSpeed;
      coin.body.updateFromGameObject();

      if (this.physics.overlap(this.player, coin)) {
        this.collectCoin(coin, i);
      }

      if (coin.x < -100) {
        coin.destroy();
        this.coins.splice(i, 1);
      }
    }
  }

  handleMovement() {
    if (this.keys.a.isDown) {
      this.player.body.setVelocityX(-this.moveSpeed);
      this.player.setFlipX(true);
    } else if (this.keys.d.isDown) {
      this.player.body.setVelocityX(this.moveSpeed);
      this.player.setFlipX(false);
    } else {
      this.player.body.setVelocityX(0);
      this.player.setFlipX(false);
    }
  }

  handleJump() {
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.keys.space) ||
      Phaser.Input.Keyboard.JustDown(this.keys.w);

    if (jumpPressed && this.jumpCount < this.maxJumps) {
      if (this.isDucking) {
        this.setDuck(false);
      }

      const jumpPower = this.jumpCount === 0 ? -450 : -350;

      this.player.body.setVelocityY(jumpPower);
      this.jumpCount++;
    }
  }

  handleDuck() {
    const shouldDuck = this.keys.s.isDown && this.player.body.blocked.down;

    if (shouldDuck && !this.isDucking) {
      this.setDuck(true);
    }

    if (!shouldDuck && this.isDucking) {
      this.setDuck(false);
    }
  }

  setDuck(duck) {
    this.isDucking = duck;

    const newScaleY = duck ? 0.16 : 0.22;

    this.player.setScale(0.22, newScaleY);
    this.player.body.setSize(150, duck ? 125 : 230);
    this.player.body.setOffset(115, duck ? 525 : 420);
    this.player.body.updateFromGameObject();
  }

  collectCoin(coin, index) {
    coin.destroy();
    this.coins.splice(index, 1);

    this.score += 50;
    this.updateScoreText();
  }

  gameOver() {
    if (this.isGameOver || this.isLevelComplete) return;

    this.isGameOver = true;

    this.stopLevelMusic();

    this.player.body.setVelocity(0, 0);
    this.player.anims.pause();

    this.showEndScreen('GAME OVER', 0xff0044, 'NACH DEM SPEICHERN: R = HAUPTMENUE');
  }

  levelComplete() {
    if (this.isLevelComplete || this.isGameOver) return;

    this.isLevelComplete = true;

    this.score += 1000;
    this.updateScoreText();

    this.stopLevelMusic();

    this.physics.world.pause();
    this.player.body.setVelocity(0, 0);
    this.player.anims.pause();

    this.showEndScreen('LEVEL COMPLETE', 0x00ff99, 'NACH DEM SPEICHERN: R = HAUPTMENUE');
  }

  showEndScreen(titleText, glowColor, restartHint) {
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;

    this.gameOverOverlay = this.add.container(0, 0);
    this.gameOverOverlay.setDepth(1100);

    const darkBg = this.add.rectangle(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, 0x000000, 0.72);

    this.gameOverPanelGlow = this.add.rectangle(gameWidth / 2, gameHeight / 2, 540, 380, glowColor, 0.14);

    const panel = this.add.rectangle(gameWidth / 2, gameHeight / 2, 500, 340, 0x120006, 0.96);
    panel.setStrokeStyle(3, glowColor, 1);

    const title = this.add.text(gameWidth / 2, gameHeight / 2 - 125, titleText, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '46px',
      color: '#ffffff'
    }).setOrigin(0.5);

    title.setShadow(0, 0, Phaser.Display.Color.IntegerToColor(glowColor).rgba, 18, true, true);

    const finalScore = this.add.text(gameWidth / 2, gameHeight / 2 - 72, `SCORE ${Math.floor(this.score)}`, {
      fontFamily: 'Consolas, Courier New, monospace',
      fontSize: '22px',
      color: '#00ffff'
    }).setOrigin(0.5);

    finalScore.setShadow(0, 0, '#00ffff', 10, true, true);

    const nameLabel = this.add.text(gameWidth / 2, gameHeight / 2 - 22, 'NAME EINGEBEN', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '20px',
      color: '#ffb3ff'
    }).setOrigin(0.5);

    this.nameText = this.add.text(gameWidth / 2, gameHeight / 2 + 22, '_', {
      fontFamily: 'Consolas, Courier New, monospace',
      fontSize: '34px',
      color: '#ffff00'
    }).setOrigin(0.5);

    this.nameText.setShadow(0, 0, '#ffff00', 12, true, true);

    const hint1 = this.add.text(gameWidth / 2, gameHeight / 2 + 78, 'TIPPEN = NAME   ENTER = SPEICHERN', {
      fontFamily: 'Consolas, Courier New, monospace',
      fontSize: '15px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const hint2 = this.add.text(gameWidth / 2, gameHeight / 2 + 112, restartHint, {
      fontFamily: 'Consolas, Courier New, monospace',
      fontSize: '15px',
      color: '#00ffff'
    }).setOrigin(0.5);

    this.gameOverOverlay.add([
      darkBg,
      this.gameOverPanelGlow,
      panel,
      title,
      finalScore,
      nameLabel,
      this.nameText,
      hint1,
      hint2
    ]);

    this.isEnteringName = true;
  }

  handleNameInput(event) {
    if (!this.isEnteringName || this.scoreSaved) return;

    if (event.key === 'Backspace') {
      event.preventDefault();
      this.playerName = this.playerName.slice(0, -1);
    } else if (event.key === 'Enter') {
      this.saveHighscore();
      return;
    } else if (event.key.length === 1 && this.playerName.length < 12) {
      this.playerName += event.key;
    }

    if (this.nameText) {
      this.nameText.setText(this.playerName || '_');
    }
  }

  saveHighscore() {
    if (this.scoreSaved) return;

    const name = this.playerName.trim() || 'Spieler';
    const score = Math.floor(this.score);

    let scores = JSON.parse(localStorage.getItem('scores')) || [];

    scores.push({ name, score });
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 10);

    localStorage.setItem('scores', JSON.stringify(scores));

    this.scoreSaved = true;
    this.isEnteringName = false;

    this.updateHighscoreDisplay();

    if (this.nameText) {
      this.nameText.setText(name);
    }

    this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 155,
      'HIGHSCORE WURDE GESPEICHERT!\nDRUECKE R UM ZUM HAUPTMENUE ZURUECKZUKEHREN',
      {
        fontFamily: 'Arial Black, Arial',
        fontSize: '18px',
        color: '#00ff66',
        align: 'center'
      }
    )
      .setOrigin(0.5)
      .setDepth(1200)
      .setShadow(0, 0, '#00ff66', 12, true, true);
  }

  updateHighscoreDisplay() {
    const scores = JSON.parse(localStorage.getItem('scores')) || [];

    if (!this.highscoreText) return;

    if (scores.length === 0) {
      this.highscoreText.setText('01  KEINE SCORES\n02  ...\n03  ...');
      return;
    }

    const top3 = scores
      .slice(0, 3)
      .map((s, i) => {
        const rank = String(i + 1).padStart(2, '0');
        return `${rank}  ${s.name}  ${s.score}`;
      })
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

  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: false
  },

  scale: {
    mode: Phaser.Scale.RESIZE
  },

  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },

  scene: [MenuScene, GameScene]
};

const game = new Phaser.Game(config);

window.addEventListener('beforeunload', () => {
  game.sound.stopAll();
  game.destroy(true);
});

window.addEventListener('pagehide', () => {
  game.sound.stopAll();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.sound.pauseAll();
  }
});