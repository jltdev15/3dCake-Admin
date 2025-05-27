<template>

    
      <!-- Selections Modal -->
      <div class="selections-modal" v-if="false">
        <div class="modal-content">
          <!-- Progress Bar -->
          <div class="progress-container">
            <div class="progress-steps">
              <div v-for="step in 3" :key="step" :class="['progress-step', {
                'completed': currentStep > step,
                'active': currentStep === step
              }]">
                <div class="step-number">{{ step }}</div>
                <div class="step-label">
                  {{ step === 1 ? 'Layers' : step === 2 ? 'Size' : 'Flavor' }}
                </div>
              </div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${((currentStep - 1) / 2) * 100}%` }"></div>
            </div>
          </div>

          <!-- Step Content -->
          <div class="step-content">
            <!-- Step 1: Number of Layers -->
            <div class="selection-step" v-if="currentStep === 1">
              <h2>Choose Your Layers</h2>
              <p class="step-description">Select how many layers you'd like for your cake</p>
              <div class="options-grid">
                <button v-for="num in [1, 2, 3]" :key="num"
                  :class="['option-button', { selected: selectedLayers === num }]" @click="selectLayers(num)">
                  <div class="option-content">
                    <div class="option-icon">
                      <div class="layer-preview">
                        <div v-for="i in num" :key="i" class="preview-layer"></div>
                      </div>
                    </div>
                    <div class="option-label">{{ num }} Layer{{ num > 1 ? 's' : '' }}</div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Step 2: Cake Size -->
            <div class="selection-step" v-if="currentStep === 2">
              <h2>Select Size</h2>
              <p class="step-description">Choose the perfect size for your occasion</p>
              <div class="options-grid flavor-grid">
                <button v-for="size in sizeOptions" :key="size.name"
                  :class="['option-button', { selected: selectedSize && selectedSize.name === size.name }]"
                  @click="selectSize(size)">
                  <div class="option-content">
                    <div class="option-icon">
                      <div :class="['size-preview', size.name.toLowerCase().replace(' inch', '')]"></div>
                    </div>
                    <div class="option-label">{{ size.name }}</div>
                    <div class="size-details">
                      <div>Diameter: {{ size.diameter }} in</div>
                      <div>Height: {{ size.height }} in</div>
                      <div>{{ size.servings }} servings</div>
                      <div class="price">₱{{ size.price.toLocaleString() }}</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Step 3: Cake Flavor -->
            <div class="selection-step" v-if="currentStep === 3">
              <h2>Choose Your Flavor</h2>
              <p class="step-description">Select your favorite cake flavor</p>
              <div class="options-grid flavor-grid">
                <button v-for="flavor in flavorOptions" :key="flavor.name"
                  :class="['option-button', { selected: selectedFlavor && selectedFlavor.name === flavor.name }]"
                  @click="selectFlavor(flavor)">
                  <div class="option-content">
                    <div class="option-icon">
                      <div :class="['flavor-preview', flavor.name.toLowerCase()]"></div>
                    </div>
                    <div class="option-label">{{ flavor.name }}</div>
                    <div class="flavor-description">{{ flavor.description }}</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="modal-navigation">
            <button v-if="currentStep > 1" class="nav-button back" @click="previousStep">
              <span class="back-icon">←</span>
              Back
            </button>
            <button v-if="currentStep < 3" class="nav-button next" @click="nextStep" :disabled="!canProceed">
              Next
              <span class="next-icon">→</span>
            </button>
            <button v-if="currentStep === 3" class="nav-button finish" @click="finishSelection" :disabled="!canProceed">
              Create My Cake
              <span class="finish-icon">✓</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Reset Confirmation Modal -->
      <div class="modal-overlay" v-if="showResetConfirmModal">
        <div class="confirmation-modal">
          <div class="modal-header">
            <h3>Reset Design</h3>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to reset the cake design? This will remove all layers and reset all settings.</p>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" @click="showResetConfirmModal = false">Cancel</button>
            <button class="confirm-btn" @click="confirmReset">Reset Design</button>
          </div>
        </div>
      </div>

      <!-- Add to Cart Confirmation Modal -->
      <div class="modal-overlay" v-if="showCartConfirmModal">
        <div class="confirmation-modal">
          <div class="modal-header">
            <h3>Add to Cart</h3>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to add this cake design to your cart?</p>
            <div class="cart-info" v-if="selectedSize">
              <div class="price-info">
                <h4>Order Summary</h4>
                <p>Custom Cake: ₱{{ selectedSize.price.toLocaleString() }}</p>
                <p><strong>Total:</strong> ₱{{ selectedSize.price.toLocaleString() }}</p>
              </div>
              <div class="contact-form">
                <h4>Special Instructions</h4>
                <div class="form-group">
                  <label for="customerMessage">Add any special requests or instructions:</label>
                  <textarea id="customerMessage" v-model="customerInfo.message"
                    placeholder="Any special requests or delivery instructions"></textarea>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" @click="showCartConfirmModal = false">Cancel</button>
            <button class="confirm-btn" @click="addToCart" :disabled="!isFormValid">Add to Cart</button>
          </div>
        </div>
      </div>

      <!-- Success Modal -->
      <div class="modal-overlay" v-if="showSuccessModal">
        <div class="confirmation-modal success-modal">
          <div class="modal-header success-header">
            <h3>Order Placed!</h3>
          </div>
          <div class="modal-body">
            <div class="success-icon">✓</div>
            <p>Your custom cake design has been added to your cart and your order has been received!</p>
            <p>We'll contact you shortly to confirm your order details.</p>
            <p>Order ID: {{ lastOrderId }}</p>
          </div>
          <div class="modal-footer">
            <button class="confirm-btn success-btn" @click="finishOrder">Continue Shopping</button>
          </div>
        </div>
      </div>

      <div class="cake-customizer">
        <canvas id="cakeCanvas"></canvas>
        <div class="controls-panel">
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
import * as TextGeometryModule from 'three/examples/jsm/geometries/TextGeometry.js';
const TextGeometry = TextGeometryModule.TextGeometry;
import { getDatabase, ref as dbRef, push, set } from '../firebase/config';
import { useRouter } from 'vue-router';

const router = useRouter();

let scene, camera, renderer, cakeGroup, controls, cakeStand;
let cakeLayers = [];
let layerIdCounter = 0;
let clock = new THREE.Clock();
let needsCakeRender = false;

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
  }
};

// Move sizeOptions above selectedSize
const sizeOptions = [
  { name: '6 x 6', diameter: 6, height: 6, servings: '8-10', price: 999 },
  { name: '6 x 7', diameter: 6, height: 7, servings: '10-14', price: 1299 },
  { name: '6 x 8', diameter: 6, height: 8, servings: '12-16', price: 1649 },
  { name: '6 x 9', diameter: 6, height: 9, servings: '16-20', price: 1949 },
  { name: '6 x 10', diameter: 6, height: 10, servings: '20-25', price: 2399 }
];

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
  initScene();
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

  // Set initial camera position (closer to the scene)
  camera.position.set(0, 0, 20);
  camera.lookAt(0, 0, 0);

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

  cakeGroup = new THREE.Group();
  scene.add(cakeGroup);

  initTabs();
  document.getElementById('addLayerBtn').addEventListener('click', addNewLayerAndSelect);
  document.getElementById('saveCakeBtn').addEventListener('click', saveCakeConfiguration);
  document.getElementById('loadCakeInput').addEventListener('change', loadCakeConfiguration);
  document.getElementById('resetCakeBtn').addEventListener('click', resetCakeDesign);
  document.getElementById('undoBtn').addEventListener('click', undoLastAction);

  window.addEventListener('resize', onWindowResize, false);
  renderer.domElement.addEventListener('click', onCanvasClick, false);

  addNewLayerAndSelect();
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
  if (selectedLayerId) {
    const previousLayerMesh = cakeGroup.children.find(
      (child) => child.userData.layerId === selectedLayerId
    );
    if (previousLayerMesh && originalLayerMaterials.has(selectedLayerId)) {
      previousLayerMesh.material = originalLayerMaterials.get(selectedLayerId);
      originalLayerMaterials.delete(selectedLayerId);
    }
  }
  selectedLayerId = layerId;
  if (selectedLayerId) {
    const currentLayerMesh = cakeGroup.children.find(
      (child) => child.userData.layerId === selectedLayerId
    );
    if (currentLayerMesh) {
      if (!originalLayerMaterials.has(selectedLayerId)) {
        originalLayerMaterials.set(selectedLayerId, currentLayerMesh.material);
      }
      currentLayerMesh.material = currentLayerMesh.material.clone();
      currentLayerMesh.material.emissive.setHex(0x555555);
    }
  }
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
let loadedFont = null;
const fontLoader = new FontLoader();
fontLoader.load('https://cdn.jsdelivr.net/npm/three@0.164.1/examples/fonts/helvetiker_regular.typeface.json', (font) => {
  loadedFont = font;
  console.log('Font loaded:', loadedFont);
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

    let stickBaseY = topY; // Always start at cake top
    let stickTopY = stickBaseY + stickHeight; // Calculate the top of the stick

    // Calculate content position offsets based on stick height
    let textYOffset = 0.05; // Small offset from stick top
    let imageYOffset = 0.05;
    const imageHeight = 0.5; // Should match the image geometry height

    // Calculate topper base position
    let topperY = topY;
    if (topper.position === 'top') {
      topperY += 0.1; // Slightly above the layer
      stickBaseY = topperY;
      stickTopY = stickBaseY + stickHeight;
    } else if (topper.position === 'bottom') {
      topperY = bottomY - 0.1; // Slightly below the layer
      stickBaseY = topperY;
      stickTopY = stickBaseY + stickHeight;
    }

    // Add stick/support for the topper
    const stickGeometry = new THREE.CylinderGeometry(0.02, 0.02, stickHeight, 8);
    const stickMaterial = new THREE.MeshStandardMaterial({
      color: 0xCCCCCC,
      roughness: 0.7,
      metalness: 0.3
    });
    const stick = new THREE.Mesh(stickGeometry, stickMaterial);
    stick.position.set(0, stickBaseY + stickHeight / 2, 0); // Stick from cake top up to content
    topperGroup.add(stick);

    // Add a small base for the stick
    const baseGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0xCCCCCC,
      roughness: 0.7,
      metalness: 0.3
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(0, stickBaseY - 0.01, 0); // Position the base at the bottom of the stick
    topperGroup.add(base);

    // Only create topper text if font is loaded
    if ((topper.type === 'text' || topper.type === 'text_image')) {
      if (!loadedFont) {
        console.warn('Font not loaded yet, skipping topper text creation');
        return;
      }
      if (topper.text && topper.text.trim().length > 0) {
        const topperText = topper.text.trim();
        const sizeMultiplier = topper.size || 1;
        const textGeometry = new TextGeometry(topperText, {
          font: loadedFont,
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
        textMesh.position.set(0, stickTopY + textYOffset, 0); // Position above the stick
        topperGroup.add(textMesh);
        // If it's text with image, add the image below the text
        if (topper.type === 'text_image' && topper.image) {
          const textureLoader = new THREE.TextureLoader();
          textureLoader.load(topper.image, (texture) => {
            const sizeMultiplier = topper.size || 1;
            const imageGeometry = new THREE.PlaneGeometry(0.5 * sizeMultiplier, 0.5 * sizeMultiplier);
            const imageMaterial = new THREE.MeshStandardMaterial({
              map: texture,
              side: THREE.DoubleSide
            });
            const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);
            imageMesh.position.set(0, stickTopY + textYOffset - (0.3 * sizeMultiplier), 0); // Position below the text
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
          side: THREE.DoubleSide
        });
        const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);
        imageMesh.position.set(0, stickTopY + imageYOffset, 0); // Position above the stick
        topperGroup.add(imageMesh);
      });
    }

    // Add a small connector between stick and content
    const connectorGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8);
    const connectorMaterial = new THREE.MeshStandardMaterial({
      color: 0xCCCCCC,
      roughness: 0.7,
      metalness: 0.3
    });
    const connector = new THREE.Mesh(connectorGeometry, connectorMaterial);
    connector.position.set(0, stickTopY, 0); // Position connector at the top of the stick
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
      const strawberryCount = Math.max(1, Math.floor(layerRadius * 2.5));
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

      for (let i = 0; i < strawberryCount; i++) {
        const strawberry = new THREE.Group();

        // Create strawberry body (cone-like shape)
        const bodyGeo = new THREE.ConeGeometry(0.12, 0.25, 16);
        const body = new THREE.Mesh(bodyGeo, strawberryMaterial);
        body.rotation.x = Math.PI; // Flip upside down
        strawberry.add(body);

        // Add green top/leaves
        const leafGeo = new THREE.CylinderGeometry(0.1, 0.05, 0.05, 12);
        const leaves = new THREE.Mesh(leafGeo, stemMaterial);
        leaves.position.y = 0.125;
        strawberry.add(leaves);

        // Add seeds (small yellow dots)
        for (let s = 0; s < 10; s++) {
          const seedGeo = new THREE.SphereGeometry(0.01, 4, 4);
          const seed = new THREE.Mesh(seedGeo, seedMaterial);
          const seedAngle = Math.random() * Math.PI * 2;
          const seedHeight = Math.random() * 0.2 - 0.1;
          const seedRadius = 0.1 * Math.random() + 0.05;
          seed.position.set(
            Math.cos(seedAngle) * seedRadius,
            seedHeight,
            Math.sin(seedAngle) * seedRadius
          );
          strawberry.add(seed);
        }

        // Position the strawberry on the cake
        const strawberryRadius = 0.15;
        const availableRadius = layerRadius - (edgeIcing.enabled ? edgeIcing.thickness : 0) - strawberryRadius;

        // Use golden ratio for better distribution
        const goldenRatio = 0.618033988749895;
        const angle = (i * goldenRatio * Math.PI * 2) % (Math.PI * 2);

        // Place strawberries mostly around the edge
        let dist = availableRadius * (0.7 + Math.random() * 0.3);

        // If it's the first strawberry and there are only a few, place one in the center
        if (i === 0 && strawberryCount <= 5) {
          dist = availableRadius * 0.3 * Math.random();
        }

        strawberry.position.set(
          Math.cos(angle) * dist,
          topY + 0.1,
          Math.sin(angle) * dist
        );

        // Random rotation for variety
        strawberry.rotation.y = Math.random() * Math.PI * 2;
        strawberry.rotation.z = (Math.random() - 0.5) * 0.3;

        overallToppingGroup.add(strawberry);
      }
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

  if (!greetingConfig.enabled || !greetingConfig.text || !loadedFont) {
    return;
  }

  const greetingGroup = new THREE.Group();
  greetingGroup.name = "greetingGroup";

  const textGeometry = new TextGeometry(greetingConfig.text, {
    font: loadedFont,
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
      textMesh.geometry = new THREE.TextGeometry(greetingConfig.text, {
        font: loadedFont,
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
  const layersToRemove = cakeGroup.children.filter(child => child.userData.isCakeLayer);
  layersToRemove.forEach(child => {
    if (originalLayerMaterials.has(child.userData.layerId) && child.material !== originalLayerMaterials.get(child.userData.layerId)) {
      if (child.material.dispose) child.material.dispose();
    } else if (!originalLayerMaterials.has(child.userData.layerId) && child.material && child.material.dispose) {
      if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
      else child.material.dispose();
    }
    if (child.geometry && child.geometry.dispose) child.geometry.dispose();
    child.traverse(object => {
      if (object.isMesh) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) object.material.forEach(m => m.dispose());
          else object.material.dispose();
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
      if (layerConfig.id === selectedLayerId) {
        if (!originalLayerMaterials.has(selectedLayerId)) {
          originalLayerMaterials.set(selectedLayerId, layerMesh.material);
        }
        layerMesh.material = layerMesh.material.clone();
        layerMesh.material.emissive.setHex(0x555555);
      }
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

const loadCakeConfiguration = (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const loadedData = JSON.parse(e.target.result);
      if (loadedData.cakeLayers) {
        selectLayer(null);
        cakeLayers = [];

        cakeLayers = loadedData.cakeLayers.map(loadedLayer => {
          const defaultStructure = JSON.parse(JSON.stringify(defaultLayerSettings));
          const mergedLayer = {
            ...defaultStructure,
            ...loadedLayer
          };
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
          mergedLayer.toppings = loadedLayer.toppings || [];
          ['edgeIcing', 'middleBandIcing', 'bottomIcing'].forEach(icingType => {
            if (mergedLayer[icingType]) {
              if (!mergedLayer[icingType].hasOwnProperty('isAnimating')) {
                mergedLayer[icingType].isAnimating = defaultStructure[icingType].isAnimating;
              }
              if (!mergedLayer[icingType].hasOwnProperty('animationProgress')) {
                mergedLayer[icingType].animationProgress = defaultStructure[icingType].animationProgress;
              }
              if (!mergedLayer[icingType].hasOwnProperty('animationSpeed')) {
                mergedLayer[icingType].animationSpeed = defaultStructure[icingType].animationSpeed;
              }
            }
          });
          return mergedLayer;
        });

        layerIdCounter = loadedData.layerIdCounter || cakeLayers.length;

        renderCake();

        if (cakeLayers.length > 0) {
          selectLayer(cakeLayers[0].id);
          const layerEditorTabButton = document.querySelector('.tab-button[data-tab="tab-layer-editor"]');
          if (layerEditorTabButton) layerEditorTabButton.click();
        } else {
          updateControlsForSelectedLayer();
          const designTabButton = document.querySelector('.tab-button[data-tab="tab-design"]');
          if (designTabButton) designTabButton.click();
        }
        console.log("Cake configuration loaded.");
      } else {
        alert("Invalid cake configuration file.");
      }
    } catch (error) {
      console.error("Error loading cake configuration:", error);
      alert("Error loading cake configuration: " + error.message);
    }
  };
  reader.readAsText(file);
  event.target.value = null;
};

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

  // Calculate base dimensions based on size
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

  // Update cake stand size based on selected size
  if (cakeStand) {
    scene.remove(cakeStand);
    cakeStand = createCakeStand(selectedSizeObj.diameter);
    cakeStand.position.y = 0;
    scene.add(cakeStand);
  }

  // Adjust camera position based on cake size
  const cameraDistance = Math.max(selectedSizeObj.diameter, selectedSizeObj.height) * 2.5;
  camera.position.set(cameraDistance, cameraDistance * 0.5, cameraDistance);
  camera.lookAt(0, 0, 0);

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
</style>