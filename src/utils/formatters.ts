export const formatKoreanCurrencyCompact = (value: number) => {
  if (value === 0) return '0';
  const isNegative = value < 0;
  const absVal = Math.abs(value);

  let formatted = '';
  if (absVal >= 100000000) {
    // 억 단위
    formatted = `${(absVal / 100000000).toFixed(1).replace('.0', '')}억`;
  } else if (absVal >= 10000000) {
    // 천만 단위
    formatted = `${(absVal / 10000000).toFixed(0)}천만`;
  } else if (absVal >= 1000000) {
    // 백만 단위
    formatted = `${(absVal / 1000000).toFixed(0)}백만`;
  } else {
    // 그 외
    formatted = new Intl.NumberFormat('ko-KR').format(absVal);
  }

  return isNegative ? `-${formatted}` : formatted;
};

export const formatKoreanCurrencyTooltip = (value: number) => {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
};
