const GRID_SIZE = 150;
const GRID_COLOR = 0x555555;

export function createGrid(
  scene: Phaser.Scene,
  mapWidth: number,
  mapHeight: number,
) {
  const grid = scene.add.graphics();
  grid.lineStyle(2, GRID_COLOR, 0.3);

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
