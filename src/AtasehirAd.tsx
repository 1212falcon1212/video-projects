import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Montserrat';

const { fontFamily: MONTSERRAT } = loadFont('normal', {
  weights: ['400', '500', '600', '700', '800'],
});

const FONT = `${MONTSERRAT}, -apple-system, sans-serif`;

// ============================================================
// CONFIG
// ============================================================
export type AtasehirAdConfig = {
  heroImage: string;
  query: string;
  typingCps: number;

  question: string;
  answerHeading: string;
  answerBullets: string[];
  answerCps: number;

  brandLogo: string;
};

export const ATASEHIR_CONFIG: AtasehirAdConfig = {
  heroImage: 'atasehir-hero.png',
  query:
    'Ataşehir\'de değişime bugün başlamak istiyorsan hangi kapıyı çalmalısın?',
  typingCps: 30,

  question:
    'Ataşehir\'de değişime bugün başlamak istiyorsan hangi kapıyı çalmalısın?',
  answerHeading: 'Skypeak Fitness Club.',
  answerBullets: [
    'Ataşehir\'in kalbinde, son teknoloji ekipmanlarla donatılmış modern stüdyo',
    'Kişisel antrenman, grup dersleri ve uzman eğitmen kadrosu',
    'Premium tasarımlı, ferah ve geniş antrenman alanı',
    'Online randevu sistemi, esnek saat seçenekleri',
  ],
  answerCps: 75,

  brandLogo: 'image.png',
};

// ============================================================
// TIMING — 15s / 450f
// ============================================================
const TIMING = {
  scene1: { from: 0, dur: 180 },
  scene2: { from: 180, dur: 240 },
  scene3: { from: 420, dur: 90 },
};

// Scene 2 image anchor — scene 1 sonunda hero buraya iner (smooth bağlantı)
const IMG_ANCHOR = { x: 50, y: 80, w: 980, h: 540 };

// ============================================================
// HELPERS
// ============================================================
const useTyped = (text: string, startFrame: number, cps: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = Math.max(0, frame - startFrame);
  const chars = Math.min(text.length, Math.floor((elapsed * cps) / fps));
  return text.slice(0, chars);
};

// Search bar
const SearchBar: React.FC<{
  typedText: string;
  fullText: string;
  cursorBlink: boolean;
}> = ({ typedText, fullText, cursorBlink }) => {
  const isTyping = typedText.length > 0;
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)',
        borderRadius: 36,
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        boxShadow: '0 30px 60px rgba(0,0,0,0.35)',
      }}
    >
      {/* Sol: + */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="#0A0A0A"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div
        style={{
          flex: 1,
          fontFamily: FONT,
          fontSize: 36,
          color: isTyping ? '#0A0A0A' : '#9CA3AF',
          fontWeight: 500,
          lineHeight: 1.25,
        }}
      >
        {isTyping ? typedText : 'Soru sor...'}
        {isTyping && typedText.length < fullText.length && (
          <span
            style={{
              display: 'inline-block',
              width: 3,
              height: '1em',
              background: '#0A0A0A',
              marginLeft: 3,
              verticalAlign: 'text-bottom',
              opacity: cursorBlink ? 1 : 0,
            }}
          />
        )}
      </div>

      {/* Sağ: siyah ↑ */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: '#0A0A0A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 19V5M5 12l7-7 7 7"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

// ============================================================
// SCENE 1 — Hero + bar pop + typing + shrink to scene2 anchor
// ============================================================
const Scene1Search: React.FC<{ config: AtasehirAdConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const barIn = 60;
  const typeStart = 80;
  const typeEnd = Math.ceil(typeStart + (config.query.length / config.typingCps) * fps);
  const shrinkStart = typeEnd + 5;
  const shrinkEnd = 180;

  // Search bar pop: scale 1.4 → 1
  const barP = spring({
    frame: frame - barIn,
    fps,
    config: { damping: 18, mass: 0.9 },
  });
  const barScale = interpolate(barP, [0, 1], [1.4, 1]);
  const barOpacity = interpolate(barP, [0, 1], [0, 1]);

  // Bar fade out + slight shrink during shrink phase
  const barFadeOut = interpolate(
    frame,
    [shrinkStart, shrinkStart + 12],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const typed = useTyped(config.query, typeStart, config.typingCps);
  const cursorBlink = frame % 20 < 10;

  // Hero shrink: full canvas → IMG_ANCHOR
  const shrinkP = spring({
    frame: frame - shrinkStart,
    fps,
    config: { damping: 22, mass: 1 },
    durationInFrames: shrinkEnd - shrinkStart,
  });
  const heroX = interpolate(shrinkP, [0, 1], [0, IMG_ANCHOR.x]);
  const heroY = interpolate(shrinkP, [0, 1], [0, IMG_ANCHOR.y]);
  const heroW = interpolate(shrinkP, [0, 1], [1080, IMG_ANCHOR.w]);
  const heroH = interpolate(shrinkP, [0, 1], [1920, IMG_ANCHOR.h]);
  const heroRadius = interpolate(shrinkP, [0, 1], [0, 28]);

  // Background: black → white, switches during shrink
  const bgWhite = interpolate(
    frame,
    [shrinkStart - 4, shrinkStart + 12],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Hero darken overlay only when full screen (fades out as image shrinks)
  const darkenOpacity = interpolate(shrinkP, [0, 0.3], [0.18, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {/* Beyaz layer alttan açılır */}
      <AbsoluteFill style={{ background: '#FFFFFF', opacity: bgWhite }} />

      {/* Hero — full bleed → anchor */}
      <div
        style={{
          position: 'absolute',
          left: heroX,
          top: heroY,
          width: heroW,
          height: heroH,
          borderRadius: heroRadius,
          overflow: 'hidden',
          boxShadow:
            shrinkP > 0.3 ? '0 10px 30px rgba(0,0,0,0.12)' : 'none',
        }}
      >
        <Img
          src={staticFile(config.heroImage)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <AbsoluteFill style={{ background: `rgba(0,0,0,${darkenOpacity})` }} />
      </div>

      {/* Search bar — center */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 40px',
        }}
      >
        <div
          style={{
            width: '100%',
            transform: `scale(${barScale})`,
            opacity: barOpacity * barFadeOut,
          }}
        >
          <SearchBar
            typedText={typed}
            fullText={config.query}
            cursorBlink={cursorBlink}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 2 — Image + question + "Web'de aranıyor..." (1.5s) → answer
// ============================================================
const Scene2Chat: React.FC<{ config: AtasehirAdConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const searchingDuration = 45; // 1.5s
  const answerStart = searchingDuration;

  // Searching dots animasyonu
  const dotCount = Math.floor(frame / 8) % 4;
  const searchingDots = '.'.repeat(dotCount);

  // Searching label fade out
  const searchingOpacity = interpolate(
    frame,
    [0, 6, searchingDuration - 8, searchingDuration],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Typing schedule
  const cps = config.answerCps;
  const headingStart = answerStart + 4;
  const headingDur = Math.ceil((config.answerHeading.length / cps) * fps);

  const computeTyped = (text: string, start: number) => {
    const elapsed = Math.max(0, frame - start);
    const chars = Math.min(text.length, Math.floor((elapsed * cps) / fps));
    return text.slice(0, chars);
  };
  const headingTyped = computeTyped(config.answerHeading, headingStart);

  // Bullet start frames
  const bulletGap = 5;
  const bulletStarts: number[] = [];
  {
    let cursor = headingStart + headingDur + 8;
    for (const b of config.answerBullets) {
      bulletStarts.push(cursor);
      cursor += Math.ceil((b.length / cps) * fps) + bulletGap;
    }
  }
  const cursorBlink = frame % 20 < 10;

  return (
    <AbsoluteFill style={{ background: '#FFFFFF' }}>
      {/* Hero — anchor pozisyonunda (Scene 1'den seamless geçiş) */}
      <div
        style={{
          position: 'absolute',
          left: IMG_ANCHOR.x,
          top: IMG_ANCHOR.y,
          width: IMG_ANCHOR.w,
          height: IMG_ANCHOR.h,
          borderRadius: 28,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
        }}
      >
        <Img
          src={staticFile(config.heroImage)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Soru — görselin altında */}
      <div
        style={{
          position: 'absolute',
          top: IMG_ANCHOR.y + IMG_ANCHOR.h + 40,
          left: 50,
          right: 50,
          fontFamily: FONT,
          fontSize: 36,
          fontWeight: 500,
          color: '#0A0A0A',
          lineHeight: 1.35,
        }}
      >
        {config.question}
      </div>

      {/* "Web'de aranıyor..." — 1.5s */}
      <div
        style={{
          position: 'absolute',
          top: IMG_ANCHOR.y + IMG_ANCHOR.h + 240,
          left: 50,
          right: 50,
          fontFamily: FONT,
          fontSize: 30,
          fontWeight: 500,
          color: '#9CA3AF',
          opacity: searchingOpacity,
          letterSpacing: 0.3,
        }}
      >
        Web'de aranıyor{searchingDots}
      </div>

      {/* Cevap — heading + liste */}
      <div
        style={{
          position: 'absolute',
          top: IMG_ANCHOR.y + IMG_ANCHOR.h + 220,
          left: 50,
          right: 50,
        }}
      >
        {/* Heading — harf harf */}
        <div
          style={{
            fontFamily: FONT,
            fontSize: 56,
            fontWeight: 700,
            color: '#0A0A0A',
            letterSpacing: -1,
            marginBottom: 30,
            minHeight: 70,
            opacity: frame >= headingStart ? 1 : 0,
          }}
        >
          {headingTyped}
          {headingTyped.length > 0 &&
            headingTyped.length < config.answerHeading.length && (
              <span
                style={{
                  display: 'inline-block',
                  width: 4,
                  height: 56,
                  background: '#0A0A0A',
                  marginLeft: 4,
                  verticalAlign: 'text-bottom',
                  opacity: cursorBlink ? 1 : 0,
                }}
              />
            )}
        </div>

        {config.answerBullets.map((b, i) => {
          const start = bulletStarts[i];
          const typed = computeTyped(b, start);
          const visible = frame >= start;
          const isActive = visible && typed.length < b.length;

          // Dot pop-in
          const dotP = spring({
            frame: frame - start,
            fps,
            config: { damping: 18, mass: 0.6 },
          });
          const dotScale = interpolate(dotP, [0, 1], [0, 1]);

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 26,
                marginBottom: 46,
                opacity: visible ? 1 : 0,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#0A0A0A',
                  marginTop: 24,
                  flexShrink: 0,
                  transform: `scale(${dotScale})`,
                }}
              />
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 44,
                  fontWeight: 500,
                  color: '#0A0A0A',
                  lineHeight: 1.35,
                  minHeight: 60,
                }}
              >
                {typed}
                {isActive && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 4,
                      height: 44,
                      background: '#0A0A0A',
                      marginLeft: 4,
                      verticalAlign: 'text-bottom',
                      opacity: cursorBlink ? 1 : 0,
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 3 — Sadece logo
// ============================================================
const Scene3CTA: React.FC<{ config: AtasehirAdConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoP = spring({ frame, fps, config: { damping: 18, mass: 1 } });
  const logoScale = interpolate(logoP, [0, 1], [0.85, 1]);
  const logoOpacity = interpolate(logoP, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        background: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: 700,
          height: 700,
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
        }}
      >
        <Img
          src={staticFile(config.brandLogo)}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// MAIN
// ============================================================
export const AtasehirAd: React.FC<AtasehirAdConfig> = (config) => {
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Sequence from={TIMING.scene1.from} durationInFrames={TIMING.scene1.dur}>
        <Scene1Search config={config} />
      </Sequence>
      <Sequence from={TIMING.scene2.from} durationInFrames={TIMING.scene2.dur}>
        <Scene2Chat config={config} />
      </Sequence>
      <Sequence from={TIMING.scene3.from} durationInFrames={TIMING.scene3.dur}>
        <Scene3CTA config={config} />
      </Sequence>
    </AbsoluteFill>
  );
};
