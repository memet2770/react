// 6. Dosya: src/components/Room/index.jsx
import React from 'react';
import RoomUI from './RoomUI';
import RoomScene from './RoomScene';
import useRoomLogic from './useRoomLogic';

export default function Room() {
  const logic = useRoomLogic();

  return (
    <>
      <RoomUI {...logic} />
      <RoomScene {...logic} />
    </>
  );
}
