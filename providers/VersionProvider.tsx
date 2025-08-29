import React, { createContext, useContext, useState, useCallback } from 'react';
import { Node, Edge } from '../types';

interface Version {
  id: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
  author?: string;
}

interface VersionContextType {
  versions: Version[];
  currentVersion: Version | null;
  saveVersion: (name: string, description?: string, author?: string) => void;
  loadVersion: (versionId: string) => Version | null;
  deleteVersion: (versionId: string) => void;
  getCurrentFlowState: () => { nodes: Node[]; edges: Edge[] };
  setCurrentFlowState: (nodes: Node[], edges: Edge[]) => void;
  compareVersions: (version1Id: string, version2Id: string) => {
    added: { nodes: Node[]; edges: Edge[] };
    removed: { nodes: Node[]; edges: Edge[] };
    modified: { nodes: Node[]; edges: Edge[] };
  };
}

const VersionContext = createContext<VersionContextType | undefined>(undefined);

interface VersionProviderProps {
  children: React.ReactNode;
}

export const VersionProvider: React.FC<VersionProviderProps> = ({ children }) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersion, setCurrentVersion] = useState<Version | null>(null);
  const [currentNodes, setCurrentNodes] = useState<Node[]>([]);
  const [currentEdges, setCurrentEdges] = useState<Edge[]>([]);

  const generateVersionId = () => `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const saveVersion = useCallback((name: string, description?: string, author?: string) => {
    const newVersion: Version = {
      id: generateVersionId(),
      name,
      description,
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      edges: JSON.parse(JSON.stringify(currentEdges)),
      timestamp: Date.now(),
      author
    };

    setVersions(prev => [...prev, newVersion]);
    setCurrentVersion(newVersion);
  }, [currentNodes, currentEdges]);

  const loadVersion = useCallback((versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      setCurrentVersion(version);
      setCurrentNodes(JSON.parse(JSON.stringify(version.nodes)));
      setCurrentEdges(JSON.parse(JSON.stringify(version.edges)));
      return version;
    }
    return null;
  }, [versions]);

  const deleteVersion = useCallback((versionId: string) => {
    setVersions(prev => prev.filter(v => v.id !== versionId));
    if (currentVersion?.id === versionId) {
      setCurrentVersion(null);
    }
  }, [currentVersion]);

  const getCurrentFlowState = useCallback(() => {
    return { nodes: currentNodes, edges: currentEdges };
  }, [currentNodes, currentEdges]);

  const setCurrentFlowState = useCallback((nodes: Node[], edges: Edge[]) => {
    setCurrentNodes(nodes);
    setCurrentEdges(edges);
  }, []);

  const compareVersions = useCallback((version1Id: string, version2Id: string) => {
    const v1 = versions.find(v => v.id === version1Id);
    const v2 = versions.find(v => v.id === version2Id);
    
    if (!v1 || !v2) {
      return { added: { nodes: [], edges: [] }, removed: { nodes: [], edges: [] }, modified: { nodes: [], edges: [] } };
    }

    const v1NodeIds = new Set(v1.nodes.map(n => n.id));
    const v2NodeIds = new Set(v2.nodes.map(n => n.id));
    const v1EdgeIds = new Set(v1.edges.map(e => e.id));
    const v2EdgeIds = new Set(v2.edges.map(e => e.id));

    // Find added nodes/edges (in v2 but not in v1)
    const addedNodes = v2.nodes.filter(n => !v1NodeIds.has(n.id));
    const addedEdges = v2.edges.filter(e => !v1EdgeIds.has(e.id));

    // Find removed nodes/edges (in v1 but not in v2)
    const removedNodes = v1.nodes.filter(n => !v2NodeIds.has(n.id));
    const removedEdges = v1.edges.filter(e => !v2EdgeIds.has(e.id));

    // Find modified nodes/edges (in both but different)
    const modifiedNodes = v2.nodes.filter(n2 => {
      const v1Node = v1.nodes.find(n1 => n1.id === n2.id);
      return v1Node && JSON.stringify(v1Node) !== JSON.stringify(n2);
    });

    const modifiedEdges = v2.edges.filter(e2 => {
      const v1Edge = v1.edges.find(e1 => e1.id === e2.id);
      return v1Edge && JSON.stringify(v1Edge) !== JSON.stringify(e2);
    });

    return {
      added: { nodes: addedNodes, edges: addedEdges },
      removed: { nodes: removedNodes, edges: removedEdges },
      modified: { nodes: modifiedNodes, edges: modifiedEdges }
    };
  }, [versions]);

  const value: VersionContextType = {
    versions,
    currentVersion,
    saveVersion,
    loadVersion,
    deleteVersion,
    getCurrentFlowState,
    setCurrentFlowState,
    compareVersions
  };

  return (
    <VersionContext.Provider value={value}>
      {children}
    </VersionContext.Provider>
  );
};

export const useVersion = (): VersionContextType => {
  const context = useContext(VersionContext);
  if (!context) {
    throw new Error('useVersion must be used within a VersionProvider');
  }
  return context;
};