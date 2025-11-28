/**
 * Phomistone Premium Design System - Reusable Components Library
 *
 * 다른 프로젝트에서 바로 사용할 수 있는 컴포넌트 모음
 * 각 컴포넌트를 복사해서 src/components/ 폴더에 넣으세요
 */

import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { LucideIcon, X } from 'lucide-react';

// ============================================
// 1. Button Component
// ============================================

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  children: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  children,
  fullWidth = false,
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'whitespace-nowrap transition-all duration-300 flex items-center justify-center gap-2 group font-medium tracking-wider uppercase touch-target disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-neutral-900 text-white hover:bg-neutral-800 disabled:hover:bg-neutral-900',
    secondary: 'bg-gray-100 text-neutral-700 hover:bg-gray-200 disabled:hover:bg-gray-100',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200 disabled:hover:bg-red-100'
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-2.5 md:px-6 md:py-3 text-xs md:text-sm',
    lg: 'px-6 py-3 md:px-8 md:py-4 text-sm md:text-base'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>처리중...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
          <span>{children}</span>
          {IconRight && <IconRight className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300" />}
        </>
      )}
    </button>
  );
}

// ============================================
// 2. Card Component
// ============================================

interface CardProps {
  children: ReactNode;
  hover?: boolean;
  onClick?: () => void;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export function Card({
  children,
  hover = false,
  onClick,
  className = '',
  padding = 'md'
}: CardProps) {
  const hoverStyles = hover ? 'hover:bg-neutral-50 cursor-pointer' : '';

  const paddingStyles = {
    none: '',
    sm: 'p-3 md:p-4',
    md: 'p-4 md:p-5 lg:p-6',
    lg: 'p-6 md:p-8 lg:p-10'
  };

  return (
    <div
      onClick={onClick}
      className={`card-base group transition-all duration-300 ${hoverStyles} ${paddingStyles[padding]} ${className}`}
    >
      {children}
    </div>
  );
}

// ============================================
// 3. Modal Component
// ============================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlay?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
  closeOnOverlay = true
}: ModalProps) {
  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md md:max-w-2xl',
    lg: 'sm:max-w-lg md:max-w-3xl',
    xl: 'sm:max-w-xl md:max-w-4xl'
  };

  const handleOverlayClick = () => {
    if (closeOnOverlay) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleOverlayClick}
      />

      {/* Modal */}
      <div className={`relative z-10 w-full ${maxWidthStyles[maxWidth]} bg-white rounded-t-xl sm:rounded-xl overflow-hidden flex flex-col max-h-[90vh] pb-safe`}>

        {/* Mobile drag indicator */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-neutral-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-base md:text-2xl font-medium tracking-wider text-neutral-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-4 md:px-8 py-4 border-t border-gray-200 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// 4. Input Component
// ============================================

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2 tracking-wider">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 border ${
          error ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-neutral-900'
        } focus:outline-none transition-colors duration-200 text-base md:text-sm ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium tracking-wider">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-neutral-500 font-normal tracking-wider">
          {helperText}
        </p>
      )}
    </div>
  );
}

// ============================================
// 5. Textarea Component
// ============================================

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2 tracking-wider">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-3 border ${
          error ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-neutral-900'
        } focus:outline-none transition-colors duration-200 resize-none text-base md:text-sm ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium tracking-wider">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-neutral-500 font-normal tracking-wider">
          {helperText}
        </p>
      )}
    </div>
  );
}

// ============================================
// 6. Badge Component
// ============================================

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-orange-50 text-orange-700 border-orange-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    dark: 'bg-neutral-900 text-white border-neutral-900'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2 py-1 text-xs gap-1',
    lg: 'px-3 py-1.5 text-sm gap-1.5'
  };

  return (
    <span className={`inline-flex items-center font-medium tracking-wider uppercase border ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {Icon && <Icon className="w-2 h-2 fill-current" />}
      {children}
    </span>
  );
}

// ============================================
// 7. Loading Spinner Component
// ============================================

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  className?: string;
}

export function Spinner({
  size = 'md',
  variant = 'dark',
  className = ''
}: SpinnerProps) {
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  const variantStyles = {
    light: 'border-white/30 border-t-white',
    dark: 'border-neutral-900/30 border-t-neutral-900'
  };

  return (
    <div className={`${sizeStyles[size]} ${variantStyles[variant]} rounded-full animate-spin ${className}`} />
  );
}

// ============================================
// 8. Empty State Component
// ============================================

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="bg-white border-2 border-dashed border-gray-300 p-8 md:p-12 lg:p-16 text-center">
      {Icon && (
        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-neutral-900/10 mb-4 md:mb-6">
          <Icon className="w-8 h-8 md:w-10 md:h-10 text-neutral-900" />
        </div>
      )}
      <h3 className="text-lg md:text-title mb-2 font-medium tracking-wider text-neutral-900">
        {title}
      </h3>
      {description && (
        <p className="text-sm md:text-body mb-6 md:mb-8 max-w-md mx-auto font-normal tracking-wider text-neutral-700">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

// ============================================
// 9. Stat Card Component
// ============================================

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  progress?: number; // 0-100
  trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
}

export function StatCard({
  icon: Icon,
  value,
  label,
  progress = 100,
  trend,
  onClick
}: StatCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-neutral-600'
  };

  return (
    <Card
      hover={!!onClick}
      onClick={onClick}
      padding="md"
    >
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="p-2 md:p-3 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-gray-900 group-hover:text-white transition-colors duration-300" />
        </div>
        <div className="text-right">
          <p className="text-lg md:text-xl lg:text-2xl mb-1 font-medium tracking-wider text-neutral-900">
            {value}
          </p>
          <p className="text-xs md:text-caption font-medium tracking-wider uppercase text-neutral-500">
            {label}
          </p>
        </div>
      </div>
      <div className="h-1 bg-gray-100 overflow-hidden">
        <div
          className="h-full bg-gray-900 transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </Card>
  );
}

// ============================================
// 10. Alert Component
// ============================================

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: ReactNode;
  icon?: LucideIcon;
  onClose?: () => void;
}

export function Alert({
  variant = 'info',
  title,
  children,
  icon: Icon,
  onClose
}: AlertProps) {
  const variantStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-orange-50 border-orange-200 text-orange-900',
    danger: 'bg-red-50 border-red-200 text-red-900'
  };

  return (
    <div className={`border-l-4 p-4 ${variantStyles[variant]}`}>
      <div className="flex items-start gap-3">
        {Icon && <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />}
        <div className="flex-1">
          {title && (
            <h4 className="font-medium text-sm mb-1 tracking-wider">
              {title}
            </h4>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/10 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// 사용 예시
// ============================================

/*

// Button 예시
<Button variant="primary" size="md" icon={Plus} iconRight={ArrowRight}>
  버튼 텍스트
</Button>

// Card 예시
<Card hover onClick={() => console.log('clicked')}>
  <h3>카드 제목</h3>
  <p>카드 내용</p>
</Card>

// Modal 예시
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="모달 제목"
  footer={
    <div className="flex gap-2">
      <Button variant="secondary" onClick={() => setIsOpen(false)}>취소</Button>
      <Button variant="primary" onClick={handleSubmit}>확인</Button>
    </div>
  }
>
  <p>모달 내용</p>
</Modal>

// Input 예시
<Input
  label="이메일"
  type="email"
  placeholder="email@example.com"
  error={errors.email}
  required
/>

// Badge 예시
<Badge variant="success" size="md" icon={CheckCircle}>
  완료
</Badge>

// StatCard 예시
<StatCard
  icon={FileText}
  value={24}
  label="총 프로젝트"
  progress={75}
  onClick={() => navigate('/projects')}
/>

// EmptyState 예시
<EmptyState
  icon={ImageIcon}
  title="프로젝트가 없습니다"
  description="첫 번째 프로젝트를 생성해보세요"
  action={
    <Button variant="primary" icon={Plus}>
      프로젝트 생성
    </Button>
  }
/>

// Alert 예시
<Alert variant="success" title="성공!" icon={CheckCircle}>
  프로젝트가 저장되었습니다.
</Alert>

*/
