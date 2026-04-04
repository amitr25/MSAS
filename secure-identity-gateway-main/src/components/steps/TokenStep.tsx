import React, { useState, useEffect } from 'react';
import { generateToken } from '@/lib/crypto';
import { useAuthStore } from '@/lib/auth-store';
import TerminalCard from '@/components/TerminalCard';
import AlgorithmPanel from '@/components/AlgorithmPanel';
import { Key } from 'lucide-react';

const TOKEN_LIFETIME = 120;

const TokenStep: React.FC = () => {
  const { pendingOTP, getUser, currentToken, setToken, addLog, setActiveStep, learnMode } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState(0);
  const user = pendingOTP ? getUser(pendingOTP.username) : undefined;

  const handleGenerate = () => {
    if (!user) return;
    const token = generateToken();
    const now = Date.now();
    const authToken = {
      token,
      username: user.username,
      role: user.role,
      issuedAt: now,
      expiresAt: now + TOKEN_LIFETIME * 1000,
    };
    setToken(authToken);
    addLog({ event: `Auth token generated for "${user.username}" (expires in ${TOKEN_LIFETIME}s)`, username: user.username, status: 'success' });
  };

  useEffect(() => {
    if (!currentToken) return;
    const interval = setInterval(() => {
      const left = Math.max(0, Math.floor((currentToken.expiresAt - Date.now()) / 1000));
      setTimeLeft(left);
      if (left === 0) {
        addLog({ event: `Token expired for "${currentToken.username}"`, username: currentToken.username, status: 'warning' });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentToken]);

  const isExpired = currentToken ? Date.now() > currentToken.expiresAt : false;

  return (
    <div className="space-y-4">
      <TerminalCard title="token_mgmt.sh" icon={<Key size={12} />} active>
        <div className="space-y-4">
          <div className="text-xs font-mono text-muted-foreground">
            <span className="text-primary">$</span> Token-based session management with expiration
          </div>

          {user ? (
            <>
              {!currentToken && (
                <button
                  onClick={handleGenerate}
                  className="w-full py-2 rounded bg-primary text-primary-foreground font-mono text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Generate Auth Token
                </button>
              )}

              {currentToken && (
                <div className="space-y-3 animate-fade-in">
                  <div className="bg-secondary/80 rounded p-3 border border-border/50 text-xs font-mono space-y-2">
                    <div><span className="text-muted-foreground">Token: </span><span className="text-primary break-all">{currentToken.token}</span></div>
                    <div><span className="text-muted-foreground">User: </span><span className="text-foreground">{currentToken.username}</span></div>
                    <div><span className="text-muted-foreground">Role: </span><span className="text-accent">{currentToken.role.toUpperCase()}</span></div>
                    <div><span className="text-muted-foreground">Issued: </span><span className="text-foreground">{new Date(currentToken.issuedAt).toLocaleTimeString()}</span></div>
                    <div>
                      <span className="text-muted-foreground">Status: </span>
                      <span className={isExpired ? 'text-destructive' : 'text-primary'}>
                        {isExpired ? 'EXPIRED' : `VALID (${timeLeft}s remaining)`}
                      </span>
                    </div>
                  </div>

                  {!isExpired && (
                    <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-1000"
                        style={{ width: `${(timeLeft / TOKEN_LIFETIME) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              <button onClick={() => setActiveStep(6)} className="text-xs font-mono text-primary/70 hover:text-primary underline">
                → View Security Logs
              </button>
            </>
          ) : (
            <div className="text-xs font-mono text-muted-foreground">Complete authentication first.</div>
          )}
        </div>
      </TerminalCard>

      {learnMode && <AlgorithmPanel
        title="Token-Based Session Management"
        description="After full authentication (password + MFA + RBAC), a session token is issued. This token represents the user's authenticated session and must accompany every subsequent request. Tokens have a fixed TTL to limit exposure if intercepted."
        steps={[
          {
            label: 'Authentication Complete',
            detail: 'User has passed password verification, MFA, and RBAC evaluation.',
            deepDive: 'Token issuance is the FINAL step in the authentication chain. It only occurs after ALL previous checks pass:\n\n1. ✓ Password hash match\n2. ✓ MFA OTP verified\n3. ✓ RBAC role confirmed\n\nThe token encapsulates the result of all these checks into a single portable credential. Subsequent requests only need to present the token — they don\'t need to repeat the entire authentication process.',
          },
          {
            label: 'Token Generation (256-bit CSPRNG)',
            detail: 'A 256-bit (32 byte) token is generated using crypto.getRandomValues().',
            deepDive: 'The token is 32 random bytes (256 bits) generated by CSPRNG, represented as 64 hexadecimal characters.\n\nEntropy analysis:\n• 2²⁵⁶ possible tokens ≈ 1.16 × 10⁷⁷ values\n• For comparison, there are ~10⁸⁰ atoms in the observable universe\n• At 10 billion guesses/second, exhausting the space takes ~3.7 × 10⁵⁹ years\n• The probability of guessing a valid token is essentially zero\n\nThis level of entropy ensures tokens cannot be predicted or brute-forced, even by nation-state adversaries.',
            highlight: !!currentToken,
          },
          {
            label: 'Metadata Binding',
            detail: "The token is bound to the user's identity (username, role) and timestamped.",
            deepDive: 'The token is stored with associated metadata:\n\n{\n  token: "a3f8c2e1b4d7...9f0e2c",\n  username: "alice",\n  role: "admin",\n  issuedAt: 1710000000000,\n  expiresAt: 1710000120000\n}\n\nThis binding ensures:\n• The token is tied to a specific user (prevents token swapping)\n• The role is captured at issuance time (changes during the session are reflected at next token refresh)\n• Timestamps enable TTL enforcement and audit trails',
          },
          {
            label: 'TTL Enforcement',
            detail: `Token expires after ${TOKEN_LIFETIME} seconds. Expired tokens are rejected.`,
            deepDive: `The Time-To-Live (TTL) is a critical security control:\n\n• Short TTL (${TOKEN_LIFETIME}s in this demo): Forces frequent re-authentication. Good for security, bad for UX.\n• Long TTL (24h): Better UX but longer exposure window.\n• Production approach: Short-lived access tokens (15min) + long-lived refresh tokens (7 days).\n\nThe refresh token flow:\n1. Access token expires after 15 minutes\n2. Client sends refresh token to get a new access token\n3. Refresh token is rotated (old one invalidated)\n4. If refresh token is stolen, it can only be used once\n\nThis balances security with user experience.`,
            highlight: isExpired,
          },
          {
            label: 'Revocation & Replay Prevention',
            detail: 'Short-lived tokens limit the replay attack window. Tokens can be revoked on logout.',
            deepDive: 'Token security mechanisms:\n\n• Revocation: On logout, the token is deleted from the server store. Any request with the old token is rejected.\n• Replay prevention: If a token is intercepted, it can only be used within its TTL window. Short TTLs minimize this risk.\n• Token rotation: Issue a new token periodically and invalidate the old one. If the old token is used after rotation, it indicates theft.\n• Binding to client: Production systems bind tokens to IP address, User-Agent, or device fingerprint. Token usage from a different context triggers re-authentication.',
          },
        ]}
        deepDiveSections={[
          {
            heading: 'Opaque Tokens vs JWT (JSON Web Tokens)',
            text: 'This demo uses opaque tokens — random strings that require server-side lookup.\n\nJWTs are self-contained tokens with a different architecture:\n• Header: {"alg": "RS256", "typ": "JWT"}\n• Payload: {"sub": "alice", "role": "admin", "exp": 1710000120}\n• Signature: HMAC-SHA256(header + payload, secret)\n\nJWT advantages: Stateless (no server-side storage), scalable across microservices.\nJWT disadvantages: Cannot be revoked (until expiry), larger size, payload is base64-encoded (NOT encrypted — anyone can read it).\n\nOpaque tokens are simpler and revocable. JWTs are better for distributed systems.',
          },
          {
            heading: 'Token Storage — Where to Keep Tokens Client-Side',
            text: '• localStorage: Persistent, accessible via JavaScript. Vulnerable to XSS attacks (malicious scripts can steal the token).\n• sessionStorage: Same as localStorage but cleared when the tab closes. Still vulnerable to XSS.\n• HttpOnly Cookie: NOT accessible via JavaScript. Immune to XSS. Vulnerable to CSRF (mitigated with SameSite attribute).\n• In-memory (JavaScript variable): Most secure against XSS, but lost on page refresh.\n\nBest practice: HttpOnly, Secure, SameSite=Strict cookie for the token. This is immune to XSS and CSRF when configured correctly.',
          },
          {
            heading: 'Session Fixation & Token Hijacking',
            text: '• Session Fixation: Attacker sets the session token BEFORE authentication, then waits for the victim to log in with that token. Defense: Always generate a NEW token after authentication.\n• Token Hijacking: Attacker intercepts a valid token (via network sniffing, XSS, or malware). Defense: HTTPS (TLS), HttpOnly cookies, short TTLs, and token binding to client fingerprint.\n• Token Prediction: Attacker guesses valid tokens. Defense: 256-bit CSPRNG makes prediction infeasible (2²⁵⁶ possible values).',
          },
        ]}
        codeExample={`// Token generation with CSPRNG
function generateToken(): string {
  const bytes = new Uint8Array(32); // 256 bits
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}
// → "a3f8c2e1b4d7...9f0e2c" (64 hex chars = 256 bits)

// Token validation middleware (server-side)
function validateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  const session = tokenStore.get(token);

  if (!session) return res.status(401).json({ error: 'Invalid token' });
  if (Date.now() > session.expiresAt) {
    tokenStore.delete(token);
    return res.status(401).json({ error: 'Token expired' });
  }

  req.user = { username: session.username, role: session.role };
  next();
}`}
        securityNote="In production, use JWTs (JSON Web Tokens) with HMAC-SHA256 or RSA-SHA256 signatures for stateless verification across microservices. Store tokens in HttpOnly cookies (not localStorage) to prevent XSS theft. Never store sensitive data in the JWT payload — it's base64-encoded, not encrypted."
        liveData={currentToken ? [
          { label: 'Token (hex)', value: currentToken.token.slice(0, 40) + '...', color: 'text-primary' },
          { label: 'TTL', value: `${timeLeft}s / ${TOKEN_LIFETIME}s`, color: isExpired ? 'text-destructive' : 'text-muted-foreground' },
          { label: 'Entropy', value: '256 bits (2²⁵⁶ ≈ 10⁷⁷ possible values)', color: 'text-muted-foreground' },
          { label: 'Status', value: isExpired ? 'EXPIRED — re-authentication required' : 'VALID — session active', color: isExpired ? 'text-destructive' : 'text-primary' },
        ] : undefined}
      />}
    </div>
  );
};

export default TokenStep;
