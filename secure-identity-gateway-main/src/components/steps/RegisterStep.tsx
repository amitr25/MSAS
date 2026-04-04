import React, { useState, useMemo } from 'react';
import { sha256Hash } from '@/lib/crypto';
import { useAuthStore } from '@/lib/auth-store';
import TerminalCard from '@/components/TerminalCard';
import AlgorithmPanel from '@/components/AlgorithmPanel';
import { UserPlus, Check, X, RefreshCw, Eye, EyeOff, Copy, Shield } from 'lucide-react';
import type { Role } from '@/lib/crypto';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'At least 1 uppercase letter (A-Z)', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'At least 1 lowercase letter (a-z)', test: (p: string) => /[a-z]/.test(p) },
  { label: 'At least 1 digit (0-9)', test: (p: string) => /[0-9]/.test(p) },
  { label: 'At least 1 special character (!@#$...)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function generateStrongPassword(): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const specials = '!@#$%&*?';
  const all = upper + lower + digits + specials;

  // Guarantee one from each category
  const mandatory = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    specials[Math.floor(Math.random() * specials.length)],
  ];

  const remaining = Array.from({ length: 8 }, () => all[Math.floor(Math.random() * all.length)]);
  const combined = [...mandatory, ...remaining];
  // Shuffle
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined.join('');
}

function calcEntropy(p: string): number {
  let pool = 0;
  if (/[a-z]/.test(p)) pool += 26;
  if (/[A-Z]/.test(p)) pool += 26;
  if (/[0-9]/.test(p)) pool += 10;
  if (/[^A-Za-z0-9]/.test(p)) pool += 32;
  return pool > 0 ? Math.floor(p.length * Math.log2(pool)) : 0;
}

const RegisterStep: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('user');
  const [hash, setHash] = useState('');
  const [registered, setRegistered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [suggestedPassword, setSuggestedPassword] = useState(() => generateStrongPassword());
  const [copied, setCopied] = useState(false);
  const { addUser, getUser, addLog, setActiveStep, learnMode } = useAuthStore();

  const ruleResults = useMemo(() => PASSWORD_RULES.map(r => ({ ...r, passed: r.test(password) })), [password]);
  const allPassed = ruleResults.every(r => r.passed);
  const entropy = useMemo(() => calcEntropy(password), [password]);
  const strengthLabel = entropy < 28 ? 'Weak' : entropy < 36 ? 'Fair' : entropy < 50 ? 'Good' : 'Strong';
  const strengthColor = entropy < 28 ? 'text-destructive' : entropy < 36 ? 'text-yellow-500' : entropy < 50 ? 'text-blue-400' : 'text-green-400';
  const strengthBarColor = entropy < 28 ? 'bg-destructive' : entropy < 36 ? 'bg-yellow-500' : entropy < 50 ? 'bg-blue-400' : 'bg-green-400';
  const strengthPercent = Math.min(100, Math.round((entropy / 60) * 100));

  const useSuggested = () => {
    setPassword(suggestedPassword);
    setShowPassword(true);
  };

  const regenerateSuggestion = () => {
    setSuggestedPassword(generateStrongPassword());
    setCopied(false);
  };

  const copySuggestion = () => {
    navigator.clipboard.writeText(suggestedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRegister = async () => {
    if (!username || !password || !allPassed) return;
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
    <div className="space-y-4">
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-secondary border border-border rounded px-3 py-2 pr-9 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  placeholder="••••••••"
                  disabled={registered}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Password strength bar */}
              {password.length > 0 && !registered && (
                <div className="mt-2 space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strengthBarColor}`}
                        style={{ width: `${strengthPercent}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-mono font-semibold ${strengthColor}`}>
                      {strengthLabel} ({entropy}-bit entropy)
                    </span>
                  </div>

                  {/* Validation checklist */}
                  <div className="bg-secondary/60 rounded p-2.5 border border-border/50 space-y-1">
                    {ruleResults.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] font-mono">
                        {r.passed
                          ? <Check size={12} className="text-green-400 shrink-0" />
                          : <X size={12} className="text-destructive shrink-0" />}
                        <span className={r.passed ? 'text-green-400' : 'text-muted-foreground'}>{r.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Suggested password */}
                  {!allPassed && (
                    <div className="bg-primary/5 border border-primary/15 rounded p-2.5 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-primary font-semibold">
                        <Shield size={11} /> SUGGESTED STRONG PASSWORD
                      </div>
                      <div className="flex items-center gap-1.5">
                        <code className="flex-1 text-xs font-mono text-foreground bg-secondary/80 rounded px-2 py-1 border border-border/50 select-all break-all">
                          {suggestedPassword}
                        </code>
                        <button onClick={copySuggestion} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground" title="Copy">
                          <Copy size={13} />
                        </button>
                        <button onClick={regenerateSuggestion} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground" title="Regenerate">
                          <RefreshCw size={13} />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={useSuggested}
                          className="text-[10px] font-mono px-2.5 py-1 rounded bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors"
                        >
                          Use this password
                        </button>
                        {copied && <span className="text-[10px] font-mono text-green-400 self-center">Copied!</span>}
                      </div>
                    </div>
                  )}

                  {allPassed && (
                    <div className="text-[10px] font-mono text-green-400 flex items-center gap-1">
                      <Check size={11} /> Password meets all security requirements
                    </div>
                  )}
                </div>
              )}
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
              disabled={!username || !password || !allPassed}
              className="w-full py-2 rounded bg-primary text-primary-foreground font-mono text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              Register User
            </button>
          )}

          {hash && (
            <div className="mt-4 space-y-2 animate-fade-in">
              <div className="text-xs font-mono text-primary">✓ Registration successful — password securely hashed</div>
              <div className="bg-secondary/80 rounded p-3 border border-border/50">
                <div className="text-xs font-mono text-muted-foreground mb-1">Plaintext Input:</div>
                <div className="text-sm font-mono text-destructive">{'•'.repeat(password.length)} <span className="text-muted-foreground text-[10px]">(never stored)</span></div>
                <div className="text-xs font-mono text-muted-foreground mt-2 mb-1">SHA-256 Hash (stored in database):</div>
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

      {learnMode && <AlgorithmPanel
        title="SHA-256 Password Hashing"
        description="SHA-256 is a one-way cryptographic hash function that converts any input into a fixed 256-bit (64 hex character) digest. It is computationally infeasible to reverse the hash back to the original password."
        steps={[
          {
            label: 'UTF-8 Encoding',
            detail: 'The plaintext password string is converted into a sequence of bytes using UTF-8 encoding.',
            deepDive: 'UTF-8 is a variable-width encoding that maps each Unicode character to 1–4 bytes. ASCII characters (a-z, 0-9) use 1 byte each. For example, "hello" becomes [0x68, 0x65, 0x6C, 0x6C, 0x6F] — 5 bytes. This byte array is the actual input to SHA-256, not the string itself. The TextEncoder API performs this conversion in JavaScript.',
            highlight: !!password,
          },
          {
            label: 'Message Padding',
            detail: 'The byte sequence is padded to a multiple of 512 bits (64 bytes), appending a 1-bit, zeros, and the original message length.',
            deepDive: 'Padding ensures every message fills complete 512-bit blocks. The process: (1) Append a single "1" bit. (2) Append "0" bits until the message is 448 bits mod 512. (3) Append the original message length as a 64-bit big-endian integer. This guarantees different-length messages always produce different padded blocks, preventing length-extension vulnerabilities in the basic form.',
          },
          {
            label: 'Block Processing (64 Rounds)',
            detail: 'The padded message is split into 512-bit blocks. Each block goes through 64 rounds of compression.',
            deepDive: 'Each 512-bit block is divided into sixteen 32-bit words (W₀–W₁₅). Words W₁₆ through W₆₃ are derived using:\n\nWₜ = σ₁(Wₜ₋₂) + Wₜ₋₇ + σ₀(Wₜ₋₁₅) + Wₜ₋₁₆\n\nwhere σ₀ and σ₁ are bitwise rotation and shift functions. This "message schedule" expansion ensures that every input bit influences many rounds, creating the avalanche effect.',
          },
          {
            label: 'Compression Function',
            detail: 'Each round applies bitwise operations (Ch, Maj, Σ0, Σ1), addition mod 2^32, and mixes in a round constant derived from prime cube roots.',
            deepDive: 'The compression function uses 8 working variables (a–h) and two auxiliary functions:\n\n• Ch(x,y,z) = (x AND y) XOR (NOT x AND z) — "choice": x chooses between y and z\n• Maj(x,y,z) = (x AND y) XOR (x AND z) XOR (y AND z) — "majority": output is the majority bit\n\nEach round computes:\nT₁ = h + Σ₁(e) + Ch(e,f,g) + Kₜ + Wₜ\nT₂ = Σ₀(a) + Maj(a,b,c)\n\nThe 64 round constants Kₜ are the first 32 bits of the fractional parts of the cube roots of the first 64 primes. This adds non-linearity from number theory.',
          },
          {
            label: 'Final Digest',
            detail: 'After all blocks are processed, the 8 working variables (each 32 bits) are concatenated to produce the final 256-bit hash.',
            deepDive: 'The initial hash values H₀–H₇ are the first 32 bits of the fractional parts of the square roots of the first 8 primes (2, 3, 5, 7, 11, 13, 17, 19). After processing all blocks, these values are updated and concatenated into the final 256-bit (32-byte) digest, represented as 64 hexadecimal characters.\n\nAvalanche effect demo:\nSHA-256("hello") → 2cf24dba...\nSHA-256("hallo") → d3751d73...\nOne character change → completely different hash.',
            highlight: !!hash,
          },
        ]}
        deepDiveSections={[
          {
            heading: 'Why SHA-256 is One-Way (Pre-image Resistance)',
            text: 'The compression function involves modular addition and bitwise operations that destroy information. Given a hash output, there is no mathematical shortcut to find the input — you would need to try ~2²⁵⁶ inputs (brute force). At 10 billion hashes/second, this would take ~3.7 × 10⁵⁹ years.',
          },
          {
            heading: 'Collision Resistance & Birthday Paradox',
            text: 'A collision occurs when two different inputs produce the same hash. Due to the birthday paradox, finding a collision requires ~2¹²⁸ operations (square root of 2²⁵⁶). This is still computationally infeasible with current technology. MD5 and SHA-1 have been broken (practical collisions found), but SHA-256 remains secure.',
          },
          {
            heading: 'Salt & Key Stretching (Production Enhancement)',
            text: 'SHA-256 alone is fast (~6 million hashes/sec on a modern GPU), making it vulnerable to dictionary and rainbow table attacks. Production systems add:\n\n• Salt: A random string appended to each password before hashing, so identical passwords produce different hashes.\n• Key stretching (bcrypt, Argon2): Intentionally slow hashing (e.g., 100ms per hash) to make brute-force impractical.',
          },
        ]}
        codeExample={`// SHA-256 in Web Crypto API
const encoder = new TextEncoder();
const data = encoder.encode("myPassword");
const hashBuffer = await crypto.subtle.digest("SHA-256", data);
const hashArray = Array.from(new Uint8Array(hashBuffer));
const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
// → "89e01536ac207279409d4de1e5253e01f4a1769e696db0d6062ca9b8f56767c8"`}
        securityNote="SHA-256 alone is fast, making it vulnerable to brute-force attacks. Production systems add a random salt to each password and use key-stretching algorithms like bcrypt or Argon2 that intentionally slow down hashing to ~100ms per attempt."
        liveData={hash ? [
          { label: 'Input', value: `"${password}" (${password.length} chars, ${new TextEncoder().encode(password).length} bytes)` },
          { label: 'Output', value: hash, color: 'text-primary' },
          { label: 'Bits', value: '256 (64 hex characters)', color: 'text-muted-foreground' },
          { label: 'Irreversible', value: 'Cannot recover password from hash', color: 'text-destructive' },
        ] : undefined}
      />}
    </div>
  );
};

export default RegisterStep;
