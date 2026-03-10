import React, { useState, useEffect } from 'react';
import { generateToken } from '@/lib/crypto';
import { useAuthStore } from '@/lib/auth-store';
import TerminalCard from '@/components/TerminalCard';
import { Key } from 'lucide-react';

const TOKEN_LIFETIME = 120; // seconds

const TokenStep: React.FC = () => {
  const { pendingOTP, getUser, currentToken, setToken, addLog, setActiveStep } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState(0);
  const user = pendingOTP ? getUser(pendingOTP.username) : undefined;

  const handleGenerate = () => {
    if (!user) return;
    const token = generateToken();
    const now = Date.now();
    const authToken = {
      token,
      username: user.username,
      role: user.role,
      issuedAt: now,
      expiresAt: now + TOKEN_LIFETIME * 1000,
    };
    setToken(authToken);
    addLog({ event: `Auth token generated for "${user.username}" (expires in ${TOKEN_LIFETIME}s)`, username: user.username, status: 'success' });
  };

  useEffect(() => {
    if (!currentToken) return;
    const interval = setInterval(() => {
      const left = Math.max(0, Math.floor((currentToken.expiresAt - Date.now()) / 1000));
      setTimeLeft(left);
      if (left === 0) {
        addLog({ event: `Token expired for "${currentToken.username}"`, username: currentToken.username, status: 'warning' });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentToken]);

  const isExpired = currentToken ? Date.now() > currentToken.expiresAt : false;

  return (
    <TerminalCard title="token_mgmt.sh" icon={<Key size={12} />} active>
      <div className="space-y-4">
        <div className="text-xs font-mono text-muted-foreground">
          <span className="text-primary">$</span> Token-based session management with expiration
        </div>

        {user ? (
          <>
            {!currentToken && (
              <button
                onClick={handleGenerate}
                className="w-full py-2 rounded bg-primary text-primary-foreground font-mono text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Generate Auth Token
              </button>
            )}

            {currentToken && (
              <div className="space-y-3 animate-fade-in">
                <div className="bg-secondary/80 rounded p-3 border border-border/50 text-xs font-mono space-y-2">
                  <div><span className="text-muted-foreground">Token: </span><span className="text-primary break-all">{currentToken.token}</span></div>
                  <div><span className="text-muted-foreground">User: </span><span className="text-foreground">{currentToken.username}</span></div>
                  <div><span className="text-muted-foreground">Role: </span><span className="text-accent">{currentToken.role.toUpperCase()}</span></div>
                  <div><span className="text-muted-foreground">Issued: </span><span className="text-foreground">{new Date(currentToken.issuedAt).toLocaleTimeString()}</span></div>
                  <div>
                    <span className="text-muted-foreground">Status: </span>
                    <span className={isExpired ? 'text-destructive' : 'text-primary'}>
                      {isExpired ? 'EXPIRED' : `VALID (${timeLeft}s remaining)`}
                    </span>
                  </div>
                </div>

                {!isExpired && (
                  <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-1000"
                      style={{ width: `${(timeLeft / TOKEN_LIFETIME) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            <button onClick={() => setActiveStep(6)} className="text-xs font-mono text-primary/70 hover:text-primary underline">
              → View Security Logs
            </button>
          </>
        ) : (
          <div className="text-xs font-mono text-muted-foreground">Complete authentication first.</div>
        )}
      </div>
    </TerminalCard>
  );
};

export default TokenStep;
