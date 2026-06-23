"use client";

import { useState } from 'react';
import { SetupStep } from './SetupStep';
import { DraftStep } from './DraftStep';
import { CompleteStep } from './CompleteStep';
import { TournamentStep } from './TournamentStep';

export function DraftBoard() {
  const [step, setStep] = useState<'setup' | 'draft' | 'complete' | 'tournament'>('setup');

  const handleStartDraft = () => {
    setStep('draft');
  };

  const handleCompleteDraft = () => {
    setStep('complete');
  };

  const handleStartTournament = () => {
    setStep('tournament');
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
        <CompleteStep onReset={handleReset} onStartTournament={handleStartTournament} />
      )}
      {step === 'tournament' && (
        <TournamentStep onReset={handleReset} />
      )}
    </div>
  );
}
