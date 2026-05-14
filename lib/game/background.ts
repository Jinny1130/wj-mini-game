// 프레임 인덱스: 0=좌상단, 1=중앙상단, 2=우상단, 3=좌하단, 4=중앙하단
const FRAME_INDEX = 1;

export function createBackground(
  scene: Phaser.Scene,
  mapWidth: number,
  mapHeight: number,
) {
  // tileSprite: 지정한 프레임 이미지를 타일처럼 반복해서 맵 전체를 채워요
  // setTileScale: 타일 하나의 크기를 키워요 → 숫자가 클수록 별이 더 멀리 떨어져 보여요
  scene.add
    .tileSprite(0, 0, mapWidth, mapHeight, "space_bg", FRAME_INDEX)
    .setOrigin(0, 0)
    .setTileScale(3);
}
