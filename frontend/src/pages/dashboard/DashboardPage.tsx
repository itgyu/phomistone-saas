import { FolderOpen, Clock, CheckCircle, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { label: '전체 프로젝트', value: '0', icon: FolderOpen, color: 'text-phomi-gold' },
    { label: '진행 중', value: '0', icon: Clock, color: 'text-blue-500' },
    { label: '완료', value: '0', icon: CheckCircle, color: 'text-green-500' },
    { label: '총 견적 금액', value: '₩0', icon: DollarSign, color: 'text-phomi-gold' },
  ];

  return (
    <div className="min-h-full bg-phomi-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-phomi-black mb-2">대시보드</h1>
          <p className="text-phomi-gray-500">프로젝트 현황을 한눈에 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-phomi-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <h3 className="text-phomi-gray-500 text-sm mb-1">{stat.label}</h3>
              <p className="text-2xl font-bold text-phomi-black">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* 프로젝트 테이블 */}
        <div className="bg-white rounded-2xl border border-phomi-gray-100 overflow-hidden">
          <div className="p-6 border-b border-phomi-gray-100">
            <h2 className="text-xl font-bold text-phomi-black">최근 프로젝트</h2>
          </div>

          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-phomi-gray-50 rounded-full mb-4">
              <FolderOpen className="w-8 h-8 text-phomi-gray-300" />
            </div>
            <p className="text-phomi-gray-500 mb-4">아직 프로젝트가 없습니다</p>
            <button className="px-6 py-3 bg-phomi-gold text-white font-medium rounded-xl hover:bg-phomi-black transition-colors duration-300">
              첫 프로젝트 시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
