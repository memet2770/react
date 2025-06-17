import { useRef, useEffect, useCallback } from 'react';
import { useDrag } from '@use-gesture/react';
import * as THREE from 'three';

const DraggableModel = ({
  model,
  position,
  rotation,
  scale,
  setDragging,
  onClick,
  roomSize,
  texture,
  onPositionChange,
  onRotationChange,
}) => {
  const ref = useRef();
  const yLockRef = useRef(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!model?.scene || !ref.current || hasInitialized.current) return;

    const appliedScale = Array.isArray(scale) ? scale : [scale, scale, scale];
    model.scene.scale.set(...appliedScale);

    const box = new THREE.Box3().setFromObject(model.scene);
    const minY = box.min.y * appliedScale[1];
    const groundY = -roomSize.height / 2 - minY;

    yLockRef.current = groundY;

    ref.current.position.set(position[0], groundY, position[2]);
    ref.current.rotation.set(...rotation);

    hasInitialized.current = true; // ✅ İlk init tamam, bir daha pozisyon uygulanmayacak
  }, [model, scale, position, rotation, roomSize.height]);

  const handleDrag = useCallback(({ delta: [dx, dy], active, shiftKey }) => {
    if (!ref.current || !model?.scene || yLockRef.current === null) return;

    const obj = ref.current;
    const appliedScale = Array.isArray(scale) ? scale : [scale, scale, scale];
    const groundY = yLockRef.current;

    const tryX = obj.position.x + dx / 50;
    const tryZ = obj.position.z - dy / 50;

    const halfW = roomSize.width / 2;
    const halfD = roomSize.depth / 2;

    const clone = model.scene.clone();
    clone.scale.set(...appliedScale);
    clone.rotation.copy(obj.rotation);
    if (shiftKey) clone.rotation.y += dx / 100;
    clone.position.set(tryX, groundY, tryZ);
    clone.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(clone);
    const minX = box.min.x;
    const maxX = box.max.x;
    const minZ = box.min.z;
    const maxZ = box.max.z;

    let newX = tryX;
    let newZ = tryZ;

    if (minX < -halfW) newX += -halfW - minX;
    if (maxX > halfW) newX -= maxX - halfW;
    if (minZ < -halfD) newZ += -halfD - minZ;
    if (maxZ > halfD) newZ -= maxZ - halfD;

    obj.position.set(newX, groundY, newZ);

    if (shiftKey) {
      obj.rotation.y += dx / 100;
      onRotationChange?.([obj.rotation.x, obj.rotation.y, obj.rotation.z]);
    }

    onPositionChange?.(obj.position.toArray());
    setDragging?.(active);
  }, [model, roomSize, onPositionChange, onRotationChange, setDragging, scale]);

  const bind = useDrag(handleDrag, { pointerEvents: true });

  return (
    <mesh
      ref={ref}
      {...bind()}
      scale={Array.isArray(scale) ? scale : [scale, scale, scale]}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {model ? (
        <primitive object={model.scene} />
      ) : (
        <>
          <planeGeometry args={[2, 1]} />
          <meshStandardMaterial map={texture} />
        </>
      )}
    </mesh>
  );
};

export default DraggableModel;
