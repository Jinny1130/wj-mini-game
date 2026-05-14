// 애니메이션 등록 — create() 에서 한 번만 호출
export function createAnimations(scene: Phaser.Scene) {
  scene.anims.create({
    key: "owlet_walk",
    frames: scene.anims.generateFrameNumbers("player", { start: 0, end: 5 }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "owlet_climb",
    frames: scene.anims.generateFrameNumbers("player_climb", { start: 0, end: 3 }),
    frameRate: 8,
    repeat: -1,
  });

  // 처음엔 가만히 서 있는 자세
  // (등록만 하고 재생은 안 함 — 첫 프레임을 기본 자세로 사용)
}

// 애니메이션 상태 제어 — update() 에서 매 프레임 호출
export function updateAnimation(
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
  cursors: Phaser.Types.Input.Keyboard.CursorKeys,
) {
  if (cursors.up.isDown) {
    if (!player.anims.isPlaying || player.anims.currentAnim?.key !== "owlet_climb") {
      player.play("owlet_climb");
    }
  } else if (player.body.velocity.x !== 0 || player.body.velocity.y !== 0) {
    // isPlaying도 함께 확인: stop() 후에도 currentAnim?.key가 남아있어서
    // "이미 같은 키니까 재생 안 해도 돼"로 잘못 판단하는 버그를 막기 위해
    if (!player.anims.isPlaying || player.anims.currentAnim?.key !== "owlet_walk") {
      player.play("owlet_walk");
    }
  } else {
    player.anims.stop();
    player.setFrame(2); // 멈추면 서 있는 자세 프레임으로 복귀
  }
}
