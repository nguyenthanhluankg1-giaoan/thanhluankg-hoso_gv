// Utility to generate vibrant, attractive SVG avatars for students automatically
// based on name and gender, or selected preset icon.

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Background gradient pairs
const GRADIENTS = [
  { from: '#06b6d4', to: '#3b82f6', border: '#38bdf8' }, // Cyan -> Blue
  { from: '#f43f5e', to: '#ec4899', border: '#fb7185' }, // Rose -> Pink
  { from: '#10b981', to: '#059669', border: '#34d399' }, // Emerald
  { from: '#8b5cf6', to: '#6366f1', border: '#a78bfa' }, // Violet -> Indigo
  { from: '#f59e0b', to: '#ea580c', border: '#fbbf24' }, // Amber -> Orange
  { from: '#14b8a6', to: '#0d9488', border: '#2dd4bf' }, // Teal
  { from: '#ef4444', to: '#dc2626', border: '#f87171' }, // Red
  { from: '#6366f1', to: '#4f46e5', border: '#818cf8' }, // Indigo
];

// Presets list with cute vector avatar SVG representations
export interface PresetAvatarOption {
  id: string;
  name: string;
  category: 'Nam' | 'Nữ' | 'Thú cưng' | 'Khác';
  emoji: string;
  svgDataUrl: string;
}

// Function to generate an SVG data URL for a student character
export function generateStudentSvgDataUrl(name: string, gender: string = 'Nữ'): string {
  const hash = hashString(name || 'Học sinh');
  const gradient = GRADIENTS[hash % GRADIENTS.length];
  const isMale = gender.toLowerCase().includes('nam');

  // Character features based on hash
  const skinTone = ['#ffd7b5', '#f1c27d', '#e0ac69', '#ffdbac'][hash % 4];
  const hairColor = isMale 
    ? ['#2d3748', '#1e293b', '#78350f', '#451a03'][hash % 4]
    : ['#451a03', '#1e293b', '#92400e', '#854d0e'][hash % 4];

  const shirtColor = ['#38bdf8', '#fb7185', '#34d399', '#a78bfa', '#fbbf24', '#f43f5e'][hash % 6];
  const eyeColor = '#1e293b';

  // Hair style
  let hairPath = '';
  if (isMale) {
    const maleHairStyles = [
      `<path d="M 30 38 C 25 18, 55 12, 70 38 C 65 26, 35 24, 30 38 Z" fill="${hairColor}" />`, // Short spiky
      `<path d="M 28 42 C 22 20, 78 20, 72 42 Q 50 18 28 42 Z" fill="${hairColor}" />`, // Neat side sweep
      `<path d="M 25 45 Q 25 15 50 15 Q 75 15 75 45 Q 60 25 50 25 Q 40 25 25 45 Z" fill="${hairColor}" />` // Cap style
    ];
    hairPath = maleHairStyles[hash % maleHairStyles.length];
  } else {
    const femaleHairStyles = [
      // Pigtails / Twin tails
      `<g fill="${hairColor}">
        <circle cx="20" cy="40" r="12" />
        <circle cx="80" cy="40" r="12" />
        <path d="M 24 45 Q 24 18 50 18 Q 76 18 76 45 Q 50 22 24 45 Z" />
        <path d="M 18 38 C 10 50, 15 70, 22 65 C 24 55, 20 45, 18 38 Z" />
        <path d="M 82 38 C 90 50, 85 70, 78 65 C 76 55, 80 45, 82 38 Z" />
      </g>
      <circle cx="24" cy="42" r="4" fill="#f43f5e" />
      <circle cx="76" cy="42" r="4" fill="#f43f5e" />`,
      // Bob with headband
      `<g fill="${hairColor}">
        <path d="M 22 48 Q 22 18 50 18 Q 78 18 78 48 C 82 60, 78 72, 74 72 C 72 55, 75 35, 50 28 C 25 35, 28 55, 26 72 C 22 72, 18 60, 22 48 Z" />
      </g>
      <path d="M 24 36 Q 50 24 76 36" stroke="#fbbf24" stroke-width="5" stroke-linecap="round" fill="none" />`,
      // Long hair with bow
      `<g fill="${hairColor}">
        <path d="M 20 50 Q 20 18 50 18 Q 80 18 80 50 Q 82 78 72 80 C 70 60, 75 30, 50 25 C 25 30, 30 60, 28 80 C 18 78 20 50 20 50 Z" />
      </g>
      <path d="M 45 20 Q 50 16 55 20 Q 60 20 50 24 Q 40 20 45 20 Z" fill="#f43f5e" />`
    ];
    hairPath = femaleHairStyles[hash % femaleHairStyles.length];
  }

  // Cute cheeks
  const cheekColor = isMale ? '#fca5a5' : '#fda4af';

  // Accessories
  const accessoryIndex = hash % 5;
  let accessorySvg = '';
  if (accessoryIndex === 1) {
    // Smart glasses
    accessorySvg = `
      <circle cx="38" cy="48" r="8" fill="none" stroke="#1e293b" stroke-width="2.5" />
      <circle cx="62" cy="48" r="8" fill="none" stroke="#1e293b" stroke-width="2.5" />
      <line x1="46" y1="48" x2="54" y2="48" stroke="#1e293b" stroke-width="2.5" />
      <line x1="22" y1="46" x2="30" y2="47" stroke="#1e293b" stroke-width="2" />
      <line x1="78" y1="46" x2="70" y2="47" stroke="#1e293b" stroke-width="2" />
    `;
  } else if (accessoryIndex === 2) {
    // Cool star or crown
    accessorySvg = isMale
      ? `<path d="M 42 12 L 50 4 L 58 12 L 66 8 L 62 20 L 38 20 L 34 8 Z" fill="#fbbf24" stroke="#d97706" stroke-width="1.5" />`
      : `<path d="M 42 14 L 50 6 L 58 14 L 64 8 L 60 22 L 40 22 L 36 8 Z" fill="#fbbf24" stroke="#d97706" stroke-width="1.5" />`;
  } else if (accessoryIndex === 3) {
    // Headphones
    accessorySvg = `
      <path d="M 22 50 C 18 20, 82 20, 78 50" fill="none" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round" />
      <rect x="16" y="42" width="10" height="18" rx="4" fill="#0284c7" />
      <rect x="74" y="42" width="10" height="18" rx="4" fill="#0284c7" />
    `;
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="bgGrad_${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${gradient.from}" />
      <stop offset="100%" stop-color="${gradient.to}" />
    </linearGradient>
    <filter id="shadow_${hash}" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Background Circle -->
  <circle cx="50" cy="50" r="48" fill="url(#bgGrad_${hash})" stroke="${gradient.border}" stroke-width="3" />

  <!-- Body / Clothes -->
  <path d="M 20 95 C 20 70, 32 65, 50 65 C 68 65, 80 70, 80 95 Z" fill="${shirtColor}" />
  <!-- Collar / Shirt Detail -->
  <path d="M 42 65 L 50 76 L 58 65 Z" fill="#ffffff" opacity="0.9" />

  <!-- Neck -->
  <rect x="44" y="58" width="12" height="12" rx="3" fill="${skinTone}" />

  <!-- Head -->
  <circle cx="50" cy="46" r="22" fill="${skinTone}" filter="url(#shadow_${hash})" />

  <!-- Ears -->
  <circle cx="28" cy="48" r="5" fill="${skinTone}" />
  <circle cx="72" cy="48" r="5" fill="${skinTone}" />

  <!-- Hair -->
  ${hairPath}

  <!-- Eyes -->
  <ellipse cx="40" cy="46" rx="2.5" ry="3.5" fill="${eyeColor}" />
  <ellipse cx="60" cy="46" rx="2.5" ry="3.5" fill="${eyeColor}" />
  <!-- Eye highlights -->
  <circle cx="39" cy="44.5" r="1" fill="#ffffff" />
  <circle cx="59" cy="44.5" r="1" fill="#ffffff" />

  <!-- Cheeks -->
  <ellipse cx="36" cy="51" rx="3" ry="2" fill="${cheekColor}" opacity="0.6" />
  <ellipse cx="64" cy="51" rx="3" ry="2" fill="${cheekColor}" opacity="0.6" />

  <!-- Smile -->
  <path d="M 44 52 Q 50 58 56 52" fill="none" stroke="#1e293b" stroke-width="2" stroke-linecap="round" />

  <!-- Accessories -->
  ${accessorySvg}
</svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Preset Icon Avatars List
export const PRESET_AVATAR_ICONS: { id: string; label: string; gender: string; icon: string }[] = [
  { id: 'boy_cap', label: 'Nam Đội Mũ', gender: 'Nam', icon: '👦' },
  { id: 'girl_bow', label: 'Nữ Nơ Hồng', gender: 'Nữ', icon: '👧' },
  { id: 'boy_glasses', label: 'Nam Kính Tri Thức', gender: 'Nam', icon: '👓' },
  { id: 'girl_twintail', label: 'Nữ Tóc Cột', gender: 'Nữ', icon: '👩' },
  { id: 'super_boy', label: 'Siêu Nhân Nam', gender: 'Nam', icon: '🦸‍♂️' },
  { id: 'super_girl', label: 'Siêu Nhân Nữ', gender: 'Nữ', icon: '🦸‍♀️' },
  { id: 'gamer', label: 'Gamer Tai Nghe', gender: 'Nam', icon: '🎧' },
  { id: 'artist', label: 'Họa Sĩ Nhí', gender: 'Nữ', icon: '🎨' },
  { id: 'astronaut', label: 'Phi Hành Gia', gender: 'Khác', icon: '🚀' },
  { id: 'panda', label: 'Panda Thông Thái', gender: 'Khác', icon: '🐼' },
  { id: 'owl', label: 'Cú Học Tốt', gender: 'Khác', icon: '🦉' },
  { id: 'tiger', label: 'Hổ Năng Động', gender: 'Khác', icon: '🐯' },
  { id: 'fox', label: 'Cáo Nhanh Trí', gender: 'Khác', icon: '🦊' },
  { id: 'sports', label: 'Vận Động Viên', gender: 'Nam', icon: '⚽' },
  { id: 'music', label: 'Ca Sĩ Nhí', gender: 'Nữ', icon: '🎵' },
  { id: 'star', label: 'Ngôi Sao May Mắn', gender: 'Khác', icon: '🌟' },
];
