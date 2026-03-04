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

  if (query && query.trim()) {
    return `https://www.google.com/maps?q=${encodeURIComponent(query.trim())}&z=${zoomLevel}&output=embed`;
  }

  if (typeof lat === "number" && typeof lng === "number") {
    return `https://www.google.com/maps?q=${lat},${lng}&z=${zoomLevel}&output=embed`;
  }

  return `https://www.google.com/maps?q=${encodeURIComponent("San Francisco, CA")}&z=${zoomLevel}&output=embed`;
}

export function Map(props: MapProps) {
  const iframeTitle = props.title || "Google Map";
  const iframeHeight = Math.max(180, Math.min(720, props.height ?? 320));
  const src = buildMapSrc(props);

  return (
    <div className="w-full min-w-80 overflow-hidden bg-muted/20">
      <iframe
        title={iframeTitle}
        src={src}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        className="block w-full border-0"
        style={{ height: iframeHeight }}
      />
    </div>
  );
}
