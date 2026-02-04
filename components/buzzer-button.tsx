"use client";

import { useState } from "react";

// Props for the BuzzerButton component
interface BuzzerButtonProps {
  onBuzz: () => void;
  disabled: boolean;
  hasBuzzed: boolean;
  isLocked: boolean;
}

// Large buzzer button for teams
export function BuzzerButton({ onBuzz, disabled, hasBuzzed, isLocked }: BuzzerButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  // Handle buzz action
  const handleBuzz = () => {
    if (!disabled && !hasBuzzed && !isLocked) {
      setIsPressed(true);
      onBuzz();
      
      // Reset pressed state after animation
      setTimeout(() => setIsPressed(false), 200);
    }
  };

  // Determine button state and styling
  const getButtonState = () => {
    if (hasBuzzed) {
      return {
        text: "BUZZEDE!",
        className: "bg-green-600 border-green-700 cursor-not-allowed",
      };
    }
    if (isLocked) {
      return {
        text: "LÅST",
        className: "bg-gray-400 border-gray-500 cursor-not-allowed",
      };
    }
    if (disabled) {
      return {
        text: "VENT",
        className: "bg-gray-300 border-gray-400 cursor-not-allowed",
      };
    }
    return {
      text: "BUZZ!",
      className: "bg-red-600 border-red-700 hover:bg-red-500 active:bg-red-700 cursor-pointer",
    };
  };

  const { text, className } = getButtonState();

  return (
    <button
      onClick={handleBuzz}
      disabled={disabled || hasBuzzed || isLocked}
      className={`
        w-64 h-64 md:w-80 md:h-80
        rounded-full
        border-8 border-b-[16px]
        text-white text-4xl md:text-5xl font-bold
        shadow-2xl
        transition-all duration-100
        select-none
        ${className}
        ${isPressed ? 'scale-95 border-b-8 translate-y-2' : 'scale-100'}
      `}
    >
      {text}
    </button>
  );
}
