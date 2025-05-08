
import React from 'react';
import { useYoutube } from '../../contexts/YoutubeContext';
import YoutubeAuth from './YoutubeAuth';

const AuthRequired: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { isAuthenticated } = useYoutube();
  
  if (!isAuthenticated) {
    return <YoutubeAuth />;
  }
  
  return <>{children}</>;
};

export default AuthRequired;
