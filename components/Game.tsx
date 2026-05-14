"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { preloadAssets } from "@/lib/game/assets";
import { createBackground } from "@/lib/game/background";
import { createGrid } from "@/lib/game/grid";
import { createRocks } from "@/lib/game/rocks";
import { createMilestones } from "@/lib/game/milestone";
import { createAnimations, updateAnimation } from "@/lib/game/animation";
import { createMinimap } from "@/lib/game/minimap";

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
      backgroundColor: "#000000",
      render: { pixelArt: true }, // 픽셀 아트를 크게 키워도 선명하게 유지
      scale: {
        mode: Phaser.Scale.FIT,       // 화면에 맞게 비율 유지하며 축소/확대
        autoCenter: Phaser.Scale.CENTER_BOTH, // 가로/세로 가운데 정렬
      },
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
    let playerDot: Phaser.GameObjects.Arc; // 미니맵에만 보이는 플레이어 위치 표시 점

    function preload(this: Phaser.Scene) {
      preloadAssets(this);
    }

    function create(this: Phaser.Scene) {
      // 배경 먼저 그리기 (lib/game/background.ts)
      createBackground(this, MAP_WIDTH, MAP_HEIGHT);

      // 그리드 그리기 (lib/game/grid.ts)
      createGrid(this, MAP_WIDTH, MAP_HEIGHT);

      // 돌 배치 (lib/game/rocks.ts)
      obstacles = createRocks(this, MAP_WIDTH, MAP_HEIGHT);

      // 각 코너 이정표 문구 배치 (lib/game/milestone.ts)
      createMilestones(this);

      // 주인공 캐릭터 생성 (맵 정중앙)
      player = this.physics.add.sprite(400, 300, "player");
      player.setScale(2); // 캐릭터 크기 키우기

      // 애니메이션 등록 (lib/game/animation.ts)
      createAnimations(this);
      player.setFrame(0);

      // 물리세계 크기 강제 지정
      this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
      player.setCollideWorldBounds(true); // 지정한 2000x2000 밖으로 못 나감

      // 캐릭터와 벽이 서로 부딪히도록 물리 법칙을 설정
      this.physics.add.collider(player, obstacles);

      // 카메라 설정하기 (카메라가 움직일 수 있는 범위를 지도 전체 크기(2000x2000)로 제한)
      this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);

      // 카메라가 주인공(player)을 졸졸 따라다니도록 설정
      this.cameras.main.startFollow(player, true, 0.1, 0.1);

      // 미니맵 설정 (lib/game/minimap.ts)
      ({ playerDot } = createMinimap(this, MAP_WIDTH, MAP_HEIGHT, player));

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

      const anyKeyDown = cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown;

      if (anyKeyDown) {
        // 키보드 이동
        if (cursors.left.isDown) {
          player.setVelocityX(-speed);
          player.setFlipX(true);
        } else if (cursors.right.isDown) {
          player.setVelocityX(speed);
          player.setFlipX(false);
        }
        if (cursors.up.isDown) {
          player.setVelocityY(-speed);
        } else if (cursors.down.isDown) {
          player.setVelocityY(speed);
        }
      } else {
        // 터치/클릭 이동 (키보드 입력이 없을 때만)
        const pointer = this.input.activePointer;
        const inMinimap =
          pointer.x >= 828 && pointer.x <= 828 + 120 &&
          pointer.y >= 12  && pointer.y <= 12  + 120;

        if (pointer.isDown && !inMinimap) {
          // 터치한 화면 좌표 → 맵 월드 좌표로 변환
          const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
          const dx = worldPoint.x - player.x;
          const dy = worldPoint.y - player.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 5) {
            // 방향 벡터를 정규화해서 일정한 속도로 이동
            player.setVelocityX((dx / distance) * speed);
            player.setVelocityY((dy / distance) * speed);
            player.setFlipX(dx < 0); // 왼쪽이면 이미지 반전
          }
        }
      }

      // 애니메이션 상태 업데이트 (lib/game/animation.ts)
      updateAnimation(player, cursors);
    }

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div className="w-full px-4 max-w-[960px]">
      <div className="rounded-xl overflow-hidden border-4 border-white shadow-2xl w-full">
        <div
          ref={gameRef}
          className="w-full"
          style={{ aspectRatio: "960 / 720" }}
        />
      </div>
    </div>
  );
}
