export default function PlayerEmbed({ embedRef, src, hidden, onLoad }) {
  return (
    <iframe
      ref={embedRef}
      src={src || "about:blank"}
      title="Streambert player"
      allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      onLoad={onLoad}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "none",
        outline: "none",
        boxShadow: "none",
        background: "#000",
        visibility: hidden ? "hidden" : "visible",
      }}
    />
  );
}
