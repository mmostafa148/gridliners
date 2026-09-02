import { mockApi } from "./mock";
import type { GridlinersApi } from "./services";
import { devTools } from "./store";

/**
 * The single swap point for the real backend.
 *
 * Screens import `api` and nothing else from this layer. When the HTTP client
 * lands it is assigned here, and no screen changes — every service keeps the
 * signatures declared in `./services`.
 */
export const api: GridlinersApi = mockApi;

/** Dev-only helpers: `api.__dev.reset()` reseeds from the fixtures. */
export const __dev = devTools;

export * from "./types";
export type * from "./services";
