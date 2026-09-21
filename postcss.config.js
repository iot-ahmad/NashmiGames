export default (ctx) => {
  const file = ctx.file ? ctx.file.replace(/\\/g, '/') : '';
  const decodedFile = decodeURIComponent(file);

  // Check if the stylesheet belongs to a game subfolder or pre-compiled dist asset
  const isGameCss = (file || decodedFile) && (
    decodedFile.includes('zmrt-laab-Grf-Multiplayer') ||
    decodedFile.includes('sun-temple-runner') ||
    decodedFile.includes('slingshot') ||
    decodedFile.includes('spell-caster') ||
    decodedFile.includes('multiplayer-neon-snake') ||
    decodedFile.includes('remix_-irbid-runner') ||
    decodedFile.includes('classic-two-player-chess') ||
    decodedFile.includes('snake-game_tcw') ||
    decodedFile.includes('/artifacts/') ||
    decodedFile.includes('/dist/')
  );

  if (isGameCss) {
    return {
      plugins: [], // Disable PostCSS plugins for pre-compiled game assets
    };
  }

  return {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  };
};
