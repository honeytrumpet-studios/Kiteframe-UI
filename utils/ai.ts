/**
 * AI generation logic for KiteFrame workflow suggestions
 */
import type { Node, Edge } from '../types';

export type Suggestion = { 
  label: string; 
  description?: string;
  type?: 'default' | 'image' | 'kframe' | 'liveData' | 'map';
  color?: string;
};

export async function generateNextSteps(
  currentNode: Node,
  allNodes: Node[],
  allEdges: Edge[]
): Promise<Suggestion[]> {
  try {
    console.log('[AI] Generating suggestions for node:', currentNode.id);
    
    const response = await fetch('/api/ai/generate-next-steps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentNode,
        allNodes,
        allEdges
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI] Request failed:', response.status, errorText);
      // Don't throw, just return fallback suggestions
      return getFallbackSuggestions(currentNode);
    }

    const data = await response.json();
    console.log('[AI] Received suggestions:', data.suggestions?.length || 0);
    return data.suggestions || getFallbackSuggestions(currentNode);
  } catch (error) {
    console.error('[AI] Error generating suggestions:', error);
    // Return fallback suggestions instead of throwing to prevent breaking the UI
    return getFallbackSuggestions(currentNode);
  }
}

function getFallbackSuggestions(currentNode: Node): Suggestion[] {
  const label = (currentNode.data?.label || currentNode.id || '').toLowerCase();
  
  // Contextual suggestions based on common workflow patterns
  const suggestions: Suggestion[] = [];
  
  if (label.includes('input') || label.includes('start')) {
    suggestions.push(
      { label: 'Validate Data', description: 'Check input requirements', type: 'default', color: '#f59e0b' },
      { label: 'Process Data', description: 'Transform the input', type: 'default', color: '#22c55e' },
      { label: 'Store Input', description: 'Save for later use', type: 'default', color: '#3b82f6' }
    );
  } else if (label.includes('process') || label.includes('transform')) {
    suggestions.push(
      { label: 'Quality Check', description: 'Validate processing results', type: 'default', color: '#f59e0b' },
      { label: 'Generate Output', description: 'Create final result', type: 'default', color: '#ec4899' },
      { label: 'Log Activity', description: 'Record processing details', type: 'default', color: '#64748b' }
    );
  } else if (label.includes('output') || label.includes('result')) {
    suggestions.push(
      { label: 'Send Notification', description: 'Alert stakeholders', type: 'default', color: '#8b5cf6' },
      { label: 'Archive Results', description: 'Store for future reference', type: 'default', color: '#64748b' },
      { label: 'Generate Report', description: 'Create summary document', type: 'image', color: '#06b6d4' }
    );
  } else {
    // Generic suggestions
    suggestions.push(
      { label: 'Next Action', description: 'Continue the workflow', type: 'default', color: '#22c55e' },
      { label: 'Decision Point', description: 'Choose path forward', type: 'default', color: '#f59e0b' },
      { label: 'Final Step', description: 'Complete the process', type: 'default', color: '#ec4899' }
    );
  }
  
  return suggestions.slice(0, 3);
}