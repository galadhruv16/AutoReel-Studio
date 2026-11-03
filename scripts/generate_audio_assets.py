"""
AutoReel Studio - Velvety Organic Audio Synthesizer
Generates smooth, subtle, ear-pleasing acoustic SFX with ZERO harshness:
1. sub_bass_drop: Soft, warm, deep sub-bass cinematic pulse (no clipping, no harsh transient)
2. whoosh_transition: Silky-smooth, low-frequency warm air swish (pink noise filtered < 450Hz, no white noise hiss)
3. pop_accent: Gentle wooden / bubble acoustic pop (smooth sine with warm decay)
4. typewriter_click: Subtle, muted tactile tick
5. ambient_tension: 65s lush ambient cinematic bed
"""

import math
import os
import random
import struct
import wave

SAMPLE_RATE = 44100

def write_wav(filename: str, samples: list[float], sample_rate: int = SAMPLE_RATE, channels: int = 1):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with wave.open(filename, 'wb') as wav_file:
        wav_file.setnchannels(channels)
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        
        raw_bytes = bytearray()
        for s in samples:
            clamped = max(-1.0, min(1.0, s))
            sample_val = int(clamped * 32767.0)
            raw_bytes.extend(struct.pack('<h', sample_val))
        wav_file.writeframes(raw_bytes)
    print(f"Generated: {filename} ({len(samples) / sample_rate:.2f}s, {channels}ch)")

def generate_soft_sub_bass_drop(output_path: str):
    duration = 1.0
    total_samples = int(duration * SAMPLE_RATE)
    samples = []
    
    phase = 0.0
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        
        # Smooth exponential glide: from 95 Hz down to 32 Hz (deep, warm, not aggressive)
        freq = 32.0 + (95.0 - 32.0) * math.exp(-t * 4.0)
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        
        # Soft envelope: 25ms gentle attack, smooth exponential decay
        if t < 0.025:
            env = math.sin(math.pi * 0.5 * (t / 0.025))
        else:
            env = math.exp(-(t - 0.025) * 2.8)
            
        # Pure fundamental sine + tiny 2nd harmonic (warmth, no harshness)
        raw = math.sin(phase) + 0.10 * math.sin(phase * 2.0)
        
        # Gentle master gain (peak ~0.65 to ensure headroom and zero clipping)
        samples.append(raw * env * 0.65)
        
    write_wav(output_path, samples, SAMPLE_RATE, channels=1)

def generate_silky_whoosh(output_path: str):
    duration = 0.38
    total_samples = int(duration * SAMPLE_RATE)
    samples = []
    
    # Generate pink noise (1/f spectrum) via Voss-McCartney algorithm
    # This completely eliminates the harsh static hiss of white noise
    num_rows = 12
    pink_rows = [0.0] * num_rows
    pink_running_sum = 0.0
    
    def get_pink():
        nonlocal pink_running_sum
        k = random.randint(0, num_rows - 1)
        prev = pink_rows[k]
        pink_rows[k] = random.uniform(-1.0, 1.0)
        pink_running_sum += pink_rows[k] - prev
        return (pink_running_sum / num_rows)
        
    raw_pink = [get_pink() for _ in range(total_samples)]
    
    # Smooth 2-pole low-pass filter strictly between 120Hz and 480Hz
    # Absolutely NO high-frequency harshness or cymbal-like crash
    lp1 = 0.0
    lp2 = 0.0
    
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        
        # Cosine-squared window: perfectly smooth, zero abrupt clicks
        env = math.sin(math.pi * (t / duration)) ** 2
        
        # Filter cutoff sweeps gently from 140 Hz up to 480 Hz at the peak, then back down
        cutoff = 140.0 + 340.0 * env
        alpha = min(0.3, 2.0 * math.pi * cutoff / SAMPLE_RATE)
        
        # 2-pole lowpass
        lp1 += alpha * (raw_pink[i] - lp1)
        lp2 += alpha * (lp1 - lp2)
        
        # Gentle, airy volume (peak ~0.40)
        s = lp2 * env * 0.40
        samples.append(s)
        
    write_wav(output_path, samples, SAMPLE_RATE, channels=1)

def generate_gentle_pop_accent(output_path: str):
    duration = 0.16
    total_samples = int(duration * SAMPLE_RATE)
    samples = []
    
    phase = 0.0
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        
        # Soft bubble/woodblock frequency drop: 580 Hz down to 320 Hz
        freq = 320.0 + 260.0 * math.exp(-t * 45.0)
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        
        # Smooth attack (4ms) and rapid exponential decay
        if t < 0.004:
            env = t / 0.004
        else:
            env = math.exp(-(t - 0.004) * 28.0)
            
        s = math.sin(phase) * env * 0.45
        samples.append(s)
        
    write_wav(output_path, samples, SAMPLE_RATE, channels=1)

def generate_muted_typewriter_click(output_path: str):
    duration = 0.08
    total_samples = int(duration * SAMPLE_RATE)
    samples = []
    
    phase = 0.0
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        
        freq = 1100.0  # Muted wooden tap rather than shrill click
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        
        env = math.exp(-t * 90.0)
        s = math.sin(phase) * env * 0.35
        samples.append(s)
        
    write_wav(output_path, samples, SAMPLE_RATE, channels=1)

def generate_ambient_tension(output_path: str, duration: float = 65.0):
    total_samples = int(duration * SAMPLE_RATE)
    samples = []
    
    freqs = [55.0, 82.41, 110.0, 130.81, 164.81]
    weights = [0.38, 0.24, 0.20, 0.14, 0.08]
    phases = [0.0] * len(freqs)
    
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        
        val = 0.0
        for j, (f, w) in enumerate(zip(freqs, weights)):
            detune = 1.0 + 0.003 * math.sin(t * (0.3 + j * 0.1))
            current_f = f * detune
            phases[j] += 2.0 * math.pi * current_f / SAMPLE_RATE
            harmonic = math.sin(phases[j]) + 0.15 * math.sin(phases[j] * 2.0)
            val += harmonic * w
            
        pulse = 0.85 + 0.15 * math.sin(2.0 * math.pi * 0.25 * t)
        fade_in = min(1.0, t / 1.5)
        fade_out = min(1.0, (duration - t) / 3.0)
        master_env = fade_in * fade_out
        
        s = math.tanh(val * 1.3) * pulse * master_env * 0.65
        samples.append(s)
        
    write_wav(output_path, samples, SAMPLE_RATE, channels=1)

if __name__ == '__main__':
    print("Synthesizing AutoReel Studio Silky Audio Assets...")
    generate_soft_sub_bass_drop("public/audio/sfx/sub_bass_drop.wav")
    generate_silky_whoosh("public/audio/sfx/whoosh_transition.wav")
    generate_gentle_pop_accent("public/audio/sfx/pop_accent.wav")
    generate_muted_typewriter_click("public/audio/sfx/typewriter_click.wav")
    generate_ambient_tension("public/audio/music/ambient_tension.wav", duration=65.0)
    print("SUCCESS: All procedural sound assets updated!")
