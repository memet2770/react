import React, { useEffect, useState } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const TreeNode = ({ node, onAddModel, level = 0 }) => {
  const [expanded, setExpanded] = useState(false);

  // Dizinse
  if (node.children) {
    return (
      <div style={{ marginLeft: level * 16 }}>
        <div
          onClick={() => setExpanded(!expanded)}
          style={{
            cursor: 'pointer',
            fontWeight: '600',
            padding: '6px 10px',
            background: '#eee',
            borderRadius: '4px',
            userSelect: 'none',
            color: '#000'        // ← Burayı ekledik            
          }}
        >
          {expanded ? '📂' : '📁'} {node.name}
        </div>
        {expanded &&
          node.children.map((child, idx) => (
            <TreeNode
              key={idx}
              node={child}
              onAddModel={onAddModel}
              level={level + 1}
            />
          ))}
      </div>
    );
  }

  // Dosyaysa (model)
  return (
    <button
      onClick={() => onAddModel(node.path)}
      style={{
        display: 'block',
        marginLeft: level * 16 + 16,
        padding: '8px',
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: '4px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'transform 0.1s',
        color: '#000'        // ← Burayı ekledik                
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = '#f9f9f9';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = '#fff';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      📄 {node.name}
    </button>
  );
};

const ModelSelector = ({ onAddModel }) => {
  const [modelTree, setModelTree] = useState([]);

  useEffect(() => {
    fetch('/models.json')
      .then((res) => res.json())
      .then((data) => setModelTree(data))
      .catch((err) => console.error('Model listesi yüklenemedi:', err));
  }, []);

  const handleAddModel = (modelPath) => {
    if (typeof onAddModel !== 'function') {
      console.error('onAddModel fonksiyonu tanımsız.');
      return;
    }
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => onAddModel(modelPath, gltf),
      undefined,
      (error) => console.error('Model yüklenemedi:', error)
    );
  };

  return (
    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
      {modelTree.map((node, idx) => (
        <TreeNode key={idx} node={node} onAddModel={handleAddModel} />
      ))}
    </div>
  );
};

ModelSelector.defaultProps = {
  onAddModel: () => console.warn('onAddModel sağlanmadı.'),
};

export default ModelSelector;
