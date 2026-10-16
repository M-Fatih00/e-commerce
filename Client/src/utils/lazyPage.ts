import { ComponentType, lazy } from "react";

const RELOAD_KEY = "chunk-reload-at";
const RELOAD_COOLDOWN_MS = 10_000;

const readLastReload = () => {
  try {
    return Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
  } catch {
    return 0;
  }
};

const markReload = () => {
  try {
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return;
  }
};

export const lazyPage = <T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) =>
  lazy(() =>
    factory().catch((error) => {
      if (Date.now() - readLastReload() > RELOAD_COOLDOWN_MS) {
        markReload();
        window.location.reload();
        return new Promise<never>(() => {});
      }
      throw error;
    }),
  );