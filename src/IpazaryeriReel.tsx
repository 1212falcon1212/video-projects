import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  Img,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Montserrat';
import refStoresData from './refStores.json';

const { fontFamily: MONTSERRAT } = loadFont('normal', {
  weights: ['400', '600', '700', '800', '900'],
});

const FONT = `${MONTSERRAT}, -apple-system, "Inter", sans-serif`;

// ============================================================
// PALETTE — beyaz zemin + saf siyah + tek vurgu (i-Pazaryeri yeşili)
// ============================================================
const BRAND = {
  bg: '#FFFFFF',
  ink: '#0E1A14',
  inkSoft: 'rgba(14, 26, 20, 0.6)',
  muted: 'rgba(14, 26, 20, 0.2)',
  line: 'rgba(14, 26, 20, 0.1)',
  green: '#17865B',
  greenDeep: '#0F5C3E',
  greenSoft: '#E4F3EA',
};

// ============================================================
// REFERANS MAĞAZALAR — gerçek katalog ürünleriyle (refStores.json)
// scripts/build-stores.sh ile üretildi
// ============================================================
export type RefStore = {
  key: string;
  name: string;
  vertical: string;
  color: string;
  accent: string;
  text: string;
  logo: string | null;
  products: { img: string; name: string; price: string }[];
};
const REF_STORES = refStoresData as RefStore[];

const formatPrice = (p: string): string => {
  const n = Number(p);
  if (!isFinite(n)) return p;
  const [intPart, dec] = n.toFixed(2).split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${grouped},${dec} ₺`;
};

// ============================================================
// CONFIG — tüm metin tek yerde
// ============================================================
export type IpazaryeriConfig = {
  logoSrc: string;
  introPill: string;
  hookLine: string;
  hookAccent: string;
  needs: string[];
  needsPunch: string;
  showcaseEyebrow: string;
  models: { code: string; title: string; sub: string }[];
  wallTitle: string;
  integrationPills: string[];
  ctaLine: string;
  ctaButton: string;
  ctaSub: string;
};

export const IPAZARYERI_CONFIG: IpazaryeriConfig = {
  logoSrc: 'i-pazaryeri.png',
  introPill: 'B2B · B2C · C2C Ticaret Altyapısı',
  hookLine: 'Pazaryerinizi sıfırdan kurmayın.',
  hookAccent: 'sıfırdan',
  needs: [
    'B2B Pazaryeri',
    'B2C Pazaryeri',
    'C2C Pazaryeri',
    'ERP Entegrasyonu',
    'Sipariş Yönetimi',
    'Stok & Katalog',
    'Kargo Entegrasyonu',
    'Ödeme Altyapısı',
  ],
  needsPunch: 'Tek Platform',
  showcaseEyebrow: 'Tek altyapı, her sektör',
  models: [
    { code: 'B2B', title: 'Bayi & toptan satış', sub: 'Cari, fiyat listesi ve limit akışları' },
    { code: 'B2C', title: 'Markaya özel mağaza', sub: 'Katalog, sepet ve ödeme deneyimi' },
    { code: 'C2C', title: 'Çok satıcılı pazaryeri', sub: 'Satıcı, komisyon ve onay süreçleri' },
  ],
  wallTitle: 'Tek altyapı, dört sektör',
  integrationPills: ['ERP', 'Ödeme', 'Kargo', 'Multichannel'],
  ctaLine: 'Projenizi birlikte planlayalım',
  ctaButton: 'Teklif Al',
  ctaSub: 'B2B · B2C · C2C ticaret altyapısı',
};

// ============================================================
// TIMING — 870f / 29s @ 30fps
// ============================================================
const TOTAL_FRAMES = 870;

const TIMING = {
  brand: { from: 0, dur: 90 },
  hook: { from: 90, dur: 90 },
  needs: { from: 180, dur: 150 },
  showcase: { from: 330, dur: 210 },
  models: { from: 540, dur: 120 },
  wall: { from: 660, dur: 90 },
  cta: { from: 750, dur: 120 },
};

export const IPAZARYERI_REEL_DURATION = TOTAL_FRAMES;

// ============================================================
// EFFECT: Scene Transition (in/out fade + subtle scale)
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
    interpolate(inP, [0, 1], [1.04, 1]) * interpolate(outP, [0, 1], [1.04, 1]);

  return (
    <AbsoluteFill style={{ opacity, transform: `scale(${scale})` }}>
      {children}
    </AbsoluteFill>
  );
};

// ============================================================
// EFFECT: Animated Blob Background
// ============================================================
const BlobBackground: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const frame = useCurrentFrame();
  const blobs = [
    { color: BRAND.green, baseX: 280, baseY: 420, size: 720, phase: 0 },
    { color: BRAND.greenDeep, baseX: 800, baseY: 1120, size: 640, phase: 1.3 },
    { color: BRAND.ink, baseX: 420, baseY: 1640, size: 680, phase: 2.6 },
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
              filter: 'blur(90px)',
              opacity: 0.16 * intensity,
              mixBlendMode: 'multiply',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ============================================================
// EFFECT: Light Flare (green flash on cut)
// ============================================================
const LightFlare: React.FC<{ frame: number; at: number; color?: string }> = ({
  frame,
  at,
  color = BRAND.green,
}) => {
  const opacity = interpolate(frame, [at - 4, at, at + 6], [0, 0.55, 0], {
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
// EFFECT: Split Text (word-stagger reveal, optional accent word)
// ============================================================
const SplitText: React.FC<{
  text: string;
  style?: React.CSSProperties;
  startFrame?: number;
  stagger?: number;
  accentWord?: string;
}> = ({ text, style, startFrame = 0, stagger = 5, accentWord }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');
  const norm = (w: string) => w.replace(/[.,!?]/g, '');

  return (
    <div
      style={{
        ...style,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.28em',
        justifyContent: 'center',
      }}
    >
      {words.map((w, i) => {
        const p = spring({
          frame: frame - startFrame - i * stagger,
          fps,
          config: { damping: 20, mass: 0.8 },
        });
        const y = interpolate(p, [0, 1], [100, 0]);
        const opacity = interpolate(p, [0, 1], [0, 1]);
        const isAccent = accentWord && norm(w) === norm(accentWord);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${y}px)`,
              opacity,
              color: isAccent ? BRAND.green : undefined,
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
  variant?: 'primary' | 'soft';
  pulse?: boolean;
}> = ({ text, variant = 'primary', pulse }) => {
  const frame = useCurrentFrame();
  const pulseScale = pulse ? 1 + Math.sin(frame * 0.15) * 0.04 : 1;
  const pulseGlow = pulse ? 26 + Math.sin(frame * 0.15) * 16 : 0;

  const styles: React.CSSProperties =
    variant === 'primary'
      ? {
          background: BRAND.green,
          color: '#FFFFFF',
          boxShadow: pulse
            ? `0 0 ${pulseGlow}px ${BRAND.green}88, 0 18px 40px rgba(23,134,91,0.3)`
            : '0 18px 40px rgba(23,134,91,0.28)',
        }
      : {
          background: BRAND.greenSoft,
          color: BRAND.greenDeep,
          border: `1px solid ${BRAND.line}`,
        };

  return (
    <div
      style={{
        display: 'inline-block',
        padding: '14px 32px',
        borderRadius: 999,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 36,
        letterSpacing: -0.5,
        transform: `scale(${pulseScale})`,
        whiteSpace: 'nowrap',
        ...styles,
      }}
    >
      {text}
    </div>
  );
};

// ============================================================
// HELPER: image with graceful fallback
// ============================================================
const SafeImg: React.FC<{ src: string; style: React.CSSProperties }> = ({
  src,
  style,
}) => {
  const [failed, setFailed] = React.useState(false);
  if (failed) {
    return <div style={{ ...style, background: '#EEF2F0' }} />;
  }
  return <Img src={staticFile(src)} onError={() => setFailed(true)} style={style} />;
};

// ============================================================
// PHONE MOCKUP — iPhone frame + mobil mağaza vitrini
// ============================================================
const PHONE_W = 470;
const PHONE_H = 952;

const PhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      width: PHONE_W,
      height: PHONE_H,
      borderRadius: 62,
      background: '#0B0F0D',
      padding: 13,
      boxShadow: '0 50px 95px rgba(14,26,20,0.32), 0 18px 40px rgba(14,26,20,0.18)',
      position: 'relative',
    }}
  >
    {/* dynamic island */}
    <div
      style={{
        position: 'absolute',
        top: 30,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 128,
        height: 34,
        borderRadius: 999,
        background: '#0B0F0D',
        zIndex: 6,
      }}
    />
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 50,
        overflow: 'hidden',
        background: '#F4F6F5',
        position: 'relative',
      }}
    >
      {children}
    </div>
  </div>
);

const StoreScreen: React.FC<{ store: RefStore }> = ({ store }) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#F4F6F5',
        fontFamily: FONT,
      }}
    >
      {/* App bar */}
      <div style={{ background: store.color, color: store.text, padding: '58px 26px 22px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 21,
            fontWeight: 700,
            opacity: 0.92,
            marginBottom: 20,
          }}
        >
          <span>9:41</span>
          <span style={{ letterSpacing: 2 }}>5G ▮▮▮</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 52,
          }}
        >
          {/* menu */}
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 7h16M4 12h16M4 17h10"
              stroke={store.text}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
          {/* sepet */}
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6h15l-1.5 9h-12L6 6zM6 6L5 3H2"
              stroke={store.text}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="9" cy="20" r="1.6" fill={store.text} />
            <circle cx="18" cy="20" r="1.6" fill={store.text} />
          </svg>
        </div>
        <div
          style={{
            marginTop: 20,
            height: 64,
            borderRadius: 18,
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '0 22px',
            color: '#8A968F',
            fontSize: 25,
            fontWeight: 600,
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#8A968F" strokeWidth="2" />
            <path d="M21 21l-4-4" stroke="#8A968F" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Ürün ara...
        </div>
      </div>

      {/* category chips */}
      <div style={{ display: 'flex', gap: 10, padding: '18px 22px 6px' }}>
        {[store.vertical, 'Kampanya', 'Çok Satan'].map((c, i) => (
          <div
            key={c}
            style={{
              padding: '11px 18px',
              borderRadius: 999,
              fontSize: 21,
              fontWeight: 800,
              whiteSpace: 'nowrap',
              background: i === 0 ? `${store.accent}22` : '#FFFFFF',
              color: i === 0 ? store.color : BRAND.inkSoft,
              border: `1px solid ${i === 0 ? `${store.accent}55` : BRAND.line}`,
            }}
          >
            {c}
          </div>
        ))}
      </div>

      {/* product grid */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridAutoRows: '1fr',
          gap: 14,
          padding: '12px 22px 18px',
          overflow: 'hidden',
        }}
      >
        {store.products.slice(0, 4).map((p, i) => (
          <div
            key={i}
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 8px 22px rgba(14,26,20,0.07)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                height: 138,
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 12,
              }}
            >
              <SafeImg
                src={p.img}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>
            <div
              style={{
                padding: '10px 15px 14px',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: BRAND.ink,
                  lineHeight: 1.16,
                  height: 42,
                  overflow: 'hidden',
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 21,
                    fontWeight: 900,
                    color: store.color,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatPrice(p.price)}
                </span>
                <div
                  style={{
                    flexShrink: 0,
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: store.color,
                    color: store.text,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 27,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  +
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* bottom tab bar */}
      <div
        style={{
          height: 84,
          background: '#FFFFFF',
          borderTop: `1px solid ${BRAND.line}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 30px',
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: i === 0 ? store.color : 'rgba(14,26,20,0.14)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================================
// SCENE 1 — Brand Reveal
// ============================================================
const BrandScene: React.FC<{ config: IpazaryeriConfig; duration: number }> = ({
  config,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoP = spring({ frame, fps, config: { damping: 18, mass: 1 } });
  const logoScale = interpolate(logoP, [0, 1], [0.82, 1]);
  const logoOpacity = interpolate(logoP, [0, 1], [0, 1]);
  const push = interpolate(frame, [0, duration], [1, 1.06], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const pillP = spring({ frame: frame - 42, fps, config: { damping: 15 } });
  const pillY = interpolate(pillP, [0, 1], [56, 0]);
  const pillOpacity = interpolate(pillP, [0, 1], [0, 1]);

  return (
    <SceneTransition durationInFrames={duration}>
      <AbsoluteFill style={{ background: BRAND.bg }} />
      <BlobBackground intensity={0.5} />
      <AbsoluteFill
        style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}
      >
        <div
          style={{
            width: 760,
            height: 280,
            marginBottom: 56,
            transform: `scale(${logoScale * push})`,
            opacity: logoOpacity,
          }}
        >
          <Img
            src={staticFile(config.logoSrc)}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <div style={{ transform: `translateY(${pillY}px)`, opacity: pillOpacity }}>
          <Pill text={config.introPill} variant="primary" />
        </div>
      </AbsoluteFill>
      <LightFlare frame={frame} at={duration - 6} />
    </SceneTransition>
  );
};

// ============================================================
// SCENE 2 — Hook line
// ============================================================
const HookScene: React.FC<{ config: IpazaryeriConfig; duration: number }> = ({
  config,
  duration,
}) => {
  const frame = useCurrentFrame();
  return (
    <SceneTransition durationInFrames={duration}>
      <AbsoluteFill style={{ background: BRAND.bg }} />
      <BlobBackground intensity={0.35} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 70px' }}>
        <SplitText
          text={config.hookLine}
          accentWord={config.hookAccent}
          startFrame={0}
          stagger={6}
          style={{
            fontFamily: FONT,
            fontSize: 100,
            fontWeight: 900,
            color: BRAND.ink,
            letterSpacing: -3,
            textAlign: 'center',
            lineHeight: 1.04,
          }}
        />
      </AbsoluteFill>
      <LightFlare frame={frame} at={duration - 6} />
    </SceneTransition>
  );
};

// ============================================================
// SCENE 3 — Needs scroller → "Tek Platform"
// ============================================================
const NeedsScene: React.FC<{ config: IpazaryeriConfig; duration: number }> = ({
  config,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = config.needs;

  const revealStart = duration - 44;
  const scrollDur = revealStart - 6;

  const itemHeight = 150;
  const holdFrames = 18;
  const perItem = (scrollDur - holdFrames) / items.length;
  const rawIndex = Math.min(items.length - 1, frame / perItem);
  const targetIdx = Math.min(items.length - 1, Math.floor(rawIndex));
  const stepP = spring({
    frame: frame - targetIdx * perItem,
    fps,
    config: { damping: 16, mass: 0.6 },
  });
  const fromIdx = Math.max(0, targetIdx - 1);
  const lerpedIndex = fromIdx + (targetIdx - fromIdx) * stepP;
  const centerIndex = (items.length - 1) / 2;
  const offsetY = -(lerpedIndex - centerIndex) * itemHeight;

  const listOpacity = interpolate(
    frame,
    [revealStart, revealStart + 20],
    [1, 0.08],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const punchP = spring({
    frame: frame - revealStart - 4,
    fps,
    config: { damping: 16, mass: 0.8 },
  });

  return (
    <SceneTransition durationInFrames={duration}>
      <AbsoluteFill style={{ background: BRAND.bg, overflow: 'hidden' }} />
      <BlobBackground intensity={0.35} />

      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          top: '50%',
          height: itemHeight,
          transform: 'translateY(-50%)',
          border: `1px solid ${BRAND.green}33`,
          borderRadius: 18,
          background: `${BRAND.green}0a`,
          opacity: listOpacity,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          transform: `translateY(calc(-50% + ${offsetY}px))`,
          opacity: listOpacity,
        }}
      >
        {items.map((item, i) => {
          const distance = Math.abs(i - lerpedIndex);
          const isFocus = distance < 0.5;
          const opacity = interpolate(distance, [0, 1.5, 4], [1, 0.34, 0.1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const fontSize = interpolate(distance, [0, 1.5], [78, 48], {
            extrapolateRight: 'clamp',
          });
          const selectP = spring({
            frame: frame - i * perItem,
            fps,
            config: { damping: 14, mass: 0.6 },
          });
          const popScale = isFocus ? interpolate(selectP, [0, 1], [1.14, 1]) : 1;
          return (
            <div
              key={item}
              style={{
                height: itemHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONT,
                fontWeight: isFocus ? 900 : 600,
                fontSize,
                color: isFocus ? BRAND.ink : BRAND.muted,
                letterSpacing: -2,
                textShadow: isFocus ? `0 0 44px ${BRAND.green}55` : 'none',
                opacity,
                transform: `scale(${popScale})`,
              }}
            >
              {item}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 520,
          background: 'linear-gradient(180deg, #FFFFFF, rgba(255,255,255,0))',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 520,
          background: 'linear-gradient(0deg, #FFFFFF, rgba(255,255,255,0))',
          pointerEvents: 'none',
        }}
      />

      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            opacity: interpolate(punchP, [0, 1], [0, 1]),
            transform: `scale(${interpolate(punchP, [0, 1], [0.8, 1])})`,
            fontFamily: FONT,
            fontSize: 118,
            fontWeight: 900,
            letterSpacing: -3,
            color: BRAND.ink,
            textAlign: 'center',
          }}
        >
          {config.needsPunch.split(' ').map((w, i) => (
            <span key={w} style={{ color: i === 0 ? BRAND.green : BRAND.ink }}>
              {w}{' '}
            </span>
          ))}
        </div>
      </AbsoluteFill>

      <LightFlare frame={frame} at={revealStart} />
      <LightFlare frame={frame} at={duration - 6} />
    </SceneTransition>
  );
};

// ============================================================
// SCENE 4 — Store Showcase: tek telefon, 4 marka arası morph
// ============================================================
const StoreShowcaseScene: React.FC<{ config: IpazaryeriConfig; duration: number }> = ({
  config,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stores = REF_STORES;
  const n = stores.length;

  const introP = spring({ frame, fps, config: { damping: 20 } });
  const introScale = interpolate(introP, [0, 1], [0.9, 1]);
  const introOpacity = interpolate(introP, [0, 1], [0, 1]);
  const push = interpolate(frame, [0, duration], [1, 1.05], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const startHold = 16;
  const per = (duration - startHold) / n;
  const fadeF = 14;
  const local = Math.max(0, frame - startHold);
  const activeIdx = Math.min(n - 1, Math.floor(local / per));
  const capP = spring({
    frame: frame - startHold - activeIdx * per,
    fps,
    config: { damping: 15, mass: 0.7 },
  });

  const eyebrowP = spring({ frame: frame - 6, fps, config: { damping: 18 } });

  return (
    <SceneTransition durationInFrames={duration} outFrames={6}>
      <AbsoluteFill style={{ background: BRAND.bg }} />
      <BlobBackground intensity={0.4} />

      {/* eyebrow */}
      <div
        style={{
          position: 'absolute',
          top: 130,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: interpolate(eyebrowP, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(eyebrowP, [0, 1], [-24, 0])}px)`,
        }}
      >
        <Pill text={config.showcaseEyebrow} variant="soft" />
      </div>

      {/* morphing phone */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            position: 'relative',
            width: PHONE_W,
            height: PHONE_H,
            transform: `scale(${1.3 * introScale * push})`,
            opacity: introOpacity,
          }}
        >
          {stores.map((s, i) => {
            const inP = interpolate(
              frame,
              [startHold + i * per - fadeF, startHold + i * per],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );
            const outP =
              i === n - 1
                ? 1
                : interpolate(
                    frame,
                    [startHold + (i + 1) * per - fadeF, startHold + (i + 1) * per],
                    [1, 0],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                  );
            const op = Math.min(i === 0 ? 1 : inP, outP);
            if (op <= 0.001) return null;
            return (
              <div key={s.key} style={{ position: 'absolute', inset: 0, opacity: op }}>
                <PhoneFrame>
                  <StoreScreen store={s} />
                </PhoneFrame>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* caption — active store name + vertical */}
      <div
        style={{ position: 'absolute', left: 0, right: 0, bottom: 168, display: 'flex', justifyContent: 'center' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '18px 36px',
            borderRadius: 999,
            background: '#FFFFFF',
            border: `1px solid ${BRAND.line}`,
            boxShadow: '0 22px 54px rgba(14,26,20,0.16)',
            transform: `translateY(${interpolate(capP, [0, 1], [28, 0])}px) scale(${interpolate(
              capP,
              [0, 1],
              [0.85, 1]
            )})`,
            opacity: interpolate(capP, [0, 1], [0.2, 1]),
          }}
        >
          <div
            style={{ width: 24, height: 24, borderRadius: 999, background: stores[activeIdx].color }}
          />
          <div style={{ fontFamily: FONT, fontSize: 38, fontWeight: 800, color: BRAND.ink }}>
            {stores[activeIdx].vertical}
          </div>
        </div>
      </div>

      <LightFlare frame={frame} at={duration - 6} />
    </SceneTransition>
  );
};

// ============================================================
// SCENE 5 — Three business models (big type, clean)
// ============================================================
const ModelsScene: React.FC<{ config: IpazaryeriConfig; duration: number }> = ({
  config,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accents = [BRAND.green, BRAND.greenDeep, BRAND.ink];

  return (
    <SceneTransition durationInFrames={duration}>
      <AbsoluteFill style={{ background: BRAND.bg }} />
      <BlobBackground intensity={0.3} />
      <AbsoluteFill
        style={{ justifyContent: 'center', padding: '0 72px', flexDirection: 'column', gap: 34 }}
      >
        {config.models.map((m, i) => {
          const delay = 8 + i * 14;
          const p = spring({ frame: frame - delay, fps, config: { damping: 16, mass: 0.8 } });
          const opacity = interpolate(p, [0, 1], [0, 1]);
          const x = interpolate(p, [0, 1], [80, 0]);
          const lineW = interpolate(
            spring({ frame: frame - delay - 6, fps, config: { damping: 18 } }),
            [0, 1],
            [0, 1]
          );
          return (
            <div
              key={m.code}
              style={{
                opacity,
                transform: `translateX(${x}px)`,
                borderBottom: `1px solid ${BRAND.line}`,
                paddingBottom: 30,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 26 }}>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 120,
                    fontWeight: 900,
                    letterSpacing: -4,
                    color: accents[i],
                    lineHeight: 0.9,
                  }}
                >
                  {m.code}
                </div>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 44,
                    fontWeight: 800,
                    color: BRAND.ink,
                    letterSpacing: -1,
                  }}
                >
                  {m.title}
                </div>
              </div>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 30,
                  fontWeight: 600,
                  color: BRAND.inkSoft,
                  marginTop: 12,
                }}
              >
                {m.sub}
              </div>
              <div
                style={{
                  marginTop: 18,
                  height: 5,
                  borderRadius: 999,
                  width: `${lineW * 100}%`,
                  background: `linear-gradient(90deg, ${accents[i]}, ${accents[i]}00)`,
                }}
              />
            </div>
          );
        })}
      </AbsoluteFill>
      <LightFlare frame={frame} at={duration - 6} />
    </SceneTransition>
  );
};

// ============================================================
// SCENE 6 — Store Wall: 4 telefon birlikte + entegrasyon pill'leri
// ============================================================
const StoreWallScene: React.FC<{ config: IpazaryeriConfig; duration: number }> = ({
  config,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stores = REF_STORES;

  const scale = 0.72;
  const sW = PHONE_W * scale;
  const sH = PHONE_H * scale;
  const topY = 360;
  const rowGap = 26;
  const slots = [
    { x: 100, y: topY, rot: -4 },
    { x: 1080 - sW - 100, y: topY - 22, rot: 4 },
    { x: 132, y: topY + sH + rowGap, rot: 3 },
    { x: 1080 - sW - 132, y: topY + sH + rowGap - 22, rot: -4 },
  ];

  const titleP = spring({ frame: frame - 4, fps, config: { damping: 18 } });

  return (
    <SceneTransition durationInFrames={duration} inFrames={6}>
      <AbsoluteFill style={{ background: BRAND.bg }} />
      <BlobBackground intensity={0.3} />

      {/* heading + integration pills */}
      <div
        style={{
          position: 'absolute',
          top: 96,
          left: 72,
          right: 72,
          opacity: interpolate(titleP, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(titleP, [0, 1], [40, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 58,
            fontWeight: 900,
            letterSpacing: -2,
            color: BRAND.ink,
            marginBottom: 18,
          }}
        >
          {config.wallTitle}
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {config.integrationPills.map((label, i) => {
            const p = spring({ frame: frame - 14 - i * 5, fps, config: { damping: 15 } });
            return (
              <div
                key={label}
                style={{
                  opacity: interpolate(p, [0, 1], [0, 1]),
                  transform: `scale(${interpolate(p, [0, 1], [0.7, 1])})`,
                }}
              >
                <Pill text={label} variant="soft" />
              </div>
            );
          })}
        </div>
      </div>

      {stores.map((s, i) => {
        const slot = slots[i];
        const p = spring({ frame: frame - 16 - i * 8, fps, config: { damping: 13, mass: 0.7 } });
        const pop = interpolate(p, [0, 1], [0.55, 1]);
        const opacity = interpolate(p, [0, 1], [0, 1]);
        return (
          <div
            key={s.key}
            style={{
              position: 'absolute',
              left: slot.x,
              top: slot.y,
              width: sW,
              height: sH,
              transformOrigin: 'top left',
              transform: `scale(${scale * pop}) rotate(${slot.rot}deg)`,
              opacity,
            }}
          >
            <PhoneFrame>
              <StoreScreen store={s} />
            </PhoneFrame>
          </div>
        );
      })}

      <LightFlare frame={frame} at={duration - 6} />
    </SceneTransition>
  );
};

// ============================================================
// SCENE 7 — Final CTA
// ============================================================
const CtaScene: React.FC<{ config: IpazaryeriConfig; duration: number }> = ({
  config,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({ frame: frame - 6, fps, config: { damping: 18, mass: 1 } });
  const logoPush = interpolate(frame, [0, duration], [1, 1.05], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lineP = spring({ frame: frame - 30, fps, config: { damping: 18 } });
  const btnP = spring({ frame: frame - 52, fps, config: { damping: 15 } });
  const subP = spring({ frame: frame - 64, fps, config: { damping: 18 } });

  return (
    <SceneTransition durationInFrames={duration}>
      <AbsoluteFill style={{ background: BRAND.bg }} />
      <BlobBackground intensity={0.5} />
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          padding: '0 80px',
          gap: 40,
        }}
      >
        <div
          style={{
            width: 620,
            height: 230,
            transform: `scale(${interpolate(p, [0, 1], [0.85, 1]) * logoPush})`,
            opacity: interpolate(p, [0, 1], [0, 1]),
          }}
        >
          <Img
            src={staticFile(config.logoSrc)}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 60,
            fontWeight: 900,
            letterSpacing: -2,
            color: BRAND.ink,
            textAlign: 'center',
            lineHeight: 1.1,
            maxWidth: 860,
            opacity: interpolate(lineP, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(lineP, [0, 1], [40, 0])}px)`,
          }}
        >
          {config.ctaLine}
        </div>
        <div
          style={{
            opacity: interpolate(btnP, [0, 1], [0, 1]),
            transform: `scale(${interpolate(btnP, [0, 1], [0.85, 1])})`,
            marginTop: 8,
          }}
        >
          <Pill text={config.ctaButton} variant="primary" pulse />
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 30,
            fontWeight: 700,
            color: BRAND.inkSoft,
            opacity: interpolate(subP, [0, 1], [0, 1]),
          }}
        >
          {config.ctaSub}
        </div>
      </AbsoluteFill>
    </SceneTransition>
  );
};

// ============================================================
// MAIN COMPOSITION
// ============================================================
export const IpazaryeriReel: React.FC<IpazaryeriConfig> = (config) => {
  return (
    <AbsoluteFill style={{ background: BRAND.bg }}>
      <Sequence durationInFrames={TIMING.brand.dur}>
        <BrandScene config={config} duration={TIMING.brand.dur} />
      </Sequence>
      <Sequence from={TIMING.hook.from} durationInFrames={TIMING.hook.dur}>
        <HookScene config={config} duration={TIMING.hook.dur} />
      </Sequence>
      <Sequence from={TIMING.needs.from} durationInFrames={TIMING.needs.dur}>
        <NeedsScene config={config} duration={TIMING.needs.dur} />
      </Sequence>
      <Sequence from={TIMING.showcase.from} durationInFrames={TIMING.showcase.dur}>
        <StoreShowcaseScene config={config} duration={TIMING.showcase.dur} />
      </Sequence>
      <Sequence from={TIMING.models.from} durationInFrames={TIMING.models.dur}>
        <ModelsScene config={config} duration={TIMING.models.dur} />
      </Sequence>
      <Sequence from={TIMING.wall.from} durationInFrames={TIMING.wall.dur}>
        <StoreWallScene config={config} duration={TIMING.wall.dur} />
      </Sequence>
      <Sequence from={TIMING.cta.from} durationInFrames={TIMING.cta.dur}>
        <CtaScene config={config} duration={TIMING.cta.dur} />
      </Sequence>
    </AbsoluteFill>
  );
};
