function generateRandomGradient(colors: string[]): string {
  const shuffledColors = [...colors].sort(() => Math.random() - 0.5);
  const gradient = `bg-gradient-to-t from-${shuffledColors[0]} via-${shuffledColors[1]} to-${shuffledColors[2]}`;

  console.log(
    "🚀 ~ file: generate-random-gradient.ts:7 ~ generateRandomGradient ~ gradient:",
    gradient,
  );
  return gradient;
}

export default generateRandomGradient;
