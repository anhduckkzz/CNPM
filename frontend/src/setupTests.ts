import '@testing-library/jest-dom/vitest';

// Provide a no-op scrollTo to avoid errors in jsdom when components call it
if (!window.scrollTo) {
  window.scrollTo = () => {};
}
