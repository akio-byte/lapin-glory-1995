export type CRTVisualProps = {
  media: { type: 'image' | 'video'; src: string; alt: string }
}

const CRTVisual = ({ media }: CRTVisualProps) => (
  <div className="relative w-full h-64 bg-black border-2 border-neon rounded-sm overflow-hidden shadow-[0_0_15px_rgba(255,0,255,0.3)] mb-4">
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
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]" />
  </div>
)

export default CRTVisual
