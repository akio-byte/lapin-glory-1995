import type { Event } from '../data/events'

type CRTVisualProps = {
  media: NonNullable<Event['media']>
}

const CRTVisual = ({ media }: CRTVisualProps) => {
  if (media.type === 'video') {
    return (
      <div className="crt-screen mb-4">
        <video
          className="w-full h-full object-cover"
          src={media.src}
          aria-label={media.alt}
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
    )
  }

  return (
    <div className="crt-screen mb-4">
      <img className="w-full h-full object-cover" src={media.src} alt={media.alt} />
    </div>
  )
}

export default CRTVisual
