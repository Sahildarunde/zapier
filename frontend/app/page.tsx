"use client"; // Mark this component as a Client Component

import { useSelector } from "react-redux";
import Hero from "../components/Hero";
import HeroVideo from "../components/HeroVideo";
import Appbar from "@/components/Appbar";
import { RootState } from "@/store";

export default function Home() {
  // Access the theme value from Redux state
  const theme = useSelector((state: RootState) => state.theme.theme);

  return (
    <main
      className="pb-48"
      style={{
        backgroundColor: theme === "light" ? "#fffdf9" : "#333",
        color: theme === "light" ? "#000" : "#fff" // Optional: Adjust text color as well
      }}
    >
      <Appbar />
      <Hero />
      <div className="pt-8 p-4">
        <HeroVideo />
      </div>
    </main>
  );
}
