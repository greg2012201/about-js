import { useCallback, useEffect, useState } from "react";

function parseIfString(x: string | number) {
  return typeof x === "number" ? x : parseInt(x, 10);
}

function useBreakpoints(breakpoints: number[] | string[]) {
  const [currBreakpoint, setCurrentBreakpoint] = useState(
    parseIfString(breakpoints[0]),
  );

  const handleBreakpoints = useCallback((width: number) => {
    let currBreakpoint = 0;

    breakpoints.forEach((key) => {
      const breakpoint = parseIfString(key);

      if (width >= breakpoint) {
        currBreakpoint = breakpoint;
      }
    });
    setCurrentBreakpoint(currBreakpoint);
  }, []);

  useEffect(() => {
    handleBreakpoints(window.innerWidth);
    const handleResize = (e: Event) => {
      const width = (e.target as Window).innerWidth;
      handleBreakpoints(width);
    };

    window.addEventListener("resize", handleResize);

    return () => window.addEventListener("resize", handleResize);
  }, []);

  return currBreakpoint;
}

export default useBreakpoints;
