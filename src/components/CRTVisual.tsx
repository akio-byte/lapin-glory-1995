export type CRTVisualProps = {
  media: { type: 'image' | 'video'; src: string; alt: string }
  isGlitching?: boolean
}

const CRTVisual = ({ media, isGlitching = false }: CRTVisualProps) => (
  <div
    className={`crt-screen relative w-full h-64 overflow-hidden border-2 border-neon shadow-[0_0_18px_rgba(255,0,255,0.25)] ${isGlitching ? 'glitch-frame' : ''}`}
  >
    {media.type === 'video' ? (
      <video
        className="w-full h-full object-cover opacity-80"
        src={media.src}
        aria-label={media.alt}
        autoPlay
        loop
        muted
        playsInline
      />
    ) : (
      <img className="w-full h-full object-cover opacity-80" src={media.src} alt={media.alt} />
    )}
    <div className="crt-static" />
    <div className="crt-scanline" />
    <div className="crt-glow" />
  </div>
)

export default CRTVisual
