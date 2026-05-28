"use client";

import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleHomeClick = () => {
    const isLogin = localStorage.getItem("isLogin");

    if (isLogin === "Y") {
      router.push("/main");
    } else {
      router.push("/");
    }
  };

  return (
    <header className="px-7 pt-6 pb-1">
      <h1
        onClick={handleHomeClick}
        className="text-4xl font-bold text-pink-900 cursor-pointer"
      >
        11-1=0 ✈️
      </h1>
    </header>
  );
}