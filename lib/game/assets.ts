// 게임에서 사용하는 모든 에셋을 여기서 등록해요
// 새 이미지/스프라이트를 추가할 때 이 파일만 수정하면 돼요
export function preloadAssets(scene: Phaser.Scene) {
  scene.load.spritesheet("player", "/images/character/owlet_monster_walk.png", {
    frameWidth: 32,
    frameHeight: 32,
  });

  scene.load.spritesheet("player_climb", "/images/character/owlet_monster_climb.png", {
    frameWidth: 32,
    frameHeight: 32,
  });

  scene.load.image("rock", "/images/object/rock2.png");
}
