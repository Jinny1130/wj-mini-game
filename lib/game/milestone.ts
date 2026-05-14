const MILESTONES = [
  { x: 50,   y: 50,   label: "LEFT-TOP-END",     color: "#fff" },
  { x: 50,   y: 1950, label: "LEFT-BOTTOM-END",  color: "#fff" },
  { x: 1000, y: 1000, label: "MID-POINT",         color: "#ffff00" },
  { x: 1800, y: 50,   label: "RIGHT-TOP-END",     color: "#fff" },
  { x: 1750, y: 1950, label: "RIGHT-BOTTOM-END",  color: "#fff" },
];

export function createMilestones(scene: Phaser.Scene) {
  MILESTONES.forEach(({ x, y, label, color }) => {
    scene.add.text(x, y, label, {
      color,
      fontSize: "20px",
      fontFamily: "ValMore",
    });
  });
}
