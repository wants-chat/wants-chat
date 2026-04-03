import React, { useState, useRef, useEffect } from 'react';
import { Compass, RotateCw, Move } from 'lucide-react';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import BackgroundEffects from '../../components/ui/BackgroundEffects';

interface Point {
  x: number;
  y: number;
}

const Protractor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [centerPoint, setCenterPoint] = useState<Point>({ x: 0, y: 0 });
  const [armAngle, setArmAngle] = useState<number>(45);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const size = Math.min(window.innerWidth - 48, 500);
    canvas.width = size;
    canvas.height = size;

    const center: Point = { x: size / 2, y: size / 2 };
    setCenterPoint(center);

    drawProtractor(ctx, size, center, armAngle);
  }, [armAngle]);

  const drawProtractor = (ctx: CanvasRenderingContext2D, size: number, center: Point, angle: number) => {
    ctx.clearRect(0, 0, size, size);

    const radius = size * 0.35;

    // Draw protractor background
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(20, 184, 166, 0.1)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw degree markings
    for (let i = 0; i < 360; i += 10) {
      const startRadius = i % 30 === 0 ? radius - 20 : radius - 10;
      const endRadius = radius;

      const startX = center.x + startRadius * Math.cos((i * Math.PI) / 180);
      const startY = center.y + startRadius * Math.sin((i * Math.PI) / 180);
      const endX = center.x + endRadius * Math.cos((i * Math.PI) / 180);
      const endY = center.y + endRadius * Math.sin((i * Math.PI) / 180);

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = i % 30 === 0 ? 2 : 1;
      ctx.stroke();

      // Draw degree numbers
      if (i % 30 === 0) {
        const textRadius = radius - 35;
        const textX = center.x + textRadius * Math.cos((i * Math.PI) / 180);
        const textY = center.y + textRadius * Math.sin((i * Math.PI) / 180);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i.toString() + '°', textX, textY);
      }
    }

    // Draw base line (0 degrees)
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(center.x + radius, center.y);
    ctx.strokeStyle = 'rgba(20, 184, 166, 0.8)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw movable arm
    const armX = center.x + radius * Math.cos((angle * Math.PI) / 180);
    const armY = center.y + radius * Math.sin((angle * Math.PI) / 180);

    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(armX, armY);
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.9)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw center point
    ctx.beginPath();
    ctx.arc(center.x, center.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(20, 184, 166, 0.8)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw draggable point at end of arm
    ctx.beginPath();
    ctx.arc(armX, armY, 12, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw angle arc
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius * 0.3, 0, (angle * Math.PI) / 180);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    updateAngle(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      updateAngle(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    updateAngleTouch(e);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      updateAngleTouch(e);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const updateAngle = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - centerPoint.x;
    const dy = y - centerPoint.y;

    let newAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (newAngle < 0) newAngle += 360;

    setArmAngle(newAngle);
    setAngle(Math.round(newAngle * 10) / 10);
  };

  const updateAngleTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const dx = x - centerPoint.x;
    const dy = y - centerPoint.y;

    let newAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (newAngle < 0) newAngle += 360;

    setArmAngle(newAngle);
    setAngle(Math.round(newAngle * 10) / 10);
  };

  const resetProtractor = () => {
    setArmAngle(45);
    setAngle(45);
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Calculators', href: '/dashboard' },
    { label: 'Digital Protractor', icon: Compass }
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      <Header />

      <div className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Compass className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Digital Protractor</h1>
                  <p className="text-white/80 text-sm mt-1">Measure angles with precision</p>
                </div>
              </div>
              <button
                onClick={resetProtractor}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <RotateCw className="h-5 w-5 text-white" />
                <span className="text-white font-medium">Reset</span>
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="p-6">
            <div className="flex flex-col items-center">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="bg-white/5 rounded-lg border border-white/10 cursor-crosshair touch-none"
              />

              {/* Instructions */}
              <div className="mt-4 flex items-center gap-2 text-white/60 text-sm">
                <Move className="h-4 w-4" />
                <p>Drag the blue point to measure angles</p>
              </div>
            </div>
          </div>

          {/* Angle Display */}
          <div className="p-6 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Angle */}
              <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 backdrop-blur-sm rounded-lg p-4 border border-teal-400/30 md:col-span-2">
                <p className="text-sm text-white/60 mb-2">Measured Angle</p>
                <p className="text-5xl font-bold text-white">{angle.toFixed(1)}°</p>
              </div>

              {/* Additional Info */}
              <div className="space-y-2">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <p className="text-xs text-white/60">Radians</p>
                  <p className="text-lg font-semibold text-white">
                    {((angle * Math.PI) / 180).toFixed(3)}
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <p className="text-xs text-white/60">Complementary</p>
                  <p className="text-lg font-semibold text-white">
                    {(90 - (angle % 90)).toFixed(1)}°
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Protractor;
