import React from 'react';

interface TerminalCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  active?: boolean;
}

const TerminalCard: React.FC<TerminalCardProps> = ({ title, children, icon, active }) => {
  return (
    <div className={`rounded-lg border bg-card overflow-hidden transition-all duration-300 ${
      active ? 'border-glow' : 'border-border/50'
    }`}>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-secondary/50">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-warning/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary/70" />
        </div>
        <div className="flex items-center gap-2 ml-2 text-xs font-mono text-muted-foreground">
          {icon}
          <span>{title}</span>
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default TerminalCard;
