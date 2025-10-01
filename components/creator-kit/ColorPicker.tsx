import React, { useState, useCallback, useMemo } from 'react';
import { useDrag } from '../../hooks/useDrag';
import { TrashIcon } from '../icons';

// --- Color Conversion Utilities ---
const hsvToRgba = (h: number, s: number, v: number, a: number) => {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = 0, g = 0, b = 0;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a };
};

const rgbaToCss = (r: number, g: number, b: number, a: number) => `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
const rgbaToHex = (r: number, g: number, b: number) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

// --- Sub-components ---
const SVArea: React.FC<{ h: number; s: number; v: number; onChange: (pos: { x: number; y: number }) => void }> = ({ h, s, v, onChange }) => {
  const { containerRef, onDragStart } = useDrag({ onDrag: onChange });
  const backgroundColor = `hsl(${h * 360}, 100%, 50%)`;
  const thumbRgba = hsvToRgba(h,s,v,1);
  return (
    <div ref={containerRef} onMouseDown={onDragStart} onTouchStart={onDragStart} className="relative w-full h-40 cursor-pointer rounded-md overflow-hidden" style={{ backgroundColor }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, white, transparent)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, black, transparent)' }} />
      <div className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none" style={{ left: `${s * 100}%`, top: `${(1 - v) * 100}%`, backgroundColor: rgbaToCss(thumbRgba.r, thumbRgba.g, thumbRgba.b, thumbRgba.a) }} />
    </div>
  );
};

const Slider: React.FC<{ value: number; onChange: (x: number) => void; gradient: string }> = ({ value, onChange, gradient }) => {
    const { containerRef, onDragStart } = useDrag({ onDrag: ({ x }) => onChange(x) });
    return (
        <div ref={containerRef} onMouseDown={onDragStart} onTouchStart={onDragStart} className="relative w-full h-5 cursor-pointer rounded-full" style={{ background: gradient }}>
            <div className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 top-1/2 rounded-full border-2 border-white shadow-md pointer-events-none bg-transparent" style={{ left: `${value * 100}%` }} />
        </div>
    );
};

// --- Main Component ---
const swatches = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#0783ff', '#8b5cf6', '#d946ef', '#f8fafc', '#64748b', '#000000'];

interface Stop {
    id: number;
    h: number; s: number; v: number; a: number;
    position: number; // 0 to 1
}

let nextStopId = 2;
const initialStops: Stop[] = [
    { id: 0, h: 0.58, s: 1, v: 1, a: 1, position: 0 },
    { id: 1, h: 0, s: 0, v: 0.2, a: 1, position: 1 },
];

export const ColorPicker: React.FC<{ onSelectColor: (color: string) => void }> = ({ onSelectColor }) => {
    const [mode, setMode] = useState<'solid' | 'gradient'>('solid');

    // Solid state
    const [h, setH] = useState(0.58);
    const [s, setS] = useState(1);
    const [v, setV] = useState(1);
    const [a, setA] = useState(1);

    // Gradient state
    const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
    const [angle, setAngle] = useState(90);
    const [stops, setStops] = useState<Stop[]>(initialStops);
    const [activeStopId, setActiveStopId] = useState<number | null>(0);
    
    const activeStop = useMemo(() => stops.find(stop => stop.id === activeStopId), [stops, activeStopId]);
    
    // --- Memos for derived color values ---
    const solidRgba = useMemo(() => hsvToRgba(h, s, v, a), [h, s, v, a]);
    const solidHex = useMemo(() => rgbaToHex(solidRgba.r, solidRgba.g, solidRgba.b), [solidRgba]);
    const activeStopHsv = useMemo(() => activeStop || { h:0, s:0, v:0, a:1 }, [activeStop]);
    const activeStopRgba = useMemo(() => hsvToRgba(activeStopHsv.h, activeStopHsv.s, activeStopHsv.v, activeStopHsv.a), [activeStopHsv]);

    const gradientCss = useMemo(() => {
        const sortedStops = [...stops].sort((a, b) => a.position - b.position);
        const colorStops = sortedStops.map(stop => {
            const { r, g, b, a: stopA } = hsvToRgba(stop.h, stop.s, stop.v, stop.a);
            return `${rgbaToCss(r, g, b, stopA)} ${Math.round(stop.position * 100)}%`;
        }).join(', ');

        if (gradientType === 'linear') return `linear-gradient(${angle}deg, ${colorStops})`;
        return `radial-gradient(circle, ${colorStops})`;
    }, [stops, gradientType, angle]);

    // --- Handlers ---
    const updateActiveStop = useCallback((change: Partial<Stop>) => {
        if (activeStopId === null) return;
        setStops(stops.map(stop => stop.id === activeStopId ? { ...stop, ...change } : stop));
    }, [activeStopId, stops]);

    const handleSVChange = useCallback(({ x, y }: { x: number; y: number }) => {
        if (mode === 'solid') { setS(x); setV(1 - y); } 
        else { updateActiveStop({ s: x, v: 1 - y }); }
    }, [mode, updateActiveStop]);

    const handleHueChange = useCallback((newH: number) => {
        if (mode === 'solid') { setH(newH); } 
        else { updateActiveStop({ h: newH }); }
    }, [mode, updateActiveStop]);
    
    const handleAlphaChange = useCallback((newA: number) => {
        if (mode === 'solid') { setA(newA); } 
        else { updateActiveStop({ a: newA }); }
    }, [mode, updateActiveStop]);

    const handleAngleChange = useCallback((newAngle: number) => setAngle(Math.round(newAngle * 360)), []);

    const { containerRef: gradientBarRef, onDragStart: onDragStopStart } = useDrag({
        onDrag: ({ x }) => updateActiveStop({ position: x })
    });
    
    const handleAddStop = () => {
        if (stops.length >= 5) return;
        const newStop: Stop = { id: nextStopId++, h: 0.6, s: 1, v: 1, a: 1, position: 0.5 };
        const newStops = [...stops, newStop].sort((a, b) => a.position - b.position);
        setStops(newStops);
        setActiveStopId(newStop.id);
    };

    const handleRemoveStop = () => {
        if (stops.length <= 2 || activeStopId === null) return;
        const newStops = stops.filter(s => s.id !== activeStopId);
        setStops(newStops);
        setActiveStopId(newStops[0]?.id ?? null);
    };

    const handleSelectSwatch = (hex: string) => {
      onSelectColor(hex);
    };
    
    const handleSubmit = () => {
        const result = mode === 'solid' ? rgbaToCss(solidRgba.r, solidRgba.g, solidRgba.b, solidRgba.a) : gradientCss;
        onSelectColor(result);
    };

    const hsvForEditor = mode === 'solid' ? { h, s, v, a } : activeStopHsv;
    const rgbaForEditor = mode === 'solid' ? solidRgba : activeStopRgba;
    const hexForEditor = mode === 'solid' ? solidHex : rgbaToHex(activeStopRgba.r, activeStopRgba.g, activeStopRgba.b);

    return (
        <div className="p-4 flex flex-col text-white gap-3 h-full">
            <div className="flex-shrink-0">
                <div className="flex items-center p-1 bg-zinc-900 border border-zinc-700 rounded-md">
                    <button onClick={() => setMode('solid')} className={`flex-1 py-1 text-sm font-medium rounded ${mode === 'solid' ? 'bg-zinc-700' : 'hover:bg-zinc-800'}`}>Solid</button>
                    <button onClick={() => setMode('gradient')} className={`flex-1 py-1 text-sm font-medium rounded ${mode === 'gradient' ? 'bg-zinc-700' : 'hover:bg-zinc-800'}`}>Gradient</button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col gap-3 min-h-0">
                <SVArea h={hsvForEditor.h} s={hsvForEditor.s} v={hsvForEditor.v} onChange={handleSVChange} />
                <Slider value={hsvForEditor.h} onChange={handleHueChange} gradient="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" />
                <Slider value={hsvForEditor.a} onChange={handleAlphaChange} gradient={`linear-gradient(to right, transparent, ${rgbaToCss(rgbaForEditor.r, rgbaForEditor.g, rgbaForEditor.b, 1)})`} />

                {mode === 'gradient' && (
                    <div className="space-y-2">
                        <div ref={gradientBarRef} onMouseDown={onDragStopStart} onTouchStart={onDragStopStart} className="relative w-full h-8 cursor-pointer rounded-md" style={{ background: gradientCss }}>
                            {stops.map(stop => {
                                const rgba = hsvToRgba(stop.h, stop.s, stop.v, stop.a);
                                return (
                                <button key={stop.id} onClick={() => setActiveStopId(stop.id)} className={`absolute -top-1 w-5 h-10 rounded-sm focus:outline-none transition-transform duration-100 ${activeStopId === stop.id ? 'scale-110 z-10' : ''}`} style={{ left: `calc(${stop.position * 100}% - 10px)` }}>
                                    {/* Fix: Replaced an unsafe spread of `Object.values` with a type-safe call to `rgbaToCss` to ensure color properties are passed correctly. */}
                                    <div className={`w-full h-full rounded-sm border-2 ${activeStopId === stop.id ? 'border-white' : 'border-zinc-400'}`} style={{ backgroundColor: rgbaToCss(rgba.r, rgba.g, rgba.b, rgba.a) }} />
                                </button>
                                );
                            })}
                        </div>
                        {gradientType === 'linear' && <Slider value={angle/360} onChange={handleAngleChange} gradient="linear-gradient(to right, #888, #fff, #888)" />}
                    </div>
                )}
                
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-zinc-900 p-2 rounded-md border border-zinc-700">HEX<br/><span className="text-sm font-semibold">{hexForEditor}</span></div>
                    <div className="bg-zinc-900 p-2 rounded-md border border-zinc-700">RGBA<br/><span className="text-sm font-semibold">{`${rgbaForEditor.r}, ${rgbaForEditor.g}, ${rgbaForEditor.b}, ${rgbaForEditor.a.toFixed(2)}`}</span></div>
                </div>

                {mode === 'gradient' && (
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center p-1 bg-zinc-900 border border-zinc-700 rounded-md">
                            <button onClick={() => setGradientType('linear')} className={`px-2 py-0.5 text-xs rounded ${gradientType === 'linear' ? 'bg-zinc-700' : ''}`}>Linear</button>
                            <button onClick={() => setGradientType('radial')} className={`px-2 py-0.5 text-xs rounded ${gradientType === 'radial' ? 'bg-zinc-700' : ''}`}>Radial</button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleAddStop} disabled={stops.length >= 5} className="px-3 py-1 text-xs bg-zinc-800 rounded-md disabled:opacity-50">+</button>
                            <button onClick={handleRemoveStop} disabled={stops.length <= 2} className="p-1.5 bg-zinc-800 rounded-md disabled:opacity-50"><TrashIcon className="w-3 h-3"/></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Swatches and Submit */}
            <div className="flex-shrink-0 flex flex-col gap-3">
                 <div>
                    <p className="text-xs text-zinc-400 mb-1">Swatches</p>
                    <div className="grid grid-cols-10 gap-1">
                        {swatches.map(color => <button key={color} onClick={() => handleSelectSwatch(color)} className="w-full aspect-square rounded-md border border-zinc-700" style={{ backgroundColor: color }} />)}
                    </div>
                 </div>
                <button onClick={handleSubmit} className="w-full py-2 px-4 font-semibold bg-white text-black rounded-md hover:bg-zinc-200 transition-colors">
                    Add to Prompt
                </button>
            </div>
        </div>
    );
};