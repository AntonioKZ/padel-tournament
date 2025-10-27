export type PlayerName = string;
export type PairId = string;
export type Pair = { id: PairId; players: [PlayerName, PlayerName]; phones?: (string|null)[]; group?: GroupId };
export type GroupId = 'A'|'B'|'C'|'D';
export type Phase = 'GROUP'|'GOLD'|'SILVER';

export type Match = {
  id: string;
  phase: Phase;
  group?: GroupId;
  pairA: PairId;
  pairB: PairId;
  court?: number;
  slotIndex?: number;
  gamesA: number;
  gamesB: number;
  status: 'scheduled'|'live'|'finished';
};

export type Standing = { pairId: PairId; GF: number; GS: number; diff: number; rank?: number };

export type Tournament = {
  name: string;
  date: string; // YYYY-MM-DD
  timeWindow: [string,string];
  courts: number;
  matchDurationMin: number;
  breakMin: number;
  groups: Record<GroupId, Pair[]>;
  missingPhones: string[];
};
