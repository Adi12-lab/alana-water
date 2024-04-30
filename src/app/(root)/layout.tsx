"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { useMediaQuery } from "~/hooks";
import Sidebar from "~/components/layout/sidebar";
import { Toggle } from "~/components/ui/toggle";
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
      <main className="flex h-screen">
        <Sidebar
          setBroken={setBroken}
          setToggled={setToggled}
          toggled={toggled}
        />
        {broken && (
          <Toggle
            pressed={toggled}
            onPressedChange={() => setToggled(!toggled)}
            variant={"outline"}
            className="fixed top-2 right-4"
          >
            <Menu />
          </Toggle>
        )}
        <section className="w-full mt-4 container overflow-y-scroll">
          {children}
        </section>
      </main>
    </>
  );
}
