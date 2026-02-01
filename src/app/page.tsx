'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import SimulationCanvas from '@/components/SimulationCanvas';
import Controls from '@/components/Controls';
import { SimulationState, SimulationConfig, DEFAULT_CONFIG } from '@/lib/types';
import { initSimulation, updateSimulation, resetSimulation } from '@/lib/simulation';

export default function Home() {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [state, setState] = useState<SimulationState | null>(null);
  const [running, setRunning] = useState(false);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Initialize on client only to avoid hydration mismatch
  useEffect(() => {
    setState(initSimulation(config));
  }, []);

  const tick = useCallback((time: number) => {
    // Aim for ~30 FPS
    if (time - lastTimeRef.current >= 33) {
      setState(prev => prev ? updateSimulation(prev, config) : prev);
      lastTimeRef.current = time;
    }
    animationRef.current = requestAnimationFrame(tick);
  }, [config]);

  useEffect(() => {
    if (running && state) {
      animationRef.current = requestAnimationFrame(tick);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [running, tick, state]);

  const handleStart = () => setRunning(true);
  const handlePause = () => setRunning(false);
  const handleReset = () => {
    setRunning(false);
    setState(resetSimulation(config));
  };

  const handleConfigChange = (changes: Partial<SimulationConfig>) => {
    setConfig(prev => ({ ...prev, ...changes }));
  };

  // Show loading state until client-side initialization
  if (!state) {
    return (
      <main className="min-h-screen bg-gray-900 p-4 md:p-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading simulation...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Life Engine</h1>
          <p className="text-gray-400">
            A cellular automaton that simulates evolution. Organisms eat, reproduce, mutate, and compete.
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Canvas */}
          <div className="flex-1 overflow-auto">
            <SimulationCanvas state={state} config={config} />
          </div>

          {/* Controls Sidebar */}
          <div className="w-full lg:w-72">
            <Controls
              state={state}
              config={config}
              running={running}
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
              onConfigChange={handleConfigChange}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Inspired by{' '}
            <a
              href="https://thelifeengine.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              The Life Engine
            </a>
            {' '}by Max Robinson
          </p>
        </div>
      </div>
    </main>
  );
}
