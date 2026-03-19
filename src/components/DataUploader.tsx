import React, { useCallback } from 'react';
import { UploadCloud } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { parseExcelData } from '../utils/excelParser';

export const DataUploader: React.FC = () => {
  const { updateData, setIsLoading, isLoading } = useDashboard();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const { sales, targets } = await parseExcelData(file);
      updateData(sales, targets);
    } catch (error) {
      console.error('Failed to parse Excel file:', error);
      alert('엑셀 파일을 읽는 중 오류가 발생했습니다. 파일 형식을 확인해주세요.');
    } finally {
      setIsLoading(false);
      if (event.target) event.target.value = '';
    }
  }, [updateData, setIsLoading]);

  return (
    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors w-full max-w-2xl mx-auto shadow-sm">
      <UploadCloud className="w-16 h-16 text-indigo-500 mb-4" />
      <h3 className="text-xl font-bold text-slate-800 mb-2">데이터 파일 업로드</h3>
      <p className="text-slate-500 mb-6 text-center">
        최신 매출 현황이 담긴 엑셀(.xlsx) 파일을 업로드해주세요.<br/>
        드래그 앤 드롭 또는 아래 버튼을 클릭하여 선택할 수 있습니다.
      </p>
      
      <label className="relative cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm">
        <span>파일 선택하기</span>
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          disabled={isLoading}
        />
      </label>
      
      {isLoading && (
        <div className="mt-4 text-indigo-600 flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"/>
          데이터를 처리하는 중입니다...
        </div>
      )}
    </div>
  );
};
