// RoomUI.jsx
import React, { useState } from 'react';
import TextureSelector from '../TextureSelector';
import { parquetTextures, wallTextures } from '../../utils/constants';
import ModelSelector from '../ModelSelector';

const panelStyle = {
  position: 'absolute',
  background: '#f1f1f1',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  padding: '16px',
  zIndex: 10,
  maxWidth: '260px',
  fontFamily: 'sans-serif',
  fontSize: '14px'
};

const headerStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  marginBottom: '10px',
  cursor: 'pointer',
  userSelect: 'none',
  color: '#333',
  display: 'flex',
  justifyContent: 'space-between',
};

const RoomUI = ({
  selectedParquet,
  selectedWallTexture,
  handleParquetChange,
  handleWallTextureChange,
  roomSize,
  handleInputChange,
  selectedModel,
  currentPosition,
  handleDeleteModel,
  onAddModel,
  onMoveDoorWall,
  onMoveWindowWall,
  onSlideDoor,
  onSlideWindow,
  onAddExtraWindow,
  onMoveWindowWallById,
  onSlideWindowById,
  handleModelPositionChange,
  setCurrentPosition,
  models,
}) => {
  const [showTextures, setShowTextures] = useState(true);
  const [showRoomSize, setShowRoomSize] = useState(true);
  const [showModelMenu, setShowModelMenu] = useState(true);

  return (
    <>
      {/* Doku Seçimi */}
      <div style={{ ...panelStyle, top: '10px', left: '10px' }}>
        <div style={headerStyle} onClick={() => setShowTextures(!showTextures)}>
          <span>Doku Seçimi</span>
          <span>{showTextures ? '▲' : '▼'}</span>
        </div>
        {showTextures && (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#000' }}>Zemin:</label>
              <TextureSelector
                textures={parquetTextures}
                selectedTexture={selectedParquet}
                onSelect={handleParquetChange}
              />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#000' }}>Duvar:</label>
              <TextureSelector
                textures={wallTextures}
                selectedTexture={`/textures/duvar/${selectedWallTexture}.jpg`}
                onSelect={(t) => {
                  if (typeof t === 'string') {
                    const fileName = t.split('/').pop();
                    const textureKey = fileName ? fileName.split('.')[0] : 'duvar9';
                    handleWallTextureChange(textureKey);
                  }
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Oda Boyutları + Kontroller */}
      <div style={{ ...panelStyle, top: '10px', left: '300px' }}>
        <div style={headerStyle} onClick={() => setShowRoomSize(!showRoomSize)}>
          <span>Oda Boyutları</span>
          <span>{showRoomSize ? '▲' : '▼'}</span>
        </div>
        {showRoomSize && (
          <>
            <label style={{ color: '#000' }}>
              Genişlik:
              <input type="number" name="width" value={roomSize.width} onChange={handleInputChange} style={{ width: '80px', marginLeft: '4px' }} />
            </label><br />
            <label style={{ color: '#000' }}>
              Yükseklik:
              <input type="number" name="height" value={roomSize.height} onChange={handleInputChange} style={{ width: '80px', marginLeft: '4px' }} />
            </label><br />
            <label style={{ color: '#000' }}>
              Derinlik:
              <input type="number" name="depth" value={roomSize.depth} onChange={handleInputChange} style={{ width: '80px', marginLeft: '4px' }} />
            </label>

            <hr style={{ margin: '10px 0' }} />

            <button onClick={onMoveDoorWall} style={{ width: '100%', marginBottom: '6px' }}>🚪 Kapıyı Diğer Duvara Taşı</button>
            <input type="range" min={-2} max={2} step={0.1} onChange={(e) => onSlideDoor(parseFloat(e.target.value))} />
            <br />

            <button onClick={() => onAddExtraWindow()} style={{ width: '100%', marginTop: '10px', marginBottom: '6px' }}>
              ➕ Ekstra Pencere Ekle
            </button>

            {/* Her pencere için ayrı kontrol */}
            {models.filter(m => m.isWindow).map((m, index) => (
              <div key={m.id} style={{ marginTop: '12px' }}>
                <strong style={{ color: '#000' }}>🪟 Pencere #{index + 1}</strong><br />
                <button
                  onClick={() => onMoveWindowWallById(m.id)}
                  style={{ width: '100%', marginTop: '4px', marginBottom: '4px' }}
                >
                  Duvar Değiştir
                </button>
                <input
                  type="range"
                  min={-2}
                  max={2}
                  step={0.1}
                  onChange={(e) => onSlideWindowById(m.id, parseFloat(e.target.value))}
                />
              </div>
            ))}
          </>
        )}
      </div>

      {/* Seçili Model */}
      {selectedModel && (
        <div style={{
          ...panelStyle,
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#333',
          color: '#fff'
        }}>
          <h4 style={{ marginTop: 0 }}>Seçili Model</h4>
          {['X', 'Y', 'Z'].map((axis, index) => (
            <div key={axis} style={{ marginBottom: '6px' }}>
              <label>{axis}: </label>
              <input
                type="number"
                value={currentPosition[index].toFixed(2)}
                step="0.1"
                style={{ width: '60px', marginLeft: '4px' }}
                onChange={(e) => {
                  const newVal = parseFloat(e.target.value);
                  if (!isNaN(newVal)) {
                    const updatedPos = [...currentPosition];
                    updatedPos[index] = newVal;
                    setCurrentPosition(updatedPos);
                    handleModelPositionChange(selectedModel, updatedPos);
                  }
                }}
              />
            </div>
          ))}
          <button
            onClick={() => handleDeleteModel(selectedModel)}
            style={{
              marginTop: '10px',
              padding: '6px 12px',
              background: 'red',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Modeli Sil
          </button>
        </div>
      )}

      {/* Model Ekle */}
      <div style={{ ...panelStyle, bottom: '10px', right: '10px', maxHeight: '300px', overflowY: 'auto' }}>
        <div style={headerStyle} onClick={() => setShowModelMenu(!showModelMenu)}>
          <span>Model Ekle</span>
          <span>{showModelMenu ? '▲' : '▼'}</span>
        </div>
        {showModelMenu && <ModelSelector onAddModel={onAddModel} />}
      </div>
    </>
  );
};

export default RoomUI;

RoomUI.defaultProps = {
  onAddModel: () => console.warn("RoomUI: onAddModel fonksiyonu sağlanmadı."),
  onMoveDoorWall: () => console.warn("Kapıyı diğer duvara taşı fonksiyonu eksik"),
  onMoveWindowWall: () => console.warn("Pencereyi diğer duvara taşı fonksiyonu eksik"),
  onSlideDoor: () => console.warn("Kapıyı kaydır fonksiyonu eksik"),
  onSlideWindow: () => console.warn("Pencereyi kaydır fonksiyonu eksik"),
  onAddExtraWindow: () => console.warn("Ekstra pencere ekle fonksiyonu eksik"),
  onMoveWindowWallById: () => console.warn("ID'ye göre pencere taşı eksik"),
  onSlideWindowById: () => console.warn("ID'ye göre pencere kaydır eksik"),
};
