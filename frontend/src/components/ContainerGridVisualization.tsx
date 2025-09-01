import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ContainerNumber, GridStructure } from '../services/api';

interface ContainerGridVisualizationProps {
  imageUrl: string;
  imageName: string;
  containerNumbers: ContainerNumber[];
  extractedText: string;
  confidence: number;
  gridStructure?: GridStructure;
  editable?: boolean;
  onSerialNumberChange?: (row: number, position: number, value: string) => void;
}

interface GridPosition {
  row: number;
  position: number;
  container: ContainerNumber;
}

interface EditableGridCell {
  row: number;
  position: number;
  serialNumber: string;
  confidence: number;
  isOriginal: boolean; // true if from AI extraction, false if user-edited
}

const ContainerGridVisualization: React.FC<ContainerGridVisualizationProps> = ({
  imageUrl,
  imageName,
  containerNumbers,
  extractedText,
  confidence,
  gridStructure,
  editable = false,
  onSerialNumberChange
}) => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [magnifierOffset, setMagnifierOffset] = useState({ x: 0, y: 0 });
  const [editableGrid, setEditableGrid] = useState<EditableGridCell[][]>([]);
  const imageRef = useRef<HTMLImageElement>(null);
  // Build editable grid structure from AI extraction and grid structure
  const buildEditableGrid = useCallback((): EditableGridCell[][] => {
    // Use explicit grid structure if available, otherwise parse from extracted text
    let rows = 0;
    let columns = 0;

    if (gridStructure) {
      rows = gridStructure.rows;
      columns = gridStructure.columns;
    } else {
      // Fallback to parsing extracted text
      const gridPositions = parseGridStructure();
      rows = Math.max(...gridPositions.map(p => p.row), 0);
      columns = Math.max(...gridPositions.map(p => p.position), 0);
    }

    // Initialize empty grid
    const grid: EditableGridCell[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: EditableGridCell[] = [];
      for (let c = 0; c < columns; c++) {
        row.push({
          row: r + 1,
          position: c + 1,
          serialNumber: '',
          confidence: 0,
          isOriginal: false
        });
      }
      grid.push(row);
    }

    // Populate with AI-extracted data
    const gridPositions = parseGridStructure();
    gridPositions.forEach(pos => {
      const rowIndex = pos.row - 1;
      const colIndex = pos.position - 1;
      if (rowIndex >= 0 && rowIndex < rows && colIndex >= 0 && colIndex < columns) {
        grid[rowIndex][colIndex] = {
          row: pos.row,
          position: pos.position,
          serialNumber: pos.container.number,
          confidence: pos.container.confidence,
          isOriginal: true
        };
      }
    });

    return grid;
  }, [gridStructure, containerNumbers, extractedText]);

  // Parse the extracted text to determine grid structure (fallback method)
  const parseGridStructure = (): GridPosition[] => {
    const gridPositions: GridPosition[] = [];
    const lines = extractedText.split('\n').filter(line => line.trim());

    let currentRow = 0;

    lines.forEach((line) => {
      // Match row headers like "Row row1:", "Row row2:", etc.
      const rowMatch = line.match(/Row\s+(row\d+):/);
      if (rowMatch) {
        const rowName = rowMatch[1];
        currentRow = parseInt(rowName.replace('row', ''));

        // Also try to extract positions from the same line (in case they're on one line)
        const positionRegex = /Position\s+(\d+):\s+([A-Za-z0-9\-]+)\s+\((\d+)%\)/g;
        let match;
        while ((match = positionRegex.exec(line)) !== null) {
          const position = parseInt(match[1]);
          const containerNumber = match[2];
          const confidence = parseInt(match[3]);

          // Find the corresponding container object
          const container = containerNumbers.find(c => c.number === containerNumber);
          if (container) {
            gridPositions.push({
              row: currentRow,
              position,
              container
            });
          }
        }
      } else if (currentRow > 0) {
        // Extract positions from lines under the row header
        const positionRegex = /Position\s+(\d+):\s+([A-Za-z0-9\-]+)\s+\((\d+)%\)/g;
        let match;
        while ((match = positionRegex.exec(line)) !== null) {
          const position = parseInt(match[1]);
          const containerNumber = match[2];
          const confidence = parseInt(match[3]);

          // Find the corresponding container object
          const container = containerNumbers.find(c => c.number === containerNumber);
          if (container) {
            gridPositions.push({
              row: currentRow,
              position,
              container
            });
          }
        }
      }
    });

    return gridPositions;
  };

  // Initialize editable grid when data changes
  React.useEffect(() => {
    if (editable) {
      const grid = buildEditableGrid();
      setEditableGrid(grid);
    }
  }, [editable, buildEditableGrid]);

  // Handle serial number changes
  const handleSerialNumberChange = (row: number, position: number, value: string) => {
    if (!editable) return;

    setEditableGrid(prev => {
      const newGrid = prev.map(r => [...r]);
      const rowIndex = row - 1;
      const colIndex = position - 1;

      if (rowIndex >= 0 && rowIndex < newGrid.length && colIndex >= 0 && colIndex < newGrid[rowIndex].length) {
        newGrid[rowIndex][colIndex] = {
          ...newGrid[rowIndex][colIndex],
          serialNumber: value,
          isOriginal: false // Mark as user-edited
        };
      }

      return newGrid;
    });

    // Notify parent component
    if (onSerialNumberChange) {
      onSerialNumberChange(row, position, value);
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 90) return 'bg-green-100 border-green-300 text-green-800';
    if (confidence >= 80) return 'bg-orange-100 border-orange-300 text-orange-800';
    return 'bg-red-100 border-red-300 text-red-800';
  };

  const getConfidenceBadgeColor = (confidence: number): string => {
    if (confidence >= 90) return 'bg-green-500';
    if (confidence >= 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Magnifier event handlers
  const handleMouseEnter = () => {
    // Don't automatically show magnifier on enter - let mousemove handle it
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if cursor is within the actual image bounds (not just the container)
    const imageAspectRatio = imageRef.current.naturalWidth / imageRef.current.naturalHeight;
    const containerAspectRatio = rect.width / rect.height;

    let imageDisplayWidth, imageDisplayHeight, imageOffsetX, imageOffsetY;

    if (imageAspectRatio > containerAspectRatio) {
      // Image is wider - fits to width, letterboxed top/bottom
      imageDisplayWidth = rect.width;
      imageDisplayHeight = rect.width / imageAspectRatio;
      imageOffsetX = 0;
      imageOffsetY = (rect.height - imageDisplayHeight) / 2;
    } else {
      // Image is taller - fits to height, letterboxed left/right
      imageDisplayWidth = rect.height * imageAspectRatio;
      imageDisplayHeight = rect.height;
      imageOffsetX = (rect.width - imageDisplayWidth) / 2;
      imageOffsetY = 0;
    }

    // Check if cursor is over the actual image content
    const isOverImage = x >= imageOffsetX && x <= imageOffsetX + imageDisplayWidth &&
                       y >= imageOffsetY && y <= imageOffsetY + imageDisplayHeight;

    if (!isOverImage) {
      setShowMagnifier(false);
      return;
    }

    setShowMagnifier(true);

    // Calculate the position for the magnifier (very close to cursor)
    // Ensure magnifier stays within viewport bounds
    const magnifierWidth = 200;
    const magnifierHeight = 200;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const offset = 5; // Very small offset for very close positioning

    let magnifierX = e.clientX + offset;
    let magnifierY = e.clientY - magnifierHeight / 2; // Center vertically on cursor

    // Adjust if magnifier would go off the right edge
    if (magnifierX + magnifierWidth > viewportWidth - 5) {
      magnifierX = e.clientX - magnifierWidth - offset;
    }

    // Adjust if magnifier would go off the top edge
    if (magnifierY < 5) {
      magnifierY = e.clientY + offset; // Position below cursor
    }

    // Adjust if magnifier would go off the bottom edge
    if (magnifierY + magnifierHeight > viewportHeight - 5) {
      magnifierY = e.clientY - magnifierHeight - offset; // Position above cursor
    }

    // Final check for left edge
    if (magnifierX < 5) {
      magnifierX = e.clientX + offset;
    }

    setMagnifierPosition({
      x: magnifierX,
      y: magnifierY
    });

    // Calculate the offset for the magnified area relative to the actual image content
    const relativeX = x - imageOffsetX;
    const relativeY = y - imageOffsetY;
    const xRatio = imageRef.current.naturalWidth / imageDisplayWidth;
    const yRatio = imageRef.current.naturalHeight / imageDisplayHeight;

    setMagnifierOffset({
      x: relativeX * xRatio,
      y: relativeY * yRatio
    });
  };

  // Determine grid structure and data to use
  let finalGrid: (GridPosition | null)[][] | EditableGridCell[][];
  let finalMaxRow: number;
  let finalMaxPosition: number;
  let gridStructureText: string;

  if (editable && editableGrid.length > 0) {
    // Use editable grid
    finalGrid = editableGrid;
    finalMaxRow = editableGrid.length;
    finalMaxPosition = editableGrid[0]?.length || 0;
    const totalProducts = editableGrid.flat().filter(cell => cell.serialNumber).length;
    gridStructureText = `${finalMaxRow} rows × ${finalMaxPosition} columns (${totalProducts} products)`;
  } else {
    // Use original grid logic for non-editable mode
    const gridPositions = parseGridStructure();
    const maxRow = Math.max(...gridPositions.map(p => p.row), 0);
    const maxPosition = Math.max(...gridPositions.map(p => p.position), 0);

    finalMaxRow = maxRow;
    finalMaxPosition = maxPosition;

    if (gridPositions.length === 0 && containerNumbers.length > 0) {
      // Fallback: arrange containers in a reasonable grid
      const totalContainers = containerNumbers.length;
      finalMaxRow = Math.ceil(Math.sqrt(totalContainers));
      finalMaxPosition = Math.ceil(totalContainers / finalMaxRow);

      finalGrid = Array(finalMaxRow).fill(null).map(() => Array(finalMaxPosition).fill(null));

      containerNumbers.forEach((container, index) => {
        const row = Math.floor(index / finalMaxPosition);
        const position = index % finalMaxPosition;
        if (row < finalMaxRow && position < finalMaxPosition) {
          (finalGrid as (GridPosition | null)[][])[row][position] = {
            row: row + 1,
            position: position + 1,
            container
          };
        }
      });
    } else {
      // Use parsed grid structure
      finalGrid = Array(maxRow).fill(null).map(() => Array(maxPosition).fill(null));
      gridPositions.forEach(pos => {
        if (pos.row <= maxRow && pos.position <= maxPosition) {
          (finalGrid as (GridPosition | null)[][])[pos.row - 1][pos.position - 1] = pos;
        }
      });
    }

    const totalProducts = containerNumbers.length;
    gridStructureText = `${finalMaxRow} rows × ${finalMaxPosition} columns (${totalProducts} products detected)`;
  }

  return (
    <Card className="bg-white/50 border border-gray-200 rounded-xl">
      {/* Header with overall confidence */}
      <CardHeader className="pb-4 bg-z-pale-green border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">AI</span>
            </div>
            <span>Container Extraction Results</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Overall Confidence:</span>
            <Badge className={`${getConfidenceBadgeColor(confidence)} text-white`}>
              {confidence}%
            </Badge>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">{imageName}</p>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Original Image with Magnifier */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <h3 className="text-base font-semibold text-gray-900">Original Image</h3>
              <Badge variant="outline" className="text-xs">
                {containerNumbers.length} containers detected
              </Badge>
            </div>
            <div className="relative bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Original container image"
                className="w-full h-80 object-contain cursor-crosshair"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
              />

              {/* Magnifier */}
              {showMagnifier && imageRef.current && (
                <div
                  className="fixed pointer-events-none z-50 border-2 border-gray-800 rounded-lg overflow-hidden shadow-xl bg-white"
                  style={{
                    left: magnifierPosition.x,
                    top: magnifierPosition.y,
                    width: '200px',
                    height: '200px',
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: `${imageRef.current.naturalWidth * 3}px ${imageRef.current.naturalHeight * 3}px`,
                    backgroundPosition: `-${magnifierOffset.x * 3 - 100}px -${magnifierOffset.y * 3 - 100}px`,
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500 transform -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 text-center">Hover over the image to magnify and see serial numbers clearly</p>
          </div>

          {/* AI Extraction Grid */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full ${editable ? 'bg-blue-500' : 'bg-green-500'}`}></div>
              <h3 className="text-base font-semibold text-gray-900">
                {editable ? 'Editable Verification Grid' : 'AI Extraction Grid'}
              </h3>
              <Badge variant="outline" className="text-xs">
                {gridStructureText}
              </Badge>
              {editable && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                  Editable
                </Badge>
              )}
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="space-y-3">
                {finalGrid.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex items-center space-x-3">
                    <div className="w-14 flex items-center justify-center text-xs font-medium text-gray-500 bg-gray-100 rounded px-2 py-1">
                      Row {rowIndex + 1}
                    </div>
                    <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: `repeat(${finalMaxPosition}, minmax(80px, 1fr))` }}>
                      {row.map((cell, colIndex) => {
                        if (editable && cell && 'serialNumber' in cell) {
                          // Editable mode - render input fields
                          const editableCell = cell as EditableGridCell;
                          return (
                            <div
                              key={colIndex}
                              className={`
                                h-20 rounded-lg border-2 flex flex-col items-center justify-center p-1 transition-all
                                ${editableCell.serialNumber
                                  ? editableCell.isOriginal
                                    ? getConfidenceColor(editableCell.confidence)
                                    : 'bg-blue-50 border-blue-300' // User-edited styling
                                  : 'bg-gray-50 border-gray-200'
                                }
                              `}
                            >
                              <Input
                                value={editableCell.serialNumber}
                                onChange={(e) => handleSerialNumberChange(editableCell.row, editableCell.position, e.target.value)}
                                placeholder="Serial #"
                                className="h-8 text-xs font-mono text-center border-0 bg-transparent focus:bg-white/90 focus:border focus:border-blue-400 rounded px-1"
                                style={{ minWidth: '60px' }}
                              />
                              {editableCell.serialNumber && (
                                <div className="text-xs opacity-75 font-medium mt-1">
                                  {editableCell.isOriginal ? `${editableCell.confidence}%` : 'Manual'}
                                </div>
                              )}
                            </div>
                          );
                        } else {
                          // Non-editable mode - render as before
                          const gridCell = cell as GridPosition | null;
                          return (
                            <div
                              key={colIndex}
                              className={`
                                h-20 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-medium transition-all hover:scale-105
                                ${gridCell
                                  ? getConfidenceColor(gridCell.container.confidence)
                                  : 'bg-gray-50 border-gray-200 text-gray-400'
                                }
                              `}
                            >
                              {gridCell ? (
                                <>
                                  <div className="font-mono text-sm font-bold px-1 text-center break-all leading-tight">
                                    {gridCell.container.number}
                                  </div>
                                  <div className="text-xs opacity-75 font-medium">
                                    {gridCell.container.confidence}%
                                  </div>
                                </>
                              ) : (
                                <span className="text-gray-400">Empty</span>
                              )}
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Legend */}
        <div className="mt-6 bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Confidence Levels:</span>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span className="text-xs text-gray-600">High (≥90%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
                <span className="text-xs text-gray-600">Medium (80-89%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span className="text-xs text-gray-600">Low (&lt;80%)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContainerGridVisualization;
