import React from 'react';
import {useEffect} from 'react';

const ClickableArea = (props) => {
  useEffect(() => {
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
    }
  }, [])
  const onClick = (e) => {
    console.log(`${e.clientX}, ${e.clientY}`);
  }
  return null;
}

export default ClickableArea;