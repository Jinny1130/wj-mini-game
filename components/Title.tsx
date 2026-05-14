import localFont from "next/font/local";

const valmore = localFont({
  src: "../public/fonts/Planes_ValMore.ttf",
  variable: "--font-valmore",
});

export default function Title() {
  return (
    <div>
      <h2 className={`${valmore.className} text-white text-2xl mb-4`}>
        WOOJINNY MINI GAME
      </h2>
    </div>
  );
}
