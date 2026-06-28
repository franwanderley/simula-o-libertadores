import { SquadSlot, Formation, PlayerPosition } from '@/types/game';

export const FORMATIONS: Formation[] = [
  '4-4-2',
  '4-3-3',
  '3-5-2',
  '5-3-2',
  '4-2-3-1',
  '3-4-3',
  '4-5-1',
  '4-3-2-1',
  '5-4-1'
];

export const FORMATION_POSITIONS: Record<string, PlayerPosition[]> = {
  "4-4-2": ["GK", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "MF", "FW", "FW"],
  "4-3-3": ["GK", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "FW", "FW", "FW"],
  "3-5-2": ["GK", "DF", "DF", "DF", "MF", "MF", "MF", "MF", "MF", "FW", "FW"],
  "5-3-2": ["GK", "DF", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "FW", "FW"],
  "4-2-3-1": ["GK", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "MF", "MF", "FW"],
  "3-4-3": ["GK", "DF", "DF", "DF", "MF", "MF", "MF", "MF", "FW", "FW", "FW"],
  "4-5-1": ["GK", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "MF", "MF", "FW"],
  "4-3-2-1": ["GK", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "FW", "FW", "FW"],
  "5-4-1": ["GK", "DF", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "MF", "FW"],
};


export function getSlotsForFormation(formation: Formation): SquadSlot[] {
  switch (formation) {
    case '4-4-2':
      return [
        { id: 'gk', label: 'GOL', position: 'GK', player: null },
        { id: 'lb', label: 'LE', position: 'DF', player: null },
        { id: 'lcb', label: 'ZAG', position: 'DF', player: null },
        { id: 'rcb', label: 'ZAG', position: 'DF', player: null },
        { id: 'rb', label: 'LD', position: 'DF', player: null },
        { id: 'lm', label: 'ME', position: 'MF', player: null },
        { id: 'lcm', label: 'MC', position: 'MF', player: null },
        { id: 'rcm', label: 'MC', position: 'MF', player: null },
        { id: 'rm', label: 'MD', position: 'MF', player: null },
        { id: 'ls', label: 'ATA', position: 'FW', player: null },
        { id: 'rs', label: 'ATA', position: 'FW', player: null },
      ];
    case '4-3-3':
      return [
        { id: 'gk', label: 'GOL', position: 'GK', player: null },
        { id: 'lb', label: 'LE', position: 'DF', player: null },
        { id: 'lcb', label: 'ZAG', position: 'DF', player: null },
        { id: 'rcb', label: 'ZAG', position: 'DF', player: null },
        { id: 'rb', label: 'LD', position: 'DF', player: null },
        { id: 'lcm', label: 'MC', position: 'MF', player: null },
        { id: 'cm', label: 'MC', position: 'MF', player: null },
        { id: 'rcm', label: 'MC', position: 'MF', player: null },
        { id: 'lw', label: 'PE', position: 'FW', player: null },
        { id: 'st', label: 'ATA', position: 'FW', player: null },
        { id: 'rw', label: 'PD', position: 'FW', player: null },
      ];
    case '3-5-2':
      return [
        { id: 'gk', label: 'GOL', position: 'GK', player: null },
        { id: 'lcb', label: 'ZAG', position: 'DF', player: null },
        { id: 'cb', label: 'ZAG', position: 'DF', player: null },
        { id: 'rcb', label: 'ZAG', position: 'DF', player: null },
        { id: 'lm', label: 'ME', position: 'MF', player: null },
        { id: 'ldm', label: 'VOL', position: 'MF', player: null },
        { id: 'cam', label: 'MEI', position: 'MF', player: null },
        { id: 'rdm', label: 'VOL', position: 'MF', player: null },
        { id: 'rm', label: 'MD', position: 'MF', player: null },
        { id: 'ls', label: 'ATA', position: 'FW', player: null },
        { id: 'rs', label: 'ATA', position: 'FW', player: null },
      ];
    case '5-3-2':
      return [
        { id: 'gk', label: 'GOL', position: 'GK', player: null },
        { id: 'lwb', label: 'ADE', position: 'DF', player: null },
        { id: 'lcb', label: 'ZAG', position: 'DF', player: null },
        { id: 'cb', label: 'ZAG', position: 'DF', player: null },
        { id: 'rcb', label: 'ZAG', position: 'DF', player: null },
        { id: 'rwb', label: 'ADD', position: 'DF', player: null },
        { id: 'lcm', label: 'MC', position: 'MF', player: null },
        { id: 'cm', label: 'MC', position: 'MF', player: null },
        { id: 'rcm', label: 'MC', position: 'MF', player: null },
        { id: 'ls', label: 'ATA', position: 'FW', player: null },
        { id: 'rs', label: 'ATA', position: 'FW', player: null },
      ];
    case '4-2-3-1':
      return [
        { id: 'gk', label: 'GOL', position: 'GK', player: null },
        { id: 'lb', label: 'LE', position: 'DF', player: null },
        { id: 'lcb', label: 'ZAG', position: 'DF', player: null },
        { id: 'rcb', label: 'ZAG', position: 'DF', player: null },
        { id: 'rb', label: 'LD', position: 'DF', player: null },
        { id: 'ldm', label: 'VOL', position: 'MF', player: null },
        { id: 'rdm', label: 'VOL', position: 'MF', player: null },
        { id: 'lam', label: 'MEI', position: 'MF', player: null },
        { id: 'cam', label: 'MEI', position: 'MF', player: null },
        { id: 'ram', label: 'MEI', position: 'MF', player: null },
        { id: 'st', label: 'ATA', position: 'FW', player: null },
      ];
    case '3-4-3':
      return [
        { id: 'gk', label: 'GOL', position: 'GK', player: null },
        { id: 'lcb', label: 'ZAG', position: 'DF', player: null },
        { id: 'cb', label: 'ZAG', position: 'DF', player: null },
        { id: 'rcb', label: 'ZAG', position: 'DF', player: null },
        { id: 'lm', label: 'ME', position: 'MF', player: null },
        { id: 'lcm', label: 'MC', position: 'MF', player: null },
        { id: 'rcm', label: 'MC', position: 'MF', player: null },
        { id: 'rm', label: 'MD', position: 'MF', player: null },
        { id: 'lw', label: 'PE', position: 'FW', player: null },
        { id: 'st', label: 'ATA', position: 'FW', player: null },
        { id: 'rw', label: 'PD', position: 'FW', player: null },
      ];
    case '4-5-1':
      return [
        { id: 'gk', label: 'GOL', position: 'GK', player: null },
        { id: 'lb', label: 'LE', position: 'DF', player: null },
        { id: 'lcb', label: 'ZAG', position: 'DF', player: null },
        { id: 'rcb', label: 'ZAG', position: 'DF', player: null },
        { id: 'rb', label: 'LD', position: 'DF', player: null },
        { id: 'lm', label: 'ME', position: 'MF', player: null },
        { id: 'lcm', label: 'MC', position: 'MF', player: null },
        { id: 'cm', label: 'MC', position: 'MF', player: null },
        { id: 'rcm', label: 'MC', position: 'MF', player: null },
        { id: 'rm', label: 'MD', position: 'MF', player: null },
        { id: 'st', label: 'ATA', position: 'FW', player: null },
      ];
    case '4-3-2-1':
      return [
        { id: 'gk', label: 'GOL', position: 'GK', player: null },
        { id: 'lb', label: 'LE', position: 'DF', player: null },
        { id: 'lcb', label: 'ZAG', position: 'DF', player: null },
        { id: 'rcb', label: 'ZAG', position: 'DF', player: null },
        { id: 'rb', label: 'LD', position: 'DF', player: null },
        { id: 'lcm', label: 'MC', position: 'MF', player: null },
        { id: 'cm', label: 'MC', position: 'MF', player: null },
        { id: 'rcm', label: 'MC', position: 'MF', player: null },
        { id: 'lf', label: 'SA', position: 'FW', player: null },
        { id: 'rf', label: 'SA', position: 'FW', player: null },
        { id: 'st', label: 'ATA', position: 'FW', player: null },
      ];
    case '5-4-1':
      return [
        { id: 'gk', label: 'GOL', position: 'GK', player: null },
        { id: 'lwb', label: 'ADE', position: 'DF', player: null },
        { id: 'lcb', label: 'ZAG', position: 'DF', player: null },
        { id: 'cb', label: 'ZAG', position: 'DF', player: null },
        { id: 'rcb', label: 'ZAG', position: 'DF', player: null },
        { id: 'rwb', label: 'ADD', position: 'DF', player: null },
        { id: 'lm', label: 'ME', position: 'MF', player: null },
        { id: 'lcm', label: 'MC', position: 'MF', player: null },
        { id: 'rcm', label: 'MC', position: 'MF', player: null },
        { id: 'rm', label: 'MD', position: 'MF', player: null },
        { id: 'st', label: 'ATA', position: 'FW', player: null },
      ];
  }
}
