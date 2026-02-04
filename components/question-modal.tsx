"use client";

import { ActiveQuestion, Team } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Props for the QuestionModal component
interface QuestionModalProps {
  question: ActiveQuestion | null;
  teams: Team[];
  showAnswer: boolean;
  isHost: boolean;
  onRevealAnswer: () => void;
  onAwardPoints: (teamId: string, points: number) => void;
  onResetBuzzer: () => void;
  onClose: () => void;
}

// Modal that displays the current question
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

  const buzzedTeam = question.buzzedTeam 
    ? teams.find(t => t.id === question.buzzedTeam?.teamId)
    : null;

  return (
    <Dialog open={!!question} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-black">
            ${question.value}
          </DialogTitle>
        </DialogHeader>

        {/* Question text */}
        <div className="py-8 text-center">
          <p className="text-xl md:text-2xl text-black leading-relaxed">
            {question.question}
          </p>
        </div>

        {/* Buzzed team indicator */}
        {question.buzzedTeam && (
          <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 text-center">
            <p className="text-lg font-bold text-red-700">
              🔔 {question.buzzedTeam.teamName} buzzed in!
            </p>
          </div>
        )}

        {/* Answer section */}
        {showAnswer && (
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Answer:</p>
            <p className="text-xl font-bold text-black">{question.answer}</p>
          </div>
        )}

        {/* Host controls */}
        {isHost && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            {/* Reveal answer button */}
            {!showAnswer && (
              <Button
                onClick={onRevealAnswer}
                className="w-full bg-gray-900 text-white hover:bg-gray-800"
              >
                Reveal Answer
              </Button>
            )}

            {/* Scoring controls (when a team has buzzed) */}
            {buzzedTeam && (
              <div className="flex gap-2">
                <Button
                  onClick={() => onAwardPoints(buzzedTeam.id, question.value)}
                  className="flex-1 bg-green-600 text-white hover:bg-green-700"
                >
                  Correct (+${question.value})
                </Button>
                <Button
                  onClick={() => onAwardPoints(buzzedTeam.id, -question.value)}
                  variant="destructive"
                  className="flex-1"
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
                className="w-full border-gray-300 text-black hover:bg-gray-100"
              >
                Reset Buzzer (Let Another Team Try)
              </Button>
            )}

            {/* Close question button */}
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-gray-300 text-black hover:bg-gray-100"
            >
              Close Question
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
