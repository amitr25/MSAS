import React from 'react';
import { useAuthStore } from '@/lib/auth-store';
import TerminalCard from '@/components/TerminalCard';
import { Users, ShieldCheck, ShieldX } from 'lucide-react';

const resources = [
  { name: 'View Dashboard', admin: true, user: true },
  { name: 'View Reports', admin: true, user: true },
  { name: 'Edit User Profiles', admin: true, user: false },
  { name: 'Manage Users', admin: true, user: false },
  { name: 'System Configuration', admin: true, user: false },
  { name: 'View Audit Logs', admin: true, user: false },
];

const RBACStep: React.FC = () => {
  const { pendingOTP, getUser, setActiveStep } = useAuthStore();
  const user = pendingOTP ? getUser(pendingOTP.username) : undefined;

  return (
    <TerminalCard title="rbac_policy.sh" icon={<Users size={12} />} active>
      <div className="space-y-4">
        <div className="text-xs font-mono text-muted-foreground">
          <span className="text-primary">$</span> Role-Based Access Control — principle of least privilege
        </div>

        {user ? (
          <>
            <div className="text-xs font-mono">
              Current user: <span className="text-primary">{user.username}</span> — Role: <span className="text-accent">{user.role.toUpperCase()}</span>
            </div>

            <div className="rounded border border-border/50 overflow-hidden">
              <div className="grid grid-cols-3 gap-0 text-xs font-mono bg-secondary/50 px-3 py-2 border-b border-border/50">
                <span className="text-muted-foreground">Resource</span>
                <span className="text-center text-muted-foreground">Admin</span>
                <span className="text-center text-muted-foreground">User</span>
              </div>
              {resources.map(r => {
                const hasAccess = user.role === 'admin' ? r.admin : r.user;
                return (
                  <div key={r.name} className={`grid grid-cols-3 gap-0 px-3 py-2 text-xs font-mono border-b border-border/30 last:border-0 ${
                    hasAccess ? '' : 'opacity-50'
                  }`}>
                    <span className={hasAccess ? 'text-foreground' : 'text-muted-foreground'}>{r.name}</span>
                    <span className="text-center">{r.admin ? <ShieldCheck size={14} className="inline text-primary" /> : <ShieldX size={14} className="inline text-destructive" />}</span>
                    <span className="text-center">{r.user ? <ShieldCheck size={14} className="inline text-primary" /> : <ShieldX size={14} className="inline text-destructive" />}</span>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setActiveStep(4)} className="text-xs font-mono text-primary/70 hover:text-primary underline">
              → Proceed to Encryption Demo
            </button>
          </>
        ) : (
          <div className="text-xs font-mono text-muted-foreground">Complete authentication first.</div>
        )}
      </div>
    </TerminalCard>
  );
};

export default RBACStep;
