import React from 'react';
import './TextureSelector.css'; // CSS dosyasını import ediyoruz

const getFullPath = (texture) => {
  if (!texture) return "";
  if (texture.includes('/')) return texture;
  if (texture.startsWith('parke')) return `/textures/parke/${texture}.jpg`;
  if (texture.startsWith('duvar')) return `/textures/duvar/${texture}.jpg`;
  return "";
};

const TextureSelector = ({ textures, selectedTexture, onSelect, label }) => {
  if (!textures || textures.length === 0) {
    return <p style={{ color: 'red', fontWeight: 'bold' }}>Doku listesi boş veya yüklenemedi.</p>;
  }

  return (
    <div>
      {label && <label className="texture-selector-label">{label}:</label>}
      <div className="texture-grid">
        {textures.map((texture, index) => (
          <div key={index} className="texture-item">
            <img
              src={getFullPath(texture)}
              onClick={() => onSelect(texture)}
              className={`texture-image ${selectedTexture === texture ? 'selected' : ''}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TextureSelector;
