"""Syntetiserer 30 s varm piano + strykepute, 70 BPM, myk inn/ut. Kjør: python3 music.py -> music.wav"""
import numpy as np, wave
SR = 44100; DUR = 30.0; BPM = 70; BEAT = 60 / BPM; BAR = 4 * BEAT
t_all = np.arange(int(SR * DUR)) / SR
rng = np.random.default_rng(7)
mix = np.zeros((len(t_all), 2))

def hz(m): return 440 * 2 ** ((m - 69) / 12)

def piano(m, start, length, vel, pan):
    n = int(SR * min(length + 2.5, DUR - start)); t = np.arange(n) / SR
    f = hz(m); env = np.exp(-t * (1.6 + f / 900)) * (1 - np.exp(-t * 200))
    tone = sum(a * np.sin(2 * np.pi * f * k * (1 + 0.0004 * k * k) * t) for k, a in [(1, 1), (2, .45), (3, .22), (4, .1), (5, .05)])
    s = int(SR * start); seg = vel * env * tone
    mix[s:s + n, 0] += seg * (1 - pan); mix[s:s + n, 1] += seg * pan

def pad(ms, start, length, vel):
    n = int(SR * min(length + 1.2, DUR - start)); t = np.arange(n) / SR
    env = np.minimum(1, t / 1.4) * np.minimum(1, np.maximum(0, (length + 1.2 - t) / 1.6))
    s = int(SR * start)
    for m in ms:
        for det, ch in [(-0.07, 0), (0.07, 1)]:
            f = hz(m) * 2 ** (det / 12); vib = 1 + 0.002 * np.sin(2 * np.pi * 5 * t)
            ph = 2 * np.pi * np.cumsum(f * vib) / SR
            mix[s:s + n, ch] += vel * env * (np.sin(ph) + .3 * np.sin(2 * ph) + .12 * np.sin(3 * ph)) / len(ms)

# C – Am – F – G, to runder, så C til slutt. Bass + arpeggio + pute.
chords = [(48, [60, 64, 67, 71]), (45, [57, 60, 64, 67]), (41, [57, 60, 65, 69]), (43, [55, 59, 62, 67])] * 2 + [(48, [60, 64, 67, 72])]
arp = [0, 2, 1, 3, 2, 1, 3, 2]
for i, (bass, notes) in enumerate(chords):
    st = 0.6 + i * BAR
    if st >= DUR - 1: break
    warmth = 0.5 + 0.5 * i / (len(chords) - 1)          # bygger seg forsiktig opp
    piano(bass, st, BAR, .30, .45)
    piano(bass + 12, st, BAR, .12 * warmth, .5)
    last = i == len(chords) - 1
    for j, k in enumerate(arp if not last else [0, 1, 2, 3]):
        when = st + j * BEAT / 2 * (1 if not last else 1.5)
        piano(notes[k] + (12 if (j == 7 and i % 2) else 0), when, BEAT, .16 + .02 * rng.random(), .35 + .3 * (k / 3))
    pad(notes[:3], st, BAR if not last else DUR - st - 1.2, .05 + .07 * warmth)

# Enkel romklang: konvolusjon med eksponentielt dempet støy.
ir_t = np.arange(int(SR * 2.2)) / SR
for ch in range(2):
    ir = np.convolve(rng.standard_normal(len(ir_t)), np.ones(24) / 24, 'same') * np.exp(-ir_t * 3.2); ir[0] = 0  # lavpasset klang
    wet = np.fft.irfft(np.fft.rfft(mix[:, ch], len(mix) + len(ir)) * np.fft.rfft(ir, len(mix) + len(ir)))[:len(mix)]
    mix[:, ch] = mix[:, ch] + 0.03 * wet

fade = np.minimum(1, t_all / 1.5) * np.minimum(1, (DUR - t_all) / 3.0)
mix *= fade[:, None]; mix /= np.abs(mix).max() / 0.85
with wave.open('music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('music.wav', DUR, 's')
