import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

interface CrusherModelProps {
  modelPath: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
}

function CrusherModel({ modelPath, autoRotate = true, rotationSpeed = 0.005 }: CrusherModelProps) {
  const modelRef = useRef<THREE.Group>(null);
  
  const gltf = useGLTF(modelPath);

  // Auto-rotate the model
  useFrame(() => {
    if (modelRef.current && autoRotate) {
      modelRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    // @ts-ignore
    <group ref={modelRef} scale={[4, 4, 4]}>
      {/* @ts-ignore */}
      <primitive object={gltf.scene.clone()} />
    </group>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full w-full bg-muted/20 rounded-lg">
      <div className="text-center space-y-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground">Loading 3D Model...</p>
      </div>
    </div>
  );
}

function CanvasAttribution() {
  return (
    // @ts-ignore
    <Html
      position={[-20, -23, 0]}
      transform={false}
      occlude={false}
      style={{
        pointerEvents: 'auto',
        userSelect: 'text',
        width: '400px',
        minWidth: '300px'
      }}
    >
      <div className="text-gray-500 text-[8px] leading-tight w-full bg-black/10 p-2 rounded" style={{ width: '100%', minWidth: '300px' }}>
        <p className="mb-0.5">
          <a 
            href="https://skfb.ly/pxqxY" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-200 underline"
          >
            "Gyratory Crusher by hak.35158"
          </a>
          {" "}
        </p>
        <p className="text-[8px]">
          {" "}
          <a 
            href="http://creativecommons.org/licenses/by/4.0/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-200 underline"
          >
            Licensed under CC Attribution
          </a>
        </p>
      </div>
    </Html>
  );
}

interface CrusherModel3DProps {
  className?: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
  enableControls?: boolean;
}

export function CrusherModel3D({ 
  className = "w-full h-[600px]", 
  autoRotate = true, 
  rotationSpeed = 0.005,
  enableControls = true 
}: CrusherModel3DProps) {
  return (
    <div className={`${className} relative`}>
      <Canvas
        camera={{ 
          position: [5, 5, 5], 
          fov: 50,
          near: 0.1,
          far: 1000 
        }}
        style={{ 
          background: 'transparent',
          borderRadius: '0.5rem'
        }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          {/* @ts-ignore */}
          <ambientLight intensity={0.6} />
          {/* @ts-ignore */}
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1.2}
          />
          {/* @ts-ignore */}
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          {/* @ts-ignore */}
          <pointLight position={[10, -10, 10]} intensity={0.3} />
          
          {/* 3D Model */}
          <CrusherModel 
            modelPath="/3d-models/Gyratory-Crusher.glb"
            autoRotate={autoRotate}
            rotationSpeed={rotationSpeed}
          />
          
          {/* Controls */}
          {enableControls && (
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              enableRotate={false}
              minDistance={2}
              maxDistance={20}
            />
          )}
          
          {/* Attribution within canvas */}
          <CanvasAttribution />
        </Suspense>
      </Canvas>
      
      {/* Loading fallback outside Canvas for better UX */}
      <Suspense fallback={<LoadingFallback />}>
        <div style={{ display: 'none' }} />
      </Suspense>
    </div>
  );
}

// Preload the model for better performance
try {
  useGLTF.preload('/3d-models/Gyratory-Crusher.glb');
} catch (error) {
  console.warn('Could not preload 3D model:', error);
}
