import Phaser from "phaser";

const ROCK_COUNT = 20;
const SEED = "50";
const PLAYER_SPAWN = { x: 400, y: 300 };
const PLAYER_SAFE_RADIUS = 200; // 플레이어 시작 위치 주변 이 범위 안에는 돌 배치 안 함

export function createRocks(
  scene: Phaser.Scene,
  mapWidth: number,
  mapHeight: number,
): Phaser.Physics.Arcade.StaticGroup {
  const obstacles = scene.physics.add.staticGroup();
  const rng = new Phaser.Math.RandomDataGenerator([SEED]);
  const placed: { x: number; y: number; scale: number }[] = [];

  for (let i = 0; i < ROCK_COUNT; i++) {
    let x: number, y: number, scale: number;

    do {
      x = rng.between(50, mapWidth - 50);
      y = rng.between(50, mapHeight - 50);
      scale = rng.between(2, 4);
    } while (
      Phaser.Math.Distance.Between(x, y, PLAYER_SPAWN.x, PLAYER_SPAWN.y) < PLAYER_SAFE_RADIUS ||
      placed.some(
        (rock) => Phaser.Math.Distance.Between(x, y, rock.x, rock.y) < (scale + rock.scale) * 20,
      )
    );

    placed.push({ x, y, scale });
    // 고정 물체는 setScale() 후 refreshBody()를 꼭 불러야 히트박스도 같이 커짐
    obstacles.create(x, y, "rock").setScale(scale).refreshBody();
  }

  return obstacles;
}
