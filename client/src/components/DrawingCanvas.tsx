import React, { useRef, useEffect, useState } from 'react';
import { sendImageForGuess } from '../services/api';
import './DrawingCanvas.css';

const DrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [guess, setGuess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set initial context settings
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = color;
  }, [color, brushSize]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const sendToAI = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsProcessing(true);
    setGuess(''); // Clear previous results
    
    try {
      const imageData = canvas.toDataURL('image/png');
      // Remove the data URL prefix
      const base64Data = imageData.replace('data:image/png;base64,', '');
      
      // Check if the canvas is empty (all pixels are transparent)
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('无法获取画布上下文');
      }
      
      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageDataObj.data;
      let isEmpty = true;
      
      // Check if there's any non-transparent pixel
      for (let i = 3; i < data.length; i += 4) {
        // Alpha channel > 0 means non-transparent
        if (data[i] > 0) { 
          isEmpty = false;
          break;
        }
      }
      
      if (isEmpty) {
        throw new Error('画布为空，请先绘制一些内容');
      }
      
      // 移除了对黑色像素的检查，允许任何非空图像发送到后端
      const response = await sendImageForGuess(base64Data);
      setGuess(response.guess);
    } catch (error: any) {
      console.error('Error sending image to AI:', error);
      setGuess(`识别失败: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="canvas-container">
      <div className="canvas-header">
        <div className="controls">
          <button onClick={clearCanvas}>清空画布</button>
          <button onClick={sendToAI} disabled={isProcessing}>
            {isProcessing ? '识别中...' : 'AI识别'}
          </button>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <label>
            画笔大小:
            <input
              type="range"
              min="1"
              max="30"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
            />
          </label>
        </div>
        {guess && (
          <div className="guess-result">
            AI识别结果: {guess}
          </div>
        )}
      </div>
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      <div className="canvas-footer">
        <button onClick={clearCanvas}>清空画布</button>
      </div>
    </div>
  );
};

export default DrawingCanvas;