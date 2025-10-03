import React, { useRef, useEffect, useState } from 'react';
import { CloseIcon, PencilIcon, TrashIcon } from './icons';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageDataUrl: string | null;
  onAttach: (file: File) => void;
}

const colors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#0EA5E9', '#8B5CF6', '#EC4899'];
const brushSizes = [2, 5, 10, 20];

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ isOpen, onClose, imageDataUrl, onAttach }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#EF4444');
  const [brushSize, setBrushSize] = useState(5);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const drawInitialImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageDataUrl) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const image = new Image();
    image.src = imageDataUrl;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);
    };
  };

  useEffect(() => {
    if (isOpen) {
        drawInitialImage();
    }
  }, [isOpen, imageDataUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.strokeStyle = brushColor;
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineJoin = 'round';
  }, [brushColor, brushSize]);

  const getCoords = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const event = 'touches' in e.nativeEvent ? e.nativeEvent.touches[0] : e;
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCoords(e);
    if (!coords) return;
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;

    context.beginPath();
    context.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    context.closePath();
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const coords = getCoords(e);
    if (!coords) return;
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;

    context.lineTo(coords.x, coords.y);
    context.stroke();
  };
  
  const handleAttach = () => {
    canvasRef.current?.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `annotated-image-${Date.now()}.png`, { type: 'image/png' });
        onAttach(file);
      }
    }, 'image/png');
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-4xl h-full max-h-[90vh] bg-black border border-zinc-700 shadow-2xl text-white transition-all duration-300 rounded-xl flex flex-col ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex-shrink-0 p-4 border-b border-zinc-700 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <PencilIcon className="w-5 h-5" />
            Annotate Image
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full text-zinc-500 hover:bg-zinc-800 z-20">
            <CloseIcon className="w-5 h-5" />
          </button>
        </header>
        
        <main className="flex-1 flex flex-col md:flex-row min-h-0">
          <div className="flex-shrink-0 md:border-r border-zinc-700 p-4 flex md:flex-col items-center justify-center gap-4 bg-zinc-950">
            <div className="flex md:flex-col gap-2">
                {colors.map(color => (
                    <button key={color} onClick={() => setBrushColor(color)} className={`w-8 h-8 rounded-full transition-transform ${brushColor === color ? 'ring-2 ring-offset-2 ring-offset-black ring-white scale-110' : ''}`} style={{ backgroundColor: color }} aria-label={`Select color ${color}`} />
                ))}
            </div>
            <div className="h-full w-px md:h-px md:w-full bg-zinc-700" />
            <div className="flex md:flex-col gap-3">
                {brushSizes.map(size => (
                    <button key={size} onClick={() => setBrushSize(size)} className={`bg-zinc-800 rounded-full transition-transform flex items-center justify-center ${brushSize === size ? 'ring-2 ring-offset-2 ring-offset-black ring-white scale-110' : 'hover:bg-zinc-700'}`} style={{ width: `${size+12}px`, height: `${size+12}px`}} aria-label={`Set brush size to ${size}px`}>
                        <div className="bg-white rounded-full" style={{ width: `${size}px`, height: `${size}px`}} />
                    </button>
                ))}
            </div>
            <div className="h-full w-px md:h-px md:w-full bg-zinc-700" />
            <button onClick={drawInitialImage} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-zinc-300" title="Clear drawings">
                <TrashIcon className="w-5 h-5"/>
            </button>
          </div>
          <div className="flex-1 p-4 overflow-auto flex items-center justify-center bg-black">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full object-contain cursor-crosshair rounded-md"
              onMouseDown={startDrawing}
              onMouseUp={finishDrawing}
              onMouseLeave={finishDrawing}
              onMouseMove={draw}
              onTouchStart={startDrawing}
              onTouchEnd={finishDrawing}
              onTouchMove={draw}
            />
          </div>
        </main>
        
        <footer className="flex-shrink-0 p-4 bg-zinc-950 border-t border-zinc-700 flex justify-end gap-4">
            <button onClick={onClose} className="px-4 py-2 font-semibold text-zinc-300 bg-transparent rounded-md hover:bg-zinc-800 transition-colors">Cancel</button>
            <button onClick={handleAttach} className="px-5 py-2 font-semibold bg-white text-black rounded-md hover:bg-zinc-200 transition-colors">Attach Image</button>
        </footer>
      </div>
    </div>
  );
};