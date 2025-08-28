
import React, { useRef } from 'react';
import { KiteFrameCanvas } from './KiteFrameCanvas';

export function CanvasBridge(props: any) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} data-kiteframe-canvas className={props.className}>
      <KiteFrameCanvas {...props} />
    </div>
  );
}
