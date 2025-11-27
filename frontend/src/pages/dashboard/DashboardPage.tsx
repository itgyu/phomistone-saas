import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, DollarSign, Sparkles, FileText, Clock, CheckCircle2, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { projectService } from '@/services/ProjectService';
import type { Project } from '@/types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      const data = await projectService.getAll();
      setProjects(data);
      setLoading(false);
    };
    loadProjects();
  }, []);

  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'Draft' || p.status === 'Proposal').length,
    completed: projects.filter(p => p.status === 'Contract' || p.status === 'Construction').length,
    totalValue: projects.reduce((sum, p) => sum + p.estimatedCost, 0)
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'Draft': 'bg-phomi-gray-100 text-phomi-gray-700 border border-phomi-gray-200',
      'Proposal': 'bg-blue-50 text-blue-700 border border-blue-200',
      'Contract': 'bg-green-50 text-green-700 border border-green-200',
      'Construction': 'bg-phomi-gold/10 text-phomi-gold border border-phomi-gold/30'
    };

    const labels = {
      'Draft': '작성 중',
      'Proposal': '제안',
      'Contract': '계약',
      'Construction': '시공'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles] || styles.Draft}`}>
        {status === 'Contract' || status === 'Construction' ? (
          <CheckCircle2 className="w-3 h-3" />
        ) : (
          <Clock className="w-3 h-3" />
        )}
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-phomi-gray-50 to-white">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/80">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-title text-phomi-black mb-1 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-phomi-gold" />
                프로젝트 대시보드
              </h1>
              <p className="text-caption">
                Phomistone AI 스타일링 프로젝트 관리
              </p>
            </div>
            <button
              onClick={() => navigate('/ai-styling')}
              className="bg-gradient-to-r from-phomi-gold to-phomi-black text-white text-button px-6 py-3 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 group"
            >
              <Plus className="w-5 h-5" />
              새 프로젝트
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 총 프로젝트 */}
          <div className="card-base group p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                <FileText className="w-6 h-6 text-gray-900 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="text-right">
                <p className="text-title text-2xl mb-1">
                  {stats.total}
                </p>
                <p className="text-caption">총 프로젝트</p>
              </div>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-900 w-full transition-all duration-500"></div>
            </div>
          </div>

          {/* 진행 중 */}
          <div className="card-base group p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-500 transition-all duration-300">
                <Clock className="w-6 h-6 text-blue-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="text-right">
                <p className="text-title text-2xl mb-1">
                  {stats.inProgress}
                </p>
                <p className="text-caption">진행 중</p>
              </div>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* 완료됨 */}
          <div className="card-base group p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-500 transition-all duration-300">
                <CheckCircle2 className="w-6 h-6 text-green-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="text-right">
                <p className="text-title text-2xl mb-1">
                  {stats.completed}
                </p>
                <p className="text-caption">완료됨</p>
              </div>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* 총 견적가 */}
          <div className="group bg-gradient-to-br from-phomi-gold to-phomi-black rounded-2xl p-6 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="text-right">
                <p className="text-title text-2xl mb-1">
                  ₩{(stats.totalValue / 10000).toFixed(0)}만
                </p>
                <p className="text-caption text-white/90">총 견적가</p>
              </div>
            </div>
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white w-full transition-all duration-500"></div>
            </div>
          </div>
        </div>

        {/* 프로젝트 리스트 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-phomi-gold/30 border-t-phomi-gold rounded-full animate-spin"></div>
          </div>
        ) : projects.length === 0 ? (
          /* Empty State */}
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-phomi-gold/10 rounded-full mb-6">
              <ImageIcon className="w-10 h-10 text-phomi-gold" />
            </div>
            <h3 className="text-title mb-2">
              아직 프로젝트가 없습니다
            </h3>
            <p className="text-body mb-8 max-w-md mx-auto">
              첫 번째 프로젝트를 생성하고<br />
              AI 스타일링을 시작하세요
            </p>
            <button
              onClick={() => navigate('/ai-styling')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-phomi-gold to-phomi-black text-white text-button px-8 py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
            >
              <Plus className="w-5 h-5" />
              새 프로젝트 생성
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        ) : (
          /* 프로젝트 그리드 */
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-title">
                프로젝트 목록
              </h2>
              <p className="text-caption">
                총 {projects.length}개
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group bg-white rounded-2xl border border-phomi-gray-100 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => {/* 상세 페이지로 이동 */}}
                >
                  {/* 이미지 */}
                  <div className="relative aspect-video bg-phomi-gray-100 overflow-hidden">
                    <img
                      src={project.afterImage}
                      alt={project.clientName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(project.status)}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* 정보 */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-caption text-gray-400 font-semibold mb-1">
                          {project.id}
                        </p>
                        <h3 className="text-title text-phomi-black mb-1 group-hover:text-phomi-gold transition-colors duration-300">
                          {project.clientName}
                        </h3>
                        <p className="text-body line-clamp-1">
                          {project.materialName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span className="text-caption">
                          {new Date(project.createdAt).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-title">
                        ₩{project.estimatedCost.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
