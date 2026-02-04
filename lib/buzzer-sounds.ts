// Buzzer sound generation and playback for the Jeopardy game
import type { Team } from "./database.types";

// Audio context singleton
let audioContext: AudioContext | null = null;

// Get or create audio context
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

// Preset sound definitions
export const PRESET_SOUNDS = {
  // Classic sounds
  buzzer: { name: "Buzzer", emoji: "🔔", category: "classic" },
  bell: { name: "Bell", emoji: "🛎️", category: "classic" },
  horn: { name: "Horn", emoji: "📯", category: "classic" },
  chime: { name: "Chime", emoji: "✨", category: "classic" },
  // Fun sounds
  airhorn: { name: "Airhorn", emoji: "📢", category: "fun" },
  boing: { name: "Boing", emoji: "🎾", category: "fun" },
  quack: { name: "Quack", emoji: "🦆", category: "fun" },
  woof: { name: "Woof", emoji: "🐕", category: "fun" },
} as const;

export type PresetSoundName = keyof typeof PRESET_SOUNDS;

// Generate and play a preset sound using Web Audio API
export function playPresetSound(name: PresetSoundName): void {
  const ctx = getAudioContext();

  switch (name) {
    case "buzzer":
      playBuzzerSound(ctx);
      break;
    case "bell":
      playBellSound(ctx);
      break;
    case "horn":
      playHornSound(ctx);
      break;
    case "chime":
      playChimeSound(ctx);
      break;
    case "airhorn":
      playAirhornSound(ctx);
      break;
    case "boing":
      playBoingSound(ctx);
      break;
    case "quack":
      playQuackSound(ctx);
      break;
    case "woof":
      playWoofSound(ctx);
      break;
    default:
      playBuzzerSound(ctx); // Default fallback
  }
}

// Play a custom sound from base64 data
export async function playCustomSound(base64Data: string): Promise<void> {
  try {
    const ctx = getAudioContext();
    
    // Extract the actual base64 content (remove data URL prefix)
    const base64Content = base64Data.split(",")[1] || base64Data;
    
    // Decode base64 to array buffer
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Decode audio data
    const audioBuffer = await ctx.decodeAudioData(bytes.buffer);
    
    // Play the audio
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch (error) {
    console.error("Failed to play custom sound:", error);
    // Fallback to default buzzer
    playPresetSound("buzzer");
  }
}

// Play the appropriate sound for a team
export async function playTeamBuzzer(team: Team): Promise<void> {
  if (team.sound_type === "custom" && team.custom_sound) {
    await playCustomSound(team.custom_sound);
  } else {
    const soundName = (team.sound_type || "buzzer") as PresetSoundName;
    if (soundName in PRESET_SOUNDS) {
      playPresetSound(soundName);
    } else {
      playPresetSound("buzzer");
    }
  }
}

// === Preset Sound Generators ===

// Classic game show buzzer
function playBuzzerSound(ctx: AudioContext): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "square";
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  osc.frequency.setValueAtTime(380, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.4);
}

// Ding bell sound
function playBellSound(ctx: AudioContext): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);

  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.8);
}

// Game horn sound
function playHornSound(ctx: AudioContext): void {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = "sawtooth";
  osc1.frequency.setValueAtTime(220, ctx.currentTime);

  osc2.type = "sawtooth";
  osc2.frequency.setValueAtTime(277, ctx.currentTime);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(ctx.currentTime);
  osc2.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.6);
  osc2.stop(ctx.currentTime + 0.6);
}

// Rising chime sound
function playChimeSound(ctx: AudioContext): void {
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    const startTime = ctx.currentTime + i * 0.1;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.4);
  });
}

// MLG airhorn sound
function playAirhornSound(ctx: AudioContext): void {
  const frequencies = [349, 440, 523]; // F4, A4, C5

  frequencies.forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  });
}

// Cartoon spring boing
function playBoingSound(ctx: AudioContext): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);

  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.4);
}

// Duck quack sound
function playQuackSound(ctx: AudioContext): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.setValueAtTime(250, ctx.currentTime + 0.05);
  osc.frequency.setValueAtTime(200, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

// Dog woof sound
function playWoofSound(ctx: AudioContext): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.setValueAtTime(120, ctx.currentTime + 0.1);
  osc.frequency.setValueAtTime(100, ctx.currentTime + 0.2);

  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.35);
}
