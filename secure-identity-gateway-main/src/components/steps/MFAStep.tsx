import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import TerminalCard from '@/components/TerminalCard';
import AlgorithmPanel from '@/components/AlgorithmPanel';
import { Smartphone } from 'lucide-react';

const MFAStep: React.FC = () => {
  const [otpInput, setOtpInput] = useState('');
  const [result, setResult] = useState<'idle' | 'success' | 'fail' | 'expired'>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const { pendingOTP, addLog, setActiveStep, learnMode } = useAuthStore();

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
    <div className="space-y-4">
      <TerminalCard title="mfa_verify.sh" icon={<Smartphone size={12} />} active>
        <div className="space-y-4">
          <div className="text-xs font-mono text-muted-foreground">
            <span className="text-primary">$</span> Enter the time-bound OTP to complete authentication
          </div>

          {pendingOTP ? (
            <>
              <div className="bg-secondary/80 rounded p-3 border border-border/50 text-center">
                <div className="text-xs font-mono text-muted-foreground mb-1">Your OTP (simulated SMS/Email)</div>
                <div className="text-2xl font-mono text-primary tracking-[0.3em] glow-text">{pendingOTP.otp}</div>
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
              {result === 'expired' && <div className="text-xs font-mono text-warning animate-fade-in">⚠ OTP expired — time window exceeded</div>}
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
            <div className="text-xs font-mono text-muted-foreground">No pending OTP. Complete login first.</div>
          )}
        </div>
      </TerminalCard>

      {learnMode && <AlgorithmPanel
        title="Time-Based One-Time Password (TOTP)"
        description="MFA adds a second authentication factor beyond passwords. A 6-digit OTP is generated using a cryptographically secure random number generator (CSPRNG) and is valid only within a short time window."
        steps={[
          {
            label: 'Password Verified (Trigger)',
            detail: 'After successful hash comparison, the system triggers MFA as a second factor.',
            deepDive: 'MFA is only triggered after the first factor (password) is verified. This is intentional — challenging unverified users with OTP would leak whether an account exists (if an OTP is sent, the account exists). The system must confirm knowledge of the password before escalating to possession-based verification.',
            highlight: !!pendingOTP,
          },
          {
            label: 'OTP Generation (CSPRNG)',
            detail: 'A 6-digit code is generated using crypto.getRandomValues() — a CSPRNG that produces unpredictable values.',
            deepDive: 'crypto.getRandomValues() is a Cryptographically Secure Pseudo-Random Number Generator (CSPRNG). Unlike Math.random() (which uses a predictable algorithm like xorshift128+), CSPRNG draws entropy from OS-level sources:\n\n• Linux: /dev/urandom (hardware noise, interrupt timing, disk I/O)\n• Windows: CryptGenRandom (CPU thermal noise, network packet timing)\n• Hardware: Intel RDRAND instruction (thermal noise in silicon)\n\nThe 6-digit code space (000000–999999) gives 1,000,000 possible values. With a 60-second window, an attacker gets ~1 guess per second, so the probability of guessing is ~0.006% — acceptably low for most applications.',
            highlight: !!pendingOTP,
          },
          {
            label: 'Time Window Set (60s)',
            detail: 'The OTP is assigned a 60-second expiration window. After this, the code becomes invalid regardless of correctness.',
            deepDive: 'The time window balances security vs. usability:\n\n• Too short (10s): Users may not type in time, especially on mobile\n• Too long (5min): Intercepted codes remain valid longer\n• Sweet spot (30–60s): Enough time to enter, short enough to limit exposure\n\nThe server stores: { otp: "047293", username: "alice", expiresAt: 1710000060000 }\n\nExpiry is checked FIRST in verification — this is a "fail fast" pattern that rejects expired codes before comparing values, reducing computation on invalid requests.',
          },
          {
            label: 'User Verification',
            detail: 'The system checks: (1) Is the OTP expired? → reject. (2) Does user_input === stored_otp? → accept.',
            deepDive: 'The verification logic follows a strict order:\n\n1. Check expiry: if (Date.now() > expiresAt) → reject immediately\n2. Compare codes: if (userInput === storedOTP) → accept\n3. Both must pass: expired but correct → rejected\n\nThis ordering is intentional. Checking expiry first is O(1) and avoids the string comparison entirely for expired codes. In production, the comparison should also be constant-time to prevent timing attacks on the OTP value itself.',
            highlight: result === 'success' || result === 'fail',
          },
          {
            label: 'Replay Prevention',
            detail: 'Each OTP is single-use. Once verified (or expired), it cannot be reused.',
            deepDive: 'After successful verification, the OTP is invalidated (deleted from storage). This prevents replay attacks where an attacker intercepts a valid OTP and reuses it. Even within the time window, each code works exactly once.\n\nAdditional production defenses:\n• Rate limiting: Max 3 OTP verification attempts per code\n• Lockout: Lock MFA after 5 consecutive failures\n• Channel security: OTP delivery over SMS is vulnerable to SIM-swapping; TOTP apps (Google Authenticator) are preferred',
            highlight: result === 'success',
          },
        ]}
        deepDiveSections={[
          {
            heading: 'CSPRNG vs Math.random() — Why It Matters',
            text: 'Math.random() uses algorithms like xorshift128+ that are deterministic — if you know the internal state, you can predict ALL future outputs. V8\'s Math.random() state can be recovered from just a few outputs. CSPRNG (crypto.getRandomValues) continuously mixes in hardware entropy, making prediction computationally infeasible even if some outputs are known.',
          },
          {
            heading: 'Real-World TOTP (RFC 6238)',
            text: 'Production TOTP (used by Google Authenticator, Authy) works differently:\n\n1. Server and client share a secret key (established during setup via QR code)\n2. Both compute: HMAC-SHA1(secret, floor(time / 30))\n3. The HMAC output is truncated to 6 digits\n4. Both sides independently generate the same code — no transmission needed\n\nThis eliminates the need to send OTPs over insecure channels (SMS, email). The shared secret is established once and stored securely on the device.',
          },
          {
            heading: 'SMS vs Authenticator App vs Hardware Keys',
            text: '• SMS OTP: Vulnerable to SIM-swapping (attacker convinces carrier to transfer your number), SS7 protocol exploitation, and social engineering. NIST no longer recommends SMS for MFA.\n• Authenticator apps (TOTP): More secure — secret stays on device, codes generated offline. Vulnerable only if device is compromised.\n• Hardware keys (FIDO2/WebAuthn): Most secure — cryptographic challenge-response with no shared secrets. Phishing-resistant because the key verifies the domain.',
          },
        ]}
        codeExample={`// CSPRNG-based OTP generation
function generateOTP(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array); // CSPRNG — OS entropy
  return String(array[0] % 1000000).padStart(6, '0');
}
// Generates: "047293", "831056", etc.

// Real-world TOTP (RFC 6238)
function totp(secret: Uint8Array): string {
  const counter = Math.floor(Date.now() / 30000);
  const hmac = HMAC_SHA1(secret, int64ToBytes(counter));
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24 | hmac[offset+1] << 16
    | hmac[offset+2] << 8 | hmac[offset+3]) % 1000000;
  return code.toString().padStart(6, '0');
}`}
        securityNote="Real-world TOTP (RFC 6238) uses HMAC-SHA1 with a shared secret and the current timestamp, allowing both client and server to independently generate the same code without transmitting it. SMS-based OTP is vulnerable to SIM-swapping — prefer authenticator apps or hardware keys."
        liveData={pendingOTP ? [
          { label: 'Generated OTP', value: pendingOTP.otp, color: 'text-primary' },
          { label: 'Time Remaining', value: `${timeLeft}s / 60s`, color: timeLeft < 15 ? 'text-destructive' : 'text-muted-foreground' },
          { label: 'Status', value: result === 'success' ? '✓ Verified' : result === 'expired' ? '✗ Expired' : result === 'fail' ? '✗ Mismatch' : 'Pending verification', color: result === 'success' ? 'text-primary' : 'text-muted-foreground' },
        ] : undefined}
      />}
    </div>
  );
};

export default MFAStep;
