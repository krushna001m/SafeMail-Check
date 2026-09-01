import React from 'react';
import { Cpu, Brain, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles } from 'lucide-react';
import { ContributingFactor } from '../types';

interface ExplainableAiCardProps {
  factors: ContributingFactor[];
  verdict: string;
  confidence: number;
  modelName?: string;
}

export const ExplainableAiCard: React.FC<ExplainableAiCardProps> = ({
  factors,
  verdict,
  confidence,
  modelName = 'TraceMail Transformer-v4.2 (Neural Classifier)'
}) => {
  const getWeightStyle = (weight: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (weight) {
      case 'HIGH':
        return {
          bar: 'bg-[#FF3D00]',
          badge: 'bg-[#FF3D00]/15 text-[#ffb4ab] border-[#FF3D00]/40'
        };
      case 'MEDIUM':
        return {
          bar: 'bg-[#FFC107]',
          badge: 'bg-[#FFC107]/15 text-[#ffeac0] border-[#FFC107]/40'
        };
      case 'LOW':
      default:
        return {
          bar: 'bg-[#00daf3]',
          badge: 'bg-[#00daf3]/15 text-[#00daf3] border-[#00daf3]/40'
        };
    }
  };

  return (
    <div className="bg-[#0B0F16]/95 backdrop-blur-md rounded-lg hud-border p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#202B3C] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#00daf3]/10 border border-[#00daf3]/30 flex items-center justify-center text-[#00daf3]">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-headline text-base font-bold text-[#F4F7FB]">
              AI / ML Model Explainability
            </h3>
            <p className="text-[10px] font-mono-data text-[#8A94A6]">
              {modelName} • {confidence}% Confidence Score
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono-data px-2.5 py-0.5 rounded bg-[#00daf3]/10 text-[#00daf3] border border-[#00daf3]/30 font-bold uppercase">
          XAI SHAP-FACTORS
        </span>
      </div>

      {/* Intro text */}
      <p className="text-xs text-[#8A94A6] font-mono-data leading-relaxed">
        TraceMail explainable heuristics calculate the relative feature weight of each cryptographic, semantic, and network indicator to establish automated verdict attribution.
      </p>

      {/* Factors List */}
      <div className="space-y-3 font-mono-data">
        {factors.map((factor) => {
          const style = getWeightStyle(factor.weight);
          return (
            <div key={factor.id} className="bg-[#1a1b21] p-3.5 rounded border border-[#202B3C] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F4F7FB] truncate max-w-[70%]">
                  {factor.factor}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] px-2 py-0.5 rounded border font-bold ${style.badge}`}>
                    {factor.weight} IMPACT
                  </span>
                  <span className="text-xs font-bold text-[#00daf3]">
                    +{factor.contributionPercent}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#090B10] h-2 rounded-full overflow-hidden border border-[#202B3C]">
                <div
                  className={`h-full ${style.bar} transition-all duration-500`}
                  style={{ width: `${factor.contributionPercent * 2}%` }}
                />
              </div>

              {/* Explanation Note */}
              <p className="text-[11px] text-[#8A94A6] leading-relaxed">
                {factor.explanation}
              </p>
            </div>
          );
        })}
      </div>

      {/* AI Assistant Quick Trigger */}
      <button
        onClick={() => {
          const triggerBtn = document.getElementById('ai-security-assistant-trigger');
          if (triggerBtn) {
            triggerBtn.click();
          }
        }}
        className="w-full py-2.5 px-3 rounded bg-[#00daf3]/10 hover:bg-[#00daf3]/20 border border-[#00daf3]/30 hover:border-[#00daf3] text-[#00daf3] text-xs font-mono-data font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Ask AI Assistant to Explain Model Feature Weights</span>
      </button>
    </div>
  );
};
