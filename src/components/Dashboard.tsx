import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { DataUploader } from './DataUploader';
import { FilterSidebar } from './FilterSidebar';
import { CumulativeGauge, AnnualGauge } from './KpiGauges';
import { YearlyCompareChart } from './YearlyCompareChart';
import { CustomerTrendChart } from './CustomerTrendChart';


// ──────────────────────────────────────────────────────────────────
// ★ CSS Grid 기반 대시보드 (react-grid-layout 제거)
//   react-grid-layout은 props(rowHeight, margin, cols 등)를 
//   silently 무시하는 치명적 버그가 있어, CSS Grid로 교체.
//   CSS Grid는 브라우저 네이티브이므로 100% 결정론적(deterministic)으로 동작.
//
//   레이아웃:
//   ┌──────────┬──────────────────────────────┐
//   │  게이지1  │          차트1              │  row 1 (50%)
//   ├──────────┤──────────────────────────────┤
//   │  게이지2  │          차트2              │  row 2 (50%)
//   └──────────┴──────────────────────────────┘
//     col: 25%            col: 75%
// ──────────────────────────────────────────────────────────────────

const WidgetWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col relative group overflow-hidden h-full">
    <div className="flex-1 min-h-0 w-full p-2 overflow-hidden">
      {children}
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { isInitialLoad, salesData } = useDashboard();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {!isInitialLoad && salesData.length > 0 && <FilterSidebar />}
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* 헤더: 고정 높이 */}
        <header className="flex-none z-10 bg-slate-50 px-6 py-3">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            2026년 전북지역본부 <span className="text-indigo-600">경영현황</span>
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            실시간 매출 현황 및 목표 달성률 대시보드
          </p>
        </header>

        {isInitialLoad || salesData.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
            <DataUploader />
          </div>
        ) : (
          /* ★ CSS Grid: flex-1로 남은 공간 전부 차지, overflow-y-auto로 확대 시 스크롤 지원 */
          <div
            className="flex-1 min-h-0 w-full bg-slate-50 p-3 overflow-y-auto custom-scrollbar"
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr',   /* 게이지 좁은 고정 폭 : 차트 나머지 전부 */
              gridTemplateRows: '1fr 1fr',       /* 50% : 50% */
              gap: '12px',
            }}
          >
            {/* 좌상: 누적 달성률 게이지 */}
            <WidgetWrapper><CumulativeGauge /></WidgetWrapper>

            {/* 우상: 연도별 월 실적 차트 */}
            <WidgetWrapper><YearlyCompareChart /></WidgetWrapper>

            {/* 좌하: 연간 진도율 게이지 */}
            <WidgetWrapper><AnnualGauge /></WidgetWrapper>

            {/* 우하: 고객별 매출 추이 차트 */}
            <WidgetWrapper><CustomerTrendChart /></WidgetWrapper>
          </div>
        )}
      </main>
    </div>
  );
};
