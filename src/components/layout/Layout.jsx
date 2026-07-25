import { useLayoutEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import AnnouncementBar from "./AnnouncementBar";
import Navbar from "./Navbar";
import CategoryBar from "./CategoryBar";
import Footer from "./Footer";
import FloatingOrderButton from "./FloatingOrderButton";

export default function Layout() {
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useLayoutEffect(() => {
    const node = headerRef.current;
    if (!node) return;

    const updateHeight = () => setHeaderHeight(node.offsetHeight);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div ref={headerRef} className="fixed top-0 inset-x-0 z-40">
        <AnnouncementBar />
        <Navbar />
        <CategoryBar />
      </div>
      <main className="flex-1" style={{ paddingTop: headerHeight }}>
        <Outlet />
      </main>
      <Footer />
      <FloatingOrderButton />
    </div>
  );
}
