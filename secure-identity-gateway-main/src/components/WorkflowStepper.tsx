import React from 'react';
import { Shield, UserPlus, LogIn, Smartphone, Users, Lock, Key, FileText } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

const steps = [
  { label: 'Register', icon: UserPlus },
  { label: 'Login', icon: LogIn },
  { label: 'MFA', icon: Smartphone },
  { label: 'RBAC', icon: Users },
  { label: 'Encryption', icon: Lock },
  { label: 'Token', icon: Key },
  { label: 'Logs', icon: FileText },
];

const WorkflowStepper: React.FC = () => {
  const { activeStep, setActiveStep } = useAuthStore();

  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === activeStep;
        const isDone = i < activeStep;
        return (
          <React.Fragment key={step.label}>
            <button
              onClick={() => setActiveStep(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/40 glow-primary'
                  : isDone
                  ? 'bg-primary/10 text-primary/70 border border-primary/20'
                  : 'bg-secondary text-muted-foreground border border-border/30 hover:border-primary/20'
              }`}
            >
              <Icon size={14} />
              {step.label}
            </button>
            {i < steps.length - 1 && (
              <div className={`w-4 h-px ${isDone ? 'bg-primary/50' : 'bg-border'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default WorkflowStepper;
