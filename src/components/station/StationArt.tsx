import { memo } from 'react';
import { roomData } from '../../data/station';
import { door, fixtures, halls, local, sectors, worldSize } from '../../engine/map';

type Prop = (typeof roomData)[string]['fixtures'];

function LabProp({ prop, second }: { prop: Prop; second: boolean }) {
  switch (prop) {
    case 'plants':
      return <>
        <path d="M-5 9h54v20H-5z" fill="#234e42" stroke="#172e32" strokeWidth="3"/>
        <path d="M0 10h44v7H0z" fill="#698e5a"/>
        <path d="M9 9V-3m12 12V-9m13 18V-2" stroke="#c3e9a2" strokeWidth="3"/>
        <path d="m9 1-7-7-3 2 4 8 9 2 7-9-3-4-7 4m13-1-7-7 2-4 7 3 1 7 8-9 4 2-3 7-9 5m10 4 7-8 6 3-3 8-10 2" fill={second ? '#9dd779' : '#69bda5'}/>
      </>;
    case 'chemical':
    case 'water':
      return <>
        <path d="M-4 4h54v26H-4z" fill="#253953" stroke="#15233b" strokeWidth="3"/>
        <path d="M-4 4 3-2h42l5 6z" fill="#8daacd"/>
        {[4, 21, 38].map((x, i) => <g key={x} transform={`translate(${x} 0)`}>
          <path d="M-3-12h6v9l4 8v12H-7V5l4-8z" fill="#b4dfee" stroke="#264454" strokeWidth="2"/>
          <path d="M-5 8h10v7H-5z" fill={prop === 'water' ? ['#3bd7db','#60e3a4','#439de9'][i] : ['#f79b9f','#ac8eee','#e8ab67'][i]} />
        </g>)}
      </>;
    case 'power':
      return <>
        <rect x="-3" y="-3" width="52" height="35" rx="4" fill="#2a3445" stroke="#151d2c" strokeWidth="3"/>
        <path d="M2 0h42v7H2zm0 12h42v4H2zm0 11h42v4H2z" fill="#4c6275"/>
        <path d="m25 4-10 12h9l-4 11 13-15h-9z" fill="#ffcf69"/>
      </>;
    case 'specimens':
      return <>
        <rect x="-2" y="-4" width="51" height="33" rx="3" fill="#4b395d" stroke="#2b223e" strokeWidth="3"/>
        <path d="M3 1h39v14H3z" fill="#7c628f"/><path d="M13 6h17v4H13z" fill="#ebbad7"/>
        <path d="M3 20h39" stroke="#a784ad" strokeWidth="3" strokeDasharray="4 3"/>
      </>;
    case 'climate':
      return <>
        <rect x="-4" y="-4" width="54" height="32" rx="3" fill="#293f6c" stroke="#192b4b" strokeWidth="3"/>
        <path d="M5 17c10-11 22-14 35-5m-29 2-6 2 1-6m19-6 4 4 5-3" fill="none" stroke="#91dcfa" strokeWidth="2"/>
        <path d="M0 23h47" stroke="#607fb0" strokeWidth="2" strokeDasharray="5 3"/>
      </>;
    default:
      return <>
        <path d="M-2 1h50v27H-2z" fill="#2b3a5a" stroke="#1c2843" strokeWidth="3"/>
        <path d="M2-5h42v16H2z" fill="#7180a6" stroke="#30405e" strokeWidth="3"/>
        <path d="M7 0h31v6H7z" fill={second ? '#e2b96b' : '#68cbd1'}/>
        <path d="M5 18h36m-36 4h26" stroke="#536a96" strokeWidth="2" strokeDasharray="5 3"/>
      </>;
  }
}

export const StationArt = memo(function StationArt({ open, powered, locks, current, ready }: {
  open: string[];
  powered: string[];
  locks: readonly string[];
  current?: string;
  ready: boolean;
}) {
  return (
    <svg className="station-art" width={worldSize.w} height={worldSize.h} viewBox={`0 0 ${worldSize.w} ${worldSize.h}`} aria-hidden="true">
      <defs>
        <pattern id="stars" width="79" height="67" patternUnits="userSpaceOnUse">
          <rect x="21" y="11" width="2" height="2" fill="#8b8cbe" opacity=".36" />
          <rect x="59" y="50" width="2" height="2" fill="#8cdec8" opacity=".16" />
          <path d="M0 0h79M0 0v67" stroke="#4e5470" opacity=".16" />
        </pattern>
        <pattern id="tiles" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0v32" fill="none" stroke="#b6c6fb" strokeOpacity=".105" />
          <path d="M3 4h3m21 24h3" stroke="#b6c6fb" strokeOpacity=".075" />
        </pattern>
        <pattern id="hazard" width="14" height="12" patternUnits="userSpaceOnUse">
          <path d="m-4 12 8-12m6 12 8-12" stroke="#f7bf68" opacity=".63" strokeWidth="4" />
        </pattern>
        <radialGradient id="station-space"><stop stopColor="#222d4e"/><stop offset="1" stopColor="#10172d"/></radialGradient>
        <radialGradient id="room-glow"><stop stopColor="#b8f7e8" stopOpacity=".16"/><stop offset="1" stopColor="#7bb8d6" stopOpacity="0"/></radialGradient>
      </defs>
      <rect width={worldSize.w} height={worldSize.h} fill="url(#station-space)" />
      <rect width={worldSize.w} height={worldSize.h} fill="url(#stars)" />
      <path d="M37 358v570h1330M84 86h1270v253M38 357h40m1275-21v24m-80 742h-104" stroke="#5c6b90" strokeWidth="2" strokeDasharray="11 8" opacity=".62" fill="none"/>
      {halls.map((hall, index) => (
        <g key={index}>
          <rect x={hall.x - 5} y={hall.y + 7} width={hall.w + 10} height={hall.h} rx="5" fill="#070e1f" opacity=".65"/>
          <rect x={hall.x} y={hall.y} width={hall.w} height={hall.h} rx="4" fill="#2a3b59" stroke="#596584" strokeWidth="2"/>
          <rect x={hall.x} y={hall.y} width={hall.w} height={hall.h} rx="4" fill="url(#tiles)"/>
        </g>
      ))}
      <path d="M104 413h1240M103 416v346h1240" stroke="#172941" opacity=".92" strokeWidth="17" fill="none"/>
      <path d="M104 413h1240M103 416v346h1240" stroke="#82acd2" opacity=".55" strokeWidth="2" strokeDasharray="8 11" fill="none"/>
      <path d="M156 391h100m105 0h76m25 0h57m-353 43h234m126 305h91m398 46h96" stroke="#a9baca" opacity=".32" strokeDasharray="3 5" strokeWidth="3"/>
      <g transform="translate(111 411)" opacity=".7">
        <path d="M-17-18h34v35h-34z" fill="#486178" stroke="#758daf" strokeWidth="2"/>
        <path d="M-13-14h26v27h-26z" fill="#283c56"/>
        <path d="M-10 0h20M0-9v18" stroke="#b5d1dd" strokeWidth="3"/>
      </g>
      {sectors.map((sector, index) => {
        const { rect, id } = sector;
        const info = roomData[id];
        const entry = door(sector);
        const live = powered.includes(id);
        const active = current === id;
        const accessible = open.includes(id);
        const light = live ? '#99f5c8' : active ? '#ffe275' : accessible ? '#83e6da' : locks.includes(id) ? '#f3a795' : '#9da8c7';
        const titleY = rect.y + (sector.northDoor ? 42 : 21);
        return (
          <g key={id}>
            <rect x={rect.x - 8} y={rect.y + 9} width={rect.w + 16} height={rect.h + 4} rx="11" fill="#070f21" opacity=".77"/>
            <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx="8" fill={accessible ? '#2a3855' : '#232f49'} stroke={accessible ? '#697b9d' : '#4e5c7d'} strokeWidth="2"/>
            <rect x={rect.x + 9} y={rect.y + 9} width={rect.w - 18} height={rect.h - 18} rx="3" fill={info.color} opacity={live ? '.14' : active ? '.10' : '.034'}/>
            <rect x={rect.x + 9} y={rect.y + 9} width={rect.w - 18} height={rect.h - 18} rx="3" fill="url(#tiles)"/>
            {(live || (id === 'greenhouse' && ready)) && <ellipse cx={rect.x + 182} cy={rect.y + 124} rx="173" ry="106" fill="url(#room-glow)"/>}
            <path d={`M${rect.x + 7} ${rect.y + 8}h${rect.w - 14}m-${rect.w - 14} 0v${rect.h - 17}`} fill="none" stroke={info.color} strokeOpacity={accessible ? '.5' : '.17'} strokeWidth="3"/>
            {!sector.northDoor && <rect x={rect.x + 89} y={rect.y + 3} width={rect.w - 178} height="39" rx="5" fill="#253653" stroke="#657597"/>}
            {sector.northDoor && <rect x={rect.x + 89} y={rect.y + 21} width={rect.w - 178} height="38" rx="5" fill="#263751" stroke="#596886"/>}
            <rect x={rect.x + 100} y={titleY - 6} width="7" height="7" rx="1" fill={light}/>
            <text x={rect.x + 120} y={titleY + 5} fill={accessible ? '#eff4ff' : '#b5bdd1'} fontWeight="700" fontSize="15">
              {String(index + 1).padStart(2, '0')} · {info.name}
            </text>
            <path d={`M${rect.x + 18} ${rect.y + 74}v${rect.h - 107}m${rect.w - 34} 0v-${rect.h - 107}`} stroke={info.color} strokeOpacity=".16" strokeDasharray="5 4" strokeWidth="3"/>
            <path d={`M${rect.x + 39} ${rect.y + 75}v19h55m${rect.w - 172} 0h55V${rect.y + 75}`}
              fill="none" stroke={info.color} strokeOpacity={accessible ? '.31' : '.12'} strokeWidth="2" />
            <rect x={rect.x + 108} y={rect.y + 81} width={rect.w - 216} height={rect.h - 161} rx="12"
              fill="#213651" fillOpacity={accessible ? '.36' : '.16'} stroke={info.color} strokeOpacity={accessible ? '.22' : '.10'} strokeDasharray="4 5" />
            {id === 'gateway' && <g transform={`translate(${rect.x + 184} ${rect.y + 148})`} opacity={accessible ? '.38' : '.17'}>
              <circle r="41" stroke={info.color} strokeWidth="2" fill="#284764" />
              <circle r="32" stroke={info.color} strokeWidth="1.5" fill="none" />
              <ellipse rx="14" ry="32" stroke={info.color} strokeWidth="1.5" fill="none" />
              <path d="M-32 0h64m-44-37 5 5m22 60 5 5" stroke={info.color} strokeWidth="1.5" />
            </g>}
            {fixtures(sector).map(({ x, y }, i) => (
              <g key={x} transform={`translate(${x} ${y})`} opacity={accessible ? '1' : '.54'}><LabProp prop={info.fixtures} second={i === 1}/></g>
            ))}
            {info.fixtures === 'plants' && [116, 202, 283].map((x, i) => {
              const point = local(sector, x, 219);
              return <g key={x} transform={`translate(${point.x} ${point.y}) scale(.7)`} opacity={live || ready ? 1 : .55}><LabProp prop="plants" second={i % 2 === 1}/></g>;
            })}
            <g transform={`translate(${entry.x} ${entry.y})`}>
              <rect x="-43" y="-8" width="86" height="16" rx="3" fill="#24364c" stroke={light} strokeWidth="2"/>
              <rect x="-39" y="-5" width="78" height="10" fill={accessible ? '#446d77' : 'url(#hazard)'}/>
              <path d="M-43-13v26m86-26v26" stroke="#91a3be" strokeWidth="5"/>
              {accessible && <path d="m-9 0 6 5 7-5m-13-4 6 5 7-5" stroke={light} strokeWidth="2" fill="none" transform={sector.northDoor ? undefined : 'rotate(180)'}/>}
              {!accessible && <rect x="-14" y="-6" width="28" height="12" rx="2" fill="#3d465c" stroke="#c0a68d"/>}
            </g>
          </g>
        );
      })}
    </svg>
  );
});

export function Suit({ variant }: { variant: 'player' | 'crew' | 'robot' }) {
  const player = variant === 'player';
  if (variant === 'robot') {
    return (
      <svg width="44" height="46" viewBox="0 0 44 46" aria-hidden="true">
        <ellipse cx="22" cy="41" rx="16" ry="4" fill="#10182b" opacity=".8"/>
        <path d="M22 4v8" stroke="#ffcf7e" strokeWidth="3"/><circle cx="22" cy="6" r="4" fill="#ffe076"/>
        <path d="M8 12h28l4 5v13l-5 5H9l-5-5V17z" fill="#5e82bf" stroke="#182744" strokeWidth="3"/>
        <path d="M9 15h26v15H9z" fill="#233653"/><path d="M13 20h5v5h-5zm13 0h5v5h-5zm-7 7h6" fill="#b6f9e7" stroke="#b6f9e7" strokeWidth="1"/>
        <path d="M15 36h14l-4 5h-6z" fill="#a2e9dd"/>
      </svg>
    );
  }
  return (
    <svg width="48" height="52" viewBox="0 0 48 52" aria-hidden="true">
      <ellipse cx="24" cy="46" rx="17" ry="4" fill="#0d1528" opacity=".8"/>
      <path d="M6 24h11v15H6z" fill={player ? '#e69d64' : '#a985d6'} stroke="#16243e" strokeWidth="2"/>
      <path d="M12 26h24l4 5v8l-5 4H13l-5-4v-8z" fill={player ? '#76d9bb' : '#b5a4ef'} stroke="#182943" strokeWidth="3"/>
      <path d="M14 42h7v4h-8zm13 0h7l1 4h-8z" fill={player ? '#407391' : '#6e609c'} stroke="#152844" strokeWidth="2"/>
      <path d="M12 12 17 7h16l5 5v13l-5 6H16l-6-6z" fill={player ? '#adf4db' : '#ded3ff'} stroke="#172b48" strokeWidth="3"/>
      <path d="M14 15h21v9l-4 4H18l-4-4z" fill={player ? '#365775' : '#544970'}/>
      <path d="M19 18h3v5h-3zm8 0h3v5h-3z" fill="#f2feff"/>
      <path d="M23 25h3" stroke="#99d9ee" strokeWidth="1.4"/>
      <path d="M19 9h10" stroke="#edfff8" strokeWidth="2" opacity=".87"/>
      <path d="M21 34h8v5h-8z" fill={player ? '#2f606c' : '#6b5a9e'}/><path d="M23 35h3v2h-3z" fill="#ffe48b"/>
    </svg>
  );
}

export function DeviceArt({ icon }: { icon: string }) {
  switch (icon) {
    case 'core':
      return <svg viewBox="0 0 40 38" aria-hidden="true"><path d="m20 1 14 8 3 16-17 12L4 25 6 9z" fill="#87ead6" stroke="#265e6c" strokeWidth="3"/><path d="m20 7 7 10-7 13-7-13z" fill="#edfff3"/><path d="m20 7 14 2M20 30v7" stroke="#346f83" strokeWidth="2"/></svg>;
    case 'sample':
      return <svg viewBox="0 0 40 38" aria-hidden="true"><rect x="11" y="3" width="18" height="6" rx="2" fill="#93b3cf" stroke="#162742" strokeWidth="2"/><path d="M13 8h14l4 10v14l-4 3H13l-4-3V18z" fill="#b8dae9" stroke="#172e4a" strokeWidth="2"/><path d="M12 24h16v7l-2 2H14l-2-2z" fill="#6fd8c1"/><path d="M15 14v5" stroke="#f4faff" strokeWidth="2"/></svg>;
    case 'record':
      return <svg viewBox="0 0 40 38" aria-hidden="true"><path d="M8 9h24v20H8z" fill="#ffc97b" stroke="#624552" strokeWidth="3"/><path d="M13 13h14v7H13zm2 11h10" fill="#774b5a" stroke="#774b5a" strokeWidth="2"/><path d="M8 5h5m14 0h5" stroke="#ffe0a0" strokeWidth="3"/></svg>;
    case 'lock':
      return <svg viewBox="0 0 40 38" aria-hidden="true"><rect x="10" y="14" width="20" height="18" rx="3" fill="#bfacd1" stroke="#32324b" strokeWidth="3"/><path d="M15 14V9a5 5 0 0 1 10 0v5m-5 6v5" stroke="#666080" strokeWidth="3" fill="none"/></svg>;
    case 'valve':
      return <svg viewBox="0 0 40 38" aria-hidden="true"><path d="M6 17h28v16H6z" fill="#466781" stroke="#182940" strokeWidth="3"/><path d="M15 15h10v17H15z" fill="#80c6cb"/><circle cx="20" cy="13" r="10" fill="#f5b675" stroke="#503b4a" strokeWidth="3"/><path d="M20 7v12m-6-6h12" stroke="#754e55" strokeWidth="2"/></svg>;
    case 'part':
      return <svg viewBox="0 0 40 38" aria-hidden="true"><path d="M6 13 16 6h16l4 7v17H6z" fill="#9278ca" stroke="#282744" strokeWidth="3"/><path d="M6 13h30m-20-7v7m8-7v7M13 20h14" stroke="#dbbffa" strokeWidth="2"/></svg>;
    case 'socket':
    case 'relay':
      return <svg viewBox="0 0 40 38" aria-hidden="true"><rect x="4" y="6" width="32" height="25" rx="5" fill={icon === 'relay' ? '#7dd8c6' : '#718cb6'} stroke="#222b46" strokeWidth="3"/><path d="M13 12h14v12H13z" fill="#263654"/><path d="m20 13-4 6h4l-1 4 5-6h-4z" fill="#f9df9a"/></svg>;
    default:
      return <svg viewBox="0 0 40 38" aria-hidden="true"><path d="M6 6h28v20H6z" fill="#788bc1" stroke="#1c2a45" strokeWidth="3"/><path d="M10 10h20v12H10z" fill="#25445e"/><path d="m13 18 4-4 5 3 5-4" stroke="#96f2d7" strokeWidth="2" fill="none"/><path d="M12 26h16l4 7H8z" fill="#566d97" stroke="#202f4b" strokeWidth="2"/></svg>;
  }
}
