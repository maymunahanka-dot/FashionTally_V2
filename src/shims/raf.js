// Browser shim for the 'raf' polyfill package.
// In a browser environment, requestAnimationFrame is native.
export default (typeof window !== "undefined" && window.requestAnimationFrame)
  ? window.requestAnimationFrame.bind(window)
  : (cb) => setTimeout(cb, 1000 / 60);
