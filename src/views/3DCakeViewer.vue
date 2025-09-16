<template>

      <div class="cake-customizer">
        <!-- Close button -->
        <button @click="$router.back()" class="close-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span>Close</span>
        </button>
        
        <!-- Loading overlay -->
        <div v-if="loading" class="loading-overlay">
          <div class="loading-spinner"></div>
          <p>Loading cake design...</p>
        </div>
        
        <!-- Error message -->
        <div v-if="error && !loading" class="error-message">
          <p>{{ error }}</p>
          <button @click="$router.back()" class="back-button">Go Back</button>
        </div>
        
        <canvas id="cakeCanvas"></canvas>
        <div class="controls-panel" v-if="false">
          <div class="tabs">
            <button class="tab-button active" data-tab="tab-design">Design</button>
            <button class="tab-button" data-tab="tab-layer-editor">Layer Editor</button>
            <button class="tab-button" data-tab="tab-topper">Printed Topper</button>
            <button class="tab-button" data-tab="tab-icing">Icing</button>
            <button class="tab-button" data-tab="tab-toppings">Toppings</button>
            <button class="tab-button" data-tab="tab-greeting">Greeting</button>
          </div>
          <div class="tab-content active" id="tab-design">
            <div class="control-group">
              <button id="addLayerBtn" class="action-button">Add New Layer</button>
              <button id="saveCakeBtn" class="action-button">Save Design</button>
              <input type="file" id="loadCakeInput" accept=".json" style="display: none;">
              <button id="loadCakeBtn" class="action-button"
                onclick="document.getElementById('loadCakeInput').click()">Load Design</button>
              <button id="resetCakeBtn" class="action-button" @click="resetCakeDesign">Reset Design</button>
              <button id="undoBtn" class="action-button" disabled>Undo Last Action</button>
              <button id="addToCartBtn" class="action-button add-to-cart-btn" @click="showAddToCartModal">Add to
                Cart</button>
            </div>
          </div>
          <div class="tab-content" id="tab-layer-editor">
            <div id="layerEditPrompt" class="prompt">Click a cake layer in the 3D view to edit it.</div>
            <div id="selectedLayerControlsContainer"></div>
          </div>
          <div class="tab-content" id="tab-topper">
            <div id="topperEditPrompt" class="prompt">Click a cake layer in the 3D view to edit its topper.</div>
            <div id="selectedTopperControlsContainer"></div>
          </div>
          <div class="tab-content" id="tab-icing">
            <div id="icingEditPrompt" class="prompt">Click a cake layer in the 3D view to edit its icing.</div>
            <div id="selectedIcingControlsContainer"></div>
          </div>
          <div class="tab-content" id="tab-toppings">
            <div id="toppingEditPrompt" class="prompt">Click a cake layer in the 3D view to edit its toppings.</div>
            <div id="selectedToppingsControlsContainer"></div>
          </div>
          <div class="tab-content" id="tab-greeting">
            <div class="greeting-control-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="greetingConfig.enabled" @change="onGreetingChange"> Enable Greeting Text
              </label>
              <div v-if="greetingConfig.enabled" class="sub-controls mt-2">
                <div class="mt-2">
                  <label for="greeting_text">Message:</label>
                  <input type="text" id="greeting_text" v-model="greetingConfig.text" @input="onGreetingChange">
                </div>
                <div class="mt-2">
                  <label for="greeting_color">Text Color:</label>
                  <input type="color" id="greeting_color" v-model="greetingConfig.color" @input="onGreetingChange">
                </div>
                <div class="mt-2">
                  <label for="greeting_size">Text Size ({{ greetingConfig.size.toFixed(2) }}):</label>
                  <input type="range" id="greeting_size" min="0.1" max="0.8" step="0.01"
                    v-model.number="greetingConfig.size" @input="onGreetingChange">
                </div>
                <div class="mt-2">
                  <label for="greeting_layout">Layout:</label>
                  <select id="greeting_layout" v-model="greetingConfig.layout" @change="onGreetingChange">
                    <option value="horizontal-top">Horizontal (On Top, Flat)</option>
                    <option value="circular-top">Circular (On Top, Flat)</option>
                    <option value="vertical-side">Vertical (On Side, Upright)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

</template>

<script setup>
// import {
//   IonPage,
//   IonHeader,
//   IonToolbar,
//   IonTitle,
//   IonContent,
//   IonButtons,
//   IonBackButton
// } from '@ionic/vue';
import { onMounted, onUnmounted, ref, computed, reactive, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { getDatabase, ref as dbRef, get, set } from '../firebase/config';
import { child } from 'firebase/database';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

let scene, camera, renderer, cakeGroup, controls, cakeStand;
let cakeLayers = [];
let layerIdCounter = 0;
let clock = new THREE.Clock();
let needsCakeRender = false;
const loading = ref(false);
const error = ref(null);

// Add history stack for undo functionality
let historyStack = [];
const MAX_HISTORY = 20; // Limit history to prevent memory issues

// Function to save current state to history
const saveToHistory = () => {
  const currentState = {
    cakeLayers: JSON.parse(JSON.stringify(cakeLayers)),
    layerIdCounter: layerIdCounter
  };

  historyStack.push(currentState);

  // Limit history size
  if (historyStack.length > MAX_HISTORY) {
    historyStack.shift();
  }

  // Enable/disable undo button
  const undoButton = document.getElementById('undoBtn');
  if (undoButton) {
    undoButton.disabled = historyStack.length === 0;
  }
};

// Function to undo last action
const undoLastAction = () => {
  if (historyStack.length === 0) return;

  const previousState = historyStack.pop();
  if (previousState) {
    cakeLayers = previousState.cakeLayers;
    layerIdCounter = previousState.layerIdCounter;
    renderCake();
  }

  // Update undo button state
  const undoButton = document.getElementById('undoBtn');
  if (undoButton) {
    undoButton.disabled = historyStack.length === 0;
  }
};

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let selectedLayerId = null;
let originalLayerMaterials = new Map();

const defaultLayerSettings = {
  radius: 1.5,
  height: 0.5,
  color: '#FFB6C1',
  toppings: [],
  flowerPosition: "inner", // Default flower position
  roseColor: "red", // Default rose color
  strawberryPosition: "inner", // Default strawberry position
  candlePosition: "center", // Default candle position
  topper: {
    enabled: false,
    type: 'none',
    text: '',
    fontSize: 1,
    color: '#000000',
    style: 'normal',
    position: 'center',
    size: 1,
    stickHeight: 0.4
  },
  edgeIcing: {
    enabled: false,
    style: 'smooth',
    color: '#FFFFFF',
    thickness: 0.05,
    isAnimating: false,
    animationProgress: 0,
    animationSpeed: 0.5
  },
  surfaceIcing: {
    // New: For icing on the top surface of the layer
    enabled: false,
    color: '#FFFFFF',
    thickness: 0.02, // A small thickness for the surface icing layer
  },
  patternedTopIcing: {
    // New: For styled icing patterns on the top surface
    enabled: false,
    style: 'smooth', // e.g., smooth, curl, shell, rosette
    color: '#FFC0CB', // Default to pink for visibility
    thickness: 0.04,
    position: 'inner', // e.g., inner, mid, outer
    isAnimating: false, // For potential future animations
    animationProgress: 0,
    animationSpeed: 0.5,
  },
  middleBandIcing: {
    enabled: false,
    color: '#FFFFFF',
    thickness: 0.05,
    isAnimating: false,
    animationProgress: 0,
    animationSpeed: 0.5
  },
  bottomIcing: {
    enabled: false,
    style: 'smooth',
    color: '#FFFFFF',
    thickness: 0.05,
    isAnimating: false,
    animationProgress: 0,
    animationSpeed: 0.5
  },
  // Topper positioning options
  strawberryPosition: 'inner', // inner, mid, outer, all
  candlePosition: 'center', // center, edge, random, etc.
  flowerPosition: 'center',
  roseColor: '#FF69B4'
};

// Move sizeOptions above selectedSize
const oneTierSizeOptions = [
  { name: "6″ × 6″", diameter: 6, height: 6, price: 999 },
  { name: "6″ × 7″", diameter: 6, height: 7, price: 1299 },
  { name: "6″ × 8″", diameter: 6, height: 8, price: 1649 },
  { name: "6″ × 9″", diameter: 6, height: 9, price: 1949 },
  { name: "6″ × 10″", diameter: 6, height: 10, price: 2399 },
];

const twoTierSizeOptions = [
  {
    name: "4 x 5 & 6 x 5",
    diameter: [
      { diameter: 4, height: 5 },
      { diameter: 6, height: 5 },
    ],
    price: 2199,
  },
  {
    name: "5 x 5 & 7 x 5",
    diameter: [
      { diameter: 5, height: 5 },
      { diameter: 7, height: 5 },
    ],
    price: 2399,
  },
  {
    name: "6 x 5 & 8 x 5",
    diameter: [
      { diameter: 6, height: 5 },
      { diameter: 8, height: 5 },
    ],
    price: 2599,
  },
];

const threeTierSizeOptions = [
  {
    name: "4 x 5 & 6 x 5 & 8 x 5",
    diameter: [
      { diameter: 4, height: 5 },
      { diameter: 6, height: 5 },
      { diameter: 8, height: 5 },
    ],
    price: 3299,
  },
  {
    name: "5 x 5 & 7 x 5 & 9 x 5",
    diameter: [
      { diameter: 5, height: 5 },
      { diameter: 7, height: 5 },
      { diameter: 9, height: 5 },
    ],
    price: 3599,
  },
];

// Dynamic size options based on selected layers
const sizeOptions = computed(() => {
  switch (selectedLayers.value) {
    case 1:
      return oneTierSizeOptions;
    case 2:
      return twoTierSizeOptions;
    case 3:
      return threeTierSizeOptions;
    default:
      return oneTierSizeOptions;
  }
});

const flavorOptions = [
  {
    name: 'Chocolate',
    description: 'Rich and decadent chocolate flavor',
    color: '#4A2C2A'
  },
  {
    name: 'Ube',
    description: 'Traditional Filipino purple yam flavor',
    color: '#8A2BE2'
  },
  {
    name: 'Vanilla',
    description: 'Classic and versatile vanilla flavor',
    color: '#F5F5DC'
  },
  {
    name: 'Mocha',
    description: 'Perfect blend of coffee and chocolate',
    color: '#6F4E37'
  },
  {
    name: 'Strawberry',
    description: 'Sweet and fruity strawberry flavor',
    color: '#FFB6C1'
  }
];

const showSelectionsModal = ref(true);
const currentStep = ref(1);
const selectedLayers = ref(1);
const selectedSize = ref(null);
const selectedFlavor = ref(null);
const showResetConfirmModal = ref(false);

// Computed property to check if user can proceed to next step
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return selectedLayers.value !== null;
    case 2:
      return selectedSize.value !== null;
    case 3:
      return selectedFlavor.value !== null;
    default:
      return false;
  }
});

// Adjust cake stand to be proportional to the cake
const createCakeStand = (cakeDiameter = 6) => {
  const standGroup = new THREE.Group();
  const baseRadius = (cakeDiameter + 1) / 2; // 1 inch larger than cake
  const baseHeight = 0.5; // Increased base height
  const baseGeometry = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, 32);
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0xCCCCCC,
    roughness: 0.7,
    metalness: 0.3
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = -baseHeight / 2;
  standGroup.add(base);

  const pillarRadius = 0.2;
  const pillarHeight = 2.5; // Increased pillar height
  const pillarGeometry = new THREE.CylinderGeometry(pillarRadius, pillarRadius, pillarHeight, 16);
  const pillarMaterial = new THREE.MeshStandardMaterial({
    color: 0xCCCCCC,
    roughness: 0.7,
    metalness: 0.3
  });
  const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
  pillar.position.y = pillarHeight / 2;
  standGroup.add(pillar);

  const topRadius = (cakeDiameter + 0.5) / 2; // Slightly larger than cake
  const topHeight = 0.05;
  const topGeometry = new THREE.CylinderGeometry(topRadius, topRadius, topHeight, 32);
  const topMaterial = new THREE.MeshStandardMaterial({
    color: 0xCCCCCC,
    roughness: 0.7,
    metalness: 0.3
  });
  const top = new THREE.Mesh(topGeometry, topMaterial);
  top.position.y = pillarHeight + topHeight / 2;
  standGroup.add(top);

  standGroup.userData.totalHeight = baseHeight + pillarHeight + topHeight;
  return standGroup;
};

onMounted(() => {
  loadCakeData();
});

onUnmounted(() => {
  if (renderer) {
    renderer.dispose();
  }
  if (scene) {
    scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
  window.removeEventListener('resize', onWindowResize);
});

const initScene = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f4f8);
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  // Set initial camera position to be in front of the cake
  camera.position.set(0, 5, 12); // Changed from (0, 0, 20) to position the camera higher
  camera.lookAt(0, 5, 0); // Look at the middle of the cake instead of the bottom

  const canvas = document.getElementById('cakeCanvas');
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);

  // Create and position the cake stand (use default 6 if not available)
  cakeStand = createCakeStand(selectedSize.value ? selectedSize.value.diameter : 6);
  cakeStand.position.y = 0;
  scene.add(cakeStand);

  // Add ground grid for reference
  const gridHelper = new THREE.GridHelper(30, 30, 0x888888, 0xcccccc);
  gridHelper.position.y = -0.01;
  scene.add(gridHelper);

  // Setup controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 2;
  controls.maxDistance = 100;
  controls.maxPolarAngle = Math.PI / 2 + 0.1;
  
  // Set a better initial target for the controls
  controls.target.set(0, 5, 0); // Set the target to the middle of the cake
  controls.update();

  // Create the cake group and add it to the scene
  cakeGroup = new THREE.Group();
  scene.add(cakeGroup);
  
  // Verify cakeGroup was created successfully
  if (!cakeGroup) {
    console.error("Failed to create cakeGroup object");
  } else {
    console.log("cakeGroup successfully created and added to scene");
  }

  initTabs();
  
  // Add null checks before adding event listeners
  const addLayerBtn = document.getElementById('addLayerBtn');
  if (addLayerBtn) {
    addLayerBtn.addEventListener('click', addNewLayerAndSelect);
  }
  
  const saveCakeBtn = document.getElementById('saveCakeBtn');
  if (saveCakeBtn) {
    saveCakeBtn.addEventListener('click', saveCakeConfiguration);
  }
  
  const loadCakeInput = document.getElementById('loadCakeInput');
  if (loadCakeInput) {
    loadCakeInput.addEventListener('change', loadCakeConfiguration);
  }
  
  const resetCakeBtn = document.getElementById('resetCakeBtn');
  if (resetCakeBtn) {
    resetCakeBtn.addEventListener('click', resetCakeDesign);
  }
  
  const undoBtn = document.getElementById('undoBtn');
  if (undoBtn) {
    undoBtn.addEventListener('click', undoLastAction);
  }

  window.addEventListener('resize', onWindowResize, false);
  renderer.domElement.addEventListener('click', onCanvasClick, false);

  // Don't add a new layer if we're loading from Firebase or localStorage
  const isViewerMode = route.query.orderId || localStorage.getItem('viewerDesignData');
  if (!isViewerMode) {
    addNewLayerAndSelect();
  }
  
  animate();
};

const initTabs = () => {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      button.classList.add('active');
      const targetTabId = button.getAttribute('data-tab');
      document.getElementById(targetTabId).classList.add('active');

      // Update controls based on selected layer and active tab
      if (selectedLayerId) {
        switch (targetTabId) {
          case 'tab-layer-editor':
            updateControlsForSelectedLayer();
            break;
          case 'tab-topper':
            updateControlsForSelectedTopper();
            break;
          case 'tab-icing':
            updateControlsForSelectedIcing();
            break;
          case 'tab-toppings':
            updateControlsForSelectedToppings();
            break;
        }
      }
    });
  });

  if (tabButtons.length > 0) {
    tabButtons[0].click();
  }
};

const onCanvasClick = (event) => {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(cakeGroup.children.filter(child => child.userData.isCakeLayer));
  if (intersects.length > 0) {
    const clickedLayerObject = intersects[0].object;
    if (clickedLayerObject.userData.layerId) {
      selectLayer(clickedLayerObject.userData.layerId);
      // Get the active tab
      const activeTab = document.querySelector('.tab-button.active');
      if (activeTab) {
        const tabId = activeTab.getAttribute('data-tab');
        switch (tabId) {
          case 'tab-layer-editor':
            updateControlsForSelectedLayer();
            break;
          case 'tab-topper':
            updateControlsForSelectedTopper();
            break;
          case 'tab-icing':
            updateControlsForSelectedIcing();
            break;
          case 'tab-toppings':
            updateControlsForSelectedToppings();
            break;
        }
      }
    }
  } else {
    selectLayer(null);
  }
};

const selectLayer = (layerId) => {
  selectedLayerId = layerId;
  updateControlsForSelectedLayer();
  renderCake();
};

const updateControlsForSelectedLayer = () => {
  const controlsContainer = document.getElementById('selectedLayerControlsContainer');
  const prompt = document.getElementById('layerEditPrompt');
  controlsContainer.innerHTML = '';
  if (selectedLayerId) {
    const layerConfig = cakeLayers.find(l => l.id === selectedLayerId);
    if (layerConfig) {
      if (prompt) prompt.style.display = 'none';
      addLayerControlsUI(layerConfig, controlsContainer);
    } else {
      if (prompt) {
        prompt.textContent = "Error: Layer data not found.";
        prompt.style.display = 'block';
      }
    }
  } else {
    if (prompt) {
      prompt.textContent = "Click a cake layer in the 3D view to edit it.";
      prompt.style.display = 'block';
    }
  }
};

const createLayerMesh = (radius, height, color, layerId) => {
  const geometry = new THREE.CylinderGeometry(radius, radius, height, 64);
  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.7,
    metalness: 0.1
  });
  const layerMesh = new THREE.Mesh(geometry, material);
  layerMesh.userData.isCakeLayer = true;
  layerMesh.userData.layerId = layerId;
  return layerMesh;
};

// Load the font once and reuse it
let loadedFonts = {
  normal: null,
  bold: null
};

const fontLoader = new FontLoader();
fontLoader.load('https://cdn.jsdelivr.net/npm/three@0.164.1/examples/fonts/helvetiker_regular.typeface.json', (font) => {
  loadedFonts.normal = font;
  console.log('Font loaded:', loadedFonts.normal);
  if (typeof renderCake === 'function') {
    console.log('Triggering renderCake after font load');
    renderCake();
  }
});

const addDecorations = (layerMesh, layerConfig) => {
  const {
    radius: layerRadius,
    height: layerHeight,
    toppings,
    topper,
    edgeIcing,
    middleBandIcing,
    bottomIcing
  } = layerConfig;
  const topY = layerHeight / 2;
  const middleY = 0;
  const bottomY = -layerHeight / 2;

  // Remove existing decorations
  const existingEdgeIcing = layerMesh.getObjectByName("edgeIcingGroup");
  if (existingEdgeIcing) {
    existingEdgeIcing.traverse(c => {
      if (c.isMesh) {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      }
    });
    layerMesh.remove(existingEdgeIcing);
  }
  const existingMiddleIcing = layerMesh.getObjectByName("middleBandIcingGroup");
  if (existingMiddleIcing) {
    existingMiddleIcing.traverse(c => {
      if (c.isMesh) {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      }
    });
    layerMesh.remove(existingMiddleIcing);
  }
  const existingToppings = layerMesh.getObjectByName("toppingGroup");
  if (existingToppings) {
    existingToppings.traverse(c => {
      if (c.isMesh || c.isGroup) {
        c.traverse(sc => {
          if (sc.isMesh) {
            if (sc.geometry) sc.geometry.dispose();
            if (sc.material) sc.material.dispose();
          }
        });
      }
    });
    layerMesh.remove(existingToppings);
  }
  const existingTopper = layerMesh.getObjectByName("topperGroup");
  if (existingTopper) {
    existingTopper.traverse(c => {
      if (c.isMesh) {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      }
    });
    layerMesh.remove(existingTopper);
  }

  // Add topper if enabled
  if (topper && topper.enabled) {
    const topperGroup = new THREE.Group();
    topperGroup.name = "topperGroup";

    // --- DYNAMIC STICK LOGIC ---
    // Default values
    let stickHeight = topper.stickHeight || 0.4; // Use custom stick height or default
    if (stickHeight < 0.1) stickHeight = 0.1;
    
    // Check if this is the top layer in the cake to avoid intersections
    const currentLayerIndex = cakeLayers.findIndex(layer => layer.id === layerConfig.id);
    const isTopLayer = currentLayerIndex === cakeLayers.length - 1;
    
    // If it's not the top layer, we need to adjust the stick height to avoid intersections
    if (!isTopLayer) {
      // Calculate maximum safe height to avoid intersection with layer above
      // Get distance to the bottom of the layer above
      const layersAbove = cakeLayers.slice(currentLayerIndex + 1);
      const nextLayerHeight = layersAbove.reduce((total, layer) => total + layer.height, 0);
      
      // Calculate safe distance (leaving a small gap)
      const safeDistance = nextLayerHeight - 0.05;
      
      // Limit stick height to prevent intersection
      if (stickHeight > safeDistance) {
        stickHeight = Math.max(0.1, safeDistance);
      }
    }

    let stickBaseY = topY; // Always start at cake top
    let stickTopY = stickBaseY + stickHeight; // Calculate the top of the stick

    // Calculate content position offsets based on stick height
    let textYOffset = 0.05; // Small offset from stick top
    let imageYOffset = 0.15;
    const imageHeight = 0.5; // Should match the image geometry height

    // Calculate topper base position
    let topperY = topY;
    let topperX = 0;
    let topperZ = 0;

    if (topper.position === 'top') {
      topperY += 0.1; // Slightly above the layer
      stickBaseY = topperY;
      stickTopY = stickBaseY + stickHeight;
    } else if (topper.position === 'bottom') {
      // Fix for bottom position to prevent stick from going through the cake
      topperY = bottomY - 0.1; // Slightly below the layer
      
      // For bottom toppers, adjust positioning to prevent overlap
      if (isTopLayer) {
        // If it's the top layer, we can use the full stick height
        stickBaseY = topperY;
        stickTopY = stickBaseY + stickHeight;
      } else {
        // For lower layers with bottom toppers, we need special handling
        // to prevent the stick from intersecting with layers above
        // Adjust the stick to be contained within the cake's height
        stickHeight = Math.min(stickHeight, layerHeight * 0.8); // Limit stick height to 80% of layer height
        stickBaseY = bottomY + (layerHeight * 0.2); // Start 20% up from bottom
        stickTopY = bottomY - 0.1; // End just below the bottom of the cake
      }
    } else if (topper.position === 'front') {
      topperZ = layerRadius * 0.6; // Move towards front
      stickBaseY = topY;
      stickTopY = stickBaseY + stickHeight;
    } else if (topper.position === 'back') {
      topperZ = -layerRadius * 0.6; // Move towards back
      stickBaseY = topY;
      stickTopY = stickBaseY + stickHeight;
    } else if (topper.position === 'left') {
      topperX = -layerRadius * 0.6; // Move towards left
      stickBaseY = topY;
      stickTopY = stickBaseY + stickHeight;
    } else if (topper.position === 'right') {
      topperX = layerRadius * 0.6; // Move towards right
      stickBaseY = topY;
      stickTopY = stickBaseY + stickHeight;
    } else if (topper.position === 'front-left') {
      topperX = -layerRadius * 0.4; // Move towards front-left
      topperZ = layerRadius * 0.4;
      stickBaseY = topY;
      stickTopY = stickBaseY + stickHeight;
    } else if (topper.position === 'front-right') {
      topperX = layerRadius * 0.4; // Move towards front-right
      topperZ = layerRadius * 0.4;
      stickBaseY = topY;
      stickTopY = stickBaseY + stickHeight;
    } else if (topper.position === 'back-left') {
      topperX = -layerRadius * 0.4; // Move towards back-left
      topperZ = -layerRadius * 0.4;
      stickBaseY = topY;
      stickTopY = stickBaseY + stickHeight;
    } else if (topper.position === 'back-right') {
      topperX = layerRadius * 0.4; // Move towards back-right
      topperZ = -layerRadius * 0.4;
      stickBaseY = topY;
      stickTopY = stickBaseY + stickHeight;
    } else {
      // Default center position
      stickBaseY = topY;
      stickTopY = stickBaseY + stickHeight;
    }

    // Add stick/support for the topper (with better positioning logic)
    const stickGeometry = new THREE.CylinderGeometry(0.02, 0.02, stickHeight, 8);
    const stickMaterial = new THREE.MeshStandardMaterial({
      color: 0xCCCCCC,
      roughness: 0.7,
      metalness: 0.3
    });
    const stick = new THREE.Mesh(stickGeometry, stickMaterial);
    
    if (topper.position === 'bottom') {
      // For bottom position, position stick appropriately
      stick.position.set(topperX, bottomY - stickHeight/2 - 0.1, topperZ);
    } else {
      // For all other positions, use calculated coordinates
      stick.position.set(topperX, stickBaseY + stickHeight / 2, topperZ);
    }
    
    topperGroup.add(stick);

    // Add a small base for the stick
    const baseGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0xCCCCCC,
      roughness: 0.7,
      metalness: 0.3
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    
    if (topper.position === 'bottom') {
      // For bottom position, position base at the bottom
      base.position.set(topperX, bottomY - 0.1, topperZ);
    } else {
      // For all other positions, use calculated coordinates
      base.position.set(topperX, stickBaseY - 0.01, topperZ);
    }
    
    topperGroup.add(base);

    // Only create topper text if font is loaded
    if ((topper.type === 'text' || topper.type === 'text_image')) {
      if (!loadedFonts.normal) {
        console.warn('Font not loaded yet, skipping topper text creation');
        return;
      }
      if (topper.text && topper.text.trim().length > 0) {
        const topperText = topper.text.trim();
        const sizeMultiplier = topper.size || 1;
        const textGeometry = new TextGeometry(topperText, {
          font: loadedFonts.normal,
          size: 0.12 * topper.fontSize * sizeMultiplier,
          height: 0.02 * sizeMultiplier,
          curveSegments: 4,
          bevelEnabled: false
        });
        textGeometry.computeBoundingBox();
        const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
        textGeometry.translate(-textWidth / 2, 0, 0); // Center horizontally
        const textMaterial = new THREE.MeshStandardMaterial({
          color: topper.color,
          roughness: 0.7,
          metalness: 0.1
        });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        
        if (topper.position === 'bottom') {
          // For bottom position, position text below the cake
          textMesh.position.set(topperX, bottomY - stickHeight - textYOffset - 0.1, topperZ);
        } else {
          // For all other positions, use calculated coordinates
          textMesh.position.set(topperX, stickTopY + textYOffset, topperZ);
        }
        
        topperGroup.add(textMesh);
        
        // If it's text with image, add the image below the text
        if (topper.type === 'text_image' && topper.image) {
          const textureLoader = new THREE.TextureLoader();
          textureLoader.load(topper.image, (texture) => {
            const sizeMultiplier = topper.size || 1;
            const imageGeometry = new THREE.PlaneGeometry(0.5 * sizeMultiplier, 0.5 * sizeMultiplier);
            const imageMaterial = new THREE.MeshStandardMaterial({
              map: texture,
              side: THREE.DoubleSide,
              transparent: true
            });
            const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);
            
            if (topper.position === 'bottom') {
              // For bottom position, position image below the text
              imageMesh.position.set(topperX, bottomY - stickHeight - textYOffset - (0.3 * sizeMultiplier) - 0.1, topperZ);
            } else {
              // For all other positions, use calculated coordinates
              imageMesh.position.set(topperX, stickTopY + textYOffset - (0.3 * sizeMultiplier), topperZ);
            }
            
            topperGroup.add(imageMesh);
          });
        }
      }
    } else if (topper.type === 'image' && topper.image) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(topper.image, (texture) => {
        const sizeMultiplier = topper.size || 1;
        const imageGeometry = new THREE.PlaneGeometry(0.5 * sizeMultiplier, 0.5 * sizeMultiplier);
        const imageMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          side: THREE.DoubleSide,
          transparent: true
        });
        const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);
        
        // Calculate half height of the image to position it properly
        const halfImageHeight = 0.5 * sizeMultiplier / 2;
        
        if (topper.position === 'bottom') {
          // For bottom position, position image below the cake
          imageMesh.position.set(topperX, bottomY - stickHeight - imageYOffset - halfImageHeight - 0.1, topperZ);
        } else {
          // For all other positions, use calculated coordinates
          imageMesh.position.set(topperX, stickTopY + imageYOffset + halfImageHeight, topperZ);
        }
        
        topperGroup.add(imageMesh);
      });
    }

    // Add a small connector between stick and content
    const connectorGeometry = new THREE.CylinderGeometry(0.04, 0.03, 0.05, 12);
    const connectorMaterial = new THREE.MeshStandardMaterial({
      color: 0xCCCCCC,
      roughness: 0.7,
      metalness: 0.3
    });
    const connector = new THREE.Mesh(connectorGeometry, connectorMaterial);
    
    if (topper.position === 'bottom') {
      // For bottom position, position connector at the bottom of the stick
      connector.position.set(topperX, bottomY - stickHeight - 0.02 - 0.1, topperZ);
    } else {
      // For all other positions, use calculated coordinates
      connector.position.set(topperX, stickTopY + 0.02, topperZ);
    }
    
    topperGroup.add(connector);

    layerMesh.add(topperGroup);
  }

  // Add existing decorations
  if (edgeIcing.enabled) {
    const icingGroup = new THREE.Group();
    icingGroup.name = "edgeIcingGroup";
    const icingMaterial = new THREE.MeshStandardMaterial({
      color: edgeIcing.color,
      roughness: 0.6,
      metalness: 0.1
    });
    if (edgeIcing.style === 'smooth') {
      let angle = edgeIcing.isAnimating ? edgeIcing.animationProgress * Math.PI * 2 : Math.PI * 2;
      angle = Math.max(0.001, angle);
      const tube = edgeIcing.thickness;
      const radius = layerRadius - tube;
      if (radius > 0) {
        const geo = new THREE.TorusGeometry(radius, tube, 24, 64, angle);
        const mesh = new THREE.Mesh(geo, icingMaterial);
        mesh.position.y = topY;
        mesh.rotation.x = Math.PI / 2;
        icingGroup.add(mesh);
      }
    } else if (edgeIcing.style === 'curl') {
      const curlR = edgeIcing.thickness * 0.8;
      // Calculate number of curls based on circumference with overlap
      const circumference = Math.PI * 2 * (layerRadius - curlR);
      // Increase number of curls to ensure no gaps
      const numTotal = Math.max(1, Math.floor(circumference / (curlR * 1.2)));
      let numShow = edgeIcing.isAnimating ? Math.floor(edgeIcing.animationProgress * numTotal) : numTotal;

      // Create a group for all curls
      const curlGroup = new THREE.Group();

      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;

        // Add variation to curl size (smaller range to maintain consistency)
        const sizeVariation = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
        const curlSize = curlR * sizeVariation;

        // Create the main curl
        const curlGeo = new THREE.SphereGeometry(curlSize, 12, 8);
        const curl = new THREE.Mesh(curlGeo, icingMaterial);

        // Position with minimal randomness to maintain continuity
        const radiusVariation = (Math.random() - 0.5) * 0.05; // -0.025 to 0.025
        const heightVariation = (Math.random() - 0.5) * 0.05; // -0.025 to 0.025
        const angleVariation = (Math.random() - 0.5) * 0.1; // -0.05 to 0.05

        // Calculate position with minimal variations
        const curlRadius = layerRadius - curlSize * 0.7 + radiusVariation;
        const curlX = Math.cos(ang + angleVariation) * curlRadius;
        const curlZ = Math.sin(ang + angleVariation) * curlRadius;
        const curlY = topY + curlSize * 0.3 + heightVariation;

        curl.position.set(curlX, curlY, curlZ);

        // Add minimal tilt to maintain continuity
        curl.rotation.x = (Math.random() - 0.5) * 0.2;
        curl.rotation.z = (Math.random() - 0.5) * 0.2;

        // Add a connecting "tail" to make it look more continuous
        const tailGeo = new THREE.ConeGeometry(curlSize * 0.6, curlSize * 1.2, 8);
        const tail = new THREE.Mesh(tailGeo, icingMaterial);
        tail.position.y = -curlSize * 0.6;
        tail.rotation.x = Math.PI / 2;
        curl.add(tail);

        curlGroup.add(curl);
      }

      icingGroup.add(curlGroup);
    } else if (edgeIcing.style === 'shell') {
      const shellR = edgeIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - shellR);
      const numTotal = Math.max(1, Math.floor(circumference / (shellR * 1.2)));
      let numShow = edgeIcing.isAnimating ? Math.floor(edgeIcing.animationProgress * numTotal) : numTotal;

      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;

        // Create shell shape using multiple spheres
        const shellGroup = new THREE.Group();

        // Main shell body
        const mainShell = new THREE.Mesh(
          new THREE.SphereGeometry(shellR, 12, 8),
          icingMaterial
        );

        // Shell tail
        const tail = new THREE.Mesh(
          new THREE.ConeGeometry(shellR * 0.6, shellR * 1.5, 8),
          icingMaterial
        );
        tail.position.y = -shellR * 0.75;
        tail.rotation.x = Math.PI / 2;

        shellGroup.add(mainShell);
        shellGroup.add(tail);

        // Position and rotate
        const shellRadius = layerRadius - shellR * 0.7;
        shellGroup.position.set(
          Math.cos(ang) * shellRadius,
          topY + shellR * 0.3,
          Math.sin(ang) * shellRadius
        );
        shellGroup.rotation.y = -ang;

        icingGroup.add(shellGroup);
      }
    } else if (edgeIcing.style === 'rosette') {
      const rosetteR = edgeIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - rosetteR);
      const numTotal = Math.max(1, Math.floor(circumference / (rosetteR * 2)));
      let numShow = edgeIcing.isAnimating ? Math.floor(edgeIcing.animationProgress * numTotal) : numTotal;

      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;

        // Create rosette using multiple petals
        const rosetteGroup = new THREE.Group();
        const numPetals = 5;

        for (let j = 0; j < numPetals; j++) {
          const petalAng = (j / numPetals) * Math.PI * 2;
          const petal = new THREE.Mesh(
            new THREE.SphereGeometry(rosetteR * 0.6, 8, 8),
            icingMaterial
          );

          petal.position.set(
            Math.cos(petalAng) * rosetteR * 0.5,
            Math.sin(petalAng) * rosetteR * 0.5,
            0
          );
          rosetteGroup.add(petal);
        }

        // Center of rosette
        const center = new THREE.Mesh(
          new THREE.SphereGeometry(rosetteR * 0.4, 8, 8),
          icingMaterial
        );
        rosetteGroup.add(center);

        // Position and rotate
        const rosetteRadius = layerRadius - rosetteR;
        rosetteGroup.position.set(
          Math.cos(ang) * rosetteRadius,
          topY + rosetteR * 0.5,
          Math.sin(ang) * rosetteRadius
        );
        rosetteGroup.rotation.y = -ang;

        icingGroup.add(rosetteGroup);
      }
    } else if (edgeIcing.style === 'ruffle') {
      const ruffleR = edgeIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - ruffleR);
      const numTotal = Math.max(1, Math.floor(circumference / (ruffleR * 1.5)));
      let numShow = edgeIcing.isAnimating ? Math.floor(edgeIcing.animationProgress * numTotal) : numTotal;

      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;

        // Create ruffle segment
        const ruffleGroup = new THREE.Group();

        // Main ruffle part
        const ruffle = new THREE.Mesh(
          new THREE.SphereGeometry(ruffleR, 12, 8),
          icingMaterial
        );

        // Ruffle wave
        const wave = new THREE.Mesh(
          new THREE.TorusGeometry(ruffleR * 0.8, ruffleR * 0.3, 8, 16, Math.PI),
          icingMaterial
        );
        wave.rotation.x = Math.PI / 2;
        wave.position.y = -ruffleR * 0.5;

        ruffleGroup.add(ruffle);
        ruffleGroup.add(wave);

        // Position and rotate
        const ruffleRadius = layerRadius - ruffleR * 0.7;
        ruffleGroup.position.set(
          Math.cos(ang) * ruffleRadius,
          topY + ruffleR * 0.3,
          Math.sin(ang) * ruffleRadius
        );
        ruffleGroup.rotation.y = -ang;

        icingGroup.add(ruffleGroup);
      }
    } else if (edgeIcing.style === 'zigzag') {
      const zigzagR = edgeIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - zigzagR);
      const numTotal = Math.max(1, Math.floor(circumference / (zigzagR * 1.5)));
      let numShow = edgeIcing.isAnimating ? Math.floor(edgeIcing.animationProgress * numTotal) : numTotal;

      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;

        // Create zigzag segment
        const zigzagGroup = new THREE.Group();

        // Main point
        const point = new THREE.Mesh(
          new THREE.ConeGeometry(zigzagR * 0.8, zigzagR * 1.5, 4),
          icingMaterial
        );
        point.rotation.x = Math.PI / 2;

        // Base
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(zigzagR * 0.6, zigzagR * 0.6, zigzagR * 0.3, 4),
          icingMaterial
        );
        base.position.y = -zigzagR * 0.9;

        zigzagGroup.add(point);
        zigzagGroup.add(base);

        // Position and rotate
        const zigzagRadius = layerRadius - zigzagR * 0.7;
        zigzagGroup.position.set(
          Math.cos(ang) * zigzagRadius,
          topY + zigzagR * 0.3,
          Math.sin(ang) * zigzagRadius
        );
        zigzagGroup.rotation.y = -ang;

        icingGroup.add(zigzagGroup);
      }
    }
    if (icingGroup.children.length > 0) layerMesh.add(icingGroup);
  }

  if (middleBandIcing.enabled) {
    const middleIcingGroup = new THREE.Group();
    middleIcingGroup.name = "middleBandIcingGroup";
    const middleIcingMaterial = new THREE.MeshStandardMaterial({
      color: middleBandIcing.color,
      roughness: 0.6,
      metalness: 0.1
    });
    let currentMiddleAngle = Math.PI * 2;
    if (middleBandIcing.isAnimating) {
      currentMiddleAngle = middleBandIcing.animationProgress * Math.PI * 2;
    }
    currentMiddleAngle = Math.max(0.001, currentMiddleAngle);
    const tube = middleBandIcing.thickness;
    const radius = layerRadius;
    if (radius > 0) {
      const middleGeo = new THREE.TorusGeometry(layerRadius - tube, tube, 24, 64, currentMiddleAngle);
      const middleMesh = new THREE.Mesh(middleGeo, middleIcingMaterial);
      middleMesh.position.y = middleY;
      middleMesh.rotation.x = Math.PI / 2;
      middleIcingGroup.add(middleMesh);
    }
    if (middleIcingGroup.children.length > 0) layerMesh.add(middleIcingGroup);
  }

  if (bottomIcing.enabled) {
    const bottomIcingGroup = new THREE.Group();
    bottomIcingGroup.name = "bottomIcingGroup";
    const bottomIcingMaterial = new THREE.MeshStandardMaterial({
      color: bottomIcing.color,
      roughness: 0.6,
      metalness: 0.1
    });
    if (bottomIcing.style === 'smooth') {
      let angle = bottomIcing.isAnimating ? bottomIcing.animationProgress * Math.PI * 2 : Math.PI * 2;
      angle = Math.max(0.001, angle);
      const tube = bottomIcing.thickness;
      const radius = layerRadius - tube;
      if (radius > 0) {
        const geo = new THREE.TorusGeometry(radius, tube, 24, 64, angle);
        const mesh = new THREE.Mesh(geo, bottomIcingMaterial);
        mesh.position.y = bottomY;
        mesh.rotation.x = Math.PI / 2;
        bottomIcingGroup.add(mesh);
      }
    } else if (bottomIcing.style === 'curl') {
      const curlR = bottomIcing.thickness * 0.8;
      const numTotal = Math.max(1, Math.floor((Math.PI * 2 * (layerRadius - curlR)) / (curlR * 2.5)));
      let numShow = bottomIcing.isAnimating ? Math.floor(bottomIcing.animationProgress * numTotal) : numTotal;
      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;
        const geo = new THREE.SphereGeometry(curlR, 12, 8);
        const mesh = new THREE.Mesh(geo, bottomIcingMaterial);
        mesh.position.set(Math.cos(ang) * (layerRadius - curlR * 0.7), bottomY - curlR * 0.3, Math.sin(ang) * (layerRadius - curlR * 0.7));
        bottomIcingGroup.add(mesh);
      }
    } else if (bottomIcing.style === 'shell') {
      const shellR = bottomIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - shellR);
      const numTotal = Math.max(1, Math.floor(circumference / (shellR * 1.2)));
      let numShow = bottomIcing.isAnimating ? Math.floor(bottomIcing.animationProgress * numTotal) : numTotal;
      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;
        const shellGroup = new THREE.Group();
        const mainShell = new THREE.Mesh(
          new THREE.SphereGeometry(shellR, 12, 8),
          bottomIcingMaterial
        );
        const tail = new THREE.Mesh(
          new THREE.ConeGeometry(shellR * 0.6, shellR * 1.5, 8),
          bottomIcingMaterial
        );
        tail.position.y = -shellR * 0.75;
        tail.rotation.x = Math.PI / 2;
        shellGroup.add(mainShell);
        shellGroup.add(tail);
        const shellRadius = layerRadius - shellR * 0.7;
        shellGroup.position.set(
          Math.cos(ang) * shellRadius,
          bottomY - shellR * 0.3,
          Math.sin(ang) * shellRadius
        );
        shellGroup.rotation.y = -ang;
        bottomIcingGroup.add(shellGroup);
      }
    } else if (bottomIcing.style === 'rosette') {
      const rosetteR = bottomIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - rosetteR);
      const numTotal = Math.max(1, Math.floor(circumference / (rosetteR * 2)));
      let numShow = bottomIcing.isAnimating ? Math.floor(bottomIcing.animationProgress * numTotal) : numTotal;
      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;
        const rosetteGroup = new THREE.Group();
        const numPetals = 5;
        for (let j = 0; j < numPetals; j++) {
          const petalAng = (j / numPetals) * Math.PI * 2;
          const petal = new THREE.Mesh(
            new THREE.SphereGeometry(rosetteR * 0.6, 8, 8),
            bottomIcingMaterial
          );
          petal.position.set(
            Math.cos(petalAng) * rosetteR * 0.5,
            Math.sin(petalAng) * rosetteR * 0.5,
            0
          );
          rosetteGroup.add(petal);
        }
        const center = new THREE.Mesh(
          new THREE.SphereGeometry(rosetteR * 0.4, 8, 8),
          bottomIcingMaterial
        );
        rosetteGroup.add(center);
        const rosetteRadius = layerRadius - rosetteR;
        rosetteGroup.position.set(
          Math.cos(ang) * rosetteRadius,
          bottomY - rosetteR * 0.5,
          Math.sin(ang) * rosetteRadius
        );
        rosetteGroup.rotation.y = -ang;
        bottomIcingGroup.add(rosetteGroup);
      }
    } else if (bottomIcing.style === 'ruffle') {
      const ruffleR = bottomIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - ruffleR);
      const numTotal = Math.max(1, Math.floor(circumference / (ruffleR * 1.5)));
      let numShow = bottomIcing.isAnimating ? Math.floor(bottomIcing.animationProgress * numTotal) : numTotal;
      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;
        const ruffleGroup = new THREE.Group();
        const ruffle = new THREE.Mesh(
          new THREE.SphereGeometry(ruffleR, 12, 8),
          bottomIcingMaterial
        );
        const wave = new THREE.Mesh(
          new THREE.TorusGeometry(ruffleR * 0.8, ruffleR * 0.3, 8, 16, Math.PI),
          bottomIcingMaterial
        );
        wave.rotation.x = Math.PI / 2;
        wave.position.y = -ruffleR * 0.5;
        ruffleGroup.add(ruffle);
        ruffleGroup.add(wave);
        const ruffleRadius = layerRadius - ruffleR * 0.7;
        ruffleGroup.position.set(
          Math.cos(ang) * ruffleRadius,
          bottomY - ruffleR * 0.3,
          Math.sin(ang) * ruffleRadius
        );
        ruffleGroup.rotation.y = -ang;
        bottomIcingGroup.add(ruffleGroup);
      }
    } else if (bottomIcing.style === 'zigzag') {
      const zigzagR = bottomIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - zigzagR);
      const numTotal = Math.max(1, Math.floor(circumference / (zigzagR * 1.5)));
      let numShow = bottomIcing.isAnimating ? Math.floor(bottomIcing.animationProgress * numTotal) : numTotal;
      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;
        const zigzagGroup = new THREE.Group();
        const point = new THREE.Mesh(
          new THREE.ConeGeometry(zigzagR * 0.8, zigzagR * 1.5, 4),
          bottomIcingMaterial
        );
        point.rotation.x = Math.PI / 2;
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(zigzagR * 0.6, zigzagR * 0.6, zigzagR * 0.3, 4),
          bottomIcingMaterial
        );
        base.position.y = -zigzagR * 0.9;
        zigzagGroup.add(point);
        zigzagGroup.add(base);
        const zigzagRadius = layerRadius - zigzagR * 0.7;
        zigzagGroup.position.set(
          Math.cos(ang) * zigzagRadius,
          bottomY - zigzagR * 0.3,
          Math.sin(ang) * zigzagRadius
        );
        zigzagGroup.rotation.y = -ang;
        bottomIcingGroup.add(zigzagGroup);
      }
    }
    if (bottomIcingGroup.children.length > 0) layerMesh.add(bottomIcingGroup);
  }

  // Add Surface Icing (on top of the layer)
  if (layerConfig.surfaceIcing && layerConfig.surfaceIcing.enabled) {
    console.log('Rendering Surface Icing for layer:', layerConfig.id, layerConfig.surfaceIcing);
    const surfaceIcing = layerConfig.surfaceIcing;
    const surfaceIcingMaterial = new THREE.MeshStandardMaterial({
      color: surfaceIcing.color || "#FFFFFF",
      roughness: 0.8, // Slightly rough to look like icing
      metalness: 0.1,
    });
    // Create a thin cylinder for the surface icing
    // Radius should be slightly smaller than layerRadius to avoid z-fighting if edge icing is also present
    const surfaceIcingRadiusOffset =
      edgeIcing && edgeIcing.enabled && edgeIcing.thickness > 0.01 ? 0.005 : 0;
    const surfaceIcingRadius = Math.max(0.01, layerRadius - surfaceIcingRadiusOffset);

    const surfaceIcingThickness = surfaceIcing.thickness || 0.02;
    const surfaceIcingGeometry = new THREE.CylinderGeometry(
      surfaceIcingRadius,
      surfaceIcingRadius,
      surfaceIcingThickness,
      64 // Smooth enough for a surface
    );
    const surfaceIcingMesh = new THREE.Mesh(surfaceIcingGeometry, surfaceIcingMaterial);
    // Position it on top of the current layer, ensuring it sits just above the main layer mesh
    surfaceIcingMesh.position.y = topY + surfaceIcingThickness / 2;
    surfaceIcingMesh.name = "surfaceIcingMesh";
    layerMesh.add(surfaceIcingMesh);
  }

  // Add Patterned Top Icing (on top of the layer)
  if (layerConfig.patternedTopIcing && layerConfig.patternedTopIcing.enabled) {
    console.log('Rendering Patterned Top Icing for layer:', layerConfig.id, layerConfig.patternedTopIcing);
    const patternedTopIcing = layerConfig.patternedTopIcing;
    const patternedTopIcingGroup = new THREE.Group();
    patternedTopIcingGroup.name = "patternedTopIcingGroup";
    const icingMaterial = new THREE.MeshStandardMaterial({
      color: patternedTopIcing.color || "#FFC0CB",
      roughness: 0.6,
      metalness: 0.1,
    });

    const style = patternedTopIcing.style || "smooth";
    const thickness = patternedTopIcing.thickness || 0.04;
    const position = patternedTopIcing.position || "inner";

    let baseRadius;
    const offsetFromEdge = 0.1; // To prevent direct overlap with edge icing or cake edge

    if (position === "inner") {
      baseRadius = layerRadius * 0.3;
    } else if (position === "mid") {
      baseRadius = layerRadius * 0.6;
    } else {
      // outer or default
      baseRadius = Math.max(0.05, layerRadius * 0.9 - offsetFromEdge); // Ensure a minimum radius
    }
    baseRadius = Math.max(0.05, baseRadius - thickness); // Adjust for icing thickness itself, ensure min radius

    const icingYPosition = topY + thickness * 0.5; // Position on top surface

    // Adapted from edgeIcing logic
    if (style === "smooth") {
      if (baseRadius > 0 && thickness > 0) {
        const geo = new THREE.TorusGeometry(baseRadius, thickness, 24, 64);
        const mesh = new THREE.Mesh(geo, icingMaterial);
        mesh.position.y = icingYPosition;
        mesh.rotation.x = Math.PI / 2;
        patternedTopIcingGroup.add(mesh);
      }
    } else if (style === "curl") {
      const curlR = thickness * 0.8;
      if (baseRadius > curlR) {
        const circumference = Math.PI * 2 * baseRadius;
        const numTotal = Math.max(1, Math.floor(circumference / (curlR * 1.5)));
        for (let i = 0; i < numTotal; i++) {
          const ang = (i / numTotal) * Math.PI * 2;
          const sizeVariation = 0.9 + Math.random() * 0.2;
          const curlSize = curlR * sizeVariation;
          const curlGeo = new THREE.SphereGeometry(curlSize, 10, 6);
          const curl = new THREE.Mesh(curlGeo, icingMaterial);
          const curlX = Math.cos(ang) * baseRadius;
          const curlZ = Math.sin(ang) * baseRadius;
          curl.position.set(curlX, icingYPosition, curlZ);
          const tailGeo = new THREE.ConeGeometry(curlSize * 0.6, curlSize * 1.2, 6);
          const tail = new THREE.Mesh(tailGeo, icingMaterial);
          tail.position.y = -curlSize * 0.6;
          tail.rotation.x = Math.PI / 2;
          curl.add(tail);
          patternedTopIcingGroup.add(curl);
        }
      }
    } else if (style === "shell") {
      const shellR = thickness * 0.8;
      if (baseRadius > shellR) {
        const circumference = Math.PI * 2 * baseRadius;
        const numTotal = Math.max(1, Math.floor(circumference / (shellR * 1.5)));
        for (let i = 0; i < numTotal; i++) {
          const ang = (i / numTotal) * Math.PI * 2;
          const shellGroup = new THREE.Group();
          const mainShell = new THREE.Mesh(
            new THREE.SphereGeometry(shellR, 10, 6),
            icingMaterial
          );
          const tail = new THREE.Mesh(
            new THREE.ConeGeometry(shellR * 0.6, shellR * 1.5, 6),
            icingMaterial
          );
          tail.position.y = -shellR * 0.75;
          tail.rotation.x = Math.PI / 2;
          shellGroup.add(mainShell);
          shellGroup.add(tail);
          shellGroup.position.set(
            Math.cos(ang) * baseRadius,
            icingYPosition,
            Math.sin(ang) * baseRadius
          );
          shellGroup.rotation.y = -ang + Math.PI / 2;
          patternedTopIcingGroup.add(shellGroup);
        }
      }
    } else if (style === "rosette") {
      const rosetteR = thickness * 0.9;
      if (baseRadius > rosetteR) {
        const circumference = Math.PI * 2 * baseRadius;
        const numTotal = Math.max(1, Math.floor(circumference / (rosetteR * 2.2)));
        for (let i = 0; i < numTotal; i++) {
          const ang = (i / numTotal) * Math.PI * 2;
          const rosetteGroup = new THREE.Group();
          const numPetals = 5;
          for (let j = 0; j < numPetals; j++) {
            const petalAng = (j / numPetals) * Math.PI * 2;
            const petal = new THREE.Mesh(
              new THREE.SphereGeometry(rosetteR * 0.6, 8, 6),
              icingMaterial
            );
            petal.position.set(
              Math.cos(petalAng) * rosetteR * 0.5,
              Math.sin(petalAng) * rosetteR * 0.5,
              0
            );
            rosetteGroup.add(petal);
          }
          const center = new THREE.Mesh(
            new THREE.SphereGeometry(rosetteR * 0.4, 8, 6),
            icingMaterial
          );
          rosetteGroup.add(center);
          rosetteGroup.position.set(
            Math.cos(ang) * baseRadius,
            icingYPosition,
            Math.sin(ang) * baseRadius
          );
          rosetteGroup.rotation.x = Math.PI / 2;
          rosetteGroup.rotation.y = -ang;
          patternedTopIcingGroup.add(rosetteGroup);
        }
      }
    } else if (style === "ruffle") {
      const ruffleR = thickness * 0.8;
      if (baseRadius > ruffleR) {
        const circumference = Math.PI * 2 * baseRadius;
        const numTotal = Math.max(1, Math.floor(circumference / (ruffleR * 1.8)));
        for (let i = 0; i < numTotal; i++) {
          const ang = (i / numTotal) * Math.PI * 2;
          const ruffleGroup = new THREE.Group();
          const ruffleMain = new THREE.Mesh(
            new THREE.SphereGeometry(ruffleR, 10, 6),
            icingMaterial
          );
          const wave = new THREE.Mesh(
            new THREE.TorusGeometry(ruffleR * 0.8, ruffleR * 0.3, 8, 12, Math.PI),
            icingMaterial
          );
          wave.rotation.x = Math.PI / 2;
          wave.position.y = -ruffleR * 0.5;
          ruffleGroup.add(ruffleMain);
          ruffleGroup.add(wave);
          ruffleGroup.position.set(
            Math.cos(ang) * baseRadius,
            icingYPosition,
            Math.sin(ang) * baseRadius
          );
          ruffleGroup.rotation.x = Math.PI / 2;
          ruffleGroup.rotation.y = -ang;
          patternedTopIcingGroup.add(ruffleGroup);
        }
      }
    } else if (style === "zigzag") {
      const zigzagR = thickness * 0.8;
      if (baseRadius > zigzagR) {
        const circumference = Math.PI * 2 * baseRadius;
        const numTotal = Math.max(1, Math.floor(circumference / (zigzagR * 1.5)));
        for (let i = 0; i < numTotal; i++) {
          const ang = (i / numTotal) * Math.PI * 2;
          const zigzagGroup = new THREE.Group();
          const point = new THREE.Mesh(
            new THREE.ConeGeometry(zigzagR * 0.8, zigzagR * 1.5, 4),
            icingMaterial
          );
          point.rotation.z = Math.PI / 2;
          const base = new THREE.Mesh(
            new THREE.CylinderGeometry(zigzagR * 0.6, zigzagR * 0.6, zigzagR * 0.3, 4),
            icingMaterial
          );
          base.position.y = -zigzagR * 0.9;
          zigzagGroup.add(point);
          zigzagGroup.add(base);
          zigzagGroup.position.set(
            Math.cos(ang) * baseRadius,
            icingYPosition,
            Math.sin(ang) * baseRadius
          );
          zigzagGroup.rotation.y = -ang;
          patternedTopIcingGroup.add(zigzagGroup);
        }
      }
    }

    if (patternedTopIcingGroup.children.length > 0) layerMesh.add(patternedTopIcingGroup);
  }

  const overallToppingGroup = new THREE.Group();
  overallToppingGroup.name = "toppingGroup";
  toppings.forEach(topping => {
    if (topping.type === 'sprinkles') {
      const sprinkleCount = 150;
      const sprinkleMaterial = new THREE.MeshStandardMaterial({
        roughness: 0.8,
        metalness: 0.1
      });
      for (let i = 0; i < sprinkleCount; i++) {
        const sprinkleGeo = new THREE.BoxGeometry(0.03, 0.15, 0.03);
        const sprinkle = new THREE.Mesh(sprinkleGeo, sprinkleMaterial.clone());
        sprinkle.material.color.setHSL(Math.random(), 0.8, 0.6);
        const angle = Math.random() * Math.PI * 2;
        const sprinkleRadius = layerRadius - (edgeIcing.enabled ? edgeIcing.thickness : 0) - 0.1;
        const dist = Math.random() * Math.max(0, sprinkleRadius);
        sprinkle.position.set(Math.cos(angle) * dist, topY + 0.075, Math.sin(angle) * dist);
        sprinkle.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        overallToppingGroup.add(sprinkle);
      }
    } else if (topping.type === 'cherries') {
      const cherryCount = Math.max(1, Math.floor(layerRadius * 3)); // Increased multiplier from 1.5 to 3
      const cherryMaterial = new THREE.MeshStandardMaterial({
        color: 0xAA0000,
        roughness: 0.4,
        metalness: 0.2
      });
      const stemMaterial = new THREE.MeshStandardMaterial({
        color: 0x006400,
        roughness: 0.6
      });
      for (let i = 0; i < cherryCount; i++) {
        const cherry = new THREE.Group();
        const cherryBodyRadius = 0.15;
        const bodyGeo = new THREE.SphereGeometry(cherryBodyRadius, 16, 16);
        const body = new THREE.Mesh(bodyGeo, cherryMaterial);
        cherry.add(body);
        const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8);
        const stem = new THREE.Mesh(stemGeo, stemMaterial);
        stem.position.y = cherryBodyRadius + 0.05;
        stem.rotation.z = Math.PI / 6;
        cherry.add(stem);
        let angle, dist;
        const availableRadius = layerRadius - (edgeIcing.enabled ? edgeIcing.thickness : 0) - cherryBodyRadius;
        if (cherryCount === 1) {
          angle = 0;
          dist = 0;
        } else {
          // Improved distribution using golden ratio for better spacing
          const goldenRatio = 0.618033988749895;
          angle = (i * goldenRatio * Math.PI * 2) % (Math.PI * 2);
          // Create multiple rings of cherries
          const ringIndex = Math.floor(i / (cherryCount / 3));
          const ringRadius = (availableRadius * 0.75) * (ringIndex + 1) / 3;
          dist = ringRadius;
          // Add slight randomness to position
          dist += (Math.random() - 0.5) * (availableRadius * 0.1);
        }
        cherry.position.set(Math.cos(angle) * dist, topY + cherryBodyRadius, Math.sin(angle) * dist);
        // Add slight random rotation for more natural look
        cherry.rotation.y = Math.random() * Math.PI * 2;
        overallToppingGroup.add(cherry);
      }
    } else if (topping.type === 'strawberries') {
      // Ring-based strawberry positioning (improved from copy file)
      const strawberryPosition = layerConfig.strawberryPosition || "inner";
      const availableRadius = layerRadius - (edgeIcing.enabled ? edgeIcing.thickness : 0) - 0.15;

      // Define positioning based on user selection
      let rings = [];
      const minRadius = 0.2;
      const strawberrySpacing = 0.5; // Spacing between strawberries

      if (strawberryPosition === "inner") {
        const innerRadius = minRadius + (availableRadius - minRadius) * 0.3;
        const circumference = 2 * Math.PI * innerRadius;
        const strawberryCount = Math.max(2, Math.floor(circumference / strawberrySpacing));
        rings = [{ radius: innerRadius, count: strawberryCount }];
      } else if (strawberryPosition === "mid") {
        const midRadius = minRadius + (availableRadius - minRadius) * 0.6;
        const circumference = 2 * Math.PI * midRadius;
        const strawberryCount = Math.max(3, Math.floor(circumference / strawberrySpacing));
        rings = [{ radius: midRadius, count: strawberryCount }];
      } else if (strawberryPosition === "outer") {
        const outerRadius = availableRadius * 0.9;
        const circumference = 2 * Math.PI * outerRadius;
        const strawberryCount = Math.max(4, Math.floor(circumference / strawberrySpacing));
        rings = [{ radius: outerRadius, count: strawberryCount }];
      } else if (strawberryPosition === "all") {
        const numberOfRings = 3; // Create 3 rings for full coverage
        for (let ring = 0; ring < numberOfRings; ring++) {
          const ringRadius = minRadius + (ring / (numberOfRings - 1)) * (availableRadius - minRadius);
          const circumference = 2 * Math.PI * ringRadius;
          const strawberriesInRing = Math.max(2, Math.floor(circumference / strawberrySpacing));
          rings.push({ radius: ringRadius, count: strawberriesInRing });
        }
      }

      // Material definitions
      const strawberryMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF3B3B,
        roughness: 0.7,
        metalness: 0.1
      });
      const stemMaterial = new THREE.MeshStandardMaterial({
        color: 0x228B22,
        roughness: 0.8
      });
      const seedMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFDD0,
        roughness: 0.6
      });

      // Create strawberries for each ring
      rings.forEach((ring, ringIndex) => {
        for (let i = 0; i < ring.count; i++) {
          const strawberry = new THREE.Group();

          // Create strawberry body with size variation
          const sizeVariation = 0.8 + Math.random() * 0.4;
          const bodyGeo = new THREE.ConeGeometry(0.12 * sizeVariation, 0.25 * sizeVariation, 16);
          const body = new THREE.Mesh(bodyGeo, strawberryMaterial);
          body.rotation.x = Math.PI; // Flip upside down
          strawberry.add(body);

          // Add green top/leaves
          const leafGeo = new THREE.CylinderGeometry(0.1 * sizeVariation, 0.05 * sizeVariation, 0.05 * sizeVariation, 12);
          const leaves = new THREE.Mesh(leafGeo, stemMaterial);
          leaves.position.y = 0.125 * sizeVariation;
          strawberry.add(leaves);

          // Add seeds (small yellow dots)
          for (let s = 0; s < 8; s++) {
            const seedGeo = new THREE.SphereGeometry(0.01 * sizeVariation, 4, 4);
            const seed = new THREE.Mesh(seedGeo, seedMaterial);
            const seedAngle = Math.random() * Math.PI * 2;
            const seedHeight = Math.random() * 0.2 * sizeVariation - 0.1 * sizeVariation;
            const seedRadius = 0.1 * Math.random() * sizeVariation + 0.05 * sizeVariation;
            seed.position.set(
              Math.cos(seedAngle) * seedRadius,
              seedHeight,
              Math.sin(seedAngle) * seedRadius
            );
            strawberry.add(seed);
          }

          // Position strawberry evenly around the ring
          const baseAngle = (i / ring.count) * Math.PI * 2;
          strawberry.position.set(
            Math.cos(baseAngle) * ring.radius,
            topY + 0.125 * sizeVariation,
            Math.sin(baseAngle) * ring.radius
          );

          // Add natural rotation
          strawberry.rotation.y = Math.random() * Math.PI * 2;
          strawberry.rotation.z = (Math.random() - 0.5) * 0.3;

          overallToppingGroup.add(strawberry);
        }
      });
    } else if (topping.type === 'blueberries') {
      const blueberryCount = Math.max(2, Math.floor(layerRadius * 5)); // More blueberries as they're smaller
      const blueberryMaterial = new THREE.MeshStandardMaterial({
        color: 0x4169E1,
        roughness: 0.5,
        metalness: 0.2
      });
      const highlightMaterial = new THREE.MeshStandardMaterial({
        color: 0xE6E6FA,
        roughness: 0.3,
        metalness: 0.4
      });

      for (let i = 0; i < blueberryCount; i++) {
        const blueberry = new THREE.Group();

        // Create blueberry body (small sphere)
        const bodyRadius = 0.07 + Math.random() * 0.02; // Slight size variation
        const bodyGeo = new THREE.SphereGeometry(bodyRadius, 12, 12);
        const body = new THREE.Mesh(bodyGeo, blueberryMaterial);
        blueberry.add(body);

        // Add highlight spot (small white dot)
        const highlightGeo = new THREE.SphereGeometry(bodyRadius * 0.2, 6, 6);
        const highlight = new THREE.Mesh(highlightGeo, highlightMaterial);
        highlight.position.set(bodyRadius * 0.5, bodyRadius * 0.5, 0);
        blueberry.add(highlight);

        // Position the blueberry on the cake
        const availableRadius = layerRadius - (edgeIcing.enabled ? edgeIcing.thickness : 0) - bodyRadius;

        // Distribute blueberries in clusters and across the cake top
        let angle, dist;

        if (i % 3 === 0) {
          // Create clusters
          const clusterIndex = Math.floor(i / 3);
          const clusterAngle = (clusterIndex * Math.PI * 0.5) % (Math.PI * 2);
          angle = clusterAngle + (Math.random() - 0.5) * 0.5; // Small angle variation within cluster
          dist = availableRadius * (0.4 + Math.random() * 0.5);
        } else {
          // Random placement
          angle = Math.random() * Math.PI * 2;
          dist = Math.random() * availableRadius;
        }

        blueberry.position.set(
          Math.cos(angle) * dist,
          topY + bodyRadius,
          Math.sin(angle) * dist
        );

        // Random rotation
        blueberry.rotation.x = Math.random() * Math.PI;
        blueberry.rotation.y = Math.random() * Math.PI;
        blueberry.rotation.z = Math.random() * Math.PI;

        overallToppingGroup.add(blueberry);
      }
    } else if (topping.type === 'candle') {
      const candlePosition = layerConfig.candlePosition || "center"; // Default to center
      let candleCount = 1;
      const candleHeight = 0.8; // bodyHeight
      const candleRadius = 0.04; // bodyRadius

      const candleMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.1,
      });
      const flameMaterial = new THREE.MeshStandardMaterial({
        color: 0xff6600,
        roughness: 0.1,
        metalness: 0.0,
        emissive: 0xff3300,
        emissiveIntensity: 0.2,
      });
      const wickMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.8,
      });

      // Determine candle count and base positions based on candlePosition
      let positions = [];
      const effectiveRadius = layerRadius - candleRadius - 0.1; // Radius for placing candles, leaving some margin

      switch (candlePosition) {
        case "center":
          positions.push({ x: 0, z: 0 });
          break;
        case "front":
          positions.push({ x: 0, z: effectiveRadius * 0.7 });
          break;
        case "back":
          positions.push({ x: 0, z: -effectiveRadius * 0.7 });
          break;
        case "left":
          positions.push({ x: -effectiveRadius * 0.7, z: 0 });
          break;
        case "right":
          positions.push({ x: effectiveRadius * 0.7, z: 0 });
          break;
        case "front-left":
          positions.push({ x: -effectiveRadius * 0.5, z: effectiveRadius * 0.5 });
          break;
        case "front-right":
          positions.push({ x: effectiveRadius * 0.5, z: effectiveRadius * 0.5 });
          break;
        case "back-left":
          positions.push({ x: -effectiveRadius * 0.5, z: -effectiveRadius * 0.5 });
          break;
        case "back-right":
          positions.push({ x: effectiveRadius * 0.5, z: -effectiveRadius * 0.5 });
          break;
        case "around_edge":
          candleCount = Math.max(3, Math.floor(layerRadius * 4)); // Adjust count based on size
          for (let i = 0; i < candleCount; i++) {
            const angle = (i / candleCount) * Math.PI * 2;
            positions.push({
              x: Math.cos(angle) * effectiveRadius,
              z: Math.sin(angle) * effectiveRadius,
            });
          }
          break;
        case "top": // alias for 'around_edge' or a denser distributed pattern
          positions.push({ x: 0, z: 0 });
          break;
      }

      candleCount = positions.length;

      for (let i = 0; i < candleCount; i++) {
        const candle = new THREE.Group();

        const bodyGeo = new THREE.CylinderGeometry(
          candleRadius,
          candleRadius,
          candleHeight,
          16
        );
        const body = new THREE.Mesh(bodyGeo, candleMaterial);
        candle.add(body);

        const wickGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.1, 8);
        const wick = new THREE.Mesh(wickGeo, wickMaterial);
        wick.position.y = candleHeight / 2 + 0.05;
        candle.add(wick);

        const flameGeo = new THREE.SphereGeometry(0.03, 8, 8);
        const flame = new THREE.Mesh(flameGeo, flameMaterial);
        flame.position.y = candleHeight / 2 + 0.12;
        candle.add(flame);

        const pos = positions[i];
        candle.position.set(pos.x, topY + candleHeight / 2, pos.z);

        overallToppingGroup.add(candle);
      }
    } else if (topping.type === 'crush_oreo') {
      const oreoCount = Math.max(20, Math.floor(layerRadius * 15)); // Many small oreo pieces
      const oreoMaterial = new THREE.MeshStandardMaterial({
        color: 0x2f1b1b,
        roughness: 0.8,
        metalness: 0.1,
      });
      const creamMaterial = new THREE.MeshStandardMaterial({
        color: 0xfffff0,
        roughness: 0.5,
        metalness: 0.1,
      });

      for (let i = 0; i < oreoCount; i++) {
        const oreoGroup = new THREE.Group();

        // Create irregular oreo crumb shapes - increased size
        const crumbSize = 0.04 + Math.random() * 0.06; // Increased from 0.02-0.05 to 0.04-0.10
        const crumbGeo = new THREE.BoxGeometry(
          crumbSize,
          crumbSize * 0.3,
          crumbSize * 0.8
        );
        const crumb = new THREE.Mesh(crumbGeo, oreoMaterial);
        oreoGroup.add(crumb);

        // Sometimes add cream pieces
        if (Math.random() < 0.3) {
          const creamGeo = new THREE.SphereGeometry(crumbSize * 0.5, 6, 6);
          const cream = new THREE.Mesh(creamGeo, creamMaterial);
          cream.position.y = crumbSize * 0.2;
          oreoGroup.add(cream);
        }

        // Position the oreo crumb on the cake
        const availableRadius =
          layerRadius - (edgeIcing.enabled ? edgeIcing.thickness : 0);

        // Random distribution across cake top
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * availableRadius;

        oreoGroup.position.set(
          Math.cos(angle) * dist,
          topY + crumbSize,
          Math.sin(angle) * dist
        );

        // Random rotation for natural look
        oreoGroup.rotation.x = Math.random() * Math.PI;
        oreoGroup.rotation.y = Math.random() * Math.PI;
        oreoGroup.rotation.z = Math.random() * Math.PI;

        overallToppingGroup.add(oreoGroup);
      }
    } else if (topping.type === 'christmas_balls') {
      const ballCount = Math.max(3, Math.floor(layerRadius * 2)); // Fewer balls as they're decorative
      const ballColors = [0xff0000, 0x00ff00, 0xffd700, 0x0000ff, 0xff69b4]; // Red, Green, Gold, Blue, Pink

      for (let i = 0; i < ballCount; i++) {
        const ball = new THREE.Group();

        // Create main ball - increased size
        const ballRadius = 0.15 + Math.random() * 0.08; // Increased from 0.08-0.12 to 0.15-0.23
        const ballGeo = new THREE.SphereGeometry(ballRadius, 16, 16);
        const ballColor = ballColors[Math.floor(Math.random() * ballColors.length)];
        const ballMaterial = new THREE.MeshStandardMaterial({
          color: ballColor,
          roughness: 0.1,
          metalness: 0.8,
        });
        const ballMesh = new THREE.Mesh(ballGeo, ballMaterial);
        ball.add(ballMesh);

        // Add cap (small cylinder at top)
        const capGeo = new THREE.CylinderGeometry(
          ballRadius * 0.3,
          ballRadius * 0.3,
          ballRadius * 0.3,
          12
        );
        const capMaterial = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          roughness: 0.2,
          metalness: 0.9,
        });
        const cap = new THREE.Mesh(capGeo, capMaterial);
        cap.position.y = ballRadius + ballRadius * 0.15;
        ball.add(cap);

        // Position the ball on the cake
        const availableRadius =
          layerRadius - (edgeIcing.enabled ? edgeIcing.thickness : 0) - ballRadius;

        // Distribute balls around the cake
        const angle = (i / ballCount) * Math.PI * 2 + Math.random() * 0.5;
        const dist = availableRadius * (0.3 + Math.random() * 0.5);

        ball.position.set(
          Math.cos(angle) * dist,
          topY + ballRadius,
          Math.sin(angle) * dist
        );

        // Random rotation for variety
        ball.rotation.y = Math.random() * Math.PI * 2;
        ball.rotation.z = (Math.random() - 0.5) * 0.3;

        overallToppingGroup.add(ball);
      }
    } else if (topping.type === 'flowers') {
      // Get the selected flower position and rose color from layer config
      const flowerPosition = layerConfig.flowerPosition || "inner";
      const selectedRoseColor = layerConfig.roseColor || "red";
      const availableRadius =
        layerRadius - (edgeIcing.enabled ? edgeIcing.thickness : 0) - 0.25;

      // Define rose colors
      const roseColors = {
        red: 0xdc143c,
        pink: 0xff69b4,
        white: 0xfffff0,
        yellow: 0xffd700,
        purple: 0x9370db,
        orange: 0xff8c00,
      };

      const roseColor = roseColors[selectedRoseColor] || roseColors.red;

      // Define positioning based on user selection
      let rings = [];
      const minRadius = 0.25;
      const flowerSpacing = 0.75;

      if (flowerPosition === "inner") {
        const innerRadius = minRadius + (availableRadius - minRadius) * 0.3;
        const circumference = 2 * Math.PI * innerRadius;
        const flowerCount = Math.max(4, Math.floor(circumference / flowerSpacing));
        rings = [{ radius: innerRadius, count: flowerCount }];
      } else if (flowerPosition === "mid") {
        const midRadius = minRadius + (availableRadius - minRadius) * 0.6;
        const circumference = 2 * Math.PI * midRadius;
        const flowerCount = Math.max(5, Math.floor(circumference / flowerSpacing));
        rings = [{ radius: midRadius, count: flowerCount }];
      } else if (flowerPosition === "outer") {
        const outerRadius = availableRadius * 0.9;
        const circumference = 2 * Math.PI * outerRadius;
        const flowerCount = Math.max(6, Math.floor(circumference / flowerSpacing));
        rings = [{ radius: outerRadius, count: flowerCount }];
      } else if (flowerPosition === "all") {
        const numberOfRings = 3;
        for (let ring = 0; ring < numberOfRings; ring++) {
          const ringRadius =
            minRadius + (ring / (numberOfRings - 1)) * (availableRadius - minRadius);
          const circumference = 2 * Math.PI * ringRadius;
          const flowersInRing = Math.max(3, Math.floor(circumference / flowerSpacing));
          rings.push({ radius: ringRadius, count: flowersInRing });
        }
      }

      // Generate flowers for each ring
      rings.forEach((ring) => {
        for (let i = 0; i < ring.count; i++) {
          const rose = new THREE.Group();

          // Create 3D Rose with layered petals
          const roseMaterial = new THREE.MeshStandardMaterial({
            color: roseColor,
            roughness: 0.3,
            metalness: 0.1,
          });

          // Create rose center (small sphere)
          const centerGeo = new THREE.SphereGeometry(0.05, 8, 8);
          const center = new THREE.Mesh(centerGeo, roseMaterial);
          rose.add(center);

          // Create multiple layers of petals for 3D rose effect
          const petalLayers = 4;

          for (let layer = 0; layer < petalLayers; layer++) {
            const layerRadius = 0.06 + layer * 0.035;
            const petalsInLayer = 5 + layer;
            const layerHeight = layer * 0.03;

            for (let p = 0; p < petalsInLayer; p++) {
              const petalAngle = (p / petalsInLayer) * Math.PI * 2 + layer * 0.3;

              const petalGeo = new THREE.SphereGeometry(0.035 + layer * 0.015, 6, 4);
              const petal = new THREE.Mesh(petalGeo, roseMaterial);

              const petalX = Math.cos(petalAngle) * layerRadius;
              const petalZ = Math.sin(petalAngle) * layerRadius;
              const petalY = layerHeight;

              petal.position.set(petalX, petalY, petalZ);
              petal.scale.set(1.5 + layer * 0.4, 0.4, 1.0 + layer * 0.3);
              petal.rotation.x = -Math.PI / 6 + (layer * Math.PI) / 12;
              petal.rotation.y = petalAngle;
              petal.rotation.z = (Math.random() - 0.5) * 0.3;

              rose.add(petal);
            }
          }

          // Add green leaves
          const leafMaterial = new THREE.MeshStandardMaterial({
            color: 0x2e8b57,
            roughness: 0.7,
            metalness: 0.1,
          });

          const leafCount = 2 + Math.floor(Math.random() * 2);
          for (let l = 0; l < leafCount; l++) {
            const leafAngle = (l / leafCount) * Math.PI * 2;
            const leafGeo = new THREE.SphereGeometry(0.08, 6, 4);
            const leaf = new THREE.Mesh(leafGeo, leafMaterial);

            const leafRadius = 0.2;
            leaf.position.set(
              Math.cos(leafAngle) * leafRadius,
              -0.1 - Math.random() * 0.05,
              Math.sin(leafAngle) * leafRadius
            );

            leaf.scale.set(1.5, 0.2, 0.8);
            leaf.rotation.x = Math.PI / 3 + (Math.random() - 0.5) * 0.2;
            leaf.rotation.y = leafAngle + (Math.random() - 0.5) * 0.3;
            leaf.rotation.z = (Math.random() - 0.5) * 0.4;

            rose.add(leaf);
          }

          // Position the rose in the current ring
          const angle = (i / ring.count) * Math.PI * 2;
          rose.position.set(
            Math.cos(angle) * ring.radius,
            topY + 0.12,
            Math.sin(angle) * ring.radius
          );

          rose.rotation.y = Math.random() * Math.PI * 2;
          overallToppingGroup.add(rose);
        }
      });
    }
  });
  if (overallToppingGroup.children.length > 0) layerMesh.add(overallToppingGroup);
};

// Greeting config and group
const greetingConfig = reactive({
  enabled: false,
  text: 'Happy B-Day!',
  color: '#333333',
  size: 0.25,
  depth: 0.05,
  layout: 'horizontal-top'
});

function onGreetingChange() {
  renderCake();
}

const addGreetingTextToCake = (currentHeightOffset, topLayerRadius, topLayerHeight) => {
  // Remove existing greeting text if any
  const existingGreeting = cakeGroup.getObjectByName("greetingGroup");
  if (existingGreeting) {
    existingGreeting.traverse(c => {
      if (c.isMesh) {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      }
    });
    cakeGroup.remove(existingGreeting);
  }

  if (!greetingConfig.enabled || !greetingConfig.text || !loadedFonts.normal) {
    return;
  }

  const greetingGroup = new THREE.Group();
  greetingGroup.name = "greetingGroup";

  const textGeometry = new TextGeometry(greetingConfig.text, {
    font: loadedFonts.normal,
    size: greetingConfig.size,
    height: greetingConfig.depth,
    curveSegments: 12,
    bevelEnabled: false
  });

  textGeometry.computeBoundingBox();
  const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
  const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;

  const textMaterial = new THREE.MeshStandardMaterial({
    color: greetingConfig.color,
    roughness: 0.7,
    metalness: 0.1
  });

  const textMesh = new THREE.Mesh(textGeometry, textMaterial);

  // Position the text based on layout
  switch (greetingConfig.layout) {
    case 'horizontal-top':
      textMesh.rotation.x = -Math.PI / 2;
      textMesh.position.set(
        -textWidth / 2,
        currentHeightOffset + 0.01, // Just above the cake's top
        0
      );
      break;
    case 'circular-top':
      textMesh.position.set(0, currentHeightOffset + topLayerHeight / 2 + 0.1, 0);
      textMesh.rotation.x = -Math.PI / 2;
      // Create a circular path for the text
      const radius = topLayerRadius * 0.8;
      const textPath = new THREE.CurvePath();
      const circle = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
      textPath.add(circle);
      // Apply the path to the text
      textMesh.geometry = new TextGeometry(greetingConfig.text, {
        font: loadedFonts.normal,
        size: greetingConfig.size,
        height: greetingConfig.depth,
        curveSegments: 12,
        bevelEnabled: false,
        path: textPath
      });
      break;
    case 'vertical-side':
      textMesh.position.set(topLayerRadius + 0.1, currentHeightOffset - topLayerHeight / 2, 0);
      textMesh.rotation.y = Math.PI / 2;
      break;
  }

  greetingGroup.add(textMesh);
  cakeGroup.add(greetingGroup);
};

const renderCake = () => {
  // Safety check: make sure scene and cakeGroup are initialized
  if (!scene || !cakeGroup) {
    console.warn("Scene or cakeGroup not initialized yet. Unable to render cake.");
    return;
  }
  
  // Safety check: make sure cakeGroup.children exists and is an array
  if (!cakeGroup.children || !Array.isArray(cakeGroup.children)) {
    console.warn("cakeGroup.children is not valid. Unable to render cake.");
    return;
  }
  
  const layersToRemove = cakeGroup.children.filter(child => child.userData && child.userData.isCakeLayer);
  layersToRemove.forEach(child => {
    if (originalLayerMaterials.has(child.userData.layerId) && child.material !== originalLayerMaterials.get(child.userData.layerId)) {
      if (child.material && child.material.dispose) child.material.dispose();
    } else if (!originalLayerMaterials.has(child.userData.layerId) && child.material && child.material.dispose) {
      if (Array.isArray(child.material)) child.material.forEach(m => m && m.dispose && m.dispose());
      else child.material.dispose();
    }
    if (child.geometry && child.geometry.dispose) child.geometry.dispose();
    child.traverse(object => {
      if (object && object.isMesh) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) object.material.forEach(m => m && m.dispose && m.dispose());
          else if (object.material.dispose) object.material.dispose();
        }
      }
    });
    cakeGroup.remove(child);
  });
  originalLayerMaterials.clear();

  // Make the cake sit almost directly on the stand
  let currentHeightOffset = cakeStand.userData.totalHeight - 0.01;
  let topLayerRadius = 0;
  let topLayerHeight = 0;

  if (cakeLayers.length > 0) {
    cakeLayers.forEach((layerConfig, index) => {
      const layerMesh = createLayerMesh(layerConfig.radius, layerConfig.height, layerConfig.color, layerConfig.id);
      layerMesh.position.y = currentHeightOffset + layerConfig.height / 2;
      addDecorations(layerMesh, layerConfig);
      cakeGroup.add(layerMesh);
      currentHeightOffset += layerConfig.height;
      if (index === cakeLayers.length - 1) {
        topLayerRadius = layerConfig.radius;
        topLayerHeight = layerConfig.height;
      }
      // Layer highlighting functionality removed
    });
  }
  // Add greeting text after layers
  addGreetingTextToCake(currentHeightOffset, topLayerRadius, topLayerHeight);
  renderer.render(scene, camera);
};

const addNewLayerAndSelect = () => {
  saveToHistory(); // Save state before making changes
  layerIdCounter++;
  const newLayerId = `layer_${layerIdCounter}`;
  const newLayer = {
    id: newLayerId,
    ...JSON.parse(JSON.stringify(defaultLayerSettings))
  };
  if (cakeLayers.length > 0) {
    const topLayer = cakeLayers[cakeLayers.length - 1];
    newLayer.radius = Math.max(0.5, topLayer.radius - 0.3);
    newLayer.height = Math.max(0.3, topLayer.height - 0.1);
  }
  cakeLayers.push(newLayer);
  renderCake();
  selectLayer(newLayerId);
  const layerEditorTabButton = document.querySelector('.tab-button[data-tab="tab-layer-editor"]');
  if (layerEditorTabButton) {
    layerEditorTabButton.click();
  }
};

const removeLayer = (layerIdToRemove) => {
  saveToHistory(); // Save state before making changes
  const layerIndex = cakeLayers.findIndex(l => l.id === layerIdToRemove);
  if (layerIndex === -1) return;
  cakeLayers.splice(layerIndex, 1);
  if (selectedLayerId === layerIdToRemove) {
    selectLayer(null);
  }
  renderCake();
};

const updateLayerProperty = (layerId, propertyPath, value) => {
  const layer = cakeLayers.find(l => l.id === layerId);
  if (layer) {
    saveToHistory(); // Save state before making changes
    const keys = propertyPath.split('.');
    let currentObject = layer;
    let propertyKey = keys[keys.length - 1];

    if (propertyPath.startsWith('toppings.')) {
      const toppingType = propertyKey;
      currentObject = layer.toppings;
      const existingToppingIndex = currentObject.findIndex(t => t.type === toppingType);
      if (value) {
        if (existingToppingIndex === -1) {
          currentObject.push({
            type: toppingType
          });
        }
      } else {
        if (existingToppingIndex !== -1) {
          currentObject.splice(existingToppingIndex, 1);
        }
      }
    } else {
      for (let i = 0; i < keys.length - 1; i++) {
        currentObject = currentObject[keys[i]];
        if (typeof currentObject === 'undefined') return;
      }
      let parsedValue = value;
      if (propertyKey === 'radius' || propertyKey === 'height' || propertyKey === 'thickness') {
        parsedValue = parseFloat(value);
      } else if (propertyKey === 'enabled' && (propertyPath.startsWith('edgeIcing') || propertyPath.startsWith('middleBandIcing'))) {
        parsedValue = Boolean(value);
        const icingConfigToAnimate = propertyPath.startsWith('edgeIcing') ? currentObject : layer.middleBandIcing;
        icingConfigToAnimate.isAnimating = parsedValue;
        if (!parsedValue) {
          icingConfigToAnimate.animationProgress = 0;
        } else {
          icingConfigToAnimate.animationProgress = 0;
        }
      } else if (propertyKey === 'enabled' && typeof value === 'boolean') {
        parsedValue = value;
      }
      currentObject[propertyKey] = parsedValue;
      

    }

    let isAnyIcingAnimating = (layer.edgeIcing && layer.edgeIcing.enabled && layer.edgeIcing.isAnimating) ||
      (layer.middleBandIcing && layer.middleBandIcing.enabled && layer.middleBandIcing.isAnimating);

    if (isAnyIcingAnimating) {
      needsCakeRender = true;
    } else {
      renderCake();
    }
  }
};

const addLayerControlsUI = (layerConfig, container) => {
  const layerControlsDiv = document.createElement('div');
  layerControlsDiv.className = 'control-group mobile-optimized';

  // Get the layer index and selected size
  const layerIndex = cakeLayers.findIndex(l => l.id === layerConfig.id);
  const selectedSizeObj = selectedSize.value ? sizeOptions.find(size => size.name === selectedSize.value.name) : null;

  // Calculate initial dimensions
  const baseRadius = selectedSizeObj ? (selectedSizeObj.diameter / 2) : 3;
  const layerHeightMax = selectedSizeObj ? selectedSizeObj.height : 6;

  layerControlsDiv.innerHTML = `
    <div class="mobile-section-header">
      <h2 class="layer-title">Layer ${layerIndex + 1}</h2>
      <div class="layer-dimensions">
        <p>Size: ${selectedSizeObj ? `${selectedSizeObj.diameter}″ × ${selectedSizeObj.height}″` : 'Custom'}</p>
      </div>
    </div>
    
    <div class="mobile-control-item">
      <label for="color_${layerConfig.id}" class="mobile-label">Layer Color:</label>
      <div class="color-picker-container">
        <input type="color" id="color_${layerConfig.id}" class="mobile-color-picker" value="${layerConfig.color}">
        <span class="color-value">${layerConfig.color}</span>
      </div>
    </div>
    
    <div class="mobile-control-item">
      <label for="radius_${layerConfig.id}" class="mobile-label">
        Layer Radius: <span class="value-display">${layerConfig.radius.toFixed(1)}</span>
      </label>
      <input type="range" id="radius_${layerConfig.id}" class="mobile-slider" 
        min="0.5" max="${baseRadius}" step="0.1" value="${layerConfig.radius}">
      <div class="range-labels">
        <span>0.5</span>
        <span>${baseRadius}</span>
      </div>
    </div>
    
    <div class="mobile-control-item">
      <label for="height_${layerConfig.id}" class="mobile-label">
        Layer Height: <span class="value-display">${layerConfig.height.toFixed(1)}</span>
      </label>
      <input type="range" id="height_${layerConfig.id}" class="mobile-slider" 
        min="0.5" max="${layerHeightMax}" step="0.1" value="${layerConfig.height}">
      <div class="range-labels">
        <span>0.5</span>
        <span>${layerHeightMax}</span>
      </div>
    </div>

    <div class="mobile-action-container">
      <button class="mobile-remove-btn" id="removeSelectedLayerBtn">
        <span class="btn-icon">🗑️</span> Remove Layer
      </button>
    </div>`;

  container.appendChild(layerControlsDiv);

  // Add event listeners with value display updates
  const colorPicker = document.getElementById(`color_${layerConfig.id}`);
  const colorValueDisplay = colorPicker.nextElementSibling;

  colorPicker.addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'color', e.target.value);
    colorValueDisplay.textContent = e.target.value;
  });

  const radiusInput = document.getElementById(`radius_${layerConfig.id}`);
  const radiusValueDisplay = layerControlsDiv.querySelector(`label[for='radius_${layerConfig.id}'] .value-display`);

  radiusInput.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value).toFixed(1);
    updateLayerProperty(layerConfig.id, 'radius', e.target.value);
    radiusValueDisplay.textContent = value;
  });

  const heightInput = document.getElementById(`height_${layerConfig.id}`);
  const heightValueDisplay = layerControlsDiv.querySelector(`label[for='height_${layerConfig.id}'] .value-display`);

  heightInput.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value).toFixed(1);
    updateLayerProperty(layerConfig.id, 'height', e.target.value);
    heightValueDisplay.textContent = value;
  });

  document.getElementById(`removeSelectedLayerBtn`).addEventListener('click', () => removeLayer(layerConfig.id));
};

const saveCakeConfiguration = () => {
  const cakeData = {
    cakeLayers: cakeLayers,
    layerIdCounter: layerIdCounter
  };
  const jsonData = JSON.stringify(cakeData, null, 2);
  const blob = new Blob([jsonData], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cake-design.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  console.log("Cake configuration saved.");
};

// Function to load cake data from either localStorage or Firebase
const loadCakeData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Check if we have an orderId and designId in URL query parameters
    const orderId = route.query.orderId;
    const designId = route.query.designId;
    
    // Clear any existing cake layers before loading new data
    cakeLayers = [];
    
    if (orderId && designId) {
      console.log(`Loading cake design from Firebase: Order ${orderId}, Design ${designId}`);
      // Load from Firebase
      await loadCakeDataFromFirebase(orderId, designId);
    } else {
      // Check localStorage for viewer data
      const storedData = localStorage.getItem('viewerDesignData');
      if (storedData) {
        console.log('Loading cake design from localStorage');
        const designData = JSON.parse(storedData);
        applyLoadedCakeData(designData);
      } else {
        console.log('No cake design data found, initializing empty scene');
        // No data available - show empty cake
        initScene();
      }
    }
  } catch (err) {
    console.error('Error loading cake data:', err);
    error.value = 'Failed to load cake design data. Please try again.';
    // Still initialize scene to show empty canvas
    initScene();
  } finally {
    loading.value = false;
  }
};

// Function to load cake data from Firebase
const loadCakeDataFromFirebase = async (orderId, designId) => {
  try {
    const database = getDatabase();
    // Path directly to the order, not to a 'custom' subcollection
    const orderRef = dbRef(database, `orders/${orderId}`);
    
    const snapshot = await get(orderRef);
    if (snapshot.exists()) {
      const orderData = snapshot.val();
      
      // Check if the order has items and at least one item with customDetails
      if (orderData.items && orderData.items.length > 0) {
        // Find the first item with design data
        const itemWithDesign = orderData.items.find(item => 
          item.customDetails && item.customDetails.designData
        );
        
        if (itemWithDesign && itemWithDesign.customDetails.designData) {
          console.log('Found design data in Firebase:', itemWithDesign.customDetails.designData);
          
          // Merge design data with greeting data if it exists
          const designData = { ...itemWithDesign.customDetails.designData };
          if (itemWithDesign.customDetails.greeting) {
            designData.greetingConfig = itemWithDesign.customDetails.greeting;
            console.log('Found greeting data in Firebase:', itemWithDesign.customDetails.greeting);
          }
          
          applyLoadedCakeData(designData);
        } else {
          throw new Error('Design data not found in this order');
        }
      } else {
        throw new Error('No items found in this order');
      }
    } else {
      throw new Error('Order not found');
    }
  } catch (err) {
    console.error('Firebase load error:', err);
    error.value = `Failed to load cake design: ${err.message}`;
    throw err;
  }
};

// Function to apply loaded cake data to the scene
const applyLoadedCakeData = (loadedData) => {
  if (loadedData && loadedData.cakeLayers) {
    cakeLayers = [];

    try {
      cakeLayers = loadedData.cakeLayers.map(loadedLayer => {
        const defaultStructure = JSON.parse(JSON.stringify(defaultLayerSettings));
        const mergedLayer = {
          ...defaultStructure,
          ...loadedLayer
        };
        
        // Properly merge all icing types
        mergedLayer.edgeIcing = {
          ...(defaultStructure.edgeIcing || {}),
          ...(loadedLayer.edgeIcing || {})
        };
        mergedLayer.middleBandIcing = {
          ...(defaultStructure.middleBandIcing || {}),
          ...(loadedLayer.middleBandIcing || {})
        };
        mergedLayer.bottomIcing = {
          ...(defaultStructure.bottomIcing || {}),
          ...(loadedLayer.bottomIcing || {})
        };
        mergedLayer.surfaceIcing = {
          ...(defaultStructure.surfaceIcing || {}),
          ...(loadedLayer.surfaceIcing || {})
        };
        mergedLayer.patternedTopIcing = {
          ...(defaultStructure.patternedTopIcing || {}),
          ...(loadedLayer.patternedTopIcing || {})
        };
        
        // Merge topper configuration
        mergedLayer.topper = {
          ...(defaultStructure.topper || {}),
          ...(loadedLayer.topper || {})
        };
        
        console.log(`Layer ${loadedLayer.id} topper config:`, JSON.stringify(mergedLayer.topper, null, 2));
        
        // Ensure toppings array is properly handled
        mergedLayer.toppings = loadedLayer.toppings || [];
        
        // Ensure all positioning properties are preserved
        mergedLayer.flowerPosition = loadedLayer.flowerPosition || defaultStructure.flowerPosition;
        mergedLayer.roseColor = loadedLayer.roseColor || defaultStructure.roseColor;
        mergedLayer.strawberryPosition = loadedLayer.strawberryPosition || defaultStructure.strawberryPosition;
        mergedLayer.candlePosition = loadedLayer.candlePosition || defaultStructure.candlePosition;
        
        // Ensure animation properties for all icing types
        ['edgeIcing', 'middleBandIcing', 'bottomIcing', 'surfaceIcing', 'patternedTopIcing'].forEach(icingType => {
          if (mergedLayer[icingType]) {
            if (!mergedLayer[icingType].hasOwnProperty('isAnimating')) {
              mergedLayer[icingType].isAnimating = defaultStructure[icingType]?.isAnimating || false;
            }
            if (!mergedLayer[icingType].hasOwnProperty('animationProgress')) {
              mergedLayer[icingType].animationProgress = defaultStructure[icingType]?.animationProgress || 0;
            }
            if (!mergedLayer[icingType].hasOwnProperty('animationSpeed')) {
              mergedLayer[icingType].animationSpeed = defaultStructure[icingType]?.animationSpeed || 0.5;
            }
          }
        });
        
        return mergedLayer;
      });

      layerIdCounter = loadedData.layerIdCounter || cakeLayers.length;
      
      // Load greeting configuration if present
      if (loadedData.greetingConfig) {
        Object.assign(greetingConfig, loadedData.greetingConfig);
      }
      
      // Load size and flavor selections if present
      if (loadedData.selectedSize) {
        selectedSize.value = loadedData.selectedSize;
      }
      
      if (loadedData.selectedFlavor) {
        selectedFlavor.value = loadedData.selectedFlavor;
      }
      
      if (loadedData.selectedLayers) {
        selectedLayers.value = loadedData.selectedLayers;
      }
      
              console.log("Successfully processed cake layers:", cakeLayers.length);
        console.log("Loaded cake data structure:", JSON.stringify(cakeLayers, null, 2));
    } catch (err) {
      console.error("Error processing cake layers:", err);
      cakeLayers = [];
    }

    // Initialize scene after loading data
    initScene();
    console.log("Cake configuration loaded from external source.");
    
    // Ensure the scene is fully initialized before rendering
    setTimeout(() => {
      if (scene && cakeGroup) {
        renderCake();
      }
    }, 100);
  } else {
    error.value = "Invalid cake design data format.";
    // Initialize scene with empty data
    initScene();
  }
};

// Update loadCakeConfiguration to use the new applyLoadedCakeData function
// const loadCakeConfiguration = (event) => {
//   const file = event.target.files[0];
//   if (!file) {
//     return;
//   }
//   const reader = new FileReader();
//   reader.onload = (e) => {
//     try {
//       const loadedData = JSON.parse(e.target.result);
//       applyLoadedCakeData(loadedData);
//     } catch (error) {
//       console.error("Error loading cake configuration:", error);
//       alert("Error loading cake configuration: " + error.message);
//     }
//   };
//   reader.readAsText(file);
//   event.target.value = null;
// };

const resetCakeDesign = () => {
  showResetConfirmModal.value = true;
};

const confirmReset = () => {
  showResetConfirmModal.value = false;

  saveToHistory(); // Save state before making changes
  selectLayer(null);
  cakeLayers = [];
  layerIdCounter = 0;

  renderCake();

  console.log("Cake design has been reset to default.");
};

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderCake();
};

const animate = () => {
  requestAnimationFrame(animate);
  const deltaTime = clock.getDelta();
  let anyIcingAnimating = false;

  cakeLayers.forEach(layer => {
    if (layer.edgeIcing.enabled && layer.edgeIcing.isAnimating) {
      anyIcingAnimating = true;
      layer.edgeIcing.animationProgress += layer.edgeIcing.animationSpeed * deltaTime;
      if (layer.edgeIcing.animationProgress >= 1) {
        layer.edgeIcing.animationProgress = 1;
        layer.edgeIcing.isAnimating = false;
      }
      needsCakeRender = true;
    }
    if (layer.middleBandIcing.enabled && layer.middleBandIcing.isAnimating) {
      anyIcingAnimating = true;
      layer.middleBandIcing.animationProgress += layer.middleBandIcing.animationSpeed * deltaTime;
      if (layer.middleBandIcing.animationProgress >= 1) {
        layer.middleBandIcing.animationProgress = 1;
        layer.middleBandIcing.isAnimating = false;
      }
      needsCakeRender = true;
    }
  });

  if (needsCakeRender) {
    renderCake();
    needsCakeRender = false;
  }

  controls.update();
  if (anyIcingAnimating || (controls.enabled && (controls.autoRotate || controls.enableDamping))) {
    renderer.render(scene, camera);
  }
};

// Selection handlers
const selectLayers = (num) => {
  selectedLayers.value = num;
};

// Update selectSize to set the whole object
const selectSize = (size) => {
  selectedSize.value = size ? { ...size } : null;
};

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const finishSelection = () => {
  // Generate cake based on selections
  generateCakeFromSelections();
  showSelectionsModal.value = false;
};

const generateCakeFromSelections = () => {
  if (!selectedSize.value || !selectedLayers.value || !selectedFlavor.value) {
    console.log('Size, layers, or flavor not selected yet');
    return;
  }

  // Clear existing layers
  cakeLayers = [];
  layerIdCounter = 0;

  // Get the selected size object
  const selectedSizeObj = selectedSize.value;

  // Handle multi-tier cakes
  if (Array.isArray(selectedSizeObj.diameter)) {
    // Multi-tier cake
    selectedSizeObj.diameter.forEach((tierData, index) => {
      layerIdCounter++;
      const newLayerId = `layer_${layerIdCounter}`;
      const newLayer = {
        id: newLayerId,
        ...JSON.parse(JSON.stringify(defaultLayerSettings))
      };

      // Set radius and height based on tier data
      newLayer.radius = tierData.diameter / 2;
      newLayer.height = tierData.height * 0.5; // Convert to Three.js units

      // Use the selected flavor color
      newLayer.color = selectedFlavor.value.color;

      cakeLayers.push(newLayer);
    });
  } else {
    // Single tier cake with multiple layers
    const baseRadius = selectedSizeObj.diameter / 2;
    const totalHeightInches = selectedSizeObj.height;

    // Calculate layer height
    let layerHeightInches = totalHeightInches / selectedLayers.value;
    const minLayerHeight = 1;
    if (layerHeightInches < minLayerHeight) layerHeightInches = minLayerHeight;
    const layerHeight = layerHeightInches * 0.5;

    // Generate layers based on selection
    for (let i = 0; i < selectedLayers.value; i++) {
      layerIdCounter++;
      const newLayerId = `layer_${layerIdCounter}`;
      const newLayer = {
        id: newLayerId,
        ...JSON.parse(JSON.stringify(defaultLayerSettings))
      };

      // All layers have the same radius (diameter)
      newLayer.radius = baseRadius;
      // Each layer gets equal height
      newLayer.height = layerHeight;

      // Use the selected flavor color
      newLayer.color = selectedFlavor.value.color;

      cakeLayers.push(newLayer);
    }
  }

  // Update cake stand size based on selected size
  const maxDiameter = Array.isArray(selectedSizeObj.diameter) 
    ? Math.max(...selectedSizeObj.diameter.map(d => d.diameter))
    : selectedSizeObj.diameter;

  if (cakeStand) {
    scene.remove(cakeStand);
    cakeStand = createCakeStand(maxDiameter);
    cakeStand.position.y = 0;
    scene.add(cakeStand);
  }

  // Adjust camera position based on cake size
  const totalHeight = Array.isArray(selectedSizeObj.diameter)
    ? selectedSizeObj.diameter.reduce((sum, tier) => sum + tier.height, 0) * 0.5
    : selectedLayers.value * (selectedSizeObj.height / selectedLayers.value) * 0.5;
    
  const cameraDistance = Math.max(maxDiameter, totalHeight) * 2.5;
  
  // Update camera to look at center of cake instead of bottom
  const cakeCenterY = totalHeight / 2 + cakeStand.userData.totalHeight;
  
  camera.position.set(cameraDistance, cakeCenterY, cameraDistance);
  camera.lookAt(0, cakeCenterY, 0);
  
  // Update orbit controls target
  if (controls) {
    controls.target.set(0, cakeCenterY, 0);
    controls.update();
  }

  // Render the cake
  renderCake();
};

// Add this CSS to style the layer dimensions display
const style = document.createElement('style');
style.textContent = `
  .layer-dimensions {
    background-color: #f8f9fa;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
  }
  .layer-dimensions p {
    margin: 5px 0;
    color: #666;
    font-size: 0.9rem;
  }
`;
document.head.appendChild(style);


// Add watcher to update cake when size changes after modal is closed
watch(selectedSize, (newVal, oldVal) => {
  if (!showSelectionsModal.value) {
    generateCakeFromSelections();
  }
});

// Add watcher for selectedLayers to regenerate cake after modal is closed
watch(selectedLayers, (newVal, oldVal) => {
  if (!showSelectionsModal.value) {
    generateCakeFromSelections();
  }
});

// Add flavor selection handler
const selectFlavor = (flavor) => {
  selectedFlavor.value = flavor;
};

// Add new functions for topper and icing controls
const updateControlsForSelectedTopper = () => {
  const controlsContainer = document.getElementById('selectedTopperControlsContainer');
  const prompt = document.getElementById('topperEditPrompt');
  controlsContainer.innerHTML = '';

  if (selectedLayerId) {
    const layerConfig = cakeLayers.find(l => l.id === selectedLayerId);
    if (layerConfig) {
      if (prompt) prompt.style.display = 'none';
      addTopperControlsUI(layerConfig, controlsContainer);
    } else {
      if (prompt) {
        prompt.textContent = "Error: Layer data not found.";
        prompt.style.display = 'block';
      }
    }
  } else {
    if (prompt) {
      prompt.textContent = "Click a cake layer in the 3D view to edit its topper.";
      prompt.style.display = 'block';
    }
  }
};

const updateControlsForSelectedIcing = () => {
  const controlsContainer = document.getElementById('selectedIcingControlsContainer');
  const prompt = document.getElementById('icingEditPrompt');
  controlsContainer.innerHTML = '';

  if (selectedLayerId) {
    const layerConfig = cakeLayers.find(l => l.id === selectedLayerId);
    if (layerConfig) {
      if (prompt) prompt.style.display = 'none';
      addIcingControlsUI(layerConfig, controlsContainer);
    } else {
      if (prompt) {
        prompt.textContent = "Error: Layer data not found.";
        prompt.style.display = 'block';
      }
    }
  } else {
    if (prompt) {
      prompt.textContent = "Click a cake layer in the 3D view to edit its icing.";
      prompt.style.display = 'block';
    }
  }
};

const updateControlsForSelectedToppings = () => {
  const controlsContainer = document.getElementById('selectedToppingsControlsContainer');
  const prompt = document.getElementById('toppingEditPrompt');
  controlsContainer.innerHTML = '';

  if (selectedLayerId) {
    const layerConfig = cakeLayers.find(l => l.id === selectedLayerId);
    if (layerConfig) {
      if (prompt) prompt.style.display = 'none';
      addToppingsControlsUI(layerConfig, controlsContainer);
    } else {
      if (prompt) {
        prompt.textContent = "Error: Layer data not found.";
        prompt.style.display = 'block';
      }
    }
  } else {
    if (prompt) {
      prompt.textContent = "Click a cake layer in the 3D view to edit its toppings.";
      prompt.style.display = 'block';
    }
  }
};

const addTopperControlsUI = (layerConfig, container) => {
  const topperControlsDiv = document.createElement('div');
  topperControlsDiv.className = 'control-group';

  // Create unique IDs for the topper tab controls to avoid conflicts with Layer Editor
  const topperSubControlsId = `topper_tab_sub_controls_${layerConfig.id}`;
  const topperTextControlsId = `topper_tab_text_controls_${layerConfig.id}`;
  const topperImageControlsId = `topper_tab_image_controls_${layerConfig.id}`;

  topperControlsDiv.innerHTML = `
    <p class="layer-header">Layer ${cakeLayers.findIndex(l => l.id === layerConfig.id) + 1} Topper</p>
    <div class="topper-section">
      <label class="checkbox-label">
        <input type="checkbox" id="topper_tab_enabled_${layerConfig.id}" ${layerConfig.topper.enabled ? 'checked' : ''}>
        Enable Printed Topper
      </label>
      <div id="${topperSubControlsId}" class="sub-controls mt-2 ${layerConfig.topper.enabled ? '' : 'hidden'}">
        <div class="mt-2">
          <label for="topper_tab_type_${layerConfig.id}">Topper Type:</label>
          <select id="topper_tab_type_${layerConfig.id}">
            <option value="none" ${layerConfig.topper.type === 'none' ? 'selected' : ''}>Select Type</option>
            <option value="text" ${layerConfig.topper.type === 'text' ? 'selected' : ''}>Text Only</option>
            <option value="image" ${layerConfig.topper.type === 'image' ? 'selected' : ''}>Image</option>
            <option value="text_image" ${layerConfig.topper.type === 'text_image' ? 'selected' : ''}>Text with Image</option>
          </select>
        </div>
        
        <div class="mt-2" id="${topperTextControlsId}" style="display: ${layerConfig.topper.type === 'text' || layerConfig.topper.type === 'text_image' ? 'block' : 'none'}">
          <label for="topper_tab_text_${layerConfig.id}">Text:</label>
          <input type="text" id="topper_tab_text_${layerConfig.id}" value="${layerConfig.topper.text}" placeholder="Enter text for topper">
          
          <div class="mt-2">
            <label for="topper_tab_font_size_${layerConfig.id}">Font Size (${layerConfig.topper.fontSize.toFixed(1)}):</label>
            <input type="range" id="topper_tab_font_size_${layerConfig.id}" min="0.5" max="4" step="0.1" value="${layerConfig.topper.fontSize}">
          </div>
          
          <div class="mt-2">
            <label for="topper_tab_font_style_${layerConfig.id}">Font Style:</label>
            <select id="topper_tab_font_style_${layerConfig.id}">
              <option value="normal" ${layerConfig.topper.style === 'normal' ? 'selected' : ''}>Normal</option>
              <option value="bold" ${layerConfig.topper.style === 'bold' ? 'selected' : ''}>Bold</option>
              <option value="italic" ${layerConfig.topper.style === 'italic' ? 'selected' : ''}>Italic</option>
            </select>
          </div>
          
          <div class="mt-2">
            <label for="topper_tab_text_color_${layerConfig.id}">Text Color:</label>
            <input type="color" id="topper_tab_text_color_${layerConfig.id}" value="${layerConfig.topper.color}">
          </div>
        </div>
        
        <div class="mt-2" id="${topperImageControlsId}" style="display: ${layerConfig.topper.type === 'image' || layerConfig.topper.type === 'text_image' ? 'block' : 'none'}">
          <label for="topper_tab_image_${layerConfig.id}">Upload Image:</label>
          <input type="file" id="topper_tab_image_${layerConfig.id}" accept="image/*">
        </div>
        
        <div class="mt-2">
          <label for="topper_tab_position_${layerConfig.id}">Position:</label>
          <select id="topper_tab_position_${layerConfig.id}">
                            <option value="center" ${layerConfig.topper.position === 'center' ? 'selected' : ''}>Center</option>
                <option value="top" ${layerConfig.topper.position === 'top' ? 'selected' : ''}>Top</option>
                <option value="bottom" ${layerConfig.topper.position === 'bottom' ? 'selected' : ''}>Bottom</option>
                <option value="front" ${layerConfig.topper.position === 'front' ? 'selected' : ''}>Front</option>
                <option value="back" ${layerConfig.topper.position === 'back' ? 'selected' : ''}>Back</option>
                <option value="left" ${layerConfig.topper.position === 'left' ? 'selected' : ''}>Left</option>
                <option value="right" ${layerConfig.topper.position === 'right' ? 'selected' : ''}>Right</option>
                <option value="front-left" ${layerConfig.topper.position === 'front-left' ? 'selected' : ''}>Front Left</option>
                <option value="front-right" ${layerConfig.topper.position === 'front-right' ? 'selected' : ''}>Front Right</option>
                <option value="back-left" ${layerConfig.topper.position === 'back-left' ? 'selected' : ''}>Back Left</option>
                <option value="back-right" ${layerConfig.topper.position === 'back-right' ? 'selected' : ''}>Back Right</option>
          </select>
        </div>
        
        <div class="mt-2">
          <label for="topper_tab_size_${layerConfig.id}">Topper Size (${layerConfig.topper.size || 1}):</label>
          <input type="range" id="topper_tab_size_${layerConfig.id}" min="0.5" max="2" step="0.01" value="${layerConfig.topper.size || 1}">
        </div>
        
        <div class="mt-2">
          <label for="topper_tab_stick_height_${layerConfig.id}">Stick Height (${layerConfig.topper.stickHeight.toFixed(1)}):</label>
          <input type="range" id="topper_tab_stick_height_${layerConfig.id}" min="0.1" max="1.5" step="0.1" value="${layerConfig.topper.stickHeight}">
        </div>
      </div>
    </div>
  `;

  container.appendChild(topperControlsDiv);

  // Add event listeners for topper controls with the correct IDs
  const topperEnabledCheckbox = document.getElementById(`topper_tab_enabled_${layerConfig.id}`);
  const topperSubControlsDiv = document.getElementById(topperSubControlsId);

  topperEnabledCheckbox.addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'topper.enabled', e.target.checked);
    topperSubControlsDiv.classList.toggle('hidden', !e.target.checked);
  });

  const topperTypeSelect = document.getElementById(`topper_tab_type_${layerConfig.id}`);
  const topperTextControls = document.getElementById(topperTextControlsId);
  const topperImageControls = document.getElementById(topperImageControlsId);

  topperTypeSelect.addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'topper.type', e.target.value);
    topperTextControls.style.display = (e.target.value === 'text' || e.target.value === 'text_image') ? 'block' : 'none';
    topperImageControls.style.display = (e.target.value === 'image' || e.target.value === 'text_image') ? 'block' : 'none';
  });

  document.getElementById(`topper_tab_text_${layerConfig.id}`).addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'topper.text', e.target.value);
  });

  document.getElementById(`topper_tab_font_size_${layerConfig.id}`).addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'topper.fontSize', parseFloat(e.target.value));
  });

  document.getElementById(`topper_tab_font_style_${layerConfig.id}`).addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'topper.style', e.target.value);
  });

  document.getElementById(`topper_tab_text_color_${layerConfig.id}`).addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'topper.color', e.target.value);
  });

  document.getElementById(`topper_tab_position_${layerConfig.id}`).addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'topper.position', e.target.value);
  });

  document.getElementById(`topper_tab_image_${layerConfig.id}`).addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateLayerProperty(layerConfig.id, 'topper.image', event.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById(`topper_tab_size_${layerConfig.id}`).addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'topper.size', parseFloat(e.target.value));
  });

  document.getElementById(`topper_tab_stick_height_${layerConfig.id}`).addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'topper.stickHeight', parseFloat(e.target.value));
  });
};

const addIcingControlsUI = (layerConfig, container) => {
  const icingControlsDiv = document.createElement('div');
  icingControlsDiv.className = 'control-group';

  // Create unique IDs for the icing tab controls to avoid conflicts with Layer Editor
  const edgeIcingSubControlsId = `icing_tab_edge_controls_${layerConfig.id}`;
  const middleIcingSubControlsId = `icing_tab_middle_controls_${layerConfig.id}`;
  const bottomIcingSubControlsId = `icing_tab_bottom_controls_${layerConfig.id}`;
  const surfaceIcingSubControlsId = `icing_tab_surface_controls_${layerConfig.id}`;
  const patternedTopIcingSubControlsId = `icing_tab_patterned_controls_${layerConfig.id}`;

  icingControlsDiv.innerHTML = `
    <p class="layer-header">Layer ${cakeLayers.findIndex(l => l.id === layerConfig.id) + 1} Icing</p>
    
    <div class="icing-section">
      <label class="checkbox-label">
        <input type="checkbox" id="icing_tab_edge_enabled_${layerConfig.id}" ${layerConfig.edgeIcing.enabled ? 'checked' : ''}>
        Enable Edge Icing
      </label>
      <div id="${edgeIcingSubControlsId}" class="sub-controls mt-2 ${layerConfig.edgeIcing.enabled ? '' : 'hidden'}">
        <div class="mt-1">
          <label for="icing_tab_edge_style_${layerConfig.id}">Edge Style:</label>
          <select id="icing_tab_edge_style_${layerConfig.id}">
            <option value="smooth" ${layerConfig.edgeIcing.style === 'smooth' ? 'selected' : ''}>Smooth Ring</option>
            <option value="curl" ${layerConfig.edgeIcing.style === 'curl' ? 'selected' : ''}>Curl Pattern</option>
            <option value="shell" ${layerConfig.edgeIcing.style === 'shell' ? 'selected' : ''}>Shell Pattern</option>
            <option value="rosette" ${layerConfig.edgeIcing.style === 'rosette' ? 'selected' : ''}>Rosette Pattern</option>
            <option value="ruffle" ${layerConfig.edgeIcing.style === 'ruffle' ? 'selected' : ''}>Ruffle Pattern</option>
            <option value="zigzag" ${layerConfig.edgeIcing.style === 'zigzag' ? 'selected' : ''}>Zigzag Pattern</option>
          </select>
        </div>
        <div class="mt-2">
          <label for="icing_tab_edge_color_${layerConfig.id}">Edge Color:</label>
          <input type="color" id="icing_tab_edge_color_${layerConfig.id}" value="${layerConfig.edgeIcing.color}">
        </div>
        <div class="mt-2">
          <label for="icing_tab_edge_thickness_${layerConfig.id}">Edge Detail/Thickness (${layerConfig.edgeIcing.thickness.toFixed(2)}):</label>
          <input type="range" id="icing_tab_edge_thickness_${layerConfig.id}" min="0.02" max="0.3" step="0.01" value="${layerConfig.edgeIcing.thickness}">
        </div>
      </div>
    </div>

    <div class="icing-section">
      <label class="checkbox-label">
        <input type="checkbox" id="icing_tab_middle_enabled_${layerConfig.id}" ${layerConfig.middleBandIcing.enabled ? 'checked' : ''}>
        Enable Middle Band Icing
      </label>
      <div id="${middleIcingSubControlsId}" class="sub-controls mt-2 ${layerConfig.middleBandIcing.enabled ? '' : 'hidden'}">
        <div class="mt-2">
          <label for="icing_tab_middle_color_${layerConfig.id}">Middle Color:</label>
          <input type="color" id="icing_tab_middle_color_${layerConfig.id}" value="${layerConfig.middleBandIcing.color}">
        </div>
        <div class="mt-2">
          <label for="icing_tab_middle_thickness_${layerConfig.id}">Middle Thickness (${layerConfig.middleBandIcing.thickness.toFixed(2)}):</label>
          <input type="range" id="icing_tab_middle_thickness_${layerConfig.id}" min="0.02" max="0.2" step="0.01" value="${layerConfig.middleBandIcing.thickness}">
        </div>
      </div>
    </div>

    <div class="icing-section">
      <label class="checkbox-label">
        <input type="checkbox" id="icing_tab_bottom_enabled_${layerConfig.id}" ${layerConfig.bottomIcing.enabled ? 'checked' : ''}>
        Enable Bottom Icing
      </label>
      <div id="${bottomIcingSubControlsId}" class="sub-controls mt-2 ${layerConfig.bottomIcing.enabled ? '' : 'hidden'}">
        <div class="mt-1">
          <label for="icing_tab_bottom_style_${layerConfig.id}">Bottom Style:</label>
          <select id="icing_tab_bottom_style_${layerConfig.id}">
            <option value="smooth" ${layerConfig.bottomIcing.style === 'smooth' ? 'selected' : ''}>Smooth Ring</option>
            <option value="curl" ${layerConfig.bottomIcing.style === 'curl' ? 'selected' : ''}>Curl Pattern</option>
            <option value="shell" ${layerConfig.bottomIcing.style === 'shell' ? 'selected' : ''}>Shell Pattern</option>
            <option value="rosette" ${layerConfig.bottomIcing.style === 'rosette' ? 'selected' : ''}>Rosette Pattern</option>
            <option value="ruffle" ${layerConfig.bottomIcing.style === 'ruffle' ? 'selected' : ''}>Ruffle Pattern</option>
            <option value="zigzag" ${layerConfig.bottomIcing.style === 'zigzag' ? 'selected' : ''}>Zigzag Pattern</option>
          </select>
        </div>
        <div class="mt-2">
          <label for="icing_tab_bottom_color_${layerConfig.id}">Bottom Color:</label>
          <input type="color" id="icing_tab_bottom_color_${layerConfig.id}" value="${layerConfig.bottomIcing.color}">
        </div>
        <div class="mt-2">
          <label for="icing_tab_bottom_thickness_${layerConfig.id}">Bottom Detail/Thickness (${layerConfig.bottomIcing.thickness.toFixed(2)}):</label>
          <input type="range" id="icing_tab_bottom_thickness_${layerConfig.id}" min="0.02" max="0.3" step="0.01" value="${layerConfig.bottomIcing.thickness}">
        </div>
      </div>
    </div>

    <div class="icing-section">
      <label class="checkbox-label">
        <input type="checkbox" id="icing_tab_surface_enabled_${layerConfig.id}" ${layerConfig.surfaceIcing?.enabled ? 'checked' : ''}>
        Enable Surface Icing
      </label>
      <div id="${surfaceIcingSubControlsId}" class="sub-controls mt-2 ${layerConfig.surfaceIcing?.enabled ? '' : 'hidden'}">
        <div class="mt-2">
          <label for="icing_tab_surface_color_${layerConfig.id}">Surface Color:</label>
          <input type="color" id="icing_tab_surface_color_${layerConfig.id}" value="${layerConfig.surfaceIcing?.color || '#FFFFFF'}">
        </div>
        <div class="mt-2">
          <label for="icing_tab_surface_thickness_${layerConfig.id}">Surface Thickness (${(layerConfig.surfaceIcing?.thickness || 0.02).toFixed(2)}):</label>
          <input type="range" id="icing_tab_surface_thickness_${layerConfig.id}" min="0.01" max="0.1" step="0.01" value="${layerConfig.surfaceIcing?.thickness || 0.02}">
        </div>
      </div>
    </div>

    <div class="icing-section">
      <label class="checkbox-label">
        <input type="checkbox" id="icing_tab_patterned_enabled_${layerConfig.id}" ${layerConfig.patternedTopIcing?.enabled ? 'checked' : ''}>
        Enable Patterned Top Icing
      </label>
      <div id="${patternedTopIcingSubControlsId}" class="sub-controls mt-2 ${layerConfig.patternedTopIcing?.enabled ? '' : 'hidden'}">
        <div class="mt-1">
          <label for="icing_tab_patterned_style_${layerConfig.id}">Pattern Style:</label>
          <select id="icing_tab_patterned_style_${layerConfig.id}">
            <option value="smooth" ${(layerConfig.patternedTopIcing?.style || 'smooth') === 'smooth' ? 'selected' : ''}>Smooth Ring</option>
            <option value="curl" ${layerConfig.patternedTopIcing?.style === 'curl' ? 'selected' : ''}>Curl Pattern</option>
            <option value="shell" ${layerConfig.patternedTopIcing?.style === 'shell' ? 'selected' : ''}>Shell Pattern</option>
            <option value="rosette" ${layerConfig.patternedTopIcing?.style === 'rosette' ? 'selected' : ''}>Rosette Pattern</option>
            <option value="ruffle" ${layerConfig.patternedTopIcing?.style === 'ruffle' ? 'selected' : ''}>Ruffle Pattern</option>
            <option value="zigzag" ${layerConfig.patternedTopIcing?.style === 'zigzag' ? 'selected' : ''}>Zigzag Pattern</option>
          </select>
        </div>
        <div class="mt-2">
          <label for="icing_tab_patterned_color_${layerConfig.id}">Pattern Color:</label>
          <input type="color" id="icing_tab_patterned_color_${layerConfig.id}" value="${layerConfig.patternedTopIcing?.color || '#FFC0CB'}">
        </div>
        <div class="mt-2">
          <label for="icing_tab_patterned_thickness_${layerConfig.id}">Pattern Thickness (${(layerConfig.patternedTopIcing?.thickness || 0.04).toFixed(2)}):</label>
          <input type="range" id="icing_tab_patterned_thickness_${layerConfig.id}" min="0.01" max="0.3" step="0.01" value="${layerConfig.patternedTopIcing?.thickness || 0.04}">
        </div>
        <div class="mt-2">
          <label for="icing_tab_patterned_position_${layerConfig.id}">Pattern Position:</label>
          <select id="icing_tab_patterned_position_${layerConfig.id}">
            <option value="inner" ${(layerConfig.patternedTopIcing?.position || 'inner') === 'inner' ? 'selected' : ''}>Inner</option>
            <option value="mid" ${layerConfig.patternedTopIcing?.position === 'mid' ? 'selected' : ''}>Middle</option>
            <option value="outer" ${layerConfig.patternedTopIcing?.position === 'outer' ? 'selected' : ''}>Outer</option>
          </select>
        </div>
      </div>
    </div>
  `;

  container.appendChild(icingControlsDiv);

  // Add event listeners for icing controls with the correct IDs
  const edgeIcingEnabledCheckbox = document.getElementById(`icing_tab_edge_enabled_${layerConfig.id}`);
  const edgeIcingSubControlsDiv = document.getElementById(edgeIcingSubControlsId);

  edgeIcingEnabledCheckbox.addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'edgeIcing.enabled', e.target.checked);
    edgeIcingSubControlsDiv.classList.toggle('hidden', !e.target.checked);
  });

  document.getElementById(`icing_tab_edge_style_${layerConfig.id}`).addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'edgeIcing.style', e.target.value);
  });

  document.getElementById(`icing_tab_edge_color_${layerConfig.id}`).addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'edgeIcing.color', e.target.value);
  });

  document.getElementById(`icing_tab_edge_thickness_${layerConfig.id}`).addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'edgeIcing.thickness', parseFloat(e.target.value));
  });

  const middleIcingEnabledCheckbox = document.getElementById(`icing_tab_middle_enabled_${layerConfig.id}`);
  const middleIcingSubControlsDiv = document.getElementById(middleIcingSubControlsId);

  middleIcingEnabledCheckbox.addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'middleBandIcing.enabled', e.target.checked);
    middleIcingSubControlsDiv.classList.toggle('hidden', !e.target.checked);
  });

  document.getElementById(`icing_tab_middle_color_${layerConfig.id}`).addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'middleBandIcing.color', e.target.value);
  });

  document.getElementById(`icing_tab_middle_thickness_${layerConfig.id}`).addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'middleBandIcing.thickness', parseFloat(e.target.value));
  });

  const bottomIcingEnabledCheckbox = document.getElementById(`icing_tab_bottom_enabled_${layerConfig.id}`);
  const bottomIcingSubControlsDiv = document.getElementById(bottomIcingSubControlsId);

  bottomIcingEnabledCheckbox.addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'bottomIcing.enabled', e.target.checked);
    bottomIcingSubControlsDiv.classList.toggle('hidden', !e.target.checked);
  });

  document.getElementById(`icing_tab_bottom_style_${layerConfig.id}`).addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'bottomIcing.style', e.target.value);
  });

  document.getElementById(`icing_tab_bottom_color_${layerConfig.id}`).addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'bottomIcing.color', e.target.value);
  });

  document.getElementById(`icing_tab_bottom_thickness_${layerConfig.id}`).addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'bottomIcing.thickness', parseFloat(e.target.value));
  });

  // Surface Icing event listeners
  const surfaceIcingEnabledCheckbox = document.getElementById(`icing_tab_surface_enabled_${layerConfig.id}`);
  const surfaceIcingSubControlsDiv = document.getElementById(surfaceIcingSubControlsId);

  surfaceIcingEnabledCheckbox.addEventListener('change', (e) => {
    console.log('Surface Icing enabled changed:', e.target.checked);
    updateLayerProperty(layerConfig.id, 'surfaceIcing.enabled', e.target.checked);
    surfaceIcingSubControlsDiv.classList.toggle('hidden', !e.target.checked);
  });

  document.getElementById(`icing_tab_surface_color_${layerConfig.id}`).addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'surfaceIcing.color', e.target.value);
  });

  document.getElementById(`icing_tab_surface_thickness_${layerConfig.id}`).addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'surfaceIcing.thickness', parseFloat(e.target.value));
  });

  // Patterned Top Icing event listeners
  const patternedTopIcingEnabledCheckbox = document.getElementById(`icing_tab_patterned_enabled_${layerConfig.id}`);
  const patternedTopIcingSubControlsDiv = document.getElementById(patternedTopIcingSubControlsId);

  patternedTopIcingEnabledCheckbox.addEventListener('change', (e) => {
    console.log('Patterned Top Icing enabled changed:', e.target.checked);
    updateLayerProperty(layerConfig.id, 'patternedTopIcing.enabled', e.target.checked);
    patternedTopIcingSubControlsDiv.classList.toggle('hidden', !e.target.checked);
  });

  document.getElementById(`icing_tab_patterned_style_${layerConfig.id}`).addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'patternedTopIcing.style', e.target.value);
  });

  document.getElementById(`icing_tab_patterned_color_${layerConfig.id}`).addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'patternedTopIcing.color', e.target.value);
  });

  document.getElementById(`icing_tab_patterned_thickness_${layerConfig.id}`).addEventListener('input', (e) => {
    updateLayerProperty(layerConfig.id, 'patternedTopIcing.thickness', parseFloat(e.target.value));
  });

  document.getElementById(`icing_tab_patterned_position_${layerConfig.id}`).addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'patternedTopIcing.position', e.target.value);
  });
};

const addToppingsControlsUI = (layerConfig, container) => {
  const toppingsControlsDiv = document.createElement('div');
  toppingsControlsDiv.className = 'control-group';

  // Get current toppings state
  const hasSprinkles = layerConfig.toppings.some(t => t.type === 'sprinkles');
  const hasCherries = layerConfig.toppings.some(t => t.type === 'cherries');
  const hasStrawberries = layerConfig.toppings.some(t => t.type === 'strawberries');
  const hasBlueberries = layerConfig.toppings.some(t => t.type === 'blueberries');

  toppingsControlsDiv.innerHTML = `
    <p class="layer-header">Layer ${cakeLayers.findIndex(l => l.id === layerConfig.id) + 1} Toppings</p>
    
    <div class="toppings-section">
      <p class="section-title">Add toppings to your cake layer:</p>
      
      <div class="topping-item">
        <label class="checkbox-label">
          <input type="checkbox" id="toppings_tab_sprinkles_${layerConfig.id}" ${hasSprinkles ? 'checked' : ''}>
          Sprinkles
        </label>
        <div class="sub-controls mt-2 ${hasSprinkles ? '' : 'hidden'}" id="sprinkles_controls_${layerConfig.id}">
          <p class="topping-description">Colorful sprinkles randomly distributed across the top of the cake</p>
        </div>
      </div>
      
      <div class="topping-item mt-3">
        <label class="checkbox-label">
          <input type="checkbox" id="toppings_tab_cherries_${layerConfig.id}" ${hasCherries ? 'checked' : ''}>
          Cherries
        </label>
        <div class="sub-controls mt-2 ${hasCherries ? '' : 'hidden'}" id="cherries_controls_${layerConfig.id}">
          <p class="topping-description">Red cherries with green stems placed on top of your cake</p>
        </div>
      </div>
      
      <div class="topping-item mt-3">
        <label class="checkbox-label">
          <input type="checkbox" id="toppings_tab_strawberries_${layerConfig.id}" ${hasStrawberries ? 'checked' : ''}>
          Strawberries
        </label>
        <div class="sub-controls mt-2 ${hasStrawberries ? '' : 'hidden'}" id="strawberries_controls_${layerConfig.id}">
          <p class="topping-description">Fresh strawberries arranged around the top of your cake</p>
          <div class="mt-3">
            <label class="form-label">Strawberry Position:</label>
            <div class="radio-group mt-2">
              <label class="radio-option">
                <input type="radio" name="strawberry_position_${layerConfig.id}" value="inner" ${(layerConfig.strawberryPosition || 'inner') === 'inner' ? 'checked' : ''}>
                <span class="radio-label">Inner</span>
                <small class="radio-description">Close to center</small>
              </label>
              <label class="radio-option">
                <input type="radio" name="strawberry_position_${layerConfig.id}" value="mid" ${layerConfig.strawberryPosition === 'mid' ? 'checked' : ''}>
                <span class="radio-label">Mid</span>
                <small class="radio-description">Middle area</small>
              </label>
              <label class="radio-option">
                <input type="radio" name="strawberry_position_${layerConfig.id}" value="outer" ${layerConfig.strawberryPosition === 'outer' ? 'checked' : ''}>
                <span class="radio-label">Outer</span>
                <small class="radio-description">Near edge</small>
              </label>
              <label class="radio-option">
                <input type="radio" name="strawberry_position_${layerConfig.id}" value="all" ${layerConfig.strawberryPosition === 'all' ? 'checked' : ''}>
                <span class="radio-label">All</span>
                <small class="radio-description">Full coverage</small>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div class="topping-item mt-3">
        <label class="checkbox-label">
          <input type="checkbox" id="toppings_tab_blueberries_${layerConfig.id}" ${hasBlueberries ? 'checked' : ''}>
          Blueberries
        </label>
        <div class="sub-controls mt-2 ${hasBlueberries ? '' : 'hidden'}" id="blueberries_controls_${layerConfig.id}">
          <p class="topping-description">Fresh blueberries scattered across the top of your cake</p>
        </div>
      </div>
      
      <div class="mt-4">
        <p class="hint-text">More toppings coming soon!</p>
      </div>
    </div>
  `;

  container.appendChild(toppingsControlsDiv);

  // Add event listeners for topping controls
  const sprinklesCheckbox = document.getElementById(`toppings_tab_sprinkles_${layerConfig.id}`);
  const sprinklesControls = document.getElementById(`sprinkles_controls_${layerConfig.id}`);

  sprinklesCheckbox.addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'toppings.sprinkles', e.target.checked);
    sprinklesControls.classList.toggle('hidden', !e.target.checked);
  });

  const cherriesCheckbox = document.getElementById(`toppings_tab_cherries_${layerConfig.id}`);
  const cherriesControls = document.getElementById(`cherries_controls_${layerConfig.id}`);

  cherriesCheckbox.addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'toppings.cherries', e.target.checked);
    cherriesControls.classList.toggle('hidden', !e.target.checked);
  });

  const strawberriesCheckbox = document.getElementById(`toppings_tab_strawberries_${layerConfig.id}`);
  const strawberriesControls = document.getElementById(`strawberries_controls_${layerConfig.id}`);

  strawberriesCheckbox.addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'toppings.strawberries', e.target.checked);
    strawberriesControls.classList.toggle('hidden', !e.target.checked);
  });

  // Add event listeners for strawberry position radio buttons
  const strawberryPositionRadios = document.querySelectorAll(`input[name="strawberry_position_${layerConfig.id}"]`);
  strawberryPositionRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      updateLayerProperty(layerConfig.id, 'strawberryPosition', e.target.value);
    });
  });

  const blueberriesCheckbox = document.getElementById(`toppings_tab_blueberries_${layerConfig.id}`);
  const blueberriesControls = document.getElementById(`blueberries_controls_${layerConfig.id}`);

  blueberriesCheckbox.addEventListener('change', (e) => {
    updateLayerProperty(layerConfig.id, 'toppings.blueberries', e.target.checked);
    blueberriesControls.classList.toggle('hidden', !e.target.checked);
  });
};

// Add to Cart related reactive variables
const showCartConfirmModal = ref(false);
const showSuccessModal = ref(false);
const lastOrderId = ref('');
const isLoading = ref(false);

// Special instructions for the order
const customerInfo = reactive({
  message: ''
});

// Import cart store
// import { useCartStore } from '@/stores/cartStore';
// import { toastController } from '@ionic/vue';
// const cartStore = useCartStore();

// No required fields in the form anymore, so it's always valid
const isFormValid = computed(() => {
  return true;
});

// Show the add to cart modal
const showAddToCartModal = () => {
  if (cakeLayers.length === 0) {
    alert('Please design your cake before adding to cart.');
    return;
  }

  if (!selectedSize.value) {
    alert('Please select a cake size before adding to cart.');
    return;
  }

  showCartConfirmModal.value = true;
};

// Add the cake to cart and save to Firebase
const addToCart = async () => {
  isLoading.value = true;

  try {
    // Create a rendered image of the cake as base64
    const cakeImageBase64 = renderer.domElement.toDataURL('image/png');

    // Create a deep copy of the cake design data
    const cakeDesignData = {
      cakeLayers: JSON.parse(JSON.stringify(cakeLayers)),
      layerIdCounter: layerIdCounter
    };

    // Verify the design data is valid
    if (!cakeDesignData.cakeLayers || cakeDesignData.cakeLayers.length === 0) {
      throw new Error('Cake design is incomplete. Please add at least one layer.');
    }

    console.log('Design data to be saved:', cakeDesignData);

    // Generate a consistent order ID to use in both cart and Firebase
    const orderId = 'custom-' + Date.now();
    lastOrderId.value = orderId; // Set the lastOrderId for display in success modal

    // Prepare the cake data
    const customCakeItem = {
      cakeId: orderId, // Use the consistent order ID
      orderId: orderId, // Store the order ID explicitly for reference
      name: 'Custom ' + (selectedFlavor.value ? selectedFlavor.value.name : '') + ' Cake',
      size: selectedSize.value ? selectedSize.value.name : '',
      quantity: 1,
      unitPrice: selectedSize.value ? selectedSize.value.price : 0,
      totalPrice: selectedSize.value ? selectedSize.value.price : 0,
      imageUrl: cakeImageBase64,
      isCustomCake: true,
      customDetails: {
        // Save design data exactly as the Save Design button does
        designData: cakeDesignData,
        // Still keep the other important info
        layers: selectedLayers.value,
        flavor: selectedFlavor.value ? JSON.parse(JSON.stringify(selectedFlavor.value)) : null,
        greeting: greetingConfig.enabled ? JSON.parse(JSON.stringify(greetingConfig)) : null,
        message: customerInfo.message.trim() || ''
      }
    };

    console.log('Adding custom cake to cart:', customCakeItem);

    // Add the custom cake to the cart
    await cartStore.addItem(customCakeItem);

    // Show success toast
    const toast = await toastController.create({
      message: 'Custom cake added to cart successfully!',
      duration: 2000,
      position: 'top',
      color: 'success'
    });
    await toast.present();

    // Hide the cart confirmation modal
    showCartConfirmModal.value = false;

    // Reset the customer info form
    Object.keys(customerInfo).forEach(key => {
      customerInfo[key] = '';
    });

    // Optional: also save to Firebase for admin reference
    try {
      const database = getDatabase();
      const ordersRef = dbRef(database, 'orders/custom');

      // Use the consistent order ID as the Firebase key instead of push()
      const newOrderRef = dbRef(ordersRef, orderId);

      await set(newOrderRef, {
        ...customCakeItem,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      console.log('Order also saved to Firebase with ID:', orderId);

      // Show success modal after successful Firebase save
      showSuccessModal.value = true;

    } catch (firebaseError) {
      console.error('Firebase save error:', firebaseError);
      // Show a warning toast but don't block the cart process
      const warningToast = await toastController.create({
        message: 'Order saved to cart but there was an issue with order tracking. Your order is still valid.',
        duration: 3000,
        position: 'top',
        color: 'warning'
      });
      await warningToast.present();
    }

  } catch (error) {
    console.error('Error adding to cart:', error);
    const toast = await toastController.create({
      message: 'Failed to add custom cake to cart. Please try again.',
      duration: 2000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  } finally {
    isLoading.value = false;
  }
};

// Finish the order process
const finishOrder = () => {
  showSuccessModal.value = false;
  router.push('/home');
};
</script>

<style scoped>
.customize-page {
  --background: linear-gradient(135deg, #FFF7D0 0%, #C8AD7E 100%);
}

#cakeCanvas {
  display: block;
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 0;
  cursor: pointer;
}

.controls-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.97);
  padding: 15px 15px 15px 15px;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.1);
  max-height: 50vh;
  overflow-y: auto;
  z-index: 10;
  transition: all 0.3s ease-in-out;
  box-sizing: border-box;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  white-space: nowrap;
  scrollbar-width: thin;
  scroll-behavior: smooth;
}

.tabs::-webkit-scrollbar {
  height: 0px;
}

.tabs::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 0px;
}

.tab-button {
  padding: 0.75rem 1.25rem;
  border: 1px solid #7A5C1E;
  border-radius: 8px;
  color: #333;
  background-color: #f8f9fa;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 0 0 auto;
  min-width: 120px;
  text-align: center;
}

.tab-button:hover {
  background-color: #e9ecef;
  color: #000;
  border-color: #7A5C1E;
}

.tab-button.active {
  background-color: #7A5C1E;
  color: #ffffff;
  border-color: #7A5C1E;
  font-weight: bold;
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
}



.action-button {
  display: block;
  width: 100%;
  padding: 8px;
  margin-bottom: 8px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-button:hover {
  background: #0056b3;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.sub-controls {
  padding-left: 20px;
  border-left: 2px solid #ddd;
}

.prompt {
  color: #666;
  font-style: italic;
  margin-bottom: 15px;
}

.layer-header {
  font-weight: bold;
  margin-bottom: 10px;
}

.remove-layer-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

.remove-layer-btn:hover {
  background: #c82333;
}

.toppings-group {
  margin-top: 5px;
}

.icing-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
}

input[type="range"] {
  width: 100%;
}

input[type="color"] {
  width: 50px;
  height: 25px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

select {
  width: 100%;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 4px;
}

.hidden {
  display: none;
}

/* Updated Modal Styles */
.selections-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding-top: 56px;
}

.modal-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  max-width: 100%;
  margin: 0;
  box-shadow: none;
  background: #ffffff;
  overflow-y: auto;
}

/* Progress Bar Styles */
.progress-container {
  padding: 1.5rem 0;
  margin-bottom: 1.5rem;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0 2rem;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}

.progress-step.active .step-number {
  background: #007bff;
  color: white;
  transform: scale(1.1);
}

.progress-step.completed .step-number {
  background: #28a745;
  color: white;
}

.step-label {
  font-size: 1rem;
  color: #666;
  text-align: center;
  font-weight: 500;
}

.progress-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  margin: 0 2rem;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Step Content Styles */
.step-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.selection-step {
  padding: 0 1rem;
}

.selection-step h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
  text-align: center;
  font-weight: 700;
}

.step-description {
  text-align: center;
  color: #666;
  margin-bottom: 2.5rem;
  font-size: 1.1rem;
  line-height: 1.5;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 0 1rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.option-button {
  padding: 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.option-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.option-icon {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.layer-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  width: 100%;
  height: 100%;
  justify-content: center;
}

.preview-layer {
  width: 60px;
  height: 20px;
  background: #ffb6c1;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.option-button:hover .preview-layer {
  transform: scale(1.05);
}

.option-button.selected .preview-layer {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.option-label {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-top: 0.5rem;
}

/* Mobile Responsive Adjustments */
@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 0 0.5rem;
  }

  .option-button {
    padding: 1rem;
    min-height: 200px;
  }

  .option-icon {
    width: 80px;
    height: 80px;
  }

  .preview-layer {
    width: 50px;
    height: 16px;
  }

  .option-label {
    font-size: 1rem;
  }
}

/* Small Mobile Adjustments */
@media (max-width: 480px) {
  .options-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .option-button {
    padding: 0.75rem;
    min-height: 180px;
  }

  .option-icon {
    width: 60px;
    height: 60px;
  }

  .preview-layer {
    width: 40px;
    height: 14px;
  }

  .option-label {
    font-size: 0.9rem;
  }
}

/* Navigation Buttons */
.modal-navigation {
  display: flex;
  justify-content: space-between;
  padding: 2rem;
  background: white;
  border-top: 1px solid #e0e0e0;
  position: sticky;
  bottom: 0;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
}

.nav-button {
  padding: 1.25rem 2.5rem;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  min-width: 200px;
  justify-content: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.nav-button.back {
  background: #f8f9fa;
  color: #666;
  border: 2px solid #e0e0e0;
}

.nav-button.next {
  background: #007bff;
  color: white;
  margin-left: auto;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
}

.nav-button.finish {
  background: #28a745;
  color: white;
  margin-left: auto;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
}

.nav-button:hover:not(:disabled) {
  opacity: 0.95;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.nav-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-icon,
.next-icon,
.finish-icon {
  font-size: 1.5rem;
  font-weight: bold;
}

/* Mobile Responsive Adjustments for Navigation */
@media (max-width: 768px) {
  .modal-navigation {
    padding: 1.5rem;
  }

  .nav-button {
    padding: 1rem 2rem;
    font-size: 1.1rem;
    min-width: 160px;
  }

  .back-icon,
  .next-icon,
  .finish-icon {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .modal-navigation {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .nav-button {
    width: 100%;
    padding: 1rem;
    font-size: 1rem;
    min-width: unset;
  }

  .nav-button.next,
  .nav-button.finish {
    margin-left: 0;
  }
}

/* Responsive Adjustments */
@media (max-width: 480px) {
  .options-grid {
    grid-template-columns: 1fr;
  }

  .option-button {
    padding: 0.75rem;
  }

  .option-icon {
    width: 60px;
    height: 60px;
  }

  .nav-button {
    padding: 0.75rem 1rem;
  }
}

ion-header {
  --background: #FFFFFF;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

ion-toolbar {
  --background: #7A5C1E;
  --border-width: 0;
  padding: 8px 16px;
}

.back-button {
  --color: #FFFFFF;
}

.customize-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 0.5px;
  padding-left: 32px;
}

.topper-section {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.topper-section select,
.topper-section input[type="text"] {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.topper-section input[type="file"] {
  width: 100%;
  margin-top: 5px;
}

.topper-section .sub-controls {
  padding: 10px;
  background-color: white;
  border-radius: 4px;
  margin-top: 10px;
}

/* Updated Size Selection Styles */
.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
}

.option-button {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.option-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.option-icon {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
  position: relative;
}

.size-preview {
  width: 100%;
  height: 100%;
  background: #ffb6c1;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.size-preview::after {
  content: '';
  position: absolute;
  width: 80%;
  height: 80%;
  border: 2px dashed #fff;
  border-radius: 50%;
}

.option-label {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.size-details {
  width: 100%;
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 8px;
  margin-top: 0.25rem;
}

.size-details div {
  text-align: center;
  margin: 0.15rem 0;
  color: #666;
  font-size: 0.8rem;
}

.size-details .price {
  font-weight: 600;
  color: #28a745;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.option-button:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.option-button.selected {
  border-color: #007bff;
  background: #e6f0ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Mobile Responsive Adjustments */
@media (max-width: 480px) {
  .options-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    padding: 0 0.25rem;
  }

  .option-button {
    padding: 0.5rem;
  }

  .option-icon {
    width: 60px;
    height: 60px;
  }

  .option-label {
    font-size: 0.9rem;
  }

  .size-details {
    padding: 0.35rem;
  }

  .size-details div {
    font-size: 0.75rem;
    margin: 0.1rem 0;
  }

  .size-details .price {
    font-size: 0.85rem;
  }

  .modal-content {
    padding: 0.5rem;
  }

  .selection-step {
    padding: 0;
  }

  .selection-step h2 {
    font-size: 1.1rem;
  }

  .step-description {
    font-size: 0.8rem;
    margin-bottom: 1rem;
  }
}

/* Tablet and Desktop Adjustments */
@media (min-width: 481px) {
  .options-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 0 1rem;
  }

  .option-button {
    padding: 1rem;
  }

  .option-icon {
    width: 80px;
    height: 80px;
  }

  .option-label {
    font-size: 1.1rem;
  }

  .size-details {
    padding: 0.75rem;
  }

  .size-details div {
    font-size: 0.9rem;
  }

  .size-details .price {
    font-size: 1rem;
  }
}

/* Progress Bar Mobile Adjustments */
@media (max-width: 480px) {
  .progress-steps {
    padding: 0 0.25rem;
  }

  .step-number {
    width: 24px;
    height: 24px;
    font-size: 0.8rem;
  }

  .step-label {
    font-size: 0.7rem;
  }

  .progress-bar {
    margin: 0 0.25rem;
  }
}

.greeting-control-group {
  margin-top: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.greeting-control-group label {
  font-weight: 500;
}

.greeting-control-group .sub-controls {
  margin-top: 10px;
  padding: 10px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #eee;
}

/* Flavor Selection Styles */
.flavor-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.flavor-preview {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.flavor-preview::after {
  content: '';
  position: absolute;
  width: 80%;
  height: 80%;
  border: 2px dashed #fff;
  border-radius: 50%;
}

.flavor-preview.chocolate {
  background: #4A2C2A;
}

.flavor-preview.ube {
  background: #8A2BE2;
}

.flavor-preview.vanilla {
  background: #F5F5DC;
}

.flavor-preview.mocha {
  background: #6F4E37;
}

.flavor-preview.strawberry {
  background: #FFB6C1;
}

.flavor-description {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.option-button:hover .flavor-preview {
  transform: scale(1.1);
}

.option-button.selected .flavor-preview {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Mobile Responsive Adjustments for Flavor Selection */
@media (max-width: 480px) {
  .flavor-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .flavor-description {
    font-size: 0.8rem;
    padding: 0.35rem;
  }
}

/* Topper Controls Styles */
.topper-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.topper-section label {
  display: block;
  margin-bottom: 0.5rem;
  color: #fff;
}

.topper-section input[type="text"] {
  width: 100%;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #fff;
}

.topper-section select {
  width: 100%;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #fff;
}

.topper-section input[type="file"] {
  width: 100%;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #fff;
}

/* Icing Controls Styles */
.icing-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.icing-section:last-child {
  margin-bottom: 0;
}

.icing-section label {
  display: block;
  margin-bottom: 0.5rem;
  color: #fff;
}

.icing-section select {
  width: 100%;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #fff;
}

.icing-section input[type="color"] {
  width: 100%;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: none;
}

.icing-section input[type="range"] {
  width: 100%;
  margin: 0.5rem 0;
}

/* Common Styles for Both */
.sub-controls {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sub-controls.hidden {
  display: none;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* Tab Styles */
.tab-button {
  padding: 0.75rem 1.25rem;
  border: 1px solid #7A5C1E;
  border-radius: 8px;
  color: #333;
  background-color: #f8f9fa;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 0 0 auto;
}

.tab-button:hover {
  background-color: #e9ecef;
  color: #000;
  border-color: #7A5C1E;
}

.tab-button.active {
  background-color: #7A5C1E;
  color: #ffffff;
  border-color: #7A5C1E;
  font-weight: bold;
}

.tab-content {
  display: none;
  padding: 1rem;
}

.tab-content.active {
  display: block;
}

/* Responsive Styles */
@media (max-width: 768px) {

  .topper-section,
  .icing-section {
    padding: 0.75rem;
  }

  .tab-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}

.toppings-section {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.section-title {
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
}

.topping-item {
  padding: 10px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #eee;
}

.topping-description {
  font-size: 0.9rem;
  color: #666;
  margin-top: 5px;
  font-style: italic;
}

.hint-text {
  font-size: 0.9rem;
  color: #999;
  text-align: center;
  font-style: italic;
}

/* Loading overlay styles */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  border: 5px solid #f3f3f3;
  border-top: 5px solid #7A5C1E;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error message styles */
.error-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  z-index: 1000;
}

.error-message p {
  color: #dc3545;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.back-button {
  background: #7A5C1E;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.back-button:hover {
  background: #5e4717;
}

/* Mobile-Friendly Layer Editor Styles */
.mobile-optimized {
  padding: 0;
  margin: 0;
}

.mobile-section-header {
  background-color: #7A5C1E;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.layer-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.layer-dimensions p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.mobile-control-item {
  background-color: white;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.mobile-label {
  display: block;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 12px;
  color: #333;
}

.value-display {
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
  margin-left: 6px;
}

.mobile-slider {
  width: 100%;
  height: 24px;
  margin: 8px 0;
  -webkit-appearance: none;
  appearance: none;
  background: #f0f0f0;
  border-radius: 12px;
  outline: none;
}

.mobile-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #7A5C1E;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.mobile-slider::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #7A5C1E;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #666;
  margin-top: 4px;
}

.color-picker-container {
  display: flex;
  align-items: center;
}

.mobile-color-picker {
  -webkit-appearance: none;
  appearance: none;
  width: 48px;
  height: 48px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: none;
  cursor: pointer;
}

.mobile-color-picker::-webkit-color-swatch {
  border-radius: 8px;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.mobile-color-picker::-moz-color-swatch {
  border-radius: 8px;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.color-value {
  margin-left: 12px;
  font-family: monospace;
  font-size: 1rem;
  background-color: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
}

.mobile-action-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.mobile-remove-btn {
  background-color: #ff4b5c;
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(255, 75, 92, 0.3);
  transition: all 0.2s ease;
}

.mobile-remove-btn:active {
  transform: translateY(2px);
  box-shadow: 0 1px 3px rgba(255, 75, 92, 0.3);
}

.btn-icon {
  margin-right: 8px;
  font-size: 1.1rem;
}

/* Mobile responsiveness adjustments */
@media (max-width: 480px) {
  .mobile-control-item {
    padding: 12px;
  }

  .mobile-label {
    font-size: 0.9rem;
  }

  .mobile-slider {
    height: 20px;
  }

  .mobile-slider::-webkit-slider-thumb,
  .mobile-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
  }
}

/* Confirmation Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.confirmation-modal {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-header {
  padding: 16px 20px;
  background-color: #7A5C1E;
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 0;
  color: #333;
  line-height: 1.5;
}

.modal-footer {
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #eee;
}

.cancel-btn {
  padding: 10px 16px;
  background-color: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background-color: #e5e5e5;
}

.confirm-btn {
  padding: 10px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.confirm-btn:hover {
  background-color: #c82333;
}

/* Add to Cart Button Styles */
.add-to-cart-btn {
  background-color: #28a745 !important;
  font-weight: 600;
  margin-top: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.add-to-cart-btn:hover {
  background-color: #218838 !important;
}

/* Cart Modal Styles */
.cart-info {
  margin-top: 20px;
}

.price-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.price-info h4 {
  color: #333;
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.price-info p {
  margin: 5px 0;
}

.contact-form {
  margin-top: 20px;
}

.contact-form h4 {
  color: #333;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  height: 80px;
  resize: vertical;
}

/* Success Modal Styles */
.success-modal {
  max-width: 450px;
}

.success-header {
  background-color: #28a745;
}

.success-icon {
  font-size: 60px;
  color: #28a745;
  text-align: center;
  margin: 20px 0;
}

.success-btn {
  background-color: #28a745;
}

.success-btn:hover {
  background-color: #218838;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .confirmation-modal {
    width: 95%;
    max-width: none;
  }

  .form-group input,
  .form-group textarea {
    font-size: 16px;
    /* Prevents zoom on mobile */
  }
}

/* Close button styles */
.close-button {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.8);
  transform: translateY(-2px);
}

.close-button:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .close-button {
    top: 10px;
    right: 10px;
    padding: 8px 12px;
  }
  
  .close-button span {
    display: none;
  }
}

/* Radio Button Styles for Topping Positions */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f9f9f9;
}

.radio-option:hover {
  background: #f0f0f0;
  border-color: #ccc;
}

.radio-option input[type="radio"] {
  margin: 0;
  accent-color: #7A5C1E;
}

.radio-option input[type="radio"]:checked {
  outline: 2px solid #7A5C1E;
  outline-offset: 1px;
}

.radio-option:has(input[type="radio"]:checked) {
  background: #f8f5f0;
  border-color: #7A5C1E;
  box-shadow: 0 0 0 1px #7A5C1E;
}

.radio-label {
  font-weight: 500;
  color: #333;
  flex: 1;
}

.radio-description {
  font-size: 0.85em;
  color: #666;
  font-style: italic;
}

.form-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: block;
}
</style>