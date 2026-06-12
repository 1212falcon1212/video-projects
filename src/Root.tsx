import { Composition } from 'remotion';
import {
  SkypeakReel,
  SKYPEAK_VARIANT_DARK,
  SKYPEAK_VARIANT_LIGHT,
} from './SkypeakReel';
import { AtasehirAd, ATASEHIR_CONFIG } from './AtasehirAd';
import {
  IPAZARYERI_CONFIG,
  IPAZARYERI_REEL_DURATION,
  IpazaryeriReel,
} from './IpazaryeriReel';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SkypeakReel-Dark"
        component={SkypeakReel}
        durationInFrames={1280}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={SKYPEAK_VARIANT_DARK}
      />
      <Composition
        id="SkypeakReel-Light"
        component={SkypeakReel}
        durationInFrames={1280}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={SKYPEAK_VARIANT_LIGHT}
      />
      <Composition
        id="AtasehirAd"
        component={AtasehirAd}
        durationInFrames={510}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={ATASEHIR_CONFIG}
      />
      <Composition
        id="IpazaryeriReel"
        component={IpazaryeriReel}
        durationInFrames={IPAZARYERI_REEL_DURATION}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={IPAZARYERI_CONFIG}
      />
    </>
  );
};
