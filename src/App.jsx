import { useMemo, useState } from 'react';
import { FACTIONS, MAJOR_FACTIONS } from './data/factions.js';
import { ALL_CHARACTERS, ICONIC_CHARACTERS, charactersByFaction } from './data/characters.js';
import { LOCATIONS, LOCATION_MAP } from './data/locations.js';
import { ROADS } from './data/roads.js';
import { advanceRandomPlaces, createRandomPlaces, advanceWanderers, createWanderers } from './utils/randomPlaces.js';

const VIEW_MODES = [
  { id: 'faction', label: 'Faksi' },
  { id: 'characters', label: 'Karakter' },
  { id: 'map', label: 'Peta' },
];

const TERRITORIES = [
  { id: 'silven', path: 'M190 150 C250 105 330 118 365 180 C390 230 370 300 310 332 C240 365 165 345 135 280 C112 228 128 180 190 150 Z', labelX: 245, labelY: 210 },
  { id: 'thornwall', path: 'M480 110 C545 78 635 90 685 132 C722 165 725 220 676 250 C620 280 530 274 478 240 C436 213 430 140 480 110 Z', labelX: 575, labelY: 170 },
  { id: 'azurra', path: 'M840 155 C930 135 1026 175 1072 240 C1105 288 1095 360 1025 395 C954 428 864 418 812 372 C762 328 760 196 840 155 Z', labelX: 928, labelY: 250 },
  { id: 'varath', path: 'M330 320 C410 295 500 320 545 390 C580 446 555 522 490 565 C420 606 322 585 270 526 C225 478 238 350 330 320 Z', labelX: 405, labelY: 430 },
  { id: 'ashkari', path: 'M760 470 C850 445 960 470 1014 545 C1056 602 1046 684 970 724 C892 765 776 756 714 704 C654 654 662 510 760 470 Z', labelX: 860, labelY: 590 },
  { id: 'pirate', path: 'M535 638 C610 604 715 612 786 660 C836 694 844 758 795 802 C746 845 646 858 570 834 C505 813 451 742 470 690 C481 664 507 649 535 638 Z', labelX: 650, labelY: 715 },
  { id: 'orc', path: 'M255 372 C300 360 338 378 348 420 C356 455 326 490 283 492 C240 494 212 460 215 425 C219 399 233 378 255 372 Z', labelX: 282, labelY: 420 },
  { id: 'moon', path: 'M298 620 C340 605 390 620 414 658 C434 690 423 729 385 748 C348 767 304 758 277 732 C250 706 258 636 298 620 Z', labelX: 340, labelY: 680 },
  { id: 'ancient', path: 'M640 82 C678 66 720 78 742 108 C757 128 754 157 725 173 C696 190 650 188 626 162 C602 137 604 97 640 82 Z', labelX: 684, labelY: 122 },
  { id: 'rust', path: 'M755 110 C794 98 840 106 862 135 C882 162 876 196 844 212 C810 230 758 228 731 204 C705 179 716 121 755 110 Z', labelX: 796, labelY: 150 },
  { id: 'demon', path: 'M997 620 C1032 604 1072 613 1093 641 C1112 667 1107 704 1080 726 C1048 750 1000 748 974 724 C949 701 960 637 997 620 Z', labelX: 1035, labelY: 668 },
  { id: 'eldara', path: 'M90 95 C130 84 168 95 183 126 C197 154 182 187 148 198 C116 209 83 204 59 185 C35 166 51 106 90 95 Z', labelX: 122, labelY: 140 },
];

const MOUNTAINS = [
  [420, 360], [455, 330], [490, 305], [530, 285], [585, 300], [633, 330], [688, 385], [748, 460], [300, 250], [350, 220], [780, 210]
];
const FORESTS = [
  [210, 195], [250, 215], [285, 245], [225, 260], [315, 290], [188, 308], [335, 355], [350, 650], [330, 690]
];
const RIVERS = [
  'M320 180 C350 250 372 300 410 350 C438 390 458 440 455 510',
  'M705 155 C742 220 760 292 742 360 C728 408 712 456 700 510',
  'M228 405 C205 455 190 520 205 575 C216 615 238 652 255 694',
];

function App() {
  const [view, setView] = useState('faction');
  const [selectedFaction, setSelectedFaction] = useState('varath');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [turn, setTurn] = useState(1);
  const [query, setQuery] = useState('');
  const [characterScope, setCharacterScope] = useState('all');
  const [randomPlaces, setRandomPlaces] = useState(() => createRandomPlaces());
  const [wanderers, setWanderers] = useState(() => createWanderers());

  const allLocations = useMemo(() => [...LOCATIONS, ...randomPlaces], [randomPlaces]);
  const locationMap = useMemo(() => new Map(allLocations.map((loc) => [loc.id, loc])), [allLocations]);

  const factionCharacters = useMemo(() => charactersByFaction(selectedFaction), [selectedFaction]);
  const factionIconics = useMemo(() => factionCharacters.filter((c) => c.kind === 'iconic'), [factionCharacters]);
  const factionLocations = useMemo(() => LOCATIONS.filter((l) => l.faction === selectedFaction), [selectedFaction]);

  const combinedCharacters = useMemo(() => {
    const wandererList = wanderers.map((w) => ({ ...w, locationId: w.currentLocationId, location: locationMap.get(w.currentLocationId)?.name || w.currentLocationId }));
    return [...ALL_CHARACTERS, ...wandererList];
  }, [wanderers, locationMap]);

  const filteredCharacters = useMemo(() => {
    const q = query.trim().toLowerCase();
    return combinedCharacters.filter((char) => {
      const factionPass = selectedFaction === 'all' ? true : characterScope === 'free' || characterScope === 'wanderer' ? true : char.faction === selectedFaction;
      const scopePass =
        characterScope === 'all' ? true :
        characterScope === 'iconic' ? char.kind === 'iconic' :
        characterScope === 'support' ? char.kind === 'support' :
        characterScope === 'free' ? char.kind === 'free' || (char.faction === 'neutral' && char.kind !== 'wanderer') :
        characterScope === 'wanderer' ? char.kind === 'wanderer' : true;
      const searchPass = !q || [char.name, char.role, char.location, char.bio, char.drama, FACTIONS[char.faction]?.name].join(' ').toLowerCase().includes(q);
      return factionPass && scopePass && searchPass;
    });
  }, [combinedCharacters, query, selectedFaction, characterScope]);

  const selectedFactionData = selectedFaction === 'all' ? null : FACTIONS[selectedFaction];

  function nextTurn() {
    setTurn((t) => t + 1);
    setRandomPlaces((prev) => advanceRandomPlaces(prev));
    setWanderers((prev) => advanceWanderers(prev));
  }

  function handleSelectFaction(factionId) {
    setSelectedFaction(factionId);
    setSelectedCharacter(null);
    setSelectedLocation(null);
    setView('faction');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">Nusantara Kaldera · Worldbuilding Interactive</div>
          <h1>Peta, Faksi, dan Karakter Kaldera</h1>
          <p>
            Fokus utama sekarang adalah <b>list faksi dan karakter</b>, dengan peta tekstur ala medieval sebagai tampilan detail.
          </p>
        </div>
        <div className="top-actions">
          <button className="primary" onClick={nextTurn}>Turn {turn} · Lanjutkan</button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar left-panel">
          <div className="panel-title">Mode Tampilan</div>
          <div className="mode-switch">
            {VIEW_MODES.map((item) => (
              <button key={item.id} className={view === item.id ? 'mode-btn active' : 'mode-btn'} onClick={() => setView(item.id)}>
                {item.label}
              </button>
            ))}
          </div>

          <div className="panel-title">Daftar Faksi</div>
          <button className={selectedFaction === 'all' ? 'faction-btn active' : 'faction-btn'} onClick={() => handleSelectFaction('all')}>
            🌍 Semua Karakter
          </button>
          {Object.values(FACTIONS).map((faction) => (
            <button
              key={faction.id}
              className={selectedFaction === faction.id ? 'faction-btn active' : 'faction-btn'}
              style={{ borderLeftColor: faction.color }}
              onClick={() => handleSelectFaction(faction.id)}
            >
              <span>{faction.symbol}</span>
              <div>
                <strong>{faction.name}</strong>
                <small>{faction.major ? 'Faksi Besar' : faction.id === 'neutral' ? 'Bebas' : 'Faksi Tambahan'}</small>
              </div>
            </button>
          ))}

          <div className="mini-stats">
            <div><b>{Object.keys(FACTIONS).length}</b><span>Total Faksi</span></div>
            <div><b>{LOCATIONS.length}</b><span>Wilayah Tetap</span></div>
            <div><b>{randomPlaces.length}</b><span>Tempat Random</span></div>
            <div><b>{combinedCharacters.length}</b><span>Total Karakter</span></div>
          </div>
        </aside>

        <main className="content-panel">
          {view === 'faction' && (
            <FactionView
              faction={selectedFactionData}
              factionId={selectedFaction}
              factionCharacters={selectedFaction === 'all' ? combinedCharacters : factionCharacters}
              iconics={selectedFaction === 'all' ? ICONIC_CHARACTERS : factionIconics}
              factionLocations={selectedFaction === 'all' ? LOCATIONS : factionLocations}
              onCharacter={setSelectedCharacter}
              onLocation={setSelectedLocation}
              onGoCharacters={() => setView('characters')}
              onGoMap={() => setView('map')}
            />
          )}

          {view === 'characters' && (
            <CharactersView
              selectedFaction={selectedFaction}
              setSelectedFaction={setSelectedFaction}
              query={query}
              setQuery={setQuery}
              scope={characterScope}
              setScope={setCharacterScope}
              characters={filteredCharacters}
              onCharacter={setSelectedCharacter}
            />
          )}

          {view === 'map' && (
            <MapView
              selectedFaction={selectedFaction}
              allLocations={allLocations}
              locationMap={locationMap}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              setSelectedCharacter={setSelectedCharacter}
            />
          )}
        </main>

        <aside className="sidebar right-panel">
          {selectedCharacter ? (
            <CharacterDetail character={selectedCharacter} />
          ) : selectedLocation ? (
            <LocationDetail location={selectedLocation} characters={combinedCharacters.filter((char) => char.locationId === selectedLocation.id)} onCharacter={setSelectedCharacter} />
          ) : selectedFactionData ? (
            <FactionDetail faction={selectedFactionData} characters={factionCharacters} locations={factionLocations} />
          ) : (
            <GeneralDetail combinedCharacters={combinedCharacters} />
          )}
        </aside>
      </div>
    </div>
  );
}

function FactionView({ faction, factionId, factionCharacters, iconics, factionLocations, onCharacter, onLocation, onGoCharacters, onGoMap }) {
  if (factionId === 'all') {
    return (
      <section className="card-section">
        <div className="hero-card">
          <h2>Semua Faksi & Semua Karakter</h2>
          <p>
            Gunakan mode ini jika kamu ingin melihat keseluruhan dunia. Untuk pengalaman yang paling sesuai dengan kebutuhanmu,
            klik salah satu faksi di kiri agar karakter-karakternya langsung tampil sebagai list.
          </p>
          <div className="hero-actions">
            <button className="secondary" onClick={onGoCharacters}>Lihat Semua Karakter</button>
            <button className="secondary" onClick={onGoMap}>Buka Peta Detail</button>
          </div>
        </div>
        <div className="split-grid">
          {MAJOR_FACTIONS.map((factionKey) => {
            const factionData = FACTIONS[factionKey];
            const chars = charactersByFaction(factionKey);
            return (
              <div className="faction-summary" key={factionKey} style={{ borderTopColor: factionData.color }}>
                <h3>{factionData.symbol} {factionData.name}</h3>
                <p>{factionData.desc}</p>
                <div className="pill-row">
                  <span>{chars.filter((c) => c.kind === 'iconic').length} ikonik</span>
                  <span>{chars.length} total karakter</span>
                  <span>{LOCATIONS.filter((l) => l.faction === factionKey).length} wilayah</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="card-section">
      <div className="hero-card" style={{ borderTopColor: faction.color }}>
        <div className="hero-head">
          <h2>{faction.symbol} {faction.name}</h2>
          <div className="hero-actions">
            <button className="secondary" onClick={onGoCharacters}>Mode Karakter</button>
            <button className="secondary" onClick={onGoMap}>Mode Peta</button>
          </div>
        </div>
        <p>{faction.desc}</p>
        <div className="info-grid">
          <div><strong>Watak</strong><span>{faction.trait}</span></div>
          <div><strong>Kekuatan</strong><span>{faction.power || 'Beragam, tergantung struktur faksi'}</span></div>
          <div><strong>Kelemahan</strong><span>{faction.weakness || 'Belum dicatat'}</span></div>
          <div><strong>Sejarah</strong><span>{faction.history}</span></div>
        </div>
      </div>

      <div className="subsection">
        <h3>Karakter Ikonik {faction.name}</h3>
        <p className="muted">Ini adalah tokoh utama yang ceritanya saling sambung, penuh plot twist, hubungan keluarga, rivalitas, dan pengkhianatan.</p>
        <div className="character-grid">
          {iconics.map((character) => (
            <CharacterCard key={character.id} character={character} onClick={() => onCharacter(character)} />
          ))}
        </div>
      </div>

      <div className="subsection">
        <h3>Semua Karakter Faksi</h3>
        <div className="simple-list">
          {factionCharacters.map((character) => (
            <button className="list-card" key={character.id} onClick={() => onCharacter(character)}>
              <div>
                <strong>{character.name}</strong>
                <small>{character.role} · {character.kind}</small>
              </div>
              <span>{character.location}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="subsection">
        <h3>Wilayah Faksi</h3>
        <div className="location-grid">
          {factionLocations.map((loc) => (
            <button className="location-card" key={loc.id} onClick={() => onLocation(loc)}>
              <div className="location-top"><span>{loc.icon}</span><strong>{loc.name}</strong></div>
              <small>{loc.type} · Pop. {loc.pop.toLocaleString('id-ID')}</small>
              <p>{loc.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function CharactersView({ selectedFaction, setSelectedFaction, query, setQuery, scope, setScope, characters, onCharacter }) {
  const scopes = [
    ['all', 'Semua'],
    ['iconic', 'Ikonik'],
    ['support', 'Pendukung'],
    ['free', 'Bebas'],
    ['wanderer', 'Random / Pengembara'],
  ];

  return (
    <section className="card-section">
      <div className="hero-card compact">
        <h2>Direktori Karakter</h2>
        <p>Kamu bisa lihat semua karakter berdasarkan faksi, jenis, atau pencarian nama / cerita.</p>
        <div className="toolbar">
          <select value={selectedFaction} onChange={(e) => setSelectedFaction(e.target.value)}>
            <option value="all">Semua Faksi</option>
            {Object.values(FACTIONS).map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama, role, lokasi, konflik..." />
        </div>
        <div className="mode-switch small">
          {scopes.map(([id, label]) => (
            <button key={id} className={scope === id ? 'mode-btn active' : 'mode-btn'} onClick={() => setScope(id)}>{label}</button>
          ))}
        </div>
      </div>

      <div className="character-grid bigger">
        {characters.map((character) => (
          <CharacterCard key={character.id} character={character} onClick={() => onCharacter(character)} />
        ))}
      </div>
    </section>
  );
}

function MapView({ selectedFaction, allLocations, locationMap, selectedLocation, setSelectedLocation, setSelectedCharacter }) {
  const visible = selectedFaction === 'all'
    ? allLocations
    : allLocations.filter((loc) => loc.faction === selectedFaction || (loc.faction === 'neutral' && loc.lockedFree));

  return (
    <section className="card-section map-only">
      <div className="hero-card compact">
        <h2>Peta Tekstur Kaldera</h2>
        <p>
          Tampilan ini dibuat lebih tekstural: gaya parchment medieval, kontur wilayah, sungai, gunung, hutan, jalan, dan label faksi.
          Klik titik lokasi untuk melihat detail wilayah di panel kanan.
        </p>
      </div>

      <div className="map-wrap">
        <svg viewBox="0 0 1200 900" className="kaldera-map">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#000" floodOpacity="0.25"/>
            </filter>
            <pattern id="paperNoise" width="120" height="120" patternUnits="userSpaceOnUse">
              <rect width="120" height="120" fill="#e9d9ae"/>
              <circle cx="10" cy="20" r="1" fill="#c5b083" opacity="0.4"/>
              <circle cx="70" cy="34" r="1.2" fill="#c5b083" opacity="0.25"/>
              <circle cx="110" cy="94" r="1.4" fill="#b89f6d" opacity="0.25"/>
              <path d="M0 60 C25 54 44 67 60 60 C90 49 100 72 120 64" stroke="#ccb78f" strokeWidth="0.8" fill="none" opacity="0.28"/>
            </pattern>
            <pattern id="seaWaves" width="90" height="48" patternUnits="userSpaceOnUse">
              <rect width="90" height="48" fill="#87a8b3"/>
              <path d="M0 12 C10 4 20 4 30 12 C40 20 50 20 60 12 C70 4 80 4 90 12" stroke="#c4dde3" strokeWidth="2" fill="none" opacity="0.5"/>
              <path d="M0 32 C10 24 20 24 30 32 C40 40 50 40 60 32 C70 24 80 24 90 32" stroke="#c4dde3" strokeWidth="1.7" fill="none" opacity="0.45"/>
            </pattern>
            <pattern id="forestTexture" width="34" height="34" patternUnits="userSpaceOnUse">
              <rect width="34" height="34" fill="rgba(0,0,0,0)"/>
              <path d="M8 24 L13 11 L18 24 Z" fill="#49704d" opacity="0.5"/>
              <path d="M18 28 L23 15 L28 28 Z" fill="#3f6343" opacity="0.45"/>
            </pattern>
            <pattern id="mountTexture" width="48" height="32" patternUnits="userSpaceOnUse">
              <path d="M8 28 L20 10 L32 28 Z" fill="#b09a78" opacity="0.45"/>
              <path d="M24 28 L34 14 L44 28 Z" fill="#9b8769" opacity="0.42"/>
            </pattern>
            <linearGradient id="coastShade" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#62808e"/>
              <stop offset="1" stopColor="#87a8b3"/>
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="1200" height="900" fill="url(#seaWaves)" />
          <path d="M120 140 C210 74 336 68 440 102 C522 62 672 52 778 87 C905 130 1020 234 1055 338 C1087 436 1068 589 980 692 C894 792 741 838 591 820 C479 842 342 825 242 760 C138 690 86 576 85 468 C84 363 51 228 120 140 Z" fill="url(#paperNoise)" stroke="#77674d" strokeWidth="6" filter="url(#shadow)"/>
          <path d="M128 145 C220 87 334 86 436 118 C532 80 673 74 780 110 C885 146 998 239 1032 338 C1062 425 1045 576 964 674 C885 769 738 810 594 794 C485 816 360 800 263 740 C168 681 120 575 117 470 C114 360 87 236 128 145 Z" fill="none" stroke="#f7ecd0" strokeWidth="2" opacity="0.7"/>

          <path d="M180 160 C260 122 332 146 350 200 C366 248 345 300 302 330 C260 360 190 362 155 328 C120 292 118 200 180 160 Z" fill="url(#forestTexture)" opacity="0.35"/>
          <path d="M474 110 C555 98 633 110 680 140 C718 163 714 230 654 253 C598 275 524 276 470 242 C424 213 420 120 474 110 Z" fill="rgba(122,74,163,0.12)"/>
          <path d="M828 160 C910 140 1008 170 1052 236 C1087 289 1081 362 1018 394 C957 426 867 420 818 381 C770 344 754 186 828 160 Z" fill="rgba(43,108,183,0.12)"/>
          <path d="M320 326 C403 302 498 326 540 396 C572 447 546 516 488 558 C422 598 333 585 284 534 C239 487 242 350 320 326 Z" fill="url(#mountTexture)" opacity="0.26"/>
          <path d="M752 472 C842 450 950 472 1004 546 C1045 602 1035 680 965 718 C893 758 780 752 721 704 C664 658 659 514 752 472 Z" fill="rgba(217,123,38,0.12)"/>
          <path d="M527 638 C605 614 708 621 779 664 C823 691 836 756 790 797 C744 838 650 850 579 829 C511 808 463 746 478 692 C486 666 503 648 527 638 Z" fill="rgba(29,90,114,0.13)"/>

          {TERRITORIES.map((territory) => {
            const faction = FACTIONS[territory.id];
            return (
              <g key={territory.id} opacity={selectedFaction === 'all' || selectedFaction === territory.id || (selectedFaction === 'neutral' && territory.id === 'neutral') ? 1 : 0.58}>
                <path d={territory.path} fill={faction ? faction.color : '#6c7a86'} opacity="0.14" stroke={faction ? faction.color : '#6c7a86'} strokeWidth="3" />
                <text x={territory.labelX} y={territory.labelY} className="territory-label" fill={faction ? faction.color : '#555'}>{faction ? faction.name : territory.id}</text>
              </g>
            );
          })}

          {RIVERS.map((river, index) => <path key={index} d={river} stroke="#79a8c7" strokeWidth="5" fill="none" opacity="0.7" />)}
          {MOUNTAINS.map(([x,y], index) => (
            <g key={`m-${index}`} opacity="0.5">
              <path d={`M${x} ${y+16} L${x+16} ${y-16} L${x+32} ${y+16} Z`} fill="#ab9572" stroke="#7c674b" strokeWidth="1.4" />
              <path d={`M${x+8} ${y+16} L${x+20} ${y-8} L${x+30} ${y+16} Z`} fill="#c6b18a" opacity="0.7" />
            </g>
          ))}
          {FORESTS.map(([x,y], index) => (
            <g key={`f-${index}`} opacity="0.55">
              <path d={`M${x} ${y+18} L${x+10} ${y} L${x+20} ${y+18} Z`} fill="#4c6f4d" />
              <path d={`M${x+12} ${y+18} L${x+22} ${y+2} L${x+32} ${y+18} Z`} fill="#3f5f41" />
            </g>
          ))}

          {ROADS.map(([fromId, toId]) => {
            const from = locationMap.get(fromId);
            const to = locationMap.get(toId);
            if (!from || !to) return null;
            return (
              <line
                key={`${fromId}-${toId}`}
                x1={from.x * 12}
                y1={from.y * 9}
                x2={to.x * 12}
                y2={to.y * 9}
                stroke="#826e51"
                strokeWidth="2.5"
                strokeDasharray="7 6"
                opacity="0.55"
              />
            );
          })}

          {visible.map((loc) => {
            const faction = FACTIONS[loc.faction] || FACTIONS.neutral;
            const selected = selectedLocation?.id === loc.id;
            const px = loc.x * 12;
            const py = loc.y * 9;
            return (
              <g key={loc.id} className="map-node" onClick={() => setSelectedLocation(loc)}>
                <circle cx={px} cy={py} r={loc.type === 'capital' ? 13 : loc.mobile ? 10 : 8} fill={loc.lockedFree ? '#324149' : faction.color} stroke={selected ? '#fff' : '#f4eedf'} strokeWidth={selected ? 4 : 2} />
                <text x={px} y={py + 4} textAnchor="middle" fontSize="12" fill="#fff">{loc.icon}</text>
                <text x={px} y={py - 16} textAnchor="middle" className="map-label">{loc.name}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}

function CharacterCard({ character, onClick }) {
  const faction = FACTIONS[character.faction] || FACTIONS.neutral;
  return (
    <button className="character-card" onClick={onClick} style={{ borderTopColor: faction.color }}>
      <div className="character-card-head">
        <strong>{character.name}</strong>
        <span className={`kind-tag ${character.kind || 'support'}`}>{character.kind || 'support'}</span>
      </div>
      <small>{character.role}</small>
      <p>{character.bio}</p>
      <div className="pill-row">
        <span>{faction.name}</span>
        <span>{character.location}</span>
      </div>
    </button>
  );
}

function FactionDetail({ faction, characters, locations }) {
  return (
    <div>
      <h2>{faction.symbol} {faction.name}</h2>
      <p className="muted">{faction.desc}</p>
      <div className="detail-block"><strong>Trait</strong><p>{faction.trait}</p></div>
      <div className="detail-block"><strong>Sejarah Singkat</strong><p>{faction.history}</p></div>
      <div className="detail-block"><strong>Kekuatan</strong><p>{faction.power}</p></div>
      <div className="detail-block"><strong>Kelemahan</strong><p>{faction.weakness}</p></div>
      <div className="pill-row wrap">
        <span>{characters.filter((c) => c.kind === 'iconic').length} karakter ikonik</span>
        <span>{characters.length} total karakter</span>
        <span>{locations.length} wilayah tetap</span>
      </div>
    </div>
  );
}

function LocationDetail({ location, characters, onCharacter }) {
  const faction = FACTIONS[location.faction] || FACTIONS.neutral;
  return (
    <div>
      <h2>{location.icon} {location.name}</h2>
      <p className="muted"><b>Faksi:</b> <span style={{ color: faction.color }}>{faction.name}</span></p>
      <p className="muted"><b>Tipe:</b> {location.type} · <b>Populasi:</b> {(location.pop || 0).toLocaleString('id-ID')}</p>
      {location.mobile && <div className="notice">Tempat ini berpindah-pindah tiap turn.</div>}
      {location.lockedFree && <div className="notice blue">Wilayah ini tetap kosong dan bebas dari klaim permanen faksi mana pun.</div>}
      <div className="detail-block"><strong>Deskripsi Wilayah</strong><p>{location.desc}</p></div>
      <div className="detail-block"><strong>Lore Wilayah</strong><p>{location.lore}</p></div>
      <div className="detail-block"><strong>Sumber Daya</strong><div className="pill-row wrap">{location.resources.map((r) => <span key={r}>{r}</span>)}</div></div>
      <div className="detail-block"><strong>Karakter di Wilayah Ini</strong></div>
      <div className="simple-list">
        {characters.length === 0 ? <p className="muted">Belum ada karakter terdaftar di wilayah ini.</p> : characters.map((char) => (
          <button key={char.id} className="list-card" onClick={() => onCharacter(char)}>
            <div>
              <strong>{char.name}</strong>
              <small>{char.role}</small>
            </div>
            <span>{char.kind}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CharacterDetail({ character }) {
  const faction = FACTIONS[character.faction] || FACTIONS.neutral;
  return (
    <div>
      <h2 style={{ color: faction.color }}>{character.name}</h2>
      <p className="muted"><b>{faction.name}</b> · {character.role}</p>
      <div className="pill-row wrap">
        <span>{character.kind || 'support'}</span>
        <span>{character.location}</span>
        <span>Umur {character.age}</span>
      </div>
      <div className="detail-block"><strong>Biografi</strong><p>{character.bio}</p></div>
      <div className="detail-block"><strong>Drama / Arc</strong><p>{character.drama}</p></div>
      <div className="detail-block"><strong>Rahasia</strong><p>{character.secret}</p></div>
      {character.connections?.length ? (
        <div className="detail-block"><strong>Relasi dan Kaitan Cerita</strong><ul>{character.connections.map((item) => <li key={item}>{item}</li>)}</ul></div>
      ) : null}
      {character.stats ? (
        <div className="detail-block"><strong>Stat</strong>
          <div className="stats-grid">
            {Object.entries(character.stats).map(([key, val]) => (
              <div key={key}><span>{key}</span><b>{val}</b></div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GeneralDetail({ combinedCharacters }) {
  return (
    <div>
      <h2>Panel Detail</h2>
      <p className="muted">Klik faksi untuk melihat list karakter faksi tersebut. Klik karakter untuk melihat detail cerita. Klik mode peta untuk melihat tekstur peta dan detail wilayah.</p>
      <div className="detail-block"><strong>Ringkas</strong></div>
      <div className="pill-row wrap">
        <span>{ICONIC_CHARACTERS.length} karakter ikonik</span>
        <span>{combinedCharacters.filter((c) => c.kind === 'wanderer').length} pengembara random</span>
        <span>{combinedCharacters.filter((c) => c.kind === 'free').length} karakter bebas</span>
      </div>
    </div>
  );
}

export default App;
