import React from 'react';
import { useAuthStore } from '@/lib/auth-store';
import TerminalCard from '@/components/TerminalCard';
import AlgorithmPanel from '@/components/AlgorithmPanel';
import { FileText } from 'lucide-react';

const statusColors: Record<string, string> = {
  success: 'text-primary',
  error: 'text-destructive',
  warning: 'text-warning',
  info: 'text-info',
};

const LogsStep: React.FC = () => {
  const { logs, reset, learnMode } = useAuthStore();

  const successCount = logs.filter(l => l.status === 'success').length;
  const errorCount = logs.filter(l => l.status === 'error').length;
  const warningCount = logs.filter(l => l.status === 'warning').length;

  return (
    <div className="space-y-4">
      <TerminalCard title="audit_log.sh" icon={<FileText size={12} />} active>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono text-muted-foreground">
              <span className="text-primary">$</span> Authentication activity log ({logs.length} entries)
            </div>
            <button
              onClick={reset}
              className="text-xs font-mono text-destructive/70 hover:text-destructive underline"
            >
              Reset All
            </button>
          </div>

          {logs.length > 0 && (
            <div className="flex gap-3 text-[10px] font-mono">
              <span className="text-primary">✓ {successCount} success</span>
              <span className="text-destructive">✗ {errorCount} errors</span>
              <span className="text-warning">⚠ {warningCount} warnings</span>
            </div>
          )}

          <div className="max-h-80 overflow-y-auto space-y-1">
            {logs.length === 0 ? (
              <div className="text-xs font-mono text-muted-foreground py-4 text-center">No activity recorded yet.</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2 text-xs font-mono py-1 border-b border-border/20 last:border-0 animate-fade-in">
                  <span className="text-muted-foreground shrink-0">[{log.timestamp.toLocaleTimeString()}]</span>
                  <span className={`shrink-0 ${statusColors[log.status]}`}>[{log.status.toUpperCase()}]</span>
                  <span className="text-foreground/80">{log.event}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </TerminalCard>

      {learnMode && <AlgorithmPanel
        title="Security Audit Logging"
        description="Every authentication action is recorded in an immutable audit trail. Logs capture the event type, timestamp, associated user, and severity level — essential for forensics, compliance, and anomaly detection."
        steps={[
          {
            label: 'Event Capture',
            detail: 'Each user action (register, login, MFA, token generation) triggers a log entry with a precise timestamp.',
            deepDive: 'Events are captured at every decision point in the authentication pipeline:\n\n• Registration: "User alice registered with role admin"\n• Login success: "Password verified for alice"\n• Login failure: "Login failed for alice (attempt 2/3)"\n• Account lockout: "Account alice locked after 3 failed attempts"\n• OTP events: "OTP generated/verified/expired for alice"\n• Token events: "Token issued/expired for alice"\n\nEach entry includes a high-resolution timestamp (Date.now() → millisecond precision), enabling forensic timeline reconstruction.',
          },
          {
            label: 'Severity Classification',
            detail: 'Events are classified as SUCCESS, ERROR, WARNING, or INFO.',
            deepDive: 'The severity taxonomy follows security logging standards (OWASP, NIST SP 800-92):\n\n• SUCCESS (green): Valid completed actions — login verified, MFA passed, token issued\n• ERROR (red): Failed security operations — wrong password, invalid OTP, user not found\n• WARNING (yellow): Security-relevant anomalies — account lockout, token expiry, OTP timeout\n• INFO (blue): System operations — OTP generated, encryption demo executed\n\nSeverity enables filtering and alerting. Production systems trigger automated responses:\n• 3 ERRORs in 5 minutes from same IP → rate limit\n• WARNING (lockout) → notify security team\n• Unusual SUCCESS pattern (3am login from new country) → challenge with additional MFA',
          },
          {
            label: 'User Attribution',
            detail: 'Each log entry is linked to a username, enabling per-user activity tracking.',
            deepDive: 'Attribution ties every action to a specific identity:\n\n• Per-user timeline: Reconstruct exactly what alice did and when\n• Cross-user correlation: Detect credential stuffing (many usernames, same password pattern)\n• Session tracking: Link all actions within a session via the token\n\nIn production, additional attribution includes:\n• IP address and geolocation\n• User-Agent (browser/device)\n• Request fingerprint (API endpoint, parameters)\n• Session ID for grouping related actions',
          },
          {
            label: 'Immutable Trail',
            detail: 'Log entries are append-only. Once recorded, they cannot be modified or deleted.',
            deepDive: 'Immutability prevents attackers from covering their tracks:\n\n• Append-only: New entries are always added at the end. No update or delete operations exist.\n• In this demo: Logs are stored in a Zustand array that only supports push operations.\n• In production: Logs are written to tamper-proof storage:\n  - Write-Once-Read-Many (WORM) storage\n  - Blockchain-based logging (hash chain integrity)\n  - Centralized SIEM (Splunk, ELK) with write-only API keys\n  - AWS CloudTrail with S3 Object Lock\n\nIf an attacker gains access and modifies logs, the hash chain breaks, immediately revealing tampering.',
          },
          {
            label: 'Forensic Analysis',
            detail: 'Security teams review logs to detect brute-force attempts, unauthorized access patterns, and policy violations.',
            deepDive: 'Forensic analysis techniques applied to audit logs:\n\n• Brute-force detection: Multiple ERROR events for the same username in a short window\n• Credential stuffing: ERRORs across many usernames from the same IP\n• Privilege escalation: User accessing resources outside their RBAC permissions\n• Impossible travel: Login from New York, then London 30 minutes later\n• Session anomaly: Token used after the user explicitly logged out (token theft)\n\nAutomated SIEM rules trigger alerts when patterns match known attack signatures. Machine learning models can detect novel attack patterns by identifying statistical anomalies in login behavior.',
          },
        ]}
        deepDiveSections={[
          {
            heading: 'OWASP Logging Cheat Sheet — What to Log',
            text: 'OWASP recommends logging these authentication events:\n\n• All login attempts (success and failure)\n• Password changes and resets\n• MFA enrollment, verification, and failures\n• Account lockouts and unlocks\n• Session creation and destruction\n• Privilege changes (role updates)\n• Access to sensitive resources\n\nDo NOT log:\n• Passwords (even hashed ones in logs)\n• Full credit card numbers or SSNs\n• Session tokens (log only a truncated hash)\n• Personal data beyond what\'s necessary for attribution',
          },
          {
            heading: 'Log Integrity — Hash Chains',
            text: 'To detect log tampering, each entry can include a hash of the previous entry (like a blockchain):\n\nentry[0].hash = SHA-256(entry[0].data)\nentry[1].hash = SHA-256(entry[1].data + entry[0].hash)\nentry[n].hash = SHA-256(entry[n].data + entry[n-1].hash)\n\nIf any entry is modified, all subsequent hashes become invalid. This provides cryptographic proof of log integrity. The root hash can be periodically published to an external system (timestamping authority) for independent verification.',
          },
          {
            heading: 'SIEM & Real-Time Threat Detection',
            text: 'Security Information and Event Management (SIEM) systems aggregate logs from all services and apply correlation rules:\n\n• Splunk: Query-based analysis with SPL (Search Processing Language)\n• ELK Stack: Elasticsearch + Logstash + Kibana — open-source alternative\n• AWS CloudWatch: Cloud-native logging with metric alarms\n\nReal-time detection rules:\nIF count(login_failure WHERE username=$USER) > 5 IN last 10min\n  THEN alert("Brute force attempt on $USER")\n\nIF count(login_success WHERE ip=$IP AND country != user.usual_country) > 0\n  THEN alert("Suspicious login location for $USER")',
          },
        ]}
        codeExample={`// Structured audit log entry
interface AuditLogEntry {
  timestamp: Date;       // ISO 8601 with timezone
  event: string;         // Human-readable description
  username?: string;     // Attributed user (if applicable)
  status: 'success' | 'error' | 'warning' | 'info';
  ip?: string;           // Client IP address
  userAgent?: string;    // Browser/device
  sessionId?: string;    // For session correlation
  previousHash?: string; // Hash chain for integrity
}

// Append-only logging function
function auditLog(entry: Omit<AuditLogEntry, 'timestamp' | 'previousHash'>) {
  const log: AuditLogEntry = {
    ...entry,
    timestamp: new Date(),
    previousHash: getLastLogHash(), // hash chain
  };
  appendToImmutableStore(log); // write-only operation
  checkAlertRules(log);         // trigger SIEM rules
}`}
        securityNote="Never log sensitive data (passwords, tokens, PII) in audit logs. Use structured logging (JSON) with consistent field names for automated analysis. Store logs in tamper-proof, write-once storage with hash chain integrity verification."
        liveData={logs.length > 0 ? [
          { label: 'Total Events', value: `${logs.length}`, color: 'text-foreground' },
          { label: 'Success Rate', value: logs.length > 0 ? `${Math.round((successCount / logs.length) * 100)}%` : 'N/A', color: 'text-primary' },
          { label: 'Failures', value: `${errorCount} errors, ${warningCount} warnings`, color: errorCount > 0 ? 'text-destructive' : 'text-muted-foreground' },
        ] : undefined}
      />}
    </div>
  );
};

export default LogsStep;
