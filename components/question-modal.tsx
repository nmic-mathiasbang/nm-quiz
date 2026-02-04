"use client";

import { ActiveQuestion, Team } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Props for the QuestionModal component
interface QuestionModalProps {
  question: ActiveQuestion | null;
  teams: Team[];
  showAnswer: boolean;
  isHost: boolean;
  onRevealAnswer: () => void;
  onAwardPoints: (teamId: string, points: number) => void;
  onResetBuzzer: () => void;
  onClose: (markAsUsed: boolean) => void;  // Updated to pass whether to mark question as used
}

// Full-screen modal that displays the current question
export function QuestionModal({
  question,
  teams,
  showAnswer,
  isHost,
  onRevealAnswer,
  onAwardPoints,
  onResetBuzzer,
  onClose,
}: QuestionModalProps) {
  if (!question) return null;

  // Find the team that buzzed in
  const buzzedTeam = question.buzzedTeam 
    ? teams.find(t => t.id === question.buzzedTeam?.teamId)
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header with value and close button */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="w-12" /> {/* Spacer for centering */}
        <h2 className="text-4xl md:text-5xl font-bold text-black">
          ${question.value}
        </h2>
        {isHost && (
          <button
            onClick={() => onClose(false)}  // Close without marking as used
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            title="Close without marking as used"
          >
            <X className="w-8 h-8 text-gray-500" />
          </button>
        )}
        {!isHost && <div className="w-12" />}
      </div>

      {/* Main content area - centered question */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Question text - large and centered */}
        <p className="text-3xl md:text-5xl lg:text-6xl text-black text-center leading-relaxed max-w-5xl">
          {question.question}
        </p>

        {/* Buzzed team indicator */}
        {question.buzzedTeam && (
          <div className="mt-12 bg-red-100 border-4 border-red-500 rounded-2xl px-12 py-6 text-center animate-pulse">
            <p className="text-2xl md:text-3xl font-bold text-red-700">
              🔔 {question.buzzedTeam.teamName} buzzed in!
            </p>
          </div>
        )}

        {/* Answer section */}
        {showAnswer && (
          <div className="mt-12 bg-green-50 border-4 border-green-500 rounded-2xl px-12 py-6 text-center">
            <p className="text-lg text-green-600 mb-2">Answer:</p>
            <p className="text-3xl md:text-4xl font-bold text-green-800">{question.answer}</p>
          </div>
        )}
      </div>

      {/* Host controls - bottom of screen */}
      {isHost && (
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Reveal answer button */}
            {!showAnswer && (
              <Button
                onClick={onRevealAnswer}
                className="w-full h-14 text-xl bg-gray-900 text-white hover:bg-gray-800"
              >
                Reveal Answer
              </Button>
            )}

            {/* Scoring controls (when a team has buzzed) */}
            {buzzedTeam && (
              <div className="flex gap-3">
                <Button
                  onClick={() => onAwardPoints(buzzedTeam.id, question.value)}
                  className="flex-1 h-14 text-xl bg-green-600 text-white hover:bg-green-700"
                >
                  Correct (+${question.value})
                </Button>
                <Button
                  onClick={() => onAwardPoints(buzzedTeam.id, -question.value)}
                  variant="destructive"
                  className="flex-1 h-14 text-xl"
                >
                  Wrong (-${question.value})
                </Button>
              </div>
            )}

            {/* Reset buzzer button */}
            {question.buzzerLocked && (
              <Button
                onClick={onResetBuzzer}
                variant="outline"
                className="w-full h-12 text-lg border-gray-300 text-black hover:bg-gray-100"
              >
                Reset Buzzer (Let Another Team Try)
              </Button>
            )}

            {/* Close and mark as done - only if answer was revealed */}
            {showAnswer && (
              <Button
                onClick={() => onClose(true)}  // Close and mark as used
                className="w-full h-12 text-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Done - Remove from Board
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
