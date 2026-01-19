const PERIOD_TYPE_RANK = {
  year: 0,
  month: 1,
  unknown: 2,
};

function parsePeriod(period) {
  if (period === '') {
    return { kind: 'empty' };
  }

  if (/^\d{4}$/.test(period)) {
    return { kind: 'year', year: Number(period) };
  }

  const monthMatch = period.match(/^(\d{4})-(\d{2})$/);
  if (monthMatch) {
    return { kind: 'month', year: Number(monthMatch[1]), month: Number(monthMatch[2]) };
  }

  return { kind: 'unknown' };
}

export function sortPeriods(periods) {
  return [...periods].sort((a, b) => {
    if (a === '' && b === '') return 0;
    if (a === '') return -1;
    if (b === '') return 1;

    const parsedA = parsePeriod(a);
    const parsedB = parsePeriod(b);

    const yearA = parsedA.year;
    const yearB = parsedB.year;

    const hasYearA = typeof yearA === 'number' && !Number.isNaN(yearA);
    const hasYearB = typeof yearB === 'number' && !Number.isNaN(yearB);

    if (hasYearA && hasYearB && yearA !== yearB) {
      return yearB - yearA;
    }

    if (hasYearA !== hasYearB) {
      return hasYearA ? -1 : 1;
    }

    const rankA = PERIOD_TYPE_RANK[parsedA.kind] ?? PERIOD_TYPE_RANK.unknown;
    const rankB = PERIOD_TYPE_RANK[parsedB.kind] ?? PERIOD_TYPE_RANK.unknown;

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    if (parsedA.kind === 'month' && parsedB.kind === 'month' && parsedA.month !== parsedB.month) {
      return parsedB.month - parsedA.month;
    }

    return String(b).localeCompare(String(a));
  });
}
