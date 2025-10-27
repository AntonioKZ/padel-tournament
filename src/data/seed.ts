import type { Tournament } from './types'

export const seed: Tournament = {
  name: 'Misto di Ottobre – City Catania Sports Club',
  date: '2025-10-24',
  timeWindow: ['18:30','21:00'],
  courts: 8,
  matchDurationMin: 25,
  breakMin: 5,
  groups: {
    A: [
      { id: 'A1', players: ['Giuseppe Leone','Angela Giannitto'] },
      { id: 'A2', players: ['Antonio Astuti','Silvia Paternò Castello'] },
      { id: 'A3', players: ['Antonio Di Salvo','Tiziana Arena'] },
      { id: 'A4', players: ['Alessandro Ventura','Emilia Belfiore'] },
    ],
    B: [
      { id: 'B1', players: ['Walter Scarpello','Francesca Agate'] },
      { id: 'B2', players: ['Marco Scuderi','Lisa Mazzei'] },
      { id: 'B3', players: ['Diego Lombardo','Anna Chisari'] },
      { id: 'B4', players: ['Ettore Anicito','Carmela Caruso'] },
    ],
    C: [
      { id: 'C1', players: ['Salvo Avola','Carmela Failla'] },
      { id: 'C2', players: ['Max Torre','Sonia De Angelis'] },
      { id: 'C3', players: ['Luigi Ferrara','Maria Enrica Mazzei'] },
      { id: 'C4', players: ['Giorgio Giannone','Lidia Rubino'] },
    ],
    D: [
      { id: 'D1', players: ['Daniele D’Arrigo','Gresi Cipriani'] },
      { id: 'D2', players: ['Enrico Russo','Emma Lindholm'] },
      { id: 'D3', players: ['Vincenzo Viaggio','Marina Astuti'] },
      { id: 'D4', players: ['Alessio Carbonaro','Tiziana Messina'] },
    ],
  },
  missingPhones: [
    'Lisa Mazzei',
    'Alessandro (compagno di Emilia)',
    'Giorgio Giannone',
    'Carmela Russo',
    'Alessio Asero',
    'Maria (compagna di Luigi Ferrara)',
  ],
}
