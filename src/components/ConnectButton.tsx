import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import MetaMaskConnect from './MetaMaskConnect';

const ConnectButton = () => {
  const [newWindowRef, setNewWindowRef] = useState<Window | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const openNewWindow = () => {
    const newWindow = window.open('', '_blank', 'width=600,height=400');
    if (newWindow) {
      setNewWindowRef(newWindow);
      if (containerRef.current) {
        containerRef.current = newWindow.document.createElement('div');
        newWindow.document.body.appendChild(containerRef.current);
      }
    }
  };

  useEffect(() => {
    // Clean up: close the new window when the parent component unmounts
    return () => {
      if (newWindowRef) {
        newWindowRef.close();
      }
    };
  }, [newWindowRef]);

  return (
    <div>
      <button onClick={openNewWindow}>Open Component in New Window</button>
      {newWindowRef && containerRef.current && (
        ReactDOM.createPortal(
          <MetaMaskConnect />,
          containerRef.current
        )
      )}
    </div>
  );
};

export default ConnectButton;
