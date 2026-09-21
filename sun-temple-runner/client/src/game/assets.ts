const relicSvg = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#FF9F16"/><circle cx="32" cy="32" r="18" fill="#522200" opacity="0.35"/><path d="M32 8 L38 28 L32 24 L26 28 Z" fill="#FFD56A"/></svg>`,
);
const guardianSvg = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 4 L56 18 V42 L32 60 L8 42 V18 Z" fill="#0C8A83"/><circle cx="32" cy="30" r="10" fill="#FF7D00"/></svg>`,
);

export const assets = {
  relicEmblem: `data:image/svg+xml,${relicSvg}`,
  guardianEmblem: `data:image/svg+xml,${guardianSvg}`,
} as const;
