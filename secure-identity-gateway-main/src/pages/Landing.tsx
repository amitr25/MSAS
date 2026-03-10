import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, Key, UserPlus, LogIn, Smartphone,
  Users, FileText, ArrowRight, CheckCircle2, Zap,
  ShieldCheck, Hash, KeyRound, Timer
} from 'lucide-react';

const features = [
  {
    icon: Hash,
    title: 'SHA-256 Hashing',
    description: 'Passwords are hashed using SHA-256 before storage. Plaintext passwords are never stored or transmitted.',
  },
  {
    icon: Smartphone,
    title: 'Multi-Factor Auth (MFA)',
    description: 'Time-bound OTP generated after password verification. Adds a second layer of identity confirmation.',
  },
  {
    icon: Users,
    title: 'Role-Based Access (RBAC)',
    description: 'Admin and User roles with resource-level access control. Enforces the principle of least privilege.',
  },
  {
    icon: Lock,
    title: 'AES Encryption',
    description: 'Symmetric encryption to protect sensitive stored data. Demonstrates real-world data-at-rest security.',
  },
  {
    icon: KeyRound,
    title: 'RSA Key Exchange',
    description: 'Asymmetric encryption for secure key exchange. Demonstrates public-key cryptography concepts.',
  },
  {
    icon: Timer,
    title: 'Token Sessions',
    description: 'Unique auth tokens with expiration and validation. Prevents replay attacks and session hijacking.',
  },
];

const workflowSteps = [
  { icon: UserPlus, label: 'User Registration', detail: 'Collect credentials' },
  { icon: Hash, label: 'Password Hashing', detail: 'SHA-256 digest' },
  { icon: Shield, label: 'Secure Storage', detail: 'Hash-only storage' },
  { icon: LogIn, label: 'Login Attempt', detail: 'Hash comparison' },
  { icon: Smartphone, label: 'MFA Verification', detail: 'Time-bound OTP' },
  { icon: Users, label: 'Role Check', detail: 'RBAC enforcement' },
  { icon: Key, label: 'Token Generation', detail: 'Session token' },
  { icon: ShieldCheck, label: 'Secure Access', detail: 'Protected resources' },
];

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="text-primary" size={24} />
            <span className="font-display font-bold text-lg text-foreground">MSAS</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#workflow" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Workflow</a>
            <a href="#architecture" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Architecture</a>
            <Link
              to="/demo"
              className="px-4 py-2 rounded-lg gradient-hero text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero-soft" />
        <div className="relative container max-w-6xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-6">
            <Lock size={12} />
            Academic Security Framework
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground leading-tight mb-6">
            Mini Secure<br />
            <span className="glow-text">Authentication System</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            A unified authentication framework integrating cryptographic hashing, encryption,
            multi-factor authentication, role-based authorization, and secure session management
            into a single modular system.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gradient-hero text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-primary"
            >
              Launch Interactive Demo
              <ArrowRight size={18} />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-card border border-border text-foreground font-semibold hover:bg-secondary transition-colors"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold text-foreground mb-3">Core Security Features</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every layer of the authentication pipeline is designed with modern cryptographic techniques and security best practices.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-card rounded-xl border border-border p-6 hover:border-primary/30 hover:glow-primary transition-all duration-300"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center mb-4">
                    <Icon size={20} className="text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Diagram */}
      <section id="workflow" className="py-20 bg-card">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold text-foreground mb-3">Authentication Workflow</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              The complete authentication pipeline from user registration to secure resource access.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {workflowSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center gap-2 bg-background rounded-xl border border-border p-4 min-w-[130px] hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center">
                      <Icon size={18} className="text-primary-foreground" />
                    </div>
                    <span className="text-xs font-display font-semibold text-foreground text-center">{step.label}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{step.detail}</span>
                  </div>
                  {i < workflowSteps.length - 1 && (
                    <ArrowRight size={16} className="text-primary/50 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold text-foreground mb-3">System Architecture</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Layered security controls ensure defense-in-depth across every component.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Security Enhancements */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" />
                Security Enhancements
              </h3>
              <ul className="space-y-3">
                {[
                  'Account lockout after 3 failed login attempts',
                  'Complete audit logging of all auth activities',
                  'Token expiration prevents replay attacks',
                  'Hash-only credential storage (no plaintext)',
                  'Time-bound OTP for multi-factor verification',
                  'Role-based resource access enforcement',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Stack */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap size={18} className="text-primary" />
                Cryptographic Techniques
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'SHA-256', type: 'Hashing', desc: 'One-way password digest' },
                  { name: 'AES', type: 'Symmetric', desc: 'Data-at-rest encryption' },
                  { name: 'RSA', type: 'Asymmetric', desc: 'Secure key exchange' },
                  { name: 'TOTP', type: 'MFA', desc: 'Time-bound one-time passwords' },
                  { name: 'CSPRNG', type: 'Tokens', desc: 'Cryptographic random token generation' },
                ].map((tech) => (
                  <div key={tech.name} className="flex items-center gap-3 bg-background rounded-lg p-3 border border-border/50">
                    <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">{tech.name}</span>
                    <div>
                      <span className="text-sm font-semibold text-foreground">{tech.type}</span>
                      <span className="text-xs text-muted-foreground ml-2">{tech.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-card border-t border-border">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold text-foreground mb-4">Ready to Explore?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Walk through each authentication step interactively. Register, login, verify MFA, explore RBAC, test encryption, and manage tokens.
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gradient-hero text-primary-foreground font-semibold text-lg hover:opacity-90 transition-opacity glow-primary"
          >
            Launch Interactive Demo
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="text-primary" size={16} />
            <span className="font-mono text-xs text-muted-foreground">MSAS v1.0</span>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            SHA-256 · AES · RSA · MFA · RBAC · Token Management
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
