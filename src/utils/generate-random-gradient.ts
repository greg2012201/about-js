function generateRandomGradient(colors: string[], direction = "to-t"): string {
  const shuffledColors = [...colors].sort(() => Math.random() - 0.5);
  const gradient = `bg-gradient-${direction} from-${shuffledColors[0]} via-${shuffledColors[1]} to-${shuffledColors[2]}`;

  return gradient;
}

export default generateRandomGradient;
