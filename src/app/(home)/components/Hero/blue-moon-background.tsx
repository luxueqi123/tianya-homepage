import { ViewportVideo } from '@/components/ui/viewport-video';

export function BlueMoonBackground() {
  return (
    <div aria-hidden className="hero-blue-moon pointer-events-none absolute inset-0 overflow-hidden">
      <div className="hero-blue-moon__poster" />
      <ViewportVideo
        className="hero-blue-moon__video hero-blue-moon__video--desktop"
        src="/videos/blue-moon-ocean-desktop.mp4"
        muted
        loop
        playsInline
        disablePictureInPicture
      />
      <ViewportVideo
        className="hero-blue-moon__video hero-blue-moon__video--mobile"
        src="/videos/blue-moon-ocean-mobile.mp4"
        muted
        loop
        playsInline
        disablePictureInPicture
      />
      <div className="hero-blue-moon__veil" />
    </div>
  );
}
