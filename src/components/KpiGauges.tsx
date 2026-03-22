import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';

// ──────────────────────────────────────────────────────────────────
// ★ 세로 막대 프로그레스 게이지 (140px 좁은 패널 최적화)
//   - 제목 2줄, 큰 글씨
//   - 세로 막대로 채움 비율 시각화
//   - 100% 기준선 + 눈금으로 위치 즉시 식별 가능
// ──────────────────────────────────────────────────────────────────

const BarGauge = ({ titleLine1, titleLine2, value, color }: { 
  titleLine1: string; titleLine2: string; value: number; color: string;
}) => {
  const isOver100 = value > 100;
  // 스케일: 100% 초과 시 120% 스케일, 미만이면 100% 스케일
  const maxScale = isOver100 ? 120 : 100;
  
  // 각 구간의 높이를 스케일 대비 비율로 계산
  const baseHeight = Math.min(value, 100) / maxScale * 100;     // 0~100% 구간 (기본색)
  const excessHeight = isOver100 ? (value - 100) / maxScale * 100 : 0; // 100% 초과 구간 (초록색)
  const totalFill = baseHeight + excessHeight;

  // 눈금 위치: 백분율을 스케일 대비로 변환 (bottom 기준)
  const pctToBottom = (pct: number) => `${(pct / maxScale) * 100}%`;

  return (
    <div className="flex flex-col items-center h-full w-full p-2 pt-1">
      {/* ── 상단 영역: 제목 + 수치 (위쪽 정렬) ── */}
      <div className="flex flex-col items-center justify-start flex-none">
        <p className="text-slate-800 font-bold text-sm leading-tight text-center">{titleLine1}</p>
        <p className="text-slate-800 font-bold text-sm leading-tight text-center mb-0.5">{titleLine2}</p>
        <div className="flex items-baseline gap-0.5">
          <span className="text-2xl font-extrabold tracking-tight" style={{ color }}>{value.toFixed(1)}</span>
          <span className="text-sm font-semibold text-slate-400">%</span>
        </div>
      </div>
      
      {/* ── 하단 영역: 막대 (나머지 공간 전부) ── */}
      <div className="flex-1 min-h-0 w-full flex items-stretch gap-1.5 mt-1">
        {/* 눈금 라벨 — 각 라벨을 실제 비율 위치에 absolute 배치 */}
        <div className="relative" style={{ width: '26px', fontSize: '7px', color: '#94a3b8' }}>
          {isOver100 && <span className="absolute right-0 text-right" style={{ bottom: `calc(${pctToBottom(120)} - 5px)` }}>120%</span>}
          <span className="absolute right-0 text-right font-bold" style={{ bottom: `calc(${pctToBottom(100)} - 5px)`, color: '#64748b' }}>100%</span>
          <span className="absolute right-0 text-right" style={{ bottom: `calc(${pctToBottom(75)} - 4px)` }}>75%</span>
          <span className="absolute right-0 text-right" style={{ bottom: `calc(${pctToBottom(50)} - 4px)` }}>50%</span>
          <span className="absolute right-0 text-right" style={{ bottom: `calc(${pctToBottom(25)} - 4px)` }}>25%</span>
          <span className="absolute right-0 text-right" style={{ bottom: '0px' }}>0%</span>
        </div>
        
        {/* 막대 본체 */}
        <div className="flex-1 relative rounded-md overflow-hidden bg-slate-100 border border-slate-200">
          {/* 기준 점선: 25%, 50%, 75% */}
          <div className="absolute w-full border-t border-dashed border-slate-200" style={{ bottom: pctToBottom(25) }} />
          <div className="absolute w-full border-t border-dashed border-slate-200" style={{ bottom: pctToBottom(50) }} />
          <div className="absolute w-full border-t border-dashed border-slate-200" style={{ bottom: pctToBottom(75) }} />
          
          {/* ★ 100% 기준선 (항상 표시, 진한 점선) */}
          <div className="absolute w-full border-t-2 border-dashed z-10" 
            style={{ bottom: pctToBottom(100), borderColor: '#64748b' }} 
          />
          
          {/* 기본 채움 바 (0% ~ 100%): 메인 컬러 */}
          <div 
            className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
            style={{ height: `${baseHeight}%`, backgroundColor: color, opacity: 0.8 }}
          />
          
          {/* ★ 초과 채움 바 (100% ~ value%): 초록색으로 구분 */}
          {isOver100 && (
            <div 
              className="absolute left-0 right-0 transition-all duration-1000 ease-out"
              style={{ 
                bottom: `${baseHeight}%`,
                height: `${excessHeight}%`, 
                backgroundColor: '#818cf8',  // indigo-400 (기본색보다 밝은 동일 계열)
                opacity: 0.85,
              }}
            />
          )}
          
          {/* 현재값 표시선 */}
          <div 
            className="absolute left-0 right-0 h-0.5 z-10"
            style={{ bottom: `${totalFill}%`, backgroundColor: isOver100 ? '#818cf8' : color, boxShadow: `0 0 4px ${isOver100 ? '#818cf8' : color}` }}
          />
        </div>
      </div>
    </div>
  );
};

export const CumulativeGauge: React.FC = () => {
  const { filteredSales, targetData } = useDashboard();

  const metrics = useMemo(() => {
    const sales2026 = filteredSales.filter(r => r.year === 2026);
    const maxMonth = sales2026.reduce((max, r) => Math.max(max, r.month), 0);

    const cumulativeSales = sales2026
      .filter(r => r.month <= maxMonth)
      .reduce((sum, r) => sum + r.salesAmount, 0);

    const target2026 = targetData.filter(r => r.year === 2026);
    const cumulativeTarget = target2026
      .filter(r => r.month <= maxMonth)
      .reduce((sum, r) => sum + r.targetAmount, 0);
    
    return cumulativeTarget > 0 ? (cumulativeSales / cumulativeTarget) * 100 : 0;
  }, [filteredSales, targetData]);

  return <BarGauge titleLine1="2026년" titleLine2="누적 달성률" value={metrics} color="#4f46e5" />;
};

export const AnnualGauge: React.FC = () => {
  const { filteredSales, targetData } = useDashboard();

  const metrics = useMemo(() => {
    const sales2026 = filteredSales.filter(r => r.year === 2026);
    const maxMonth = sales2026.reduce((max, r) => Math.max(max, r.month), 0);

    const cumulativeSales = sales2026
      .filter(r => r.month <= maxMonth)
      .reduce((sum, r) => sum + r.salesAmount, 0);

    const target2026 = targetData.filter(r => r.year === 2026);
    const totalTarget = target2026.reduce((sum, r) => sum + r.targetAmount, 0);

    return totalTarget > 0 ? (cumulativeSales / totalTarget) * 100 : 0;
  }, [filteredSales, targetData]);

  return <BarGauge titleLine1="2026년" titleLine2="연간 진도율" value={metrics} color="#0ea5e9" />;
};
