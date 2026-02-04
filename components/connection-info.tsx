"use client";

import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Props for the ConnectionInfo component
interface ConnectionInfoProps {
  gameId: string;
}

// Displays connection information for players to join
export function ConnectionInfo({ gameId }: ConnectionInfoProps) {
  // Get the current URL for sharing
  const gameUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/join?code=${gameId}`
    : "";

  // Copy link to clipboard
  const copyLink = () => {
    if (gameUrl) {
      navigator.clipboard.writeText(gameUrl);
    }
  };

  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-black">Join the Game</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Game code - big and prominent */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Game Code:</p>
          <p className="text-4xl font-mono font-bold text-black tracking-widest bg-white p-4 rounded-lg border border-gray-200 text-center">
            {gameId}
          </p>
        </div>

        {/* QR Code for easy mobile scanning */}
        {gameUrl && (
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-600 mb-2">Scan to join:</p>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <QRCodeSVG 
                value={gameUrl} 
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>
          </div>
        )}

        {/* Share link for desktop users */}
        {gameUrl && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Or share this link:</p>
            <button
              onClick={copyLink}
              className="w-full text-left text-sm font-mono text-blue-600 hover:text-blue-800 bg-white p-3 rounded-lg border border-gray-200 break-all hover:bg-gray-50 transition-colors"
              title="Click to copy"
            >
              {gameUrl}
            </button>
            <p className="text-xs text-gray-400 mt-1 text-center">Click to copy</p>
          </div>
        )}

        {/* Instructions */}
        <p className="text-sm text-gray-500 text-center">
          Players scan the QR code or enter the game code at the website.
        </p>
      </CardContent>
    </Card>
  );
}
