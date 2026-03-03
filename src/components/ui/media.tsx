type MediaProps = {
  url: string
  type: 'video' | 'audio'
  alt?: string
}

export function Media({ url, type, alt }: MediaProps) {
  if (type === 'audio') {
    return (
      <audio src={url} aria-label={alt ?? 'audio player'} controls preload='metadata' className='block w-full'>
        <track kind='captions' label='captions' />
      </audio>
    )
  }

  return (
    <video
      src={url}
      aria-label={alt ?? 'video player'}
      controls
      preload='metadata'
      className='block w-full rounded-md border border-border bg-black'
    >
      <track kind='captions' label='captions' />
    </video>
  )
}
