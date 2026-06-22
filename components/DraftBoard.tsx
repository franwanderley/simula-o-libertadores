"use client";

import { useState } from 'react';
import { SetupStep } from './SetupStep';
import { DraftStep } from './DraftStep';
import { CompleteStep } from './CompleteStep';

export function DraftBoard() {
  const [step, setStep] = useState<'setup' | 'draft' | 'complete'>('setup');

  const handleStartDraft = () => {
    setStep('draft');
  };

  const handleCompleteDraft = () => {
    setStep('complete');
  };

  const handleReset = () => {
    setStep('setup');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {step === 'setup' && (
        <SetupStep onStartDraft={handleStartDraft} />
      )}
      {step === 'draft' && (
        <DraftStep onReset={handleReset} onCompleteDraft={handleCompleteDraft} />
      )}
      {step === 'complete' && (
        <CompleteStep onReset={handleReset} />
      )}
    </div>
  );
}
