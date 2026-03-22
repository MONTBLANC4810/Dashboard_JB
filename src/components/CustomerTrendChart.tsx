import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDashboard } from '../context/DashboardContext';
import { formatKoreanCurrencyCompact, formatKoreanCurrencyTooltip } from '../utils/formatters';

export const CustomerTrendChart: React.FC = () => {
  const { filteredSales } = useDashboard();
  const [topLimit, setTopLimit] = useState(10); // 10, 20, 30

  const chartData = useMemo(() => {
    const dataMap: Record<string, any> = {};

    filteredSales.forEach(r => {
      const timeKey = `${r.year}-${String(r.month).padStart(2, '0')}`;
      if (!dataMap[timeKey]) {
        dataMap[timeKey] = { time: timeKey, timestamp: r.year * 100 + r.month };
      }
      if (dataMap[timeKey][r.customerName] === undefined) {
        dataMap[timeKey][r.customerName] = 0;
      }
      // 양수/음수 모두 더해서 실제 총계를 계산
      dataMap[timeKey][r.customerName] += r.salesAmount;
    });

    // 월별 최종 합산액이 마이너스인 경우 그래프에서 표시하지 않음 (null 처리)
    Object.values(dataMap).forEach((monthData: any) => {
      Object.keys(monthData).forEach(key => {
        if (key !== 'time' && key !== 'timestamp' && typeof monthData[key] === 'number') {
          if (monthData[key] < 0) {
            monthData[key] = null;
          }
        }
      });
    });

    return Object.values(dataMap).sort((a, b: any) => a.timestamp - b.timestamp);
  }, [filteredSales]);

  const activeCustomers = useMemo(() => {
    // 렌더링 부하 방지 및 상위 N개 고객 표시
    const salesMap: Record<string, number> = {};
    filteredSales.forEach(r => {
      if (!salesMap[r.customerName]) salesMap[r.customerName] = 0;
      // 총계 기준 상위 고객 추출을 위해 여전히 전체 합산 반영
      salesMap[r.customerName] += r.salesAmount;
    });

    const sortedCustomers = Object.entries(salesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topLimit)
      .map(entry => entry[0]);

    return sortedCustomers;
  }, [filteredSales, topLimit]);

  // Extracts Quarter-ending months AND the very first/last data points for context
  const quarterlyTicks = useMemo(() => {
    if (chartData.length === 0) return undefined;
    
    const firstTime = chartData[0].time;
    const lastTime = chartData[chartData.length - 1].time;
    
    const ticks = chartData
      .map((d: any) => d.time)
      .filter((time, index) => {
        if (!time) return false;
        // 항상 시작점과 끝점은 포함 (최우선)
        if (time === firstTime || time === lastTime) return true;
        
        // 기본적으로는 분기(3,6,9,12월)만 표시
        const m = time.split('-')[1];
        if (!['03', '06', '09', '12'].includes(m)) return false;
        
        // 시작점이나 끝점과 너무 가까운 분기 레이블은 겹침 방지를 위해 생략
        const firstDist = index;
        const lastDist = (chartData.length - 1) - index;
        
        return firstDist > 1 && lastDist > 2;
      });
    return ticks.length > 0 ? ticks : undefined;
  }, [chartData]);

  const formatYAxis = (tickItem: number) => formatKoreanCurrencyCompact(tickItem);
  const formatTooltipStr = (value: number) => formatKoreanCurrencyTooltip(value);

  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full h-full">
      <div className="flex-none mb-2 px-2 pt-2 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">고객별 매출 추이</h3>
          <p className="text-xs text-slate-500 mt-0.5">선택한 조건의 상위 고객별 추이 (단위: 백만원)</p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-xs font-medium text-slate-600">표시 항목:</label>
          <select 
            value={topLimit} 
            onChange={(e) => setTopLimit(Number(e.target.value))}
            className="text-xs border border-slate-300 rounded-md py-1 px-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value={10}>상위 10개</option>
            <option value={20}>상위 20개</option>
            <option value={30}>상위 30개</option>
          </select>
        </div>
      </div>
      <div className="w-full flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 60, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              tick={{fill: '#64748b', fontSize: 11}} 
              ticks={quarterlyTicks}
              interval={0}
              minTickGap={10}
              padding={{ left: 30, right: 40 }}
              tickFormatter={(val) => {
                if (!val) return '';
                const parts = val.split('-');
                if (parts.length < 2) return val;
                return `'${parts[0].substring(2)}.${parts[1]}`;
              }}
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis 
              domain={[0, 'auto']}
              allowDataOverflow={false}
              tickFormatter={formatYAxis} 
              tick={{fill: '#64748b', fontSize: 11}} 
              axisLine={false} 
              tickLine={false} 
              width={50} 
            />
            <Tooltip 
              formatter={(value: any, name: any) => [formatTooltipStr(Number(value)), String(name)]}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px' }}
            />
            {activeCustomers.length <= 15 && <Legend wrapperStyle={{ paddingTop: '6px', fontSize: '11px', textAlign: 'left' }} align="left" />}
            {activeCustomers.map((customer) => (
              <Line 
                key={customer}
                type="monotone"
                dataKey={customer}
                stroke={stringToColor(customer)}
                strokeWidth={2}
                dot={{ r: 2, strokeWidth: 1 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
