import React from 'react';
import { useAuthStore } from '@/lib/auth-store';
import TerminalCard from '@/components/TerminalCard';
import { FileText } from 'lucide-react';

const statusColors: Record<string, string> = {
  success: 'text-primary',
  error: 'text-destructive',
  warning: 'text-warning',
  info: 'text-info',
};

const LogsStep: React.FC = () => {
  const { logs, reset } = useAuthStore();

  return (
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

        <div className="max-h-80 overflow-y-auto space-y-1">
          {logs.length === 0 ? (
            <div className="text-xs font-mono text-muted-foreground py-4 text-center">No activity recorded yet.</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-xs font-mono py-1 border-b border-border/20 last:border-0 animate-fade-in">
                <span className="text-muted-foreground shrink-0">
                  [{log.timestamp.toLocaleTimeString()}]
                </span>
                <span className={`shrink-0 ${statusColors[log.status]}`}>
                  [{log.status.toUpperCase()}]
                </span>
                <span className="text-foreground/80">{log.event}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </TerminalCard>
  );
};

export default LogsStep;
