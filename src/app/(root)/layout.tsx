"use client";

import { useState } from "react";

import { useMediaQuery } from "~/hooks";
import Sidebar from "~/components/layout/sidebar";
// import HeaderMobile from "~/components/ready-use/header-mobile";

export default function UserLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const [toggled, setToggled] = useState(false);
  const [broken, setBroken] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <>
      <main className="flex h-screen overflow-y-scroll">
        <Sidebar
          setBroken={setBroken}
          setToggled={setToggled}
          toggled={toggled}
        />
        <section className="w-full mt-4 container">
          {children}
        </section>
      </main>
    </>
  );
}
