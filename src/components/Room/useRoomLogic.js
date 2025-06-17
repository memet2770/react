import { useState, useEffect, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { parquetTextures } from '../../utils/constants';
import { v4 as uuidv4 } from 'uuid';

const useRoomLogic = () => {
  const [selectedParquet, setSelectedParquet] = useState(parquetTextures[1]);
  const [roomSize, setRoomSize] = useState({ width: 8, height: 2, depth: 8 });
  const [models, setModels] = useState([]);
  const [selectedWallTexture, setSelectedWallTexture] = useState('duvar14');
  const [selectedModel, setSelectedModel] = useState(null);
  const [currentPosition, setCurrentPosition] = useState([0, 0, 0]);
  const [isDragging, setDragging] = useState(false);

  const handleParquetChange = (parquet) => setSelectedParquet(parquet);
  const handleWallTextureChange = (texture) => setSelectedWallTexture(texture);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoomSize((prev) => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleModelPositionChange = (id, newPosition) => {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, position: newPosition } : m))
    );
    setCurrentPosition(newPosition);
  };

  const handleDeleteModel = (id) => {
    setModels((prev) => prev.filter((m) => m.id !== id));
    if (selectedModel === id) setSelectedModel(null);
  };

  const handleAddModel = (modelPath, gltf) => {
    const isDoor = modelPath.toLowerCase().includes('door');
    const isWindow = modelPath.toLowerCase().includes('window');

    const newModel = {
      id: uuidv4(),
      modelPath,
      model: gltf,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
      isDoor,
      isWindow,
    };
    setModels((prev) => [...prev, newModel]);
  };

  const addExtraWindow = () => {
    const loader = new GLTFLoader();
    loader.load('/models/window.glb', (gltf) => {
      const newId = uuidv4();
      const newPos = [-roomSize.width / 2 + 0.01, roomSize.height / 16 - 0.5, 0];
      const newRot = [0, -Math.PI / 2, 0];

      setModels((prev) => [
        ...prev,
        {
          id: newId,
          modelPath: '/models/window.glb',
          model: gltf,
          position: newPos,
          rotation: newRot,
          scale: 1,
          isDoor: false,
          isWindow: true,
        }
      ]);
    });
  };

  const moveDoorToOtherWall = () => {
    setModels((prev) =>
      prev.map((m) => {
        if (!m.isDoor) return m;
        const [x, y, z] = m.position;
        const isOnZWall = Math.abs(z - (-roomSize.depth / 2)) < 0.1 || Math.abs(z - (roomSize.depth / 2)) < 0.1;
        const newPos = isOnZWall
          ? [-roomSize.width / 2 + 0.01, y, 0]
          : [0, y, -roomSize.depth / 2 + 0.01];
        const newRotY = (m.rotation?.[1] || 0) + Math.PI * 1.5;
        return { ...m, position: newPos, rotation: [0, newRotY, 0] };
      })
    );
  };

  const moveWindowToOtherWall = () => {
    setModels((prev) =>
      prev.map((m) => {
        if (!m.isWindow) return m;
        const [x, y, z] = m.position;
        const isOnXWall = Math.abs(x - (-roomSize.width / 2)) < 0.1 || Math.abs(x - (roomSize.width / 2)) < 0.1;
        const newPos = isOnXWall
          ? [0, y, -roomSize.depth / 2 + 0.01]
          : [-roomSize.width / 2 + 0.01, y, 0];
        const newRotY = (m.rotation?.[1] || 0) + Math.PI * 1.5;
        return { ...m, position: newPos, rotation: [0, newRotY, 0] };
      })
    );
  };

  const slideDoor = (amount) => {
    setModels((prev) =>
      prev.map((m) => {
        if (!m.isDoor) return m;
        const [x, y, z] = m.position;
        const isZWall = Math.abs(z - (-roomSize.depth / 2)) < 0.1 || Math.abs(z - (roomSize.depth / 2)) < 0.1;
        return { ...m, position: isZWall ? [amount, y, z] : [x, y, amount] };
      })
    );
  };

  const slideWindow = (amount) => {
    setModels((prev) =>
      prev.map((m) => {
        if (!m.isWindow) return m;
        const [x, y, z] = m.position;
        const isXWall = Math.abs(x - (-roomSize.width / 2)) < 0.1 || Math.abs(x - (roomSize.width / 2)) < 0.1;
        return { ...m, position: isXWall ? [x, y, amount] : [amount, y, z] };
      })
    );
  };

  const moveWindowWallById = (id) => {
    setModels((prev) =>
      prev.map((m) => {
        if (!m.isWindow || m.id !== id) return m;
        const [x, y, z] = m.position;
        const isOnXWall = Math.abs(x - (-roomSize.width / 2)) < 0.1 || Math.abs(x - (roomSize.width / 2)) < 0.1;
        const newPos = isOnXWall
          ? [0, y, -roomSize.depth / 2 + 0.01]
          : [-roomSize.width / 2 + 0.01, y, 0];
        const newRotY = (m.rotation?.[1] || 0) + Math.PI * 1.5;
        return { ...m, position: newPos, rotation: [0, newRotY, 0] };
      })
    );
  };

  const slideWindowById = (id, amount) => {
    setModels((prev) =>
      prev.map((m) => {
        if (!m.isWindow || m.id !== id) return m;
        const [x, y, z] = m.position;
        const isXWall = Math.abs(x - (-roomSize.width / 2)) < 0.1 || Math.abs(x - (roomSize.width / 2)) < 0.1;
        return { ...m, position: isXWall ? [x, y, amount] : [amount, y, z] };
      })
    );
  };

  // İlk yükleme kontrolü
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const saved = localStorage.getItem("fullRoomData");
    const loader = new GLTFLoader();

    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.models.forEach((item) => {
        loader.load(item.modelPath, (gltf) => {
          setModels((prev) => [
            ...prev,
            {
              id: item.id,
              modelPath: item.modelPath,
              model: gltf,
              position: item.position,
              rotation: item.rotation || [0, 0, 0],
              scale: item.scale || 1,
              isDoor: item.isDoor,
              isWindow: item.isWindow,
            },
          ]);
        });
      });

      if (parsed.roomSize) setRoomSize(parsed.roomSize);
      if (parsed.selectedParquet) setSelectedParquet(parsed.selectedParquet);
      if (parsed.selectedWallTexture) setSelectedWallTexture(parsed.selectedWallTexture);
    } else {
      // Kapı ekle
      loader.load('/models/door.glb', (gltf) => {
        setModels((prev) => [
          ...prev,
          {
            id: uuidv4(),
            modelPath: '/models/door.glb',
            model: gltf,
            position: [0, -roomSize.height / 2, -roomSize.depth / 2 + 0.01],
            rotation: [0, -Math.PI / 2, 0],
            scale: 1,
            isDoor: true,
            isWindow: false,
          },
        ]);
      });

      // Sadece 1 pencere ekle
      loader.load('/models/window.glb', (gltf) => {
        setModels((prev) => [
          ...prev,
          {
            id: uuidv4(),
            modelPath: '/models/window.glb',
            model: gltf,
            position: [-roomSize.width / 2 + 0.01, roomSize.height / 16 - 0.5, 0],
            rotation: [0, -Math.PI / 2, 0],
            scale: 1,
            isDoor: false,
            isWindow: true,
          },
        ]);
      });
    }
  }, []);

  return {
    selectedParquet,
    selectedWallTexture,
    roomSize,
    models,
    setModels,
    selectedModel,
    setSelectedModel,
    currentPosition,
    setCurrentPosition,
    isDragging,
    setDragging,
    handleParquetChange,
    handleWallTextureChange,
    handleInputChange,
    handleModelPositionChange,
    handleDeleteModel,
    onAddModel: handleAddModel,
    onMoveDoorWall: moveDoorToOtherWall,
    onMoveWindowWall: moveWindowToOtherWall,
    onSlideDoor: slideDoor,
    onSlideWindow: slideWindow,
    onAddExtraWindow: addExtraWindow,
    onMoveWindowWallById: moveWindowWallById,
    onSlideWindowById: slideWindowById,
  };
};

export default useRoomLogic;
