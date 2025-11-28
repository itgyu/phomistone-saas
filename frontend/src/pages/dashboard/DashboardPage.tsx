import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, DollarSign, Minus, FileText, Clock, CheckCircle2, Image as ImageIcon, ArrowRight, Filter, Trash2 } from 'lucide-react';
import { projectService } from '@/services/ProjectService';
import ProjectStatusBadge from '@/components/project/ProjectStatusBadge';
import { Project, ProjectStatus, PROJECT_STATUS_CONFIG } from '@/types/project';
import { LegacyProject } from '@/types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

  useEffect(() => {
    loadProjects();
  }, []);

  // Load projects safely
  const loadProjects = async () => {
    setLoading(true);

    try {
      // Load from unified localStorage key
      const storedProjects = localStorage.getItem('phomistone_projects');

      if (storedProjects) {
        const parsedProjects: Project[] = JSON.parse(storedProjects);
        // Ensure all projects have a status field with default value
        const projectsWithStatus = (Array.isArray(parsedProjects) ? parsedProjects : []).map(p => ({
          ...p,
          status: p.status || 'draft' as ProjectStatus
        }));
        setProjects(projectsWithStatus);
      } else {
        // Fallback: Load legacy projects from service
        const legacyData = await projectService.getAll() as LegacyProject[];

        // Convert legacy projects to new format
        const convertedProjects: Project[] = legacyData.map(legacy => ({
          id: legacy.id,
          name: legacy.clientName,
          clientName: legacy.clientName,
          status: convertLegacyStatus(legacy.status),
          estimatedCost: legacy.estimatedCost,
          materialName: legacy.materialName,
          beforeImage: legacy.beforeImage,
          afterImage: legacy.afterImage,
          createdAt: legacy.createdAt,
          updatedAt: legacy.updatedAt || legacy.createdAt
        }));

        setProjects(convertedProjects);
      }
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Convert legacy status to new status
  const convertLegacyStatus = (status: string): ProjectStatus => {
    const statusMap: Record<string, ProjectStatus> = {
      'Draft': 'draft',
      'Proposal': 'proposal',
      'Contract': 'contract',
      'Construction': 'construction'
    };
    return statusMap[status] || 'draft';
  };

  // Delete project safely
  const handleDeleteProject = (projectId: string, projectName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to detail page

    if (!confirm(`"${projectName}" 프로젝트를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      // Get from unified localStorage key
      const storedProjects = localStorage.getItem('phomistone_projects');

      if (!storedProjects) {
        // If no localStorage, just remove from state
        setProjects(prev => prev.filter(p => p.id !== projectId));
        alert('프로젝트가 삭제되었습니다.');
        return;
      }

      // Remove from localStorage
      const projects = JSON.parse(storedProjects);
      const updatedProjects = projects.filter((p: any) => p.id !== projectId);

      // Save to localStorage
      localStorage.setItem('phomistone_projects', JSON.stringify(updatedProjects));

      // Update state
      setProjects(updatedProjects);

      alert('프로젝트가 삭제되었습니다.');
    } catch (error) {
      console.error('프로젝트 삭제 실패:', error);
      alert('프로젝트 삭제에 실패했습니다. 새로고침 후 다시 시도해주세요.');
    }
  };

  // Reset all projects
  const handleResetAllProjects = () => {
    if (confirm('모든 프로젝트를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) {
      try {
        localStorage.removeItem('phomistone_projects');
        localStorage.removeItem('projects'); // Remove old key too
        setProjects([]);
        alert('모든 프로젝트가 삭제되었습니다.');
      } catch (error) {
        console.error('초기화 실패:', error);
        alert('초기화에 실패했습니다.');
      }
    }
  };

  // Filter projects by status
  const filteredProjects = projects.filter(p =>
    statusFilter === 'all' || p.status === statusFilter
  );

  const stats = {
    total: projects.length,
    draft: projects.filter(p => p.status === 'draft').length,
    estimate: projects.filter(p => p.status === 'estimate').length,
    proposal: projects.filter(p => p.status === 'proposal').length,
    contract: projects.filter(p => p.status === 'contract').length,
    construction: projects.filter(p => p.status === 'construction').length,
    completed: projects.filter(p => p.status === 'completed').length,
    inProgress: projects.filter(p => ['draft', 'estimate', 'proposal'].includes(p.status)).length,
    totalValue: projects.reduce((sum, p) => sum + (p.estimatedCost || 0), 0)
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* 헤더 */}
      <div className="bg-[#FAFAFA] border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-[#FAFAFA]/80">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-title text-phomi-black mb-1 flex items-center gap-3 font-medium tracking-wider uppercase">
                <Minus className="w-5 h-5 text-phomi-black" />
                프로젝트 대시보드
              </h1>
              <p className="text-caption font-medium tracking-wider text-neutral-500">
                Phomistone AI 스타일링 프로젝트 관리
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Debug button (development only) */}
              {import.meta.env.DEV && (
                <button
                  onClick={handleResetAllProjects}
                  className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-caption transition-all font-medium tracking-wider uppercase"
                  title="모든 프로젝트 삭제"
                >
                  초기화
                </button>
              )}

              <button
                onClick={() => navigate('/ai-styling')}
                className="bg-neutral-900 text-white text-button px-6 py-3 hover:bg-neutral-800 transition-all duration-300 flex items-center gap-2 group font-medium tracking-wider uppercase"
              >
                <Plus className="w-5 h-5" />
                새 프로젝트
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 총 프로젝트 */}
          <div className="card-base group p-6 hover:bg-neutral-50 transition-all duration-300 cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                <FileText className="w-6 h-6 text-gray-900 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="text-right">
                <p className="text-title text-2xl mb-1 font-medium tracking-wider text-neutral-900">
                  {stats.total}
                </p>
                <p className="text-caption font-medium tracking-wider uppercase text-neutral-500">총 프로젝트</p>
              </div>
            </div>
            <div className="h-1 bg-gray-100 overflow-hidden">
              <div className="h-full bg-gray-900 w-full transition-all duration-500"></div>
            </div>
          </div>

          {/* 진행 중 */}
          <div className="card-base group p-6 hover:bg-neutral-50 transition-all duration-300 cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-neutral-50 group-hover:bg-neutral-500 transition-all duration-300">
                <Clock className="w-6 h-6 text-neutral-700 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="text-right">
                <p className="text-title text-2xl mb-1 font-medium tracking-wider text-neutral-900">
                  {stats.inProgress}
                </p>
                <p className="text-caption font-medium tracking-wider uppercase text-neutral-500">진행 중</p>
              </div>
            </div>
            <div className="h-1 bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-neutral-500 transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* 완료됨 */}
          <div className="card-base group p-6 hover:bg-neutral-50 transition-all duration-300 cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-neutral-50 group-hover:bg-neutral-500 transition-all duration-300">
                <CheckCircle2 className="w-6 h-6 text-neutral-700 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="text-right">
                <p className="text-title text-2xl mb-1 font-medium tracking-wider text-neutral-900">
                  {stats.completed}
                </p>
                <p className="text-caption font-medium tracking-wider uppercase text-neutral-500">완료됨</p>
              </div>
            </div>
            <div className="h-1 bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-neutral-500 transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* 총 견적가 */}
          <div className="group bg-neutral-900 p-6 text-white hover:bg-neutral-800 transition-all duration-300 cursor-pointer shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="text-right">
                <p className="text-title text-2xl mb-1 font-medium tracking-wider">
                  ₩{(stats.totalValue / 10000).toFixed(0)}만
                </p>
                <p className="text-caption text-white/90 font-medium tracking-wider uppercase">총 견적가</p>
              </div>
            </div>
            <div className="h-1 bg-white/20 overflow-hidden">
              <div className="h-full bg-white w-full transition-all duration-500"></div>
            </div>
          </div>
        </div>

        {/* 상태 필터 */}
        {projects.length > 0 && (
          <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-gold">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter className="w-4 h-4 text-neutral-700" />
              <span className="text-body font-medium tracking-wider uppercase text-neutral-700">상태 필터:</span>
            </div>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 text-button transition-all flex-shrink-0 font-medium tracking-wider uppercase ${
                statusFilter === 'all'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-neutral-600 hover:bg-gray-200'
              }`}
            >
              전체 ({stats.total})
            </button>
            {Object.entries(PROJECT_STATUS_CONFIG).map(([key, config]) => {
              const statusKey = key as ProjectStatus;
              const count = stats[statusKey] || 0;
              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter(statusKey)}
                  className={`px-4 py-2 text-button transition-all flex-shrink-0 border font-medium tracking-wider uppercase ${
                    statusFilter === statusKey
                      ? `${config.bgColor} ${config.textColor} ${config.borderColor}`
                      : 'bg-white text-neutral-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {config.label} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* 프로젝트 리스트 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-neutral-900/30 border-t-neutral-900 animate-spin"></div>
          </div>
        ) : projects.length === 0 ? (
          /* Empty State */
          <div className="bg-white border-2 border-dashed border-gray-300 p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-900/10 mb-6">
              <ImageIcon className="w-10 h-10 text-neutral-900" />
            </div>
            <h3 className="text-title mb-2 font-medium tracking-wider text-neutral-900">
              아직 프로젝트가 없습니다
            </h3>
            <p className="text-body mb-8 max-w-md mx-auto font-normal tracking-wider text-neutral-700">
              첫 번째 프로젝트를 생성하고<br />
              AI 스타일링을 시작하세요
            </p>
            <button
              onClick={() => navigate('/ai-styling')}
              className="inline-flex items-center gap-2 bg-neutral-900 text-white text-button px-8 py-4 hover:bg-neutral-800 transition-all duration-300 group font-medium tracking-wider uppercase"
            >
              <Plus className="w-5 h-5" />
              새 프로젝트 생성
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          /* No results for filter */
          <div className="bg-white border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 mb-4">
              <Filter className="w-8 h-8 text-neutral-600" />
            </div>
            <h3 className="text-title mb-2 font-medium tracking-wider text-neutral-900">
              해당 상태의 프로젝트가 없습니다
            </h3>
            <p className="text-body text-neutral-700 mb-6 font-normal tracking-wider">
              다른 상태 필터를 선택해보세요
            </p>
            <button
              onClick={() => setStatusFilter('all')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-neutral-700 text-button transition-all font-medium tracking-wider uppercase"
            >
              전체 보기
            </button>
          </div>
        ) : (
          /* 프로젝트 그리드 */
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-title font-medium tracking-wider text-neutral-900">
                프로젝트 목록
              </h2>
              <p className="text-caption font-medium tracking-wider text-neutral-500">
                {statusFilter === 'all' ? `총 ${projects.length}개` : `${filteredProjects.length}개 표시`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="group bg-white border border-gray-200 overflow-hidden hover:border-neutral-900 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  {/* 이미지 */}
                  <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    {project.afterImage ? (
                      <img
                        src={project.afterImage}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <ProjectStatusBadge status={project.status} size="sm" />
                    </div>
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => handleDeleteProject(project.id, project.name, e)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white transition-all hover:scale-110"
                        title="프로젝트 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* 정보 */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-caption text-neutral-500 font-medium tracking-wider uppercase mb-1 truncate">
                          #{project.id}
                        </p>
                        <h3 className="text-title text-phomi-black mb-1 group-hover:text-phomi-gold transition-colors duration-300 truncate font-medium tracking-wider">
                          {project.name}
                        </h3>
                        {project.clientName && (
                          <p className="text-body text-neutral-600 truncate font-normal tracking-wider">
                            {project.clientName}
                          </p>
                        )}
                        {project.materialName && (
                          <p className="text-caption text-neutral-700 line-clamp-1 mt-1 font-normal tracking-wider">
                            {project.materialName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-1 text-neutral-600">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="text-caption font-medium tracking-wider">
                          {new Date(project.createdAt).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      {project.estimatedCost && (
                        <p className="text-body font-medium tracking-wider text-neutral-900">
                          ₩{project.estimatedCost.toLocaleString()}
                        </p>
                      )}
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
