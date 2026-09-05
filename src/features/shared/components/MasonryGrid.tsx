import React, { useEffect, useRef, useState } from 'react';

interface MasonryGridProps {
  children: React.ReactNode;
  columnWidth?: number;
  gap?: number;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({ children, columnWidth = 280, gap = 20 }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${columnWidth}px, 1fr))`,
        gridAutoRows: '10px',
        gap: `0 ${gap}px`, // Horizontal gap via grid, vertical gap via span calculation
        gridAutoFlow: 'dense',
        alignItems: 'start',
        width: '100%',
      }}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return <MasonryItem gap={gap}>{child}</MasonryItem>;
      })}
    </div>
  );
};

interface MasonryItemProps {
  children: React.ReactNode;
  gap: number;
}

const MasonryItem: React.FC<MasonryItemProps> = ({ children, gap }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [spans, setSpans] = useState(1);

  useEffect(() => {
    if (!ref.current) return;
    
    // We observe the first child which is the actual card
    const target = ref.current.firstElementChild as HTMLElement;
    if (!target) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // ScrollHeight allows us to capture the full natural size even if it's currently smaller
        const height = entry.target.getBoundingClientRect().height;
        
        // Calculate vertical span (row height = 10px)
        const rowSpan = Math.ceil((height + gap) / 10);
        
        setSpans(rowSpan);
      }
    });

    observer.observe(target);
    return () => observer.disconnect();
  }, [gap]);

  return (
    <div style={{ gridRowEnd: `span ${spans}` }}>
      <div ref={ref} style={{ height: '100%', width: '100%' }}>
        {children}
      </div>
    </div>
  );
};
