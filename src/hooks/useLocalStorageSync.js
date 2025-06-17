// 3. Dosya: src/hooks/useLocalStorageSync.js
import { useEffect } from 'react';

const useLocalStorageSync = ({ models, roomSize, selectedParquet, selectedWallTexture }) => {
  useEffect(() => {
    const savable = {
      models: models.map(({ id, modelPath, position, scale, isDoor, isWindow, rotation }) => ({
        id, modelPath, position, scale, isDoor, isWindow, rotation,
      })),
      roomSize,
      selectedParquet,
      selectedWallTexture,
    };

    localStorage.setItem("fullRoomData", JSON.stringify(savable));
  }, [models, roomSize, selectedParquet, selectedWallTexture]);
};

export default useLocalStorageSync;