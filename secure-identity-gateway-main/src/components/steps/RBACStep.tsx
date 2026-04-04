import React from 'react';
import { useAuthStore } from '@/lib/auth-store';
import TerminalCard from '@/components/TerminalCard';
import AlgorithmPanel from '@/components/AlgorithmPanel';
import { Users, ShieldCheck, ShieldX } from 'lucide-react';

const resources = [
  { name: 'View Dashboard', admin: true, user: true },
  { name: 'View Reports', admin: true, user: true },
  { name: 'Edit User Profiles', admin: true, user: false },
  { name: 'Manage Users', admin: true, user: false },
  { name: 'System Configuration', admin: true, user: false },
  { name: 'View Audit Logs', admin: true, user: false },
];

const RBACStep: React.FC = () => {
  const { pendingOTP, getUser, setActiveStep, learnMode } = useAuthStore();
  const user = pendingOTP ? getUser(pendingOTP.username) : undefined;

  const accessGranted = user ? resources.filter(r => user.role === 'admin' ? r.admin : r.user).length : 0;
  const accessDenied = user ? resources.filter(r => !(user.role === 'admin' ? r.admin : r.user)).length : 0;

  return (
    <div className="space-y-4">
      <TerminalCard title="rbac_policy.sh" icon={<Users size={12} />} active>
        <div className="space-y-4">
          <div className="text-xs font-mono text-muted-foreground">
            <span className="text-primary">$</span> Role-Based Access Control — principle of least privilege
          </div>

          {user ? (
            <>
              <div className="text-xs font-mono">
                Current user: <span className="text-primary">{user.username}</span> — Role: <span className="text-accent">{user.role.toUpperCase()}</span>
              </div>

              <div className="rounded border border-border/50 overflow-hidden">
                <div className="grid grid-cols-3 gap-0 text-xs font-mono bg-secondary/50 px-3 py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Resource</span>
                  <span className="text-center text-muted-foreground">Admin</span>
                  <span className="text-center text-muted-foreground">User</span>
                </div>
                {resources.map(r => {
                  const hasAccess = user.role === 'admin' ? r.admin : r.user;
                  return (
                    <div key={r.name} className={`grid grid-cols-3 gap-0 px-3 py-2 text-xs font-mono border-b border-border/30 last:border-0 ${hasAccess ? '' : 'opacity-50'}`}>
                      <span className={hasAccess ? 'text-foreground' : 'text-muted-foreground'}>{r.name}</span>
                      <span className="text-center">{r.admin ? <ShieldCheck size={14} className="inline text-primary" /> : <ShieldX size={14} className="inline text-destructive" />}</span>
                      <span className="text-center">{r.user ? <ShieldCheck size={14} className="inline text-primary" /> : <ShieldX size={14} className="inline text-destructive" />}</span>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setActiveStep(4)} className="text-xs font-mono text-primary/70 hover:text-primary underline">
                → Proceed to Encryption Demo
              </button>
            </>
          ) : (
            <div className="text-xs font-mono text-muted-foreground">Complete authentication first.</div>
          )}
        </div>
      </TerminalCard>

      {learnMode && <AlgorithmPanel
        title="Role-Based Access Control (RBAC)"
        description="RBAC restricts system access based on assigned roles rather than individual identities. Each role maps to a set of permissions, and access decisions evaluate: does the user's role include the requested permission?"
        steps={[
          {
            label: 'User Authenticated',
            detail: "After login + MFA, the user's identity and role are confirmed.",
            deepDive: 'Authentication answers "who are you?" while authorization answers "what can you do?" RBAC operates in the authorization phase — it only runs after identity is fully confirmed (password + MFA). The user\'s role is retrieved from the database, not from client-side storage, to prevent privilege escalation.',
          },
          {
            label: 'Role Assignment',
            detail: 'During registration, each user is assigned a role (Admin or User). Roles define capability boundaries.',
            deepDive: 'Roles are assigned at registration and stored server-side. Important security principles:\n\n• Roles should be stored in a SEPARATE table (not on the user profile) to prevent direct manipulation\n• Role changes should require admin privileges and be audit-logged\n• Default role should always be the least privileged (e.g., "user")\n• Never trust client-side role claims — always verify against the database',
            highlight: !!user,
          },
          {
            label: 'Permission Mapping',
            detail: 'Each role maps to a set of allowed resources. Admin has full access; User has restricted access.',
            deepDive: 'The permission matrix is the "policy" governing access:\n\nAdmin → [Dashboard, Reports, UserMgmt, Config, Logs, Profiles]\nUser  → [Dashboard, Reports]\n\nThis can be represented as a hash map for O(1) lookup:\npermissions["admin"].includes("config") → true\npermissions["user"].includes("config") → false\n\nIn production, this matrix is stored in a database and cached, allowing runtime policy updates without code deployment.',
          },
          {
            label: 'Access Evaluation',
            detail: 'For each resource request: check if role.permissions.includes(resource) → allow or deny.',
            deepDive: 'The access evaluation function runs on EVERY protected request, not just at login:\n\nfunction checkAccess(user, resource) {\n  const perms = permissionMatrix[user.role];\n  return perms.includes(resource);\n}\n\nThis is enforced server-side via middleware/guards. Client-side checks are for UI convenience only (e.g., hiding buttons) — the server is the authority. If a client sends a request to a forbidden resource, the server returns 403 Forbidden.',
            highlight: !!user,
          },
          {
            label: 'Principle of Least Privilege',
            detail: "Users receive the minimum permissions necessary. This limits blast radius if an account is compromised.",
            deepDive: 'Least privilege means every user, program, and process should operate with the bare minimum permissions needed:\n\n• If a "user" account is compromised, the attacker can only view Dashboard and Reports — not manage users or change configs\n• Admin accounts should require additional MFA and have shorter session timeouts\n• Temporary elevated access (sudo-like) should expire automatically\n\nBlast radius comparison:\n• User compromised: 2 resources exposed\n• Admin compromised: 6 resources exposed (3x more damage)',
          },
        ]}
        deepDiveSections={[
          {
            heading: 'RBAC vs ABAC vs ACL — Authorization Models',
            text: '• RBAC (Role-Based): Access based on roles. Simple, widely used. Limitation: roles can become too coarse-grained.\n• ABAC (Attribute-Based): Access based on attributes (user department, time of day, IP address, data sensitivity). More flexible but complex. Example: "Allow if user.department === \'finance\' AND time.isBusinessHours AND data.sensitivity < 3"\n• ACL (Access Control Lists): Per-resource lists of who can do what. Fine-grained but doesn\'t scale well.\n\nRBAC is the most common in web applications. ABAC is used in enterprise and cloud environments (AWS IAM policies are ABAC).',
          },
          {
            heading: 'Separation of Duties & Role Hierarchy',
            text: 'Separation of duties prevents a single role from performing sensitive end-to-end operations:\n\n• Creating a user (Admin) + Approving the creation (SuperAdmin)\n• Initiating a payment (Finance) + Approving the payment (Manager)\n\nRole hierarchy allows inheritance: SuperAdmin inherits all Admin permissions, Admin inherits all User permissions. This reduces redundancy in permission definitions.',
          },
          {
            heading: 'Common RBAC Vulnerabilities',
            text: '• Privilege escalation: Storing roles in localStorage or cookies allows client-side manipulation (change "user" to "admin")\n• Insecure Direct Object References (IDOR): Accessing /api/users/123 without checking if the requester has permission to view user 123\n• Missing function-level access control: API endpoint exists but doesn\'t check roles — anyone with a valid token can access it\n• Role explosion: Too many fine-grained roles become unmanageable — use ABAC for complex policies instead',
          },
        ]}
        codeExample={`// RBAC permission check (server-side middleware)
const permissionMatrix: Record<string, string[]> = {
  admin: ['dashboard', 'reports', 'users', 'config', 'logs', 'profiles'],
  user:  ['dashboard', 'reports'],
};

function rbacMiddleware(requiredResource: string) {
  return (req, res, next) => {
    const userRole = req.user.role; // from verified JWT, NOT client input
    if (!permissionMatrix[userRole]?.includes(requiredResource)) {
      return res.status(403).json({ error: 'Forbidden — insufficient permissions' });
    }
    next();
  };
}

// Usage: app.get('/api/config', rbacMiddleware('config'), configHandler);`}
        securityNote="Never store roles client-side (localStorage, cookies) for authorization decisions — these can be trivially manipulated. Always validate roles server-side from the database or a signed JWT. Client-side role checks are for UI convenience only."
        liveData={user ? [
          { label: 'Role', value: user.role.toUpperCase(), color: 'text-accent' },
          { label: 'Granted', value: `${accessGranted} / ${resources.length} resources`, color: 'text-primary' },
          { label: 'Denied', value: `${accessDenied} / ${resources.length} resources`, color: 'text-destructive' },
        ] : undefined}
      />}
    </div>
  );
};

export default RBACStep;
