import { useEffect, useRef, useState, useCallback } from "react";
import { CloseIcon, ExternalLinkIcon } from "./Icons";
import { storage } from "../utils/storage";
import { openExternal } from "../utils/platform";

export const DEFAULT_INVIDIOUS_BASE = "https://inv.nadeko.net";

const FALLBACK_INSTANCES = [
  "https://invidious.privacyredirect.com",
  "https://inv.tux.pizza",
  "https://yt.cdaut.de",
  "https://invidious.lunar.icu",
  "https://invidious.protokolla.fi",
  "https://invidious.nerdvpn.de",
  "https://iv.melmac.space",
  "https://invidious.perennialte.ch",
];

export function getInvidiousBase() {
  return (storage.get("invidiousBase") || DEFAULT_INVIDIOUS_BASE).replace(
    /\/$/,
    "",
  );
}

export default function TrailerModal({ trailerKey, title, onClose }) {
  const webviewRef = useRef(null);
  const [currentSrc, setCurrentSrc] = useState(null);
  const [statusMsg, setStatusMsg] = useState("Loading trailer…");
  const [failed, setFailed] = useState(false);
  const instanceIndexRef = useRef(-1);

  const tryNextInstance = useCallback(() => {
    const preferred = getInvidiousBase();
    const list = [
      preferred,
      ...FALLBACK_INSTANCES.filter((i) => i !== preferred),
    ];
    instanceIndexRef.current += 1;
    const idx = instanceIndexRef.current;
    if (idx >= list.length) {
      setFailed(true);
      setStatusMsg(
        "All Invidious instances failed. Try setting a custom instance in Settings.",
      );
      return;
    }
    const instance = list[idx];
    const label = instance.replace(/^https?:\/\//, "");
    setStatusMsg(idx === 0 ? "Loading trailer…" : `Trying ${label}…`);
    setCurrentSrc(`${instance}/embed/${trailerKey}?autoplay=1&listen=0`);
  }, [trailerKey]);

  useEffect(() => {
    instanceIndexRef.current = -1;
    tryNextInstance();
  }, [tryNextInstance]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Open current video on Invidious in system browser
  const openInBrowser = () => {
    const preferred = getInvidiousBase();
    const url = `${preferred}/watch?v=${trailerKey}`;
    openExternal(url);
  };

  // Bot-challenge detection, button hiding and auto-close-on-end all required
  // scripting the embedded page's DOM via webview.executeJavaScript, which
  // only works because Electron's webview runs the guest page in a renderer
  // the host can script even cross-origin. A standard iframe cannot be read
  // into or scripted from the parent page across origins, so the iframe here
  // just clears the loading spinner on load — if an instance shows a bot
  // challenge the user can "Try another source" or "Open in Browser" below.
  const handleIframeLoad = useCallback(() => setStatusMsg(null), []);

  return (
    <div className="trailer-overlay" onClick={onClose}>
      <div className="trailer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="trailer-modal-header">
          <span className="trailer-modal-title">
            🎬 {title} — Official Trailer
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {currentSrc && !failed && (
              <button
                onClick={tryNextInstance}
                title="Try another Invidious instance"
                className="trailer-openbrowser-btn"
              >
                Try another source
              </button>
            )}
            <button
              onClick={openInBrowser}
              title="Open in browser"
              className="trailer-openbrowser-btn"
            >
              <ExternalLinkIcon size={13} />
              Open in Browser
            </button>
            <button
              className="trailer-close-btn"
              onClick={onClose}
              title="Close"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
        <div
          className="trailer-embed-wrap"
          style={{ background: "#000", position: "relative" }}
        >
          {(statusMsg || failed) && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#000",
                color: failed ? "#ff3860" : "rgba(255,255,255,0.6)",
                fontSize: 14,
                textAlign: "center",
                padding: "0 32px",
                gap: 10,
              }}
            >
              {failed ? (
                <>
                  <span style={{ fontSize: 28 }}>⚠</span>
                  <span>{statusMsg}</span>
                </>
              ) : (
                <>
                  <span style={{ opacity: 0.5 }}>⏳</span>
                  <span>{statusMsg}</span>
                </>
              )}
            </div>
          )}

          {currentSrc && (
            <iframe
              ref={webviewRef}
              src={currentSrc}
              title="Trailer"
              allow="autoplay; encrypted-media; picture-in-picture"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={handleIframeLoad}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: "none",
                opacity: statusMsg ? 0 : 1,
                transition: "opacity 0.2s",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
