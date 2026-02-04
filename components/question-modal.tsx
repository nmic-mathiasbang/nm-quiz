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
  onClose: (markAsUsed: boolean) => void;
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

  // For bonus questions, use stake amount; otherwise use question value
  const pointValue = question.isBonus && question.stake ? question.stake : question.value;

  // Find the team that buzzed in (for regular questions)
  const buzzedTeam = question.buzzedTeam 
    ? teams.find(t => t.id === question.buzzedTeam?.teamId)
    : null;

  // For bonus questions, the staking team answers
  const stakingTeam = question.isBonus && question.stakingTeamId
    ? teams.find(t => t.id === question.stakingTeamId)
    : null;

  // The team that should answer (staking team for bonus, buzzed team otherwise)
  const answeringTeam = stakingTeam || buzzedTeam;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${question.isBonus ? "bg-gradient-to-br from-yellow-50 to-orange-50" : "bg-white"}`}>
      {/* Header with value and close button */}
      <div className={`flex items-center justify-between p-6 border-b ${question.isBonus ? "border-orange-200 bg-gradient-to-r from-yellow-400 to-orange-500" : "border-gray-200"}`}>
        <div className="w-12" />
        <div className="text-center">
          {/* Bonus badge */}
          {question.isBonus && (
            <span className="inline-block bg-white text-orange-600 px-4 py-1 rounded-full text-sm font-bold mb-2">
              BONUS SPØRGSMÅL
            </span>
          )}
          <h2 className={`text-4xl md:text-5xl font-bold ${question.isBonus ? "text-white" : "text-black"}`}>
            {question.isBonus ? `Indsats: ${question.stake} kr.` : `${question.value} kr.`}
          </h2>
          {/* Show staking team for bonus questions */}
          {question.isBonus && question.stakingTeamName && (
            <p className="text-white/90 text-lg mt-1">
              {question.stakingTeamName} spiller for indsatsen
            </p>
          )}
        </div>
        {isHost && (
          <button
            onClick={() => onClose(false)}
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors ${question.isBonus ? "hover:bg-white/20" : "hover:bg-gray-100"}`}
            title="Close without marking as used"
          >
            <X className={`w-8 h-8 ${question.isBonus ? "text-white" : "text-gray-500"}`} />
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

        {/* Buzzed team indicator (regular questions) */}
        {question.buzzedTeam && !question.isBonus && (
          <div className="mt-12 bg-red-100 border-4 border-red-500 rounded-2xl px-12 py-6 text-center animate-pulse">
            <p className="text-2xl md:text-3xl font-bold text-red-700">
              🔔 {question.buzzedTeam.teamName} buzzede ind!
            </p>
          </div>
        )}

        {/* Answer section */}
        {showAnswer && (
          <div className="mt-12 bg-green-50 border-4 border-green-500 rounded-2xl px-12 py-6 text-center">
            <p className="text-lg text-green-600 mb-2">Svar:</p>
            <p className="text-3xl md:text-4xl font-bold text-green-800">{question.answer}</p>
          </div>
        )}
      </div>

      {/* Host controls - bottom of screen */}
      {isHost && (
        <div className={`p-6 border-t ${question.isBonus ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-gray-50"}`}>
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Reveal answer button */}
            {!showAnswer && (
              <Button
                onClick={onRevealAnswer}
                className={`w-full h-14 text-xl ${question.isBonus ? "bg-orange-600 hover:bg-orange-700" : "bg-gray-900 hover:bg-gray-800"} text-white`}
              >
                Vis Svar
              </Button>
            )}

            {/* Scoring controls - show after answer is revealed */}
            {showAnswer && (
              <div className="space-y-3">
                {/* For bonus questions - award to staking team */}
                {question.isBonus && stakingTeam && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => { onAwardPoints(stakingTeam.id, pointValue); onClose(true); }}
                      className="flex-1 h-14 text-xl bg-green-600 text-white hover:bg-green-700"
                    >
                      Korrekt (+{pointValue} kr.)
                    </Button>
                    <Button
                      onClick={() => { onAwardPoints(stakingTeam.id, -pointValue); onClose(true); }}
                      variant="destructive"
                      className="flex-1 h-14 text-xl"
                    >
                      Forkert (-{pointValue} kr.)
                    </Button>
                  </div>
                )}

                {/* For regular questions - show buttons for each team */}
                {!question.isBonus && teams.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 text-center">Tildel point til hold:</p>
                    {teams.map((team) => (
                      <div key={team.id} className="flex items-center gap-2">
                        <span className={`flex-1 text-lg font-medium ${buzzedTeam?.id === team.id ? "text-red-600" : "text-black"}`}>
                          {team.name} {buzzedTeam?.id === team.id && "🔔"}
                        </span>
                        <Button
                          onClick={() => { onAwardPoints(team.id, pointValue); onClose(true); }}
                          size="sm"
                          className="bg-green-600 text-white hover:bg-green-700"
                        >
                          +{pointValue} kr.
                        </Button>
                        <Button
                          onClick={() => { onAwardPoints(team.id, -pointValue); onClose(true); }}
                          size="sm"
                          variant="destructive"
                        >
                          -{pointValue} kr.
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Close without awarding points */}
                <Button
                  onClick={() => onClose(true)}
                  variant="outline"
                  className="w-full h-10 text-sm border-gray-300 text-gray-600 hover:bg-gray-100"
                >
                  Luk uden point
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
