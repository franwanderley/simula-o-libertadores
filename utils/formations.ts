import { SquadSlot, Formation } from '../app/types/game';

export function getSlotsForFormation(formation: Formation): SquadSlot[] {
  switch (formation) {
    case '4-4-2':
      return [
        { id: 'gk', label: 'GK', position: 'GK', player: null },
        { id: 'lb', label: 'LB', position: 'DF', player: null },
        { id: 'lcb', label: 'LCB', position: 'DF', player: null },
        { id: 'rcb', label: 'RCB', position: 'DF', player: null },
        { id: 'rb', label: 'RB', position: 'DF', player: null },
        { id: 'lm', label: 'LM', position: 'MF', player: null },
        { id: 'lcm', label: 'LCM', position: 'MF', player: null },
        { id: 'rcm', label: 'RCM', position: 'MF', player: null },
        { id: 'rm', label: 'RM', position: 'MF', player: null },
        { id: 'ls', label: 'LS', position: 'FW', player: null },
        { id: 'rs', label: 'RS', position: 'FW', player: null },
      ];
    case '4-3-3':
      return [
        { id: 'gk', label: 'GK', position: 'GK', player: null },
        { id: 'lb', label: 'LB', position: 'DF', player: null },
        { id: 'lcb', label: 'LCB', position: 'DF', player: null },
        { id: 'rcb', label: 'RCB', position: 'DF', player: null },
        { id: 'rb', label: 'RB', position: 'DF', player: null },
        { id: 'lcm', label: 'LCM', position: 'MF', player: null },
        { id: 'cm', label: 'CM', position: 'MF', player: null },
        { id: 'rcm', label: 'RCM', position: 'MF', player: null },
        { id: 'lw', label: 'LW', position: 'FW', player: null },
        { id: 'st', label: 'ST', position: 'FW', player: null },
        { id: 'rw', label: 'RW', position: 'FW', player: null },
      ];
    case '3-5-2':
      return [
        { id: 'gk', label: 'GK', position: 'GK', player: null },
        { id: 'lcb', label: 'LCB', position: 'DF', player: null },
        { id: 'cb', label: 'CB', position: 'DF', player: null },
        { id: 'rcb', label: 'RCB', position: 'DF', player: null },
        { id: 'lm', label: 'LM', position: 'MF', player: null },
        { id: 'ldm', label: 'LDM', position: 'MF', player: null },
        { id: 'cam', label: 'CAM', position: 'MF', player: null },
        { id: 'rdm', label: 'RDM', position: 'MF', player: null },
        { id: 'rm', label: 'RM', position: 'MF', player: null },
        { id: 'ls', label: 'LS', position: 'FW', player: null },
        { id: 'rs', label: 'RS', position: 'FW', player: null },
      ];
    case '5-3-2':
      return [
        { id: 'gk', label: 'GK', position: 'GK', player: null },
        { id: 'lwb', label: 'LWB', position: 'DF', player: null },
        { id: 'lcb', label: 'LCB', position: 'DF', player: null },
        { id: 'cb', label: 'CB', position: 'DF', player: null },
        { id: 'rcb', label: 'RCB', position: 'DF', player: null },
        { id: 'rwb', label: 'RWB', position: 'DF', player: null },
        { id: 'lcm', label: 'LCM', position: 'MF', player: null },
        { id: 'cm', label: 'CM', position: 'MF', player: null },
        { id: 'rcm', label: 'RCM', position: 'MF', player: null },
        { id: 'ls', label: 'LS', position: 'FW', player: null },
        { id: 'rs', label: 'RS', position: 'FW', player: null },
      ];
    case '4-2-3-1':
      return [
        { id: 'gk', label: 'GK', position: 'GK', player: null },
        { id: 'lb', label: 'LB', position: 'DF', player: null },
        { id: 'lcb', label: 'LCB', position: 'DF', player: null },
        { id: 'rcb', label: 'RCB', position: 'DF', player: null },
        { id: 'rb', label: 'RB', position: 'DF', player: null },
        { id: 'ldm', label: 'LDM', position: 'MF', player: null },
        { id: 'rdm', label: 'RDM', position: 'MF', player: null },
        { id: 'lam', label: 'LAM', position: 'MF', player: null },
        { id: 'cam', label: 'CAM', position: 'MF', player: null },
        { id: 'ram', label: 'RAM', position: 'MF', player: null },
        { id: 'st', label: 'ST', position: 'FW', player: null },
      ];
    case '3-4-3':
      return [
        { id: 'gk', label: 'GK', position: 'GK', player: null },
        { id: 'lcb', label: 'LCB', position: 'DF', player: null },
        { id: 'cb', label: 'CB', position: 'DF', player: null },
        { id: 'rcb', label: 'RCB', position: 'DF', player: null },
        { id: 'lm', label: 'LM', position: 'MF', player: null },
        { id: 'lcm', label: 'LCM', position: 'MF', player: null },
        { id: 'rcm', label: 'RCM', position: 'MF', player: null },
        { id: 'rm', label: 'RM', position: 'MF', player: null },
        { id: 'lw', label: 'LW', position: 'FW', player: null },
        { id: 'st', label: 'ST', position: 'FW', player: null },
        { id: 'rw', label: 'RW', position: 'FW', player: null },
      ];
    case '4-5-1':
      return [
        { id: 'gk', label: 'GK', position: 'GK', player: null },
        { id: 'lb', label: 'LB', position: 'DF', player: null },
        { id: 'lcb', label: 'LCB', position: 'DF', player: null },
        { id: 'rcb', label: 'RCB', position: 'DF', player: null },
        { id: 'rb', label: 'RB', position: 'DF', player: null },
        { id: 'lm', label: 'LM', position: 'MF', player: null },
        { id: 'lcm', label: 'LCM', position: 'MF', player: null },
        { id: 'cm', label: 'CM', position: 'MF', player: null },
        { id: 'rcm', label: 'RCM', position: 'MF', player: null },
        { id: 'rm', label: 'RM', position: 'MF', player: null },
        { id: 'st', label: 'ST', position: 'FW', player: null },
      ];
    case '4-3-2-1':
      return [
        { id: 'gk', label: 'GK', position: 'GK', player: null },
        { id: 'lb', label: 'LB', position: 'DF', player: null },
        { id: 'lcb', label: 'LCB', position: 'DF', player: null },
        { id: 'rcb', label: 'RCB', position: 'DF', player: null },
        { id: 'rb', label: 'RB', position: 'DF', player: null },
        { id: 'lcm', label: 'LCM', position: 'MF', player: null },
        { id: 'cm', label: 'CM', position: 'MF', player: null },
        { id: 'rcm', label: 'RCM', position: 'MF', player: null },
        { id: 'lf', label: 'LF', position: 'FW', player: null },
        { id: 'rf', label: 'RF', position: 'FW', player: null },
        { id: 'st', label: 'ST', position: 'FW', player: null },
      ];
    case '5-4-1':
      return [
        { id: 'gk', label: 'GK', position: 'GK', player: null },
        { id: 'lwb', label: 'LWB', position: 'DF', player: null },
        { id: 'lcb', label: 'LCB', position: 'DF', player: null },
        { id: 'cb', label: 'CB', position: 'DF', player: null },
        { id: 'rcb', label: 'RCB', position: 'DF', player: null },
        { id: 'rwb', label: 'RWB', position: 'DF', player: null },
        { id: 'lm', label: 'LM', position: 'MF', player: null },
        { id: 'lcm', label: 'LCM', position: 'MF', player: null },
        { id: 'rcm', label: 'RCM', position: 'MF', player: null },
        { id: 'rm', label: 'RM', position: 'MF', player: null },
        { id: 'st', label: 'ST', position: 'FW', player: null },
      ];
  }
}
