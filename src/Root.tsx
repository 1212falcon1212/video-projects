import { Composition } from 'remotion';
import {
  SkypeakReel,
  SKYPEAK_VARIANT_DARK,
  SKYPEAK_VARIANT_LIGHT,
} from './SkypeakReel';

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
    </>
  );
};
