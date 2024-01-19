import { useEffect, useState } from "react";

interface WindowSize {
  width: number;
  height: number;
}

function useWindowSize() {
  const [windowSize, setWindowSize] = useState<WindowSize | null>(
    typeof window !== "undefined"
      ? {
          width: window.innerWidth,
          height: window.innerHeight,
        }
      : null,
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return windowSize /* casting is added here because we now that when the client component arrives to the browser the window will be available */;
}

export default useWindowSize;
