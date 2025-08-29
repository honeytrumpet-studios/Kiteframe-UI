import React, { useState, useEffect } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import type { Suggestion } from '../utils/ai';

export interface SparklePopoverProps {
  nodeId: string;
  label: string;
  description?: string;
  onSelect: (suggestion: Suggestion) => void;
}

export const SparklePopover: React.FC<SparklePopoverProps> = ({ 
  nodeId, 
  label, 
  description, 
  onSelect 
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    if (!open) return;
    
    setLoading(true);
    // For now, use fallback suggestions since we need currentNode, allNodes, allEdges 
    // This will be called from SparkleNodeWrapper instead
    setSuggestions([
      { label: 'Next Action', description: 'Continue the workflow', type: 'default', color: '#22c55e' },
      { label: 'Decision Point', description: 'Choose path forward', type: 'default', color: '#f59e0b' },
      { label: 'Final Step', description: 'Complete the process', type: 'default', color: '#ec4899' }
    ]);
    setLoading(false);
  }, [open, label, description]);

  const handleSelect = (suggestion: Suggestion) => {
    onSelect(suggestion);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button 
          className="p-1.5 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 rounded-full shadow-sm transition-all duration-200 hover:scale-105"
          title="AI Suggestions"
        >
          <Sparkles className="h-3.5 w-3.5 text-yellow-600" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" className="w-72 p-0" sideOffset={8}>
        <div className="p-3 border-b bg-gradient-to-r from-yellow-50 to-amber-50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-600" />
            <span className="font-medium text-sm text-gray-900">AI Suggestions</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">Next steps for "{label}"</p>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
              <span className="ml-2 text-sm text-gray-600">Generating ideas...</span>
            </div>
          )}
          
          {!loading && suggestions.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              No suggestions available
            </div>
          )}
          
          {!loading && suggestions.map((suggestion, index) => (
            <div key={index} className="p-3 border-b last:border-none hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-3 h-3 rounded-full border border-gray-200"
                      style={{ backgroundColor: suggestion.color || '#64748b' }}
                    />
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {suggestion.label}
                    </p>
                  </div>
                  {suggestion.description && (
                    <p className="text-xs text-gray-600 mb-2">
                      {suggestion.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {suggestion.type || 'default'}
                    </span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="shrink-0 text-xs h-7 px-2"
                  onClick={() => handleSelect(suggestion)}
                >
                  Add
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {!loading && suggestions.length > 0 && (
          <div className="p-2 border-t bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              Suggestions powered by AI
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};