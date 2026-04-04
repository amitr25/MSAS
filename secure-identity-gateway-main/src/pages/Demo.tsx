import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, BookOpen } from 'lucide-react';
import WorkflowStepper from '@/components/WorkflowStepper';
import RegisterStep from '@/components/steps/RegisterStep';
import LoginStep from '@/components/steps/LoginStep';
import MFAStep from '@/components/steps/MFAStep';
import RBACStep from '@/components/steps/RBACStep';
import EncryptionStep from '@/components/steps/EncryptionStep';
import TokenStep from '@/components/steps/TokenStep';
import LogsStep from '@/components/steps/LogsStep';
import { useAuthStore } from '@/lib/auth-store';
import { Switch } from '@/components/ui/switch';

const stepComponents = [
  RegisterStep,
  LoginStep,
  MFAStep,
  RBACStep,
  EncryptionStep,
  TokenStep,
  LogsStep,
];

const stepDescriptions = [
  'Register a new user. The password is hashed using SHA-256 before storage — plaintext is never saved.',
  'Login by submitting credentials. The system hashes your input and compares it against the stored hash.',
  'Verify your identity with a time-bound OTP. This second factor ensures the person logging in owns the account.',
  'See which resources your role can access. RBAC enforces the principle of least privilege.',
  'Explore AES symmetric encryption and RSA asymmetric key pairs used to protect data.',
  'Generate a session token with built-in expiration. Tokens prevent session hijacking and replay attacks.',
  'Review the complete audit trail of all authentication events with severity classification.',
];

const Demo = () => {
  const { activeStep, learnMode, toggleLearnMode } = useAuthStore();
  const ActiveComponent = stepComponents[activeStep];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="container max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={12} /> Home
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="text-primary" size={18} />
            <span className="font-display font-bold text-foreground text-sm">MSAS Interactive Demo</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen size={14} className={learnMode ? 'text-primary' : 'text-muted-foreground'} />
            <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">Learn</span>
            <Switch checked={learnMode} onCheckedChange={toggleLearnMode} />
          </div>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Stepper */}
        <WorkflowStepper />

        {/* Step description */}
        <div className="bg-primary/5 border border-primary/10 rounded-lg px-4 py-3">
          <div className="text-xs font-mono text-muted-foreground">
            <span className="text-primary font-semibold">Step {activeStep + 1}/7</span> — {stepDescriptions[activeStep]}
          </div>
        </div>

        {/* Active Step + Algorithm Panel */}
        <ActiveComponent />

        {/* Footer */}
        <div className="text-center text-[10px] font-mono text-muted-foreground/50 pt-4 pb-8">
          MSAS v2.0 — SHA-256 · AES · RSA · MFA · RBAC · Token Management · Audit Logging
        </div>
      </div>
    </div>
  );
};

export default Demo;
