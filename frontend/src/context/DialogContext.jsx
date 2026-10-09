import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const DialogContext = createContext(null);

let toastSeq = 0;

export function DialogProvider({ children }) {
  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const resolveRef = useRef(null);

  const closeModal = useCallback((result) => {
    const resolve = resolveRef.current;
    resolveRef.current = null;
    setModal(null);
    if (resolve) resolve(result);
  }, []);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setModal({
        kind: "confirm",
        title: options.title || "Xác nhận",
        message: options.message || "",
        confirmLabel: options.confirmLabel || "Xác nhận",
        cancelLabel: options.cancelLabel || "Huỷ",
        danger: Boolean(options.danger)
      });
    });
  }, []);

  const alert = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setModal({
        kind: "alert",
        title: options.title || "Thông báo",
        message: options.message || "",
        confirmLabel: options.confirmLabel || "Đã hiểu",
        variant: options.variant || "info"
      });
    });
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (options = {}) => {
      const id = ++toastSeq;
      const duration = options.duration ?? 3200;
      const item = {
        id,
        title: options.title || "",
        message: options.message || String(options),
        variant: options.variant || "info"
      };
      setToasts((list) => [...list, item].slice(-4));
      if (duration > 0) {
        window.setTimeout(() => dismissToast(id), duration);
      }
      return id;
    },
    [dismissToast]
  );

  useEffect(() => {
    if (!modal) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        closeModal(modal.kind === "confirm" ? false : true);
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [modal, closeModal]);

  const value = useMemo(() => ({ confirm, alert, toast }), [confirm, alert, toast]);

  return (
    <DialogContext.Provider value={value}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <>
            {modal && (
              <div
                className="ui-modal-root"
                role="presentation"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    closeModal(modal.kind === "confirm" ? false : true);
                  }
                }}
              >
                <div
                  className={`ui-modal ${modal.danger ? "danger" : ""} ${modal.variant ? `v-${modal.variant}` : ""}`}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="ui-modal-title"
                >
                  <p className="ui-modal-eyebrow">{modal.kind === "confirm" ? "Xác nhận thao tác" : "Thông báo"}</p>
                  <h2 id="ui-modal-title">{modal.title}</h2>
                  {modal.message && <p className="ui-modal-msg">{modal.message}</p>}
                  <div className="ui-modal-actions">
                    {modal.kind === "confirm" && (
                      <button type="button" className="btn btn-ghost" onClick={() => closeModal(false)}>
                        {modal.cancelLabel}
                      </button>
                    )}
                    <button
                      type="button"
                      className={`btn ${modal.danger ? "btn-danger" : ""}`}
                      autoFocus
                      onClick={() => closeModal(true)}
                    >
                      {modal.confirmLabel}
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="ui-toast-stack" aria-live="polite">
              {toasts.map((t) => (
                <div key={t.id} className={`ui-toast v-${t.variant}`} role="status">
                  <div className="ui-toast-body">
                    {t.title && <strong>{t.title}</strong>}
                    <span>{t.message}</span>
                  </div>
                  <button type="button" className="ui-toast-close" aria-label="Đóng" onClick={() => dismissToast(t.id)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          </>,
          document.body
        )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useDialog must be used within DialogProvider");
  }
  return ctx;
}
