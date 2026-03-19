import React, { useMemo } from 'react';
import { Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { useDashboard } from '../context/DashboardContext';
import { formatKoreanCurrencyCompact, formatKoreanCurrencyTooltip } from '../utils/formatters';

export const YearlyCompareChart: React.FC = () => {
  const { filteredSales, targetData } = useDashboard();

  const chartData = useMemo(() => {
    const dataByMonth: Record<number, any> = {};
    for (let m = 1; m <= 12; m++) {
      dataByMonth[m] = { month: `${m}월`, rawMonth: m };
      // Initialize years
      [2021, 2022, 2023, 2024, 2025, 2026].forEach(y => dataByMonth[m][y.toString()] = 0);
      dataByMonth[m]['Target2026'] = 0;
    }

    filteredSales.forEach(r => {
      if (r.year >= 2021 && r.year <= 2026 && r.month >= 1 && r.month <= 12) {
        dataByMonth[r.month][r.year.toString()] += r.salesAmount;
      }
    });

    targetData.forEach(r => {
      if (r.year === 2026 && r.month >= 1 && r.month <= 12) {
        dataByMonth[r.month]['Target2026'] += r.targetAmount;
      }
    });
    
    const presentMonths = new Set(filteredSales.map(s => s.month));
    if (presentMonths.size > 0) {
       return Object.values(dataByMonth).filter(d => presentMonths.has(d.rawMonth));
    }
    
    return Object.values(dataByMonth);
  }, [filteredSales, targetData]);

  if (filteredSales.length === 0) return null;

  const formatYAxis = (tickItem: number) => formatKoreanCurrencyCompact(tickItem);
  const formatTooltipStr = (value: number) => formatKoreanCurrencyTooltip(value);

  const colors = {
    '2021': '#e2e8f0', '2022': '#cbd5e1', '2023': '#94a3b8',
    '2024': '#6366f1', '2025': '#4f46e5', '2026': '#e11d48',
    'Target2026': '#10b981',
  };

  // ★ 선택된 연도들을 항상 오름차순(2021→2026)으로 정렬하여 막대 순서를 고정
  const activeYears = useMemo(() => {
    return [2021, 2022, 2023, 2024, 2025, 2026]
      .filter(y => filteredSales.some(r => r.year === y))
      .sort((a, b) => a - b);
  }, [filteredSales]);

  return (
    <div className="flex flex-col flex-1 w-full h-full">
      <div className="flex-none px-4 pt-4 mb-3">
        <h3 className="text-base font-bold text-slate-800">연도별 월 실적 및 2026년 목표</h3>
        <p className="text-xs text-slate-500 mt-0.5">막대: 올해 및 과거 실적, 꺾은선: 2026년 목표 (단위: 백만원)</p>
      </div>
      <div className="w-full flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            key={activeYears.join(',')}
            data={chartData} 
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
            <YAxis 
               domain={[0, 'auto']} 
               allowDataOverflow={true} 
               tickFormatter={formatYAxis} 
               tick={{fill: '#64748b', fontSize: 12}} 
               axisLine={false} 
               tickLine={false} 
               width={50} 
            />
            <Tooltip 
              formatter={(value: any, name: any) => {
                const nameStr = String(name);
                const cleanName = nameStr.replace(/년$/, '');
                return [formatTooltipStr(Number(value)), cleanName];
              }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px' }}
              itemSorter={(item: any) => {
                const name = String(item.name || '');
                if (name.includes('목표')) return -9999;
                const yearMatch = name.match(/(\d{4})/);
                if (yearMatch) return -parseInt(yearMatch[1]);
                return 0;
              }}
            />
            <Legend 
              {...({
                payload: [
                  ...activeYears.map(year => ({
                    value: `${year}년 실적`,
                    type: 'rect' as const,
                    color: colors[year.toString() as keyof typeof colors]
                  })),
                  {
                    value: '2026년 목표',
                    type: 'line' as const,
                    color: colors['Target2026']
                  }
                ],
                wrapperStyle: { paddingTop: '10px', fontSize: '12px' }
              } as any)} 
            />
            
            {/* 고정된 순서로 수동 렌더링 (2021 -> 2026) */}
            <Bar dataKey="2021" name="2021년 실적" fill={colors['2021']} radius={[4, 4, 0, 0]} barSize={12} hide={!activeYears.includes(2021)} legendType="none" />
            <Bar dataKey="2022" name="2022년 실적" fill={colors['2022']} radius={[4, 4, 0, 0]} barSize={12} hide={!activeYears.includes(2022)} legendType="none" />
            <Bar dataKey="2023" name="2023년 실적" fill={colors['2023']} radius={[4, 4, 0, 0]} barSize={12} hide={!activeYears.includes(2023)} legendType="none" />
            <Bar dataKey="2024" name="2024년 실적" fill={colors['2024']} radius={[4, 4, 0, 0]} barSize={12} hide={!activeYears.includes(2024)} legendType="none" />
            <Bar dataKey="2025" name="2025년 실적" fill={colors['2025']} radius={[4, 4, 0, 0]} barSize={12} hide={!activeYears.includes(2025)} legendType="none" />
            <Bar dataKey="2026" name="2026년 실적" fill={colors['2026']} radius={[4, 4, 0, 0]} barSize={12} hide={!activeYears.includes(2026)} legendType="none" />

            <Line 
              type="monotone" 
              dataKey="Target2026" 
              name="2026년 목표" 
              stroke={colors['Target2026']} 
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1 }}
              activeDot={{ r: 5 }}
              legendType="none"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
