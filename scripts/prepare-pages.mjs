import { copyFile } from 'node:fs/promises'

// GitHub Pages serves this fallback for nested BrowserRouter URLs. Since the app
// uses a repository base path, the built index can also be served as 404.html.
await copyFile(new URL('../dist/index.html', import.meta.url), new URL('../dist/404.html', import.meta.url))
