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
  OffthreadVideo,
  Audio,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Montserrat';

const { fontFamily: MONTSERRAT } = loadFont('normal', {
  weights: ['400', '600', '700', '800', '900'],
});

// ============================================================
// THEME
// ============================================================
export type Theme = {
  bg: string;
  primary: string;
  accent: string;
  sky: string;
  text: string;
  muted: string;
  logoSrc: string;
  pillTextOnPrimary: string;
  sphereBlend: 'screen' | 'multiply';
  cardOverlay: string;
  grainOpacity: number;
};

export const DARK_THEME: Theme = {
  bg: '#FFFFFF',
  primary: '#0A0A0A',
  accent: '#FF4757',
  sky: '#2196F3',
  text: '#0A0A0A',
  muted: 'rgba(10, 10, 10, 0.22)',
  logoSrc: 'image.png',
  pillTextOnPrimary: '#FFFFFF',
  sphereBlend: 'multiply',
  cardOverlay: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 55%)',
  grainOpacity: 0,
};

export const LIGHT_THEME: Theme = {
  bg: '#FFFFFF',
  primary: '#0A0A0A',
  accent: '#FF4757',
  sky: '#2196F3',
  text: '#0A0A0A',
  muted: 'rgba(10, 10, 10, 0.22)',
  logoSrc: 'image.png',
  pillTextOnPrimary: '#FFFFFF',
  sphereBlend: 'multiply',
  cardOverlay: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 55%)',
  grainOpacity: 0,
};

const FONT = `${MONTSERRAT}, -apple-system, "Inter", sans-serif`;

// ============================================================
// SFX — Ses efektleri
// Dosyaları public/assets/sfx/ altına ekle, sonra SFX_ENABLED = true yap
// ============================================================
const SFX_ENABLED = false; // dosyalar eklendiğinde true yap

const SFX: Record<string, string> = {
  rise: 'assets/sfx/rise.mp3',         // Scene 1 logo reveal
  whoosh: 'assets/sfx/whoosh.mp3',     // Scene transitions
  tick: 'assets/sfx/tick.mp3',         // Scene 3 kategori seçimi
  pop: 'assets/sfx/pop.mp3',           // Scene 5 kart popup
  click: 'assets/sfx/click.mp3',       // Media toggle seçim
  swoosh: 'assets/sfx/swoosh.mp3',     // Video split transition
  impact: 'assets/sfx/impact.mp3',     // Quad video popup
};

const Sfx: React.FC<{ name: keyof typeof SFX; volume?: number; startFrom?: number }> = ({
  name,
  volume = 1,
  startFrom = 0,
}) => {
  if (!SFX_ENABLED) return null;
  const path = SFX[name];
  if (!path) return null;
  return <Audio src={staticFile(path)} volume={volume} startFrom={startFrom} />;
};

// ============================================================
// VARIANT
// ============================================================
export type SkypeakVariantProps = {
  brandName: string;
  tagline: string;
  introLabel: string;
  categories: string[];
  focusCategoryIndex: number;
  metaphorLabel: string;
  ctaLabel: string;
  classImages: string[];
  classVideos: string[];
  theme: Theme;
};

const BASE_VARIANT = {
  brandName: 'SKYPEAK',
  tagline: '7 Disiplin Tek Çatı',
  introLabel: 'Kendini Zirveye Taşı',
  categories: [
    'Yoga',
    'Pilates',
    'Body Shape',
    'Cycle',
    'HIIT',
    'Dance to Sky',
    'Personal Training',
  ],
  focusCategoryIndex: 5,
  metaphorLabel: 'Güç, Denge, Özgürlük',
  ctaLabel: 'İlk Dersin Ücretsiz',
  classImages: [
    'assets/images/personal-training.jpg',
    'assets/images/yoga.jpg',
    'assets/images/pilates.jpg',
    'assets/images/body-shape.jpg',
    'assets/images/cycle.jpg',
    'assets/images/hiit.jpg',
    'assets/images/havuz.jpg',
    'assets/images/dance.jpg',
  ],
  classVideos: [
    'assets/videos/v1-hero.mp4',     // 0: ilk full screen
    'assets/videos/v2-cemre.mp4',    // 1: split sağ-alt (3. sn'den başlar)
    'assets/videos/v3-pilates.mp4',  // 2: quad popup
    'assets/videos/v4-bodyshape.mp4',// 3: quad popup
    'assets/videos/v5-reformer.mp4', // 4: quad popup
    'assets/videos/v6-dila.mp4',     // 5: quad popup
  ],
};

export const SKYPEAK_VARIANT_DARK: SkypeakVariantProps = {
  ...BASE_VARIANT,
  theme: DARK_THEME,
};

export const SKYPEAK_VARIANT_LIGHT: SkypeakVariantProps = {
  ...BASE_VARIANT,
  theme: LIGHT_THEME,
};

// ============================================================
// EFFECT: Scene Transition Wrapper (in/out fade + scale)
// ============================================================
const SceneTransition: React.FC<{
  children: React.ReactNode;
  durationInFrames: number;
  inFrames?: number;
  outFrames?: number;
}> = ({ children, durationInFrames, inFrames = 12, outFrames = 12 }) => {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [0, inFrames], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const outP = interpolate(
    frame,
    [durationInFrames - outFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp' }
  );
  const opacity = Math.min(inP, outP);
  const scale =
    interpolate(inP, [0, 1], [1.04, 1]) *
    interpolate(outP, [0, 1], [1.04, 1]) /
    1;

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ============================================================
// EFFECT: Grain Overlay
// ============================================================
const GrainOverlay: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  // frame bazlı baseFrequency shift — canlı grain
  const seed = 0.9 + (frame % 6) * 0.01;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        opacity,
        mixBlendMode: 'overlay',
        zIndex: 100,
      }}
    >
      <svg width="100%" height="100%">
        <filter id={`grain-${frame}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={seed}
            numOctaves={2}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${frame})`} />
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================
// EFFECT: Animated Blob Background
// ============================================================
const BlobBackground: React.FC<{ theme: Theme; intensity?: number }> = ({
  theme,
  intensity = 1,
}) => {
  const frame = useCurrentFrame();
  const blobs = [
    { color: theme.primary, baseX: 300, baseY: 400, size: 720, phase: 0 },
    { color: theme.accent, baseX: 780, baseY: 1100, size: 620, phase: 1.3 },
    { color: theme.sky, baseX: 400, baseY: 1600, size: 680, phase: 2.6 },
  ];

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {blobs.map((b, i) => {
        const t = frame / 60 + b.phase;
        const x = b.baseX + Math.sin(t * 0.7) * 120;
        const y = b.baseY + Math.cos(t * 0.5) * 100;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - b.size / 2,
              top: y - b.size / 2,
              width: b.size,
              height: b.size,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, ${b.color}, ${b.color}00 65%)`,
              filter: `blur(80px)`,
              opacity: 0.35 * intensity,
              mixBlendMode: theme.sphereBlend,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ============================================================
// EFFECT: Light Flare (flash transition)
// ============================================================
const LightFlare: React.FC<{ frame: number; at: number; color: string }> = ({
  frame,
  at,
  color,
}) => {
  const opacity = interpolate(frame, [at - 4, at, at + 6], [0, 0.8, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (opacity <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 50%, ${color}, ${color}00 60%)`,
        opacity,
        pointerEvents: 'none',
        zIndex: 90,
      }}
    />
  );
};

// ============================================================
// EFFECT: Split Text Reveal (word-stagger mask)
// ============================================================
const SplitText: React.FC<{
  text: string;
  style?: React.CSSProperties;
  startFrame?: number;
  stagger?: number;
  chromatic?: boolean;
}> = ({ text, style, startFrame = 0, stagger = 4, chromatic = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');
  return (
    <div style={{ ...style, display: 'flex', flexWrap: 'wrap', gap: '0.3em', justifyContent: 'center' }}>
      {words.map((w, i) => {
        const p = spring({
          frame: frame - startFrame - i * stagger,
          fps,
          config: { damping: 20, mass: 0.8 },
        });
        const y = interpolate(p, [0, 1], [100, 0]);
        const opacity = interpolate(p, [0, 1], [0, 1]);
        const chromaOffset = interpolate(p, [0, 1], [6, 0]);
        const shadow = chromatic
          ? `${-chromaOffset}px 0 0 #FF4757, ${chromaOffset}px 0 0 #4FC3F7`
          : undefined;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${y}px)`,
              opacity,
              textShadow: shadow,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// ============================================================
// HELPER: Pill
// ============================================================
const Pill: React.FC<{
  text: string;
  variant?: 'primary' | 'soft' | 'outline';
  theme: Theme;
  pulse?: boolean;
}> = ({ text, variant = 'primary', theme, pulse }) => {
  const frame = useCurrentFrame();
  const pulseScale = pulse ? 1 + Math.sin(frame * 0.15) * 0.04 : 1;
  const pulseGlow = pulse ? 20 + Math.sin(frame * 0.15) * 15 : 0;

  const styles: React.CSSProperties =
    variant === 'primary'
      ? {
          background: theme.primary,
          color: theme.pillTextOnPrimary,
          boxShadow: pulse ? `0 0 ${pulseGlow}px ${theme.primary}` : 'none',
        }
      : variant === 'soft'
      ? {
          background:
            theme.bg === '#F5F5F0'
              ? 'rgba(10,10,10,0.06)'
              : 'rgba(250,250,250,0.08)',
          color: theme.text,
          border: `1px solid ${theme.muted}`,
        }
      : {
          background: 'transparent',
          color: theme.primary,
          border: `2px solid ${theme.primary}`,
        };

  return (
    <div
      style={{
        display: 'inline-block',
        padding: '14px 32px',
        borderRadius: 999,
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 38,
        letterSpacing: -0.5,
        transform: `scale(${pulseScale})`,
        ...styles,
      }}
    >
      {text}
    </div>
  );
};

// ============================================================
// SCENE 1 — Brand Reveal
// ============================================================
const Scene1BrandReveal: React.FC<{
  introLabel: string;
  theme: Theme;
  duration: number;
}> = ({ introLabel, theme, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoP = spring({ frame, fps, config: { damping: 18, mass: 1 } });
  const logoScale = interpolate(logoP, [0, 1], [0.8, 1]);
  const logoOpacity = interpolate(logoP, [0, 1], [0, 1]);

  const pillProgress = spring({ frame: frame - 60, fps, config: { damping: 15 } });
  const pillY = interpolate(pillProgress, [0, 1], [60, 0]);
  const pillOpacity = interpolate(pillProgress, [0, 1], [0, 1]);

  return (
    <SceneTransition durationInFrames={duration}>
      <AbsoluteFill style={{ background: theme.bg }} />
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            width: 720,
            height: 720,
            marginBottom: 40,
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
          }}
        >
          <Img
            src={staticFile(theme.logoSrc)}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <div style={{ transform: `translateY(${pillY}px)`, opacity: pillOpacity }}>
          <Pill text={introLabel} variant="primary" theme={theme} />
        </div>
      </AbsoluteFill>
    </SceneTransition>
  );
};

// ============================================================
// SCENE 2 — Tagline (split text + chromatic)
// ============================================================
const Scene2Tagline: React.FC<{
  tagline: string;
  theme: Theme;
  duration: number;
}> = ({ tagline, theme, duration }) => {
  return (
    <SceneTransition durationInFrames={duration}>
      <AbsoluteFill style={{ background: theme.bg }} />
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          padding: '0 60px',
        }}
      >
        <SplitText
          text={tagline}
          startFrame={0}
          stagger={6}
          style={{
            fontFamily: FONT,
            fontSize: 96,
            fontWeight: 700,
            color: theme.text,
            letterSpacing: -2,
            textAlign: 'center',
          }}
        />
      </AbsoluteFill>
    </SceneTransition>
  );
};

// ============================================================
// SCENE 3 — Sequential Category Selector
// Her kategori sırayla seçiliyor, listede focus kayar
// ============================================================
const Scene3Categories: React.FC<{
  categories: string[];
  focusIndex: number;
  theme: Theme;
  duration: number;
}> = ({ categories, focusIndex, theme, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const itemHeight = 130;
  const holdFrames = 30; // son kategoride kalınan süre
  const perItem = (duration - holdFrames) / categories.length;

  // Smooth exactIndex — discrete jumps + smoothing
  const rawIndex = Math.min(categories.length - 1, frame / perItem);
  // Spring-like ease between integer steps for nicer motion
  const targetIdx = Math.min(categories.length - 1, Math.floor(rawIndex));
  const stepP = spring({
    frame: frame - targetIdx * perItem,
    fps,
    config: { damping: 16, mass: 0.6 },
  });
  const fromIdx = Math.max(0, targetIdx - 1);
  const lerpedIndex = fromIdx + (targetIdx - fromIdx) * stepP;

  const centerIndex = (categories.length - 1) / 2;
  const offsetY = -(lerpedIndex - centerIndex) * itemHeight;

  void focusIndex;

  return (
    <SceneTransition durationInFrames={duration}>
      <AbsoluteFill style={{ background: theme.bg, overflow: 'hidden' }} />
      <BlobBackground theme={theme} intensity={0.4} />

      {/* Center selection indicator line */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          top: '50%',
          height: itemHeight,
          transform: 'translateY(-50%)',
          border: `1px solid ${theme.primary}22`,
          borderRadius: 16,
          background: `${theme.primary}08`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          transform: `translateY(calc(-50% + ${offsetY}px))`,
        }}
      >
        {categories.map((cat, i) => {
          const distance = Math.abs(i - lerpedIndex);
          const isFocus = distance < 0.5;
          const opacity = interpolate(distance, [0, 1.5, 4], [1, 0.4, 0.12], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const fontSize = interpolate(distance, [0, 1.5], [96, 58], {
            extrapolateRight: 'clamp',
          });

          // pop on select
          const selectP = spring({
            frame: frame - i * perItem,
            fps,
            config: { damping: 14, mass: 0.6 },
          });
          const popScale = isFocus
            ? interpolate(selectP, [0, 1], [1.15, 1])
            : 1;

          return (
            <div
              key={cat}
              style={{
                height: itemHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONT,
                fontWeight: isFocus ? 800 : 500,
                fontSize,
                color: isFocus ? theme.primary : theme.muted,
                letterSpacing: -2,
                textShadow: isFocus
                  ? `0 0 40px ${theme.primary}aa`
                  : 'none',
                opacity,
                transform: `scale(${popScale})`,
              }}
            >
              {cat}
            </div>
          );
        })}
      </div>

      <LightFlare frame={frame} at={duration - 6} color={theme.primary} />
    </SceneTransition>
  );
};

// 20 tasarım fotoğrafı havuzu
const PHOTO_POOL = [
  'assets/images/p01.jpg',
  'assets/images/p02.jpg',
  'assets/images/p03.jpg',
  'assets/images/p04.jpg',
  'assets/images/p05.jpg',
  'assets/images/p06.jpg',
  'assets/images/p07.jpg',
  'assets/images/p08.jpg',
  'assets/images/p09.jpg',
  'assets/images/p10.png',
  'assets/images/p11.jpg',
  'assets/images/p12.jpg',
  'assets/images/p13.jpg',
  'assets/images/p14.jpg',
  'assets/images/p15.jpg',
  'assets/images/p16.jpg',
  'assets/images/p17.jpg',
  'assets/images/p18.jpg',
  'assets/images/p19.png',
  'assets/images/p20.jpg',
];

const Scene5ClassGrid: React.FC<{
  categories: string[];
  classImages: string[];
  theme: Theme;
  duration: number;
}> = ({ theme, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 3-4-3 grid (10 kart, 340x370) — soldan sağa, kolon içi yukarıdan aşağıya
  const cards = [
    // Sol kolon (order 0-2)
    { x: 20, y: 450, w: 340, h: 370 },
    { x: 20, y: 830, w: 340, h: 370 },
    { x: 20, y: 1210, w: 340, h: 370 },
    // Orta kolon (order 3-6)
    { x: 370, y: 260, w: 340, h: 370 },
    { x: 370, y: 640, w: 340, h: 370 },
    { x: 370, y: 1020, w: 340, h: 370 },
    { x: 370, y: 1400, w: 340, h: 370 },
    // Sağ kolon (order 7-9)
    { x: 720, y: 450, w: 340, h: 370 },
    { x: 720, y: 830, w: 340, h: 370 },
    { x: 720, y: 1210, w: 340, h: 370 },
  ];

  const setA = PHOTO_POOL.slice(0, 10);
  const setB = PHOTO_POOL.slice(10, 20);

  // Akış:
  // Faz 1: 0-75 — ilk 10 pop-in (stagger 7f)
  // Bekle: 75-105 — 1s durur
  // Faz 2: 105-180 — ikinci 10 pop-in (aynı kartta, üstüne patlar)
  // Bekle: 180-210 — 1s
  // Zoom out: 210-270 — scale 1→0.85 + opacity fade, sonraki sahneye bağlanır
  const stagger = 7;
  const phase1Start = 0;
  const phase2Start = 105;
  const zoomOutStart = 210;

  const zoomScale = interpolate(
    frame,
    [zoomOutStart, duration],
    [1, 0.85],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <SceneTransition durationInFrames={duration}>
      <AbsoluteFill style={{ background: theme.bg }} />
      <AbsoluteFill
        style={{
          transform: `scale(${zoomScale})`,
          transformOrigin: 'center',
        }}
      >
        {cards.map((c, i) => {
          // Faz 1 pop
          const p1 = spring({
            frame: frame - phase1Start - i * stagger,
            fps,
            config: { damping: 12, mass: 0.7 },
          });
          const scale1 = interpolate(p1, [0, 1], [0.3, 1]);
          const opacity1 = interpolate(p1, [0, 1], [0, 1]);

          // Faz 2 pop (üstüne patlar, setB)
          const p2 = spring({
            frame: frame - phase2Start - i * stagger,
            fps,
            config: { damping: 12, mass: 0.7 },
          });
          const scale2 = interpolate(p2, [0, 1], [0.3, 1]);
          const opacity2 = interpolate(p2, [0, 1], [0, 1]);

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: c.x,
                top: c.y,
                width: c.w,
                height: c.h,
              }}
            >
              {/* Faz 1 kart */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.18), 0 6px 14px rgba(0,0,0,0.08)',
                  background: '#1a1a1a',
                  transform: `scale(${scale1})`,
                  opacity: opacity1,
                }}
              >
                <Img
                  src={staticFile(setA[i])}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>

              {/* Faz 2 kart — üstüne patlar */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2), 0 6px 14px rgba(0,0,0,0.1)',
                  background: '#1a1a1a',
                  transform: `scale(${scale2})`,
                  opacity: opacity2,
                }}
              >
                <Img
                  src={staticFile(setB[i])}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </SceneTransition>
  );
};

// ============================================================
// SCENE MEDIA TOGGLE — Image/Video seçimi
// ============================================================
const SceneMediaToggle: React.FC<{
  theme: Theme;
  duration: number;
}> = ({ theme, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Panel in
  const panelP = spring({ frame, fps, config: { damping: 20 } });
  const panelScale = interpolate(panelP, [0, 1], [0.85, 1]);
  const panelOpacity = interpolate(panelP, [0, 1], [0, 1]);

  // Selection switches from image -> video at frame 35
  const switchFrame = 35;
  const selP = spring({
    frame: frame - switchFrame,
    fps,
    config: { damping: 14, mass: 0.7 },
  });
  const videoSelected = frame >= switchFrame;

  const imgScale = videoSelected
    ? interpolate(selP, [0, 1], [1, 0.9])
    : 1;
  const vidScale = videoSelected
    ? interpolate(selP, [0, 1], [0.9, 1.12])
    : 0.9;

  // Label morph
  const iconBox = (
    selected: boolean,
    scale: number,
    children: React.ReactNode
  ) => (
    <div
      style={{
        width: 180,
        height: 180,
        borderRadius: 28,
        background: selected ? theme.primary : `${theme.text}0a`,
        border: selected
          ? `none`
          : `2px solid ${theme.muted}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${scale})`,
        boxShadow: selected
          ? `0 0 60px ${theme.primary}88, 0 20px 40px rgba(0,0,0,0.3)`
          : 'none',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </div>
  );

  const strokeColor = (sel: boolean) =>
    sel ? theme.pillTextOnPrimary : theme.text;

  return (
    <SceneTransition durationInFrames={duration}>
      <AbsoluteFill style={{ background: theme.bg }} />
      <BlobBackground theme={theme} intensity={0.5} />

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          transform: `scale(${panelScale})`,
          opacity: panelOpacity,
        }}
      >
        {/* Two icon buttons */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            marginBottom: 80,
          }}
        >
          {iconBox(
            !videoSelected,
            imgScale,
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                stroke={strokeColor(!videoSelected)}
                strokeWidth="2"
              />
              <circle
                cx="9"
                cy="9"
                r="2"
                stroke={strokeColor(!videoSelected)}
                strokeWidth="2"
              />
              <path
                d="M21 15l-5-5L5 21"
                stroke={strokeColor(!videoSelected)}
                strokeWidth="2"
              />
            </svg>
          )}
          {iconBox(
            videoSelected,
            vidScale,
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <rect
                x="2"
                y="5"
                width="20"
                height="14"
                rx="2"
                stroke={strokeColor(videoSelected)}
                strokeWidth="2"
              />
              <path
                d="M10 9l5 3-5 3V9z"
                fill={strokeColor(videoSelected)}
              />
            </svg>
          )}
        </div>

      </AbsoluteFill>

      <LightFlare frame={frame} at={switchFrame} color={theme.primary} />
      <LightFlare frame={frame} at={duration - 6} color={theme.primary} />
    </SceneTransition>
  );
};

// ============================================================
// SCENE VIDEO SHOWCASE — Gerçek video playback
// ============================================================
const VideoPanel: React.FC<{
  src: string | undefined;
  startFrame: number;
  borderRadius?: number;
  videoStartFrom?: number; // video içinden başlama noktası (frame)
}> = ({ src, borderRadius = 24, videoStartFrom = 0 }) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius,
        overflow: 'hidden',
        background: '#111',
        boxShadow: '0 30px 60px rgba(0,0,0,0.18), 0 10px 20px rgba(0,0,0,0.1)',
      }}
    >
      {src ? (
        <OffthreadVideo
          src={staticFile(src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          muted
          startFrom={videoStartFrom}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 16,
            color: 'rgba(255,255,255,0.35)',
            fontFamily: FONT,
            fontSize: 28,
          }}
        >
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
            <rect
              x="2"
              y="5"
              width="20"
              height="14"
              rx="2"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
            />
            <path d="M10 9l5 3-5 3V9z" fill="rgba(255,255,255,0.4)" />
          </svg>
          <div>Video yakında</div>
        </div>
      )}
    </div>
  );
};

const SceneVideoShowcase: React.FC<{
  videos: string[];
  theme: Theme;
  duration: number;
}> = ({ videos, theme, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Intro panel reveal (small pop-in)
  const introP = spring({
    frame,
    fps,
    config: { damping: 20 },
  });
  const introScale = interpolate(introP, [0, 1], [0.92, 1]);
  const introOpacity = interpolate(introP, [0, 1], [0, 1]);

  // Fullscreen → split transition starts at frame 60 (2s)
  const splitStart = 60;
  const splitP = spring({
    frame: frame - splitStart,
    fps,
    config: { damping: 18, mass: 1 },
  });

  // Fullscreen layout
  const fullX = 60;
  const fullY = 80;
  const fullW = 960;
  const fullH = 1760;

  // Small top-left target
  const smallW = 440;
  const smallH = 800;
  const tlX = 60;
  const tlY = 120;

  // Small bottom-right target
  const brX = 1080 - smallW - 60; // 580
  const brY = 1920 - smallH - 120; // 1000

  // Video 1: fullscreen → top-left
  const v1X = interpolate(splitP, [0, 1], [fullX, tlX]);
  const v1Y = interpolate(splitP, [0, 1], [fullY, tlY]);
  const v1W = interpolate(splitP, [0, 1], [fullW, smallW]);
  const v1H = interpolate(splitP, [0, 1], [fullH, smallH]);

  // Video 2: slides in from bottom-right after split
  const v2EntryStart = splitStart + 10;
  const v2P = spring({
    frame: frame - v2EntryStart,
    fps,
    config: { damping: 18, mass: 1 },
  });
  const v2Offset = interpolate(v2P, [0, 1], [400, 0]);
  const v2Opacity = interpolate(v2P, [0, 1], [0, 1]);

  return (
    <SceneTransition durationInFrames={duration} outFrames={4}>
      <AbsoluteFill style={{ background: theme.bg }} />


      {/* Video 1 — fullscreen → top-left */}
      <div
        style={{
          position: 'absolute',
          left: v1X,
          top: v1Y,
          width: v1W,
          height: v1H,
          transform: `scale(${introScale})`,
          opacity: introOpacity,
          transformOrigin: 'center',
        }}
      >
        <VideoPanel src={videos[0]} startFrame={0} borderRadius={28} />
      </div>

      {/* Video 2 — bottom-right, enters after split */}
      <div
        style={{
          position: 'absolute',
          left: brX,
          top: brY,
          width: smallW,
          height: smallH,
          transform: `translate(${v2Offset}px, ${v2Offset}px)`,
          opacity: v2Opacity,
        }}
      >
        <VideoPanel
          src={videos[1]}
          startFrame={v2EntryStart}
          borderRadius={28}
          videoStartFrom={90}
        />
      </div>
    </SceneTransition>
  );
};

// ============================================================
// SCENE VIDEO QUAD — 4 video zig-zag popup
// ============================================================
const SceneVideoQuad: React.FC<{
  videos: string[]; // 4 adet
  theme: Theme;
  duration: number;
}> = ({ videos, theme, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 4 video konumu — zig-zag
  // w=420, h=760 (dikey dikdörtgen)
  const w = 420;
  const h = 760;
  const positions = [
    { x: 60, y: 60, rot: -3 },                      // üst-sol
    { x: 1080 - w - 60, y: 180, rot: 4 },           // üst-sağ (biraz aşağı)
    { x: 60, y: 1920 - h - 180, rot: 3 },           // alt-sol (biraz yukarı)
    { x: 1080 - w - 60, y: 1920 - h - 60, rot: -4 },// alt-sağ
  ];

  // Stagger başlangıç: her biri 15 frame arayla
  const staggerStart = [10, 25, 40, 55];

  return (
    <SceneTransition durationInFrames={duration} inFrames={4}>
      <AbsoluteFill style={{ background: theme.bg }} />

      {positions.map((p, i) => {
        const popP = spring({
          frame: frame - staggerStart[i],
          fps,
          config: { damping: 12, mass: 0.7 },
        });
        const scale = interpolate(popP, [0, 1], [0.4, 1]);
        const opacity = interpolate(popP, [0, 1], [0, 1]);
        // Zig-zag kaynak noktası
        const slideX = interpolate(popP, [0, 1], [i % 2 ? 120 : -120, 0]);

        const src = videos[i];

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: w,
              height: h,
              transform: `translateX(${slideX}px) scale(${scale}) rotate(${p.rot}deg)`,
              opacity,
              borderRadius: 24,
              overflow: 'hidden',
              background: '#111',
              boxShadow: '0 30px 60px rgba(0,0,0,0.22), 0 10px 20px rgba(0,0,0,0.12)',
            }}
          >
            {src ? (
              <OffthreadVideo
                src={staticFile(src)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                muted
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.35)',
                  fontFamily: FONT,
                  fontSize: 24,
                }}
              >
                Video yakında
              </div>
            )}
          </div>
        );
      })}

      {/* SFX: her video popup için */}
      {staggerStart.map((s, i) => (
        <Sequence key={i} from={s} durationInFrames={15}>
          <Sfx name="pop" volume={0.6} />
        </Sequence>
      ))}
    </SceneTransition>
  );
};

// ============================================================
// SCENE 7 — Final CTA
// ============================================================
const Scene6Final: React.FC<{
  theme: Theme;
  duration: number;
}> = ({ theme, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoP = spring({ frame, fps, config: { damping: 18, mass: 1 } });
  const logoScale = interpolate(logoP, [0, 1], [0.85, 1]);
  const logoOpacity = interpolate(logoP, [0, 1], [0, 1]);

  return (
    <SceneTransition durationInFrames={duration}>
      <AbsoluteFill style={{ background: theme.bg }} />
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 800,
            height: 800,
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
          }}
        >
          <Img
            src={staticFile(theme.logoSrc)}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      </AbsoluteFill>
    </SceneTransition>
  );
};

// ============================================================
// MAIN COMPOSITION — 28s @ 30fps
// Scene 1: 0-60 (60)    Brand reveal
// Scene 2: 60-150 (90)  Tagline
// Scene 3: 150-270 (120) Categories
// Scene 4: 270-360 (90) Spheres
// Scene STATS: 360-480 (120) Counter
// Scene 5: 480-630 (150) Grid
// Scene 6: 630-840 (210) Final
// ============================================================
export const SkypeakReel: React.FC<SkypeakVariantProps> = (props) => {
  const { theme } = props;

  return (
    <AbsoluteFill style={{ background: theme.bg }}>

      <Sequence durationInFrames={120}>
        <Scene1BrandReveal
          introLabel={props.introLabel}
          theme={theme}
          duration={120}
        />
      </Sequence>
      <Sequence from={120} durationInFrames={90}>
        <Scene2Tagline tagline={props.tagline} theme={theme} duration={90} />
      </Sequence>
      <Sequence from={210} durationInFrames={180}>
        <Scene3Categories
          categories={props.categories}
          focusIndex={props.focusCategoryIndex}
          theme={theme}
          duration={180}
        />
      </Sequence>
      <Sequence from={390} durationInFrames={270}>
        <Scene5ClassGrid
          categories={props.categories}
          classImages={props.classImages}
          theme={theme}
          duration={270}
        />
      </Sequence>
      <Sequence from={660} durationInFrames={90}>
        <SceneMediaToggle theme={theme} duration={90} />
      </Sequence>
      <Sequence from={750} durationInFrames={180}>
        <SceneVideoShowcase
          videos={props.classVideos.slice(0, 2)}
          theme={theme}
          duration={180}
        />
      </Sequence>
      <Sequence from={920} durationInFrames={210}>
        <SceneVideoQuad
          videos={props.classVideos.slice(2, 6)}
          theme={theme}
          duration={210}
        />
      </Sequence>
      <Sequence from={1130} durationInFrames={150}>
        <Scene6Final theme={theme} duration={150} />
      </Sequence>

      {/* === SFX LAYER — animasyon/geçiş ses efektleri === */}
      {/* Scene 1 logo reveal */}
      <Sequence durationInFrames={30}>
        <Sfx name="rise" volume={0.7} />
      </Sequence>
      {/* Scene 1 intro pill (2. sn) */}
      <Sequence from={60} durationInFrames={20}>
        <Sfx name="pop" volume={0.5} />
      </Sequence>
      {/* Scene 2 tagline giriş */}
      <Sequence from={120} durationInFrames={25}>
        <Sfx name="whoosh" volume={0.5} />
      </Sequence>
      {/* Scene 3 kategori tick'leri (180f, 7 kategori) */}
      {Array.from({ length: 7 }).map((_, i) => (
        <Sequence
          key={`tick-${i}`}
          from={210 + i * Math.floor((180 - 30) / 7)}
          durationInFrames={10}
        >
          <Sfx name="tick" volume={0.35} />
        </Sequence>
      ))}
      {/* Scene 5 photo pops — faz 1 (10 stagger 7f, scene başlangıcı 390) */}
      {Array.from({ length: 10 }).map((_, i) => (
        <Sequence
          key={`pop1-${i}`}
          from={390 + i * 7}
          durationInFrames={12}
        >
          <Sfx name="pop" volume={0.4} />
        </Sequence>
      ))}
      {/* Scene 5 faz 2 pops (phase2Start=105 scene-local → 390+105=495) */}
      {Array.from({ length: 10 }).map((_, i) => (
        <Sequence
          key={`pop2-${i}`}
          from={495 + i * 7}
          durationInFrames={12}
        >
          <Sfx name="pop" volume={0.45} />
        </Sequence>
      ))}
      {/* Media toggle click (switchFrame=35 scene-local → 660+35=695) */}
      <Sequence from={695} durationInFrames={15}>
        <Sfx name="click" volume={0.7} />
      </Sequence>
      {/* Video dual split transition (splitStart=60 scene-local → 750+60=810) */}
      <Sequence from={810} durationInFrames={25}>
        <Sfx name="swoosh" volume={0.7} />
      </Sequence>
      {/* Video dual → quad geçiş */}
      <Sequence from={918} durationInFrames={18}>
        <Sfx name="whoosh" volume={0.6} />
      </Sequence>
      {/* Final logo reveal */}
      <Sequence from={1130} durationInFrames={30}>
        <Sfx name="impact" volume={0.7} />
      </Sequence>

      {/* Global grain overlay — en üstte (opacity=0 ise render etme) */}
      {theme.grainOpacity > 0 && <GrainOverlay opacity={theme.grainOpacity} />}
    </AbsoluteFill>
  );
};
