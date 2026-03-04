type MapProps = {
  query?: string | null;
  lat?: number | null;
  lng?: number | null;
  zoom?: number | null;
  height?: number | null;
  title?: string | null;
};

function buildMapSrc({ query, lat, lng, zoom }: MapProps): string {
  const zoomLevel = Math.min(20, Math.max(1, Math.round(zoom ?? 12)));
  const buildGoogleEmbedUrl = (q: string) =>
    `https://www.google.com/maps?q=${encodeURIComponent(
      q
    )}&z=${zoomLevel}&output=embed`;

  if (query && query.trim()) {
    return buildGoogleEmbedUrl(query.trim());
  }

  if (typeof lat === "number" && typeof lng === "number") {
    return buildGoogleEmbedUrl(`${lat},${lng}`);
  }

  return buildGoogleEmbedUrl("San Francisco, CA");
}

export function Map(props: MapProps) {
  const iframeTitle = props.title || "Google Map";
  const src = buildMapSrc(props);

  return (
    <div className="w-full min-w-80 overflow-hidden bg-muted/20">
      <iframe
        title={iframeTitle}
        src={src}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        className="block w-full min-h-100 border-0"
      />
    </div>
  );
}
