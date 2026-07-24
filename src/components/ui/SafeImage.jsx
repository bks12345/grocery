import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

/**
 * Renders a photo with graceful degradation:
 *   1. Try `src` (e.g. your own local photo in /public/images/...)
 *   2. If that fails to load, try `fallbackSrc` (e.g. a backup hotlinked photo)
 *   3. If that also fails, show a generic icon instead of a broken-image icon
 */
export default function SafeImage({
  src,
  fallbackSrc,
  alt,
  className = "",
  fallbackClassName = "",
}) {
  const [stage, setStage] = useState(src ? "primary" : "fallback-icon");

  // Reset when the requested image changes (e.g. switching between products)
  useEffect(() => {
    setStage(src ? "primary" : "fallback-icon");
  }, [src]);

  const handleError = () => {
    if (stage === "primary" && fallbackSrc) {
      setStage("fallback");
    } else {
      setStage("fallback-icon");
    }
  };

  if (stage === "fallback-icon") {
    return (
      <div
        className={`flex items-center justify-center bg-basil-50 ${className} ${fallbackClassName}`}
      >
        <ImageOff aria-hidden="true" className="w-[35%] h-[35%] text-basil-300" />
      </div>
    );
  }

  return (
    <img
      src={stage === "fallback" ? fallbackSrc : src}
      alt={alt}
      loading="lazy"
      onError={handleError}
      className={className}
    />
  );
}
