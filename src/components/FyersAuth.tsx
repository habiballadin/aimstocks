import React, { useState } from 'react';
import { fyersService } from '../services/fyersService';

interface FyersAuthProps {
  onTokenReceived: (token: string) => void;
}

const FyersAuth: React.FC<FyersAuthProps> = ({ onTokenReceived }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const APP_ID = "BAEK2YCN6R-100";
  const SECRET_ID = "6RITUTPY2D";
  const REDIRECT_URI = "http://localhost:5173/auth/callback";

  const initiateAuth = () => {
    setIsAuthenticating(true);
    
    const authUrl = fyersService.getAuthUrl();
    
    const authWindow = window.open(authUrl, 'fyersAuth', 'width=600,height=700');
    
    const checkClosed = setInterval(() => {
      if (authWindow?.closed) {
        clearInterval(checkClosed);
        setIsAuthenticating(false);
      }
    }, 1000);

    window.addEventListener('message', async (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'FYERS_AUTH_CODE') {
        const authCode = event.data.code;
        authWindow?.close();
        
        try {
          const result = await fyersService.exchangeAuthCode(authCode);
          
          if (result.success && result.access_token) {
            onTokenReceived(result.access_token);
          } else {
            alert('Failed to get access token: ' + (result.message || 'Unknown error'));
          }
        } catch (error) {
          console.error('Token exchange error:', error);
        } finally {
          setIsAuthenticating(false);
        }
      }
    });
  };

  return (
    <button 
      onClick={initiateAuth}
      disabled={isAuthenticating}
      className="auth-button"
    >
      {isAuthenticating ? 'Authenticating...' : 'Login with Fyers'}
    </button>
  );
};

export default FyersAuth;