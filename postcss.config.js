export default (ctx) => {
  // Check if the stylesheet belongs to a game subfolder or pre-compiled asset
  const normalizedFile = ctx.file ? ctx.file.replace(/\\/g, '/') : '';
  const isGameCss = normalizedFile && (
    normalizedFile.includes('zmrt-laab-Grf-Multiplayer') ||
    normalizedFile.includes('sun-temple-runner') ||
    normalizedFile.includes('slingshot') ||
    normalizedFile.includes('spell-caster') ||
    normalizedFile.includes('multiplayer-neon-snake') ||
    normalizedFile.includes('remix_-irbid-runner') ||
    normalizedFile.includes('classic-two-player-chess') ||
    normalizedFile.includes('snake-game_tcw') ||
    !normalizedFile.includes('/src/')
  );

  if (isGameCss) {
    return {
      plugins: [], // EXPLICITLY USE AN EMPTY ARRAY to disable all PostCSS plugins for game assets!
    };
  }

  return {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  };
};
