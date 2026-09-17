/* ==========================================================================
   FlowCraft - Interactive Decision Simulator & Walkthrough Engine
   ========================================================================== */

import confetti from 'canvas-confetti';
import { getState } from './state.js';
import { renderNodes, setZoom } from './canvas.js';
import { playStep, playSuccess, playPop } from './audio.js';

let overlayEl = null;
let titleEl = null;
let subtitleEl = null;
let emojiEl = null;
let choicesContainerEl = null;
let outcomeBoxEl = null;
let outcomeTextEl = null;
let stepNumberEl = null;
let progressBarEl = null;
let btnBackEl = null;
let btnCloseEl = null;
let btnRestartEl = null;

let isSimulating = false;
let currentSimNodeId = null;
let historyPath = [];

export function initSimulator() {
  overlayEl = document.getElementById('simulator-overlay');
  titleEl = document.getElementById('sim-title');
  subtitleEl = document.getElementById('sim-subtitle');
  emojiEl = document.getElementById('sim-emoji');
  choicesContainerEl = document.getElementById('sim-choices-container');
  outcomeBoxEl = document.getElementById('sim-outcome-box');
  outcomeTextEl = document.getElementById('sim-outcome-text');
  stepNumberEl = document.getElementById('sim-step-number');
  progressBarEl = document.getElementById('sim-progress-bar');
  btnBackEl = document.getElementById('btn-sim-back');
  btnCloseEl = document.getElementById('btn-close-simulator');
  btnRestartEl = document.getElementById('btn-sim-restart');

  if (btnCloseEl) {
    btnCloseEl.addEventListener('click', stopSimulation);
  }

  if (btnBackEl) {
    btnBackEl.addEventListener('click', goBackStep);
  }

  if (btnRestartEl) {
    btnRestartEl.addEventListener('click', () => {
      startSimulation();
      playPop();
    });
  }
}

export function startSimulation() {
  const state = getState();
  if (state.nodes.length === 0) {
    alert('Please add some nodes to play the flowchart!');
    return;
  }

  // Determine root node
  const incoming = new Set();
  state.nodes.forEach(n => {
    n.branches.forEach(b => {
      if (b.targetNodeId) incoming.add(b.targetNodeId);
    });
  });

  const rootNodes = state.nodes.filter(n => !incoming.has(n.id));
  const root = rootNodes.length > 0 ? rootNodes[0] : state.nodes[0];

  isSimulating = true;
  historyPath = [root.id];
  currentSimNodeId = root.id;

  if (overlayEl) {
    overlayEl.classList.remove('hidden');
  }

  renderStep();
  playStep();
}

export function stopSimulation() {
  isSimulating = false;
  currentSimNodeId = null;
  historyPath = [];

  if (overlayEl) {
    overlayEl.classList.add('hidden');
  }

  renderNodes(null);
}

function goBackStep() {
  if (historyPath.length <= 1) return;
  historyPath.pop();
  currentSimNodeId = historyPath[historyPath.length - 1];
  renderStep();
  playStep();
}

function renderStep() {
  const state = getState();
  const node = state.nodes.find(n => n.id === currentSimNodeId);
  if (!node) return;

  // Highlight active node on canvas and center view onto it
  renderNodes(node.id);

  // Update simulator UI modal
  if (stepNumberEl) stepNumberEl.textContent = historyPath.length;
  if (titleEl) titleEl.textContent = node.title || 'Decision Point';
  if (subtitleEl) subtitleEl.textContent = node.subtitle || '';
  if (emojiEl) emojiEl.textContent = node.emoji || '🎯';

  // Update progress bar
  const totalNodes = Math.max(state.nodes.length, 1);
  const progressPercent = Math.min(100, Math.round((historyPath.length / totalNodes) * 100));
  if (progressBarEl) progressBarEl.style.width = `${progressPercent}%`;

  // Back button state
  if (btnBackEl) {
    btnBackEl.disabled = historyPath.length <= 1;
  }

  // Clear choices
  if (choicesContainerEl) choicesContainerEl.innerHTML = '';
  if (outcomeBoxEl) outcomeBoxEl.classList.add('hidden');

  // Filter valid choices
  const validBranches = node.branches.filter(b => b.targetNodeId);

  if (validBranches.length > 0) {
    // Render choice buttons
    validBranches.forEach(branch => {
      const btn = document.createElement('button');
      btn.className = 'sim-choice-btn';
      btn.innerHTML = `<span>${branch.label || 'Continue'}</span> <span>➡️</span>`;

      btn.addEventListener('click', () => {
        historyPath.push(branch.targetNodeId);
        currentSimNodeId = branch.targetNodeId;
        renderStep();
        playStep();
      });

      choicesContainerEl.appendChild(btn);
    });
  } else {
    // End Node / Outcome Reached!
    if (outcomeBoxEl) outcomeBoxEl.classList.remove('hidden');
    if (outcomeTextEl) {
      outcomeTextEl.textContent = `${node.emoji || '🎉'} ${node.title} - ${node.subtitle || 'End of Path!'}`;
    }

    // Launch Confetti Blast & Sound Effect
    playSuccess();
    triggerConfetti();
  }
}

function triggerConfetti() {
  try {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 250);
  } catch (e) {
    console.error('Confetti error', e);
  }
}
