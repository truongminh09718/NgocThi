export {}

declare global {
  interface Window {
    stuMarketMoments?: {
      mount(element: HTMLElement): Promise<{ destroy?: () => void } | null>
    }
  }
}
