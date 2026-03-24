/** Keep aligned with `pdfjs-dist` in package.json (runtime loads from CDN, not bundled). */
export const PDFJS_DIST_VERSION = "5.5.207";

const PDFJS_BASE = `https://unpkg.com/pdfjs-dist@${PDFJS_DIST_VERSION}/build`;

/**
 * Loads pdf.js in the browser without webpack bundling `pdf.mjs` (avoids
 * `Object.defineProperty called on non-object` when Next/webpack re-processes the pre-built bundle).
 */
export async function loadPdfJsFromCdn(): Promise<typeof import("pdfjs-dist")> {
  const pdfjs = await import(
    /* webpackIgnore: true */
    `${PDFJS_BASE}/pdf.min.mjs`
  );
  const mod = pdfjs as typeof import("pdfjs-dist");
  mod.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.mjs`;
  return mod;
}
