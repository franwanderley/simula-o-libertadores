import { Player, Formation, PlayStyle, SquadSlot } from "@/types/game";

const getActivePlayers = (squad: SquadSlot[]): Player[] => {
  return squad
    .map((s) => s.player)
    .filter((p): p is Player => p !== null);
};

export function calculateAttackOverall(
  squad: SquadSlot[],
  playStyle: PlayStyle,
): number {
  const active = getActivePlayers(squad);
  if (active.length === 0) return 0;
  let totalWeight = 0;
  let weightedSum = 0;
  for (const p of active) {
    let weight = 0.5;
    if (p.position === "GK") weight = 0.1;
    else if (p.position === "DF") weight = 0.3;
    else if (p.position === "MF") weight = 0.9;
    else if (p.position === "FW") weight = 1.6;
    weightedSum += p.overall * weight;
    totalWeight += weight;
  }
  let finalAtk = weightedSum / totalWeight;
  if (playStyle === "attack") finalAtk += 3;
  return Math.min(99, Math.round(finalAtk));
}

export function calculateDefenseOverall(
  squad: SquadSlot[],
  playStyle: PlayStyle,
): number {
  const active = getActivePlayers(squad);
  if (active.length === 0) return 0;
  let totalWeight = 0;
  let weightedSum = 0;
  for (const p of active) {
    let weight = 0.5;
    if (p.position === "GK") weight = 1.6;
    else if (p.position === "DF") weight = 1.4;
    else if (p.position === "MF") weight = 0.7;
    else if (p.position === "FW") weight = 0.1;
    weightedSum += p.overall * weight;
    totalWeight += weight;
  }
  let finalDef = weightedSum / totalWeight;
  if (playStyle === "defense") finalDef += 3;
  return Math.min(99, Math.round(finalDef));
}

const calculatePositionBonus = (squad: SquadSlot[]): number => {
  let score = 0;
  for (const slot of squad) {
    if (slot?.player?.position === slot.position) {
      score += 30 / 11;
    }
  }
  return score;
};

const countByProperty = (
  players: Player[],
  prop: "club" | "nationality",
): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const p of players) {
    const val = p[prop];
    counts[val] = (counts[val] || 0) + 1;
  }
  return counts;
};

const calculateGroupBonus = (counts: Record<string, number>): number => {
  let bonus = 0;
  for (const key in counts) {
    const count = counts[key];
    if (count >= 4) bonus += 15;
    else if (count === 3) bonus += 10;
    else if (count === 2) bonus += 5;
  }
  return bonus;
};

const calculateTacticalBonus = (
  formation: Formation,
  playStyle: PlayStyle,
): number => {
  if (
    ((formation === "4-3-3" ||
      formation === "3-4-3" ||
      formation === "4-3-2-1") &&
      playStyle === "attack") ||
    ((formation === "5-3-2" ||
      formation === "4-5-1" ||
      formation === "5-4-1") &&
      playStyle === "defense") ||
    (formation === "4-4-2" && playStyle === "balanced")
  ) {
    return 5;
  }
  return 0;
};

export function calculateChemistry(
  squad: SquadSlot[],
  formation: Formation,
  playStyle: PlayStyle,
): number {
  const active = getActivePlayers(squad);
  if (active.length === 0) return 0;

  let score = 30 + calculatePositionBonus(squad);

  const clubCounts = countByProperty(active, "club");
  const clubScore = calculateGroupBonus(clubCounts);
  score += Math.min(35, clubScore);

  const nationCounts = countByProperty(active, "nationality");
  const nationScore = calculateGroupBonus(nationCounts);
  score += Math.min(35, nationScore);

  score += calculateTacticalBonus(formation, playStyle);

  return Math.min(100, Math.round(score));
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
