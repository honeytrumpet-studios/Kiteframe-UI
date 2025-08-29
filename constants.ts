/**
 * KiteFrame Library Constants
 */

export const NODE_TYPES = {
  DEFAULT: 'default',
  IMAGE: 'image',
  KFRAME: 'kframe',
  ANNOTATION: 'annotation',
  CHART: 'chart',
  DATA_TRANSFORMER: 'dataTransformer',
  FILTER: 'filter',
  SORT: 'sort',
  GROUP_BY: 'groupBy',
  PIVOT: 'pivot',
  JOIN: 'join',
  CONCAT: 'concat',
  FILE: 'file',
  EMAIL: 'email',
  FORM: 'form',
  FORMULA: 'formula',
  INTEGRATION: 'integration',
  LIVE_DATA: 'liveData',
  MAP: 'map',
  NOTIFICATION: 'notification',
  SCHEDULER: 'scheduler',
  VIDEO: 'video',
  WEATHER: 'weather',
  WEBHOOK: 'webhook',
  API: 'api',
  METRIC: 'metric',
  INPUT: 'input',
  OUTPUT: 'output',
  PROCESS: 'process',
  DECISION: 'decision',
  CONDITION: 'condition',
  LOOP: 'loop',
  DATABASE: 'database',
  SCRIPT: 'script',
  CUSTOM: 'custom'
} as const;

export const EDGE_TYPES = {
  DEFAULT: 'default',
  SMOOTHSTEP: 'smoothstep',
  STRAIGHT: 'straight',
  STEP: 'step',
  BEZIER: 'bezier',
  SMART: 'smart',
  ANIMATED: 'animated',
  DASHED: 'dashed',
  CUSTOM: 'custom'
} as const;

export const LAYOUT_ALGORITHMS = {
  DAGRE: 'dagre',
  FORCE_DIRECTED: 'forceDirected',
  CIRCULAR: 'circular',
  GRID: 'grid',
  TREE: 'tree',
  RADIAL: 'radial',
  HIERARCHICAL: 'hierarchical',
  MANUAL: 'manual'
} as const;

export const HANDLE_POSITIONS = {
  TOP: 'top',
  RIGHT: 'right',
  BOTTOM: 'bottom',
  LEFT: 'left'
} as const;

export const ZOOM_LEVELS = {
  MIN: 0.1,
  MAX: 4,
  DEFAULT: 1,
  STEP: 0.1
} as const;

export const CANVAS_DEFAULTS = {
  GRID_SIZE: 20,
  SNAP_GRID: true,
  SHOW_GRID: true,
  SHOW_MINIMAP: true,
  ENABLE_PAN: true,
  ENABLE_ZOOM: true,
  ENABLE_SELECTION: true,
  ENABLE_KEYBOARD_SHORTCUTS: true
} as const;

export const COLLABORATION_EVENTS = {
  USER_JOIN: 'user:join',
  USER_LEAVE: 'user:leave',
  CURSOR_MOVE: 'cursor:move',
  NODE_UPDATE: 'node:update',
  EDGE_UPDATE: 'edge:update',
  COMMENT_ADD: 'comment:add',
  COMMENT_UPDATE: 'comment:update',
  COMMENT_DELETE: 'comment:delete',
  CHAT_MESSAGE: 'chat:message',
  VERSION_CREATE: 'version:create',
  VERSION_RESTORE: 'version:restore'
} as const;

export const EXPORT_FORMATS = {
  PNG: 'png',
  PDF: 'pdf',
  SVG: 'svg',
  JSON: 'json',
  HTML: 'html'
} as const;

export const AI_MODELS = {
  GPT4: 'gpt-4',
  GPT4_TURBO: 'gpt-4-turbo',
  GPT4O: 'gpt-4o',
  GPT35_TURBO: 'gpt-3.5-turbo'
} as const;

export const SECURITY_LEVELS = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  SHARED: 'shared',
  RESTRICTED: 'restricted'
} as const;

export const ANIMATION_DURATIONS = {
  INSTANT: 0,
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
} as const;

export const KEYBOARD_SHORTCUTS = {
  UNDO: 'cmd+z,ctrl+z',
  REDO: 'cmd+shift+z,ctrl+shift+z',
  COPY: 'cmd+c,ctrl+c',
  PASTE: 'cmd+v,ctrl+v',
  CUT: 'cmd+x,ctrl+x',
  DELETE: 'delete,backspace',
  SELECT_ALL: 'cmd+a,ctrl+a',
  SAVE: 'cmd+s,ctrl+s',
  EXPORT: 'cmd+e,ctrl+e',
  SEARCH: 'cmd+f,ctrl+f',
  ZOOM_IN: 'cmd+=,ctrl+=',
  ZOOM_OUT: 'cmd+-,ctrl+-',
  ZOOM_FIT: 'cmd+0,ctrl+0'
} as const;

export const ERROR_MESSAGES = {
  INVALID_NODE: 'Invalid node configuration',
  INVALID_EDGE: 'Invalid edge configuration',
  CONNECTION_FAILED: 'Failed to create connection',
  EXPORT_FAILED: 'Failed to export canvas',
  IMPORT_FAILED: 'Failed to import data',
  COLLABORATION_FAILED: 'Failed to connect to collaboration server',
  AI_GENERATION_FAILED: 'Failed to generate workflow',
  PERMISSION_DENIED: 'Permission denied',
  RATE_LIMITED: 'Rate limit exceeded',
  INVALID_WORKFLOW_ID: 'Invalid workflow ID format'
} as const;

export const SUCCESS_MESSAGES = {
  NODE_CREATED: 'Node created successfully',
  EDGE_CREATED: 'Edge created successfully',
  WORKFLOW_SAVED: 'Workflow saved successfully',
  WORKFLOW_EXPORTED: 'Workflow exported successfully',
  WORKFLOW_IMPORTED: 'Workflow imported successfully',
  COLLABORATION_CONNECTED: 'Connected to collaboration server',
  AI_GENERATION_COMPLETE: 'Workflow generated successfully',
  VERSION_RESTORED: 'Version restored successfully'
} as const;