import React, { useState } from 'react';
import { GitFork, CheckCircle, Loader2, Clock, AlertCircle, ChevronDown } from 'lucide-react';
import { PipelineStage } from '../types';

interface ProcessingPipelineProps {
  stages: PipelineStage[];
  isScanning: boolean;
}

export const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({
  stages,
  isScanning,
}) => {
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  const completedCount = stages.filter((s) => s.status === 'completed').length;

  const toggleStage = (id: string) => {
    setSelectedStageId(selectedStageId === id ? null : id);
  };

  return (
    <div className="bg-[#0B0F16]/90 backdrop-blur-md rounded-lg hud-border p-4 sm:p-6 relative overflow-hidden w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h3 className="font-mono-data text-xs sm:text-sm font-semibold text-[#F4F7FB] uppercase tracking-wider mb-0.5">
            Processing Pipeline
          </h3>
          <p className="text-[#8A94A6] text-[10px] sm:text-xs font-mono-data">
            {isScanning
              ? 'Analyzing Pipeline: Executing heuristic filters...'
              : `Analysis Complete: ${completedCount}/${stages.length} Stages`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isScanning && (
            <span className="flex items-center gap-1.5 text-[11px] font-mono-data text-[#00daf3] animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Scanning
            </span>
          )}
          <GitFork className="w-4 h-4 text-[#8A94A6]" />
        </div>
      </div>

      {/* Pipeline Grid (2 columns on tablet/desktop, 1 column on small mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 lg:gap-3 mb-2">
        {stages.map((stage) => {
          const isSelected = selectedStageId === stage.id;
          const isDone = stage.status === 'completed';
          const isRunning = stage.status === 'running' || isScanning;

          return (
            <div
              key={stage.id}
              onClick={() => toggleStage(stage.id)}
              className={`p-2.5 sm:p-3 rounded bg-[#1a1b21] border transition-all cursor-pointer select-none active:scale-[0.99] ${
                isSelected
                  ? 'border-[#00daf3] bg-[#00daf3]/5'
                  : 'border-[#00daf3]/30 hover:border-[#00daf3]/60 hover:bg-[#1e1f25]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <span className="font-mono-data text-[10px] sm:text-xs text-[#8A94A6]/60 shrink-0">
                    {stage.number}
                  </span>
                  <span className="font-mono-data text-xs sm:text-sm text-[#e2e2e9] font-medium truncate">
                    {stage.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {isScanning ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#00daf3] animate-spin" />
                  ) : isDone ? (
                    <CheckCircle className="w-3.5 h-3.5 text-[#00E676]" />
                  ) : stage.status === 'error' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-[#FF3D00]" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-[#8A94A6]" />
                  )}
                  <ChevronDown
                    className={`w-3 h-3 text-[#8A94A6] transition-transform duration-200 ${
                      isSelected ? 'rotate-180 text-[#00daf3]' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Expandable Stage Details */}
              {isSelected && stage.details && (
                <div className="mt-2 pt-2 border-t border-[#202B3C] text-[11px] font-mono-data text-[#8A94A6] flex justify-between items-center animate-fade-in-up">
                  <span>{stage.details}</span>
                  {stage.duration && (
                    <span className="text-[#00daf3] shrink-0 ml-2">{stage.duration}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
