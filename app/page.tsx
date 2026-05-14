'use client';

import dynamic from 'next/dynamic';

const Game = dynamic(() => import('@/components/Game'), { ssr: false });

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black">
      <h1 className="text-white text-2xl mb-4 font-bold">나의 첫 번째 게임 세상</h1>
      <div className="rounded-xl overflow-hidden border-4 border-white shadow-2xl">
        <Game />
      </div>
      <p className="text-gray-400 mt-4 underline">방향키를 눌러 캐릭터를 움직여보세요!</p>
    </main>
  );
}