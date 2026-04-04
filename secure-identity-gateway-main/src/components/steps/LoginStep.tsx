import React, { useState } from 'react';
import { sha256Hash, generateOTP } from '@/lib/crypto';
import { useAuthStore } from '@/lib/auth-store';
import TerminalCard from '@/components/TerminalCard';
import AlgorithmPanel from '@/components/AlgorithmPanel';
import { LogIn } from 'lucide-react';

const MAX_ATTEMPTS = 3;

const LoginStep: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<'idle' | 'success' | 'fail' | 'locked'>('idle');
  const [inputHash, setInputHash] = useState('');
  const [storedHash, setStoredHash] = useState('');
  const { getUser, updateUser, addLog, setActiveStep, setPendingOTP, learnMode } = useAuthStore();

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
    setStoredHash(user.passwordHash);

    if (hash === user.passwordHash) {
      updateUser(username, { failedAttempts: 0 });
      addLog({ event: `Password verified for "${username}"`, username, status: 'success' });
      setResult('success');
      const otp = generateOTP();
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
    <div className="space-y-4">
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
            <div className="text-xs font-mono text-destructive animate-fade-in">✗ Authentication failed — hash mismatch</div>
          )}
          {result === 'locked' && (
            <div className="text-xs font-mono text-warning animate-fade-in">⚠ Account locked — too many failed attempts ({MAX_ATTEMPTS}/{MAX_ATTEMPTS})</div>
          )}
          {result === 'success' && (
            <div className="space-y-2 animate-fade-in">
              <div className="text-xs font-mono text-primary">✓ Hash match — password verified</div>
              <div className="text-xs font-mono text-info">→ OTP sent — check MFA step</div>
              <button onClick={() => setActiveStep(2)} className="text-xs font-mono text-primary/70 hover:text-primary underline">
                → Proceed to MFA Verification
              </button>
            </div>
          )}
        </div>
      </TerminalCard>

      {learnMode && <AlgorithmPanel
        title="Hash-Based Password Verification"
        description="Instead of storing and comparing plaintext passwords, the system hashes the login input with SHA-256 and compares it against the stored hash. This ensures passwords are never exposed, even to the system itself."
        steps={[
          {
            label: 'Receive Credentials',
            detail: 'User submits username and password via the login form.',
            deepDive: 'The login form captures credentials over a secure channel. In production, this would be HTTPS (TLS 1.3), which encrypts the data in transit. The server never logs or stores the plaintext password — it exists only in memory during verification and is immediately discarded after hashing.',
            highlight: !!username,
          },
          {
            label: 'Lookup Stored Hash',
            detail: 'The system retrieves the SHA-256 hash stored during registration for the given username.',
            deepDive: 'The database stores only the hash, never the plaintext. If the database is breached, attackers get hashes — not passwords. The lookup also checks the account lockout status. If the account does not exist, the system still performs a dummy hash computation to prevent timing-based user enumeration attacks.',
          },
          {
            label: 'Hash Login Password',
            detail: 'The submitted password is hashed using the same SHA-256 algorithm.',
            deepDive: 'The exact same SHA-256 process used during registration is applied: UTF-8 encode → pad to 512-bit blocks → 64 rounds of compression → 256-bit digest. Because SHA-256 is deterministic, the same password always produces the same hash. This allows verification without ever comparing or storing plaintext.',
            highlight: !!inputHash,
          },
          {
            label: 'Constant-Time Comparison',
            detail: 'if (input_hash === stored_hash) → grant access. The system never sees or compares plaintext passwords.',
            deepDive: 'A critical security detail: hash comparison must be constant-time. A naive comparison (===) returns early on the first mismatched character, leaking timing information. An attacker could measure response times to guess the hash character-by-character. Constant-time comparison checks ALL characters regardless of mismatches:\n\nlet result = 0;\nfor (let i = 0; i < a.length; i++) {\n  result |= a.charCodeAt(i) ^ b.charCodeAt(i);\n}\nreturn result === 0; // true only if all chars match',
            highlight: result === 'success' || result === 'fail',
          },
          {
            label: 'Account Lockout Check',
            detail: `After ${MAX_ATTEMPTS} consecutive failures, the account is locked to prevent brute-force attacks.`,
            deepDive: `The lockout mechanism is a critical defense against brute-force and credential-stuffing attacks:\n\n• Each failed attempt increments a counter: failedAttempts++\n• After ${MAX_ATTEMPTS} consecutive failures: account.locked = true\n• Locked accounts reject all login attempts immediately\n• A successful login resets the counter to 0\n\nIn production, lockouts are typically time-based (e.g., 15-minute lockout) rather than permanent, with exponential backoff and CAPTCHA challenges.`,
            highlight: result === 'locked',
          },
        ]}
        deepDiveSections={[
          {
            heading: 'Timing Side-Channel Attacks',
            text: 'If hash comparison takes different amounts of time for different inputs, an attacker can deduce information about the stored hash. For example, if the first character matches but the second doesn\'t, the comparison takes slightly longer than if the first character mismatches. Over thousands of attempts, this timing difference reveals the hash byte-by-byte. Constant-time comparison eliminates this attack vector.',
          },
          {
            heading: 'Brute-Force Attack Economics',
            text: 'A brute-force attack tries every possible password:\n• 8-char lowercase: 26⁸ = 208 billion combinations (~20 seconds at 10B hashes/sec)\n• 8-char mixed case + digits + symbols: 95⁸ = 6.6 quadrillion (~7.6 days)\n• 12-char mixed: 95¹² = 5.4 × 10²³ (~1.7 million years)\n\nThis is why password length matters more than complexity. Key-stretching (bcrypt) multiplies each attempt time by ~1000x.',
          },
          {
            heading: 'Credential Stuffing vs Brute Force',
            text: 'Brute force tries all possible passwords for one account. Credential stuffing uses leaked username/password pairs from other breaches — since ~65% of people reuse passwords, this is highly effective. Account lockout helps against brute force but not credential stuffing. Rate limiting, CAPTCHA, and breach-password checking (e.g., HaveIBeenPwned API) defend against stuffing.',
          },
        ]}
        codeExample={`// Hash-based login verification
async function verifyLogin(username: string, password: string): Promise<boolean> {
  const user = database.findUser(username);
  if (!user) {
    await sha256Hash(password); // dummy hash to prevent timing leak
    return false;
  }
  if (user.locked) return false;

  const inputHash = await sha256Hash(password);
  const match = constantTimeEquals(inputHash, user.passwordHash);

  if (match) {
    user.failedAttempts = 0;
    return true;
  } else {
    user.failedAttempts++;
    if (user.failedAttempts >= 3) user.locked = true;
    return false;
  }
}`}
        securityNote="Always perform a hash computation even when the user doesn't exist — this prevents timing-based user enumeration. Never reveal whether the username or password was incorrect; use a generic 'invalid credentials' message."
        liveData={inputHash ? [
          { label: 'Input Hash', value: inputHash.slice(0, 32) + '...', color: 'text-primary' },
          { label: 'Stored Hash', value: storedHash ? storedHash.slice(0, 32) + '...' : 'N/A', color: 'text-muted-foreground' },
          { label: 'Match', value: result === 'success' ? '✓ MATCH — Access Granted' : '✗ MISMATCH — Access Denied', color: result === 'success' ? 'text-primary' : 'text-destructive' },
        ] : undefined}
      />}
    </div>
  );
};

export default LoginStep;
