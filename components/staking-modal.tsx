"use client";

import { useState } from "react";
import { Team } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Props for the StakingModal component
interface StakingModalProps {
  isOpen: boolean;
  questionValue: number;
  teams: Team[];
  onConfirmStake: (teamId: string, stake: number) => void;
  onCancel: () => void;
}

// Full-screen modal for bonus question staking (Daily Double style)
export function StakingModal({
  isOpen,
  questionValue,
  teams,
  onConfirmStake,
  onCancel,
}: StakingModalProps) {
  // Selected team and stake amount
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Get selected team's current score
  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const maxStake = selectedTeam ? Math.max(selectedTeam.score, 500) : 500;  // Minimum max stake is 500
  const minStake = 100;

  // Handle stake confirmation
  const handleConfirm = () => {
    if (!selectedTeamId) {
      setError("Please select a team");
      return;
    }

    const stake = parseInt(stakeAmount, 10);
    if (isNaN(stake) || stake < minStake) {
      setError(`Minimum stake is $${minStake}`);
      return;
    }
    if (stake > maxStake) {
      setError(`Maximum stake is $${maxStake}`);
      return;
    }

    onConfirmStake(selectedTeamId, stake);
  };

  // Quick stake buttons
  const quickStakes = [100, 200, 300, 500];
  if (selectedTeam && selectedTeam.score > 500) {
    quickStakes.push(selectedTeam.score);  // Add "All In" option
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex flex-col items-center justify-center p-8">
      {/* Bonus announcement */}
      <div className="text-center mb-12 animate-pulse">
        <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-lg mb-4">
          BONUS!
        </h1>
        <p className="text-2xl md:text-3xl text-white/90">
          Daily Double - ${questionValue} Question
        </p>
      </div>

      {/* Team selection */}
      <div className="bg-white rounded-2xl p-8 max-w-xl w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-black mb-6 text-center">
          Select Team & Stake
        </h2>

        {/* Team buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {teams.map(team => (
            <button
              key={team.id}
              onClick={() => {
                setSelectedTeamId(team.id);
                setError(null);
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedTeamId === team.id
                  ? "border-orange-500 bg-orange-50 ring-2 ring-orange-300"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="font-bold text-black">{team.name}</p>
              <p className="text-gray-600">${team.score}</p>
            </button>
          ))}
        </div>

        {/* Stake input */}
        {selectedTeamId && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stake Amount (Max: ${maxStake})
              </label>
              <Input
                type="number"
                value={stakeAmount}
                onChange={(e) => {
                  setStakeAmount(e.target.value);
                  setError(null);
                }}
                placeholder={`Enter stake (${minStake}-${maxStake})`}
                className="text-xl h-14 text-center font-bold"
                min={minStake}
                max={maxStake}
              />
            </div>

            {/* Quick stake buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              {quickStakes.filter(s => s <= maxStake).map(stake => (
                <Button
                  key={stake}
                  variant="outline"
                  onClick={() => {
                    setStakeAmount(stake.toString());
                    setError(null);
                  }}
                  className={`flex-1 min-w-[80px] ${
                    stakeAmount === stake.toString() ? "border-orange-500 bg-orange-50" : ""
                  }`}
                >
                  {stake === selectedTeam?.score && stake > 500 ? "ALL IN" : `$${stake}`}
                </Button>
              ))}
            </div>
          </>
        )}

        {/* Error message */}
        {error && (
          <p className="text-red-600 text-center mb-4">{error}</p>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTeamId || !stakeAmount}
            className="flex-1 h-12 bg-orange-600 hover:bg-orange-700 text-white"
          >
            Confirm Stake
          </Button>
        </div>
      </div>
    </div>
  );
}
