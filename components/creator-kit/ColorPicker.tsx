import React, { useState, useCallback, useMemo } from 'react';
import { useDrag } from '../../hooks/useDrag';
import { CheckIcon } from '../icons';

// Color conversion utilities
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

// Sub-components for the color picker
const SVArea: React.FC<{ h: number; s: number; v: number; onChange: (pos: { x: number; y: number }) => void }> = ({ h, s, v, onChange }) => {
  const { containerRef, onDragStart } = useDrag({ onDrag: onChange });
  const backgroundColor = `hsl(${h * 360}, 100%, 50%)`;
  const thumbRgba = hsvToRgba(h,s,v,1);
  return (
    <div ref={containerRef} onMouseDown={onDragStart} onTouchStart={onDragStart} className="relative w-full h-48 cursor-pointer rounded-lg overflow-hidden" style={{ backgroundColor }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, white, transparent)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, black, transparent)' }} />
      <div className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none" style={{ left: `${s * 100}%`, top: `${(1 - v) * 100}%`, backgroundColor: rgbaToCss(thumbRgba.r, thumbRgba.g, thumbRgba.b, thumbRgba.a) }} />
    </div>
  );
};

const Slider: React.FC<{ value: number; onChange: (pos: { x: number }) => void; gradient: string }> = ({ value, onChange, gradient }) => {
    const { containerRef, onDragStart } = useDrag({ onDrag: ({ x }) => onChange({ x }) });
    return (
        <div ref={containerRef} onMouseDown={onDragStart} onTouchStart={onDragStart} className="relative w-full h-5 cursor-pointer rounded-full" style={{ background: gradient }}>
            <div className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 top-1/2 rounded-full border-2 border-white shadow-md pointer-events-none bg-transparent" style={{ left: `${value * 100}%` }} />
        </div>
    );
};

const swatches = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#f8fafc', '#64748b', '#1e293b'];

export const ColorPicker: React.FC<{ onSelectColor: (color: string) => void }> = ({ onSelectColor }) => {
  const [h, setH] = useState(0);
  const [s, setS] = useState(1);
  const [v, setV] = useState(1);
  const [a, setA] = useState(1);

  const rgba = useMemo(() => hsvToRgba(h, s, v, a), [h, s, v, a]);
  const hex = useMemo(() => rgbaToHex(rgba.r, rgba.g, rgba.b), [rgba]);

  const handleSVChange = useCallback(({ x, y }: { x: number; y: number }) => { setS(x); setV(1 - y); }, []);
  const handleHueChange = useCallback(({ x }: { x: number }) => setH(x), []);
  const handleAlphaChange = useCallback(({ x }: { x: number }) => setA(x), []);

  return (
    <div className="p-4 h-full flex flex-col gap-4 text-white">
      <SVArea h={h} s={s} v={v} onChange={handleSVChange} />
      <div className="flex flex-col gap-3">
        <Slider value={h} onChange={handleHueChange} gradient="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" />
        <Slider value={a} onChange={handleAlphaChange} gradient={`linear-gradient(to right, transparent, ${rgbaToCss(rgba.r, rgba.g, rgba.b, 1)})`} />
      </div>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-md border border-zinc-600" style={{ backgroundColor: rgbaToCss(rgba.r, rgba.g, rgba.b, rgba.a) }} />
        <div className="flex-1 text-sm font-mono">
          <p>{hex}</p>
          <p>{rgbaToCss(rgba.r, rgba.g, rgba.b, rgba.a)}</p>
        </div>
      </div>
      <div className="grid grid-cols-10 gap-2">
        {swatches.map(color => (
          <button key={color} onClick={() => onSelectColor(color)} className="w-full aspect-square rounded-md border border-zinc-700" style={{ backgroundColor: color }} />
        ))}
      </div>
      <button onClick={() => onSelectColor(rgbaToCss(rgba.r, rgba.g, rgba.b, rgba.a))} className="w-full mt-auto py-2.5 px-4 font-semibold bg-white text-black rounded-md hover:bg-zinc-200 transition-colors">
        Add to Prompt
      </button>
    </div>
  );
};