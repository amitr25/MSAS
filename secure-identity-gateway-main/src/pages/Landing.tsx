import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, Key, UserPlus, LogIn, Smartphone,
  Users, FileText, ArrowRight, CheckCircle2, Zap,
  ShieldCheck, Hash, KeyRound, Timer, Eye, BookOpen,
  Layers, Database, AlertTriangle, RefreshCw,
  ChevronRight, ChevronDown, Code2, Cpu, Network, Workflow, X
} from 'lucide-react';

/* ───────────── DATA ───────────── */

const features = [
  {
    icon: Hash,
    title: 'SHA-256 Password Hashing',
    tagline: 'One-way function · 2²⁵⁶ outputs · Collision-resistant',
    color: 'bg-primary/10 text-primary border-primary/20',
    overview: 'SHA-256 converts any input into a fixed 256-bit (32-byte) hash digest. It is deterministic (same input → same hash) and irreversible (cannot recover the original input from the hash).',
    deepDive: [
      { heading: '1. Pre-processing', text: 'The password string is encoded to UTF-8 bytes. The message is padded with a 1-bit, zeros, and a 64-bit length field so total length is a multiple of 512 bits.' },
      { heading: '2. Initial Hash Values', text: 'Eight 32-bit words (H₀–H₇) are initialized to the first 32 bits of the fractional parts of the square roots of the first 8 primes (2, 3, 5, 7, 11, 13, 17, 19).' },
      { heading: '3. Message Schedule', text: 'Each 512-bit block is split into sixteen 32-bit words (W₀–W₁₅). Words W₁₆–W₆₃ are computed using: Wₜ = σ₁(Wₜ₋₂) + Wₜ₋₇ + σ₀(Wₜ₋₁₅) + Wₜ₋₁₆.' },
      { heading: '4. Compression Function (64 rounds)', text: 'Each round applies: T₁ = h + Σ₁(e) + Ch(e,f,g) + Kₜ + Wₜ and T₂ = Σ₀(a) + Maj(a,b,c). The 8 working variables are rotated and updated. Ch (choice) selects bits, Maj (majority) votes on bits.' },
      { heading: '5. Final Digest', text: 'After all blocks are processed, the final H₀–H₇ values are concatenated into the 256-bit hash. Even a 1-bit change in input produces a completely different hash (avalanche effect).' },
    ],
    codeExample: `// SHA-256 in Web Crypto API
const encoder = new TextEncoder();
const data = encoder.encode("myPassword");
const hashBuffer = await crypto.subtle.digest("SHA-256", data);
const hashArray = Array.from(new Uint8Array(hashBuffer));
const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
// → "89e01536ac207279409d4de1e5253e01f4a1769e696db0d6062ca9b8f56767c8"`,
    securityNote: 'SHA-256 alone is fast, which makes it vulnerable to brute-force. Production systems add a salt (random bytes) and use key-stretching algorithms like bcrypt or Argon2 that intentionally slow down hashing.',
  },
  {
    icon: Lock,
    title: 'AES Symmetric Encryption',
    tagline: '128/256-bit keys · Block cipher · Data-at-rest protection',
    color: 'bg-info/10 text-info border-info/20',
    overview: 'AES (Advanced Encryption Standard) encrypts data in 128-bit blocks using the same secret key for both encryption and decryption. It is the global standard for protecting classified data.',
    deepDive: [
      { heading: '1. Key Expansion', text: 'The cipher key (128/192/256 bits) is expanded into a key schedule of 11/13/15 round keys using the Rijndael key schedule — involving RotWord, SubWord, and XOR with round constants (Rcon).' },
      { heading: '2. Initial Round — AddRoundKey', text: 'The 16-byte plaintext is arranged into a 4×4 state matrix. Each byte is XORed with the corresponding byte of the first round key.' },
      { heading: '3. SubBytes (S-Box Substitution)', text: 'Each byte in the state is replaced using a pre-computed substitution table (S-Box). The S-Box is derived from the multiplicative inverse in GF(2⁸) followed by an affine transformation.' },
      { heading: '4. ShiftRows', text: 'Row 0 stays; Row 1 shifts left 1; Row 2 shifts left 2; Row 3 shifts left 3. This diffuses bytes across columns.' },
      { heading: '5. MixColumns', text: 'Each column is multiplied by a fixed polynomial matrix in GF(2⁸). This provides inter-byte diffusion within each column. Skipped in the final round.' },
      { heading: '6. Repeat & Final', text: 'Steps 3-5 + AddRoundKey repeat for 10 rounds (AES-128). The final round omits MixColumns. The resulting state matrix is the ciphertext.' },
    ],
    codeExample: `// AES-GCM encryption with Web Crypto API
const key = await crypto.subtle.generateKey(
  { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]
);
const iv = crypto.getRandomValues(new Uint8Array(12));
const ciphertext = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv }, key, new TextEncoder().encode("secret data")
);`,
    securityNote: 'AES requires secure key distribution since both parties need the same key. In practice, AES is combined with RSA or Diffie-Hellman for key exchange (hybrid encryption).',
  },
  {
    icon: KeyRound,
    title: 'RSA Asymmetric Encryption',
    tagline: 'Key pairs · Modular exponentiation · Digital signatures',
    color: 'bg-accent/10 text-accent border-accent/20',
    overview: 'RSA uses two mathematically linked keys: a public key (shared openly) for encryption, and a private key (kept secret) for decryption. Security relies on the computational difficulty of factoring large semi-primes.',
    deepDive: [
      { heading: '1. Prime Generation', text: 'Two large random primes p and q are generated (typically 1024 bits each for RSA-2048). Primality is tested using Miller-Rabin probabilistic tests.' },
      { heading: '2. Compute Modulus', text: 'n = p × q becomes the modulus. The security of RSA depends on the difficulty of factoring n back into p and q. For RSA-2048, n is a 617-digit number.' },
      { heading: '3. Euler\'s Totient', text: 'φ(n) = (p−1)(q−1) represents the count of integers less than n that are coprime to n. This value is critical for key generation but must remain secret.' },
      { heading: '4. Public Exponent', text: 'e is chosen such that 1 < e < φ(n) and gcd(e, φ(n)) = 1. The standard choice is e = 65537 (0x10001), which balances security with performance.' },
      { heading: '5. Private Exponent', text: 'd ≡ e⁻¹ (mod φ(n)) is computed using the Extended Euclidean Algorithm. This ensures that (mᵉ)ᵈ ≡ m (mod n) — the mathematical foundation of RSA.' },
      { heading: '6. Encrypt / Decrypt', text: 'Encryption: c = mᵉ mod n (using public key). Decryption: m = cᵈ mod n (using private key). Messages must be smaller than n; larger data uses hybrid encryption.' },
    ],
    codeExample: `// RSA-OAEP key pair generation
const keyPair = await crypto.subtle.generateKey(
  { name: "RSA-OAEP", modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256" },
  true, ["encrypt", "decrypt"]
);
// Encrypt with public key → decrypt with private key`,
    securityNote: 'RSA is slower than AES, so it is typically used only to encrypt small data (like AES keys). Quantum computers could break RSA via Shor\'s algorithm — post-quantum alternatives (e.g., CRYSTALS-Kyber) are being standardized.',
  },
  {
    icon: Smartphone,
    title: 'Multi-Factor Authentication (MFA)',
    tagline: 'Time-bound · 60s expiry · CSPRNG-generated',
    color: 'bg-warning/10 text-warning border-warning/20',
    overview: 'MFA requires a second proof of identity beyond the password. This system uses time-based one-time passwords (TOTP) — 6-digit codes valid for a short window, generated using cryptographically secure randomness.',
    deepDive: [
      { heading: '1. Trigger Condition', text: 'MFA is initiated only after successful password verification (hash match). This ensures the first authentication factor is valid before challenging with the second.' },
      { heading: '2. OTP Generation (CSPRNG)', text: 'A 6-digit code is generated using crypto.getRandomValues() — a CSPRNG (Cryptographically Secure Pseudo-Random Number Generator) that draws entropy from OS-level sources (hardware noise, interrupt timing).' },
      { heading: '3. Time Window', text: 'The OTP is stamped with an expiration time (current time + 60 seconds). The server stores: { otp, username, expiresAt }. After expiry, the code is invalid regardless of correctness.' },
      { heading: '4. Verification Logic', text: 'The system checks: (1) Is the OTP expired? → reject. (2) Does user_input === stored_otp? → accept. Both conditions must pass. Timing is checked first to fail fast on expired codes.' },
      { heading: '5. Replay Prevention', text: 'Each OTP is single-use. Once verified (or expired), it cannot be reused. Combined with the short time window, this prevents interception and replay attacks.' },
    ],
    codeExample: `// CSPRNG-based OTP generation
function generateOTP(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1000000).padStart(6, '0');
}
// Generates: "047293", "831056", etc.`,
    securityNote: 'Real-world TOTP (RFC 6238) uses HMAC-SHA1 with a shared secret and the current timestamp, allowing both client and server to independently generate the same code without transmitting it.',
  },
  {
    icon: Users,
    title: 'Role-Based Access Control (RBAC)',
    tagline: 'Admin / User roles · Resource-level control · Least privilege',
    color: 'bg-destructive/10 text-destructive border-destructive/20',
    overview: 'RBAC restricts system access based on assigned roles rather than individual identities. Each role maps to a set of permissions, and access decisions evaluate: does the user\'s role include the requested permission?',
    deepDive: [
      { heading: '1. Role Assignment', text: 'During registration, each user is assigned a role (e.g., "admin" or "user"). Roles are stored alongside the user record. Role assignment should only be done by privileged users or the system itself.' },
      { heading: '2. Permission Mapping', text: 'A permission matrix maps roles to resources. Example: Admin → [Dashboard, Reports, UserMgmt, Config, Logs]. User → [Dashboard, Reports]. This matrix is the "policy" that governs access.' },
      { heading: '3. Access Evaluation', text: 'For each resource request: lookup user.role → check if role.permissions.includes(resource) → allow or deny. This is O(1) with a hash map, making RBAC extremely efficient at scale.' },
      { heading: '4. Principle of Least Privilege', text: 'Users receive only the minimum permissions necessary for their role. If an account is compromised, the attacker\'s access is limited to that role\'s permissions — reducing the blast radius.' },
      { heading: '5. Separation of Duties', text: 'Critical operations can require multiple roles. For example, creating a user (Admin) and approving the creation (SuperAdmin) — ensuring no single role can perform sensitive operations alone.' },
    ],
    codeExample: `// RBAC permission check
const permissions = {
  admin: ['dashboard', 'reports', 'users', 'config', 'logs'],
  user:  ['dashboard', 'reports']
};
function hasAccess(role: string, resource: string): boolean {
  return permissions[role]?.includes(resource) ?? false;
}`,
    securityNote: 'Never store roles client-side (localStorage) for authorization decisions. Always validate on the server. Client-side role checks are for UI convenience only — the server is the authority.',
  },
  {
    icon: Timer,
    title: 'Token Session Management',
    tagline: 'CSPRNG tokens · TTL countdown · Replay prevention',
    color: 'bg-primary/10 text-primary border-primary/20',
    overview: 'After full authentication (password + MFA + RBAC), a session token is issued. This token represents the user\'s authenticated session and must accompany every subsequent request. Tokens have a fixed TTL to limit exposure.',
    deepDive: [
      { heading: '1. Token Generation', text: 'A 256-bit (32-byte) token is generated using crypto.getRandomValues(). With 2²⁵⁶ possible values, the probability of guessing a valid token is astronomically low (~1/10⁷⁷).' },
      { heading: '2. Metadata Binding', text: 'The token is bound to: username, role, issuedAt timestamp, and expiresAt timestamp. This creates a verifiable session object that ties the token to a specific identity and time window.' },
      { heading: '3. TTL Enforcement', text: 'Tokens expire after a fixed duration (e.g., 120 seconds in this demo). On each request, the server checks: if (Date.now() > token.expiresAt) → reject and force re-authentication.' },
      { heading: '4. Token Validation Flow', text: 'For each protected request: (1) Extract token from request header. (2) Look up token in store. (3) Check expiration. (4) Verify role has permission for the requested resource.' },
      { heading: '5. Revocation & Rotation', text: 'Tokens can be revoked (logout) or rotated (issue new token, invalidate old). Short TTLs reduce the window for stolen tokens. Production systems use refresh tokens for seamless re-authentication.' },
    ],
    codeExample: `// Token generation with CSPRNG
function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}
// → "a3f8c2e1b4d7...9f0e2c" (64 hex chars = 256 bits)`,
    securityNote: 'In production, use JWTs (JSON Web Tokens) with HMAC-SHA256 signatures for stateless verification. Never store sensitive data in the JWT payload — it\'s base64-encoded, not encrypted.',
  },
];

const workflowSteps = [
  {
    icon: UserPlus, label: 'User Registration', sublabel: 'Input Layer',
    detail: 'User submits username, password, and role selection.',
    expanded: 'The registration form collects credentials and a role assignment. The password is never stored — it is immediately processed through the hashing pipeline. The username must be unique to prevent account conflicts. Input validation checks for minimum password length and character requirements before processing.',
    techDetail: 'Input → validate(username, password) → if valid, proceed to hashing pipeline',
  },
  {
    icon: Hash, label: 'SHA-256 Hashing', sublabel: 'Crypto Layer',
    detail: 'Password → 256-bit irreversible digest.',
    expanded: 'The plaintext password is fed through SHA-256, producing a fixed 256-bit hash. This is a one-way function — you cannot reverse the hash to get the password. The hash is deterministic: the same password always produces the same hash, enabling verification without storing the original password. The system demonstrates the avalanche effect: changing a single character completely changes the output hash.',
    techDetail: 'hash = SHA-256(UTF-8(password)) → 64 hex characters (256 bits)',
  },
  {
    icon: Database, label: 'Secure Storage', sublabel: 'Storage Layer',
    detail: 'Hash stored, plaintext discarded permanently.',
    expanded: 'Only the hash is persisted. The plaintext password exists only in memory during the hashing computation and is immediately discarded. Even if the storage is compromised, attackers get hashes — not passwords. Without the original input, the hash is computationally infeasible to reverse (would take billions of years with current hardware for a strong password).',
    techDetail: 'store({ username, passwordHash, role, failedAttempts: 0, locked: false })',
  },
  {
    icon: LogIn, label: 'Login Attempt', sublabel: 'Input Layer',
    detail: 'User submits credentials for verification.',
    expanded: 'The user provides their username and password. The system first checks if the account exists and whether it is locked (due to previous failed attempts). If the account is valid and unlocked, the password is hashed and compared against the stored hash. This prevents timing attacks by always performing the hash computation regardless of whether the user exists.',
    techDetail: 'input(username, password) → lookup(username) → check(locked?) → proceed',
  },
  {
    icon: Cpu, label: 'Hash Verification', sublabel: 'Verification Layer',
    detail: 'Constant-time comparison: input_hash === stored_hash.',
    expanded: 'The login password is hashed using the same SHA-256 algorithm. The resulting hash is compared to the stored hash using a constant-time comparison to prevent timing side-channel attacks. If they match, the password is correct. If not, a failed attempt counter increments. After 3 consecutive failures, the account is locked to prevent brute-force attacks.',
    techDetail: 'if (SHA-256(input) === storedHash) → success | else → failedAttempts++ → if ≥3 → lock()',
  },
  {
    icon: Smartphone, label: 'MFA Challenge', sublabel: 'Identity Layer',
    detail: '6-digit time-bound OTP via CSPRNG.',
    expanded: 'After password verification succeeds, a second factor is required. A 6-digit code is generated using crypto.getRandomValues() (CSPRNG) and delivered to the user. The code has a 60-second validity window. The user must enter the correct code before expiry. This ensures that even if the password is compromised, access requires possession of the second factor (phone, email).',
    techDetail: 'otp = CSPRNG() % 1000000 → padStart(6) → store({ otp, expiresAt: now + 60s })',
  },
  {
    icon: Users, label: 'RBAC Evaluation', sublabel: 'Authorization Layer',
    detail: 'Role → Permission matrix evaluation.',
    expanded: 'After identity is confirmed (password + MFA), the system evaluates what the user is allowed to do. The user\'s role is looked up in a permission matrix that maps roles to allowed resources. Admin users get full access; regular users get limited access. This evaluation happens on every resource request, not just at login — ensuring continuous authorization.',
    techDetail: 'allow = permissionMatrix[user.role].includes(requestedResource)',
  },
  {
    icon: Key, label: 'Token Issuance', sublabel: 'Session Layer',
    detail: '256-bit CSPRNG session token with TTL.',
    expanded: 'A 256-bit cryptographically random token is generated and bound to the user\'s session metadata (username, role, timestamps). The token has a fixed time-to-live (TTL). Every subsequent request must include this token for validation. When the TTL expires, the user must re-authenticate. This limits the damage window if a token is intercepted.',
    techDetail: 'token = hex(CSPRNG(32 bytes)) → bind({ username, role, issuedAt, expiresAt: now + TTL })',
  },
  {
    icon: ShieldCheck, label: 'Secure Access', sublabel: 'Access Layer',
    detail: 'Token-validated resource access.',
    expanded: 'For every protected resource request, the system extracts the token, validates it (exists? expired? role has permission?), and either grants or denies access. This is the runtime enforcement layer — the culmination of all previous security steps. Without a valid, non-expired token with the correct role, access is denied.',
    techDetail: 'validate(token) → check(expiry) → check(rbac) → allow | deny',
  },
  {
    icon: FileText, label: 'Audit Logging', sublabel: 'Monitoring Layer',
    detail: 'Immutable event trail for forensics.',
    expanded: 'Every authentication event is logged with a timestamp, event type, username, and status (success/error/warning). Logs are append-only and immutable — they cannot be modified or deleted. This creates a forensic trail for security audits, incident response, and compliance. Patterns in logs (e.g., repeated failures) can trigger automated security responses.',
    techDetail: 'log({ timestamp, event, username, status }) → append to immutable audit trail',
  },
];

const algorithmDetails = [
  {
    icon: Hash,
    title: 'SHA-256 Internals',
    color: 'text-primary',
    sections: [
      { heading: 'Mathematical Foundation', content: 'SHA-256 belongs to the Merkle-Damgård family of hash functions. It uses bitwise operations (AND, OR, XOR, NOT), modular addition (mod 2³²), and bit rotations to achieve diffusion and confusion — the two properties that make a hash function secure.' },
      { heading: 'Compression Function', content: 'The core of SHA-256 is its compression function, which processes each 512-bit block through 64 rounds. Each round uses two auxiliary functions:\n• Ch(x,y,z) = (x AND y) XOR (NOT x AND z) — "choice" function\n• Maj(x,y,z) = (x AND y) XOR (x AND z) XOR (y AND z) — "majority" function' },
      { heading: 'Avalanche Effect', content: 'Changing a single bit in the input changes approximately 50% of the output bits. This makes it impossible to determine input similarity from hash similarity. Example:\nSHA-256("hello") → 2cf24d...  SHA-256("hallo") → d3751d... — completely different despite 1-character change.' },
      { heading: 'Why 256 Bits?', content: 'With 2²⁵⁶ possible outputs, a brute-force attack would require ~2¹²⁸ operations to find a collision (birthday paradox). At 10 billion hashes/second, this would take ~10²² years — far longer than the age of the universe.' },
    ],
  },
  {
    icon: Lock,
    title: 'AES Internals',
    color: 'text-info',
    sections: [
      { heading: 'Galois Field Arithmetic', content: 'AES operates in GF(2⁸) — a finite field with 256 elements. Addition is XOR, multiplication uses polynomial reduction modulo x⁸ + x⁴ + x³ + x + 1. This allows every non-zero element to have a multiplicative inverse, which is essential for the S-Box construction.' },
      { heading: 'S-Box Construction', content: 'The AES S-Box is not arbitrary — it is derived mathematically: (1) Take the multiplicative inverse of each byte in GF(2⁸). (2) Apply an affine transformation over GF(2). This produces a substitution with optimal non-linearity, maximizing resistance to linear and differential cryptanalysis.' },
      { heading: 'Key Schedule', content: 'The original key is expanded into round keys using RotWord (cyclic byte rotation), SubWord (S-Box substitution), and XOR with round constants (Rcon). Each round key is unique, preventing related-key attacks. AES-128 generates 11 round keys from the original 128-bit key.' },
      { heading: 'Modes of Operation', content: 'AES alone encrypts only 128-bit blocks. Modes like CBC (Cipher Block Chaining), CTR (Counter), and GCM (Galois/Counter Mode) handle arbitrary-length data. GCM additionally provides authentication — verifying data integrity alongside confidentiality.' },
    ],
  },
  {
    icon: KeyRound,
    title: 'RSA Internals',
    color: 'text-accent',
    sections: [
      { heading: 'Number Theory Foundation', content: 'RSA security relies on the factoring problem: given n = p × q (where p, q are large primes), finding p and q from n alone is computationally infeasible for large n. The best known classical algorithm (General Number Field Sieve) has sub-exponential but super-polynomial complexity.' },
      { heading: 'Euler\'s Theorem', content: 'RSA\'s correctness is based on Euler\'s theorem: a^φ(n) ≡ 1 (mod n) for gcd(a,n) = 1. Since e·d ≡ 1 (mod φ(n)), we get: (mᵉ)ᵈ = m^(e·d) = m^(k·φ(n)+1) = m · (m^φ(n))^k ≡ m · 1^k ≡ m (mod n). This proves decryption recovers the original message.' },
      { heading: 'Padding Schemes', content: 'Raw RSA (textbook RSA) is insecure — it is deterministic and vulnerable to chosen-plaintext attacks. OAEP (Optimal Asymmetric Encryption Padding) adds randomness before encryption, making the ciphertext probabilistic and providing CCA2 security (security against adaptive chosen-ciphertext attacks).' },
      { heading: 'Performance & Hybrid Encryption', content: 'RSA is ~1000x slower than AES. In practice, RSA encrypts a random AES key (key encapsulation), and AES encrypts the actual data. TLS/HTTPS uses this hybrid approach: RSA or ECDH for key exchange → AES-GCM for data encryption.' },
    ],
  },
];

/* ───────────── COMPONENTS ───────────── */

const ExpandableFeatureCard: React.FC<{ feature: typeof features[0] }> = ({ feature }) => {
  const [open, setOpen] = useState(false);
  const Icon = feature.icon;

  return (
    <div className={`bg-card rounded-xl border transition-all duration-300 ${open ? 'border-primary/40 shadow-lg shadow-primary/5' : 'border-border hover:border-primary/20'}`}>
      <button onClick={() => setOpen(!open)} className="w-full text-left p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 ${feature.color}`}>
              <Icon size={20} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground text-sm">{feature.title}</h3>
              <p className="text-[10px] font-mono text-muted-foreground/70 mt-0.5">{feature.tagline}</p>
            </div>
          </div>
          <ChevronDown size={16} className={`text-muted-foreground shrink-0 mt-1 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 animate-fade-in">
          <div className="border-t border-border/50 pt-4">
            <p className="text-xs text-muted-foreground leading-relaxed">{feature.overview}</p>
          </div>

          {/* Deep dive steps */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-primary uppercase tracking-wider font-semibold">Step-by-Step Breakdown</div>
            {feature.deepDive.map((step, i) => (
              <ExpandableStep key={i} index={i} heading={step.heading} text={step.text} />
            ))}
          </div>

          {/* Code example */}
          <div>
            <div className="text-[10px] font-mono text-primary uppercase tracking-wider font-semibold mb-2">Implementation Example</div>
            <pre className="bg-secondary/80 rounded-lg p-3 border border-border/50 text-[11px] font-mono text-foreground overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {feature.codeExample}
            </pre>
          </div>

          {/* Security note */}
          <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] font-mono text-warning font-semibold mb-0.5">Security Consideration</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{feature.securityNote}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ExpandableStep: React.FC<{ index: number; heading: string; text: string }> = ({ index, heading, text }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`rounded-lg border transition-all duration-200 ${open ? 'bg-primary/5 border-primary/20' : 'bg-secondary/30 border-border/30'}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-start gap-2.5 p-2.5 text-left">
        <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <span className="text-xs font-mono font-semibold text-foreground flex-1">{heading}</span>
        <ChevronRight size={12} className={`text-muted-foreground shrink-0 mt-0.5 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="px-2.5 pb-2.5 pl-10 animate-fade-in">
          <p className="text-[11px] text-muted-foreground leading-relaxed">{text}</p>
        </div>
      )}
    </div>
  );
};

const ExpandableWorkflowStep: React.FC<{ step: typeof workflowSteps[0]; index: number; isLast: boolean }> = ({ step, index, isLast }) => {
  const [open, setOpen] = useState(false);
  const Icon = step.icon;

  return (
    <div className="relative">
      {!isLast && (
        <div className={`absolute left-6 top-14 w-px bg-border transition-all ${open ? 'h-full' : 'h-6'}`} />
      )}
      <button onClick={() => setOpen(!open)} className="w-full text-left">
        <div className="flex items-start gap-4 py-2 group">
          <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center shrink-0 group-hover:shadow-md group-hover:shadow-primary/20 transition-shadow">
            <Icon size={18} className="text-primary-foreground" />
          </div>
          <div className="flex-1 pt-1">
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-foreground text-sm">{step.label}</span>
              <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{step.sublabel}</span>
              <ChevronDown size={12} className={`text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
          </div>
          <span className="text-xs font-mono text-muted-foreground/50 pt-2">#{index + 1}</span>
        </div>
      </button>

      {open && (
        <div className="ml-16 mb-4 animate-fade-in space-y-2">
          <div className="bg-card rounded-lg border border-primary/15 p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">{step.expanded}</p>
            <div className="mt-3 bg-secondary/60 rounded-md p-2 border border-border/50">
              <div className="text-[10px] font-mono text-primary/70 mb-0.5">Technical flow:</div>
              <code className="text-[11px] font-mono text-foreground">{step.techDetail}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ExpandableAlgorithmCard: React.FC<{ algo: typeof algorithmDetails[0] }> = ({ algo }) => {
  const [openSections, setOpenSections] = useState<Set<number>>(new Set());
  const Icon = algo.icon;

  const toggleSection = (i: number) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
          <Icon size={16} className="text-primary-foreground" />
        </div>
        <h3 className={`font-display font-semibold text-sm ${algo.color}`}>{algo.title}</h3>
      </div>
      <div className="space-y-2">
        {algo.sections.map((section, i) => (
          <div key={i} className={`rounded-lg border transition-all duration-200 ${openSections.has(i) ? 'bg-primary/[0.03] border-primary/15' : 'border-border/40 hover:border-border'}`}>
            <button onClick={() => toggleSection(i)} className="w-full text-left p-3 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-foreground">{section.heading}</span>
              <ChevronRight size={12} className={`text-muted-foreground shrink-0 transition-transform duration-200 ${openSections.has(i) ? 'rotate-90' : ''}`} />
            </button>
            {openSections.has(i) && (
              <div className="px-3 pb-3 animate-fade-in">
                <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ───────────── PAGE ───────────── */

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="text-primary" size={22} />
            <span className="font-display font-bold text-lg text-foreground tracking-tight">MSAS</span>
            <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-full ml-1">v2.0</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#workflow" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Workflow</a>
            <a href="#algorithms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Deep Dives</a>
            <a href="#architecture" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Architecture</a>
          </div>
          <Link
            to="/demo"
            className="px-4 py-2 rounded-lg gradient-hero text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Launch Demo
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero-soft" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-info/5 rounded-full blur-3xl" />
        </div>
        <div className="relative container max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-6">
              <BookOpen size={12} />
              DeepTech Educational Platform · Click any section to explore
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6">
              Mini Secure<br />
              <span className="glow-text">Authentication System</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
              An interactive educational platform that demonstrates the <strong className="text-foreground">internal workings</strong> of modern authentication — 
              from cryptographic hashing and encryption to MFA, RBAC, and token management.
            </p>
            <p className="text-sm text-muted-foreground/70 max-w-xl mx-auto mb-3 font-mono">
              SHA-256 · AES · RSA · TOTP · RBAC · CSPRNG · Audit Trails
            </p>
            <p className="text-xs text-primary font-mono mb-10 animate-pulse">
              ↓ Click on any card or step below to reveal in-depth explanations
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl gradient-hero text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-primary text-base"
              >
                <Eye size={18} />
                Explore Interactive Demo
                <ArrowRight size={18} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-card border border-border text-foreground font-semibold hover:bg-secondary transition-colors"
              >
                <Code2 size={18} />
                Explore Algorithms
              </a>
            </div>
          </div>

          {/* Pipeline overview */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Workflow size={14} className="text-primary" />
                <span className="text-xs font-mono text-muted-foreground">Authentication Pipeline Overview</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {['Register', 'Hash (SHA-256)', 'Store', 'Login', 'Verify Hash', 'OTP (MFA)', 'RBAC Check', 'Issue Token', 'Access'].map((step, i) => (
                  <React.Fragment key={step}>
                    <div className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs font-mono text-foreground whitespace-nowrap">
                      {step}
                    </div>
                    {i < 8 && <ChevronRight size={12} className="text-primary/40 shrink-0" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes This Different */}
      <section className="py-16 border-b border-border">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Eye, title: 'Transparent, Not Black-Box', desc: 'Every action reveals its internal mechanics — hash computations, encryption rounds, token generation, and access decisions.' },
              { icon: Layers, title: 'Layer-by-Layer Exploration', desc: 'Click through 10 distinct security layers. Each builds on the previous, showing defense-in-depth in practice.' },
              { icon: BookOpen, title: 'Click-to-Expand Deep Dives', desc: 'Every card and workflow step is interactive. Click to reveal algorithm theory, code examples, and security considerations.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="text-center">
                  <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mx-auto mb-4">
                    <Icon size={22} className="text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features — Interactive Cards */}
      <section id="features" className="py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-xs font-mono text-muted-foreground mb-4">
              <Shield size={12} />
              Core Security Modules
            </div>
            <h2 className="text-3xl font-display font-bold text-foreground mb-3">Six Layers of Security</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Click any card to explore the full algorithm breakdown, code examples, and security notes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {features.map((f) => (
              <ExpandableFeatureCard key={f.title} feature={f} />
            ))}
          </div>
        </div>
      </section>

      {/* Workflow — Interactive Steps */}
      <section id="workflow" className="py-20 bg-card border-y border-border">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-xs font-mono text-muted-foreground mb-4">
              <Network size={12} />
              System Workflow
            </div>
            <h2 className="text-3xl font-display font-bold text-foreground mb-3">Complete Authentication Pipeline</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Click any step to reveal its internal logic, data flow, and technical implementation.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            {workflowSteps.map((step, i) => (
              <ExpandableWorkflowStep key={step.label} step={step} index={i} isLast={i === workflowSteps.length - 1} />
            ))}
          </div>
        </div>
      </section>

      {/* Algorithm Deep Dives — Interactive */}
      <section id="algorithms" className="py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-xs font-mono text-muted-foreground mb-4">
              <Code2 size={12} />
              Algorithm Deep Dives
            </div>
            <h2 className="text-3xl font-display font-bold text-foreground mb-3">Cryptographic Internals</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Click each topic to explore the mathematical foundations and implementation details.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {algorithmDetails.map((algo) => (
              <ExpandableAlgorithmCard key={algo.title} algo={algo} />
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="py-20 bg-card border-y border-border">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-xs font-mono text-muted-foreground mb-4">
              <Layers size={12} />
              System Design
            </div>
            <h2 className="text-3xl font-display font-bold text-foreground mb-3">Architecture & Security Model</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Defense-in-depth design with layered security controls.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-background rounded-xl border border-border p-6">
              <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
                <ShieldCheck size={16} className="text-primary" />
                Security Controls
              </h3>
              <ul className="space-y-3">
                {[
                  { text: 'Account lockout after 3 failed login attempts', icon: AlertTriangle, detail: 'Prevents brute-force attacks by temporarily or permanently disabling accounts after consecutive failures. The counter resets on successful login.' },
                  { text: 'Immutable audit logging of all events', icon: FileText, detail: 'Every authentication event (success, failure, lockout, OTP generation) is recorded with timestamp and status. Logs are append-only for forensic integrity.' },
                  { text: 'Token expiration prevents replay attacks', icon: Timer, detail: 'Short-lived tokens (120s TTL) limit the window for an intercepted token to be reused. Expired tokens are rejected server-side.' },
                  { text: 'Hash-only storage — no plaintext', icon: Hash, detail: 'Passwords are hashed immediately on registration. The system never stores, logs, or transmits plaintext passwords. Even database breaches expose only hashes.' },
                  { text: 'Time-bound OTP with 60s window', icon: RefreshCw, detail: 'OTPs expire after 60 seconds regardless of correctness. This limits the attack surface for intercepted codes and prevents offline brute-force of the 6-digit space.' },
                  { text: 'Least privilege via RBAC', icon: Users, detail: 'Users receive only the permissions their role requires. If a "user" account is compromised, the attacker cannot access admin resources like user management or system config.' },
                ].map((item) => {
                  const ItemIcon = item.icon;
                  return <ExpandableSecurityItem key={item.text} item={item} />;
                })}
              </ul>
            </div>

            <div className="bg-background rounded-xl border border-border p-6">
              <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
                <Zap size={16} className="text-primary" />
                Cryptographic Techniques
              </h3>
              <div className="space-y-2.5">
                {[
                  { name: 'SHA-256', type: 'Hashing', desc: 'One-way password digest', usage: 'Registration & Login', detail: 'Produces a 256-bit fingerprint of the password. Deterministic (same input → same hash) and irreversible. Used for credential verification without storing passwords.' },
                  { name: 'AES-128', type: 'Symmetric', desc: 'Data-at-rest encryption', usage: 'Data Protection', detail: 'Encrypts and decrypts data with the same secret key. Fast and efficient for bulk data. Operates on 128-bit blocks with 10 rounds of substitution and permutation.' },
                  { name: 'RSA-2048', type: 'Asymmetric', desc: 'Public-key cryptography', usage: 'Key Exchange', detail: 'Uses mathematically linked key pairs. Public key encrypts; private key decrypts. Security relies on the computational difficulty of factoring the 2048-bit modulus.' },
                  { name: 'TOTP', type: 'MFA', desc: 'Time-based one-time password', usage: 'Identity Verification', detail: 'Generates a 6-digit code valid for a short time window. Adds a second authentication factor beyond passwords, preventing account access even if the password is compromised.' },
                  { name: 'CSPRNG', type: 'Token Gen', desc: 'Cryptographic random values', usage: 'Session Tokens', detail: 'Uses hardware entropy sources to generate unpredictable random bytes. Essential for tokens and OTPs — predictable random values would allow attackers to guess valid tokens.' },
                ].map((tech) => (
                  <ExpandableTechItem key={tech.name} tech={tech} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 bg-background rounded-xl border border-border p-6">
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
              <BookOpen size={16} className="text-primary" />
              Educational Objectives
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                'Understand how passwords are securely hashed and why plaintext storage is dangerous',
                'Visualize symmetric vs asymmetric encryption and their real-world applications',
                'Learn how MFA adds a second identity factor beyond passwords',
                'See how RBAC enforces least privilege and how tokens manage sessions',
              ].map((obj, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" />
                  <span className="text-xs text-muted-foreground leading-relaxed">{obj}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <div className="max-w-lg mx-auto">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">Ready to See It in Action?</h2>
            <p className="text-muted-foreground mb-8 text-sm">
              Walk through each authentication step interactively — register, login, verify MFA, explore RBAC, test encryption, and review audit logs with real-time algorithm visualizations.
            </p>
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gradient-hero text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity glow-primary"
            >
              <Eye size={20} />
              Launch Interactive Demo
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card">
        <div className="container max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="text-primary" size={16} />
            <span className="font-mono text-xs text-muted-foreground">MSAS v2.0 — DeepTech Educational Platform</span>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/60">
            SHA-256 · AES · RSA · TOTP · RBAC · CSPRNG · Audit Logging
          </span>
        </div>
      </footer>
    </div>
  );
};

/* ── Small expandable helpers ── */

const ExpandableSecurityItem: React.FC<{ item: { text: string; icon: any; detail: string } }> = ({ item }) => {
  const [open, setOpen] = useState(false);
  const Icon = item.icon;
  return (
    <li>
      <button onClick={() => setOpen(!open)} className="w-full text-left flex items-start gap-3 text-xs text-muted-foreground hover:text-foreground transition-colors group">
        <Icon size={14} className="text-primary shrink-0 mt-0.5" />
        <div className="flex-1">
          <span className={open ? 'text-foreground font-medium' : ''}>{item.text}</span>
          {open && (
            <p className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed animate-fade-in">{item.detail}</p>
          )}
        </div>
        <ChevronRight size={10} className={`shrink-0 mt-1 text-muted-foreground/50 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </button>
    </li>
  );
};

const ExpandableTechItem: React.FC<{ tech: { name: string; type: string; desc: string; usage: string; detail: string } }> = ({ tech }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-lg border transition-all duration-200 ${open ? 'bg-primary/[0.03] border-primary/15' : 'bg-secondary/50 border-border/50'}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-3 text-left">
        <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded shrink-0">{tech.name}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">{tech.type}</span>
            <span className="text-[10px] text-muted-foreground">— {tech.desc}</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/70">{tech.usage}</span>
        </div>
        <ChevronRight size={10} className={`shrink-0 text-muted-foreground/50 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="px-3 pb-3 animate-fade-in">
          <p className="text-[11px] text-muted-foreground leading-relaxed ml-[52px]">{tech.detail}</p>
        </div>
      )}
    </div>
  );
};

export default Landing;
