// src/components/Room/RoomScene.jsx
import React from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { TextureLoader } from 'three';
import DraggableModel from "../../DraggableModel";

const RoomScene = ({
  roomSize,
  models,
  isDragging,
  setDragging,
  selectedModel,
  setSelectedModel,
  setCurrentPosition,
  handleModelPositionChange,
  handleModelRotationChange,
  selectedParquet,
  selectedWallTexture
}) => {
  const parquetTexture = useLoader(
    TextureLoader,
    selectedParquet.startsWith('/textures/')
      ? selectedParquet
      : `/textures/parke/${selectedParquet}.jpg`
  );

  const wallTexture = useLoader(
    TextureLoader,
    selectedWallTexture.startsWith('/textures/')
      ? selectedWallTexture
      : `/textures/duvar/${selectedWallTexture}.jpg`
  );

  return (
    <Canvas
      style={{ width: '100vw', height: '100vh' }}
      camera={{ position: [0, 5, 15], fov: 30 }}
      onPointerMissed={() => setSelectedModel(null)}
    >
      <color attach="background" args={['#D0B8A8']} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Logo */}
      <mesh position={[0, roomSize.height / 1 - 0.1, -roomSize.depth / 2 + 0.05]}>
        <planeGeometry args={[4, 1]} />
        <meshBasicMaterial
          map={useLoader(TextureLoader, '/textures/logo/logo.png')}
          transparent={true}
        />
      </mesh>

      {/* Zemin */}
      <mesh position={[0, -roomSize.height / 2, 0]}>
        <boxGeometry args={[roomSize.width, 0.04, roomSize.depth]} />
        <meshStandardMaterial map={parquetTexture} />
      </mesh>

      {/* Grid */}
      <Grid
        position={[0, -roomSize.height / 2 + 0.02, 0]}
        args={[roomSize.width, roomSize.depth]}
        sectionColor="#555"
        cellColor="#999"
        cellThickness={0.4}
        sectionThickness={0.6}
      />

      {/* Duvarlar */}
      <mesh position={[0, 0, -roomSize.depth / 2]}>
        <boxGeometry args={[roomSize.width, roomSize.height, 0.01]} />
        <meshStandardMaterial map={wallTexture} />
      </mesh>
      <mesh position={[-roomSize.width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[roomSize.depth, roomSize.height, 0.01]} />
        <meshStandardMaterial map={wallTexture} />
      </mesh>

      {/* Modeller */}
      {models.map((m) => {
        if (m.isDoor || m.isWindow) {
          return (
            <primitive
              key={m.id}
              object={m.model.scene}
              position={[...m.position]}
              rotation={[...(m.rotation || [0, 0, 0])]} 
              scale={m.isDoor ? [0.025, 0.02, 0.025] : [0.18, 0.18, 0.04]}
            />
          );
        }

        return (
          <DraggableModel
            key={m.id}
            model={m.model}
            position={[...m.position]}
            rotation={[...(m.rotation || [0, 0, 0])]}
            setDragging={setDragging}
            onClick={() => {
              setSelectedModel(m.id);
              const actualPos = m.model?.scene?.position?.toArray?.();
              if (actualPos) setCurrentPosition(actualPos);
            }}
            scale={m.scale || 1}
            roomSize={roomSize}
            texture={m.texture}
            onPositionChange={(newPos) => handleModelPositionChange(m.id, newPos)}
            onRotationChange={(newRot) => handleModelRotationChange(m.id, newRot)}
          />
        );
      })}

      <OrbitControls enabled={!isDragging} />
    </Canvas>
  );
};

export default RoomScene;
