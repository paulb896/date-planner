/* ==========================================================================
   FlowCraft - SVG Bezier Connections & Animated Edge Vehicle Engine
   ========================================================================== */

import { getState, disconnectBranch } from './state.js';
import { playDelete } from './audio.js';

let svgWiresGroup = null;
let dragWirePath = null;

export const EDGE_ANIM_MODES = {
  'smart': { name: '🤖 Smart Vehicles (Auto)', emoji: 'smart', speed: '3.5s' },
  'cars': { name: '🚗 Cars & Uber', emoji: '🚗', speed: '3.5s' },
  'bicycles': { name: '🚴 Bicycles', emoji: '🚴', speed: '4.5s' },
  'buses': { name: '🚌 Buses & Transit', emoji: '🚌', speed: '5s' },
  'boats': { name: '⛴️ Boats & Ferries', emoji: '⛴️', speed: '6s' },
  'pulses': { name: '⚡ Energy Pulses', emoji: '⚡', speed: '2.5s' },
  'rockets': { name: '🚀 Rockets', emoji: '🚀', speed: '2s' },
  'magic': { name: '🦄 Fantasy Magic', emoji: '✨', speed: '3s' },
  'none': { name: '🚫 None (Static)', emoji: '', speed: '0s' }
};

let currentEdgeAnimMode = 'smart';

function detectVehicleInText(text) {
  if (!text) return null;
  const t = text.toLowerCase();
  if (/ferry|boat|ship|cruise|sail|water|sea|lake|island|ocean|marina|dock/i.test(t)) {
    return { emoji: '⛴️', speed: '5.5s' };
  }
  if (/bus|shuttle|transit|tram|trolley|coach/i.test(t)) {
    return { emoji: '🚌', speed: '4.5s' };
  }
  if (/bike|bicycle|cycling|pedal|scooter/i.test(t)) {
    return { emoji: '🚴', speed: '4s' };
  }
  if (/uber|lyft|taxi|cab|car|drive|road|highway|auto/i.test(t)) {
    return { emoji: '🚗', speed: '3.5s' };
  }
  if (/walk|foot|hike|stroll|pedestrian/i.test(t)) {
    return { emoji: '🚶', speed: '6s' };
  }
  if (/flight|fly|plane|airplane|airport/i.test(t)) {
    return { emoji: '✈️', speed: '2.5s' };
  }
  if (/train|subway|metro|rail|railway/i.test(t)) {
    return { emoji: '🚆', speed: '3.5s' };
  }
  if (/rocket|space|launch|galaxy/i.test(t)) {
    return { emoji: '🚀', speed: '2s' };
  }
  return null;
}

export function getSmartVehicleEmoji(branch, sourceNode, targetNode) {
  // Priority 1: Branch choice label
  const branchVehicle = detectVehicleInText(branch?.label);
  if (branchVehicle) return branchVehicle;

  // Priority 2: FIRST (source) node title + subtitle
  const sourceText = `${sourceNode?.title || ''} ${sourceNode?.subtitle || ''}`;
  const sourceVehicle = detectVehicleInText(sourceText);
  if (sourceVehicle) return sourceVehicle;

  // Priority 3: SECOND (target) node title + subtitle (fallback)
  const targetText = `${targetNode?.title || ''} ${targetNode?.subtitle || ''}`;
  const targetVehicle = detectVehicleInText(targetText);
  if (targetVehicle) return targetVehicle;

  return { emoji: '🚗', speed: '3.5s' };
}

export function setEdgeAnimMode(mode) {
  if (EDGE_ANIM_MODES[mode]) {
    currentEdgeAnimMode = mode;
    renderConnections();
  }
}

export function getEdgeAnimMode() {
  return currentEdgeAnimMode;
}

export function initConnections() {
  svgWiresGroup = document.getElementById('svg-wires-group');
  dragWirePath = document.getElementById('drag-wire-path');
}

export function updateDragWire(x1, y1, x2, y2) {
  if (!dragWirePath) return;
  const dy = Math.abs(y2 - y1);
  const controlOffset = Math.max(60, dy * 0.5);
  const d = `M ${x1} ${y1} C ${x1} ${y1 + controlOffset}, ${x2} ${y2 - controlOffset}, ${x2} ${y2}`;
  dragWirePath.setAttribute('d', d);
  dragWirePath.classList.remove('hidden');
}

export function hideDragWire() {
  if (dragWirePath) {
    dragWirePath.classList.add('hidden');
  }
}

export function renderConnections(activeSimNodeId = null) {
  if (!svgWiresGroup) return;
  svgWiresGroup.innerHTML = '';

  const state = getState();
  const nodeMap = new Map(state.nodes.map(n => [n.id, n]));

  state.nodes.forEach(sourceNode => {
    const sourceEl = document.getElementById(`node-${sourceNode.id}`);
    if (!sourceEl) return;

    sourceNode.branches.forEach((branch, idx) => {
      if (!branch.targetNodeId) return;

      const targetNode = nodeMap.get(branch.targetNodeId);
      if (!targetNode) return;

      const targetEl = document.getElementById(`node-${targetNode.id}`);
      if (!targetEl) return;

      // Find port coordinates relative to canvas-world
      const branchPortEl = sourceEl.querySelector(`[data-branch-id="${branch.id}"]`) || sourceEl.querySelector('.port-output');
      const targetPortEl = targetEl.querySelector('.port-input');

      let x1 = sourceNode.x + sourceEl.offsetWidth / 2;
      let y1 = sourceNode.y + sourceEl.offsetHeight;

      if (branchPortEl) {
        const rect = branchPortEl.getBoundingClientRect();
        const worldEl = document.getElementById('canvas-world');
        const worldRect = worldEl.getBoundingClientRect();
        const zoom = parseFloat(worldEl.dataset.scale || '1');
        
        x1 = (rect.left + rect.width / 2 - worldRect.left) / zoom;
        y1 = (rect.top + rect.height / 2 - worldRect.top) / zoom;
      }

      let x2 = targetNode.x + targetEl.offsetWidth / 2;
      let y2 = targetNode.y;

      if (targetPortEl) {
        const rect = targetPortEl.getBoundingClientRect();
        const worldEl = document.getElementById('canvas-world');
        const worldRect = worldEl.getBoundingClientRect();
        const zoom = parseFloat(worldEl.dataset.scale || '1');
        
        x2 = (rect.left + rect.width / 2 - worldRect.left) / zoom;
        y2 = (rect.top + rect.height / 2 - worldRect.top) / zoom;
      }

      const dy = Math.abs(y2 - y1);
      const controlOffset = Math.max(60, dy * 0.5);
      const d = `M ${x1} ${y1} C ${x1} ${y1 + controlOffset}, ${x2} ${y2 - controlOffset}, ${x2} ${y2}`;

      // Check if active in simulator mode
      const isActive = activeSimNodeId === sourceNode.id || activeSimNodeId === targetNode.id;

      // Unique Path ID for mpath reference
      const pathId = `wire-path-${sourceNode.id}-${branch.id}`;

      // Create Wire Group
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'wire-group');

      // Wire Path
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('id', pathId);
      path.setAttribute('d', d);
      path.setAttribute('class', `wire-path ${isActive ? 'active' : ''}`);
      path.setAttribute('marker-end', isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)');

      // Double-click wire to delete connection
      path.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        disconnectBranch(sourceNode.id, branch.id);
        playDelete();
      });

      g.appendChild(path);

      // Render Animated Vehicle / Emoji along the wire path
      if (currentEdgeAnimMode && currentEdgeAnimMode !== 'none' && EDGE_ANIM_MODES[currentEdgeAnimMode]) {
        let vehicleInfo;
        if (currentEdgeAnimMode === 'smart') {
          vehicleInfo = getSmartVehicleEmoji(branch, sourceNode, targetNode);
        } else {
          const modeInfo = EDGE_ANIM_MODES[currentEdgeAnimMode];
          vehicleInfo = { emoji: modeInfo.emoji, speed: modeInfo.speed };
        }

        if (vehicleInfo && vehicleInfo.emoji) {
          const vehicleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          vehicleGroup.setAttribute('class', 'wire-vehicle-group');

          const vehicleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          vehicleText.setAttribute('font-size', '20');
          vehicleText.setAttribute('text-anchor', 'middle');
          vehicleText.setAttribute('dominant-baseline', 'central');
          vehicleText.setAttribute('dy', '-8'); // Offset text so wheels/bottom sit directly on the path wire line
          vehicleText.setAttribute('transform', 'scale(-1, -1)'); // Flips X (forward direction) and Y (wheels on line, not top/roof)
          vehicleText.textContent = vehicleInfo.emoji;

          const animMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
          animMotion.setAttribute('dur', vehicleInfo.speed || '3.5s');
          animMotion.setAttribute('repeatCount', 'indefinite');
          animMotion.setAttribute('rotate', 'auto'); // rotate="auto" rotates vehicle along curve slope line

          const mpath = document.createElementNS('http://www.w3.org/2000/svg', 'mpath');
          mpath.setAttribute('href', `#${pathId}`);

          animMotion.appendChild(mpath);
          vehicleGroup.appendChild(vehicleText);
          vehicleGroup.appendChild(animMotion);
          g.appendChild(vehicleGroup);
        }
      }

      // Render Wire Label along cubic bezier curve at t = 0.55 so it never overlaps the port button
      if (branch.label && dy > 50) {
        const t = 0.55;
        const mt = 1 - t;
        const p0x = x1, p0y = y1;
        const p1x = x1, p1y = y1 + controlOffset;
        const p2x = x2, p2y = y2 - controlOffset;
        const p3x = x2, p3y = y2;

        const labelX = mt*mt*mt*p0x + 3*mt*mt*t*p1x + 3*mt*t*t*p2x + t*t*t*p3x;
        const labelY = mt*mt*mt*p0y + 3*mt*mt*t*p1y + 3*mt*t*t*p2y + t*t*t*p3y;

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelX);
        text.setAttribute('y', labelY + 4);
        text.setAttribute('class', 'wire-label');
        text.setAttribute('text-anchor', 'middle');
        text.textContent = branch.label;

        text.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          disconnectBranch(sourceNode.id, branch.id);
          playDelete();
        });

        g.appendChild(text);
      }

      svgWiresGroup.appendChild(g);
    });
  });
}
