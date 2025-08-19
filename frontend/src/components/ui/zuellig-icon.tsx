import React from 'react';

interface ZuelligIconProps {
  className?: string;
  width?: number;
  height?: number;
}

const ZuelligIcon: React.FC<ZuelligIconProps> = ({ 
  className = "", 
  width = 32, 
  height = 32 
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={className} 
      fill="none" 
      viewBox="0 0 28 29"
      width={width}
      height={height}
    > 
      <path 
        d="M28.3 14.9H27c0-2.6-.8-5-2-6.9l3.2-3V0H0v4.5l3.2 3c-1.2 1.9-2 4.3-2 6.8H0v14.9h28.3V14.4Zm-7.6 9.6h-3l2.7-2.6c.2.9.3 1.7.3 2.6ZM8.6 22.4a17 17 0 0 0 3 4.2 12 12 0 0 1-5-2.4l2-1.8Zm.8-.3h4.3v4.8h-.6c-1.5-1.4-2.8-3-3.7-4.8Zm.5-1 3.8-3.4v3.5H10Zm4.7 1h4.3a16 16 0 0 1-3.7 4.8h-.6v-4.8Zm5.3 0h3.9c-1.7 2.2-4.2 4-7.1 4.5 1.3-1.3 2.4-2.9 3.2-4.5Zm-.5-1h-4.8V17l2-1.8h4.1a15 15 0 0 1-1.3 6M13 2.5h.6v4.8H9.4c.9-1.8 2.2-3.5 3.7-4.8ZM8.4 7.2H4.5c1.8-2.3 4.2-4 7.1-4.6a17.1 17.1 0 0 0-3.2 4.6m10 .9-3.8 3.4V8.1h3.8Zm-3.8-1V2.4h.6c1.6 1.4 2.8 3 3.7 4.9h-4.3Zm2.1-4.5a12 12 0 0 1 5 2.5l-2 1.8a17 17 0 0 0-3-4.3M4 8.1h4a18 18 0 0 0-1.3 6H2.1c0-2.2.7-4.3 1.8-6Zm5 0h4.8v4.2l-2 1.9H7.5C7.6 12 8 10 9 8Zm-1.3 7h3L8 17.6c-.2-.8-.3-1.7-.3-2.5m16.8 6h-4.1c.8-1.8 1.2-4 1.3-6h4.6c0 2.2-.7 4.3-1.8 6M2 15.2h4.6c0 1 .2 2.1.4 3.2L4 21a12.4 12.4 0 0 1-1.8-6Zm24.1-1h-4.6c0-1-.2-2-.4-3.1l3.2-3c1.1 1.9 1.8 4 1.8 6.2Z" 
        fill="currentColor"
      /> 
    </svg>
  );
};

export default ZuelligIcon;
