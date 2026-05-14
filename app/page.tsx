"use client";

import dynamic from "next/dynamic";
import Title from "@/components/Title";
import Footer from "@/components/Footer";

// Phaser는 브라우저 전용 API를 사용: 서버 렌더링을 끄고 동적으로 불러오기
const Game = dynamic(() => import("@/components/Game"), { ssr: false });

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black">
      <Title />
      <Game />
      <Footer />
    </main>
  );
}
