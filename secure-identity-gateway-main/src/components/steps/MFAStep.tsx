import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import TerminalCard from '@/components/TerminalCard';
import { Smartphone } from 'lucide-react';

const MFAStep: React.FC = () => {
  const [otpInput, setOtpInput] = useState('');
  const [result, setResult] = useState<'idle' | 'success' | 'fail' | 'expired'>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const { pendingOTP, addLog, setActiveStep } = useAuthStore();

  useEffect(() => {
    if (!pendingOTP) return;
    const interval = setInterval(() => {
      const left = Math.max(0, Math.floor((pendingOTP.expiresAt - Date.now()) / 1000));
      setTimeLeft(left);
      if (left === 0) setResult('expired');
    }, 1000);
    return () => clearInterval(interval);
  }, [pendingOTP]);

  const handleVerify = () => {
    if (!pendingOTP) return;
    if (Date.now() > pendingOTP.expiresAt) {
      setResult('expired');
      addLog({ event: 'OTP expired', username: pendingOTP.username, status: 'warning' });
      return;
    }
    if (otpInput === pendingOTP.otp) {
      setResult('success');
      addLog({ event: `MFA verified for "${pendingOTP.username}"`, username: pendingOTP.username, status: 'success' });
    } else {
      setResult('fail');
      addLog({ event: 'MFA failed — incorrect OTP', username: pendingOTP.username, status: 'error' });
    }
  };

  return (
    <TerminalCard title="mfa_verify.sh" icon={<Smartphone size={12} />} active>
      <div className="space-y-4">
        <div className="text-xs font-mono text-muted-foreground">
          <span className="text-primary">$</span> Enter the time-bound OTP to complete authentication
        </div>

        {pendingOTP ? (
          <>
            <div className="bg-secondary/80 rounded p-3 border border-border/50 text-center">
              <div className="text-xs font-mono text-muted-foreground mb-1">Your OTP (simulated SMS/Email)</div>
              <div className="text-2xl font-mono text-primary tracking-[0.3em] glow-text">
                {pendingOTP.otp}
              </div>
              <div className={`text-xs font-mono mt-2 ${timeLeft < 15 ? 'text-destructive' : 'text-muted-foreground'}`}>
                Expires in {timeLeft}s
              </div>
            </div>

            <input
              value={otpInput}
              onChange={e => { setOtpInput(e.target.value); setResult('idle'); }}
              className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm font-mono text-foreground text-center tracking-[0.3em] focus:outline-none focus:border-primary/50"
              placeholder="000000"
              maxLength={6}
            />

            <button
              onClick={handleVerify}
              disabled={otpInput.length !== 6}
              className="w-full py-2 rounded bg-primary text-primary-foreground font-mono text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              Verify OTP
            </button>

            {result === 'fail' && <div className="text-xs font-mono text-destructive animate-fade-in">✗ Invalid OTP</div>}
            {result === 'expired' && <div className="text-xs font-mono text-warning animate-fade-in">⚠ OTP expired</div>}
            {result === 'success' && (
              <div className="animate-fade-in">
                <div className="text-xs font-mono text-primary">✓ MFA verification complete</div>
                <button onClick={() => setActiveStep(3)} className="text-xs font-mono text-primary/70 hover:text-primary underline mt-1">
                  → Proceed to RBAC
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-xs font-mono text-muted-foreground">
            No pending OTP. Complete login first.
          </div>
        )}
      </div>
    </TerminalCard>
  );
};

export default MFAStep;
