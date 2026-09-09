import crypto from "node:crypto";

// Polyfill globalThis.crypto for Node < 19/20 environments where WebCrypto is not globally attached
if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = crypto.webcrypto || crypto;
}
