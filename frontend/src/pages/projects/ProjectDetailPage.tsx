import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, Download, Share2,
  Calendar, MapPin, User, DollarSign, Minus, Image as ImageIcon
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
    const storedProjects = localStorage.getItem('phomistone_projects');
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
    const storedProjects = localStorage.getItem('phomistone_projects');
    if (storedProjects) {
      const projects: Project[] = JSON.parse(storedProjects);
      const updatedProjects = projects.map(p =>
        p.id === project.id ? updatedProject : p
      );
      localStorage.setItem('phomistone_projects', JSON.stringify(updatedProjects));
    }

    setProject(updatedProject);
    alert(`프로젝트가 "${PROJECT_STATUS_CONFIG[newStatus].label}" 단계로 전환되었습니다.`);
  };

  const handleDelete = () => {
    if (!project) return;

    if (confirm(`"${project.name}" 프로젝트를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      // Remove from localStorage
      const storedProjects = localStorage.getItem('phomistone_projects');
      if (storedProjects) {
        const projects: Project[] = JSON.parse(storedProjects);
        const updatedProjects = projects.filter(p => p.id !== project.id);
        localStorage.setItem('phomistone_projects', JSON.stringify(updatedProjects));
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
    const storedProjects = localStorage.getItem('phomistone_projects');
    if (storedProjects) {
      const projects: Project[] = JSON.parse(storedProjects);
      const updatedProjects = projects.map(p =>
        p.id === project.id ? updatedProject : p
      );
      localStorage.setItem('phomistone_projects', JSON.stringify(updatedProjects));
    }

    setProject(updatedProject);
    setShowEditModal(false);
    alert('프로젝트가 수정되었습니다.');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border border-neutral-900 border-t-transparent animate-spin"></div>
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-800 flex-shrink-0">
        <div className="max-w-[1920px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-neutral-800 transition-colors duration-300"
              >
                <ArrowLeft className="w-5 h-5 text-white" strokeWidth={1.5} />
              </button>
              <div>
                <h1 className="text-2xl font-medium tracking-wider text-white uppercase">{project.name}</h1>
                <p className="text-sm font-medium tracking-wider text-neutral-400 mt-1 uppercase">Project Detail</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-6 py-2.5 bg-transparent border border-neutral-700 hover:border-neutral-500 text-white transition-colors duration-300 flex items-center gap-2 font-medium tracking-wider uppercase text-sm">
                <Share2 className="w-4 h-4" strokeWidth={1.5} />
                Share
              </button>
              <button className="px-6 py-2.5 bg-transparent border border-neutral-700 hover:border-neutral-500 text-white transition-colors duration-300 flex items-center gap-2 font-medium tracking-wider uppercase text-sm">
                <Download className="w-4 h-4" strokeWidth={1.5} />
                Download
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-6 py-2.5 bg-transparent border border-neutral-700 hover:border-neutral-500 text-white transition-colors duration-300 flex items-center gap-2 font-medium tracking-wider uppercase text-sm"
              >
                <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2.5 bg-neutral-800 border border-neutral-800 hover:bg-neutral-700 hover:border-neutral-700 text-white transition-colors duration-300 flex items-center gap-2 font-medium tracking-wider uppercase text-sm"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-[1920px] mx-auto px-6 py-8">
          <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">

            {/* Left: Project Information */}
            <div className="flex flex-col gap-8 overflow-y-auto">

              {/* Styling Images (Before/After) */}
              {project.beforeImage && project.afterImage && (
                <div className="bg-neutral-50 border border-neutral-200 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Minus className="w-5 h-5 text-neutral-900" strokeWidth={1.5} />
                    <h2 className="text-lg font-medium tracking-wider uppercase text-neutral-900">Styling Result</h2>
                  </div>

                  <div className="overflow-hidden border border-neutral-300 relative" style={{ height: '500px' }}>
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
                    <div className="absolute top-4 left-4 bg-neutral-900 text-white px-4 py-2 text-xs font-medium tracking-wider uppercase shadow-sm">
                      Before
                    </div>
                    <div className="absolute top-4 right-4 bg-neutral-900 text-white px-4 py-2 text-xs font-medium tracking-wider uppercase shadow-sm">
                      After
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Information Card */}
              <div className="bg-neutral-50 border border-neutral-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Minus className="w-5 h-5 text-neutral-900" strokeWidth={1.5} />
                  <h2 className="text-lg font-medium tracking-wider uppercase text-neutral-900">Project Information</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4 pb-6 border-b border-neutral-200">
                    <User className="w-5 h-5 text-neutral-600 mt-1 flex-shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium tracking-wider uppercase text-neutral-500 mb-2">Client Name</p>
                      <p className="text-base text-neutral-900">{project.clientName || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 pb-6 border-b border-neutral-200">
                    <MapPin className="w-5 h-5 text-neutral-600 mt-1 flex-shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium tracking-wider uppercase text-neutral-500 mb-2">Site Address</p>
                      <p className="text-base text-neutral-900">{project.siteAddress || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 pb-6 border-b border-neutral-200">
                    <Minus className="w-5 h-5 text-neutral-600 mt-1 flex-shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium tracking-wider uppercase text-neutral-500 mb-2">Material</p>
                      <p className="text-base text-neutral-900">{project.materialName || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 pb-6 border-b border-neutral-200">
                    <DollarSign className="w-5 h-5 text-neutral-600 mt-1 flex-shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium tracking-wider uppercase text-neutral-500 mb-2">Estimated Cost</p>
                      <p className="text-base text-neutral-900">
                        {project.estimatedCost
                          ? `₩${project.estimatedCost.toLocaleString()}`
                          : '-'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Calendar className="w-5 h-5 text-neutral-600 mt-1 flex-shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium tracking-wider uppercase text-neutral-500 mb-2">Created Date</p>
                      <p className="text-base text-neutral-900">
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

            {/* Right: Status Management Panel */}
            <div className="flex flex-col gap-6 overflow-y-auto">

              {/* Current Status Card */}
              <div className="bg-neutral-50 border border-neutral-200 p-6 flex-shrink-0">
                <h2 className="text-lg font-medium tracking-wider uppercase text-neutral-900 mb-6">Project Status</h2>

                <ProjectStatusBadge
                  status={project.status}
                  onStatusChange={handleStatusChange}
                  showActions={true}
                  size="lg"
                />

                <div className="mt-8 pt-8 border-t border-neutral-200">
                  <p className="text-xs font-medium tracking-wider uppercase text-neutral-500 mb-4">Progress Steps</p>
                  <div className="space-y-3">
                    {statusKeys.map((statusKey, index) => {
                      const config = PROJECT_STATUS_CONFIG[statusKey];
                      const isCompleted = index < currentStatusIndex;
                      const isCurrent = index === currentStatusIndex;

                      return (
                        <div key={statusKey} className="flex items-center gap-4">
                          <div className={`w-6 h-6 border flex items-center justify-center text-xs font-medium flex-shrink-0 transition-colors duration-300 ${
                            isCompleted ? 'bg-neutral-900 border-neutral-900 text-white' :
                            isCurrent ? 'bg-neutral-900 border-neutral-900 text-white' :
                            'bg-transparent border-neutral-300 text-neutral-600'
                          }`}>
                            {isCompleted ? '—' : index + 1}
                          </div>
                          <span className={`text-sm tracking-wider ${
                            isCurrent ? 'text-neutral-900 font-medium' : 'text-neutral-700'
                          }`}>
                            {config.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Change History */}
              <div className="bg-neutral-50 border border-neutral-200 p-6 flex-shrink-0">
                <h2 className="text-lg font-medium tracking-wider uppercase text-neutral-900 mb-6">Change History</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-4 border-b border-neutral-200">
                    <div className="w-1.5 h-1.5 bg-neutral-900 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-900">견적 단계로 전환</p>
                      <p className="text-xs font-medium tracking-wider text-neutral-500 mt-1.5">
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
                    <div className="w-1.5 h-1.5 bg-neutral-600 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-900">프로젝트 생성</p>
                      <p className="text-xs font-medium tracking-wider text-neutral-500 mt-1.5">
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
