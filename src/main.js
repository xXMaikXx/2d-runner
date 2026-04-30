// 👉 NUR spawnObstacle wurde verbessert + kleine Anpassung

spawnObstacle() {
  if (this.isGameOver) return;

  const gameWidth = this.scale.width;
  const gameHeight = this.scale.height;

  // 👉 Zufälliger Typ
  const type = Phaser.Math.Between(0, 1);

  let height;
  let y;

  if (type === 0) {
    // 🟢 kleines Hindernis (normal springen)
    height = 60;
    y = gameHeight - 100;
  } else {
    // 🔴 hohes Hindernis (Double Jump nötig)
    height = 120;
    y = gameHeight - 160;
  }

  const obstacle = this.add.rectangle(
    gameWidth + 30,
    y,
    40,
    height,
    0xff0000
  );

  this.physics.add.existing(obstacle);

  obstacle.body.setAllowGravity(false);
  obstacle.body.setImmovable(true);

  this.obstacles.push(obstacle);

  this.physics.add.collider(this.player, obstacle, this.gameOver, null, this);
}