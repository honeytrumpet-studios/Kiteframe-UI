import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Link, AlignLeft, AlignCenter, AlignRight, ChevronDown, X } from 'lucide-react';

interface TextFormattingToolbarProps {
  position: { x: number; y: number };
  fontSize: number;
  fontFamily: string;
  fontWeight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  textAlign: 'left' | 'center' | 'right';
  color: string;
  text: string;
  url?: string;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
  onFontWeightChange: (weight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold') => void;
  onTextAlignChange: (align: 'left' | 'center' | 'right') => void;
  onColorChange: (color: string) => void;
  onTextChange: (text: string) => void;
  onUrlChange: (url: string) => void;
}

const colorSwatches = [
  '#000000', '#666666', '#999999', '#cccccc', '#ffffff',
  '#ff0000', '#ff6600', '#ff9900', '#ffcc00', '#ffff00',
  '#99ff00', '#66ff00', '#00ff00', '#00ff99', '#00ffff',
  '#0099ff', '#0066ff', '#0000ff', '#6600ff', '#9900ff',
  '#ff00ff', '#ff0099'
];

const fontFamilies = [
  // Sans-serif fonts
  { name: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { name: 'Open Sans', value: '"Open Sans", system-ui, sans-serif' },
  { name: 'Roboto', value: 'Roboto, system-ui, sans-serif' },
  { name: 'Lato', value: 'Lato, system-ui, sans-serif' },
  { name: 'Poppins', value: 'Poppins, system-ui, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, system-ui, sans-serif' },
  { name: 'Source Sans Pro', value: '"Source Sans Pro", system-ui, sans-serif' },
  { name: 'Nunito', value: 'Nunito, system-ui, sans-serif' },
  { name: 'Raleway', value: 'Raleway, system-ui, sans-serif' },
  { name: 'Ubuntu', value: 'Ubuntu, system-ui, sans-serif' },
  
  // Serif fonts
  { name: 'Playfair Display', value: '"Playfair Display", serif' },
  { name: 'Merriweather', value: 'Merriweather, serif' },
  { name: 'Lora', value: 'Lora, serif' },
  { name: 'PT Serif', value: '"PT Serif", serif' },
  { name: 'Crimson Text', value: '"Crimson Text", serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Times New Roman', value: '"Times New Roman", serif' },
  
  // Monospace fonts
  { name: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
  { name: 'Fira Code', value: '"Fira Code", monospace' },
  { name: 'Source Code Pro', value: '"Source Code Pro", monospace' },
  { name: 'Inconsolata', value: 'Inconsolata, monospace' },
  { name: 'Courier New', value: '"Courier New", monospace' },
  
  // Display fonts
  { name: 'Lobster', value: 'Lobster, cursive' },
  { name: 'Dancing Script', value: '"Dancing Script", cursive' },
  { name: 'Pacifico', value: 'Pacifico, cursive' },
  { name: 'Comfortaa', value: 'Comfortaa, cursive' },
  { name: 'Fredoka One', value: '"Fredoka One", cursive' }
];

const fontSizes = [
  { name: 'Small', value: 12 },
  { name: 'Medium', value: 16 },
  { name: 'Large', value: 20 },
  { name: 'Extra large', value: 24 },
  { name: 'Huge', value: 32 }
];

// Font weight mappings for each font family
const fontWeights: Record<string, Array<{ name: string; value: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'; cssWeight: number }>> = {
  // Sans-serif fonts
  'Inter, system-ui, sans-serif': [
    { name: 'Light', value: 'light', cssWeight: 300 },
    { name: 'Regular', value: 'normal', cssWeight: 400 },
    { name: 'Medium', value: 'medium', cssWeight: 500 },
    { name: 'SemiBold', value: 'semibold', cssWeight: 600 },
    { name: 'Bold', value: 'bold', cssWeight: 700 }
  ],
  '"Open Sans", system-ui, sans-serif': [
    { name: 'Light', value: 'light', cssWeight: 300 },
    { name: 'Regular', value: 'normal', cssWeight: 400 },
    { name: 'Medium', value: 'medium', cssWeight: 500 },
    { name: 'SemiBold', value: 'semibold', cssWeight: 600 },
    { name: 'Bold', value: 'bold', cssWeight: 700 }
  ],
  'Roboto, system-ui, sans-serif': [
    { name: 'Light', value: 'light', cssWeight: 300 },
    { name: 'Regular', value: 'normal', cssWeight: 400 },
    { name: 'Medium', value: 'medium', cssWeight: 500 },
    { name: 'Bold', value: 'bold', cssWeight: 700 }
  ],
  'Lato, system-ui, sans-serif': [
    { name: 'Light', value: 'light', cssWeight: 300 },
    { name: 'Regular', value: 'normal', cssWeight: 400 },
    { name: 'Bold', value: 'bold', cssWeight: 700 }
  ],
  'Poppins, system-ui, sans-serif': [
    { name: 'Light', value: 'light', cssWeight: 300 },
    { name: 'Regular', value: 'normal', cssWeight: 400 },
    { name: 'Medium', value: 'medium', cssWeight: 500 },
    { name: 'SemiBold', value: 'semibold', cssWeight: 600 },
    { name: 'Bold', value: 'bold', cssWeight: 700 }
  ],
  
  // Serif fonts
  '"Playfair Display", serif': [
    { name: 'Regular', value: 'normal', cssWeight: 400 },
    { name: 'Medium', value: 'medium', cssWeight: 500 },
    { name: 'SemiBold', value: 'semibold', cssWeight: 600 },
    { name: 'Bold', value: 'bold', cssWeight: 700 }
  ],
  'Merriweather, serif': [
    { name: 'Light', value: 'light', cssWeight: 300 },
    { name: 'Regular', value: 'normal', cssWeight: 400 },
    { name: 'Bold', value: 'bold', cssWeight: 700 }
  ],
  'Georgia, serif': [
    { name: 'Regular', value: 'normal', cssWeight: 400 },
    { name: 'Bold', value: 'bold', cssWeight: 700 }
  ],
  
  // Monospace fonts  
  '"JetBrains Mono", monospace': [
    { name: 'Light', value: 'light', cssWeight: 300 },
    { name: 'Regular', value: 'normal', cssWeight: 400 },
    { name: 'Medium', value: 'medium', cssWeight: 500 },
    { name: 'Bold', value: 'bold', cssWeight: 700 }
  ],
  '"Fira Code", monospace': [
    { name: 'Light', value: 'light', cssWeight: 300 },
    { name: 'Regular', value: 'normal', cssWeight: 400 },
    { name: 'Medium', value: 'medium', cssWeight: 500 },
    { name: 'Bold', value: 'bold', cssWeight: 700 }
  ],
  
  // Display fonts
  'Lobster, cursive': [
    { name: 'Regular', value: 'normal', cssWeight: 400 }
  ],
  '"Dancing Script", cursive': [
    { name: 'Regular', value: 'normal', cssWeight: 400 },
    { name: 'Medium', value: 'medium', cssWeight: 500 },
    { name: 'SemiBold', value: 'semibold', cssWeight: 600 },
    { name: 'Bold', value: 'bold', cssWeight: 700 }
  ],
  'Pacifico, cursive': [
    { name: 'Regular', value: 'normal', cssWeight: 400 }
  ],
  'Comfortaa, cursive': [
    { name: 'Light', value: 'light', cssWeight: 300 },
    { name: 'Regular', value: 'normal', cssWeight: 400 },
    { name: 'Medium', value: 'medium', cssWeight: 500 },
    { name: 'SemiBold', value: 'semibold', cssWeight: 600 },
    { name: 'Bold', value: 'bold', cssWeight: 700 }
  ]
};

// Helper function to get CSS font-weight from our weight value
const getFontWeightCSS = (weight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'): number => {
  const weightMap = {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  };
  return weightMap[weight];
};

export function TextFormattingToolbar({
  position,
  fontSize,
  fontFamily,
  fontWeight,
  textAlign,
  color,
  text,
  url,
  onFontSizeChange,
  onFontFamilyChange,
  onFontWeightChange,
  onTextAlignChange,
  onColorChange,
  onTextChange,
  onUrlChange
}: TextFormattingToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showFontWeight, setShowFontWeight] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customSize, setCustomSize] = useState(fontSize.toString());
  const [urlInput, setUrlInput] = useState(url || '');
  const [textInput, setTextInput] = useState(text || '');

  const currentFontFamily = fontFamilies.find(f => f.value === fontFamily)?.name || 'Simple';
  const currentFontSize = fontSizes.find(f => f.value === fontSize)?.name || fontSize.toString();
  
  // Get available weights for current font family
  const availableWeights = fontWeights[fontFamily] || fontWeights['Inter, system-ui, sans-serif'];
  const currentWeight = availableWeights.find(w => w.value === fontWeight)?.name || 'Regular';
  
  // Helper function to ensure selected weight is available for font family
  const ensureValidWeight = (newFontFamily: string, currentWeight: string) => {
    const newAvailableWeights = fontWeights[newFontFamily] || fontWeights['Inter, system-ui, sans-serif'];
    const weightExists = newAvailableWeights.some(w => w.value === currentWeight);
    
    if (!weightExists) {
      // Default to 'normal' if current weight isn't available
      const normalWeight = newAvailableWeights.find(w => w.value === 'normal');
      return normalWeight ? normalWeight.value : newAvailableWeights[0].value;
    }
    return currentWeight;
  };

  // Handle saving the link with text
  const handleSaveLink = () => {
    const finalText = textInput.trim() || urlInput; // Use URL as text if no text provided
    const finalUrl = urlInput.trim();
    
    if (finalUrl) {
      onUrlChange(finalUrl);
      if (finalText !== text) {
        onTextChange(finalText);
      }
    }
    setShowUrlInput(false);
  };

  return (
    <div 
      className="absolute z-50 pointer-events-auto"
      style={{
        left: position.x,
        top: position.y - 80,
        transform: 'translateX(-50%)'
      }}
    >
      {/* Color Picker */}
      {showColorPicker && (
        <div className="mb-2 bg-white dark:bg-gray-900 rounded-lg p-3 shadow-lg">
          <div className="flex flex-wrap gap-1 max-w-[400px]">
            {colorSwatches.map((swatch) => (
              <button
                key={swatch}
                className={cn(
                  "w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform",
                  color === swatch ? "border-blue-500" : "border-gray-300 dark:border-gray-600"
                )}
                style={{ backgroundColor: swatch }}
                onClick={() => {
                  onColorChange(swatch);
                  setShowColorPicker(false);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Font Family Dropdown */}
      {showFontFamily && (
        <div className="mb-2 bg-white dark:bg-gray-900 rounded-lg p-2 shadow-lg min-w-[200px] max-h-[260px] overflow-y-auto">
          {fontFamilies.map((font) => (
            <button
              key={font.value}
              className={cn(
                "w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white flex items-center",
                fontFamily === font.value && "bg-blue-600"
              )}
              style={{ fontFamily: font.value }}
              onClick={() => {
                const validWeight = ensureValidWeight(font.value, fontWeight);
                onFontFamilyChange(font.value);
                if (validWeight !== fontWeight) {
                  onFontWeightChange(validWeight as any);
                }
                setShowFontFamily(false);
              }}
            >
              {fontFamily === font.value && <span className="mr-2">✓</span>}
              {font.name}
            </button>
          ))}
        </div>
      )}

      {/* Font Size Dropdown */}
      {showFontSize && (
        <div className="mb-2 bg-white dark:bg-gray-900 rounded-lg p-2 shadow-lg min-w-[160px]">
          {fontSizes.map((size) => (
            <button
              key={size.value}
              className={cn(
                "w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white flex items-center",
                fontSize === size.value && "bg-blue-600"
              )}
              onClick={() => {
                onFontSizeChange(size.value);
                setShowFontSize(false);
              }}
            >
              {fontSize === size.value && <span className="mr-2">✓</span>}
              {size.name}
            </button>
          ))}
          <div className="border-t border-gray-300 dark:border-gray-700 mt-2 pt-2">
            <input
              type="number"
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const size = parseInt(customSize);
                  if (size >= 8 && size <= 72) {
                    onFontSizeChange(size);
                    setShowFontSize(false);
                  }
                }
              }}
              className="w-full px-2 py-1 bg-gray-200 dark:bg-gray-800 border border-blue-500 rounded text-black dark:text-white text-sm"
              placeholder="Custom size"
              min="8"
              max="72"
            />
          </div>
        </div>
      )}

      {/* Font Weight Dropdown */}
      {showFontWeight && (
        <div className="mb-2 bg-white dark:bg-gray-900 rounded-lg p-2 shadow-lg min-w-[140px]">
          {availableWeights.map((weight) => (
            <button
              key={weight.value}
              className={cn(
                "w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white flex items-center",
                fontWeight === weight.value && "bg-blue-600"
              )}
              style={{ 
                fontFamily: fontFamily,
                fontWeight: weight.cssWeight 
              }}
              onClick={() => {
                onFontWeightChange(weight.value);
                setShowFontWeight(false);
              }}
            >
              {fontWeight === weight.value && <span className="mr-2">✓</span>}
              {weight.name}
            </button>
          ))}
        </div>
      )}

      {/* URL Input */}
      {showUrlInput && (
        <div className="mb-2 bg-white dark:bg-gray-900 rounded-lg p-3 shadow-lg min-w-[300px]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-black dark:text-white text-sm font-medium">Add Link</label>
              <button
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400"
                onClick={() => {
                  setShowUrlInput(false);
                  setTextInput(text || '');
                  setUrlInput(url || '');
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-black dark:text-white text-xs font-medium">Text</label>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Add some text"
                className="w-full px-3 py-2 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-black dark:text-white text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-black dark:text-white text-xs font-medium">URL</label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveLink();
                  }
                  if (e.key === 'Escape') {
                    setTextInput(text || '');
                    setUrlInput(url || '');
                    setShowUrlInput(false);
                  }
                }}
                placeholder="Enter URL (e.g., https://example.com)"
                className="w-full px-3 py-2 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-black dark:text-white text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                autoFocus
              />
            </div>
            
            <div className="flex gap-2">
              <button
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-black dark:text-white text-sm"
                onClick={() => handleSaveLink()}
              >
                Add Link
              </button>
              {url && (
                <button
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-black dark:text-white text-sm"
                  onClick={() => {
                    onUrlChange('');
                    setUrlInput('');
                    setShowUrlInput(false);
                  }}
                >
                  Remove Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Toolbar */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-2 shadow-lg flex items-center gap-1">
        {/* Color Button */}
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setShowFontFamily(false);
            setShowFontSize(false);
          }}
        >
          <div 
            className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: color }}
          />
        </button>

        {/* Font Family Dropdown */}
        <button
          className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-black dark:text-white text-sm flex items-center gap-1"
          onClick={() => {
            setShowFontFamily(!showFontFamily);
            setShowColorPicker(false);
            setShowFontSize(false);
            setShowFontWeight(false);
          }}
        >
          Aa <ChevronDown className="w-3 h-3" />
        </button>

        {/* Font Size Dropdown */}
        <button
          className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-black dark:text-white text-sm flex items-center gap-1 min-w-[70px]"
          onClick={() => {
            setShowFontSize(!showFontSize);
            setShowColorPicker(false);
            setShowFontFamily(false);
            setShowFontWeight(false);
          }}
        >
          {currentFontSize} <ChevronDown className="w-3 h-3" />
        </button>

        {/* Font Weight Dropdown */}
        <button
          className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-black dark:text-white text-sm flex items-center gap-1 min-w-[80px]"
          onClick={() => {
            setShowFontWeight(!showFontWeight);
            setShowColorPicker(false);
            setShowFontFamily(false);
            setShowFontSize(false);
          }}
        >
          {currentWeight} <ChevronDown className="w-3 h-3" />
        </button>

        <div className="w-px h-6 bg-gray-600" />

        <div className="w-px h-6 bg-gray-600" />

        {/* Link Button */}
        <button
          className={cn(
            "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-black dark:text-white",
            url && "bg-blue-600"
          )}
          onClick={() => {
            if (!showUrlInput) {
              // Sync inputs when opening dialog
              setTextInput(text || '');
              setUrlInput(url || '');
            }
            setShowUrlInput(!showUrlInput);
          }}
        >
          <Link className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-600" />

        {/* Alignment Buttons */}
        <button
          className={cn(
            "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-black dark:text-white",
            textAlign === 'left' && "bg-blue-600"
          )}
          onClick={() => onTextAlignChange('left')}
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          className={cn(
            "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-black dark:text-white",
            textAlign === 'center' && "bg-blue-600"
          )}
          onClick={() => onTextAlignChange('center')}
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          className={cn(
            "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-black dark:text-white",
            textAlign === 'right' && "bg-blue-600"
          )}
          onClick={() => onTextAlignChange('right')}
        >
          <AlignRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}