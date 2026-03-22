export const formatKoreanCurrencyCompact = (value: number) => {
  if (value === 0) return '0';
  const isNegative = value < 0;
  const absVal = Math.abs(value);

  let formatted = '';
  if (absVal >= 100000000) {
    // 억 단위 이상 (예: 1.5억, 2억)
    formatted = `${(absVal / 100000000).toFixed(1).replace('.0', '')}억`;
  } else if (absVal >= 10000) {
    // 만 단위 (예: 1,200만, 300만)
    formatted = `${new Intl.NumberFormat('ko-KR').format(Math.floor(absVal / 10000))}만`;
  } else {
    // 그 외 (예: 5,400)
    formatted = new Intl.NumberFormat('ko-KR').format(absVal);
  }

  return isNegative ? `-${formatted}` : formatted;
};

export const formatKoreanCurrencyTooltip = (value: number) => {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
};
