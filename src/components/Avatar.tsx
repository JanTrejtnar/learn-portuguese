import type { ComponentChildren } from 'preact';
import { HAIR_COLORS, SKINS, type Look, type ShopState } from '../lib/shop';

/**
 * Avatar z vrstev (SVG, viewBox 200×200): pozadí → tělo → vlasy vzadu → krk → hlava → vlasy vpředu →
 * pokrývka hlavy → doplněk. Všechno je vektorové, bez obrázků, takže se vejde do offline cache.
 */
export type Mood = 'happy' | 'neutral' | 'worried';

const NAVY = '#1f3a5f';
const GOLD = '#f5c518';
const GOLD_DARK = '#b8900e';
const RED = '#da291c';
const GREEN = '#046a38';

const Pattern = () => (
  <pattern id="av-azulejo" width="24" height="24" patternUnits="userSpaceOnUse">
    <rect width="24" height="24" fill="#f5f8fd" />
    <g fill="#2a4bb0">
      <circle cx="12" cy="12" r="3.2" />
      <ellipse cx="12" cy="5.5" rx="2.6" ry="4" />
      <ellipse cx="12" cy="18.5" rx="2.6" ry="4" />
      <ellipse cx="5.5" cy="12" rx="4" ry="2.6" />
      <ellipse cx="18.5" cy="12" rx="4" ry="2.6" />
      <path d="M0 0l3 0-3 3zM24 0l-3 0 3 3zM0 24l3 0-3-3zM24 24l-3 0 3-3z" />
    </g>
    <circle cx="12" cy="12" r="1.4" fill="#f5f8fd" />
  </pattern>
);

const Houses = ({ xs, y, roof }: { xs: number[]; y: number; roof: string }) => (
  <g>
    {xs.map((x, i) => (
      <g key={x}>
        <rect x={x} y={y - 18 - (i % 2) * 6} width="22" height={18 + (i % 2) * 6 + 12} fill={['#f5e6c8', '#f0d3a5', '#e8c9a0'][i % 3]} />
        <path d={`M${x - 2} ${y - 18 - (i % 2) * 6} L${x + 11} ${y - 28 - (i % 2) * 6} L${x + 24} ${y - 18 - (i % 2) * 6} Z`} fill={roof} />
        <rect x={x + 5} y={y - 8} width="4" height="6" fill="#7a5a3a" opacity=".55" />
        <rect x={x + 13} y={y - 8} width="4" height="6" fill="#7a5a3a" opacity=".55" />
      </g>
    ))}
  </g>
);

const stars: [number, number, number][] = [[24, 30, 1.4], [52, 18, 1], [78, 40, 1.2], [112, 22, 1.5], [140, 36, 1], [176, 24, 1.3], [188, 62, 1], [14, 66, 1.1], [96, 58, 0.9], [160, 76, 1]];

const Background = ({ id }: { id?: string }) => {
  switch (id) {
    case 'bg-lisboa':
      return (
        <g>
          <defs><linearGradient id="av-lisboa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fcdee" /><stop offset="1" stop-color="#fde6c3" /></linearGradient></defs>
          <rect width="200" height="200" fill="url(#av-lisboa)" />
          <circle cx="150" cy="46" r="16" fill="#fff4b8" />
          <rect y="124" width="200" height="76" fill="#4f9fc4" />
          <path d="M0 140h200M20 152h160M0 166h200" stroke="#fff" stroke-opacity=".28" stroke-width="2" />
          <Houses xs={[-6, 18, 42]} y={126} roof="#c8553d" />
          <Houses xs={[142, 166, 188]} y={126} roof="#d9774c" />
          <g transform="translate(6 100)">
            <rect width="54" height="28" rx="5" fill="#f2c230" />
            <rect x="5" y="5" width="44" height="10" rx="2" fill="#35465a" />
            <path d="M18 5v10M31 5v10" stroke="#f2c230" stroke-width="2" />
            <rect y="19" width="54" height="3" fill="#fff" opacity=".8" />
            <circle cx="12" cy="29" r="3.5" fill="#333" /><circle cx="42" cy="29" r="3.5" fill="#333" />
            <path d="M27 0v-10l12-8" stroke="#555" stroke-width="1.6" fill="none" />
          </g>
        </g>
      );
    case 'bg-porto':
      return (
        <g>
          <defs><linearGradient id="av-porto" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#355c7d" /><stop offset=".55" stop-color="#c06c84" /><stop offset="1" stop-color="#f7b267" /></linearGradient></defs>
          <rect width="200" height="200" fill="url(#av-porto)" />
          <circle cx="40" cy="104" r="14" fill="#ffd89b" opacity=".9" />
          <path d="M-10 128 Q100 30 210 128" stroke="#262b36" stroke-width="5" fill="none" />
          <path d="M-10 130H210" stroke="#262b36" stroke-width="4" />
          <path d="M30 108v22M55 94v36M80 86v44M100 84v46M120 86v44M145 94v36M170 108v22" stroke="#262b36" stroke-width="1.6" />
          <rect y="136" width="200" height="64" fill="#274c77" />
          <path d="M0 150h200M10 164h180M0 180h200" stroke="#f7b267" stroke-opacity=".35" stroke-width="2" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect key={i} x={i * 26 + 2} y={124 + (i % 3) * 3} width="20" height={14 - (i % 3) * 3} fill={['#e76f51', '#f4a261', '#e9c46a', '#2a9d8f'][i % 4]} />
          ))}
        </g>
      );
    case 'bg-algarve':
      return (
        <g>
          <defs>
            <linearGradient id="av-algarve" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fcbf0" /><stop offset="1" stop-color="#e9f8ff" /></linearGradient>
            <linearGradient id="av-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#27b0cf" /><stop offset="1" stop-color="#17789c" /></linearGradient>
          </defs>
          <rect width="200" height="200" fill="url(#av-algarve)" />
          <circle cx="42" cy="46" r="18" fill="#ffe27a" />
          <rect y="112" width="200" height="88" fill="url(#av-sea)" />
          <path d="M10 130h22M60 142h26M30 160h20M120 150h24M70 176h30" stroke="#fff" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round" />
          <path d="M136 200V108Q158 88 200 94V200Z" fill="#e5b567" />
          <path d="M140 130h60M140 150h60M140 170h60" stroke="#c98f44" stroke-width="3" />
          <path d="M146 200Q158 150 178 200Z" fill="#17789c" />
        </g>
      );
    case 'bg-azulejo':
      return (
        <g>
          <defs><Pattern /></defs>
          <rect width="200" height="200" fill="url(#av-azulejo)" />
        </g>
      );
    case 'bg-noite':
      return (
        <g>
          <defs><linearGradient id="av-noite" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1236" /><stop offset="1" stop-color="#34408a" /></linearGradient></defs>
          <rect width="200" height="200" fill="url(#av-noite)" />
          {stars.map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#fff" opacity=".9" />)}
          <circle cx="150" cy="48" r="15" fill="#fff6c9" />
          <circle cx="158" cy="42" r="13" fill="#161d4d" />
          <path d="M0 130L18 112l12 10 14-22 14 20 14-8 16 14 12-14 18 12 14-16 16 16 22-8V200H0Z" fill="#141a44" />
          {[[22, 124], [48, 118], [72, 126], [104, 120], [132, 126], [160, 120], [182, 128]].map(([x, y]) => <rect key={`${x}`} x={x} y={y} width="3" height="4" fill="#ffd966" />)}
        </g>
      );
    default:
      return (
        <g>
          <defs><linearGradient id="av-default" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8f1e0" /><stop offset="1" stop-color="#a9dcbb" /></linearGradient></defs>
          <rect width="200" height="200" fill="url(#av-default)" />
          <circle cx="160" cy="40" r="26" fill="#fff" opacity=".35" />
        </g>
      );
  }
};

const TORSO = 'M12 200C18 164 52 146 100 146C148 146 182 164 188 200Z';

/** Tělo (pod krkem) a „přes krk“ (límec, košile). */
const Top = ({ id }: { id?: string }): { base: ComponentChildren; over: ComponentChildren } => {
  switch (id) {
    case 'top-camisola':
      return {
        base: (
          <g>
            <path d={TORSO} fill={RED} />
            <path d="M12 200C14 182 26 168 40 160L52 200Z" fill={GREEN} opacity=".9" />
            <path d="M188 200C186 182 174 168 160 160L148 200Z" fill={GREEN} opacity=".9" />
            <circle cx="132" cy="178" r="8" fill={GOLD} stroke={GOLD_DARK} stroke-width="1.5" />
            <circle cx="132" cy="178" r="4" fill={RED} />
          </g>
        ),
        over: <path d="M82 148L100 172L118 148L126 152L100 184L74 152Z" fill={GREEN} />,
      };
    case 'top-marinheiro':
      return {
        base: (
          <g>
            <clipPath id="av-torso"><path d={TORSO} /></clipPath>
            <path d={TORSO} fill="#f4f1e8" />
            <g clip-path="url(#av-torso)" fill={NAVY}>
              {[156, 168, 180, 192].map((y) => <rect key={y} x="0" y={y} width="200" height="6" />)}
            </g>
          </g>
        ),
        over: <path d="M84 148Q100 166 116 148" stroke={NAVY} stroke-width="3" fill="none" />,
      };
    case 'top-fado':
      return {
        base: (
          <g>
            <path d={TORSO} fill="#1c1b22" />
            <path d="M40 160L100 196L160 160" stroke="#34323f" stroke-width="10" fill="none" stroke-linejoin="round" />
            <path d="M16 192h20M164 192h20M24 180h18M158 180h18" stroke="#34323f" stroke-width="2" stroke-dasharray="2 3" />
          </g>
        ),
        over: (
          <g>
            <path d="M78 150L100 176L122 150L130 156L100 190L70 156Z" fill="#2a2833" />
            <circle cx="100" cy="178" r="5.5" fill={GOLD} stroke={GOLD_DARK} stroke-width="1.2" />
            <circle cx="100" cy="178" r="2" fill={RED} />
          </g>
        ),
      };
    case 'top-sako':
      return {
        base: <path d={TORSO} fill="#243659" />,
        over: (
          <g>
            <path d="M84 146L100 202L116 146L100 160Z" fill="#f7f7f2" />
            <path d="M84 146L92 160L86 164Z M116 146L108 160L114 164Z" fill="#fff" />
            <path d="M78 150L96 184L84 202L62 168Z M122 150L104 184L116 202L138 168Z" fill="#2e456f" />
            <path d="M98 164h4l3 8h-10z M97 172h6l3 30h-12z" fill={RED} />
          </g>
        ),
      };
    case 'top-azulejo':
      return {
        base: (
          <g>
            <defs><Pattern /></defs>
            <path d={TORSO} fill="url(#av-azulejo)" stroke="#2a4bb0" stroke-width="3" />
          </g>
        ),
        over: <path d="M84 148Q100 166 116 148" stroke="#2a4bb0" stroke-width="4" fill="none" />,
      };
    default:
      return {
        base: (
          <g>
            <path d={TORSO} fill={GREEN} />
            <path d="M12 200C18 164 52 146 100 146" stroke="#fff" stroke-opacity=".12" stroke-width="6" fill="none" />
          </g>
        ),
        over: <path d="M84 148Q100 166 116 148" stroke="#03532b" stroke-width="3.5" fill="none" />,
      };
  }
};

const HairBack = ({ style, color }: { style: Look['hair']; color: string }) =>
  style === 'long' ? <path d="M63 88C52 128 54 158 70 174H130C146 158 148 128 137 88Z" fill={color} /> : null;

const CURLS = Array.from({ length: 11 }, (_, i) => {
  const a = (Math.PI * (200 - i * 22)) / 180;
  return [100 + 41 * Math.cos(a), 88 - 40 * Math.sin(a)] as const;
});

const HairFront = ({ style, color, hat }: { style: Look['hair']; color: string; hat: boolean }) => {
  if (style === 'none') return null;
  // pod pokrývkou hlavy jsou vlasy nižší, aby nevykukovaly nad ní
  const cap = hat
    ? <path d="M66 94C62 66 84 60 102 60C122 60 140 66 134 94C130 80 120 70 102 70C84 70 72 80 66 94Z" fill={color} />
    : <path d="M66 94C58 52 86 42 102 42C122 42 144 54 134 94C130 76 120 66 102 66C84 66 72 76 66 94Z" fill={color} />;
  if (style === 'curly')
    return (
      <g fill={color}>
        <ellipse cx="100" cy="72" rx="35" ry="21" />
        {CURLS.map(([x, y]) => <circle key={`${x}`} cx={x} cy={y} r="13" />)}
      </g>
    );
  if (style === 'bun')
    return (
      <g fill={color}>
        {!hat && <circle cx="100" cy="38" r="14" />}
        {cap}
      </g>
    );
  return cap;
};

const Hat = ({ id }: { id?: string }) => {
  switch (id) {
    case 'hat-bone':
      return (
        <g>
          <path d="M63 78C60 38 140 38 137 78Z" fill={GREEN} />
          <path d="M100 42V78" stroke="#03532b" stroke-width="1.5" />
          <circle cx="100" cy="42" r="3.4" fill={RED} />
          <path d="M58 78Q100 64 142 78Q152 86 132 88Q100 80 68 88Q48 86 58 78Z" fill={RED} />
        </g>
      );
    case 'hat-boina':
      return (
        <g transform="rotate(-8 100 60)">
          <ellipse cx="100" cy="60" rx="40" ry="16" fill="#7c1d2c" />
          <path d="M62 64Q100 80 138 64Q138 72 100 76Q62 72 62 64Z" fill="#5d1420" />
          <rect x="97" y="40" width="6" height="8" rx="2" fill="#5d1420" />
        </g>
      );
    case 'hat-gorro':
      return (
        <g>
          <path d="M64 76C62 34 138 34 136 76Z" fill={NAVY} />
          <rect x="61" y="66" width="78" height="14" rx="6" fill="#2d5586" />
          <path d="M64 71h72" stroke={RED} stroke-width="2.4" />
          <circle cx="100" cy="36" r="5" fill={RED} />
        </g>
      );
    case 'hat-barrete':
      return (
        <g>
          <path d="M63 76C62 44 96 34 122 46C146 58 154 86 150 114C146 100 142 84 134 78Z" fill={RED} />
          <path d="M63 74C90 66 120 66 136 76L134 82C118 74 88 72 64 80Z" fill={GREEN} />
          <path d="M150 114l-2 10 5-4z" fill={GREEN} />
          <circle cx="150" cy="116" r="4" fill={GOLD} />
        </g>
      );
    case 'hat-alentejano':
      return (
        <g>
          <path d="M76 68C72 32 128 32 124 68Z" fill="#26262c" />
          <path d="M76 62H124" stroke="#6b4a2a" stroke-width="4.4" />
          <ellipse cx="100" cy="68" rx="64" ry="12" fill="#1b1b1f" />
          <path d="M40 66Q100 80 160 66" stroke="#3b3b44" stroke-width="2" fill="none" />
        </g>
      );
    case 'hat-coroa':
      return (
        <g>
          <path d="M68 66L72 36L88 52L100 30L112 52L128 36L132 66Z" fill={GOLD} stroke={GOLD_DARK} stroke-width="2" stroke-linejoin="round" />
          <rect x="68" y="62" width="64" height="8" rx="2" fill={GOLD} stroke={GOLD_DARK} stroke-width="1.6" />
          <circle cx="100" cy="42" r="3.4" fill={RED} /><circle cx="76" cy="46" r="2.6" fill="#2a8cd6" /><circle cx="124" cy="46" r="2.6" fill={GREEN} />
        </g>
      );
    default:
      return null;
  }
};

const Accessory = ({ id }: { id?: string }) => {
  switch (id) {
    case 'acc-bryle':
      return (
        <g>
          <rect x="72" y="84" width="25" height="16" rx="7" fill="#15151a" />
          <rect x="103" y="84" width="25" height="16" rx="7" fill="#15151a" />
          <path d="M97 90h6M72 90L66 88M128 90L134 88" stroke="#15151a" stroke-width="2.4" />
          <path d="M77 88l8 0M108 88l8 0" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linecap="round" />
        </g>
      );
    case 'acc-bica':
      return (
        <g>
          <ellipse cx="150" cy="190" rx="26" ry="6" fill="#f4f1e8" />
          <path d="M132 164H168Q168 190 150 190Q132 190 132 164Z" fill="#fff" stroke="#d8d3c4" stroke-width="1.5" />
          <ellipse cx="150" cy="164" rx="18" ry="4" fill="#5a3418" />
          <path d="M168 168Q182 168 178 180Q174 187 166 184" stroke="#fff" stroke-width="4" fill="none" />
          <path d="M144 154Q140 146 146 140M156 154Q152 146 158 140" stroke="#fff" stroke-opacity=".8" stroke-width="2.4" fill="none" stroke-linecap="round" />
        </g>
      );
    case 'acc-pastel':
      return (
        <g>
          <path d="M122 172H178L172 192Q150 200 128 192Z" fill="#e0a85a" />
          <path d="M126 178h48M130 186h40" stroke="#c98f44" stroke-width="1.4" />
          <ellipse cx="150" cy="172" rx="28" ry="9" fill="#f6d56a" />
          <ellipse cx="150" cy="172" rx="28" ry="9" fill="none" stroke="#e0a85a" stroke-width="3" />
          {[[138, 171], [152, 169], [162, 174]].map(([x, y]) => <circle key={`${x}`} cx={x} cy={y} r="2.6" fill="#a8541a" />)}
        </g>
      );
    case 'acc-sardinha':
      return (
        <g transform="rotate(-18 62 176)">
          <path d="M80 176l14-9v18z" fill="#6f98b3" />
          <ellipse cx="60" cy="176" rx="22" ry="9" fill="#9cc1d6" />
          <path d="M40 173Q60 166 80 174" stroke="#3f6a86" stroke-width="4" fill="none" />
          <path d="M40 180Q60 184 78 178" stroke="#fff" stroke-opacity=".6" stroke-width="2" fill="none" />
          <circle cx="46" cy="175" r="2" fill="#15151a" />
        </g>
      );
    case 'acc-galo':
      return (
        <g>
          <path d="M168 170Q188 150 184 128M170 176Q194 166 196 144M166 182Q190 184 196 166" stroke={RED} stroke-width="4" fill="none" stroke-linecap="round" />
          <path d="M168 172Q184 158 180 140" stroke={GREEN} stroke-width="3" fill="none" stroke-linecap="round" />
          <ellipse cx="150" cy="180" rx="22" ry="16" fill="#1c1c20" />
          <circle cx="138" cy="160" r="9" fill="#1c1c20" />
          <path d="M132 153q2-6 5-3 3-5 6 0 4-3 4 4z" fill={RED} />
          <path d="M129 161l-8 3 8 3z" fill={GOLD} />
          <circle cx="136" cy="159" r="1.8" fill="#fff" />
          <path d="M138 168q-2 6 0 9" stroke={RED} stroke-width="3" fill="none" stroke-linecap="round" />
          {[[148, 178, RED], [158, 182, GOLD], [140, 184, '#38a169'], [152, 190, '#2a8cd6']].map(([x, y, c]) => <circle key={`${x}${y}`} cx={x as number} cy={y as number} r="2.6" fill={c as string} />)}
          <path d="M146 196v6M156 196v6" stroke={GOLD} stroke-width="2.4" />
        </g>
      );
    case 'acc-medalha':
      return (
        <g>
          <path d="M88 150L100 182L112 150" stroke={RED} stroke-width="6" fill="none" stroke-linejoin="round" />
          <path d="M92 152L100 174" stroke={GREEN} stroke-width="2" />
          <circle cx="100" cy="186" r="11" fill={GOLD} stroke={GOLD_DARK} stroke-width="2" />
          <circle cx="100" cy="186" r="7" fill="none" stroke={GOLD_DARK} stroke-width="1" />
          <path d="M100 180l2 4 4 .6-3 3 .8 4-3.8-2-3.8 2 .8-4-3-3 4-.6z" fill={GOLD_DARK} />
        </g>
      );
    default:
      return null;
  }
};

const Mouth = ({ mood }: { mood: Mood }) => {
  if (mood === 'happy')
    return (
      <g>
        <path d="M89 108Q100 124 111 108Z" fill="#7a2f2a" />
        <path d="M94 115Q100 119 106 115" stroke="#e57c78" stroke-width="3" fill="none" stroke-linecap="round" />
      </g>
    );
  if (mood === 'worried') return <path d="M91 115Q100 108 109 115" stroke="#7a3a2e" stroke-width="2.6" fill="none" stroke-linecap="round" />;
  return <path d="M90 110Q100 118 110 110" stroke="#7a3a2e" stroke-width="2.6" fill="none" stroke-linecap="round" />;
};

export interface AvatarProps {
  look: Look;
  equipped: ShopState['equipped'];
  size?: number;
  mood?: Mood;
  class?: string;
  /** Přečtení pro čtečky obrazovky. */
  label?: string;
}

export const Avatar = ({ look, equipped, size = 96, mood = 'neutral', class: cls = '', label = 'Tvůj avatar' }: AvatarProps) => {
  const skin = SKINS[look.skin] ?? SKINS[1]!;
  const hair = HAIR_COLORS[look.hairColor] ?? HAIR_COLORS[1]!;
  const top = Top({ id: equipped.top });
  const hat = !!equipped.hat;
  const brow = hair === '#d9b45f' || hair === '#8d8f98' ? '#6b5a3c' : hair;
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={label} class={`shrink-0 rounded-full ${cls}`}>
      <defs><clipPath id="av-clip"><circle cx="100" cy="100" r="100" /></clipPath></defs>
      <g clip-path="url(#av-clip)">
        <Background id={equipped.bg} />
        {top.base}
        <HairBack style={look.hair} color={hair} />
        <path d="M85 116V148Q100 166 115 148V116Z" fill={skin} />
        <path d="M85 128Q100 142 115 128V138Q100 150 85 140Z" fill="#000" opacity=".1" />
        {top.over}
        <circle cx="66" cy="96" r="6.5" fill={skin} /><circle cx="134" cy="96" r="6.5" fill={skin} />
        <ellipse cx="100" cy="90" rx="34" ry="38" fill={skin} />
        <circle cx="79" cy="104" r="5.5" fill="#f08a7e" opacity=".28" /><circle cx="121" cy="104" r="5.5" fill="#f08a7e" opacity=".28" />
        <path d="M78 80Q86 75 94 79M106 79Q114 75 122 80" stroke={brow} stroke-width="3" fill="none" stroke-linecap="round" />
        <ellipse cx="86" cy="92" rx="3.6" ry="4.4" fill="#2b2118" /><ellipse cx="114" cy="92" rx="3.6" ry="4.4" fill="#2b2118" />
        <circle cx="87.4" cy="90.4" r="1.2" fill="#fff" /><circle cx="115.4" cy="90.4" r="1.2" fill="#fff" />
        <path d="M100 95Q96 104 102 105" stroke="#000" stroke-opacity=".25" stroke-width="2" fill="none" stroke-linecap="round" />
        <Mouth mood={mood} />
        <HairFront style={look.hair} color={hair} hat={hat} />
        <Hat id={equipped.hat} />
        <Accessory id={equipped.acc} />
      </g>
    </svg>
  );
};
