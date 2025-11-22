export type CRTVisualProps = {
  media: { type: 'image' | 'video'; src: string; alt: string }
}

const CRTVisual = ({ media }: CRTVisualProps) => (
  <div className="crt-screen relative w-full h-64 overflow-hidden border-2 border-neon shadow-[0_0_18px_rgba(255,0,255,0.25)]">
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
    <div className="pointer-events-none absolute inset-0 mix-blend-screen bg-[linear-gradient(rgba(255,255,255,0.02)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_2px] opacity-60" />
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,0,255,0.05),transparent_30%)]" />
  </div>
)

export default CRTVisual
