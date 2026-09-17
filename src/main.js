/* ==========================================================================
   FlowCraft - Main Application Entry Point & UI Event Listener Wiring
   ========================================================================== */

import {
  getState,
  subscribe,
  loadTemplate,
  loadCustomNodes,
  addNode,
  updateNode,
  deleteNode,
  duplicateNode,
  autoLayout,
  clearCanvas,
  undo,
  redo,
  exportJSON,
  importJSON,
  selectNode
} from './state.js';

import {
  initCanvas,
  renderNodes,
  zoomIn,
  zoomOut,
  resetView,
  zoomToFit,
  setZoom,
  getScale,
  getPan,
  setPan,
  setOnTransformChange
} from './canvas.js';

import { initConnections, setEdgeAnimMode, getEdgeAnimMode } from './connections.js';
import { initSimulator, startSimulation } from './simulator.js';
import { setAudioEnabled, isAudioEnabled, playPop, playSelect, playDelete } from './audio.js';

let activeNodeForInspector = null;
let isSyncingURL = false;

function encodeFlowchart(nodes) {
  try {
    const json = JSON.stringify(nodes);
    return encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
  } catch (e) {
    console.error('URL encode error', e);
    return '';
  }
}

function decodeFlowchart(encodedStr) {
  try {
    const json = decodeURIComponent(escape(atob(decodeURIComponent(encodedStr))));
    return JSON.parse(json);
  } catch (e) {
    console.error('URL decode error', e);
    return null;
  }
}

function syncURLState() {
  if (isSyncingURL) return;
  isSyncingURL = true;
  setTimeout(() => {
    isSyncingURL = false;
  }, 100);

  const url = new URL(window.location.href);
  const state = getState();
  const theme = document.body.className || 'theme-candy';
  const template = state.currentTemplateId || 'bday-trip';
  const anim = getEdgeAnimMode() || 'smart';
  const zoom = Math.round(getScale() * 100);
  const pan = getPan();

  url.searchParams.set('theme', theme);
  url.searchParams.set('template', template);
  url.searchParams.set('anim', anim);
  url.searchParams.set('zoom', zoom.toString());
  url.searchParams.set('x', pan.x.toString());
  url.searchParams.set('y', pan.y.toString());

  // Encode entire flowchart nodes structure into URL for 100% sharing
  if (state.nodes && state.nodes.length > 0) {
    const encoded = encodeFlowchart(state.nodes);
    if (encoded) {
      url.searchParams.set('data', encoded);
    }
  }

  window.history.replaceState({}, '', url.toString());
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Subsystems
  initConnections();
  initCanvas(openInspector);
  initSimulator();

  // Parse URL Parameters
  const urlParams = new URLSearchParams(window.location.search);
  const themeParam = urlParams.get('theme') || 'theme-candy';
  const templateParam = urlParams.get('template') || 'bday-trip';
  const animParam = urlParams.get('anim') || 'smart';
  const zoomParam = urlParams.get('zoom');
  const xParam = urlParams.get('x');
  const yParam = urlParams.get('y');
  const dataParam = urlParams.get('data');

  // Apply Initial Theme (Default Playful Candy)
  document.body.className = themeParam;
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) themeSelect.value = themeParam;

  // Apply Edge Animation Mode
  setEdgeAnimMode(animParam);
  const animSelect = document.getElementById('edge-anim-select');
  if (animSelect) animSelect.value = animParam;

  // Subscribe state changes to canvas re-render first
  subscribe((state) => {
    renderNodes();
    updateInspectorUI(state);
    syncURLState();
  });

  // Load Flowchart from URL Encoded Data or Template
  if (dataParam) {
    const decodedNodes = decodeFlowchart(dataParam);
    if (decodedNodes && Array.isArray(decodedNodes) && decodedNodes.length > 0) {
      loadCustomNodes(decodedNodes, templateParam);
    } else {
      loadTemplate(templateParam);
    }
  } else {
    loadTemplate(templateParam);
  }

  const templateSelect = document.getElementById('template-select');
  if (templateSelect) templateSelect.value = templateParam;
  renderNodes();

  // Apply Initial Pan & Zoom from URL
  if (xParam && yParam) {
    const px = parseInt(xParam, 10);
    const py = parseInt(yParam, 10);
    if (!isNaN(px) && !isNaN(py)) {
      setPan(px, py);
    }
  }

  if (zoomParam) {
    const parsedZoom = parseInt(zoomParam, 10);
    if (!isNaN(parsedZoom)) {
      setZoom(parsedZoom / 100);
    } else if (!xParam) {
      setTimeout(zoomToFit, 50);
    }
  } else if (!xParam) {
    setTimeout(zoomToFit, 50);
  }

  // Subscribe to transform (zoom/pan) changes
  setOnTransformChange((scale, px, py) => {
    syncURLState();
  });

  syncURLState();

  // Wiring Toolbar & Header Events
  setupHeaderEvents();
  setupToolbarEvents();
  setupInspectorEvents();
  setupKeyboardShortcuts();
});

/* ==========================================================================
   Header Event Handlers
   ========================================================================== */
function setupHeaderEvents() {
  const templateSelect = document.getElementById('template-select');
  if (templateSelect) {
    templateSelect.addEventListener('change', (e) => {
      loadTemplate(e.target.value);
      setTimeout(zoomToFit, 50);
      syncURLState();
      playPop();
    });
  }

  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      document.body.className = e.target.value;
      syncURLState();
      playPop();
    });
  }

  const animSelect = document.getElementById('edge-anim-select');
  if (animSelect) {
    animSelect.addEventListener('change', (e) => {
      setEdgeAnimMode(e.target.value);
      syncURLState();
      playPop();
    });
  }

  const audioBtn = document.getElementById('btn-audio-toggle');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const current = isAudioEnabled();
      setAudioEnabled(!current);
      audioBtn.querySelector('.icon').textContent = !current ? '🔊' : '🔇';
      playSelect();
    });
  }

  const shareBtn = document.getElementById('btn-share-link');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      syncURLState();
      const currentURL = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(currentURL).then(() => {
          alert('📋 Shareable Link copied to clipboard!\n\nAnyone opening this link will see your exact theme, edge motion, center point, zoom, and custom flowchart.');
        }).catch(() => {
          prompt('Copy your shareable URL:', currentURL);
        });
      } else {
        prompt('Copy your shareable URL:', currentURL);
      }
      playPop();
    });
  }

  const playBtn = document.getElementById('btn-play-flow');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      startSimulation();
    });
  }
}

/* ==========================================================================
   Toolbar Event Handlers
   ========================================================================== */
function setupToolbarEvents() {
  // Add Node Buttons
  document.getElementById('btn-add-start')?.addEventListener('click', () => {
    addNode('pill', 400, 200);
    playPop();
  });

  document.getElementById('btn-add-decision')?.addEventListener('click', () => {
    addNode('diamond', 400, 300);
    playPop();
  });

  document.getElementById('btn-add-action')?.addEventListener('click', () => {
    addNode('rect', 400, 300);
    playPop();
  });

  document.getElementById('btn-add-note')?.addEventListener('click', () => {
    addNode('note', 400, 300);
    playPop();
  });

  // Auto Layout
  document.getElementById('btn-auto-layout')?.addEventListener('click', () => {
    autoLayout();
    setTimeout(zoomToFit, 50);
    syncURLState();
    playPop();
  });

  // Clear Canvas
  document.getElementById('btn-clear-canvas')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all nodes?')) {
      clearCanvas();
      playDelete();
    }
  });

  // Zoom Controls
  document.getElementById('btn-zoom-fit')?.addEventListener('click', () => {
    zoomToFit();
    syncURLState();
    playSelect();
  });

  document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
    zoomIn();
    syncURLState();
    playSelect();
  });

  document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
    zoomOut();
    syncURLState();
    playSelect();
  });

  document.getElementById('btn-zoom-reset')?.addEventListener('click', () => {
    resetView();
    syncURLState();
    playSelect();
  });

  // Undo / Redo
  document.getElementById('btn-undo')?.addEventListener('click', () => {
    undo();
    syncURLState();
    playSelect();
  });

  document.getElementById('btn-redo')?.addEventListener('click', () => {
    redo();
    syncURLState();
    playSelect();
  });

  // Export JSON
  document.getElementById('btn-export-json')?.addEventListener('click', () => {
    const jsonStr = exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowcraft-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playPop();
  });

  // Import JSON
  const fileInput = document.getElementById('file-import-json');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (importJSON(event.target.result)) {
          setTimeout(zoomToFit, 50);
          syncURLState();
          playPop();
        } else {
          alert('Failed to import JSON file. Format invalid.');
        }
      };
      reader.readAsText(file);
    });
  }

  // Export Image (PNG)
  document.getElementById('btn-export-image')?.addEventListener('click', () => {
    exportToImage();
    playPop();
  });
}

/* ==========================================================================
   Node Inspector Drawer
   ========================================================================== */
function openInspector(nodeId) {
  activeNodeForInspector = nodeId;
  const inspectorEl = document.getElementById('node-inspector');
  if (inspectorEl) {
    inspectorEl.classList.remove('hidden');
  }
}

function closeInspector() {
  activeNodeForInspector = null;
  const inspectorEl = document.getElementById('node-inspector');
  if (inspectorEl) {
    inspectorEl.classList.add('hidden');
  }
  selectNode(null);
}

function setupInspectorEvents() {
  document.getElementById('btn-close-inspector')?.addEventListener('click', closeInspector);

  const titleInput = document.getElementById('inspector-title');
  const subtitleTextarea = document.getElementById('inspector-subtitle');
  const shapeSelect = document.getElementById('inspector-shape');
  const emojiInput = document.getElementById('inspector-emoji');
  const addBranchBtn = document.getElementById('btn-inspector-add-branch');
  const dupBtn = document.getElementById('btn-duplicate-node');
  const delBtn = document.getElementById('btn-delete-node');

  titleInput?.addEventListener('input', (e) => {
    if (activeNodeForInspector) {
      updateNode(activeNodeForInspector, { title: e.target.value });
    }
  });

  subtitleTextarea?.addEventListener('input', (e) => {
    if (activeNodeForInspector) {
      updateNode(activeNodeForInspector, { subtitle: e.target.value });
    }
  });

  shapeSelect?.addEventListener('change', (e) => {
    if (activeNodeForInspector) {
      updateNode(activeNodeForInspector, { shape: e.target.value });
    }
  });

  emojiInput?.addEventListener('input', (e) => {
    if (activeNodeForInspector) {
      updateNode(activeNodeForInspector, { emoji: e.target.value });
    }
  });

  // Color Swatches
  const swatches = document.querySelectorAll('#inspector-color-picker .color-swatch');
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      if (activeNodeForInspector) {
        updateNode(activeNodeForInspector, { color: swatch.dataset.color });
      }
    });
  });

  // Add Choice Branch
  addBranchBtn?.addEventListener('click', () => {
    if (!activeNodeForInspector) return;
    const state = getState();
    const node = state.nodes.find(n => n.id === activeNodeForInspector);
    if (node) {
      const newBranches = [...node.branches, {
        id: 'b-' + Math.random().toString(36).substr(2, 4),
        label: `Choice ${node.branches.length + 1}`,
        targetNodeId: null
      }];
      updateNode(activeNodeForInspector, { branches: newBranches });
    }
  });

  // Duplicate & Delete
  dupBtn?.addEventListener('click', () => {
    if (activeNodeForInspector) {
      duplicateNode(activeNodeForInspector);
      playPop();
    }
  });

  delBtn?.addEventListener('click', () => {
    if (activeNodeForInspector) {
      deleteNode(activeNodeForInspector);
      closeInspector();
      playDelete();
    }
  });
}

function updateInspectorUI(state) {
  if (!activeNodeForInspector) return;
  const node = state.nodes.find(n => n.id === activeNodeForInspector);
  if (!node) {
    closeInspector();
    return;
  }

  const titleInput = document.getElementById('inspector-title');
  const subtitleTextarea = document.getElementById('inspector-subtitle');
  const shapeSelect = document.getElementById('inspector-shape');
  const emojiInput = document.getElementById('inspector-emoji');
  const branchesListEl = document.getElementById('inspector-branches-list');

  if (titleInput && document.activeElement !== titleInput) titleInput.value = node.title || '';
  if (subtitleTextarea && document.activeElement !== subtitleTextarea) subtitleTextarea.value = node.subtitle || '';
  if (shapeSelect) shapeSelect.value = node.shape || 'rect';
  if (emojiInput && document.activeElement !== emojiInput) emojiInput.value = node.emoji || '';

  // Render Outgoing Branches List in Inspector
  if (branchesListEl) {
    branchesListEl.innerHTML = '';
    node.branches.forEach((b, idx) => {
      const row = document.createElement('div');
      row.className = 'branch-item-row';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'form-input';
      input.value = b.label || '';
      input.placeholder = `Choice ${idx + 1}`;
      input.addEventListener('input', (e) => {
        b.label = e.target.value;
        updateNode(node.id, { branches: node.branches });
      });

      const removeBtn = document.createElement('button');
      removeBtn.className = 'icon-btn btn-sm';
      removeBtn.innerHTML = '&times;';
      removeBtn.style.color = '#ef4444';
      removeBtn.addEventListener('click', () => {
        node.branches.splice(idx, 1);
        updateNode(node.id, { branches: node.branches });
      });

      row.appendChild(input);
      row.appendChild(removeBtn);
      branchesListEl.appendChild(row);
    });
  }
}

/* ==========================================================================
   Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Delete)
   ========================================================================== */
function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    // Ignore shortcuts when typing in input/textarea
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
      playSelect();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      redo();
      playSelect();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      const state = getState();
      if (state.selectedNodeId) {
        deleteNode(state.selectedNodeId);
        playDelete();
      }
    }
  });
}

/* ==========================================================================
   PNG Image Export Generator
   ========================================================================== */
function exportToImage() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1920;
  canvas.height = 1080;

  // Background
  const isDark = !document.body.classList.contains('theme-paper');
  ctx.fillStyle = isDark ? '#0d0f18' : '#f8fafc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title Branding
  ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
  ctx.font = 'bold 36px "Outfit", sans-serif';
  ctx.fillText('✨ FlowCraft Interactive Flowchart', 60, 80);

  const state = getState();
  const nodeMap = new Map(state.nodes.map(n => [n.id, n]));

  // Draw Connections
  ctx.lineWidth = 3;
  state.nodes.forEach(sourceNode => {
    sourceNode.branches.forEach(b => {
      if (!b.targetNodeId) return;
      const targetNode = nodeMap.get(b.targetNodeId);
      if (!targetNode) return;

      const x1 = sourceNode.x + 100;
      const y1 = sourceNode.y + 60;
      const x2 = targetNode.x + 100;
      const y2 = targetNode.y;

      ctx.strokeStyle = isDark ? '#3b82f6' : '#2563eb';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(x1, y1 + 60, x2, y2 - 60, x2, y2);
      ctx.stroke();
    });
  });

  // Draw Nodes
  state.nodes.forEach(node => {
    ctx.fillStyle = node.color || (isDark ? '#1a1f38' : '#ffffff');
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 2;

    // Draw Node Box
    ctx.beginPath();
    ctx.roundRect(node.x, node.y, 200, 80, 14);
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
    ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${node.emoji || ''} ${node.title}`, node.x + 16, node.y + 36);

    if (node.subtitle) {
      ctx.fillStyle = isDark ? '#9ca3af' : '#64748b';
      ctx.font = '12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(node.subtitle.substring(0, 25), node.x + 16, node.y + 60);
    }
  });

  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `flowcraft-diagram-${Date.now()}.png`;
  a.click();
}
