import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronRight, BookOpen, Info, AlertTriangle, Code2 } from 'lucide-react';

interface DeepDiveItem {
  heading: string;
  text: string;
}

interface AlgorithmStep {
  label: string;
  detail: string;
  deepDive?: string;
  highlight?: boolean;
}

interface AlgorithmPanelProps {
  title: string;
  description: string;
  steps: AlgorithmStep[];
  liveData?: { label: string; value: string; color?: string }[];
  icon?: React.ReactNode;
  codeExample?: string;
  securityNote?: string;
  deepDiveSections?: DeepDiveItem[];
}

const AlgorithmPanel: React.FC<AlgorithmPanelProps> = ({
  title, description, steps, liveData, icon, codeExample, securityNote, deepDiveSections,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [showCode, setShowCode] = useState(false);

  const toggleStep = (i: number) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const toggleSection = (i: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-primary/15 bg-primary/[0.02] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary/[0.04] transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-primary" />
          <span className="text-xs font-display font-semibold text-foreground">{title}</span>
          <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">How it works</span>
        </div>
        {expanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in">
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>

          {/* Algorithm Steps — each clickable for deep-dive */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-wider">
              Algorithm Steps <span className="text-primary/60">(click to expand)</span>
            </div>
            {steps.map((step, i) => {
              const isOpen = expandedSteps.has(i);
              return (
                <div
                  key={i}
                  className={`rounded-lg text-xs transition-all duration-200 ${
                    step.highlight
                      ? 'bg-primary/10 border border-primary/20'
                      : isOpen
                      ? 'bg-primary/5 border border-primary/15'
                      : 'bg-secondary/50 border border-transparent'
                  }`}
                >
                  <button
                    onClick={() => step.deepDive && toggleStep(i)}
                    className={`w-full flex items-start gap-2.5 p-2 text-left ${step.deepDive ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <span className="font-mono font-semibold text-foreground">{step.label}</span>
                      <p className="text-muted-foreground text-[11px] mt-0.5">{step.detail}</p>
                    </div>
                    {step.deepDive && (
                      <ChevronRight size={12} className={`text-muted-foreground shrink-0 mt-1 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                    )}
                  </button>
                  {isOpen && step.deepDive && (
                    <div className="px-2.5 pb-2.5 pl-10 animate-fade-in">
                      <div className="bg-card/80 rounded-md border border-border/40 p-3">
                        <p className="text-[11px] text-foreground/80 leading-relaxed whitespace-pre-line">{step.deepDive}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Deep Dive Sections (advanced internals) */}
          {deepDiveSections && deepDiveSections.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-wider flex items-center gap-1">
                <Code2 size={10} /> Deep Dive — Internal Mechanics <span className="text-primary/60">(click to expand)</span>
              </div>
              {deepDiveSections.map((section, i) => {
                const isOpen = expandedSections.has(i);
                return (
                  <div
                    key={i}
                    className={`rounded-lg border transition-all duration-200 ${
                      isOpen ? 'bg-primary/[0.03] border-primary/15' : 'border-border/40 hover:border-border'
                    }`}
                  >
                    <button
                      onClick={() => toggleSection(i)}
                      className="w-full text-left p-2.5 flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-semibold text-foreground">{section.heading}</span>
                      <ChevronRight size={12} className={`text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-2.5 pb-2.5 animate-fade-in">
                        <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-line">{section.text}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Code Example */}
          {codeExample && (
            <div>
              <button
                onClick={() => setShowCode(!showCode)}
                className="flex items-center gap-1.5 text-[10px] font-mono text-primary uppercase tracking-wider font-semibold mb-1.5 hover:text-primary/80 transition-colors"
              >
                <Code2 size={10} />
                Implementation Example
                <ChevronRight size={10} className={`transition-transform duration-200 ${showCode ? 'rotate-90' : ''}`} />
              </button>
              {showCode && (
                <pre className="bg-secondary/80 rounded-lg p-3 border border-border/50 text-[11px] font-mono text-foreground overflow-x-auto whitespace-pre-wrap leading-relaxed animate-fade-in">
                  {codeExample}
                </pre>
              )}
            </div>
          )}

          {/* Security Note */}
          {securityNote && (
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] font-mono text-warning font-semibold mb-0.5">Security Consideration</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{securityNote}</p>
              </div>
            </div>
          )}

          {/* Live Data */}
          {liveData && liveData.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-wider flex items-center gap-1">
                <Info size={10} /> Live Output
              </div>
              <div className="bg-secondary/80 rounded-lg p-3 border border-border/50 space-y-1.5">
                {liveData.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs font-mono">
                    <span className="text-muted-foreground shrink-0">{d.label}:</span>
                    <span className={`break-all ${d.color || 'text-primary'}`}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlgorithmPanel;
