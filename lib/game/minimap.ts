// 미니맵 설정 결과 타입 — Game.tsx의 update에서 계속 사용하는 값들
export type MinimapResult = {
  minimap: Phaser.Cameras.Scene2D.Camera;
  playerDot: Phaser.GameObjects.Arc;
};

export function createMinimap(
  scene: Phaser.Scene,
  mapWidth: number,
  mapHeight: number,
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
): MinimapResult {
  // 맵이 2000x2000 정사각형이므로 미니맵도 정사각형으로 맞춰야 빈 여백이 생기지 않음
  // zoom 계산: 120 ÷ 2000 = 0.06 → 가로/세로 모두 딱 맞게 들어오는 배율
  // 위치: 오른쪽 끝(960) - 미니맵 너비(120) - 여백(12) = 828, 위 여백 12
  const minimap = scene.cameras
    .add(828, 12, 120, 120)
    .setZoom(0.06)
    .setName("mini");

  // startFollow 대신 맵 중앙에 고정 → 전체 맵이 항상 다 보임
  minimap.centerOn(mapWidth / 2, mapHeight / 2);
  minimap.setBackgroundColor(0x002200);
  minimap.alpha = 0.85;

  // 미니맵에만 보이는 플레이어 위치 표시 (빨간 점, 반지름 25px)
  const playerDot = scene.add.circle(player.x, player.y, 40, 0xff4444);
  scene.cameras.main.ignore(playerDot); // 메인 화면에는 안 보이게

  // 미니맵 테두리 (메인 카메라에만 보이는 UI)
  const minimapBorder = scene.add.graphics();
  minimapBorder.lineStyle(4, 0xffffff, 1);
  minimapBorder.strokeRect(826, 10, 124, 124); // 테두리는 미니맵보다 2px씩 바깥에
  minimapBorder.setScrollFactor(0); // 카메라가 움직여도 UI는 고정
  minimap.ignore(minimapBorder); // 테두리는 미니맵 카메라에는 안 보이게

  // 미니맵 클릭 → 해당 위치로 순간이동
  scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
    const inMinimap =
      pointer.x >= 828 && pointer.x <= 828 + 120 &&
      pointer.y >= 12  && pointer.y <= 12  + 120;

    if (inMinimap) {
      const worldPoint = minimap.getWorldPoint(pointer.x, pointer.y);
      player.setPosition(worldPoint.x, worldPoint.y);
    }
  });

  return { minimap, playerDot };
}
