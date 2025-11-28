import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, Download, Share2,
  Calendar, MapPin, User, DollarSign, Sparkles, Image as ImageIcon
} from 'lucide-react';
import {
  ReactCompareSlider,
  ReactCompareSliderImage
} from 'react-compare-slider';
import ProjectStatusBadge from '@/components/project/ProjectStatusBadge';
import { Project, ProjectStatus, PROJECT_STATUS_CONFIG, getStatusIndex } from '@/types/project';
import EditProjectModal from '@/components/project/EditProjectModal';
import { ProjectFormData } from '@/components/project/SaveProjectModal';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  // Load project from localStorage
  useEffect(() => {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      const projects: Project[] = JSON.parse(storedProjects);
      const foundProject = projects.find(p => p.id === id);
      if (foundProject) {
        setProject(foundProject);
      } else {
        alert('프로젝트를 찾을 수 없습니다.');
        navigate('/dashboard');
      }
    } else {
      alert('저장된 프로젝트가 없습니다.');
      navigate('/dashboard');
    }
    setLoading(false);
  }, [id, navigate]);

  const handleStatusChange = (newStatus: ProjectStatus) => {
    if (!project) return;

    const updatedProject = {
      ...project,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    // Update in localStorage
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      const projects: Project[] = JSON.parse(storedProjects);
      const updatedProjects = projects.map(p =>
        p.id === project.id ? updatedProject : p
      );
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
    }

    setProject(updatedProject);
    alert(`프로젝트가 "${PROJECT_STATUS_CONFIG[newStatus].label}" 단계로 전환되었습니다.`);
  };

  const handleDelete = () => {
    if (!project) return;

    if (confirm(`"${project.name}" 프로젝트를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      // Remove from localStorage
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        const projects: Project[] = JSON.parse(storedProjects);
        const updatedProjects = projects.filter(p => p.id !== project.id);
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
      }

      alert('프로젝트가 삭제되었습니다.');
      navigate('/dashboard');
    }
  };

  const handleEditProject = (formData: ProjectFormData) => {
    if (!project) return;

    const updatedProject: Project = {
      ...project,
      name: formData.name,
      clientName: formData.clientName,
      siteAddress: formData.siteAddress,
      estimatedCost: formData.estimatedCost ? parseInt(formData.estimatedCost) : undefined,
      updatedAt: new Date().toISOString()
    };

    // Update in localStorage
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      const projects: Project[] = JSON.parse(storedProjects);
      const updatedProjects = projects.map(p =>
        p.id === project.id ? updatedProject : p
      );
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
    }

    setProject(updatedProject);
    setShowEditModal(false);
    alert('프로젝트가 수정되었습니다.');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#C59C6C]/30 border-t-[#C59C6C] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Project not found (handled in useEffect, but just in case)
  if (!project) {
    return null;
  }

  const statusKeys = Object.keys(PROJECT_STATUS_CONFIG) as ProjectStatus[];
  const currentStatusIndex = getStatusIndex(project.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-black border-b border-gray-800 flex-shrink-0">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-title text-white">{project.name}</h1>
                <p className="text-caption text-gray-400">프로젝트 상세</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-button transition-all flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                공유
              </button>
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-button transition-all flex items-center gap-2">
                <Download className="w-4 h-4" />
                다운로드
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-button transition-all flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                수정
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-button transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-[1920px] mx-auto px-6 py-6">
          <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">

            {/* 왼쪽: 프로젝트 정보 */}
            <div className="flex flex-col gap-6 overflow-y-auto scrollbar-gold">

              {/* 스타일링 이미지 (Before/After) */}
              {project.beforeImage && project.afterImage && (
                <div className="card-base p-6">
                  <div className="section-header mb-4">
                    <ImageIcon className="w-5 h-5 text-[#C59C6C]" />
                    <h2 className="text-title">스타일링 결과</h2>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-gray-200 relative" style={{ height: '500px' }}>
                    <ReactCompareSlider
                      itemOne={
                        <ReactCompareSliderImage
                          src={project.beforeImage}
                          alt="Before"
                          style={{ objectFit: 'contain' }}
                        />
                      }
                      itemTwo={
                        <ReactCompareSliderImage
                          src={project.afterImage}
                          alt="After"
                          style={{ objectFit: 'contain' }}
                        />
                      }
                      style={{ height: '100%' }}
                    />
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-caption font-semibold backdrop-blur-sm">
                      Before
                    </div>
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-caption font-semibold backdrop-blur-sm">
                      After
                    </div>
                  </div>
                </div>
              )}

              {/* 기본 정보 카드 */}
              <div className="card-base p-6">
                <div className="section-header mb-4">
                  <Sparkles className="w-5 h-5 text-[#C59C6C]" />
                  <h2 className="text-title">프로젝트 정보</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-caption text-gray-500 mb-1">고객명</p>
                      <p className="text-body font-medium text-gray-900">{project.clientName || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-caption text-gray-500 mb-1">현장 주소</p>
                      <p className="text-body font-medium text-gray-900">{project.siteAddress || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-caption text-gray-500 mb-1">적용 자재</p>
                      <p className="text-body font-medium text-gray-900">{project.materialName || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-caption text-gray-500 mb-1">예상 견적</p>
                      <p className="text-body font-medium text-gray-900">
                        {project.estimatedCost
                          ? `₩${project.estimatedCost.toLocaleString()}`
                          : '-'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-caption text-gray-500 mb-1">생성일</p>
                      <p className="text-body font-medium text-gray-900">
                        {new Date(project.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 상태 관리 패널 */}
            <div className="flex flex-col gap-4 overflow-y-auto scrollbar-gold">

              {/* 현재 상태 카드 */}
              <div className="card-base p-6 flex-shrink-0">
                <h2 className="text-title mb-4">프로젝트 상태</h2>

                <ProjectStatusBadge
                  status={project.status}
                  onStatusChange={handleStatusChange}
                  showActions={true}
                  size="lg"
                />

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-caption text-gray-500 mb-3">진행 단계</p>
                  <div className="space-y-2">
                    {statusKeys.map((statusKey, index) => {
                      const config = PROJECT_STATUS_CONFIG[statusKey];
                      const isCompleted = index < currentStatusIndex;
                      const isCurrent = index === currentStatusIndex;

                      return (
                        <div key={statusKey} className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            isCompleted ? 'bg-emerald-500 text-white' :
                            isCurrent ? 'bg-[#C59C6C] text-white' :
                            'bg-gray-200 text-gray-400'
                          }`}>
                            {isCompleted ? '✓' : index + 1}
                          </div>
                          <span className={`text-body ${
                            isCurrent ? 'font-bold text-gray-900' : 'text-gray-500'
                          }`}>
                            {config.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 변경 이력 */}
              <div className="card-base p-6 flex-shrink-0">
                <h2 className="text-title mb-4">변경 이력</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                    <div className="w-2 h-2 bg-[#C59C6C] rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-body font-medium text-gray-900">견적 단계로 전환</p>
                      <p className="text-caption text-gray-500 mt-1">
                        {new Date(project.updatedAt).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-body font-medium text-gray-900">프로젝트 생성</p>
                      <p className="text-caption text-gray-500 mt-1">
                        {new Date(project.createdAt).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Project Modal */}
      {showEditModal && project && (
        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditProject}
          project={project}
        />
      )}
    </div>
  );
}
