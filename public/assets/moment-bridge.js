// Public bridge for React route changes: Vite serves the Taste Skill runtime as static files.
window.stuMarketMoments = {
  mount: async (element) => (await import(new URL('./moments/moments.js', import.meta.url))).mount(element),
}
