"use client";

import dynamic from "next/dynamic";

const Game = dynamic(() => import("@/components/Game"), { ssr: false });
const Title = dynamic(() => import("@/components/Title"));

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black">
      <Title />
      <Game />
      <p className="mona12 text-gray-400 mt-4">
        ⬆️➡️⬅️⬇️ 방향키를 눌러 캐릭터를 움직여보세요!
      </p>
    </main>
  );
}
