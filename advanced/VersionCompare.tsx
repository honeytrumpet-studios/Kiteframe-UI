import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, History, GitCompare } from 'lucide-react';
import { useVersion, Version } from '../versioning';

interface VersionCompareProps {
  currentState: any;
  onLoadVersion?: (version: Version<any>) => void;
}

export function VersionCompare({ currentState, onLoadVersion }: VersionCompareProps) {
  const { versions, saveVersion, clearVersions } = useVersion<any>();
  const [v1, setV1] = useState<string>('');
  const [v2, setV2] = useState<string>('');
  const [versionName, setVersionName] = useState('');
  
  const handleSaveVersion = () => {
    if (versionName.trim()) {
      saveVersion(versionName.trim(), currentState);
      setVersionName('');
    }
  };
  
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  const selectedV1 = versions.find(v => v.id === v1);
  const selectedV2 = versions.find(v => v.id === v2);
  
  const calculateDiff = (va: Version<any> | undefined, vb: Version<any> | undefined) => {
    if (!va || !vb) return { nodeChanges: 0, edgeChanges: 0 };
    
    const nodesA = va.state.nodes || [];
    const nodesB = vb.state.nodes || [];
    const edgesA = va.state.edges || [];
    const edgesB = vb.state.edges || [];
    
    return {
      nodeChanges: Math.abs(nodesA.length - nodesB.length),
      edgeChanges: Math.abs(edgesA.length - edgesB.length),
    };
  };
  
  const diff = calculateDiff(selectedV1, selectedV2);
  
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Version Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Save Version */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
            placeholder="Version name..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
          />
          <Button onClick={handleSaveVersion} disabled={!versionName.trim()} size="sm">
            <Save className="h-4 w-4 mr-1" />
            Save Version
          </Button>
        </div>
        
        {/* Version List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Saved Versions ({versions.length})</h4>
            {versions.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearVersions}>
                Clear All
              </Button>
            )}
          </div>
          
          <div className="grid gap-2 max-h-40 overflow-y-auto">
            {versions.map((version) => (
              <div
                key={version.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm"
              >
                <div>
                  <div className="font-medium">{version.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimestamp(version.timestamp)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLoadVersion?.(version)}
                  className="text-xs"
                >
                  Load
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Compare Versions */}
        {versions.length >= 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GitCompare className="h-4 w-4" />
              <h4 className="text-sm font-medium">Compare Versions</h4>
            </div>
            
            <div className="flex gap-2">
              <Select value={v1} onValueChange={setV1}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select first version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {version.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={v2} onValueChange={setV2}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select second version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {version.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedV1 && selectedV2 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="text-sm font-medium mb-2">Comparison Result</div>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {diff.nodeChanges} node changes
                  </Badge>
                  <Badge variant="outline">
                    {diff.edgeChanges} edge changes
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}