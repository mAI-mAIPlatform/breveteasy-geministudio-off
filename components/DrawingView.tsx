import React, { useRef, useEffect, useState, useCallback } from 'react';

// Icons for the toolbar
const PenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const EraserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-2.828 0l-7 7a2 2 0 01-2.828 0l-1.414-1.414a2 2 0 010-2.828l7-7a2 2 0 012.828 0l1.414 1.414a2 2 0 002.828 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M4 20h16" /></svg>;
const RectangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5a1.5 1.5 0 0 1 1.5-1.5h15a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-15a1.5 1.5 0 0 1-1.5-1.5v-9z"/></svg>;
const CircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z"/></svg>;
const FillIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M.442 22.067a1 1 0 0 0 1.047.22l5.65-2.824a1 1 0 0 0 .11-1.68l-3.32-2.656a1 1 0 0 1-.22-1.047l2.825-5.65a1 1 0 0 1 1.68-.11l2.656 3.32a1 1 0 0 0 1.047.22l5.65-2.825a1 1 0 0 1 1.267 1.268l-2.824 5.65a1 1 0 0 1-1.68.11l-3.32-2.656a1 1 0 0 0-1.047.22l-2.825 5.65a1 1 0 0 0-.11 1.68l2.656 3.32a1 1 0 0 1-.22 1.047l-5.65 2.825a1 1 0 0 1-1.268-1.268Z" /><path strokeLinecap="round" strokeLinejoin="round" d="m10.232 13.768 5.65-5.65"/></svg>;
const UndoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 10h11.586l-2.293-2.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 12H3a1 1 0 01-1-1v-1a1 1 0 011-1z" /></svg>;
const RedoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 10h11.586l-2.293-2.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 12H3a1 1 0 01-1-1v-1a1 1 0 011-1z" transform="scale(-1, 1)" style={{transformOrigin: 'center'}} /></svg>;
const ClearIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

const PREDEFINED_COLORS = ['#000000', '#FFFFFF', '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55'];

export const DrawingView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startCoordsRef = useRef<{x: number, y: number} | null>(null);
  const snapshotRef = useRef<ImageData | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'fill'>('pen');
  const [shapeMode, setShapeMode] = useState<'stroke' | 'fill'>('stroke');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const setCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (canvas && container) {
      const { width, height } = container.getBoundingClientRect();
      const currentImage = historyIndex > -1 ? history[historyIndex] : null;

      canvas.width = width;
      canvas.height = height;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = color;
        context.fillStyle = color;
        context.lineWidth = brushSize;
        contextRef.current = context;
        if (currentImage) context.putImageData(currentImage, 0, 0);
      }
    }
  }, [brushSize, color, history, historyIndex]);

  useEffect(() => {
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    return () => { window.removeEventListener('resize', setCanvasSize); };
  }, [setCanvasSize]);

  useEffect(() => {
    const context = contextRef.current;
    if (context) {
      context.strokeStyle = color;
      context.fillStyle = color;
      context.lineWidth = brushSize;
    }
  }, [color, brushSize]);

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageData = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const getCoords = (e: MouseEvent | TouchEvent): {x: number, y: number} => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const event = e instanceof MouseEvent ? e : e.touches[0];
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const drawRectangle = (x: number, y: number, w: number, h: number) => {
    const context = contextRef.current!;
    if (shapeMode === 'fill') {
        context.fillRect(x, y, w, h);
    } else {
        context.strokeRect(x, y, w, h);
    }
  };

  const drawCircle = (x: number, y: number, w: number, h: number) => {
    const context = contextRef.current!;
    context.beginPath();
    const radiusX = Math.abs(w) / 2;
    const radiusY = Math.abs(h) / 2;
    context.ellipse(x + w / 2, y + h / 2, radiusX, radiusY, 0, 0, 2 * Math.PI);
    if (shapeMode === 'fill') context.fill();
    else context.stroke();
  };
  
  const floodFill = (startX: number, startY: number) => {
    const context = contextRef.current;
    const canvas = canvasRef.current;
    if (!context || !canvas) return;

    const [r, g, b] = hexToRgb(color);
    const fillColor = [r, g, b, 255];

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const startIdx = (startY * canvas.width + startX) * 4;
    const startColor = [data[startIdx], data[startIdx+1], data[startIdx+2], data[startIdx+3]];

    if (colorsMatch(startColor, fillColor)) return;

    const stack: [number, number][] = [[startX, startY]];
    while(stack.length > 0){
        const [x, y] = stack.pop()!;
        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;

        const idx = (y * canvas.width + x) * 4;
        if (colorsMatch([data[idx], data[idx+1], data[idx+2], data[idx+3]], startColor)){
            data[idx] = fillColor[0];
            data[idx+1] = fillColor[1];
            data[idx+2] = fillColor[2];
            data[idx+3] = fillColor[3];
            stack.push([x+1, y], [x-1, y], [x, y+1], [x, y-1]);
        }
    }
    context.putImageData(imageData, 0, 0);
  };
  
  const hexToRgb = (hex: string) => {
      let r = 0, g = 0, b = 0;
      if (hex.length === 4) {
          r = parseInt(hex[1] + hex[1], 16);
          g = parseInt(hex[2] + hex[2], 16);
          b = parseInt(hex[3] + hex[3], 16);
      } else if (hex.length === 7) {
          r = parseInt(hex[1] + hex[2], 16);
          g = parseInt(hex[3] + hex[4], 16);
          b = parseInt(hex[5] + hex[6], 16);
      }
      return [r, g, b];
  };

  const colorsMatch = (c1: number[], c2: number[]) => {
      return c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2] && c1[3] === c2[3];
  };


  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const context = contextRef.current!;
    const { x, y } = getCoords(e.nativeEvent);

    if (tool === 'fill') {
        floodFill(Math.floor(x), Math.floor(y));
        saveHistory();
        return;
    }

    setIsDrawing(true);
    startCoordsRef.current = {x, y};
    context.beginPath();
    context.moveTo(x, y);

    if (tool === 'rectangle' || tool === 'circle') {
        snapshotRef.current = context.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const context = contextRef.current!;
    const { x, y } = getCoords(e.nativeEvent);
    
    if (tool === 'pen' || tool === 'eraser') {
        context.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
        context.lineTo(x, y);
        context.stroke();
    } else if (tool === 'rectangle' || tool === 'circle') {
        if (snapshotRef.current) context.putImageData(snapshotRef.current, 0, 0);
        const start = startCoordsRef.current!;
        const width = x - start.x;
        const height = y - start.y;
        if(tool === 'rectangle') drawRectangle(start.x, start.y, width, height);
        else drawCircle(start.x, start.y, width, height);
    }
  };
  
  const handleMouseUp = () => {
    if (!isDrawing) return;
    const context = contextRef.current!;
    context.closePath();
    setIsDrawing(false);

    if (tool === 'rectangle' || tool === 'circle') {
        // Final draw on mouse up, so it gets saved in history
        if (snapshotRef.current) context.putImageData(snapshotRef.current, 0, 0);
        const start = startCoordsRef.current!;
        const canvas = canvasRef.current!;
        const { x, y } = {x: 0, y: 0}; // these are not available on mouseup, need to get from last event or other means, but for this use case we'll redraw based on last mouse move.
        // Let's re-think: draw is handled on mouseMove, mouseUp just finalizes it.
        // The last drawn shape on mouseMove is the one we want. So we just need to save history.
    }

    saveHistory();
    startCoordsRef.current = null;
    snapshotRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const context = contextRef.current!;
    context.clearRect(0, 0, canvas.width, canvas.height);
    saveHistory();
  };

  const undo = () => {
    if (historyIndex >= 0) { // Allow undo to clear canvas
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const context = contextRef.current!;
      const canvas = canvasRef.current!;
      if (newIndex > -1) {
        context.putImageData(history[newIndex], 0, 0);
      } else {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };
  
  const redo = () => {
      if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          const imageData = history[newIndex];
          contextRef.current!.putImageData(imageData, 0, 0);
      }
  };
  
  const downloadImage = () => {
      const canvas = canvasRef.current!;
      const link = document.createElement('a');
      link.download = 'mon-dessin.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
  };

  const tools = [
    { id: 'pen', icon: <PenIcon />, label: 'Crayon' },
    { id: 'eraser', icon: <EraserIcon />, label: 'Gomme' },
    { id: 'rectangle', icon: <RectangleIcon />, label: 'Rectangle' },
    { id: 'circle', icon: <CircleIcon />, label: 'Cercle' },
    { id: 'fill', icon: <FillIcon />, label: 'Remplissage' },
  ];

  return (
    <div className="w-full h-full flex flex-col gap-4 animate-fade-in">
        <h1 className="text-4xl font-bold text-center text-slate-900 dark:text-white">Arts</h1>
        <div className="flex flex-col items-center justify-center gap-2 p-3 bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-2xl shadow-lg flex-wrap">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                {tools.map(({id, icon, label}) => (
                    <button key={id} onClick={() => setTool(id as any)} className={`p-3 rounded-full transition-colors ${tool === id ? 'bg-indigo-500 text-white' : 'hover:bg-slate-200/50 dark:hover:bg-slate-700'}`} title={label} aria-label={`Activer ${label}`}><span className="w-6 h-6 block">{icon}</span></button>
                ))}
                {(tool === 'rectangle' || tool === 'circle') && (
                    <div className="flex items-center gap-2 ml-2 p-1 bg-slate-200/50 dark:bg-slate-800 rounded-full">
                        <button onClick={() => setShapeMode('stroke')} className={`px-3 py-1 text-sm font-semibold rounded-full ${shapeMode === 'stroke' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}>Contour</button>
                        <button onClick={() => setShapeMode('fill')} className={`px-3 py-1 text-sm font-semibold rounded-full ${shapeMode === 'fill' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}>Remplissage</button>
                    </div>
                )}
            </div>
            <div className="w-full h-px bg-slate-300 dark:bg-slate-700 my-1"></div>
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 p-1 bg-transparent border-2 border-slate-300 dark:border-slate-600 rounded-full cursor-pointer" title="Couleur" aria-label="Choisir la couleur"/>
                <div className="flex items-center gap-1">
                    {PREDEFINED_COLORS.map(c => (
                        <button key={c} onClick={() => setColor(c)} style={{backgroundColor: c}} className={`w-6 h-6 rounded-full border-2 ${color.toUpperCase() === c ? 'border-indigo-500 scale-110' : 'border-slate-300 dark:border-slate-600'} transition-transform`} aria-label={`Choisir la couleur ${c}`}/>
                    ))}
                </div>
                <div className="h-8 w-px bg-slate-300 dark:bg-slate-600 hidden sm:block mx-2"></div>
                 <div className="flex items-center gap-2">
                    <label htmlFor="brushSize" className="text-sm font-semibold">Taille:</label>
                    <input id="brushSize" type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-24 sm:w-32 cursor-pointer" aria-label="Taille du pinceau"/>
                </div>
                <div className="h-8 w-px bg-slate-300 dark:bg-slate-600 hidden sm:block mx-2"></div>
                <button onClick={undo} disabled={historyIndex < 0} className="p-3 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed" title="Annuler" aria-label="Annuler la dernière action"><UndoIcon /></button>
                <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-3 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed" title="Rétablir" aria-label="Rétablir la dernière action"><RedoIcon /></button>
                <button onClick={clearCanvas} className="p-3 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700 text-red-500" title="Effacer tout" aria-label="Effacer toute la toile"><ClearIcon /></button>
                <button onClick={downloadImage} className="p-3 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700" title="Télécharger" aria-label="Télécharger le dessin"><DownloadIcon /></button>
            </div>
        </div>
        <div ref={containerRef} className="flex-grow w-full bg-white dark:bg-slate-100 rounded-2xl shadow-inner overflow-hidden">
            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchStart={handleMouseDown}
                onTouchEnd={handleMouseUp}
                onTouchMove={handleMouseMove}
                className="cursor-crosshair"
            />
        </div>
    </div>
  );
};
