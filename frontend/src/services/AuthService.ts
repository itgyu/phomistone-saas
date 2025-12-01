/**
 * AuthService - Cognito 기반 인증 서비스
 * localStorage 기반 코드 완전 제거 후 AWS Cognito로 마이그레이션
 */

import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
  updateUserAttributes,
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  type SignUpInput,
  type SignInInput,
} from 'aws-amplify/auth';
import type { User, LoginCredentials, RegisterData } from '@/types/auth';

// User cache for performance
let cachedUser: User | null = null;

class AuthService {
  /**
   * 회원가입 - Cognito SignUp + 조직 자동 생성 (나중에 구현)
   */
  async signUp(data: RegisterData): Promise<{ isConfirmed: boolean; userId?: string }> {
    try {
      // Cognito User Pool에서 name이 required로 설정되어 있음
      const signUpInput: SignUpInput = {
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email,
            name: data.name || data.email.split('@')[0], // name이 없으면 이메일 앞부분 사용
          },
        },
      };

      console.log('SignUp attempt with:', { username: data.email, name: data.name });

      const result = await signUp(signUpInput);

      console.log('SignUp result:', result);

      return {
        isConfirmed: result.isSignUpComplete,
        userId: result.userId,
      };
    } catch (error: unknown) {
      console.error('SignUp error:', error);
      const err = error as Error & { name?: string; message?: string };

      if (err.name === 'UsernameExistsException') {
        throw new Error('이미 존재하는 이메일입니다.');
      }
      if (err.name === 'InvalidPasswordException') {
        throw new Error('비밀번호는 8자 이상, 대소문자 및 숫자를 포함해야 합니다.');
      }
      if (err.name === 'InvalidParameterException') {
        throw new Error('입력 정보를 확인해주세요: ' + err.message);
      }
      throw new Error(err.message || '회원가입에 실패했습니다.');
    }
  }

  /**
   * 이메일 인증 코드 확인
   */
  async confirmSignUp(email: string, code: string): Promise<boolean> {
    try {
      const result = await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
      return result.isSignUpComplete;
    } catch (error: unknown) {
      const err = error as Error & { name?: string };
      if (err.name === 'CodeMismatchException') {
        throw new Error('인증 코드가 일치하지 않습니다.');
      }
      if (err.name === 'ExpiredCodeException') {
        throw new Error('인증 코드가 만료되었습니다. 새 코드를 요청해주세요.');
      }
      throw new Error(err.message || '인증에 실패했습니다.');
    }
  }

  /**
   * 인증 코드 재전송
   */
  async resendConfirmationCode(email: string): Promise<void> {
    try {
      await resendSignUpCode({ username: email });
    } catch (error: unknown) {
      const err = error as Error;
      throw new Error(err.message || '인증 코드 재전송에 실패했습니다.');
    }
  }

  /**
   * 로그인 - Cognito SignIn
   */
  async signIn(credentials: LoginCredentials): Promise<User> {
    try {
      const signInInput: SignInInput = {
        username: credentials.email,
        password: credentials.password,
      };

      const result = await signIn(signInInput);

      if (result.isSignedIn) {
        const user = await this.getCurrentUser();
        if (user) {
          cachedUser = user;
          return user;
        }
      }

      // 인증 단계가 필요한 경우
      if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        throw new Error('CONFIRM_REQUIRED');
      }

      throw new Error('로그인에 실패했습니다.');
    } catch (error: unknown) {
      const err = error as Error & { name?: string };

      if (err.message === 'CONFIRM_REQUIRED') {
        throw err;
      }
      if (err.name === 'UserNotConfirmedException') {
        throw new Error('CONFIRM_REQUIRED');
      }
      if (err.name === 'NotAuthorizedException') {
        throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
      if (err.name === 'UserNotFoundException') {
        throw new Error('존재하지 않는 계정입니다.');
      }
      throw new Error(err.message || '로그인에 실패했습니다.');
    }
  }

  /**
   * 로그아웃 - Cognito SignOut
   */
  async signOut(): Promise<void> {
    try {
      await signOut();
      cachedUser = null;
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Logout error:', err);
      // 로컬 캐시는 무조건 클리어
      cachedUser = null;
    }
  }

  /**
   * 현재 사용자 조회 - Cognito Session
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const cognitoUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();

      const user: User = {
        id: cognitoUser.userId,
        email: attributes.email || '',
        name: attributes.name || '',
        company: '', // TODO: 백엔드에서 조회
        phone: '',   // TODO: 백엔드에서 조회
        role: 'user', // 기본값, 나중에 백엔드에서 조회
        createdAt: new Date().toISOString(),
      };

      cachedUser = user;
      return user;
    } catch {
      cachedUser = null;
      return null;
    }
  }

  /**
   * 캐시된 사용자 반환 (동기)
   */
  getCachedUser(): User | null {
    return cachedUser;
  }

  /**
   * 인증 세션 확인
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await fetchAuthSession();
      return !!session.tokens?.idToken;
    } catch {
      return false;
    }
  }

  /**
   * JWT 액세스 토큰 반환 (API 호출용)
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString() || null;
    } catch {
      return null;
    }
  }

  /**
   * 사용자 정보 업데이트
   * Cognito에는 name만 업데이트, company/phone은 백엔드 API 필요
   */
  async updateUser(updates: { name?: string; company?: string; phone?: string }): Promise<User | null> {
    try {
      const attributes: Record<string, string> = {};

      // Cognito User Pool 스키마에 있는 속성만 업데이트
      if (updates.name) attributes.name = updates.name;

      // company, phone은 Cognito에 없으므로 백엔드 API로 저장 필요
      // TODO: 백엔드 API 연동

      if (Object.keys(attributes).length > 0) {
        await updateUserAttributes({ userAttributes: attributes });
      }

      // 캐시 업데이트
      const user = await this.getCurrentUser();
      return user;
    } catch (error: unknown) {
      const err = error as Error;
      throw new Error(err.message || '프로필 업데이트에 실패했습니다.');
    }
  }

  /**
   * 비밀번호 재설정 요청
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await resetPassword({ username: email });
    } catch (error: unknown) {
      const err = error as Error & { name?: string };
      if (err.name === 'UserNotFoundException') {
        throw new Error('존재하지 않는 계정입니다.');
      }
      throw new Error(err.message || '비밀번호 재설정 요청에 실패했습니다.');
    }
  }

  /**
   * 비밀번호 재설정 확인
   */
  async confirmPasswordReset(email: string, code: string, newPassword: string): Promise<void> {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });
    } catch (error: unknown) {
      const err = error as Error & { name?: string };
      if (err.name === 'CodeMismatchException') {
        throw new Error('인증 코드가 일치하지 않습니다.');
      }
      throw new Error(err.message || '비밀번호 재설정에 실패했습니다.');
    }
  }

  // =============================================
  // 레거시 호환성 메서드 (기존 코드와의 호환을 위해 유지)
  // =============================================

  /**
   * @deprecated Use signUp instead
   */
  register(data: RegisterData): Promise<{ isConfirmed: boolean; userId?: string }> {
    return this.signUp(data);
  }

  /**
   * @deprecated Use signIn instead
   */
  login(credentials: LoginCredentials): Promise<User> {
    return this.signIn(credentials);
  }

  /**
   * @deprecated Use signOut instead
   */
  logout(): Promise<void> {
    return this.signOut();
  }
}

export default new AuthService();
