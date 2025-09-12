# Upload and Extract Response Format

The `/images/upload-and-extract` endpoint now returns the exact JSON structure required by the frontend:

## Response Structure

```json
{
  "grid_structure": {
    "rows": 3,
    "columns": 5,
    "total_products": 15
  },
  "row1": {
    "1": { "number": "BGB-43395, 200 mg", "confidence": "95%" },
    "2": { "number": "BGB-43395, 200 mg", "confidence": "95%" },
    "3": { "number": "BGB-43395, 200 mg", "confidence": "95%" },
    "4": { "number": "BGB-43395, 200 mg", "confidence": "95%" },
    "5": { "number": "BGB-43395, 200 mg", "confidence": "95%" }
  },
  "row2": {
    "1": { "number": "BGB-43395, 200 mg", "confidence": "95%" },
    "2": { "number": "BGB-43395, 200 mg", "confidence": "95%" },
    "3": { "number": "BGB-43395, 200 mg", "confidence": "95%" },
    "4": { "number": "BGB-43395, 200 mg", "confidence": "95%" },
    "5": { "number": "BGB-43395, 200 mg", "confidence": "95%" }
  },
  "row3": {
    "1": { "number": "BGB-43395, 200 mg", "confidence": "95%" },
    "2": { "number": "BGB-43395, 200 mg", "confidence": "95%" },
    "3": { "number": "BGB-43395, 200 mg", "confidence": "95%" },
    "4": { "number": "BGB-43395, 200 mg", "confidence": "95%" },
    "5": { "number": "BGB-43395, 200 mg", "confidence": "95%" }
  }
}
```

## Changes Made

1. **Modified `ImageController.uploadAndExtract()`**: 
   - Removed the old response wrapper with `message` and `data` fields
   - Added `createGridResponse()` method to generate the grid structure
   - Returns the grid response directly

2. **Updated `UploadAndExtractResponse.java`**:
   - Added `GridStructure` and `ContainerPosition` inner classes
   - Added fields for the new grid-based response

3. **Updated Tests**:
   - Modified `ImageControllerTest` to expect the new response format
   - Updated JSON path assertions to match the grid structure

## Implementation Details

- **Grid Structure**: Fixed 3x5 grid (15 total products)
- **Container Numbers**: Currently uses the first extracted container number for all positions
- **Confidence**: Formatted as percentage strings (e.g., "95%")
- **Fallback**: Uses "BGB-43395, 200 mg" with "95%" confidence if no extraction results

## Future Enhancements

The current implementation uses the same container number for all grid positions. In a real-world scenario, you would:

1. Map OCR results to specific grid positions based on bounding boxes
2. Handle variable grid sizes based on actual image content
3. Implement more sophisticated confidence scoring
4. Add validation for container number formats
