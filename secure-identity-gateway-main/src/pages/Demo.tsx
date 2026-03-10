import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import WorkflowStepper from '@/components/WorkflowStepper';
import RegisterStep from '@/components/steps/RegisterStep';
import LoginStep from '@/components/steps/LoginStep';
import MFAStep from '@/components/steps/MFAStep';
import RBACStep from '@/components/steps/RBACStep';
import EncryptionStep from '@/components/steps/EncryptionStep';
import TokenStep from '@/components/steps/TokenStep';
import LogsStep from '@/components/steps/LogsStep';
import { useAuthStore } from '@/lib/auth-store';

const stepComponents = [
  RegisterStep,
  LoginStep,
  MFAStep,
  RBACStep,
  EncryptionStep,
  TokenStep,
  LogsStep,
];

const Index = () => {
  const { activeStep } = useAuthStore();
  const ActiveComponent = stepComponents[activeStep];

  return (
    <div className="min-h-screen bg-background scanline">
      <div className="container max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft size={12} /> Back to Home
          </Link>
          <div className="flex items-center justify-center gap-3">
            <Shield className="text-primary" size={28} />
            <h1 className="text-2xl font-display font-bold text-foreground glow-text tracking-tight">
              MSAS
            </h1>
          </div>
          <p className="text-xs font-mono text-muted-foreground">
            Mini Secure Authentication System — Interactive Demo
          </p>
        </div>

        {/* Workflow */}
        <WorkflowStepper />

        {/* Active Step */}
        <ActiveComponent />

        {/* Footer */}
        <div className="text-center text-xs font-mono text-muted-foreground/50 pt-4">
          SHA-256 · AES · RSA · MFA · RBAC · Token Management
        </div>
      </div>
    </div>
  );
};

export default Index;
