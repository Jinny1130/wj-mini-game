const GRID_SIZE = 80;
const GRID_COLOR = 0x2c7a4c;

export function createGrid(scene: Phaser.Scene, mapWidth: number, mapHeight: number) {
  const grid = scene.add.graphics();
  grid.lineStyle(2, GRID_COLOR, 1);

  for (let x = 0; x < mapWidth; x += GRID_SIZE) {
    grid.moveTo(x, 0);
    grid.lineTo(x, mapHeight);
  }
  for (let y = 0; y < mapHeight; y += GRID_SIZE) {
    grid.moveTo(0, y);
    grid.lineTo(mapWidth, y);
  }
  grid.strokePath();
}
