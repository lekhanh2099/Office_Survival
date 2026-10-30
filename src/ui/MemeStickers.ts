// High-quality, self-contained SVG Meme Stickers
// 100% offline-ready, zero external dependencies, never blocked by Giphy/CORS!

export function getMemeStickerSvg(id: string, width = '100%', height = '100%'): string {
  switch (id) {
    case 'bongo_typing':
      return `<svg viewBox="0 0 120 100" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="100" rx="10" fill="#fef08a"/>
        <!-- Table -->
        <rect x="10" y="70" width="100" height="24" rx="4" fill="#d97706"/>
        <!-- Keyboard -->
        <rect x="22" y="62" width="76" height="14" rx="3" fill="#1e293b"/>
        <circle cx="32" cy="69" r="2" fill="#38bdf8"/>
        <circle cx="42" cy="69" r="2" fill="#f43f5e"/>
        <circle cx="52" cy="69" r="2" fill="#a855f7"/>
        <circle cx="62" cy="69" r="2" fill="#22c55e"/>
        <circle cx="72" cy="69" r="2" fill="#fbbf24"/>
        <circle cx="82" cy="69" r="2" fill="#e2e8f0"/>
        <!-- Bongo Cat Head -->
        <path d="M 35,62 C 35,30 85,30 85,62 Z" fill="#ffffff" stroke="#17172b" stroke-width="3"/>
        <!-- Ears -->
        <polygon points="38,42 30,22 48,34" fill="#ffffff" stroke="#17172b" stroke-width="3"/>
        <polygon points="39,38 34,26 46,34" fill="#f472b6"/>
        <polygon points="82,42 90,22 72,34" fill="#ffffff" stroke="#17172b" stroke-width="3"/>
        <polygon points="81,38 86,26 74,34" fill="#f472b6"/>
        <!-- Eyes (Happy lines) -->
        <path d="M 46,45 Q 52,40 56,45" fill="none" stroke="#17172b" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 64,45 Q 68,40 74,45" fill="none" stroke="#17172b" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Mouth -->
        <path d="M 57,51 Q 60,54 63,51" fill="none" stroke="#17172b" stroke-width="2"/>
        <!-- Paws tapping -->
        <ellipse cx="40" cy="64" rx="8" ry="6" fill="#ffffff" stroke="#17172b" stroke-width="2.5"/>
        <ellipse cx="80" cy="64" rx="8" ry="6" fill="#ffffff" stroke="#17172b" stroke-width="2.5"/>
        <!-- Music notes -->
        <text x="14" y="26" font-size="14" fill="#ea580c" font-weight="bold">♪</text>
        <text x="96" y="24" font-size="16" fill="#8b5cf6" font-weight="bold">♫</text>
      </svg>`;

    case 'rage_smash':
    case 'printer_jam':
      return `<svg viewBox="0 0 120 100" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="100" rx="10" fill="#fee2e2"/>
        <!-- Spark lines -->
        <path d="M 15,20 L 25,32 M 105,20 L 95,32 M 60,10 L 60,24" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/>
        <!-- Keyboard breaking -->
        <rect x="20" y="66" width="38" height="14" rx="3" fill="#1e293b" transform="rotate(-8 39 73)"/>
        <rect x="62" y="66" width="38" height="14" rx="3" fill="#1e293b" transform="rotate(8 81 73)"/>
        <!-- Cat head (furious) -->
        <ellipse cx="60" cy="46" rx="28" ry="24" fill="#ffffff" stroke="#17172b" stroke-width="3"/>
        <!-- Ears -->
        <polygon points="38,34 26,16 48,26" fill="#ffffff" stroke="#17172b" stroke-width="3"/>
        <polygon points="82,34 94,16 72,26" fill="#ffffff" stroke="#17172b" stroke-width="3"/>
        <!-- Angry eyes -->
        <line x1="42" y1="38" x2="54" y2="44" stroke="#dc2626" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="78" y1="38" x2="66" y2="44" stroke="#dc2626" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="50" cy="45" r="3" fill="#17172b"/>
        <circle cx="70" cy="45" r="3" fill="#17172b"/>
        <!-- Screaming open mouth -->
        <ellipse cx="60" cy="56" rx="8" ry="7" fill="#dc2626"/>
        <!-- Slamming paws -->
        <ellipse cx="36" cy="62" rx="9" ry="7" fill="#ffffff" stroke="#17172b" stroke-width="2.5"/>
        <ellipse cx="84" cy="62" rx="9" ry="7" fill="#ffffff" stroke="#17172b" stroke-width="2.5"/>
        <text x="60" y="94" font-size="11" font-weight="900" fill="#dc2626" text-anchor="middle">💥 ĐẬP PHÍM!</text>
      </svg>`;

    case 'crying_pity':
      return `<svg viewBox="0 0 120 100" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="100" rx="10" fill="#f0f9ff"/>
        <!-- Cat Face -->
        <circle cx="56" cy="48" r="28" fill="#ffffff" stroke="#17172b" stroke-width="3"/>
        <!-- Ears -->
        <polygon points="36,32 26,14 46,24" fill="#ffffff" stroke="#17172b" stroke-width="3"/>
        <polygon points="76,32 86,14 66,24" fill="#ffffff" stroke="#17172b" stroke-width="3"/>
        <!-- Huge shiny teary eyes -->
        <ellipse cx="45" cy="45" rx="7" ry="9" fill="#38bdf8" stroke="#17172b" stroke-width="2"/>
        <circle cx="43" cy="42" r="3" fill="#ffffff"/>
        <circle cx="47" cy="48" r="1.5" fill="#ffffff"/>
        <ellipse cx="67" cy="45" rx="7" ry="9" fill="#38bdf8" stroke="#17172b" stroke-width="2"/>
        <circle cx="65" cy="42" r="3" fill="#ffffff"/>
        <circle cx="69" cy="48" r="1.5" fill="#ffffff"/>
        <!-- Tears streaming -->
        <path d="M 45,55 Q 43,68 45,78" stroke="#0284c7" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M 67,55 Q 69,68 67,78" stroke="#0284c7" stroke-width="3" fill="none" stroke-linecap="round"/>
        <!-- Sad mouth -->
        <path d="M 52,60 Q 56,56 60,60" fill="none" stroke="#17172b" stroke-width="2"/>
        <!-- Thumbs up paw -->
        <g transform="translate(86, 52)">
          <rect x="0" y="8" width="18" height="14" rx="5" fill="#ffffff" stroke="#17172b" stroke-width="2.5"/>
          <rect x="3" y="0" width="8" height="12" rx="4" fill="#ffffff" stroke="#17172b" stroke-width="2.5"/>
          <text x="9" y="32" font-size="14" text-anchor="middle">👍</text>
        </g>
      </svg>`;

    case 'huh_confused':
    case 'pointless_meeting':
      return `<svg viewBox="0 0 120 100" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="100" rx="10" fill="#f5f3ff"/>
        <!-- Cat Face -->
        <circle cx="54" cy="50" r="28" fill="#e2e8f0" stroke="#17172b" stroke-width="3"/>
        <!-- Ears -->
        <polygon points="34,32 24,14 44,24" fill="#e2e8f0" stroke="#17172b" stroke-width="3"/>
        <polygon points="74,32 84,14 64,24" fill="#e2e8f0" stroke="#17172b" stroke-width="3"/>
        <!-- Blank staring round eyes -->
        <circle cx="43" cy="46" r="6" fill="#ffffff" stroke="#17172b" stroke-width="2.5"/>
        <circle cx="43" cy="46" r="2.5" fill="#17172b"/>
        <circle cx="65" cy="46" r="6" fill="#ffffff" stroke="#17172b" stroke-width="2.5"/>
        <circle cx="65" cy="46" r="2.5" fill="#17172b"/>
        <!-- Confused small open mouth -->
        <circle cx="54" cy="58" r="3.5" fill="#17172b"/>
        <!-- Whiskers -->
        <line x1="28" y1="52" x2="16" y2="50" stroke="#17172b" stroke-width="2"/>
        <line x1="28" y1="56" x2="16" y2="58" stroke="#17172b" stroke-width="2"/>
        <!-- Floating question marks -->
        <text x="88" y="36" font-size="22" font-weight="900" fill="#7c3aed">?</text>
        <text x="100" y="56" font-size="16" font-weight="900" fill="#a855f7">?</text>
        <text x="12" y="38" font-size="18" font-weight="900" fill="#7c3aed">?</text>
      </svg>`;

    case 'boss_cat_suit':
    case 'urgent_slide':
      return `<svg viewBox="0 0 120 100" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="100" rx="10" fill="#e0f2fe"/>
        <!-- Cat Head -->
        <circle cx="60" cy="40" r="24" fill="#0f172a" stroke="#17172b" stroke-width="2.5"/>
        <polygon points="42,24 34,8 52,18" fill="#0f172a" stroke="#17172b" stroke-width="2.5"/>
        <polygon points="78,24 86,8 68,18" fill="#0f172a" stroke="#17172b" stroke-width="2.5"/>
        <!-- Sharp serious eyes -->
        <polygon points="48,36 56,38 52,42" fill="#fbbf24"/>
        <polygon points="72,36 64,38 68,42" fill="#fbbf24"/>
        <!-- Suit & Tie -->
        <path d="M 32,64 L 60,100 L 88,64 Z" fill="#1e3a8a" stroke="#17172b" stroke-width="2.5"/>
        <polygon points="54,64 66,64 60,78" fill="#ffffff"/>
        <!-- Red Tie -->
        <polygon points="58,72 62,72 64,96 60,100 56,96" fill="#dc2626"/>
        <text x="60" y="20" font-size="12" font-weight="900" fill="#1e3a8a" text-anchor="middle">👑 CEO</text>
      </svg>`;

    case 'smudge_blame':
    case 'boba_drama':
      return `<svg viewBox="0 0 120 100" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="100" rx="10" fill="#fef3c7"/>
        <!-- Dining Table -->
        <rect x="8" y="65" width="104" height="28" rx="4" fill="#b45309"/>
        <!-- Salad Plate -->
        <ellipse cx="60" cy="74" rx="24" ry="8" fill="#ffffff" stroke="#17172b" stroke-width="2"/>
        <circle cx="56" cy="73" r="3" fill="#22c55e"/>
        <circle cx="64" cy="74" r="2.5" fill="#16a34a"/>
        <!-- Smudge Cat Face -->
        <circle cx="60" cy="42" r="23" fill="#ffffff" stroke="#17172b" stroke-width="3"/>
        <polygon points="44,28 36,12 52,20" fill="#ffffff" stroke="#17172b" stroke-width="3"/>
        <polygon points="76,28 84,12 68,20" fill="#ffffff" stroke="#17172b" stroke-width="3"/>
        <!-- Confused squinting eyes -->
        <line x1="46" y1="38" x2="54" y2="42" stroke="#17172b" stroke-width="3" stroke-linecap="round"/>
        <line x1="74" y1="38" x2="66" y2="42" stroke="#17172b" stroke-width="3" stroke-linecap="round"/>
        <!-- Disgusted mouth -->
        <path d="M 54,48 Q 60,45 66,48" fill="none" stroke="#17172b" stroke-width="2.5"/>
        <text x="14" y="26" font-size="16">👉</text>
      </svg>`;

    case 'coffee_salt':
      return `<svg viewBox="0 0 120 100" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="100" rx="10" fill="#ecfdf5"/>
        <!-- Iced Coffee Cup -->
        <path d="M 44,40 L 48,84 Q 60,88 72,84 L 76,40 Z" fill="#78350f" stroke="#17172b" stroke-width="2.5"/>
        <!-- Foam top / Milk -->
        <rect x="42" y="34" width="36" height="10" rx="4" fill="#fef3c7" stroke="#17172b" stroke-width="2"/>
        <!-- Straw -->
        <line x1="62" y1="36" x2="72" y2="12" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>
        <!-- Cat Face sipping -->
        <circle cx="34" cy="38" r="18" fill="#ffffff" stroke="#17172b" stroke-width="2.5"/>
        <polygon points="22,26 16,12 30,18" fill="#ffffff" stroke="#17172b" stroke-width="2.5"/>
        <!-- Satisfied happy curved eyes -->
        <path d="M 26,36 Q 30,32 34,36" fill="none" stroke="#17172b" stroke-width="2" stroke-linecap="round"/>
        <!-- Sparkles -->
        <text x="86" y="32" font-size="14" fill="#10b981">✨</text>
        <text x="94" y="58" font-size="12" fill="#059669">⚡+2</text>
      </svg>`;

    case 'this_is_fine':
    case 'this_is_fine_burn':
    case 'wifi_outage':
      return `<svg viewBox="0 0 120 100" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="100" rx="10" fill="#fef2f2"/>
        <!-- Cartoon Flames -->
        <path d="M 8,90 Q 14,40 24,65 Q 32,25 44,70 Q 56,15 72,60 Q 86,20 98,68 Q 108,35 116,90 Z" fill="#f97316" opacity="0.85"/>
        <path d="M 16,90 Q 24,50 34,75 Q 48,35 60,80 Q 76,30 88,75 Q 100,50 110,90 Z" fill="#ef4444" opacity="0.75"/>
        <path d="M 24,90 Q 36,65 50,85 Q 64,55 78,85 Q 92,65 102,90 Z" fill="#fbbf24"/>
        <!-- Dog Head (Calm) -->
        <ellipse cx="60" cy="52" rx="20" ry="18" fill="#d97706" stroke="#17172b" stroke-width="2.5"/>
        <!-- Small Blue Hat -->
        <ellipse cx="60" cy="36" rx="14" ry="4" fill="#2563eb"/>
        <rect x="52" y="24" width="16" height="12" rx="2" fill="#2563eb" stroke="#17172b" stroke-width="1.5"/>
        <!-- Big Calm Eyes -->
        <circle cx="53" cy="50" r="5" fill="#ffffff" stroke="#17172b" stroke-width="1.5"/>
        <circle cx="53" cy="50" r="2" fill="#17172b"/>
        <circle cx="67" cy="50" r="5" fill="#ffffff" stroke="#17172b" stroke-width="1.5"/>
        <circle cx="67" cy="50" r="2" fill="#17172b"/>
        <!-- Slight Smile -->
        <path d="M 56,58 Q 60,61 64,58" fill="none" stroke="#17172b" stroke-width="2"/>
        <!-- Coffee Cup -->
        <rect x="76" y="60" width="14" height="12" rx="2" fill="#ffffff" stroke="#17172b" stroke-width="1.5"/>
        <text x="60" y="92" font-size="10" font-weight="900" fill="#7f1d1d" text-anchor="middle">THIS IS FINE</text>
      </svg>`;

    case 'money_cat':
    case 'money_flex':
      return `<svg viewBox="0 0 120 100" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="100" rx="10" fill="#ecfdf5"/>
        <!-- Floating Dollar Bills -->
        <rect x="12" y="18" width="28" height="14" rx="2" fill="#86efac" stroke="#15803d" stroke-width="1.5" transform="rotate(-15 26 25)"/>
        <rect x="80" y="16" width="28" height="14" rx="2" fill="#86efac" stroke="#15803d" stroke-width="1.5" transform="rotate(20 94 23)"/>
        <!-- Cat Face -->
        <circle cx="60" cy="52" r="25" fill="#ffffff" stroke="#17172b" stroke-width="2.5"/>
        <polygon points="42,34 32,16 50,24" fill="#ffffff" stroke="#17172b" stroke-width="2.5"/>
        <polygon points="78,34 88,16 70,24" fill="#ffffff" stroke="#17172b" stroke-width="2.5"/>
        <!-- Dollar eyes -->
        <text x="50" y="55" font-size="16" font-weight="900" fill="#16a34a" text-anchor="middle">$</text>
        <text x="70" y="55" font-size="16" font-weight="900" fill="#16a34a" text-anchor="middle">$</text>
        <!-- Grin -->
        <path d="M 52,64 Q 60,70 68,64" fill="none" stroke="#17172b" stroke-width="2.5"/>
        <!-- Stack of Money in Paws -->
        <rect x="42" y="70" width="36" height="18" rx="3" fill="#22c55e" stroke="#15803d" stroke-width="2"/>
        <text x="60" y="83" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">500.000 đ</text>
      </svg>`;

    case 'polite_smile':
      return `<svg viewBox="0 0 120 100" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="100" rx="10" fill="#fdf4ff"/>
        <!-- Cat Face -->
        <circle cx="60" cy="48" r="28" fill="#f8fafc" stroke="#17172b" stroke-width="3"/>
        <polygon points="38,30 28,12 48,22" fill="#f8fafc" stroke="#17172b" stroke-width="3"/>
        <polygon points="82,30 92,12 72,22" fill="#f8fafc" stroke="#17172b" stroke-width="3"/>
        <!-- Big Round Staring Eyes -->
        <circle cx="48" cy="42" r="5" fill="#17172b"/>
        <circle cx="72" cy="42" r="5" fill="#17172b"/>
        <!-- Awkward wide tight-lipped smile (Polite cat) -->
        <path d="M 40,58 Q 60,65 80,58" fill="#ffffff" stroke="#17172b" stroke-width="3" stroke-linecap="round"/>
        <line x1="38" y1="58" x2="42" y2="55" stroke="#17172b" stroke-width="2.5"/>
        <line x1="82" y1="58" x2="78" y2="55" stroke="#17172b" stroke-width="2.5"/>
        <text x="60" y="86" font-size="11" font-weight="800" fill="#a21caf" text-anchor="middle">DẠ EM ỔN...</text>
      </svg>`;

    case 'cat_nap':
      return `<svg viewBox="0 0 120 100" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="100" rx="10" fill="#f1f5f9"/>
        <!-- Curled sleeping cat -->
        <ellipse cx="60" cy="56" rx="34" ry="22" fill="#fdba74" stroke="#17172b" stroke-width="2.5"/>
        <!-- Tail wrapped -->
        <path d="M 94,56 Q 98,72 82,76" fill="none" stroke="#17172b" stroke-width="3" stroke-linecap="round"/>
        <!-- Sleeping Face -->
        <circle cx="42" cy="48" r="16" fill="#fdba74" stroke="#17172b" stroke-width="2"/>
        <polygon points="34,36 30,24 40,32" fill="#fdba74" stroke="#17172b" stroke-width="2"/>
        <!-- Sleeping closed eyes -->
        <path d="M 36,48 Q 40,52 44,48" fill="none" stroke="#17172b" stroke-width="2" stroke-linecap="round"/>
        <!-- ZZZ -->
        <text x="76" y="32" font-size="16" font-weight="900" fill="#3b82f6">Z</text>
        <text x="88" y="24" font-size="12" font-weight="900" fill="#60a5fa">z</text>
        <text x="96" y="16" font-size="9" font-weight="900" fill="#93c5fd">z</text>
      </svg>`;

    case 'matrix_refusal':
    case 'leave_slip_nuke':
      return `<svg viewBox="0 0 120 100" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="100" rx="10" fill="#f0fdf4"/>
        <!-- Shaking head motion lines -->
        <path d="M 18,48 Q 12,42 16,36 M 102,48 Q 108,42 104,36" stroke="#16a34a" stroke-width="3" stroke-linecap="round"/>
        <!-- Cool Cat Face with Sunglasses -->
        <circle cx="60" cy="48" r="26" fill="#ffffff" stroke="#17172b" stroke-width="3"/>
        <polygon points="40,30 30,14 48,22" fill="#ffffff" stroke="#17172b" stroke-width="3"/>
        <polygon points="80,30 90,14 72,22" fill="#ffffff" stroke="#17172b" stroke-width="3"/>
        <!-- Black Sunglasses -->
        <rect x="36" y="42" width="20" height="12" rx="3" fill="#0f172a"/>
        <rect x="64" y="42" width="20" height="12" rx="3" fill="#0f172a"/>
        <line x1="56" y1="46" x2="64" y2="46" stroke="#0f172a" stroke-width="3"/>
        <!-- Smug smirk -->
        <path d="M 56,60 Q 64,64 70,58" fill="none" stroke="#17172b" stroke-width="2.5" stroke-linecap="round"/>
        <text x="60" y="88" font-size="11" font-weight="900" fill="#15803d" text-anchor="middle">🛡️ TỪ CHỐI!</text>
      </svg>`;

    case 'pop_cat_eat':
      return `<svg viewBox="0 0 120 100" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="100" rx="10" fill="#fffbeb"/>
        <!-- Head -->
        <circle cx="60" cy="45" r="28" fill="#f8fafc" stroke="#17172b" stroke-width="3"/>
        <polygon points="38,26 28,8 48,18" fill="#f8fafc" stroke="#17172b" stroke-width="3"/>
        <polygon points="82,26 92,8 72,18" fill="#f8fafc" stroke="#17172b" stroke-width="3"/>
        <!-- Wide staring eyes -->
        <circle cx="48" cy="38" r="5" fill="#17172b"/>
        <circle cx="72" cy="38" r="5" fill="#17172b"/>
        <!-- HUGE POP CAT OPEN MOUTH -->
        <ellipse cx="60" cy="58" rx="16" ry="18" fill="#7f1d1d" stroke="#17172b" stroke-width="3"/>
        <ellipse cx="60" cy="64" rx="11" ry="8" fill="#f43f5e"/>
        <!-- Task paper being eaten -->
        <rect x="48" y="70" width="24" height="16" rx="2" fill="#ffffff" stroke="#17172b" stroke-width="1.5"/>
        <line x1="52" y1="74" x2="68" y2="74" stroke="#64748b" stroke-width="1.5"/>
        <text x="60" y="96" font-size="11" font-weight="900" fill="#d97706" text-anchor="middle">💥 POP CAT!</text>
      </svg>`;

    case 'panic_paperbag':
    case 'friday_5pm':
      return `<svg viewBox="0 0 120 100" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="100" rx="10" fill="#fef2f2"/>
        <!-- Sweating / shaking motion -->
        <path d="M 22,25 Q 16,35 22,45 M 98,25 Q 104,35 98,45" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="28" cy="22" r="3" fill="#38bdf8"/>
        <circle cx="92" cy="22" r="3" fill="#38bdf8"/>
        <!-- Head -->
        <circle cx="60" cy="42" r="26" fill="#f8fafc" stroke="#17172b" stroke-width="3"/>
        <polygon points="38,24 28,10 48,18" fill="#f8fafc" stroke="#17172b" stroke-width="3"/>
        <polygon points="82,24 92,10 72,18" fill="#f8fafc" stroke="#17172b" stroke-width="3"/>
        <!-- Panic spiral eyes -->
        <circle cx="48" cy="38" r="5" fill="#ef4444"/>
        <circle cx="48" cy="38" r="2" fill="#ffffff"/>
        <circle cx="72" cy="38" r="5" fill="#ef4444"/>
        <circle cx="72" cy="38" r="2" fill="#ffffff"/>
        <!-- Brown paper bag over snout -->
        <path d="M 44,48 L 76,48 L 72,82 L 48,82 Z" fill="#d97706" stroke="#17172b" stroke-width="2.5"/>
        <line x1="50" y1="56" x2="70" y2="56" stroke="#92400e" stroke-width="2"/>
        <line x1="52" y1="68" x2="68" y2="68" stroke="#92400e" stroke-width="2"/>
        <text x="60" y="94" font-size="10" font-weight="900" fill="#b91c1c" text-anchor="middle">PANIC MODE 17:55</text>
      </svg>`;

    case 'shocked_task':
    case 'surprise_kpi':
      return `<svg viewBox="0 0 120 100" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="100" rx="10" fill="#fef2f2"/>
        <!-- Lightning bolts -->
        <path d="M 20,20 L 28,32 L 24,36 L 34,48" stroke="#eab308" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M 100,20 L 92,32 L 96,36 L 86,48" stroke="#eab308" stroke-width="3" fill="none" stroke-linecap="round"/>
        <!-- Head -->
        <circle cx="60" cy="46" r="26" fill="#f8fafc" stroke="#17172b" stroke-width="3"/>
        <polygon points="38,28 26,12 48,20" fill="#f8fafc" stroke="#17172b" stroke-width="3"/>
        <polygon points="82,28 94,12 72,20" fill="#f8fafc" stroke="#17172b" stroke-width="3"/>
        <!-- Giant shocked round eyes with tiny pupils -->
        <circle cx="46" cy="40" r="9" fill="#ffffff" stroke="#17172b" stroke-width="2.5"/>
        <circle cx="46" cy="40" r="2.5" fill="#17172b"/>
        <circle cx="74" cy="40" r="9" fill="#ffffff" stroke="#17172b" stroke-width="2.5"/>
        <circle cx="74" cy="40" r="2.5" fill="#17172b"/>
        <!-- Open dropped jaw mouth -->
        <ellipse cx="60" cy="58" rx="8" ry="12" fill="#17172b"/>
        <!-- Paws on cheeks in shock (The Scream style) -->
        <ellipse cx="34" cy="52" rx="7" ry="10" fill="#ffffff" stroke="#17172b" stroke-width="2.5"/>
        <ellipse cx="86" cy="52" rx="7" ry="10" fill="#ffffff" stroke="#17172b" stroke-width="2.5"/>
        <text x="60" y="88" font-size="11" font-weight="900" fill="#dc2626" text-anchor="middle">😱 SỐC KPI!</text>
      </svg>`;

    case 'cat_party':
      return `<svg viewBox="0 0 120 100" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="100" rx="10" fill="#faf5ff"/>
        <!-- Disco lights / confetti -->
        <circle cx="20" cy="20" r="4" fill="#a855f7"/>
        <circle cx="100" cy="22" r="4" fill="#ec4899"/>
        <circle cx="30" cy="35" r="3" fill="#3b82f6"/>
        <circle cx="90" cy="38" r="3" fill="#eab308"/>
        <!-- Party Cat Head -->
        <circle cx="60" cy="50" r="25" fill="#f8fafc" stroke="#17172b" stroke-width="2.5"/>
        <polygon points="40,32 30,16 48,24" fill="#f8fafc" stroke="#17172b" stroke-width="2.5"/>
        <polygon points="80,32 90,16 72,24" fill="#f8fafc" stroke="#17172b" stroke-width="2.5"/>
        <!-- Party Cone Hat -->
        <polygon points="60,10 50,30 70,30" fill="#ec4899" stroke="#17172b" stroke-width="2"/>
        <circle cx="60" cy="9" r="3" fill="#fbbf24"/>
        <!-- Happy dance eyes -->
        <path d="M 48,46 Q 52,42 56,46" fill="none" stroke="#17172b" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 64,46 Q 68,42 72,46" fill="none" stroke="#17172b" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Smile -->
        <path d="M 54,55 Q 60,60 66,55" fill="none" stroke="#17172b" stroke-width="2"/>
        <!-- Raising paws party -->
        <ellipse cx="32" cy="36" rx="6" ry="8" fill="#ffffff" stroke="#17172b" stroke-width="2" transform="rotate(-30 32 36)"/>
        <ellipse cx="88" cy="36" rx="6" ry="8" fill="#ffffff" stroke="#17172b" stroke-width="2" transform="rotate(30 88 36)"/>
        <text x="60" y="88" font-size="11" font-weight="900" fill="#9333ea" text-anchor="middle">🎉 QUẨY LÊN!</text>
      </svg>`;

    default:
      // Fallback cute office cat sticker
      return `<svg viewBox="0 0 120 100" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="100" rx="10" fill="#faf5ff"/>
        <circle cx="60" cy="48" r="26" fill="#ffffff" stroke="#17172b" stroke-width="2.5"/>
        <polygon points="40,30 30,14 48,22" fill="#ffffff" stroke="#17172b" stroke-width="2.5"/>
        <polygon points="80,30 90,14 72,22" fill="#ffffff" stroke="#17172b" stroke-width="2.5"/>
        <circle cx="48" cy="44" r="4" fill="#17172b"/>
        <circle cx="72" cy="44" r="4" fill="#17172b"/>
        <path d="M 55,54 Q 60,58 65,54" fill="none" stroke="#17172b" stroke-width="2"/>
        <text x="60" y="88" font-size="11" font-weight="900" fill="#7c3aed" text-anchor="middle">✨ OFFICE CAT ✨</text>
      </svg>`;
  }
}
