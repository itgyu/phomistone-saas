import { useState } from 'react';
import { Settings, Trash2, Eye, RefreshCw } from 'lucide-react';

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);

  const viewLocalStorage = () => {
    const projects = localStorage.getItem('phomistone_projects');
    const oldProjects = localStorage.getItem('projects');

    console.log('=== localStorage 내용 ===');
    console.log('phomistone_projects:', projects ? JSON.parse(projects) : '없음');
    console.log('projects (old key):', oldProjects ? JSON.parse(oldProjects) : '없음');
    console.log('All localStorage keys:', Object.keys(localStorage));

    alert('콘솔을 확인하세요 (F12)');
  };

  const resetProjects = () => {
    if (confirm('프로젝트 데이터를 초기화하시겠습니까?')) {
      localStorage.removeItem('phomistone_projects');
      localStorage.removeItem('projects'); // Remove old key
      alert('프로젝트 데이터가 초기화되었습니다.');
      window.location.reload();
    }
  };

  const clearAllData = () => {
    if (confirm('모든 localStorage 데이터를 삭제하시겠습니까?')) {
      localStorage.clear();
      alert('모든 데이터가 삭제되었습니다.');
      window.location.reload();
    }
  };

  const migrateOldData = () => {
    const oldProjects = localStorage.getItem('projects');
    const newProjects = localStorage.getItem('phomistone_projects');

    if (!oldProjects) {
      alert('마이그레이션할 데이터가 없습니다.');
      return;
    }

    if (newProjects && !confirm('기존 phomistone_projects 데이터가 있습니다. 덮어쓰시겠습니까?')) {
      return;
    }

    try {
      localStorage.setItem('phomistone_projects', oldProjects);
      localStorage.removeItem('projects');
      alert('데이터가 마이그레이션되었습니다.');
      window.location.reload();
    } catch (error) {
      console.error('마이그레이션 실패:', error);
      alert('마이그레이션에 실패했습니다.');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 mb-2 w-64">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">개발자 도구</h3>
            <span className="text-xs text-gray-500">DEV</span>
          </div>

          <div className="space-y-2">
            <button
              onClick={viewLocalStorage}
              className="w-full px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-medium transition-all text-left flex items-center gap-2"
            >
              <Eye className="w-3 h-3" />
              localStorage 확인
            </button>

            <button
              onClick={migrateOldData}
              className="w-full px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs font-medium transition-all text-left flex items-center gap-2"
            >
              <RefreshCw className="w-3 h-3" />
              데이터 마이그레이션
            </button>

            <button
              onClick={resetProjects}
              className="w-full px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg text-xs font-medium transition-all text-left flex items-center gap-2"
            >
              <Trash2 className="w-3 h-3" />
              프로젝트 초기화
            </button>

            <button
              onClick={clearAllData}
              className="w-full px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition-all text-left flex items-center gap-2"
            >
              <Trash2 className="w-3 h-3" />
              모든 데이터 삭제
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              현재 키: <code className="bg-gray-100 px-1 rounded">phomistone_projects</code>
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-black hover:bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        title="개발자 도구"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
}
