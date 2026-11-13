import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Award,
  Lock,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  RefreshCw,
  QrCode,
  RotateCcw,
  Compass
} from 'lucide-react';

export const HolographicNFTDeedCard: React.FC = () => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [mintStage, setMintStage] = useState<'idle' | 'scanning' | 'hashing' | 'consensus' | 'minted'>('idle');
  const [hashText, setHashText] = useState('0x8f2a41d99b031ce7b99c89e4726b12a873e4912a');
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse tilt tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -12;
    const rotY = ((x - centerX) / centerX) * 12;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50 });
  };

  // Trigger crazy blockchain minting simulation
  const handleTriggerMint = () => {
    if (mintStage !== 'idle' && mintStage !== 'minted') return;

    setMintStage('scanning');

    // Step 1: Laser scanning beacons
    setTimeout(() => {
      setMintStage('hashing');
    }, 1200);

    // Step 2: Compute hash
    setTimeout(() => {
      setMintStage('consensus');
    }, 2400);

    // Step 3: Minted!
    setTimeout(() => {
      setMintStage('minted');
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 }
      });
    }, 3600);
  };

  // Matrix-style hash scrambling during hashing step
  useEffect(() => {
    if (mintStage === 'hashing') {
      const interval = setInterval(() => {
        const hex = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        setHashText(hex);
      }, 70);
      return () => clearInterval(interval);
    } else if (mintStage === 'minted') {
      setHashText('0x9a8f4b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a');
    }
  }, [mintStage]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none perspective-[1000px] w-full max-w-md mx-auto">
      {/* 3D Container */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full relative transition-transform duration-200 ease-out cursor-pointer"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${isFlipped ? 'rotateY(180deg)' : ''}`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Glow ambient background aura (Softened) */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#6338F5] via-[#168BFF] to-[#F0B429] rounded-3xl blur-lg opacity-10 pointer-events-none" />

        {/* FRONT OF CARD */}
        <div
          className={`relative rounded-3xl border border-amber-400/25 bg-[#0d1233]/95 backdrop-blur-xl p-6 shadow-sm overflow-hidden transition-all duration-300 ${
            isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          style={{
            backgroundImage: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(240, 180, 41, 0.09) 0%, rgba(99, 56, 245, 0.07) 40%, rgba(8, 13, 36, 0.96) 100%)`
          }}
        >
          {/* Holographic Iridescent Moving Sheen */}
          <div
            className="absolute inset-0 pointer-events-none opacity-15"
            style={{
              background: `linear-gradient(${glarePos.x * 3.6}deg, rgba(255,255,255,0.28) 0%, rgba(22, 139, 255, 0.2) 30%, rgba(99, 56, 245, 0.25) 70%, transparent 100%)`,
              mixBlendMode: 'overlay'
            }}
          />

          {/* Top Hologram Ribbon */}
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/30 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <ShieldCheck className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-widest block">
                  ANAGU SOVEREIGN NFT DEED
                </span>
                <span className="text-xs font-bold text-white font-mono">
                  C-OF-O-2026-004912
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>ERC-721-CADASTRE</span>
            </div>
          </div>

          {/* Interactive Cadastral Polygon Map Preview */}
          <div className="my-4 relative h-48 rounded-2xl bg-[#070b20] border border-indigo-500/30 overflow-hidden flex items-center justify-center">
            {/* Animated Laser Scanning Line */}
            <div
              className={`absolute top-0 bottom-0 w-1 bg-gradient-to-r from-transparent via-[#168BFF] to-transparent shadow-[0_0_15px_#168BFF] z-20 pointer-events-none ${
                mintStage === 'scanning' ? 'animate-[spin_2s_linear_infinite]' : 'animate-[bounce_4s_infinite]'
              }`}
              style={{
                left: `${glarePos.x}%`,
                filter: 'drop-shadow(0 0 8px #13C98A)'
              }}
            />

            <svg viewBox="0 0 300 200" className="w-full h-full relative z-10 p-2">
              <defs>
                <linearGradient id="plotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6338F5" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#168BFF" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="20" y1="100" x2="280" y2="100" stroke="rgba(99,102,241,0.15)" strokeDasharray="4 4" />
              <line x1="150" y1="20" x2="150" y2="180" stroke="rgba(99,102,241,0.15)" strokeDasharray="4 4" />

              {/* Cadastral Polygon */}
              <polygon
                points="70,40 220,55 190,165 50,140"
                fill="url(#plotGradient)"
                stroke="#F0B429"
                strokeWidth="2.5"
                className="transition-all duration-300"
              />

              {/* Beacons with pulsating rings */}
              {[
                { x: 70, y: 40, label: 'BC-01 (6.4382°N)' },
                { x: 220, y: 55, label: 'BC-02 (6.4389°N)' },
                { x: 190, y: 165, label: 'BC-03 (6.4384°N)' },
                { x: 50, y: 140, label: 'BC-04 (6.4377°N)' }
              ].map((b, idx) => (
                <g key={idx}>
                  <circle cx={b.x} cy={b.y} r="6" fill="#F0B429" stroke="#080D24" strokeWidth="2" />
                  <circle
                    cx={b.x}
                    cy={b.y}
                    r="10"
                    fill="none"
                    stroke="#F0B429"
                    strokeWidth="1"
                    className="animate-ping opacity-60"
                  />
                  <text x={b.x + 8} y={b.y + 3} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                    {b.label}
                  </text>
                </g>
              ))}

              {/* Center Stamp */}
              <text x="105" y="110" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                1,250 m²
              </text>
              <text x="108" y="124" fill="#13C98A" fontSize="9" fontFamily="monospace">
                TOPOLOGY VALID
              </text>
            </svg>

            {/* Radar Sweep Effect */}
            <div className="absolute inset-0 bg-radial from-transparent via-cyan-500/5 to-transparent pointer-events-none" />
          </div>

          {/* Token Metadata Breakdown */}
          <div className="space-y-2 text-xs relative z-10">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-400">Owner (NIN Linked):</span>
              <span className="text-white font-bold">Chief Emeka Adeleke</span>
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-400">Jurisdiction:</span>
              <span className="text-indigo-300">Lekki Phase 1, Lagos State</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#080d24]/90 border border-slate-800 space-y-1 font-mono text-[10px]">
              <div className="text-slate-400 flex items-center justify-between">
                <span>Cryptographic Digest:</span>
                <span className="text-amber-400">Block #1861005</span>
              </div>
              <div className="text-emerald-400 truncate">{hashText}</div>
            </div>
          </div>

          {/* Minting Status Alert */}
          {mintStage !== 'idle' && (
            <div className="mt-3 p-2 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-[11px] font-mono text-center relative z-10 animate-in fade-in">
              {mintStage === 'scanning' && <span className="text-amber-300">📡 Scanning 4 WGS-84 Beacons...</span>}
              {mintStage === 'hashing' && <span className="text-indigo-300">⚡ Generating SHA-256 Merkle Root...</span>}
              {mintStage === 'consensus' && <span className="text-blue-300">🛡️ 4/4 BFT Nodes Signing Assent...</span>}
              {mintStage === 'minted' && (
                <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>TOKEN COMMITTED TO CONSENSUS LEDGER!</span>
                </span>
              )}
            </div>
          )}

          {/* Action Strip: Mint Simulation & 3D Flip */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2 relative z-10">
            <button
              onClick={handleTriggerMint}
              disabled={mintStage !== 'idle' && mintStage !== 'minted'}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#6338F5] to-[#168BFF] text-white text-xs font-bold uppercase tracking-wider hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{mintStage === 'minted' ? 'Mint Again' : 'Simulate Minting'}</span>
            </button>

            <button
              onClick={() => setIsFlipped(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Flip to inspect Smart Contract bytecode"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BACK OF CARD (Flipped State) */}
        <div
          className={`absolute inset-0 rounded-3xl border-2 border-indigo-500/40 bg-[#0d1233]/98 backdrop-blur-xl p-6 shadow-2xl overflow-hidden transition-all duration-300 ${
            !isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-indigo-500/30">
            <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              Smart Contract Bytecode & Invariants
            </span>
            <button
              onClick={() => setIsFlipped(false)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs"
            >
              Flip Back
            </button>
          </div>

          <div className="space-y-3 mt-4 text-xs font-mono">
            <div className="p-3 bg-[#080d24] rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400">EVM Token Address</div>
              <div className="text-indigo-400 text-[11px] truncate">
                0x71C6372985B8e949182a41d99b031ce7b99c89e4
              </div>
            </div>

            <div className="p-3 bg-[#080d24] rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400">Decentralized IPFS CID</div>
              <div className="text-amber-400 text-[11px] truncate">
                QmZtmD2qt8S991eZg9z48v9324hfkz924jfe949
              </div>
            </div>

            <div className="p-3 bg-[#080d24] rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400">Solidity Restriction Invariant</div>
              <div className="text-emerald-400 text-[10px]">
                require(registryApproved[from][to], "Direct P2P conveyances prohibited by Land Use Act");
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
              <span>Standard: ERC-721-CADASTRE</span>
              <span className="text-white font-bold">State Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
