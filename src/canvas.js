/* ==========================================================================
   FlowCraft - Canvas Interaction, Pan/Zoom & Node DOM Manager
   ========================================================================== */

import { getState, selectNode, moveNode, connectBranch } from './state.js';
import { renderConnections, updateDragWire, hideDragWire } from './connections.js';
import { playPop, playConnect, playSelect } from './audio.js';

let viewportEl = null;
let worldEl = null;
let gridEl = null;
let nodesLayerEl = null;

// Viewport Transform State
let panX = 100;
let panY = 100;
let scale = 1.0;

// Dragging States
let isPanning = false;
let panStartX = 0;
let panStartY = 0;

let isDraggingNode = false;
let draggedNodeId = null;
let nodeDragOffsetX = 0;
let nodeDragOffsetY = 0;

let isConnectingWire = false;
let wireSourceNodeId = null;
let wireSourceBranchId = null;

let onOpenInspectorCallback = null;

export function initCanvas(onOpenInspector) {
  onOpenInspectorCallback = onOpenInspector;
  viewportEl = document.getElementById('canvas-viewport');
  worldEl = document.getElementById('canvas-world');
  gridEl = document.getElementById('canvas-grid');
  nodesLayerEl = document.getElementById('nodes-layer');

  setupViewportEvents();
  updateTransform();
}

let onTransformChangeCallback = null;

export function setOnTransformChange(cb) {
  onTransformChangeCallback = cb;
}

export function getScale() {
  return scale;
}

export function getPan() {
  return { x: Math.round(panX), y: Math.round(panY) };
}

export function setPan(x, y) {
  panX = x;
  panY = y;
  updateTransform();
}

function updateTransform() {
  if (!worldEl) return;
  worldEl.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  worldEl.dataset.scale = scale;

  if (gridEl) {
    gridEl.style.transform = `translate(${panX * 0.2}px, ${panY * 0.2}px)`;
  }

  const zoomText = document.getElementById('zoom-level-text');
  if (zoomText) {
    zoomText.textContent = `${Math.round(scale * 100)}%`;
  }

  renderConnections();

  if (onTransformChangeCallback) {
    onTransformChangeCallback(scale, panX, panY);
  }
}

export function setZoom(newScale, centerPoint = null) {
  const minScale = 0.2;
  const maxScale = 2.5;
  const clampedScale = Math.min(maxScale, Math.max(minScale, newScale));

  if (centerPoint && viewportEl) {
    const rect = viewportEl.getBoundingClientRect();
    const mouseX = centerPoint.x - rect.left;
    const mouseY = centerPoint.y - rect.top;

    panX = mouseX - (mouseX - panX) * (clampedScale / scale);
    panY = mouseY - (mouseY - panY) * (clampedScale / scale);
  }

  scale = clampedScale;
  updateTransform();
}

export function resetView() {
  panX = 150;
  panY = 100;
  scale = 1.0;
  updateTransform();
}

export function zoomToFit() {
  const state = getState();
  if (state.nodes.length === 0 || !viewportEl) return;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  state.nodes.forEach(node => {
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x + 240); // estimated node width
    minY = Math.min(minY, node.y);
    maxY = Math.max(maxY, node.y + 120); // estimated node height
  });

  const padding = 120;
  const contentW = (maxX - minX) + padding * 2;
  const contentH = (maxY - minY) + padding * 2;

  const viewportW = viewportEl.clientWidth || window.innerWidth;
  const viewportH = viewportEl.clientHeight || window.innerHeight;

  const scaleX = viewportW / contentW;
  const scaleY = (viewportH - 100) / contentH; // top navbar offset
  const idealScale = Math.min(1.1, Math.max(0.25, Math.min(scaleX, scaleY)));

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  scale = idealScale;
  panX = (viewportW / 2) - (centerX * scale);
  panY = ((viewportH + 80) / 2) - (centerY * scale);

  updateTransform();
}

export function zoomIn() {
  setZoom(scale * 1.2);
}

export function zoomOut() {
  setZoom(scale / 1.2);
}

function clientToWorld(clientX, clientY) {
  if (!viewportEl) return { x: 0, y: 0 };
  const rect = viewportEl.getBoundingClientRect();
  return {
    x: (clientX - rect.left - panX) / scale,
    y: (clientY - rect.top - panY) / scale
  };
}

function setupViewportEvents() {
  // Zoom on Wheel (Desktop)
  viewportEl.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(scale * zoomFactor, { x: e.clientX, y: e.clientY });
  }, { passive: false });

  // Touch Pinch-to-Zoom State
  let initialPinchDist = 0;
  let initialPinchScale = 1.0;

  function handlePointerDown(e) {
    // 2-finger Touch Pinch Initialization
    if (e.touches && e.touches.length > 1) {
      isPanning = false;
      isDraggingNode = false;
      isConnectingWire = false;
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        initialPinchDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        initialPinchScale = scale;
      }
      return;
    }

    const clientX = e.clientX ?? (e.touches ? e.touches[0].clientX : 0);
    const clientY = e.clientY ?? (e.touches ? e.touches[0].clientY : 0);
    const target = e.target;

    const nodeEl = target.closest('.flow-node');
    const portOutput = target.closest('.port-output') || target.closest('.branch-tag');
    const inspectorDrawer = target.closest('#node-inspector');
    const simulatorOverlay = target.closest('#simulator-overlay');

    if (inspectorDrawer || simulatorOverlay) return;

    if (portOutput && nodeEl) {
      // Start Wire Connection Drag
      if (e.cancelable) e.preventDefault();
      isConnectingWire = true;
      wireSourceNodeId = nodeEl.dataset.id;
      wireSourceBranchId = portOutput.dataset.branchId || null;
      playSelect();
      return;
    }

    if (nodeEl) {
      // Start Dragging Node
      if (e.cancelable) e.preventDefault();
      isDraggingNode = true;
      draggedNodeId = nodeEl.dataset.id;
      selectNode(draggedNodeId);
      playSelect();

      const worldPos = clientToWorld(clientX, clientY);
      const state = getState();
      const node = state.nodes.find(n => n.id === draggedNodeId);
      if (node) {
        nodeDragOffsetX = worldPos.x - node.x;
        nodeDragOffsetY = worldPos.y - node.y;
      }
      return;
    }

    // Otherwise, Pan Canvas on touching any area outside nodes and UI
    if (!nodeEl && !target.closest('.floating-toolbar') && !target.closest('.top-nav')) {
      if (e.cancelable) e.preventDefault();
      isPanning = true;
      panStartX = clientX - panX;
      panStartY = clientY - panY;
      viewportEl.classList.add('panning');
      selectNode(null);
    }
  }

  function handlePointerMove(e) {
    // 2-finger Touch Pinch to Zoom
    if (e.touches && e.touches.length === 2) {
      if (e.cancelable) e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      if (initialPinchDist > 0) {
        const factor = dist / initialPinchDist;
        const cx = (t1.clientX + t2.clientX) / 2;
        const cy = (t1.clientY + t2.clientY) / 2;
        setZoom(initialPinchScale * factor, { x: cx, y: cy });
      }
      return;
    }

    const clientX = e.clientX ?? (e.touches ? e.touches[0].clientX : 0);
    const clientY = e.clientY ?? (e.touches ? e.touches[0].clientY : 0);

    if (isPanning) {
      panX = clientX - panStartX;
      panY = clientY - panStartY;
      updateTransform();
      return;
    }

    if (isDraggingNode && draggedNodeId) {
      if (e.cancelable) e.preventDefault();
      const worldPos = clientToWorld(clientX, clientY);
      const newX = worldPos.x - nodeDragOffsetX;
      const newY = worldPos.y - nodeDragOffsetY;
      moveNode(draggedNodeId, newX, newY, false);
      renderConnections();
      return;
    }

    if (isConnectingWire && wireSourceNodeId) {
      if (e.cancelable) e.preventDefault();
      const worldPos = clientToWorld(clientX, clientY);
      const sourceEl = document.getElementById(`node-${wireSourceNodeId}`);
      if (sourceEl) {
        const state = getState();
        const sourceNode = state.nodes.find(n => n.id === wireSourceNodeId);
        const x1 = sourceNode.x + sourceEl.offsetWidth / 2;
        const y1 = sourceNode.y + sourceEl.offsetHeight;
        updateDragWire(x1, y1, worldPos.x, worldPos.y);
      }
      return;
    }
  }

  function handlePointerUp(e) {
    initialPinchDist = 0;

    if (isPanning) {
      isPanning = false;
      viewportEl.classList.remove('panning');
    }

    if (isDraggingNode && draggedNodeId) {
      const state = getState();
      const node = state.nodes.find(n => n.id === draggedNodeId);
      if (node) {
        moveNode(draggedNodeId, node.x, node.y, true); // Record history on drag end
      }
      isDraggingNode = false;
      draggedNodeId = null;
    }

    if (isConnectingWire) {
      isConnectingWire = false;
      hideDragWire();

      const clientX = e.clientX ?? (e.changedTouches ? e.changedTouches[0].clientX : 0);
      const clientY = e.clientY ?? (e.changedTouches ? e.changedTouches[0].clientY : 0);
      const dropTarget = document.elementFromPoint(clientX, clientY);
      const targetNodeEl = dropTarget ? dropTarget.closest('.flow-node') : null;

      if (targetNodeEl && wireSourceNodeId) {
        const targetNodeId = targetNodeEl.dataset.id;
        if (targetNodeId !== wireSourceNodeId) {
          connectBranch(wireSourceNodeId, wireSourceBranchId, targetNodeId);
          playConnect();
        }
      }

      wireSourceNodeId = null;
      wireSourceBranchId = null;
    }
  }

  // Mouse & Pointer Listeners
  viewportEl.addEventListener('mousedown', handlePointerDown);
  window.addEventListener('mousemove', handlePointerMove);
  window.addEventListener('mouseup', handlePointerUp);

  // Touch Listeners for Mobile & Tablets
  viewportEl.addEventListener('touchstart', handlePointerDown, { passive: false });
  window.addEventListener('touchmove', handlePointerMove, { passive: false });
  window.addEventListener('touchend', handlePointerUp);
  window.addEventListener('touchcancel', handlePointerUp);
}

export function renderNodes(activeSimNodeId = null) {
  if (!nodesLayerEl) return;
  nodesLayerEl.innerHTML = '';

  const state = getState();

  state.nodes.forEach(node => {
    const isSelected = state.selectedNodeId === node.id;
    const isSimActive = activeSimNodeId === node.id;

    const el = document.createElement('div');
    el.id = `node-${node.id}`;
    el.dataset.id = node.id;
    el.className = `flow-node shape-${node.shape} ${isSelected ? 'selected' : ''} ${isSimActive ? 'sim-active' : ''}`;
    el.style.left = `${node.x}px`;
    el.style.top = `${node.y}px`;
    if (node.color) {
      el.style.borderColor = node.color;
    }

    // Input Port (Top)
    const inputPort = document.createElement('div');
    inputPort.className = 'node-port port-input';
    el.appendChild(inputPort);

    // Header
    const header = document.createElement('div');
    header.className = 'node-header';

    if (node.emoji) {
      const emojiEl = document.createElement('span');
      emojiEl.className = 'node-emoji';
      emojiEl.textContent = node.emoji;
      header.appendChild(emojiEl);
    }

    const titleEl = document.createElement('div');
    titleEl.className = 'node-title';
    titleEl.textContent = node.title || 'Untitled Node';
    header.appendChild(titleEl);

    el.appendChild(header);

    // Subtitle
    if (node.subtitle) {
      const subEl = document.createElement('div');
      subEl.className = 'node-subtitle';
      subEl.textContent = node.subtitle;
      el.appendChild(subEl);
    }

    // Branches / Choices list
    if (node.branches && node.branches.length > 0) {
      const branchesContainer = document.createElement('div');
      branchesContainer.className = 'node-branches';

      node.branches.forEach(branch => {
        const branchTag = document.createElement('div');
        branchTag.className = 'branch-tag';
        branchTag.dataset.branchId = branch.id;
        branchTag.innerHTML = `<span>${branch.label || 'Choice'}</span> 🔵`;
        branchesContainer.appendChild(branchTag);
      });

      el.appendChild(branchesContainer);
    } else {
      // Default Output Port (Bottom)
      const outputPort = document.createElement('div');
      outputPort.className = 'node-port port-output';
      el.appendChild(outputPort);
    }

    // Double-click event to open inspector
    el.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      selectNode(node.id);
      if (onOpenInspectorCallback) {
        onOpenInspectorCallback(node.id);
      }
      playPop();
    });

    nodesLayerEl.appendChild(el);
  });

  renderConnections(activeSimNodeId);
}
