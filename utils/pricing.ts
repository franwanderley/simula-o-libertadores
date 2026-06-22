export function calculatePlayerPrice(overall: number): number {
  const minOverall = 50;
  if (overall < minOverall) return 1000;
  const basePrice = 800;
  const rate = 1.135;
  const exponent = overall - minOverall;
  const calculated = basePrice * Math.pow(rate, exponent) + 200;
  return Math.round(calculated / 50) * 50;
}

export function canBuyPlayer(
  price: number,
  currentSquadSize: number,
  currentBudget: number
): boolean {
  if (price > currentBudget) {
    return false;
  }
  const remainingPlayersNeeded = 11 - currentSquadSize - 1;
  if (remainingPlayersNeeded <= 0) {
    return currentBudget >= price;
  }
  const minPricePerPlayer = 1000;
  const minRemainingBudgetNeeded = remainingPlayersNeeded * minPricePerPlayer;
  return (currentBudget - price) >= minRemainingBudgetNeeded;
}
