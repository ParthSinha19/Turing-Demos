# TULIP — The Little Robot Who Wanted to Be Human

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
unzip tulip-source.zip
cd tulip-source
npm i
npm run dev
```

## Built with

Use Node.js 22 or newer, or Bun. Open the localhost address printed by the dev command. No API keys or external accounts are required for the game. Progress is saved in this browser.

Run `npm test` to check the maze and application routing. The ZIP contains source and configuration, not installed dependencies or generated build output.

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## GitHub Pages
Static SPA build (no server). Base path defaults to `/Turing-Demos/tulip/` (override with `VITE_BASE_PATH`). Build: `npm install && npm run build`; publish `dist/client/`. Three.js and Blockly are lazy-loaded to keep the first load light.
