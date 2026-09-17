/* ==========================================================================
   FlowCraft - State Engine & Data Store
   ========================================================================== */

import { TEMPLATES } from './templates.js';

let state = {
  currentTemplateId: 'date-night',
  nodes: [],
  selectedNodeId: null,
  historyStack: [],
  redoStack: []
};

const listeners = [];

export function getState() {
  return state;
}

export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

function notify() {
  listeners.forEach(fn => fn(state));
}

function pushHistory() {
  const snapshot = JSON.stringify({
    nodes: state.nodes,
    currentTemplateId: state.currentTemplateId
  });
  state.historyStack.push(snapshot);
  if (state.historyStack.length > 30) state.historyStack.shift();
  state.redoStack = [];
}

export function undo() {
  if (state.historyStack.length === 0) return false;
  const currentSnapshot = JSON.stringify({
    nodes: state.nodes,
    currentTemplateId: state.currentTemplateId
  });
  state.redoStack.push(currentSnapshot);
  
  const prevSnapshot = state.historyStack.pop();
  const data = JSON.parse(prevSnapshot);
  state.nodes = data.nodes;
  state.currentTemplateId = data.currentTemplateId;
  state.selectedNodeId = null;
  notify();
  return true;
}

export function redo() {
  if (state.redoStack.length === 0) return false;
  const currentSnapshot = JSON.stringify({
    nodes: state.nodes,
    currentTemplateId: state.currentTemplateId
  });
  state.historyStack.push(currentSnapshot);

  const nextSnapshot = state.redoStack.pop();
  const data = JSON.parse(nextSnapshot);
  state.nodes = data.nodes;
  state.currentTemplateId = data.currentTemplateId;
  state.selectedNodeId = null;
  notify();
  return true;
}

export function loadTemplate(templateId) {
  const template = TEMPLATES[templateId] || TEMPLATES['date-night'];
  pushHistory();
  state.currentTemplateId = templateId;
  // Deep clone nodes
  state.nodes = JSON.parse(JSON.stringify(template.nodes));
  state.selectedNodeId = null;
  notify();
}

export function loadCustomNodes(nodes, templateId = 'custom') {
  pushHistory();
  state.currentTemplateId = templateId;
  state.nodes = JSON.parse(JSON.stringify(nodes));
  state.selectedNodeId = null;
  notify();
}

export function selectNode(nodeId) {
  if (state.selectedNodeId !== nodeId) {
    state.selectedNodeId = nodeId;
    notify();
  }
}

export function addNode(shape = 'rect', x = 400, y = 300) {
  pushHistory();
  const newId = 'node-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  
  let title = 'New Action Card';
  let emoji = '⚡';
  let color = '#3b82f6';
  
  if (shape === 'pill') {
    title = 'Start / End Point';
    emoji = '🏁';
    color = '#10b981';
  } else if (shape === 'diamond') {
    title = 'Decision Point?';
    emoji = '❓';
    color = '#f59e0b';
  } else if (shape === 'note') {
    title = 'Sticky Note';
    emoji = '📌';
    color = '#fef08a';
  }

  const newNode = {
    id: newId,
    title,
    subtitle: 'Click double to edit details',
    shape,
    emoji,
    color,
    x,
    y,
    branches: shape === 'diamond' ? [
      { id: 'b-' + Math.random().toString(36).substr(2, 4), label: 'Option Yes', targetNodeId: null },
      { id: 'b-' + Math.random().toString(36).substr(2, 4), label: 'Option No', targetNodeId: null }
    ] : [
      { id: 'b-' + Math.random().toString(36).substr(2, 4), label: 'Next Step ➡️', targetNodeId: null }
    ]
  };

  state.nodes.push(newNode);
  state.selectedNodeId = newId;
  notify();
  return newNode;
}

export function updateNode(nodeId, changes) {
  const node = state.nodes.find(n => n.id === nodeId);
  if (!node) return;
  pushHistory();
  Object.assign(node, changes);
  notify();
}

export function moveNode(nodeId, x, y, recordHistory = true) {
  const node = state.nodes.find(n => n.id === nodeId);
  if (!node) return;
  node.x = Math.round(x);
  node.y = Math.round(y);

  if (recordHistory) {
    pushHistory();
    notify();
  } else {
    // Fast direct DOM update during live dragging to preserve touch/mouse tracking
    const nodeEl = document.getElementById(`node-${nodeId}`);
    if (nodeEl) {
      nodeEl.style.left = `${node.x}px`;
      nodeEl.style.top = `${node.y}px`;
    }
  }
}

export function deleteNode(nodeId) {
  const idx = state.nodes.findIndex(n => n.id === nodeId);
  if (idx === -1) return;
  pushHistory();
  
  // Remove references to this node in other node branches
  state.nodes.forEach(n => {
    n.branches.forEach(b => {
      if (b.targetNodeId === nodeId) {
        b.targetNodeId = null;
      }
    });
  });

  state.nodes.splice(idx, 1);
  if (state.selectedNodeId === nodeId) {
    state.selectedNodeId = null;
  }
  notify();
}

export function duplicateNode(nodeId) {
  const node = state.nodes.find(n => n.id === nodeId);
  if (!node) return;
  pushHistory();
  
  const newId = 'node-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  const cloned = JSON.parse(JSON.stringify(node));
  cloned.id = newId;
  cloned.x += 40;
  cloned.y += 40;
  cloned.branches.forEach(b => {
    b.id = 'b-' + Math.random().toString(36).substr(2, 4);
  });

  state.nodes.push(cloned);
  state.selectedNodeId = newId;
  notify();
}

export function connectBranch(sourceNodeId, branchId, targetNodeId) {
  const sourceNode = state.nodes.find(n => n.id === sourceNodeId);
  if (!sourceNode) return;
  
  let branch = sourceNode.branches.find(b => b.id === branchId);
  pushHistory();
  if (branch) {
    branch.targetNodeId = targetNodeId;
  } else {
    // Create new branch if needed
    sourceNode.branches.push({
      id: branchId || ('b-' + Math.random().toString(36).substr(2, 4)),
      label: 'Choice Path',
      targetNodeId
    });
  }
  notify();
}

export function disconnectBranch(sourceNodeId, branchId) {
  const sourceNode = state.nodes.find(n => n.id === sourceNodeId);
  if (!sourceNode) return;
  const branch = sourceNode.branches.find(b => b.id === branchId);
  if (branch) {
    pushHistory();
    branch.targetNodeId = null;
    notify();
  }
}

export function autoLayout() {
  if (state.nodes.length === 0) return;
  pushHistory();

  // Find root node (node without incoming edges or first node)
  const incoming = new Set();
  state.nodes.forEach(n => {
    n.branches.forEach(b => {
      if (b.targetNodeId) incoming.add(b.targetNodeId);
    });
  });

  const rootNodes = state.nodes.filter(n => !incoming.has(n.id));
  const root = rootNodes.length > 0 ? rootNodes[0] : state.nodes[0];

  // BFS / Level assignment
  const levels = new Map();
  const queue = [{ id: root.id, level: 0 }];
  const visited = new Set();

  while (queue.length > 0) {
    const { id, level } = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);

    if (!levels.has(level)) levels.set(level, []);
    const node = state.nodes.find(n => n.id === id);
    if (node) {
      levels.get(level).push(node);
      node.branches.forEach(b => {
        if (b.targetNodeId && !visited.has(b.targetNodeId)) {
          queue.push({ id: b.targetNodeId, level: level + 1 });
        }
      });
    }
  }

  // Handle unvisited nodes
  state.nodes.forEach(n => {
    if (!visited.has(n.id)) {
      if (!levels.has(0)) levels.set(0, []);
      levels.get(0).push(n);
    }
  });

  // Calculate layout coordinates with generous spacing
  const levelHeight = 260;
  const nodeWidth = 360;

  levels.forEach((nodesInLevel, levelIdx) => {
    const totalWidth = nodesInLevel.length * nodeWidth;
    const startX = 400 - totalWidth / 2 + nodeWidth / 2;

    nodesInLevel.forEach((node, idx) => {
      node.x = Math.round(startX + idx * nodeWidth);
      node.y = Math.round(100 + levelIdx * levelHeight);
    });
  });

  notify();
}

export function clearCanvas() {
  pushHistory();
  state.nodes = [];
  state.selectedNodeId = null;
  notify();
}

export function importJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (Array.isArray(data.nodes)) {
      pushHistory();
      state.nodes = data.nodes;
      state.currentTemplateId = data.currentTemplateId || 'custom';
      state.selectedNodeId = null;
      notify();
      return true;
    }
  } catch (e) {
    console.error('Import error', e);
  }
  return false;
}

export function exportJSON() {
  return JSON.stringify({
    version: '1.0',
    currentTemplateId: state.currentTemplateId,
    nodes: state.nodes
  }, null, 2);
}
