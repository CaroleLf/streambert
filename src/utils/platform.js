export const APP_VERSION = "2.6.0";

export function openExternal(url) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function applyZoomFactor(factor) {
  document.documentElement.style.zoom = String(factor ?? 1);
}

export function showNotification({ title, body, silent } = {}) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }
  try {
    new Notification(title || "Streambert", { body, silent });
  } catch {}
}

const pipListeners = new Set();
let pipWindow = null;
let pipPoll = null;

function notifyPipClosed() {
  pipListeners.forEach((cb) => {
    try {
      cb();
    } catch {}
  });
}

export function openPipWindow(url) {
  closePipWindow({ silent: true });
  pipWindow = window.open(
    url,
    "streambert-pip",
    "popup=yes,width=960,height=540",
  );
  if (!pipWindow) return false;
  pipPoll = setInterval(() => {
    if (!pipWindow || pipWindow.closed) {
      closePipWindow({ silent: true });
      notifyPipClosed();
    }
  }, 400);
  return true;
}

export function closePipWindow({ silent } = {}) {
  if (pipPoll) {
    clearInterval(pipPoll);
    pipPoll = null;
  }
  if (pipWindow && !pipWindow.closed) {
    try {
      pipWindow.close();
    } catch {}
  }
  pipWindow = null;
  if (!silent) notifyPipClosed();
}

export function onPipClosed(cb) {
  pipListeners.add(cb);
  return () => pipListeners.delete(cb);
}
