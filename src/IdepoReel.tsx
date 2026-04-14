import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';

// ============================================================
// BRAND TOKENS — tek yerden tüm varyantları kontrol et
// ============================================================
const BRAND = {
  bg: '#F5F2F0',
  charcoal: '#2C2C2C',
  rose: '#D4A5A5',
  cream: '#F0E5DC',
  mutedText: 'rgba(44, 44, 44, 0.25)',
};

const FONT = `-apple-system, "SF Pro Display", "Inter", system-ui, sans-serif`;

// ============================================================
// VARIANT CONFIG — 3 video için sadece burayı değiştir
// ============================================================
export type VariantProps = {
  brandName: string;
  tagline: string;              // 0:02 başlık
  introLabel: string;           // "Introducing"
  categories: string[];         // scroll listesi
  focusCategoryIndex: number;   // hangisi büyük/koyu
  metaphorLabel: string;        // 3 daire altı etiket
  ctaLabel: string;             // kapanış CTA
};

export const IDEPO_VARIANT: VariantProps = {
  brandName: 'i-depo',
  tagline: 'B2B Dermokozmetik',
  introLabel: 'Introducing',
  categories: [
    'Vitamin',
    'Anne & Bebek',
    'Saç Bakımı',
    'Güneş Koruma',
    'Dermokozmetik',
    'Cilt Bakımı',
    'Takviye',
  ],
  focusCategoryIndex: 4, // "Dermokozmetik"
  metaphorLabel: 'Güvenilir Eczane Ağı',
  ctaLabel: 'Eczacılara Özel',
};

// ============================================================
// HELPER: pill etiket (referans videodaki altyazı stili)
// ============================================================
const Pill: React.FC<{ text: string; dark?: boolean }> = ({ text, dark }) => (
  <div
    style={{
      display: 'inline-block',
      padding: '14px 32px',
      borderRadius: 999,
      background: dark ? 'rgba(44,44,44,0.85)' : BRAND.rose,
      color: '#fff',
      fontFamily: FONT,
      fontWeight: 600,
      fontSize: 38,
      letterSpacing: -0.5,
    }}
  >
    {text}
  </div>
);

// ============================================================
// SCENE 1 — Marka açılışı (0–2s, 60 frame)
// ============================================================
const Scene1BrandReveal: React.FC<{ brandName: string; introLabel: string }> = ({
  brandName,
  introLabel,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // harf harf typewriter
  const charsShown = Math.min(brandName.length, Math.floor(frame / 3));
  const visibleBrand = brandName.slice(0, charsShown);

  // pill 30. frame'de aşağıdan slide-up
  const pillProgress = spring({ frame: frame - 30, fps, config: { damping: 15 } });
  const pillY = interpolate(pillProgress, [0, 1], [60, 0]);
  const pillOpacity = interpolate(pillProgress, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        background: BRAND.bg,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 160,
          fontWeight: 800,
          color: BRAND.charcoal,
          letterSpacing: -6,
          marginBottom: 80,
        }}
      >
        {visibleBrand}
        <span style={{ opacity: frame % 20 < 10 ? 1 : 0 }}>|</span>
      </div>
      <div style={{ transform: `translateY(${pillY}px)`, opacity: pillOpacity }}>
        <Pill text={introLabel} dark />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 2 — Tagline (2–5s, 90 frame)
// ============================================================
const Scene2Tagline: React.FC<{ tagline: string }> = ({ tagline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame, fps, config: { damping: 20 } });
  const x = interpolate(progress, [0, 1], [300, 0]);
  const opacity = interpolate(progress, [0, 0.6], [0, 1]);
  const blur = interpolate(progress, [0, 1], [20, 0]);

  return (
    <AbsoluteFill
      style={{
        background: BRAND.bg,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 130,
          fontWeight: 800,
          color: BRAND.charcoal,
          letterSpacing: -4,
          textAlign: 'center',
          padding: '0 60px',
          transform: `translateX(${x}px)`,
          opacity,
          filter: `blur(${blur}px)`,
        }}
      >
        {tagline}
      </div>
      <div style={{ marginTop: 80, opacity: interpolate(frame, [40, 60], [0, 1]) }}>
        <Pill text={tagline} dark />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 3 — Kategori scroll (5–9s, 120 frame)
// ============================================================
const Scene3Categories: React.FC<{
  categories: string[];
  focusIndex: number;
}> = ({ categories, focusIndex }) => {
  const frame = useCurrentFrame();
  const itemHeight = 140;

  // scroll: ilk başta liste yukarıdan akar, sonra focus item ortaya gelip durur
  const scrollProgress = interpolate(frame, [0, 90], [0, 1], {
    easing: Easing.bezier(0.33, 1, 0.68, 1),
    extrapolateRight: 'clamp',
  });
  const offsetY = -focusIndex * itemHeight * scrollProgress;

  return (
    <AbsoluteFill style={{ background: BRAND.bg, overflow: 'hidden' }}>
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
          const isFocus = i === focusIndex && scrollProgress > 0.9;
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
                fontSize: isFocus ? 110 : 70,
                color: isFocus ? BRAND.charcoal : BRAND.mutedText,
                letterSpacing: -2,
                transition: 'all 0.3s ease',
              }}
            >
              {cat}
            </div>
          );
        })}
      </div>
      {scrollProgress > 0.95 && (
        <div
          style={{
            position: 'absolute',
            bottom: 180,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: interpolate(frame, [100, 115], [0, 1]),
          }}
        >
          <Pill text={categories[focusIndex]} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 4 — 3 renkli daire birleşme (9–12s, 90 frame)
// ============================================================
const Scene4Spheres: React.FC<{ label: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({ frame, fps, config: { damping: 18, mass: 1.2 } });

  // daireler dışarıdan merkeze yaklaşır
  const spread = interpolate(p, [0, 1], [400, 140]);

  const sphere = (color: string, angle: number) => {
    const rad = (angle * Math.PI) / 180;
    const x = Math.cos(rad) * spread;
    const y = Math.sin(rad) * spread;
    return (
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 520,
          height: 520,
          marginLeft: -260,
          marginTop: -260,
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${color}, ${color}00 70%)`,
          transform: `translate(${x}px, ${y}px)`,
          mixBlendMode: 'multiply',
          filter: 'blur(20px)',
        }}
      />
    );
  };

  return (
    <AbsoluteFill
      style={{
        background: BRAND.bg,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {sphere(BRAND.rose, 270)}
      {sphere(BRAND.charcoal, 30)}
      {sphere(BRAND.cream, 150)}
      <div
        style={{
          position: 'absolute',
          bottom: 200,
          opacity: interpolate(frame, [50, 75], [0, 1]),
        }}
      >
        <Pill text={label} dark />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 5 — Dashboard reveal (12–17s, 150 frame)
// ============================================================
const Scene5Dashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideUp = spring({ frame, fps, config: { damping: 22 } });
  const y = interpolate(slideUp, [0, 1], [800, 0]);
  const zoom = interpolate(frame, [30, 150], [1, 1.12]);

  return (
    <AbsoluteFill
      style={{
        background: BRAND.bg,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: 900,
          height: 1400,
          background: '#fff',
          borderRadius: 28,
          boxShadow: '0 40px 80px rgba(44,44,44,0.15)',
          transform: `translateY(${y}px) scale(${zoom})`,
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: 240,
            background: '#FAF7F5',
            padding: 30,
            fontFamily: FONT,
            fontSize: 20,
            color: BRAND.charcoal,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 40 }}>i-depo</div>
          {['Anasayfa', 'Ürünler', 'Siparişler', 'Eczaneler', 'Raporlar'].map((m, i) => (
            <div
              key={m}
              style={{
                padding: '14px 16px',
                marginBottom: 6,
                borderRadius: 10,
                background: i === 1 ? BRAND.rose : 'transparent',
                color: i === 1 ? '#fff' : BRAND.charcoal,
              }}
            >
              {m}
            </div>
          ))}
        </div>
        {/* Ana içerik */}
        <div style={{ flex: 1, padding: 40 }}>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 36,
              color: BRAND.charcoal,
              marginBottom: 30,
            }}
          >
            Dermokozmetik
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 20,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 260,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${
                    i % 2 ? BRAND.rose : BRAND.cream
                  }, #fff)`,
                  opacity: interpolate(frame, [40 + i * 8, 60 + i * 8], [0, 1]),
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 6 — Final CTA (17–24s, 210 frame)
// ============================================================
const Scene6Final: React.FC<{ brandName: string; ctaLabel: string }> = ({
  brandName,
  ctaLabel,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoP = spring({ frame: frame - 40, fps, config: { damping: 15 } });
  const logoScale = interpolate(logoP, [0, 1], [0.7, 1]);
  const logoOpacity = interpolate(logoP, [0, 1], [0, 1]);

  // Üç showcase frame stagger
  const frames = [
    { top: 200, left: 120, color: BRAND.charcoal },
    { top: 600, left: 400, color: BRAND.rose },
    { top: 1100, left: 180, color: '#8B6F5C' },
  ];

  return (
    <AbsoluteFill style={{ background: BRAND.bg }}>
      {frames.map((f, i) => {
        const p = spring({
          frame: frame - i * 8,
          fps,
          config: { damping: 20 },
        });
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: f.top,
              left: f.left,
              width: 560,
              height: 340,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${f.color}, ${f.color}88)`,
              opacity: interpolate(p, [0, 1], [0, 1]) * interpolate(frame, [100, 130], [1, 0.25]),
              transform: `scale(${interpolate(p, [0, 1], [0.85, 1])})`,
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
          />
        );
      })}

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          opacity: logoOpacity,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 180,
            fontWeight: 800,
            color: BRAND.charcoal,
            letterSpacing: -6,
            transform: `scale(${logoScale})`,
          }}
        >
          {brandName}
        </div>
        <div style={{ marginTop: 40 }}>
          <Pill text={ctaLabel} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================
// MAIN COMPOSITION — 24 saniye, 30fps, 1080x1920
// ============================================================
export const IdepoReel: React.FC<VariantProps> = (props) => {
  return (
    <AbsoluteFill style={{ background: BRAND.bg }}>
      <Sequence from={0} durationInFrames={60}>
        <Scene1BrandReveal brandName={props.brandName} introLabel={props.introLabel} />
      </Sequence>
      <Sequence from={60} durationInFrames={90}>
        <Scene2Tagline tagline={props.tagline} />
      </Sequence>
      <Sequence from={150} durationInFrames={120}>
        <Scene3Categories
          categories={props.categories}
          focusIndex={props.focusCategoryIndex}
        />
      </Sequence>
      <Sequence from={270} durationInFrames={90}>
        <Scene4Spheres label={props.metaphorLabel} />
      </Sequence>
      <Sequence from={360} durationInFrames={150}>
        <Scene5Dashboard />
      </Sequence>
      <Sequence from={510} durationInFrames={210}>
        <Scene6Final brandName={props.brandName} ctaLabel={props.ctaLabel} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ============================================================
// REMOTION ROOT — src/Root.tsx içinde bunu register et:
//
// import { Composition } from 'remotion';
// import { IdepoReel, IDEPO_VARIANT } from './IdepoReel';
//
// export const RemotionRoot = () => (
//   <Composition
//     id="IdepoReel"
//     component={IdepoReel}
//     durationInFrames={720}     // 24s × 30fps
//     fps={30}
//     width={1080}
//     height={1920}
//     defaultProps={IDEPO_VARIANT}
//   />
// );
// ============================================================
