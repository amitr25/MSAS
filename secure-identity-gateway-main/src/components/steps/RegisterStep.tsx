import React, { useState } from 'react';
import { sha256Hash } from '@/lib/crypto';
import { useAuthStore } from '@/lib/auth-store';
import TerminalCard from '@/components/TerminalCard';
import { UserPlus } from 'lucide-react';
import type { Role } from '@/lib/crypto';

const RegisterStep: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('user');
  const [hash, setHash] = useState('');
  const [registered, setRegistered] = useState(false);
  const { addUser, getUser, addLog, setActiveStep } = useAuthStore();

  const handleRegister = async () => {
    if (!username || !password) return;
    if (getUser(username)) {
      addLog({ event: `Registration failed: username "${username}" already exists`, username, status: 'error' });
      return;
    }
    const passwordHash = await sha256Hash(password);
    setHash(passwordHash);
    addUser({ username, passwordHash, role, failedAttempts: 0, locked: false });
    addLog({ event: `User "${username}" registered with role "${role}"`, username, status: 'success' });
    setRegistered(true);
  };

  return (
    <TerminalCard title="user_registration.sh" icon={<UserPlus size={12} />} active>
      <div className="space-y-4">
        <div className="text-xs font-mono text-muted-foreground mb-3">
          <span className="text-primary">$</span> Register a new user — password will be hashed with SHA-256
        </div>

        <div className="grid gap-3">
          <div>
            <label className="text-xs font-mono text-muted-foreground mb-1 block">USERNAME</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              placeholder="enter_username"
              disabled={registered}
            />
          </div>
          <div>
            <label className="text-xs font-mono text-muted-foreground mb-1 block">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              placeholder="••••••••"
              disabled={registered}
            />
          </div>
          <div>
            <label className="text-xs font-mono text-muted-foreground mb-1 block">ROLE</label>
            <div className="flex gap-2">
              {(['user', 'admin'] as Role[]).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  disabled={registered}
                  className={`px-3 py-1.5 rounded text-xs font-mono border transition-all ${
                    role === r
                      ? 'bg-primary/20 text-primary border-primary/40'
                      : 'bg-secondary text-muted-foreground border-border hover:border-primary/20'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {!registered && (
          <button
            onClick={handleRegister}
            disabled={!username || !password}
            className="w-full py-2 rounded bg-primary text-primary-foreground font-mono text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            Register User
          </button>
        )}

        {hash && (
          <div className="mt-4 space-y-2 animate-fade-in">
            <div className="text-xs font-mono text-primary">✓ Password hashed with SHA-256:</div>
            <div className="bg-secondary/80 rounded p-3 border border-border/50">
              <div className="text-xs font-mono text-muted-foreground mb-1">Plaintext:</div>
              <div className="text-sm font-mono text-destructive">{'•'.repeat(password.length)} (never stored)</div>
              <div className="text-xs font-mono text-muted-foreground mt-2 mb-1">SHA-256 Hash (stored):</div>
              <div className="text-xs font-mono text-primary break-all">{hash}</div>
            </div>
            <button
              onClick={() => setActiveStep(1)}
              className="mt-2 text-xs font-mono text-primary/70 hover:text-primary underline"
            >
              → Proceed to Login
            </button>
          </div>
        )}
      </div>
    </TerminalCard>
  );
};

export default RegisterStep;
