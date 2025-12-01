/**
 * AWS Amplify Configuration
 * Configures Cognito for authentication
 * 이 파일이 import되면 즉시 Amplify가 설정됩니다.
 */

import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      signUpVerificationMethod: 'code' as const,
      loginWith: {
        email: true,
      },
    },
  },
};

// 즉시 설정 실행
Amplify.configure(amplifyConfig);

console.log('Amplify configured with UserPool:', import.meta.env.VITE_COGNITO_USER_POOL_ID);

export const configureAmplify = () => {
  Amplify.configure(amplifyConfig);
};

export default amplifyConfig;
