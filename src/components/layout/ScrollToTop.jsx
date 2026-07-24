import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * React Router doesn't reset scroll position between page navigations
 * (unlike traditional multi-page sites). Without this, clicking a product
 * card while scrolled down a long list would land on the details page
 * still scrolled to that same position, showing its bottom instead of top.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
