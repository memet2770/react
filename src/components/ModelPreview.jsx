import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from '@react-three/drei';

const ModelPreview = ({ modelPath }) => {
  const [model, setModel] = useState(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => setModel(gltf.scene));
  }, [modelPath]);

  useEffect(() => {
    return () => {
      if (model) {
        model.traverse((child) => {
          if (child.isMesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
            else child.material?.dispose();
          }
        });
      }
    };
  }, [model]);

  if (!model) return null;

  return (
    <Canvas style={{ width: '100%', height: '100px' }} camera={{ position: [0, 0, 2.5], fov: 50 }}>
      <ambientLight intensity={0.8} />
      <primitive object={model} />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
};

export default ModelPreview;