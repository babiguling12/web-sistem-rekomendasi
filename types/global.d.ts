export {};

declare global {
  interface Window {
    google: typeof google;
    googleMapsLoaded?: boolean;
  }
}