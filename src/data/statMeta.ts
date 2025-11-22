export type CoreStatKey = 'money' | 'reputation' | 'sanity'

export const canonicalStats: Record<CoreStatKey, { label: string; short: string; format: (value: number) => string }>
  = {
    money: {
      label: 'RAHAT (mk)',
      short: 'Markat ja lahjonnat. Alle -1000 mk → Voudin huutokauppa.',
      format: (value: number) => `${value.toFixed(0)} mk`,
    },
    reputation: {
      label: 'MAINE',
      short: 'Reputaatio kylillä. Yli 95 → Veropetos-ratsia.',
      format: (value: number) => `${value} / 100`,
    },
    sanity: {
      label: 'JÄRKI (Mielenterveys)',
      short: 'Käryt ja kuiskeet päässä. 0 → Suljettu osasto.',
      format: (value: number) => `${value} / 100`,
    },
  }
