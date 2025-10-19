import React, { useRef, useEffect, useState, useCallback } from 'react';

// --- TYPE DEFINITIONS ---
type Tool = 'pen' | 'eraser' | 'rectangle' | 'circle' | 'fill' | 'line' | 'text' | 'eyedropper';
type ShapeMode = 'stroke' | 'fill';
interface Layer {
  id: string;
  name: string;
  isVisible: boolean;
}
interface Transform {
  scale: number;
  offsetX: number;
  offsetY: number;
}
interface HistoryEntry {
  layerId: string;
  imageData: ImageData;
}
interface TextElement {
  x: number;
  y: number;
  content: string;
  color: string;
  size: number;
  font: string;
  isEditing: boolean;
}

// --- ICONS ---
const PenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const EraserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-2.828 0l-7 7a2 2 0 01-2.828 0l-1.414-1.414a2 2 0 010-2.828l7-7a2 2 0 012.828 0l1.414 1.414a2 2 0 002.828 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M4 20h16" /></svg>;
const RectangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5a1.5 1.5 0 0 1 1.5-1.5h15a1.5 1.5 0 0 1 1.5-1.5v9a1.5 1.5 0 0 1-1.5-1.5h-15a1.5 1.5 0 0 1-1.5-1.5v-9z"/></svg>;
const CircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z"/></svg>;
const FillIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M.442 22.067a1 1 0 0 0 1.047.22l5.65-2.824a1 1 0 0 0 .11-1.68l-3.32-2.656a1 1 0 0 1-.22-1.047l2.825-5.65a1 1 0 0 1 1.68-.11l2.656 3.32a1 1 0 0 0 1.047.22l5.65-2.825a1 1 0 0 1 1.267 1.268l-2.824 5.65a1 1 0 0 1-1.68.11l-3.32-2.656a1 1 0 0 0-1.047.22l-2.825 5.65a1 1 0 0 0-.11 1.68l2.656 3.32a1 1 0 0 1-.22 1.047l-5.65 2.825a1 1 0 0 1-1.268-1.268Z" /><path strokeLinecap="round" strokeLinejoin="round" d="m10.232 13.768 5.65-5.65"/></svg>;
const LineIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18"/></svg>;
const TextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1M4 7h16M4 7v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7M8 11h8M8 15h5"/></svg>;
const EyedropperIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.156 4.219a1.5 1.5 0 0 0-2.122 0l-5.25 5.25a.75.75 0 0 0 0 1.06l4.19 4.192a.75.75 0 0 0 1.06 0l5.25-5.25a1.5 1.5 0 0 0 0-2.122l-3.128-3.13ZM2 20.25a2.25 2.25 0 0 0 2.25 2.25h1.5a.75.75 0 0 0 .75-.75V18a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75v3Zm4.5-3a.75.75 0 0 0-.75.75v1.5a2.25 2.25 0 0 0 2.25 2.25h3a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 0-.75-.75h-4.5Z"/></svg>;
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const UndoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 10h11.586l-2.293-2.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 12H3a1 1 0 01-1-1v-1a1 1 0 011-1z" /></svg>;
const RedoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 10h11.586l-2.293-2.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 12H3a1 1 0 01-1-1v-1a1 1 0 011-1z" transform="scale(-1, 1)" style={{transformOrigin: 'center'}} /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const FullscreenEnterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>;
const FullscreenExitIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9V4.5M15 9h4.5M15 9l5.25-5.25M15 15v4.5M15 15h4.5M15 15l5.25 5.25" /></svg>;
const ResetZoomIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" /></svg>;

const PREDEFINED_COLORS = ['#000000', '#FFFFFF', '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55'];
const FONT_FACES = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Comic Sans MS'];

export const DrawingView: React.FC = () => {
  // --- REFS ---
  const containerRef = useRef<HTMLDivElement>(null);
  const layerContainerRef = useRef<HTMLDivElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);
  const layerCanvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const startCoordsRef = useRef<{x: number, y: number} | null>(null);
  const snapshotRef = useRef<ImageData | null>(null);
  const isPanningRef = useRef(false);
  const lastPanPointRef = useRef<{x: number, y: number}>({x: 0, y: 0});
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  // --- STATE ---
  const [layers, setLayers] = useState<Layer[]>([{ id: `layer_${Date.now()}`, name: 'Calque 1', isVisible: true }]);
  const [activeLayerId, setActiveLayerId] = useState<string>(layers[0].id);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<Tool>('pen');
  const [previousTool, setPreviousTool] = useState<Tool>('pen');
  const [shapeMode, setShapeMode] = useState<ShapeMode>('stroke');
  const [history, setHistory] = useState<Record<string, ImageData[]>>({ [layers[0].id]: [] });
  const [historyIndex, setHistoryIndex] = useState<Record<string, number>>({ [layers[0].id]: -1 });
  const [transform, setTransform] = useState<Transform>({ scale: 1, offsetX: 0, offsetY: 0 });
  const [textElement, setTextElement] = useState<TextElement | null>(null);
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [isFullScreen, setIsFullScreen] = useState(false);
  // Fix: Add state to track spacebar press for panning.
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // --- HELPER FUNCTIONS ---
  const getActiveCanvas = useCallback(() => layerCanvasRefs.current.get(activeLayerId), [activeLayerId]);
  const getActiveContext = useCallback(() => getActiveCanvas()?.getContext('2d'), [getActiveCanvas]);
  
  const getTransformedCoords = useCallback((e: MouseEvent | TouchEvent): {x: number, y: number} => {
      const canvas = getActiveCanvas();
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const event = e instanceof MouseEvent ? e : e.touches[0];
      return { 
        x: (event.clientX - rect.left - transform.offsetX) / transform.scale, 
        y: (event.clientY - rect.top - transform.offsetY) / transform.scale
      };
  }, [getActiveCanvas, transform]);

  // --- HISTORY MANAGEMENT ---
  const saveState = useCallback(() => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const ctx = getActiveContext();
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const layerHistory = history[activeLayerId] || [];
    const layerIndex = historyIndex[activeLayerId] ?? -1;
    
    const newHistory = layerHistory.slice(0, layerIndex + 1);
    newHistory.push(imageData);

    setHistory(prev => ({ ...prev, [activeLayerId]: newHistory }));
    setHistoryIndex(prev => ({ ...prev, [activeLayerId]: newHistory.length - 1 }));
  }, [activeLayerId, getActiveCanvas, getActiveContext, history, historyIndex]);

  const undo = useCallback(() => {
    const layerIndex = historyIndex[activeLayerId];
    if (layerIndex === undefined || layerIndex < 0) return;
    
    const newIndex = layerIndex - 1;
    setHistoryIndex(prev => ({...prev, [activeLayerId]: newIndex}));
    
    const ctx = getActiveContext()!;
    const canvas = getActiveCanvas()!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (newIndex > -1) {
        ctx.putImageData(history[activeLayerId][newIndex], 0, 0);
    }
  }, [activeLayerId, getActiveCanvas, getActiveContext, history, historyIndex]);

  const redo = useCallback(() => {
    const layerHistory = history[activeLayerId];
    const layerIndex = historyIndex[activeLayerId];
    if (!layerHistory || layerIndex === undefined || layerIndex >= layerHistory.length - 1) return;

    const newIndex = layerIndex + 1;
    setHistoryIndex(prev => ({...prev, [activeLayerId]: newIndex}));
    getActiveContext()!.putImageData(layerHistory[newIndex], 0, 0);
  }, [activeLayerId, getActiveContext, history, historyIndex]);

  // --- DRAWING LOGIC ---
  const startDrawing = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const ctx = getActiveContext();
    if (!ctx) return;
    
    const { x, y } = getTransformedCoords(e.nativeEvent);

    if (tool === 'text') {
      if (textElement?.isEditing) { // Finalize previous text
          const prevCtx = getActiveContext();
          if (prevCtx) {
            prevCtx.font = `${textElement.size * transform.scale}px ${textElement.font}`;
            prevCtx.fillStyle = textElement.color;
            prevCtx.textAlign = 'left';
            prevCtx.textBaseline = 'top';
            prevCtx.fillText(textElement.content, textElement.x, textElement.y);
            saveState();
          }
      }
      setTextElement({ x, y, content: '', color, size: fontSize, font: fontFamily, isEditing: true });
      return;
    }
    
    if(tool === 'eyedropper') {
        const compositeCtx = compositeCanvasRef.current!.getContext('2d')!;
        compositeCtx.clearRect(0, 0, compositeCanvasRef.current!.width, compositeCanvasRef.current!.height);
        layers.forEach(layer => {
            if (layer.isVisible) {
                const canvas = layerCanvasRefs.current.get(layer.id);
                if (canvas) compositeCtx.drawImage(canvas, 0, 0);
            }
        });
        const pixel = compositeCtx.getImageData((x * transform.scale) + transform.offsetX, (y * transform.scale) + transform.offsetY, 1, 1).data;
        setColor(`rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`);
        setTool(previousTool);
        return;
    }

    setIsDrawing(true);
    startCoordsRef.current = {x, y};
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (['rectangle', 'circle', 'line'].includes(tool)) {
        snapshotRef.current = ctx.getImageData(0, 0, getActiveCanvas()!.width, getActiveCanvas()!.height);
    }
  }, [getActiveContext, getTransformedCoords, saveState, tool, previousTool, color, fontSize, fontFamily, textElement, transform, layers]);
  
  const draw = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = getActiveContext()!;
    const { x, y } = getTransformedCoords(e.nativeEvent);
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = brushSize / transform.scale; // Adjust brush size for zoom

    if (tool === 'pen' || tool === 'eraser') {
        ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
        ctx.lineTo(x, y);
        ctx.stroke();
    } else if (['rectangle', 'circle', 'line'].includes(tool)) {
        if (snapshotRef.current) ctx.putImageData(snapshotRef.current, 0, 0);
        const start = startCoordsRef.current!;
        ctx.beginPath();
        if(tool === 'rectangle') {
             shapeMode === 'fill' ? ctx.fillRect(start.x, start.y, x - start.x, y - start.y) : ctx.strokeRect(start.x, start.y, x - start.x, y - start.y);
        } else if (tool === 'circle') {
            const radiusX = Math.abs(x - start.x) / 2;
            const radiusY = Math.abs(y - start.y) / 2;
            ctx.ellipse(start.x + (x - start.x)/2, start.y + (y - start.y)/2, radiusX, radiusY, 0, 0, 2 * Math.PI);
            shapeMode === 'fill' ? ctx.fill() : ctx.stroke();
        } else if (tool === 'line') {
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(x,y);
            ctx.stroke();
        }
    }
  }, [isDrawing, getActiveContext, getTransformedCoords, tool, color, brushSize, shapeMode, transform.scale]);
  
  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    getActiveContext()?.closePath();
    setIsDrawing(false);
    saveState();
    snapshotRef.current = null;
  }, [isDrawing, getActiveContext, saveState]);

  // --- LAYER MANAGEMENT ---
  const addLayer = () => {
    const newLayer: Layer = { id: `layer_${Date.now()}`, name: `Calque ${layers.length + 1}`, isVisible: true };
    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
    setHistory(prev => ({ ...prev, [newLayer.id]: [] }));
    setHistoryIndex(prev => ({ ...prev, [newLayer.id]: -1 }));
  };

  const deleteLayer = (id: string) => {
    if (layers.length <= 1) return;
    setLayers(prev => prev.filter(l => l.id !== id));
    if (activeLayerId === id) {
      setActiveLayerId(layers.find(l => l.id !== id)!.id);
    }
    layerCanvasRefs.current.delete(id);
    setHistory(prev => { const newHist = {...prev}; delete newHist[id]; return newHist; });
    setHistoryIndex(prev => { const newIdx = {...prev}; delete newIdx[id]; return newIdx; });
  };
  
  const downloadImage = useCallback(() => {
    const compositeCanvas = compositeCanvasRef.current;
    const container = containerRef.current;
    if (!compositeCanvas || !container) return;

    const { width, height } = container.getBoundingClientRect();
    compositeCanvas.width = width;
    compositeCanvas.height = height;

    const compositeCtx = compositeCanvas.getContext('2d');
    if (!compositeCtx) return;

    compositeCtx.fillStyle = 'white';
    compositeCtx.fillRect(0, 0, width, height);
    
    layers.forEach(layer => {
        if (layer.isVisible) {
            const layerCanvas = layerCanvasRefs.current.get(layer.id);
            if (layerCanvas) {
                compositeCtx.drawImage(layerCanvas, 0, 0);
            }
        }
    });

    const link = document.createElement('a');
    link.download = `brevet-easy-drawing-${Date.now()}.png`;
    link.href = compositeCanvas.toDataURL('image/png');
    link.click();
  }, [layers]);


  // --- PAN & ZOOM ---
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    
    const scaleAmount = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.1, transform.scale + scaleAmount), 10);
    const rect = containerRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newOffsetX = mouseX - (mouseX - transform.offsetX) * (newScale / transform.scale);
    const newOffsetY = mouseY - (mouseY - transform.offsetY) * (newScale / transform.scale);
    
    setTransform({ scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY });
  }, [transform]);
  
  // --- LIFECYCLE & EVENT HANDLERS ---
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
        container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => container?.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && !isPanningRef.current) {
          e.preventDefault();
          // Fix: Set state to track spacebar press.
          setIsSpacePressed(true);
          if (containerRef.current) {
            containerRef.current.style.cursor = 'grab';
          }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
          // Fix: Clear state when spacebar is released.
          setIsSpacePressed(false);
          if (containerRef.current) {
            containerRef.current.style.cursor = 'crosshair';
          }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [undo, redo]);
  
  useEffect(() => {
    if (tool === 'eyedropper') {
        if (containerRef.current) containerRef.current.style.cursor = 'copy';
    } else if (containerRef.current) {
        containerRef.current.style.cursor = 'crosshair';
    }
  }, [tool]);

  useEffect(() => {
    layers.forEach(layer => {
        if (!layerCanvasRefs.current.has(layer.id)) {
            const canvas = document.createElement('canvas');
            canvas.className = 'absolute top-0 left-0 w-full h-full';
            layerContainerRef.current?.appendChild(canvas);
            layerCanvasRefs.current.set(layer.id, canvas);
        }
    });
    const container = containerRef.current;
    if (container) {
        const { width, height } = container.getBoundingClientRect();
        [...layerCanvasRefs.current.entries()].forEach(([id, canvas]) => {
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d')!;
            const layerHistory = history[id];
            const layerIdx = historyIndex[id];
            if (layerHistory && layerIdx > -1) {
                ctx.putImageData(layerHistory[layerIdx], 0, 0);
            }
        });
        if(compositeCanvasRef.current){
             compositeCanvasRef.current.width = width;
             compositeCanvasRef.current.height = height;
        }
    }
  }, [layers, history, historyIndex]);

  // --- RENDER ---
  const toolsList = [
    { id: 'pen', icon: <PenIcon />, label: 'Crayon' }, { id: 'eraser', icon: <EraserIcon />, label: 'Gomme' },
    { id: 'line', icon: <LineIcon />, label: 'Ligne' }, { id: 'rectangle', icon: <RectangleIcon />, label: 'Rectangle' },
    { id: 'circle', icon: <CircleIcon />, label: 'Cercle' }, { id: 'fill', icon: <FillIcon />, label: 'Remplissage' },
    { id: 'text', icon: <TextIcon />, label: 'Texte' }, { id: 'eyedropper', icon: <EyedropperIcon />, label: 'Pipette' }
  ];
  
  return (
    <div ref={containerRef} className="w-full h-[calc(100vh-6rem)] flex flex-col gap-4 animate-fade-in touch-none select-none bg-slate-200 dark:bg-slate-950 p-4 rounded-3xl"
        onMouseDown={(e) => {
            // Fix: Replace incorrect `e.key` check with `isSpacePressed` state for panning.
            if (e.button === 1 || e.nativeEvent.buttons === 4 || isSpacePressed) { 
                isPanningRef.current = true;
                lastPanPointRef.current = { x: e.clientX, y: e.clientY };
                if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
                e.preventDefault();
            } else if (e.button === 0) {
                startDrawing(e);
            }
        }}
        onMouseMove={(e) => {
             if (isPanningRef.current) {
                const dx = e.clientX - lastPanPointRef.current.x;
                const dy = e.clientY - lastPanPointRef.current.y;
                setTransform(t => ({ ...t, offsetX: t.offsetX + dx, offsetY: t.offsetY + dy }));
                lastPanPointRef.current = { x: e.clientX, y: e.clientY };
             } else {
                 draw(e);
             }
        }}
        onMouseUp={(e) => {
            if (isPanningRef.current) {
                isPanningRef.current = false;
                if (containerRef.current) containerRef.current.style.cursor = isSpacePressed ? 'grab' : 'crosshair';
            } else {
                stopDrawing();
            }
        }}
        onMouseLeave={() => { isPanningRef.current = false; stopDrawing(); }}
    >
      <h1 className="text-4xl font-bold text-center text-slate-900 dark:text-white absolute top-0 left-1/2 -translate-x-1/2 mt-[-4rem]">Arts</h1>
      
      {/* TOOLBARS */}
      <div className="absolute top-2 left-2 right-2 z-10 flex flex-col gap-2 items-center">
          {/* Main Toolbar */}
          <div className="flex flex-wrap items-center justify-center gap-1 p-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-2xl shadow-lg">
             {toolsList.map(({id, icon, label}) => <button key={id} onClick={() => { setPreviousTool(tool); setTool(id as Tool); }} className={`p-3 rounded-full transition-colors ${tool === id ? 'bg-indigo-500 text-white' : 'hover:bg-slate-200/50 dark:hover:bg-slate-700'}`} title={label}><span className="w-6 h-6 block">{icon}</span></button>)}
              <div className="h-8 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>
              <button onClick={undo} disabled={(historyIndex[activeLayerId] ?? -1) < 0} className="p-3 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700 disabled:opacity-50" title="Annuler (Ctrl+Z)"><UndoIcon /></button>
              <button onClick={redo} disabled={(historyIndex[activeLayerId] ?? -1) >= (history[activeLayerId]?.length - 1)} className="p-3 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700 disabled:opacity-50" title="Rétablir (Ctrl+Y)"><RedoIcon /></button>
              <div className="h-8 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>
              <button onClick={downloadImage} className="p-3 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700" title="Télécharger"><DownloadIcon /></button>
          </div>
          {/* Tool Options */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-2xl shadow-lg">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-9 h-9 p-0.5 bg-transparent border-2 border-slate-300 dark:border-slate-600 rounded-full cursor-pointer" title="Couleur"/>
              <input id="brushSize" type="range" min="1" max="100" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-32 cursor-pointer" title="Taille"/>
              {(tool === 'rectangle' || tool === 'circle') && <div className="flex items-center gap-1 p-0.5 bg-slate-200/50 dark:bg-slate-800 rounded-full"><button onClick={() => setShapeMode('stroke')} className={`px-2 py-0.5 text-xs font-semibold rounded-full ${shapeMode === 'stroke' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}>Contour</button><button onClick={() => setShapeMode('fill')} className={`px-2 py-0.5 text-xs font-semibold rounded-full ${shapeMode === 'fill' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}>Rempli</button></div>}
              {tool === 'text' && <><select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="bg-white/50 dark:bg-slate-800/80 rounded-md text-xs p-1 border border-slate-300 dark:border-slate-700">{FONT_FACES.map(f => <option key={f}>{f}</option>)}</select><input type="number" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-14 text-xs p-1 bg-white/50 dark:bg-slate-800/80 rounded-md border border-slate-300 dark:border-slate-700"/></>}
          </div>
      </div>

      {/* CANVAS AREA */}
      <div ref={layerContainerRef} className="relative flex-grow w-full h-full bg-white dark:bg-slate-100 rounded-2xl shadow-inner overflow-hidden cursor-crosshair">
          <div className="absolute inset-0" style={{ transform: `translate(${transform.offsetX}px, ${transform.offsetY}px) scale(${transform.scale})`, transformOrigin: 'top left' }}>
              {/* This is where canvas elements are appended dynamically */}
          </div>
           <canvas ref={compositeCanvasRef} className="hidden" />
           {textElement?.isEditing && (
              <textarea ref={textInputRef}
                  value={textElement.content}
                  onChange={e => setTextElement(t => t ? {...t, content: e.target.value} : null)}
                  onBlur={() => { /* Finalize text on blur */ }}
                  style={{
                      position: 'absolute',
                      left: `${transform.offsetX + textElement.x * transform.scale}px`,
                      top: `${transform.offsetY + textElement.y * transform.scale}px`,
                      color: textElement.color,
                      fontSize: `${textElement.size * transform.scale}px`,
                      fontFamily: textElement.font,
                      lineHeight: 1,
                      background: 'rgba(128,128,128,0.2)',
                      border: '1px dashed grey',
                      outline: 'none',
                      resize: 'both',
                      transformOrigin: 'top left',
                  }}
                  autoFocus
              />
          )}
      </div>
      
      {/* SIDEBARS & OVERLAYS */}
      <div className="absolute top-1/2 right-2 -translate-y-1/2 z-10 w-48 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-2xl shadow-lg p-2 flex flex-col gap-2">
          <h3 className="text-sm font-bold text-center mb-1">Calques</h3>
          <div className="flex-grow overflow-y-auto max-h-64">
             {layers.map(layer => <div key={layer.id} onClick={() => setActiveLayerId(layer.id)} className={`p-2 rounded-lg cursor-pointer flex items-center justify-between ${activeLayerId === layer.id ? 'bg-indigo-500/30' : 'hover:bg-slate-500/10'}`}><span>{layer.name}</span><button onClick={() => deleteLayer(layer.id)}><TrashIcon className="w-4 h-4 text-red-500"/></button></div>)}
          </div>
          <button onClick={addLayer} className="text-sm font-semibold p-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/40">+ Ajouter un calque</button>
      </div>
      <div className="absolute bottom-2 left-2 z-10 flex items-center gap-2 p-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-full shadow-lg">
          <button onClick={() => setTransform({scale: 1, offsetX: 0, offsetY: 0})} className="p-2" title="Réinitialiser le zoom"><ResetZoomIcon /></button>
          <span className="text-xs font-semibold px-2">{Math.round(transform.scale * 100)}%</span>
          <button onClick={() => { isFullScreen ? document.exitFullscreen() : containerRef.current?.requestFullscreen(); setIsFullScreen(!isFullScreen); }} className="p-2" title="Plein écran">
              {isFullScreen ? <FullscreenExitIcon/> : <FullscreenEnterIcon/>}
          </button>
      </div>

    </div>
  );
};