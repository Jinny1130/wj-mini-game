"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";

export default function Game() {
  // 게임이 그려질 '도화지' 역할
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    // 맵의 진짜 전체 크기를 정의 (화면에 보이는 맵보다 훨씬 더 크게)
    const MAP_WIDTH = 2000;
    const MAP_HEIGHT = 2000;

    // 게임 설정
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO, // 브라우저가 알아서 가장 좋은 성능(Canvas/WebGL)을 골라줘요.
      width: 960,
      height: 720,
      parent: gameRef.current as HTMLElement,
      backgroundColor: "#348a58",
      render: { pixelArt: true }, // 픽셀 아트를 크게 키워도 선명하게 유지
      physics: {
        default: "arcade", // 2D 물리 엔진 사용 (중력, 충돌 등)
        arcade: {
          debug: false,
        },
      },
      scene: {
        preload: preload, // 게임 시작 전 재료(이미지) 가져오기
        create: create, // 재료 배치하기
        update: update, // 매 순간 화면을 새로 그리기 (60번/1초)
      },
    };

    // 게임 실행
    const game = new Phaser.Game(config);

    // --- 게임 로직 공간 ---

    // 전역 변수 설정 (게임 안에서 계속 쓸 재료들)
    let player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    let obstacles: Phaser.Physics.Arcade.StaticGroup;
    let minimap: Phaser.Cameras.Scene2D.Camera;
    let playerDot: Phaser.GameObjects.Arc; // 미니맵에만 보이는 플레이어 위치 표시 점

    function preload(this: Phaser.Scene) {
      // 캐릭터 이미지를 불러오기
      this.load.spritesheet(
        "player",
        "/images/character/owlet_monster_walk.png",
        {
          frameWidth: 32, // 캐릭터 그림 한 칸의 가로 크기 (캐릭터에 맞게 조절 가능)
          frameHeight: 32, // 캐릭터 그림 한 칸의 세로 크기
        },
      );
      this.load.spritesheet(
        "player_climb",
        "/images/character/owlet_monster_climb.png",
        {
          frameWidth: 32,
          frameHeight: 32,
        },
      );

      // 바위 이미지 가져오기
      this.load.image("rock", "/images/object/rock2.png");
    }

    function create(this: Phaser.Scene) {
      // Grid 그리기 (맵 안에서 움직이고 있는지 눈으로 확인하기 위해 80px 간격으로 선)
      const grid = this.add.graphics();
      grid.lineStyle(2, 0x2c7a4c, 1); // 조금 더 어두운 초록색 선

      for (let x = 0; x < MAP_WIDTH; x += 80) {
        grid.moveTo(x, 0);
        grid.lineTo(x, MAP_HEIGHT);
      }
      for (let y = 0; y < MAP_HEIGHT; y += 80) {
        grid.moveTo(0, y);
        grid.lineTo(MAP_WIDTH, y);
      }
      grid.strokePath();

      // 움직이지 않는 고정된 물체(Static Group) 생성
      obstacles = this.physics.add.staticGroup();

      // // 화면 중간쯤에 가로 200, 세로 50 크기의 회색 사각형(벽) 생성
      // const wallGraphics = this.make.graphics({ x: 0, y: 0 });
      // wallGraphics.fillStyle(0x888888, 1);
      // wallGraphics.fillRect(0, 0, 200, 50);
      // wallGraphics.generateTexture("wall", 200, 50);

      // "rock" 이미지로 장애물들 랜덤 배치
      // 고정 물체는 setScale() 후 refreshBody()를 꼭 불러야 히트박스도 같이 커짐
      // 시드(seed) 고정: 같은 시드 → 항상 같은 위치/크기로 배치됨 (숫자를 바꾸면 맵이 달라짐)
      const rng = new Phaser.Math.RandomDataGenerator(["50"]);

      // 이미 배치된 돌들의 위치와 크기를 기억해두는 목록
      const placedRocks: { x: number; y: number; scale: number }[] = [];

      for (let i = 0; i < 20; i++) {
        let x: number, y: number, scale: number;

        // 조건을 모두 만족하는 위치가 나올 때까지 다시 뽑기
        do {
          x = rng.between(50, MAP_WIDTH - 50);
          y = rng.between(50, MAP_HEIGHT - 50);
          scale = rng.between(2, 4);
        } while (
          // 조건 1: 플레이어 시작 위치(400, 300) 근처는 피하기
          Phaser.Math.Distance.Between(x, y, 400, 300) < 200 ||
          // 조건 2: 이미 놓인 돌과 너무 가까우면 안 됨 (두 돌의 크기 합에 비례해서 간격 확보)
          placedRocks.some(
            (rock) =>
              Phaser.Math.Distance.Between(x, y, rock.x, rock.y) <
              (scale + rock.scale) * 20,
          )
        );

        placedRocks.push({ x, y, scale }); // 배치 목록에 추가
        obstacles.create(x, y, "rock").setScale(scale).refreshBody();
      }

      // 이정표(텍스트)를 심어두기
      this.add.text(50, 50, "LEFT-TOP-END", {
        color: "#fff",
        fontSize: "20px",
        fontFamily: "ValMore",
      });
      this.add.text(50, 1950, "LEFT-BOTTOM-END", {
        color: "#fff",
        fontSize: "20px",
        fontFamily: "ValMore",
      });
      this.add.text(1000, 1000, "MID-POINT", {
        color: "#ffff00",
        fontSize: "20px",
        fontFamily: "ValMore",
      });
      this.add.text(1750, 50, "RIGHT-TOP-END", {
        color: "#fff",
        fontSize: "20px",
        fontFamily: "ValMore",
      });
      this.add.text(1700, 1950, "RIGHT-BOTTOM-END", {
        color: "#fff",
        fontSize: "20px",
        fontFamily: "ValMore",
      });

      // 주인공 캐릭터 생성 (맵 정중앙)
      player = this.physics.add.sprite(400, 300, "player");
      player.setScale(1.5); // 캐릭터 크기를 3배로 키우기 (숫자를 바꾸면 더 크거나 작게 할 수 있어요)

      // 걷기 애니메이션
      this.anims.create({
        key: "owlet_walk",
        frames: this.anims.generateFrameNumbers("player", { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1,
      });

      // 위로 이동할 때 올라가는 애니메이션
      this.anims.create({
        key: "owlet_climb",
        frames: this.anims.generateFrameNumbers("player_climb", {
          start: 0,
          end: 3,
        }),
        frameRate: 8,
        repeat: -1,
      });

      player.setFrame(0); // 처음엔 가만히 서 있는 자세 (0번 프레임)

      // 물리세계 크기 강제 지정
      this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
      player.setCollideWorldBounds(true); // 지정한 2000x2000 밖으로 못 나감

      // 캐릭터와 벽이 서로 부딪히도록 물리 법칙을 설정
      this.physics.add.collider(player, obstacles);

      // 카메라 설정하기 (카메라가 움직일 수 있는 범위를 지도 전체 크기(2000x2000)로 제한)
      this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);

      // 카메라가 주인공(player)을 졸졸 따라다니도록 설정
      this.cameras.main.startFollow(player, true, 0.1, 0.1);

      // -- 미니맵 카메라 설정 --
      // zoom 계산: 미니맵 높이(120) ÷ 맵 높이(2000) = 0.06 → 전체 맵이 딱 들어오는 배율
      // 위치: 오른쪽 끝(960) - 미니맵 너비(160) - 여백(12) = 788, 위 여백 12
      minimap = this.cameras
        .add(788, 12, 160, 120)
        .setZoom(0.06)
        .setName("mini");

      // startFollow 대신 맵 중앙에 고정 → 전체 맵이 항상 다 보임
      minimap.centerOn(MAP_WIDTH / 2, MAP_HEIGHT / 2);
      minimap.setBackgroundColor(0x002200); // 어두운 초록 배경
      minimap.alpha = 0.85;

      // 미니맵에만 보이는 플레이어 위치 표시 (빨간 점, 반지름 25px)
      playerDot = this.add.circle(player.x, player.y, 25, 0xff4444);
      this.cameras.main.ignore(playerDot); // 메인 화면에는 안 보이게

      // 미니맵 테두리 (메인 카메라에만 보이는 UI)
      const minimapBorder = this.add.graphics();
      minimapBorder.lineStyle(4, 0xffffff, 1);
      // 테두리는 미니맵보다 2px씩 바깥에 (788-2=786, 12-2=10)
      minimapBorder.strokeRect(786, 10, 164, 124);
      minimapBorder.setScrollFactor(0); // 카메라가 움직여도 UI는 고정
      minimap.ignore(minimapBorder); // 테두리는 미니맵 카메라에는 안 보이게

      // 미니맵 클릭 → 해당 위치로 순간이동
      this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        const inMinimap =
          pointer.x >= 788 && pointer.x <= 788 + 160 &&
          pointer.y >= 12  && pointer.y <= 12  + 120;

        if (inMinimap) {
          // 클릭한 화면 좌표를 미니맵 카메라 기준 월드 좌표로 변환
          const worldPoint = minimap.getWorldPoint(pointer.x, pointer.y);
          player.setPosition(worldPoint.x, worldPoint.y);
        }
      });

      // 키보드 준비
      if (this.input.keyboard) {
        cursors = this.input.keyboard.createCursorKeys();
      }
    }

    function update(this: Phaser.Scene) {
      // 캐릭터가 움직이는 속도
      const speed = 300;

      // 미니맵 빨간 점을 플레이어 위치와 동기화
      playerDot.setPosition(player.x, player.y);

      // 멈춤 상태로 시작
      player.setVelocity(0);

      if (cursors.left.isDown) {
        player.setVelocityX(-speed); // 왼쪽으로
        player.setFlipX(true); // 이미지를 좌우 반전 (왼쪽을 볼 때)
      } else if (cursors.right.isDown) {
        player.setVelocityX(speed); // 오른쪽으로
        player.setFlipX(false); // 이미지를 원래 방향으로 (오른쪽을 볼 때)
      }

      if (cursors.up.isDown) {
        player.setVelocityY(-speed); // 위로
      } else if (cursors.down.isDown) {
        player.setVelocityY(speed); // 아래로
      }

      // 방향에 따라 알맞은 애니메이션 재생
      // isPlaying도 함께 확인: stop() 후에도 currentAnim?.key가 남아있어서
      // "이미 같은 키니까 재생 안 해도 돼"로 잘못 판단하는 버그를 막기 위해
      if (cursors.up.isDown) {
        if (
          !player.anims.isPlaying ||
          player.anims.currentAnim?.key !== "owlet_climb"
        ) {
          player.play("owlet_climb");
        }
      } else if (player.body.velocity.x !== 0 || player.body.velocity.y !== 0) {
        if (
          !player.anims.isPlaying ||
          player.anims.currentAnim?.key !== "owlet_walk"
        ) {
          player.play("owlet_walk");
        }
      } else {
        // 멈추면 → 애니메이션 중단하고 서 있는 자세로 되돌리기
        player.anims.stop();
        player.setFrame(2);
      }
    }

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div className="rounded-xl overflow-hidden border-4 border-white shadow-2xl">
      <div
        ref={gameRef}
        className="flex justify-center items-center h-full w-full"
      />
    </div>
  );
}
