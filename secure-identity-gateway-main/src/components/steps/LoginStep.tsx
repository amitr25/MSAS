import React, { useState } from 'react';
import { sha256Hash, generateOTP } from '@/lib/crypto';
import { useAuthStore } from '@/lib/auth-store';
import TerminalCard from '@/components/TerminalCard';
import { LogIn } from 'lucide-react';

const MAX_ATTEMPTS = 3;

const LoginStep: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<'idle' | 'success' | 'fail' | 'locked'>('idle');
  const [inputHash, setInputHash] = useState('');
  const { getUser, updateUser, addLog, setActiveStep, setPendingOTP } = useAuthStore();
  

  const handleLogin = async () => {
    const user = getUser(username);
    if (!user) {
      setResult('fail');
      addLog({ event: `Login failed: user "${username}" not found`, username, status: 'error' });
      return;
    }
    if (user.locked) {
      setResult('locked');
      addLog({ event: `Login blocked: account "${username}" is locked`, username, status: 'warning' });
      return;
    }

    const hash = await sha256Hash(password);
    setInputHash(hash);

    if (hash === user.passwordHash) {
      updateUser(username, { failedAttempts: 0 });
      addLog({ event: `Password verified for "${username}"`, username, status: 'success' });
      setResult('success');

      const otp = generateOTP();
      setPendingOTP({ otp, username, expiresAt: Date.now() + 60000 });
      setPendingOTP({ otp, username, expiresAt: Date.now() + 60000 });
      addLog({ event: `OTP generated for "${username}": ${otp}`, username, status: 'info' });
    } else {
      const newAttempts = user.failedAttempts + 1;
      const locked = newAttempts >= MAX_ATTEMPTS;
      updateUser(username, { failedAttempts: newAttempts, locked });
      addLog({
        event: locked
          ? `Account "${username}" locked after ${MAX_ATTEMPTS} failed attempts`
          : `Login failed for "${username}" (attempt ${newAttempts}/${MAX_ATTEMPTS})`,
        username,
        status: locked ? 'warning' : 'error',
      });
      setResult(locked ? 'locked' : 'fail');
    }
  };

  return (
    <TerminalCard title="login_auth.sh" icon={<LogIn size={12} />} active>
      <div className="space-y-4">
        <div className="text-xs font-mono text-muted-foreground">
          <span className="text-primary">$</span> Authenticate via hash comparison — {MAX_ATTEMPTS} attempts before lockout
        </div>

        <div className="grid gap-3">
          <input
            value={username}
            onChange={e => { setUsername(e.target.value); setResult('idle'); }}
            className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50"
            placeholder="username"
          />
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setResult('idle'); }}
            className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50"
            placeholder="password"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={!username || !password}
          className="w-full py-2 rounded bg-primary text-primary-foreground font-mono text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          Authenticate
        </button>

        {result === 'fail' && (
          <div className="text-xs font-mono text-destructive animate-fade-in">
            ✗ Authentication failed — hash mismatch
          </div>
        )}
        {result === 'locked' && (
          <div className="text-xs font-mono text-warning animate-fade-in">
            ⚠ Account locked — too many failed attempts
          </div>
        )}
        {result === 'success' && (
          <div className="space-y-2 animate-fade-in">
            <div className="text-xs font-mono text-primary">✓ Hash match — password verified</div>
            {inputHash && (
              <div className="bg-secondary/80 rounded p-3 border border-border/50 text-xs font-mono">
                <span className="text-muted-foreground">Input hash: </span>
                <span className="text-primary break-all">{inputHash.slice(0, 32)}...</span>
              </div>
            )}
            <div className="text-xs font-mono text-info">→ OTP sent — check MFA step</div>
            <button
              onClick={() => setActiveStep(2)}
              className="text-xs font-mono text-primary/70 hover:text-primary underline"
            >
              → Proceed to MFA Verification
            </button>
          </div>
        )}
      </div>
    </TerminalCard>
  );
};

export default LoginStep;
