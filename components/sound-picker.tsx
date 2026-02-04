"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PRESET_SOUNDS, PresetSoundName, playPresetSound, playCustomSound } from "@/lib/buzzer-sounds";

// Props for the SoundPicker component
interface SoundPickerProps {
  selectedSound: string;
  customSound: string | null;
  onSoundChange: (soundType: string, customSound: string | null) => void;
}

// Sound picker component for selecting buzzer sounds
export function SoundPicker({ selectedSound, customSound, onSoundChange }: SoundPickerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [hasCustomRecording, setHasCustomRecording] = useState(!!customSound);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update hasCustomRecording when customSound prop changes
  useEffect(() => {
    setHasCustomRecording(!!customSound);
  }, [customSound]);

  // Handle preset sound selection
  const handlePresetSelect = (soundName: PresetSoundName) => {
    playPresetSound(soundName);
    onSoundChange(soundName, null);
  };

  // Play the current custom recording
  const playCurrentCustom = async () => {
    if (customSound) {
      await playCustomSound(customSound);
    }
  };

  // Start recording
  const startRecording = async () => {
    setRecordingError(null);
    
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4"
      });
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Convert to base64
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setHasCustomRecording(true);
          onSoundChange("custom", base64);
          
          // Play the recording back
          playCustomSound(base64);
        };
        
        reader.readAsDataURL(blob);
        
        setIsRecording(false);
        setRecordingProgress(0);
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);

      // Progress animation
      const startTime = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setRecordingProgress(Math.min(elapsed / 2000, 1));
      }, 50);

      // Auto-stop after 2 seconds
      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 2000);

    } catch (error) {
      console.error("Failed to start recording:", error);
      setRecordingError("Could not access microphone. Please allow microphone access.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // Group sounds by category
  const classicSounds = Object.entries(PRESET_SOUNDS).filter(([_, s]) => s.category === "classic");
  const funSounds = Object.entries(PRESET_SOUNDS).filter(([_, s]) => s.category === "fun");

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-black">Choose Your Buzzer Sound</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Classic sounds */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Classic</p>
          <div className="grid grid-cols-4 gap-2">
            {classicSounds.map(([key, sound]) => (
              <button
                key={key}
                onClick={() => handlePresetSelect(key as PresetSoundName)}
                className={`
                  p-3 rounded-lg border-2 transition-all
                  flex flex-col items-center gap-1
                  ${selectedSound === key 
                    ? "border-black bg-gray-100" 
                    : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                  }
                `}
              >
                <span className="text-2xl">{sound.emoji}</span>
                <span className="text-xs text-gray-700">{sound.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Fun sounds */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Fun</p>
          <div className="grid grid-cols-4 gap-2">
            {funSounds.map(([key, sound]) => (
              <button
                key={key}
                onClick={() => handlePresetSelect(key as PresetSoundName)}
                className={`
                  p-3 rounded-lg border-2 transition-all
                  flex flex-col items-center gap-1
                  ${selectedSound === key 
                    ? "border-black bg-gray-100" 
                    : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                  }
                `}
              >
                <span className="text-2xl">{sound.emoji}</span>
                <span className="text-xs text-gray-700">{sound.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom recording section */}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Record Your Own (2 seconds max)</p>
          
          {/* Recording button */}
          {!isRecording ? (
            <div className="flex gap-2">
              <Button
                onClick={startRecording}
                variant="outline"
                className={`flex-1 ${selectedSound === "custom" ? "border-black bg-gray-100" : ""}`}
              >
                <span className="mr-2">🎤</span>
                {hasCustomRecording ? "Record New" : "Record Sound"}
              </Button>
              
              {/* Play custom recording button */}
              {hasCustomRecording && (
                <Button
                  onClick={playCurrentCustom}
                  variant={selectedSound === "custom" ? "default" : "outline"}
                  className={selectedSound === "custom" ? "bg-black text-white" : ""}
                >
                  <span className="mr-2">▶️</span>
                  Play
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {/* Recording progress */}
              <div className="relative h-12 bg-red-100 rounded-lg overflow-hidden flex items-center justify-center">
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-red-500 transition-all"
                  style={{ width: `${recordingProgress * 100}%` }}
                />
                <span className="relative text-white font-bold flex items-center gap-2">
                  <span className="animate-pulse">●</span> Recording...
                </span>
              </div>
              <Button
                onClick={stopRecording}
                variant="outline"
                className="w-full"
              >
                Stop Early
              </Button>
            </div>
          )}

          {/* Recording error */}
          {recordingError && (
            <p className="text-red-600 text-sm mt-2">{recordingError}</p>
          )}

          {/* Custom sound indicator */}
          {hasCustomRecording && selectedSound === "custom" && (
            <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
              <span>✓</span> Custom sound selected
            </p>
          )}
        </div>

        {/* Current selection indicator */}
        <div className="pt-2 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Selected: <span className="font-medium text-black">
              {selectedSound === "custom" 
                ? "Custom Recording" 
                : PRESET_SOUNDS[selectedSound as PresetSoundName]?.name || "Buzzer"
              }
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
