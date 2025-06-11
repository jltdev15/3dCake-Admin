<template>
  <ion-page class="customize-page">
    <ion-header class="ion-no-border">
      <ion-toolbar class="toolbar-custom">
        <!-- Modern Redesigned Toolbar -->
        <div class="relative bg-gradient-to-r from-[#F0E68D] via-[#E6D77A] to-[#DCC867] text-gray-800 shadow-xl">
          <!-- Background Pattern Overlay -->
          <div class="absolute inset-0 bg-black/5 opacity-20"></div>
          <div class="absolute inset-0 bg-gradient-to-br from-transparent via-black/5 to-transparent"></div>

          <!-- Main Content -->
          <div class="relative px-4 py-3 sm:px-6 sm:py-4">
            <div class="flex items-center justify-between">
              <!-- Left Side - Back Button -->
              <div class="flex items-center">
                <button @click="handleBackButton($event)"
                  class="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-black/10 backdrop-blur-sm rounded-xl border border-black/20 hover:bg-black/20 active:scale-95 transition-all duration-200 touch-manipulation">
                  <ion-icon :icon="icons.chevronBackOutline"
                    class="text-lg sm:text-xl text-gray-800 drop-shadow-sm group-hover:scale-110 transition-transform duration-200"></ion-icon>
                </button>
              </div>

              <!-- Center - Title Section -->
              <div class="flex-1 text-center mx-4">
                <div class="flex items-center justify-center space-x-2 sm:space-x-3">
                  <!-- Title Text -->
                  <div class="text-center">
                    <h1 class="text-lg sm:text-xl font-bold tracking-wide drop-shadow-sm text-gray-800">
                      Customize Cake
                    </h1>
                    <p class="text-xs sm:text-sm opacity-70 font-medium tracking-wide mt-0.5 text-gray-700">
                      Design your perfect cake
                    </p>
                  </div>
                </div>
              </div>

              <!-- Right Side - Action Buttons -->
              <div class="flex items-center space-x-2">
                <!-- Cart Button -->
                <button v-if="areFlavorsCompleted" @click="showAddToCartModal"
                  class="group relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-black/10 backdrop-blur-sm rounded-xl border border-black/20 hover:bg-black/20 active:scale-95 transition-all duration-200 touch-manipulation overflow-hidden">
                  <!-- Button Background Effect -->
                  <div
                    class="absolute inset-0 bg-gradient-to-r from-[#F0E68D]/30 to-[#DCC867]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  </div>

                  <!-- Cart Icon -->
                  <ion-icon :icon="icons.cartOutline"
                    class="relative text-lg sm:text-xl text-gray-800 drop-shadow-sm group-hover:scale-110 transition-transform duration-200"></ion-icon>
                </button>

                <!-- Menu/Options Button (Optional - for future features) -->
                <button v-if="false"
                  class="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-black/10 backdrop-blur-sm rounded-xl border border-black/20 hover:bg-black/20 active:scale-95 transition-all duration-200 touch-manipulation">
                  <ion-icon :icon="icons.ellipsisVerticalOutline"
                    class="text-lg sm:text-xl text-gray-800 drop-shadow-sm group-hover:scale-110 transition-transform duration-200"></ion-icon>
                </button>
              </div>
            </div>

            <!-- Progress Indicator (when in design mode) -->
            <div v-if="!showSelectionsModal && cakeLayers.length > 0" class="mt-3 pt-3 border-t border-black/20">
              <div class="flex items-center justify-between text-xs sm:text-sm">
                <div class="flex items-center space-x-2 text-gray-700/80">
                  <ion-icon :icon="icons.layersOutline" class="text-sm"></ion-icon>
                  <span>{{ cakeLayers.length }} Layer{{
                    cakeLayers.length !== 1 ? "s" : ""
                  }}</span>
                </div>
                <div class="flex items-center space-x-2 text-gray-700/80">
                  <ion-icon :icon="icons.resizeOutline" class="text-sm"></ion-icon>
                  <span>{{ selectedSize?.name || "No size" }}</span>
                </div>
                <div class="flex items-center space-x-2 text-gray-700/80">
                  <ion-icon :icon="icons.restaurantOutline" class="text-sm"></ion-icon>
                  <span v-if="selectedLayers === 1">
                    {{ selectedFlavor?.name || "No flavor" }}
                  </span>
                  <span v-else>
                    {{ Object.keys(selectedLayerFlavors).length }}/{{ selectedLayers }}
                    flavors
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Selections Modal -->
      <div class="selections-modal" v-if="showSelectionsModal">
        <div class="modal-content">
          <!-- Progress Bar -->
          <div class="progress-container">
            <div class="progress-steps">
              <div v-for="step in 3" :key="step" :class="[
                'progress-step',
                {
                  completed: currentStep > step,
                  active: currentStep === step,
                },
              ]">
                <div class="step-number">{{ step }}</div>
                <div class="step-label">
                  {{
                    step === 1
                      ? "Layers"
                      : step === 2
                        ? "Size"
                        : selectedLayers === 1
                          ? "Flavor"
                          : "Flavors"
                  }}
                </div>
              </div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${getProgressPercentage}%` }"></div>
            </div>
          </div>

          <!-- Step Content -->
          <div class="step-content">
            <!-- Step 1: Number of Layers -->
            <div class="selection-step" v-if="currentStep === 1">
              <div class="step-header">
                <h2 class="step-title">Choose Layers</h2>
                <p class="step-description">How many layers would you like?</p>
              </div>

              <div class="layers-container">
                <button v-for="num in [1, 2, 3]" :key="num"
                  :class="['layer-option', { selected: selectedLayers === num }]" @click="selectLayers(num)">
                  <div class="layer-preview">
                    <div v-for="i in num" :key="i" class="preview-layer" :style="{
                      background: i === 1 ? '#F0E68D' : i === 2 ? '#E6D77A' : '#DCC867',
                      transform: `translateY(${(num - i) * 12}px)`,
                      'z-index': i,
                    }"></div>
                  </div>
                  <div class="layer-info">
                    <div class="layer-main-info">
                      <span class="layer-name">{{ num }} Layer<span v-if="num > 1">s</span></span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Step 2: Cake Size -->
            <div class="selection-step mb-24" v-if="currentStep === 2">
              <div class="">
                <h2 class="step-title">Select Size</h2>
                <p class="step-description">Choose your preferred cake size</p>
              </div>

              <div class="size-options grid grid-cols-2 gap-4">
                <button v-for="size in sizeOptions" :key="size.name" :class="[
                  'size-option',
                  { selected: selectedSize && selectedSize.name === size.name },
                ]" @click="selectSize(size)">
                  <div class="">
                    <div class="size-visual">
                      <div class="cake-circle" :style="{
                        width:
                          (Array.isArray(size.diameter)
                            ? Math.max(...size.diameter.map((d) => d.diameter))
                            : size.diameter) *
                          10 +
                          'px',
                        height:
                          (Array.isArray(size.diameter)
                            ? Math.max(...size.diameter.map((d) => d.diameter))
                            : size.diameter) *
                          10 +
                          'px',
                      }">
                        <span class="size-label">{{
                          Array.isArray(size.diameter)
                            ? Math.max(...size.diameter.map((d) => d.diameter))
                            : size.diameter
                        }}"</span>
                      </div>
                    </div>
                    <div class="size-details">
                      <span class="size-name">{{ size.name }}</span>
                      <span class="size-price">₱{{ size.price.toFixed(2) }}</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Step 3: Cake Flavor -->
            <div class="selection-step mb-24" v-if="currentStep === 3">
              <div class="step-header">
                <h2 class="step-title">
                  Choose Your Flavor{{ selectedLayers > 1 ? "s" : "" }}
                </h2>
                <p class="step-description">
                  {{
                    selectedLayers === 1
                      ? "Select your favorite cake flavor"
                      : `Select flavors for each of your
                  ${selectedLayers} layers`
                  }}
                </p>
                <!-- Progress indicator for multi-layer -->
                <div v-if="selectedLayers > 1"
                  class="my-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-blue-800">Flavor Selection Progress</span>
                    <span class="text-sm font-bold text-blue-600">
                      {{ Object.keys(selectedLayerFlavors).length }} /
                      {{ selectedLayers }} completed
                    </span>
                  </div>
                  <div class="bg-blue-200 rounded-full h-2">
                    <div
                      class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      :style="{
                        width: `${(Object.keys(selectedLayerFlavors).length / selectedLayers) *
                          100
                          }%`,
                      }"></div>
                  </div>
                </div>
              </div>

              <!-- Single Layer Flavor Selection -->
              <div v-if="selectedLayers === 1" class="options-grid flavor-grid">
                <button v-for="flavor in flavorOptions" :key="flavor.name" :class="[
                  'option-button',
                  { selected: selectedFlavor && selectedFlavor.name === flavor.name },
                ]" @click="selectFlavor(flavor)">
                  <div class="option-content">
                    <div class="option-icon">
                      <div :class="['flavor-preview', flavor.name.toLowerCase()]"></div>
                    </div>
                    <div class="option-label">{{ flavor.name }}</div>
                    <div class="flavor-description">{{ flavor.description }}</div>
                  </div>
                </button>
              </div>

              <!-- Multi-Layer Flavor Selection (One at a time) -->
              <div v-else class="space-y-6 mb-24">
                <!-- Current Layer Selection -->
                <div
                  class="bg-white rounded-2xl shadow-xl border-2 border-[#F0E68D] overflow-hidden transform transition-all duration-500">
                  <!-- Layer Header -->
                  <div class="bg-gradient-to-r from-[#F0E68D] via-[#E6D77A] to-[#DCC867] text-gray-800 p-3">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-4">
                        <div class="bg-black/10 backdrop-blur-sm rounded-full p-3">
                          <ion-icon :icon="icons.layersOutline" class="text-2xl"></ion-icon>
                        </div>
                        <div>
                          <h3 class="text-2xl font-bold">
                            Layer {{ currentLayerIndex }}
                          </h3>
                          <p class="text-lg opacity-80">
                            {{
                              currentLayerIndex === 1
                                ? "Top Layer"
                                : currentLayerIndex === selectedLayers
                                  ? "Bottom Layer"
                                  : "Middle Layer"
                            }}
                          </p>
                        </div>
                      </div>
                      <!-- Layer Progress Badge -->
                      <div class="bg-black/10 backdrop-blur-sm rounded-full px-4 py-2">
                        <span class="text-lg font-bold">{{ currentLayerIndex }} / {{ selectedLayers }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Flavor Options for Current Layer -->
                  <div class="p-2">
                    <div class="mb-4 text-center">
                      <p class="text-gray-600 text-lg">Choose a flavor for this layer</p>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button v-for="flavor in flavorOptions" :key="`${currentLayerIndex}-${flavor.name}`" :class="[
                        'relative p-4 rounded-2xl border-3 transition-all duration-300 touch-manipulation group',
                        selectedLayerFlavors[currentLayerIndex] &&
                          selectedLayerFlavors[currentLayerIndex].name === flavor.name
                          ? 'border-[#F0E68D] bg-gradient-to-br from-[#F0E68D]/30 to-[#DCC867]/30 shadow-xl transform scale-105 ring-4 ring-[#F0E68D]/20'
                          : 'border-gray-200 bg-white hover:border-[#F0E68D]/70 hover:shadow-lg hover:scale-102 active:scale-98',
                      ]" @click="selectLayerFlavor(currentLayerIndex, flavor)">
                        <!-- Flavor Content -->
                        <div class="flex items-center gap-3 space-x-4">
                          <div :class="[
                            'flavor-preview-medium flex-shrink-0',
                            flavor.name.toLowerCase(),
                          ]"></div>
                          <div class="flex-1 text-left">
                            <div class="text-lg font-bold text-gray-800 group-hover:text-[#58091F] transition-colors">
                              {{ flavor.name }}
                            </div>
                            <div class="text-sm text-gray-600 mt-1 leading-relaxed">
                              {{ flavor.description }}
                            </div>
                          </div>
                        </div>

                        <!-- Selection Checkmark -->
                        <div v-if="
                          selectedLayerFlavors[currentLayerIndex] &&
                          selectedLayerFlavors[currentLayerIndex].name === flavor.name
                        " class="absolute top-3 right-3 bg-[#F0E68D] text-gray-800 rounded-full p-2 shadow-lg">
                          <ion-icon :icon="icons.checkmarkOutline" class="text-lg"></ion-icon>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Layer Navigation -->
                <div v-if="currentLayerIndex > 1" class="flex justify-center">
                  <button @click="currentLayerIndex = currentLayerIndex - 1"
                    class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95">
                    <ion-icon :icon="icons.chevronBackOutline" class="text-lg"></ion-icon>
                    Back to Layer {{ currentLayerIndex - 1 }}
                  </button>
                </div>

                <!-- Completed Layers Summary -->
                <div v-if="Object.keys(selectedLayerFlavors).length > 0"
                  class="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                      <div class="bg-green-500 text-white rounded-full p-2">
                        <ion-icon :icon="icons.checkmarkCircleOutline" class="text-lg"></ion-icon>
                      </div>
                      <span class="text-green-800 font-bold text-lg">Completed Layers</span>
                    </div>
                    <span class="text-green-600 font-bold text-xl">
                      {{ Object.keys(selectedLayerFlavors).length }} /
                      {{ selectedLayers }}
                    </span>
                  </div>

                  <!-- List of completed layers -->
                  <div class="space-y-2">
                    <div v-for="(flavor, layerNum) in selectedLayerFlavors" :key="layerNum"
                      class="flex items-center justify-between bg-white rounded-lg p-3 border border-green-100">
                      <div class="flex items-center space-x-3">
                        <div class="bg-green-100 text-green-700 rounded-full px-3 py-1 text-sm font-medium">
                          Layer {{ layerNum }}
                        </div>
                        <div :class="['flavor-preview-small', flavor.name.toLowerCase()]"></div>
                        <span class="font-medium text-gray-800">{{ flavor.name }}</span>
                      </div>
                      <button @click="currentLayerIndex = parseInt(layerNum)"
                        class="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
                        Edit
                      </button>
                    </div>
                  </div>

                  <!-- Overall Progress Bar -->
                  <div class="mt-4 bg-green-200 rounded-full h-3">
                    <div
                      class="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                      :style="{
                        width: `${(Object.keys(selectedLayerFlavors).length / selectedLayers) *
                          100
                          }%`,
                      }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="navigation-container" :class="{ 'justify-end': currentStep === 1 }">
            <button v-if="currentStep > 1"
              class="flex-1 flex items-center justify-center gap-1 md:gap-2 px-4 py-3 md:px-6 md:py-3 bg-transparent text-[#58091F] border-2 border-[#58091F] font-bold text-sm md:text-base uppercase tracking-wide rounded-xl md:rounded-xl min-h-[48px] md:min-h-[48px] hover:bg-[#58091F]/5 active:scale-95 transition-all duration-200 touch-manipulation"
              @click="previousStep">
              <span class="back-icon">←</span>
              Back
            </button>
            <button v-if="currentStep < 3" :class="{
              'bg-gradient-to-r from-[#58091F] to-[#7A0C29]': canProceed,
              'bg-gray-300': !canProceed,
            }"
              class="flex-1 flex items-center justify-center gap-2 px-6 py-4 md:py-3 text-white font-bold text-lg md:text-base uppercase tracking-wide rounded-2xl md:rounded-xl min-h-[56px] md:min-h-[48px] shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation animate-slideInUp primary-button"
              @click="nextStep" :disabled="!canProceed">
              Next
              <span class="next-icon">→</span>
            </button>
            <button v-if="currentStep === 3" :class="{
              'bg-gradient-to-r from-[#58091F] to-[#7A0C29]': canProceed,
              'bg-gray-300': !canProceed,
            }"
              class="flex-1 flex items-center justify-center gap-2 px-6 py-4 md:py-3 text-white font-bold text-lg md:text-base uppercase tracking-wide rounded-2xl md:rounded-xl min-h-[56px] md:min-h-[48px] shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation animate-slideInUp primary-button"
              @click="finishSelection" :disabled="!canProceed">
              3D Cake
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
            <p>
              Are you sure you want to reset the cake design? This will remove all layers
              and reset all settings.
            </p>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" @click="showResetConfirmModal = false">
              Cancel
            </button>
            <button class="confirm-btn" @click="confirmReset">Reset Design</button>
          </div>
        </div>
      </div>

      <!-- Back Button Confirmation Modal - Enhanced with Animations -->
      <div v-if="showBackConfirmModal" @click.self="closeBackModal" :class="[
        'fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-0 md:p-4',
        isBackModalClosing ? 'back-modal-overlay-closing' : 'back-modal-overlay',
      ]">
        <div :class="[
          'w-full max-w-none md:max-w-md bg-white rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl',
          isBackModalClosing ? 'back-modal-content-closing' : 'back-modal-content',
        ]">
          <!-- Header -->
          <div class="px-6 py-8 md:py-6 bg-gradient-to-br from-[#58091F] to-[#7A0C29] text-white text-center relative">
            <div class="text-5xl md:text-4xl mb-4 md:mb-3 drop-shadow-md warning-icon">
              ⚠️
            </div>
            <h3 class="text-2xl md:text-xl font-bold mb-2 tracking-tight animate-slideInUp">
              Leave Page?
            </h3>
            <p class="text-base md:text-sm opacity-90 font-normal animate-slideInUp" style="animation-delay: 0.1s">
              Your cake design will be lost
            </p>
          </div>

          <!-- Body -->
          <div class="px-6 py-6 bg-gray-50">
            <p class="text-gray-700 text-center text-lg md:text-base leading-relaxed animate-slideInUp"
              style="animation-delay: 0.2s">
              Are you sure you want to leave the customization? All your current
              selections and progress will be lost.
            </p>
          </div>

          <!-- Footer -->
          <div
            class="px-6 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] md:pb-5 bg-white flex gap-3 md:gap-4">
            <!-- Secondary Button (Leave) -->
            <button @click="confirmBack"
              class="flex-1 flex items-center justify-center gap-2 px-6 py-4 md:py-3 bg-transparent text-[#58091F] border-2 border-[#58091F] font-bold text-lg md:text-base uppercase tracking-wide rounded-2xl md:rounded-xl min-h-[56px] md:min-h-[48px] hover:bg-[#58091F]/5 transition-all duration-200 touch-manipulation animate-slideInUp secondary-button"
              style="animation-delay: 0.4s">
              <span class="text-xl animate-pulse-gentle">←</span>
              Leave Page
            </button>
            <!-- Primary Button (Keep Designing) -->
            <button @click="closeBackModal"
              class="flex-1 flex items-center justify-center gap-2 px-6 py-4 md:py-3 bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white font-bold text-lg md:text-base uppercase tracking-wide rounded-2xl md:rounded-xl min-h-[56px] md:min-h-[48px] shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation animate-slideInUp primary-button"
              style="animation-delay: 0.3s">
              Keep Designing
            </button>
          </div>
        </div>
      </div>

      <!-- Add to Cart Confirmation Modal - Enhanced with Animations -->
      <div v-if="showCartConfirmModal" @click.self="closeCartModal" :class="[
        'fixed inset-0 z-[9999] flex items-end md:items-center justify-center md:p-4',
        isCartModalClosing ? 'cart-modal-overlay-closing' : 'cart-modal-overlay',
      ]">
        <div :class="[
          'w-full max-w-none md:max-w-2xl bg-white rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl max-h-[100vh] overflow-y-auto',
          isCartModalClosing ? 'cart-modal-content-closing' : 'cart-modal-content',
        ]">
          <!-- Header -->
          <div
            class="px-2 py-2 md:px-6 md:py-6 bg-gradient-to-br from-[#58091F] to-[#7A0C29] text-white text-center relative">
            <h3 class="text-lg md:text-xl font-bold mb-1 md:mb-2 tracking-tight">
              Add to Cart
            </h3>
            <p class="text-sm md:text-sm opacity-90 font-normal">
              Review your custom cake design
            </p>
          </div>

          <!-- Body -->
          <div class="px-4 py-3 md:px-6 md:py-6 bg-gray-50 space-y-3 md:space-y-6">
            <p class="text-gray-700 text-center text-sm md:text-base leading-relaxed">
              Are you sure you want to add this cake design to your cart?
            </p>

            <!-- Order Summary Card -->
            <div v-if="selectedSize"
              class="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <!-- <div class="bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white p-2 md:p-4 text-center">
                 <h4 class="text-sm md:text-lg font-bold flex items-center justify-center gap-1 md:gap-2">
                   <ion-icon :icon="icons.clipboardOutline" class="text-sm md:text-xl"></ion-icon>
                   Order Summary
                 </h4>
              </div> -->

              <div class="p-3 md:p-6 space-y-2 md:space-y-4">
                <p>Order Summary</p>
                <!-- Order Details Grid -->
                <div class="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-4">
                  <div class="bg-gray-50 rounded-lg md:rounded-xl p-2 md:p-4">
                    <div class="flex items-center gap-2 md:gap-3">
                      <div class="bg-[#58091F] text-white rounded-full p-1 md:p-2">
                        <ion-icon :icon="icons.resizeOutline" class="text-sm md:text-lg"></ion-icon>
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="text-xs md:text-sm font-medium text-gray-500">
                          Size
                        </div>
                        <div class="text-sm md:text-lg font-bold text-gray-800 truncate">
                          {{ selectedSize.name }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="bg-gray-50 rounded-lg md:rounded-xl p-2 md:p-4">
                    <div class="flex items-center gap-2 md:gap-3">
                      <div class="bg-[#58091F] text-white rounded-full p-1 md:p-2">
                        <ion-icon :icon="icons.layersOutline" class="text-sm md:text-lg"></ion-icon>
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="text-xs md:text-sm font-medium text-gray-500">
                          Layers
                        </div>
                        <div class="text-sm md:text-lg font-bold text-gray-800">
                          {{ selectedLayers }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="bg-gray-50 rounded-lg md:rounded-xl p-2 md:p-4 col-span-2 md:col-span-1">
                    <div class="flex items-start gap-2 md:gap-3">
                      <div class="bg-[#58091F] text-white rounded-full p-1 md:p-2 mt-0.5">
                        <ion-icon :icon="icons.restaurantOutline" class="text-sm md:text-lg"></ion-icon>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="text-xs md:text-sm font-medium text-gray-500">
                          Flavor{{ selectedLayers > 1 ? "s" : "" }}
                        </div>
                        <!-- Single Layer Flavor -->
                        <div v-if="selectedLayers === 1" class="text-sm md:text-lg font-bold text-gray-800 truncate">
                          {{ selectedFlavor ? selectedFlavor.name : "None" }}
                        </div>
                        <!-- Multi-Layer Flavors -->
                        <div v-else class="space-y-0.5 md:space-y-1">
                          <div v-for="layerNum in selectedLayers" :key="layerNum" class="text-xs md:text-sm">
                            <span class="font-medium text-gray-600">L{{ layerNum }}:</span>
                            <span class="font-bold text-gray-800 ml-1 truncate">
                              {{
                                selectedLayerFlavors[layerNum]
                                  ? selectedLayerFlavors[layerNum].name
                                  : "Not selected"
                              }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Toppings Summary -->
                  <div v-if="selectedToppingsSummary.length > 0"
                    class="col-span-2 bg-gray-50 rounded-lg md:rounded-xl p-2 md:p-4">
                    <div class="flex items-start gap-2 md:gap-3">
                      <div class="bg-[#58091F] text-white rounded-full p-1 md:p-2 mt-0.5">
                        <ion-icon :icon="icons.sparklesOutline" class="text-sm md:text-lg"></ion-icon>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="text-xs md:text-sm font-medium text-gray-500">
                          Toppings
                        </div>
                        <div class="space-y-0.5 md:space-y-1 mt-1">
                          <div v-for="topping in selectedToppingsSummary" :key="topping.name"
                            class="text-xs md:text-sm flex justify-between items-center">
                            <span class="font-medium text-gray-700">
                              {{ topping.name }}
                              <span v-if="topping.count > 1">(x{{ topping.count }})</span>
                            </span>
                            <span class="font-bold text-gray-800 ml-2">
                              <span v-if="topping.price > 0">₱{{ (topping.price * topping.count).toFixed(2) }}</span>
                              <span v-else class="text-green-600">Free</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-lg md:rounded-xl p-2 md:p-4 col-span-2 md:col-span-1">
                    <div class="flex items-center gap-2 md:gap-3">
                      <div class="bg-green-600 text-white rounded-full p-1 md:p-2">
                        <ion-icon :icon="icons.cashOutline" class="text-sm md:text-lg"></ion-icon>
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="text-xs md:text-sm font-medium text-green-600">
                          Total Price
                        </div>
                        <div class="text-lg md:text-xl font-bold text-green-700">
                          ₱{{ totalPrice.toFixed(2) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] md:px-6 md:py-5 md:pb-5 bg-white flex gap-2 md:gap-4 border-t border-gray-200">
            <!-- Cancel Button (Secondary) -->
            <button @click="closeCartModal"
              class="flex-1 flex items-center justify-center gap-1 md:gap-2 px-4 py-3 md:px-6 md:py-3 bg-transparent text-[#58091F] border-2 border-[#58091F] font-bold text-sm md:text-base uppercase tracking-wide rounded-xl md:rounded-xl min-h-[48px] md:min-h-[48px] hover:bg-[#58091F]/5 active:scale-95 transition-all duration-200 touch-manipulation">
              <ion-icon :icon="icons.closeOutline" class="text-lg md:text-xl"></ion-icon>
              Cancel
            </button>

            <!-- Add to Cart Button (Primary) -->
            <button @click="addToCart" :disabled="!isFormValid" :class="[
              'flex-1 flex items-center justify-center gap-1 md:gap-2 px-4 py-3 md:px-6 md:py-3 font-bold text-sm md:text-base uppercase tracking-wide rounded-xl md:rounded-xl min-h-[48px] md:min-h-[48px] transition-all duration-200 touch-manipulation',
              isFormValid
                ? 'bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white shadow-lg hover:shadow-xl active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed',
            ]">
              <ion-icon :icon="icons.cartOutline" class="text-lg md:text-xl"></ion-icon>
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <!-- Success Modal removed as user is now redirected to cart directly -->

      <div class="cake-customizer">
        <canvas id="cakeCanvas"></canvas>
        <div class="controls-panel">
          <div class="sticky top-0 z-10">
            <div class="bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white px-3 sm:px-4 py-3 sm:py-4 shadow-lg">
              <div class="flex items-center justify-center space-x-3">
                <div class="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3">
                  <ion-icon :icon="icons.cubeOutline" class="text-xl sm:text-2xl text-white"></ion-icon>
                </div>
                <div class="text-center">
                  <h2 class="text-lg sm:text-xl font-bold tracking-wide">
                    3D Cake Controls
                  </h2>
                  <p class="text-xs sm:text-sm opacity-90 mt-1">
                    Customize your perfect cake design
                  </p>
                </div>
                <div class="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3">
                  <ion-icon :icon="icons.settingsOutline" class="text-xl sm:text-2xl text-white"></ion-icon>
                </div>
              </div>
            </div>
            <div
              class="flex gap-3 sm:gap-2 p-2 sm:p-4 overflow-x-auto bg-gradient-to-r from-gray-50 to-gray-100 shadow-lg border-b border-gray-200"
              ref="tabsContainer">
              <button v-if="false" :class="[
                'tab-button min-w-0 flex-shrink-0 flex flex-col sm:flex-row items-center justify-center px-2 sm:px-4 py-3 sm:py-2 rounded-xl transition-all duration-300 touch-manipulation',
                activeTab === 'tab-design'
                  ? 'bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white shadow-lg transform scale-105 border-2 border-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-[#58091F] shadow-sm border border-gray-200 hover:shadow-md',
              ]" data-tab="tab-design" @click="scrollToTab('tab-design')">
                <ion-icon :icon="icons.constructOutline" :class="[
                  'text-lg sm:text-base mb-1 sm:mb-0 sm:mr-2',
                  activeTab === 'tab-design' ? 'text-white' : 'text-gray-500',
                ]"></ion-icon>
                <span class="text-xs sm:text-sm font-medium leading-tight">Actions</span>
              </button>
              <button v-if="fa" :class="[
                'tab-button min-w-0 flex-shrink-0 flex flex-col sm:flex-row items-center justify-center px-2 sm:px-4 py-3 sm:py-2 rounded-xl transition-all duration-300 touch-manipulation',
                activeTab === 'tab-layer-editor'
                  ? 'bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white shadow-lg transform scale-105 border-2 border-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-[#58091F] shadow-sm border border-gray-200 hover:shadow-md',
              ]" data-tab="tab-layer-editor" @click="scrollToTab('tab-layer-editor')">
                <ion-icon :icon="icons.layersOutline" :class="[
                  'text-lg sm:text-base mb-1 sm:mb-0 sm:mr-2',
                  activeTab === 'tab-layer-editor' ? 'text-white' : 'text-gray-500',
                ]"></ion-icon>
                <span class="text-xs sm:text-sm font-medium leading-tight">Layer Editor</span>
              </button>

              <button :class="[
                'tab-button min-w-0 flex-shrink-0 flex flex-col sm:flex-row items-center justify-center px-2 sm:px-4 py-3 sm:py-2 rounded-xl transition-all duration-300 touch-manipulation',
                activeTab === 'tab-topper'
                  ? 'bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white shadow-lg transform scale-105 border-2 border-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-[#58091F] shadow-sm border border-gray-200 hover:shadow-md',
              ]" data-tab="tab-topper" @click="scrollToTab('tab-topper')">
                <ion-icon :icon="icons.flameOutline" :class="[
                  'text-lg sm:text-base mb-1 sm:mb-0 sm:mr-2',
                  activeTab === 'tab-topper' ? 'text-white' : 'text-gray-500',
                ]"></ion-icon>
                <span class="text-xs sm:text-sm font-medium leading-tight text-center">Printed Topper</span>
              </button>

              <button :class="[
                'tab-button min-w-0 flex-shrink-0 flex flex-col sm:flex-row items-center justify-center px-2 sm:px-4 py-3 sm:py-2 rounded-xl transition-all duration-300 touch-manipulation',
                activeTab === 'tab-icing'
                  ? 'bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white shadow-lg transform scale-105 border-2 border-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-[#58091F] shadow-sm border border-gray-200 hover:shadow-md',
              ]" data-tab="tab-icing" @click="scrollToTab('tab-icing')">
                <ion-icon :icon="icons.iceCreamOutline" :class="[
                  'text-lg sm:text-base mb-1 sm:mb-0 sm:mr-2',
                  activeTab === 'tab-icing' ? 'text-white' : 'text-gray-500',
                ]"></ion-icon>
                <span class="text-xs sm:text-sm font-medium leading-tight">Icing</span>
              </button>
              <button :class="[
                'tab-button min-w-0 flex-shrink-0 flex flex-col sm:flex-row items-center justify-center px-2 sm:px-4 py-3 sm:py-2 rounded-xl transition-all duration-300 touch-manipulation',
                activeTab === 'tab-toppings'
                  ? 'bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white shadow-lg transform scale-105 border-2 border-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-[#58091F] shadow-sm border border-gray-200 hover:shadow-md',
              ]" data-tab="tab-toppings" @click="scrollToTab('tab-toppings')">
                <ion-icon :icon="icons.sparklesOutline" :class="[
                  'text-lg sm:text-base mb-1 sm:mb-0 sm:mr-2',
                  activeTab === 'tab-toppings' ? 'text-white' : 'text-gray-500',
                ]"></ion-icon>
                <span class="text-xs sm:text-sm font-medium leading-tight">Toppings</span>
              </button>

              <button :class="[
                'tab-button min-w-0 flex-shrink-0 flex flex-col sm:flex-row items-center justify-center px-2 sm:px-4 py-3 sm:py-2 rounded-xl transition-all duration-300 touch-manipulation',
                activeTab === 'tab-greeting'
                  ? 'bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white shadow-lg transform scale-105 border-2 border-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-[#58091F] shadow-sm border border-gray-200 hover:shadow-md',
              ]" data-tab="tab-greeting" @click="scrollToTab('tab-greeting')">
                <ion-icon :icon="icons.chatbubbleOutline" :class="[
                  'text-lg sm:text-base mb-1 sm:mb-0 sm:mr-2',
                  activeTab === 'tab-greeting' ? 'text-white' : 'text-gray-500',
                ]"></ion-icon>
                <span class="text-xs sm:text-sm font-medium leading-tight">Greeting</span>
              </button>
            </div>
          </div>

          <div class="tab-content" v-show="activeTab === 'tab-design'" id="tab-design">
            <div class="control-group">
              <button v-if="true" id="addLayerBtn" class="action-button">
                Add New Layer
              </button>
              <button id="saveCakeBtn" class="action-button">Save Design</button>
              <input type="file" id="loadCakeInput" accept=".json" style="display: none" />
              <button v-if="true" id="loadCakeBtn" class="action-button"
                onclick="document.getElementById('loadCakeInput').click()">
                Load Design
              </button>
              <button v-if="true" id="resetCakeBtn" class="action-button" @click="resetCakeDesign">
                Reset Design
              </button>

              <div class="p-3 flex gap-2 justify-between"></div>
            </div>
          </div>
          <div class="tab-content" v-show="activeTab === 'tab-layer-editor'" id="tab-layer-editor">
            <div id="layerEditPrompt" class="prompt px-3">
              Click a cake layer in the 3D view to edit it.
            </div>
            <div id="selectedLayerControlsContainer"></div>
          </div>
          <div class="tab-content" v-show="activeTab === 'tab-topper'" id="tab-topper">
            <div v-if="!selectedLayerId" class="prompt">
              Click a cake layer in the 3D view to edit its topper.
            </div>
            <div v-else class="p-2 sm:p-4 space-y-2 sm:space-y-4">
              <!-- Mobile-Optimized Header -->
              <div class="bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white rounded-xl p-4 text-center shadow-md">
                <h3 class="text-lg sm:text-xl font-bold">
                  Layer {{ currentLayerNumber }} Topper
                </h3>
                <p class="text-sm opacity-90 mt-1">Customize your cake decoration</p>
              </div>

              <!-- Mobile-Friendly Topper Section -->
              <div class="bg-white rounded-xl shadow-lg border border-gray-100">
                <!-- Enable Toggle -->
                <div class="p-4 border-b border-gray-100">
                  <label class="flex items-center space-x-4 cursor-pointer select-none">
                    <div class="relative">
                      <input type="checkbox" class="sr-only peer" :checked="selectedLayerConfig?.topper?.enabled"
                        @change="
                          updateLayerProperty(
                            selectedLayerId,
                            'topper.enabled',
                            $event.target.checked
                          )
                          " />
                      <div
                        class="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#58091F]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#58091F] peer-checked:to-[#7A0C29]">
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="text-base sm:text-lg font-semibold text-gray-800">
                        Enable Printed Topper
                      </div>
                      <div class="text-sm text-gray-500">
                        Add a custom topper to your cake design
                      </div>
                    </div>
                  </label>
                </div>

                <!-- Topper Controls -->
                <div v-if="selectedLayerConfig?.topper?.enabled" class="p-4 space-y-6">
                  <!-- Topper Type Selection -->
                  <div class="space-y-3">
                    <label class="text-base font-semibold text-gray-800 block">Choose Topper Type</label>
                    <div class="grid grid-cols-2 gap-3">
                      <button @click="
                        updateLayerProperty(selectedLayerId, 'topper.type', 'text')
                        " :class="[
                          'flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 min-h-[100px] touch-manipulation',
                          selectedLayerConfig?.topper?.type === 'text'
                            ? 'border-[#58091F] bg-gradient-to-br from-[#58091F]/10 to-[#7A0C29]/10 shadow-lg'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300 active:scale-95',
                        ]">
                        <div class="text-2xl mb-2">📝</div>
                        <span class="text-sm font-medium text-gray-700">Text Only</span>
                      </button>
                      <button @click="
                        updateLayerProperty(selectedLayerId, 'topper.type', 'image')
                        " :class="[
                          'flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 min-h-[100px] touch-manipulation',
                          selectedLayerConfig?.topper?.type === 'image'
                            ? 'border-[#58091F] bg-gradient-to-br from-[#58091F]/10 to-[#7A0C29]/10 shadow-lg'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300 active:scale-95',
                        ]">
                        <div class="text-2xl mb-2">🖼️</div>
                        <span class="text-sm font-medium text-gray-700">Image</span>
                      </button>
                    </div>
                  </div>

                  <!-- Text Controls -->
                  <div v-if="selectedLayerConfig?.topper?.type === 'text'" class="space-y-6 bg-gray-50 rounded-xl p-4">
                    <div class="flex items-center space-x-2 mb-4">
                      <div class="text-lg">📝</div>
                      <h4 class="text-lg font-semibold text-gray-800">Text Settings</h4>
                    </div>

                    <!-- Text Input -->
                    <div class="space-y-3">
                      <label class="text-sm font-semibold text-gray-700 block">Your Text</label>
                      <input type="text" :value="selectedLayerConfig?.topper?.text || ''" @input="
                        updateLayerProperty(
                          selectedLayerId,
                          'topper.text',
                          $event.target.value
                        )
                        " placeholder="Happy Birthday!"
                        class="w-full px-4 py-3 text-base border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-[#58091F]/20 focus:border-[#58091F] transition-all duration-200" />
                    </div>

                    <!-- Font Size Slider -->
                    <div class="space-y-3">
                      <div class="flex justify-between items-center">
                        <label class="text-sm font-semibold text-gray-700">Font Size</label>
                        <div class="bg-[#58091F] text-white px-3 py-1 rounded-full text-xs font-bold">
                          {{ (selectedLayerConfig?.topper?.fontSize || 1).toFixed(1) }}x
                        </div>
                      </div>
                      <div class="relative">
                        <input type="range" min="0.5" max="4" step="0.1"
                          :value="selectedLayerConfig?.topper?.fontSize || 1"
                          @input="handleThrottledTopperInput('topper.fontSize', $event)"
                          class="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider-thumb" />
                        <div class="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Small</span>
                          <span>Large</span>
                        </div>
                      </div>
                    </div>

                    <!-- Font Style Buttons -->
                    <div class="space-y-3">
                      <label class="text-sm font-semibold text-gray-700 block">Font Style</label>
                      <div class="text-xs text-gray-500 mb-3 bg-amber-50 border border-amber-200 rounded-lg p-2">
                        <span class="flex items-center gap-1">
                          <span>✨</span>
                          Choose from authentic cake topper fonts for the perfect look
                        </span>
                      </div>

                      <!-- Basic Styles Row -->
                      <div class="grid grid-cols-3 gap-2">
                        <button @click="updateTopperFontStyle('normal')" :class="[
                          'px-3 py-3 text-sm font-medium rounded-xl border-2 transition-all duration-200 touch-manipulation relative overflow-hidden',
                          selectedLayerConfig?.topper?.style === 'normal' ||
                            !selectedLayerConfig?.topper?.style
                            ? 'border-[#58091F] bg-[#58091F] text-white shadow-lg'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 active:scale-95',
                        ]">
                          <span class="relative z-10">Normal</span>
                          <div v-if="
                            selectedLayerConfig?.topper?.style === 'normal' ||
                            !selectedLayerConfig?.topper?.style
                          " class="absolute top-1 right-1 text-white text-xs">
                            ✓
                          </div>
                        </button>
                        <button @click="updateTopperFontStyle('bold')" :class="[
                          'px-3 py-3 text-sm font-bold rounded-xl border-2 transition-all duration-200 touch-manipulation relative overflow-hidden',
                          selectedLayerConfig?.topper?.style === 'bold'
                            ? 'border-[#58091F] bg-[#58091F] text-white shadow-lg'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 active:scale-95',
                        ]">
                          <span class="relative z-10">Bold</span>
                          <div v-if="selectedLayerConfig?.topper?.style === 'bold'"
                            class="absolute top-1 right-1 text-white text-xs">
                            ✓
                          </div>
                        </button>
                        <button @click="updateTopperFontStyle('italic')" :class="[
                          'px-3 py-3 text-sm font-medium italic rounded-xl border-2 transition-all duration-200 touch-manipulation relative overflow-hidden',
                          selectedLayerConfig?.topper?.style === 'italic'
                            ? 'border-[#58091F] bg-[#58091F] text-white shadow-lg'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 active:scale-95',
                        ]">
                          <span class="relative z-10">Italic</span>
                          <div v-if="selectedLayerConfig?.topper?.style === 'italic'"
                            class="absolute top-1 right-1 text-white text-xs">
                            ✓
                          </div>
                        </button>
                      </div>

                      <!-- Stylish Fonts Row 1 -->
                      <div class="grid grid-cols-2 gap-2">
                        <button @click="updateTopperFontStyle('script')" :class="[
                          'px-3 py-3 text-sm font-medium rounded-xl border-2 transition-all duration-200 touch-manipulation relative overflow-hidden',
                          selectedLayerConfig?.topper?.style === 'script'
                            ? 'border-[#58091F] bg-[#58091F] text-white shadow-lg'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 active:scale-95',
                        ]">
                          <div class="flex flex-col items-center">
                            <span class="relative z-10 text-lg" style="font-family: cursive">Script</span>
                            <span class="text-xs opacity-70">Elegant cursive</span>
                          </div>
                          <div v-if="selectedLayerConfig?.topper?.style === 'script'"
                            class="absolute top-1 right-1 text-white text-xs">
                            ✓
                          </div>
                        </button>
                        <button @click="updateTopperFontStyle('decorative')" :class="[
                          'px-3 py-3 text-sm font-bold rounded-xl border-2 transition-all duration-200 touch-manipulation relative overflow-hidden',
                          selectedLayerConfig?.topper?.style === 'decorative'
                            ? 'border-[#58091F] bg-[#58091F] text-white shadow-lg'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 active:scale-95',
                        ]">
                          <div class="flex flex-col items-center">
                            <span class="relative z-10 text-lg">Decorative</span>
                            <span class="text-xs opacity-70">Bold & fancy</span>
                          </div>
                          <div v-if="selectedLayerConfig?.topper?.style === 'decorative'"
                            class="absolute top-1 right-1 text-white text-xs">
                            ✓
                          </div>
                        </button>
                      </div>

                      <!-- Stylish Fonts Row 2 -->
                      <div class="grid grid-cols-2 gap-2">
                        <button @click="updateTopperFontStyle('elegant')" :class="[
                          'px-3 py-3 text-sm font-medium rounded-xl border-2 transition-all duration-200 touch-manipulation relative overflow-hidden',
                          selectedLayerConfig?.topper?.style === 'elegant'
                            ? 'border-[#58091F] bg-[#58091F] text-white shadow-lg'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 active:scale-95',
                        ]">
                          <div class="flex flex-col items-center">
                            <span class="relative z-10 text-lg" style="letter-spacing: 0.5px">Elegant</span>
                            <span class="text-xs opacity-70">Clean & refined</span>
                          </div>
                          <div v-if="selectedLayerConfig?.topper?.style === 'elegant'"
                            class="absolute top-1 right-1 text-white text-xs">
                            ✓
                          </div>
                        </button>
                        <button @click="updateTopperFontStyle('playful')" :class="[
                          'px-3 py-3 text-sm font-bold rounded-xl border-2 transition-all duration-200 touch-manipulation relative overflow-hidden',
                          selectedLayerConfig?.topper?.style === 'playful'
                            ? 'border-[#58091F] bg-[#58091F] text-white shadow-lg'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 active:scale-95',
                        ]">
                          <div class="flex flex-col items-center">
                            <span class="relative z-10 text-lg">Playful</span>
                            <span class="text-xs opacity-70">Fun & bold</span>
                          </div>
                          <div v-if="selectedLayerConfig?.topper?.style === 'playful'"
                            class="absolute top-1 right-1 text-white text-xs">
                            ✓
                          </div>
                        </button>
                      </div>

                      <!-- Classic Font -->
                      <div class="grid grid-cols-1">
                        <button @click="updateTopperFontStyle('classic')" :class="[
                          'px-3 py-3 text-sm font-medium rounded-xl border-2 transition-all duration-200 touch-manipulation relative overflow-hidden',
                          selectedLayerConfig?.topper?.style === 'classic'
                            ? 'border-[#58091F] bg-[#58091F] text-white shadow-lg'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 active:scale-95',
                        ]">
                          <div class="flex flex-col items-center">
                            <span class="relative z-10 text-lg" style="font-family: serif">Classic</span>
                            <span class="text-xs opacity-70">Traditional serif - perfect for formal occasions</span>
                          </div>
                          <div v-if="selectedLayerConfig?.topper?.style === 'classic'"
                            class="absolute top-1 right-1 text-white text-xs">
                            ✓
                          </div>
                        </button>
                      </div>

                      <!-- Status Display -->
                      <div class="text-xs text-center mt-3 p-2 bg-gray-50 rounded-lg border">
                        <span v-if="!loadedFonts.normal" class="text-amber-600">
                          <span class="animate-spin inline-block">⏳</span> Loading
                          fonts...
                        </span>
                        <span v-else-if="selectedLayerConfig?.topper?.style === 'script'" class="text-blue-600">
                          <span>✨</span> Using elegant script font
                        </span>
                        <span v-else-if="selectedLayerConfig?.topper?.style === 'decorative'" class="text-purple-600">
                          <span>🎨</span> Using decorative font
                        </span>
                        <span v-else-if="selectedLayerConfig?.topper?.style === 'elegant'" class="text-green-600">
                          <span>💎</span> Using elegant font
                        </span>
                        <span v-else-if="selectedLayerConfig?.topper?.style === 'playful'" class="text-orange-600">
                          <span>🎉</span> Using playful font
                        </span>
                        <span v-else-if="selectedLayerConfig?.topper?.style === 'classic'" class="text-indigo-600">
                          <span>📜</span> Using classic serif font
                        </span>
                        <span v-else-if="
                          selectedLayerConfig?.topper?.style === 'bold' &&
                          !loadedFonts.bold
                        " class="text-yellow-600">
                          <span>⚡</span> Using bold simulation
                        </span>
                        <span v-else-if="selectedLayerConfig?.topper?.style === 'italic'" class="text-cyan-600">
                          <span>⚡</span> Using italic transformation
                        </span>
                        <span v-else-if="selectedLayerConfig?.topper?.text" class="text-green-600">
                          <span>✅</span> Text styling applied
                        </span>
                        <span v-else class="text-gray-500">
                          Select a font style above
                        </span>
                      </div>
                    </div>

                    <!-- Text Color Picker -->
                    <div class="space-y-3">
                      <label class="text-sm font-semibold text-gray-700 block">Text Color</label>
                      <div class="flex items-center space-x-4 bg-white p-3 rounded-xl border border-gray-200">
                        <input type="color" :value="selectedLayerConfig?.topper?.color || '#000000'" @input="
                          updateLayerProperty(
                            selectedLayerId,
                            'topper.color',
                            $event.target.value
                          )
                          " class="w-16 h-16 border-2 border-gray-300 rounded-xl cursor-pointer shadow-sm" />
                        <div class="flex-1">
                          <div class="text-sm font-medium text-gray-700">
                            Selected Color
                          </div>
                          <div class="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded mt-1">
                            {{ selectedLayerConfig?.topper?.color || "#000000" }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Image Controls -->
                  <div v-if="selectedLayerConfig?.topper?.type === 'image'" class="space-y-4">
                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700">Upload Image:</label>
                      <div
                        class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-[#58091F] transition-colors duration-200">
                        <div class="space-y-1 text-center">
                          <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none"
                            viewBox="0 0 48 48" aria-hidden="true">
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                          </svg>
                          <div class="flex text-sm text-gray-600">
                            <label
                              class="relative cursor-pointer bg-white rounded-md font-medium text-[#58091F] hover:text-[#58091F]/80 focus-within:outline-none">
                              <span>Upload a file</span>
                              <input type="file" accept="image/*" @change="handleImageUpload($event)" class="sr-only" />
                            </label>
                            <p class="pl-1">or drag and drop</p>
                          </div>
                          <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Position and Size Controls (shown for both text and image) -->
                  <div v-if="
                    selectedLayerConfig?.topper?.type &&
                    selectedLayerConfig?.topper?.type !== 'none'
                  " class="space-y-4">
                    <!-- Position -->
                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700">Topper Position:</label>
                      <select :value="selectedLayerConfig?.topper?.position || 'center'" @change="
                        updateLayerProperty(
                          selectedLayerId,
                          'topper.position',
                          $event.target.value
                        )
                        "
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#58091F] focus:border-[#58091F]">
                        <option value="center">Center</option>
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="front">Front</option>
                        <option value="back">Back</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                        <option value="front-left">Front Left</option>
                        <option value="front-right">Front Right</option>
                        <option value="back-left">Back Left</option>
                        <option value="back-right">Back Right</option>
                      </select>
                    </div>

                    <!-- Size -->
                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700">
                        Topper Size ({{
                          (selectedLayerConfig?.topper?.size || 1).toFixed(2)
                        }}):
                      </label>
                      <input type="range" min="0.5" max="2" step="0.01" :value="selectedLayerConfig?.topper?.size || 1"
                        @input="handleThrottledTopperInput('topper.size', $event)"
                        class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    </div>

                    <!-- Stick Height -->
                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700">
                        Stick Height ({{
                          (selectedLayerConfig?.topper?.stickHeight || 0.4).toFixed(1)
                        }}):
                      </label>
                      <input type="range" min="0.1" max="1.5" step="0.1"
                        :value="selectedLayerConfig?.topper?.stickHeight || 0.4"
                        @input="handleThrottledTopperInput('topper.stickHeight', $event)"
                        class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Icing -->
          <div class="tab-content" v-show="activeTab === 'tab-icing'" id="tab-icing">
            <div v-if="!selectedLayerId" class="prompt">
              Click a cake layer in the 3D view to edit its icing.
            </div>
            <div v-else class="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <!-- Mobile-Optimized Header -->
              <div class="bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white rounded-xl p-4 text-center shadow-md">
                <h3 class="text-lg sm:text-xl font-bold">
                  Layer {{ currentLayerNumber }} Icing
                </h3>
                <p class="text-sm opacity-90 mt-1">Customize your icing decoration</p>
              </div>

              <!-- Edge Icing Section -->
              <div class="bg-white rounded-xl shadow-lg border border-gray-100">
                <!-- Enable Toggle -->
                <div class="p-4 border-b border-gray-100">
                  <label class="flex items-center space-x-4 cursor-pointer select-none">
                    <div class="relative">
                      <input type="checkbox" class="sr-only peer" :checked="selectedLayerConfig?.edgeIcing?.enabled"
                        @change="
                          updateLayerProperty(
                            selectedLayerId,
                            'edgeIcing.enabled',
                            $event.target.checked
                          )
                          " />
                      <div
                        class="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#58091F]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#58091F] peer-checked:to-[#7A0C29]">
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="text-base sm:text-lg font-semibold text-gray-800">
                        Enable Edge Icing
                      </div>
                      <div class="text-sm text-gray-500">
                        Add decorative icing around the edge of your cake
                      </div>
                    </div>
                  </label>
                </div>

                <!-- Edge Icing Controls -->
                <div v-if="selectedLayerConfig?.edgeIcing?.enabled" class="p-4 space-y-6">
                  <div class="flex items-center space-x-2 mb-4">
                    <div class="text-lg">🎨</div>
                    <h4 class="text-lg font-semibold text-gray-800">
                      Edge Icing Settings
                    </h4>
                  </div>

                  <!-- Edge Style Selection -->
                  <div class="space-y-3">
                    <label class="text-sm font-semibold text-gray-700 block">Icing Style</label>
                    <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      <button v-for="style in [
                        { value: 'smooth', label: 'Smooth', icon: '⭕' },
                        { value: 'curl', label: 'Curl', icon: '🌀' },
                        { value: 'shell', label: 'Shell', icon: '🐚' },
                        { value: 'rosette', label: 'Rosette', icon: '🌹' },
                        { value: 'ruffle', label: 'Ruffle', icon: '〰️' },
                        { value: 'zigzag', label: 'Zigzag', icon: '⚡' },
                      ]" :key="style.value" @click="
                          updateLayerProperty(
                            selectedLayerId,
                            'edgeIcing.style',
                            style.value
                          )
                          " :class="[
                          'flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-all duration-200 min-h-[80px] touch-manipulation',
                          (selectedLayerConfig?.edgeIcing?.style || 'smooth') ===
                            style.value
                            ? 'border-[#58091F] bg-gradient-to-br from-[#58091F]/10 to-[#7A0C29]/10 shadow-lg'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300 active:scale-95',
                        ]">
                        <div class="text-lg mb-1">{{ style.icon }}</div>
                        <span class="text-xs font-medium text-gray-700">{{
                          style.label
                          }}</span>
                      </button>
                    </div>
                  </div>

                  <!-- Edge Color Picker -->
                  <div class="space-y-3">
                    <label class="text-sm font-semibold text-gray-700 block">Edge Color</label>
                    <div class="flex items-center space-x-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <input type="color" :value="selectedLayerConfig?.edgeIcing?.color || '#FFFFFF'" @input="
                        updateLayerProperty(
                          selectedLayerId,
                          'edgeIcing.color',
                          $event.target.value
                        )
                        " class="w-16 h-16 border-2 border-gray-300 rounded-xl cursor-pointer shadow-sm" />
                      <div class="flex-1">
                        <div class="text-sm font-medium text-gray-700">
                          Selected Color
                        </div>
                        <div class="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded mt-1">
                          {{ selectedLayerConfig?.edgeIcing?.color || "#FFFFFF" }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Edge Thickness Slider -->
                  <div class="space-y-3">
                    <div class="flex justify-between items-center">
                      <label class="text-sm font-semibold text-gray-700">Edge Thickness</label>
                      <div class="bg-[#58091F] text-white px-3 py-1 rounded-full text-xs font-bold">
                        {{
                          (selectedLayerConfig?.edgeIcing?.thickness || 0.05).toFixed(2)
                        }}
                      </div>
                    </div>
                    <div class="relative">
                      <input type="range" min="0.02" max="0.3" step="0.01"
                        :value="selectedLayerConfig?.edgeIcing?.thickness || 0.05" @input="
                          updateLayerProperty(
                            selectedLayerId,
                            'edgeIcing.thickness',
                            parseFloat($event.target.value)
                          )
                          " class="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider-thumb" />
                      <div class="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Thin</span>
                        <span>Thick</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bottom Icing Section -->
              <div class="bg-white rounded-xl shadow-lg border border-gray-100">
                <!-- Enable Toggle -->
                <div class="p-4 border-b border-gray-100">
                  <label class="flex items-center space-x-4 cursor-pointer select-none">
                    <div class="relative">
                      <input type="checkbox" class="sr-only peer" :checked="selectedLayerConfig?.bottomIcing?.enabled"
                        @change="
                          updateLayerProperty(
                            selectedLayerId,
                            'bottomIcing.enabled',
                            $event.target.checked
                          )
                          " />
                      <div
                        class="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#58091F]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#58091F] peer-checked:to-[#7A0C29]">
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="text-base sm:text-lg font-semibold text-gray-800">
                        Enable Bottom Icing
                      </div>
                      <div class="text-sm text-gray-500">
                        Add decorative icing to the bottom edge of your cake
                      </div>
                    </div>
                  </label>
                </div>

                <!-- Bottom Icing Controls -->
                <div v-if="selectedLayerConfig?.bottomIcing?.enabled" class="p-4 space-y-6">
                  <div class="flex items-center space-x-2 mb-4">
                    <div class="text-lg">🎂</div>
                    <h4 class="text-lg font-semibold text-gray-800">
                      Bottom Icing Settings
                    </h4>
                  </div>

                  <!-- Bottom Style Selection -->
                  <div class="space-y-3">
                    <label class="text-sm font-semibold text-gray-700 block">Bottom Style</label>
                    <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      <button v-for="style in [
                        { value: 'smooth', label: 'Smooth', icon: '⭕' },
                        { value: 'curl', label: 'Curl', icon: '🌀' },
                        { value: 'shell', label: 'Shell', icon: '🐚' },
                        { value: 'rosette', label: 'Rosette', icon: '🌹' },
                        { value: 'ruffle', label: 'Ruffle', icon: '〰️' },
                        { value: 'zigzag', label: 'Zigzag', icon: '⚡' },
                      ]" :key="style.value" @click="
                          updateLayerProperty(
                            selectedLayerId,
                            'bottomIcing.style',
                            style.value
                          )
                          " :class="[
                          'flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-all duration-200 min-h-[80px] touch-manipulation',
                          (selectedLayerConfig?.bottomIcing?.style || 'smooth') ===
                            style.value
                            ? 'border-[#58091F] bg-gradient-to-br from-[#58091F]/10 to-[#7A0C29]/10 shadow-lg'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300 active:scale-95',
                        ]">
                        <div class="text-lg mb-1">{{ style.icon }}</div>
                        <span class="text-xs font-medium text-gray-700">{{
                          style.label
                          }}</span>
                      </button>
                    </div>
                  </div>

                  <!-- Bottom Color Picker -->
                  <div class="space-y-3">
                    <label class="text-sm font-semibold text-gray-700 block">Bottom Color</label>
                    <div class="flex items-center space-x-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <input type="color" :value="selectedLayerConfig?.bottomIcing?.color || '#FFFFFF'" @input="
                        updateLayerProperty(
                          selectedLayerId,
                          'bottomIcing.color',
                          $event.target.value
                        )
                        " class="w-16 h-16 border-2 border-gray-300 rounded-xl cursor-pointer shadow-sm" />
                      <div class="flex-1">
                        <div class="text-sm font-medium text-gray-700">
                          Selected Color
                        </div>
                        <div class="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded mt-1">
                          {{ selectedLayerConfig?.bottomIcing?.color || "#FFFFFF" }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Bottom Thickness Slider -->
                  <div class="space-y-3">
                    <div class="flex justify-between items-center">
                      <label class="text-sm font-semibold text-gray-700">Bottom Thickness</label>
                      <div class="bg-[#58091F] text-white px-3 py-1 rounded-full text-xs font-bold">
                        {{
                          (selectedLayerConfig?.bottomIcing?.thickness || 0.05).toFixed(2)
                        }}
                      </div>
                    </div>
                    <div class="relative">
                      <input type="range" min="0.02" max="0.3" step="0.01"
                        :value="selectedLayerConfig?.bottomIcing?.thickness || 0.05" @input="
                          updateLayerProperty(
                            selectedLayerId,
                            'bottomIcing.thickness',
                            parseFloat($event.target.value)
                          )
                          " class="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider-thumb" />
                      <div class="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Thin</span>
                        <span>Thick</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Surface Icing Section -->
              <div class="bg-white rounded-xl shadow-lg border border-gray-100">
                <!-- Enable Toggle -->
                <div class="p-4 border-b border-gray-100">
                  <label class="flex items-center space-x-4 cursor-pointer select-none">
                    <div class="relative">
                      <input type="checkbox" class="sr-only peer" :checked="selectedLayerConfig?.surfaceIcing?.enabled"
                        @change="
                          updateLayerProperty(
                            selectedLayerId,
                            'surfaceIcing.enabled',
                            $event.target.checked
                          )
                          " />
                      <div
                        class="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#58091F]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#58091F] peer-checked:to-[#7A0C29]">
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="text-base sm:text-lg font-semibold text-gray-800">
                        Enable Surface Icing
                      </div>
                      <div class="text-sm text-gray-500">
                        Add decorative icing on the top surface of your cake
                      </div>
                    </div>
                  </label>
                </div>

                <!-- Surface Icing Controls -->
                <div v-if="selectedLayerConfig?.surfaceIcing?.enabled" class="p-4 space-y-6">
                  <div class="flex items-center space-x-2 mb-4">
                    <div class="text-lg">🍰</div>
                    <h4 class="text-lg font-semibold text-gray-800">
                      Surface Icing Settings
                    </h4>
                  </div>

                  <!-- Surface Color Picker -->
                  <div class="space-y-3">
                    <label class="text-sm font-semibold text-gray-700 block">Surface Color</label>
                    <div class="flex items-center space-x-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <input type="color" :value="selectedLayerConfig?.surfaceIcing?.color || '#FFFFFF'" @input="
                        updateLayerProperty(
                          selectedLayerId,
                          'surfaceIcing.color',
                          $event.target.value
                        )
                        " class="w-16 h-16 border-2 border-gray-300 rounded-xl cursor-pointer shadow-sm" />
                      <div class="flex-1">
                        <div class="text-sm font-medium text-gray-700">
                          Selected Color
                        </div>
                        <div class="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded mt-1">
                          {{ selectedLayerConfig?.surfaceIcing?.color || "#FFFFFF" }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Surface Thickness Slider -->
                  <div class="space-y-3">
                    <div class="flex justify-between items-center">
                      <label class="text-sm font-semibold text-gray-700">Surface Thickness</label>
                      <div class="bg-[#58091F] text-white px-3 py-1 rounded-full text-xs font-bold">
                        {{
                          (selectedLayerConfig?.surfaceIcing?.thickness || 0.02).toFixed(
                            2
                          )
                        }}
                      </div>
                    </div>
                    <div class="relative">
                      <input type="range" min="0.01" max="0.1" step="0.01"
                        :value="selectedLayerConfig?.surfaceIcing?.thickness || 0.02" @input="
                          updateLayerProperty(
                            selectedLayerId,
                            'surfaceIcing.thickness',
                            parseFloat($event.target.value)
                          )
                          " class="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider-thumb" />
                      <div class="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Thin</span>
                        <span>Thick</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Patterned Top Icing Section -->
              <div class="bg-white rounded-xl shadow-lg border border-gray-100">
                <!-- Enable Toggle -->
                <div class="p-4 border-b border-gray-100">
                  <label class="flex items-center space-x-4 cursor-pointer select-none">
                    <div class="relative">
                      <input type="checkbox" class="sr-only peer"
                        :checked="selectedLayerConfig?.patternedTopIcing?.enabled" @change="
                          updateLayerProperty(
                            selectedLayerId,
                            'patternedTopIcing.enabled',
                            $event.target.checked
                          )
                          " />
                      <div
                        class="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#58091F]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#58091F] peer-checked:to-[#7A0C29]">
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="text-base sm:text-lg font-semibold text-gray-800">
                        Enable Patterned Top Icing
                      </div>
                      <div class="text-sm text-gray-500">
                        Add styled icing patterns on the top surface of your cake
                      </div>
                    </div>
                  </label>
                </div>

                <!-- Patterned Top Icing Controls -->
                <div v-if="selectedLayerConfig?.patternedTopIcing?.enabled" class="p-4 space-y-6">
                  <div class="flex items-center space-x-2 mb-4">
                    <div class="text-lg">🍰</div>
                    <h4 class="text-lg font-semibold text-gray-800">
                      Patterned Top Icing Settings
                    </h4>
                  </div>

                  <!-- Patterned Top Icing Style Selection -->
                  <div class="space-y-3">
                    <label class="text-sm font-semibold text-gray-700 block">Patterned Top Icing Style</label>
                    <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      <button v-for="style in [
                        { value: 'smooth', label: 'Smooth', icon: '⭕' },
                        { value: 'curl', label: 'Curl', icon: '🌀' },
                        { value: 'shell', label: 'Shell', icon: '🐚' },
                        { value: 'rosette', label: 'Rosette', icon: '🌹' },
                        { value: 'ruffle', label: 'Ruffle', icon: '〰️' },
                        { value: 'zigzag', label: 'Zigzag', icon: '⚡' },
                      ]" :key="style.value" @click="
                          updateLayerProperty(
                            selectedLayerId,
                            'patternedTopIcing.style',
                            style.value
                          )
                          " :class="[
                          'flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-all duration-200 min-h-[80px] touch-manipulation',
                          (selectedLayerConfig?.patternedTopIcing?.style || 'smooth') ===
                            style.value
                            ? 'border-[#58091F] bg-gradient-to-br from-[#58091F]/10 to-[#7A0C29]/10 shadow-lg'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300 active:scale-95',
                        ]">
                        <div class="text-lg mb-1">{{ style.icon }}</div>
                        <span class="text-xs font-medium text-gray-700">{{
                          style.label
                          }}</span>
                      </button>
                    </div>
                  </div>

                  <!-- Patterned Top Icing Color Picker -->
                  <div class="space-y-3">
                    <label class="text-sm font-semibold text-gray-700 block">Patterned Top Icing Color</label>
                    <div class="flex items-center space-x-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <input type="color" :value="selectedLayerConfig?.patternedTopIcing?.color || '#FFFFFF'
                        " @input="
                          updateLayerProperty(
                            selectedLayerId,
                            'patternedTopIcing.color',
                            $event.target.value
                          )
                          " class="w-16 h-16 border-2 border-gray-300 rounded-xl cursor-pointer shadow-sm" />
                      <div class="flex-1">
                        <div class="text-sm font-medium text-gray-700">
                          Selected Color
                        </div>
                        <div class="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded mt-1">
                          {{ selectedLayerConfig?.patternedTopIcing?.color || "#FFFFFF" }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Patterned Top Icing Thickness Slider -->
                  <div class="space-y-3">
                    <div class="flex justify-between items-center">
                      <label class="text-sm font-semibold text-gray-700">Patterned Top Icing Thickness</label>
                      <div class="bg-[#58091F] text-white px-3 py-1 rounded-full text-xs font-bold">
                        {{
                          (
                            selectedLayerConfig?.patternedTopIcing?.thickness || 0.02
                          ).toFixed(2)
                        }}
                      </div>
                    </div>
                    <div class="relative">
                      <input type="range" min="0.01" max="0.3" step="0.01"
                        :value="selectedLayerConfig?.patternedTopIcing?.thickness || 0.02" @input="
                          updateLayerProperty(
                            selectedLayerId,
                            'patternedTopIcing.thickness',
                            parseFloat($event.target.value)
                          )
                          " class="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider-thumb" />
                      <div class="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Thin</span>
                        <span>Thick</span>
                      </div>
                    </div>
                  </div>

                  <!-- Patterned Top Icing Position Selection -->
                  <div class="space-y-3">
                    <label class="text-sm font-semibold text-gray-700 block">Patterned Top Icing Position</label>
                    <div class="flex items-center space-x-2">
                      <button v-for="position in ['inner', 'mid', 'outer']" :key="position" @click="
                        updateLayerProperty(
                          selectedLayerId,
                          'patternedTopIcing.position',
                          position
                        )
                        " :class="[
                          'flex-1 py-2 px-4 border rounded-md text-sm font-medium focus:outline-none',
                          selectedLayerConfig?.patternedTopIcing?.position === position
                            ? 'bg-[#58091F] text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50',
                        ]">
                        {{ position }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Toppings -->
          <div class="tab-content" v-show="activeTab === 'tab-toppings'" id="tab-toppings">
            <div v-if="!selectedLayerId" class="prompt">
              Click a cake layer in the 3D view to edit its toppings.
            </div>
            <div v-else class="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <!-- Mobile-Optimized Header -->
              <div class="bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white rounded-xl p-4 text-center shadow-md">
                <h3 class="text-lg sm:text-xl font-bold">
                  Layer {{ currentLayerNumber }} Toppings
                </h3>
                <p class="text-sm opacity-90 mt-1">Add delicious toppings to your cake</p>
              </div>

              <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-4 space-y-6">
                <div class="flex items-center space-x-2 mb-4">
                  <div class="text-lg">🎊</div>
                  <h4 class="text-lg font-semibold text-gray-800">Available Toppings</h4>
                </div>

                <!-- Sprinkles -->
                <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label class="flex items-center space-x-4 cursor-pointer select-none">
                    <div class="relative">
                      <input type="checkbox" class="sr-only peer" :checked="selectedLayerConfig?.toppings?.some(
                        (t) => t.type === 'sprinkles'
                      )
                        " @change="updateToppingState('sprinkles', $event.target.checked)" />
                      <div
                        class="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#58091F]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#58091F] peer-checked:to-[#7A0C29]">
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center space-x-2">
                        <span class="text-lg">🌈</span>
                        <div class="text-base font-semibold text-gray-800">
                          Sprinkles
                          <span class="text-sm font-normal text-gray-600 ml-1">({{
                            toppingsOptions["sprinkles"].price === 0
                              ? "Free"
                              : `₱${toppingsOptions["sprinkles"].price}`
                          }})</span>
                        </div>
                      </div>
                      <div class="text-sm text-gray-500 mt-1">
                        Colorful sprinkles randomly distributed across the top
                      </div>
                    </div>
                  </label>
                </div>

                <!-- Flowers -->
                <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label class="flex items-center space-x-4 cursor-pointer select-none">
                    <div class="relative">
                      <input type="checkbox" class="sr-only peer" :checked="selectedLayerConfig?.toppings?.some((t) => t.type === 'flowers')
                        " @change="updateToppingState('flowers', $event.target.checked)" />
                      <div
                        class="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#58091F]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#58091F] peer-checked:to-[#7A0C29]">
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center space-x-2">
                        <span class="text-lg">🌸</span>
                        <div class="text-base font-semibold text-gray-800">
                          Flowers
                          <span class="text-sm font-normal text-gray-600 ml-1">({{
                            toppingsOptions["flowers"].price === 0
                              ? "Free"
                              : `₱${toppingsOptions["flowers"].price}`
                          }})</span>
                        </div>
                      </div>
                      <div class="text-sm text-gray-500 mt-1">
                        Beautiful edible flowers with colorful petals
                      </div>
                    </div>
                  </label>

                  <!-- Flower Position Options -->
                  <div v-if="
                    selectedLayerConfig?.toppings?.some((t) => t.type === 'flowers')
                  " class="mt-4 pt-4 border-t border-gray-200">
                    <label class="text-sm font-semibold text-gray-700 block mb-3">Flower Position</label>
                    <div class="grid grid-cols-2 gap-2">
                      <button v-for="position in [
                        { value: 'inner', label: 'Inner', desc: 'Close to center' },
                        { value: 'mid', label: 'Mid', desc: 'Middle area' },
                        { value: 'outer', label: 'Outer', desc: 'Near edge' },
                        { value: 'all', label: 'All', desc: 'Full coverage' },
                      ]" :key="position.value" @click="
                          updateLayerProperty(
                            selectedLayerId,
                            'flowerPosition',
                            position.value
                          )
                          " :class="[
                          'flex flex-col p-3 border-2 rounded-lg transition-all duration-200 touch-manipulation',
                          (!selectedLayerConfig?.flowerPosition &&
                            position.value === 'inner') ||
                            selectedLayerConfig?.flowerPosition === position.value
                            ? 'border-[#58091F] bg-[#58091F] text-white shadow-lg'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 active:scale-95',
                        ]">
                        <span class="text-sm font-medium">{{ position.label }}</span>
                        <span class="text-xs opacity-75">{{ position.desc }}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Cherries -->
                <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label class="flex items-center space-x-4 cursor-pointer select-none">
                    <div class="relative">
                      <input type="checkbox" class="sr-only peer" :checked="selectedLayerConfig?.toppings?.some(
                        (t) => t.type === 'cherries'
                      )
                        " @change="updateToppingState('cherries', $event.target.checked)" />
                      <div
                        class="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#58091F]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#58091F] peer-checked:to-[#7A0C29]">
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center space-x-2">
                        <span class="text-lg">🍒</span>
                        <div class="text-base font-semibold text-gray-800">
                          Cherries
                          <span class="text-sm font-normal text-gray-600 ml-1">({{
                            toppingsOptions["cherries"].price === 0
                              ? "Free"
                              : `₱${toppingsOptions["cherries"].price}`
                          }})</span>
                        </div>
                      </div>
                      <div class="text-sm text-gray-500 mt-1">
                        Red cherries with green stems placed on top
                      </div>
                    </div>
                  </label>
                </div>

                <!-- Strawberries -->
                <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label class="flex items-center space-x-4 cursor-pointer select-none">
                    <div class="relative">
                      <input type="checkbox" class="sr-only peer" :checked="selectedLayerConfig?.toppings?.some(
                        (t) => t.type === 'strawberries'
                      )
                        " @change="
                          updateToppingState('strawberries', $event.target.checked)
                          " />
                      <div
                        class="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#58091F]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#58091F] peer-checked:to-[#7A0C29]">
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center space-x-2">
                        <span class="text-lg">🍓</span>
                        <div class="text-base font-semibold text-gray-800">
                          Strawberries
                          <span class="text-sm font-normal text-gray-600 ml-1">({{
                            toppingsOptions["strawberries"].price === 0
                              ? "Free"
                              : `₱${toppingsOptions["strawberries"].price}`
                          }})</span>
                        </div>
                      </div>
                      <div class="text-sm text-gray-500 mt-1">
                        Fresh strawberries piled naturally on your cake
                      </div>
                    </div>
                  </label>

                  <!-- Strawberry Position Options -->
                  <div v-if="
                    selectedLayerConfig?.toppings?.some(
                      (t) => t.type === 'strawberries'
                    )
                  " class="mt-4 pt-4 border-t border-gray-200">
                    <label class="text-sm font-semibold text-gray-700 block mb-3">Strawberry Position</label>
                    <div class="grid grid-cols-2 gap-2">
                      <button v-for="position in [
                        { value: 'inner', label: 'Inner', desc: 'Close to center' },
                        { value: 'mid', label: 'Mid', desc: 'Middle area' },
                        { value: 'outer', label: 'Outer', desc: 'Near edge' },
                        { value: 'all', label: 'All', desc: 'Full coverage' },
                      ]" :key="position.value" @click="
                          updateLayerProperty(
                            selectedLayerId,
                            'strawberryPosition',
                            position.value
                          )
                          " :class="[
                          'flex flex-col p-3 border-2 rounded-lg transition-all duration-200 touch-manipulation',
                          (!selectedLayerConfig?.strawberryPosition &&
                            position.value === 'inner') ||
                            selectedLayerConfig?.strawberryPosition === position.value
                            ? 'border-[#58091F] bg-[#58091F] text-white shadow-lg'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 active:scale-95',
                        ]">
                        <span class="text-sm font-medium">{{ position.label }}</span>
                        <span class="text-xs opacity-75">{{ position.desc }}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Blueberries -->
                <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label class="flex items-center space-x-4 cursor-pointer select-none">
                    <div class="relative">
                      <input type="checkbox" class="sr-only peer" :checked="selectedLayerConfig?.toppings?.some(
                        (t) => t.type === 'blueberries'
                      )
                        " @change="updateToppingState('blueberries', $event.target.checked)" />
                      <div
                        class="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#58091F]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#58091F] peer-checked:to-[#7A0C29]">
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center space-x-2">
                        <span class="text-lg">🫐</span>
                        <div class="text-base font-semibold text-gray-800">
                          Blueberries
                          <span class="text-sm font-normal text-gray-600 ml-1">({{
                            toppingsOptions["blueberries"].price === 0
                              ? "Free"
                              : `₱${toppingsOptions["blueberries"].price}`
                          }})</span>
                        </div>
                      </div>
                      <div class="text-sm text-gray-500 mt-1">
                        Fresh blueberries scattered across the top
                      </div>
                    </div>
                  </label>
                </div>

                <!-- Candles -->
                <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label class="flex items-center space-x-4 cursor-pointer select-none">
                    <div class="relative">
                      <input type="checkbox" class="sr-only peer" :checked="selectedLayerConfig?.toppings?.some((t) => t.type === 'candle')
                        " @change="updateToppingState('candle', $event.target.checked)" />
                      <div
                        class="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#58091F]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#58091F] peer-checked:to-[#7A0C29]">
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center space-x-2">
                        <span class="text-lg">🕯️</span>
                        <div class="text-base font-semibold text-gray-800">
                          Candles
                          <span class="text-sm font-normal text-gray-600 ml-1">({{
                            toppingsOptions["candle"].price === 0
                              ? "Free"
                              : `₱${toppingsOptions["candle"].price}`
                          }})</span>
                        </div>
                      </div>
                      <div class="text-sm text-gray-500 mt-1">
                        Beautiful birthday candles with flames
                      </div>
                    </div>
                  </label>

                  <!-- Candle Position Options -->
                  <div v-if="selectedLayerConfig?.toppings?.some((t) => t.type === 'candle')"
                    class="mt-4 pt-4 border-t border-gray-200">
                    <label class="text-sm font-semibold text-gray-700 block mb-3">Candle Position</label>
                    <select :value="selectedLayerConfig?.candlePosition || 'center'" @change="
                      updateLayerProperty(
                        selectedLayerId,
                        'candlePosition',
                        $event.target.value
                      )
                      "
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#58091F] focus:border-[#58091F]">
                      <option value="center">Center</option>
                      <option value="top">Top (Distributed)</option>
                      <option value="around_edge">Around Edge</option>
                      <option value="front_group">Front (Grouped)</option>
                      <option value="custom_pattern">Custom Pattern</option>
                      <!-- Specific positions like printed topper -->
                      <option value="front">Front (Single/Central)</option>
                      <option value="back">Back (Single/Central)</option>
                      <option value="left">Left (Single/Central)</option>
                      <option value="right">Right (Single/Central)</option>
                      <option value="front-left">Front Left</option>
                      <option value="front-right">Front Right</option>
                      <option value="back-left">Back Left</option>
                      <option value="back-right">Back Right</option>
                    </select>
                  </div>
                </div>

                <!-- Crush Oreo -->
                <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label class="flex items-center space-x-4 cursor-pointer select-none">
                    <div class="relative">
                      <input type="checkbox" class="sr-only peer" :checked="selectedLayerConfig?.toppings?.some(
                        (t) => t.type === 'crush_oreo'
                      )
                        " @change="updateToppingState('crush_oreo', $event.target.checked)" />
                      <div
                        class="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#58091F]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#58091F] peer-checked:to-[#7A0C29]">
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center space-x-2">
                        <span class="text-lg">🍪</span>
                        <div class="text-base font-semibold text-gray-800">
                          Crush Oreo
                          <span class="text-sm font-normal text-gray-600 ml-1">({{
                            toppingsOptions["crush_oreo"].price === 0
                              ? "Free"
                              : `₱${toppingsOptions["crush_oreo"].price}`
                          }})</span>
                        </div>
                      </div>
                      <div class="text-sm text-gray-500 mt-1">
                        Crushed Oreo cookies and cream pieces
                      </div>
                    </div>
                  </label>
                </div>

                <!-- Christmas Balls -->
                <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label class="flex items-center space-x-4 cursor-pointer select-none">
                    <div class="relative">
                      <input type="checkbox" class="sr-only peer" :checked="selectedLayerConfig?.toppings?.some(
                        (t) => t.type === 'christmas_balls'
                      )
                        " @change="
                          updateToppingState('christmas_balls', $event.target.checked)
                          " />
                      <div
                        class="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#58091F]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#58091F] peer-checked:to-[#7A0C29]">
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center space-x-2">
                        <span class="text-lg">🎄</span>
                        <div class="text-base font-semibold text-gray-800">
                          Christmas Balls
                          <span class="text-sm font-normal text-gray-600 ml-1">({{
                            toppingsOptions["christmas_balls"].price === 0
                              ? "Free"
                              : `₱${toppingsOptions["christmas_balls"].price}`
                          }})</span>
                        </div>
                      </div>
                      <div class="text-sm text-gray-500 mt-1">
                        Colorful Christmas ornament balls with golden caps
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <!-- Greeting Text -->
          <div class="tab-content" v-show="activeTab === 'tab-greeting'" id="tab-greeting">
            <div class="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <!-- Mobile-Optimized Header -->
              <div class="bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white rounded-xl p-4 text-center shadow-md">
                <h3 class="text-lg sm:text-xl font-bold">Greeting Text</h3>
                <p class="text-sm opacity-90 mt-1">
                  Add a personalized message to your cake
                </p>
              </div>

              <!-- Enable Toggle -->
              <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                <label class="flex items-center space-x-4 cursor-pointer select-none">
                  <div class="relative">
                    <input type="checkbox" class="sr-only peer" v-model="greetingConfig.enabled"
                      @change="onGreetingChange" />
                    <div
                      class="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#58091F]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#58091F] peer-checked:to-[#7A0C29]">
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="text-base sm:text-lg font-semibold text-gray-800">
                      Enable Greeting Text
                    </div>
                    <div class="text-sm text-gray-500">Add custom text to your cake</div>
                  </div>
                </label>
              </div>

              <!-- Greeting Controls -->
              <div v-if="greetingConfig.enabled"
                class="bg-white rounded-xl shadow-lg border border-gray-100 p-4 space-y-6">
                <div class="flex items-center space-x-2 mb-4">
                  <div class="text-lg">✍️</div>
                  <h4 class="text-lg font-semibold text-gray-800">Text Settings</h4>
                </div>

                <!-- Message Input -->
                <div class="space-y-3">
                  <label class="text-sm font-semibold text-gray-700 block">Your Message</label>
                  <div class="relative">
                    <input type="text" v-model="greetingConfig.text" @input="onGreetingChange"
                      placeholder="Enter your greeting message..."
                      class="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-[#58091F]/20 focus:border-[#58091F] transition-all duration-200" />
                    <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      📝
                    </div>
                  </div>
                </div>

                <!-- Text Color Picker -->
                <div class="space-y-3">
                  <label class="text-sm font-semibold text-gray-700 block">Text Color</label>
                  <div class="flex items-center space-x-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <input type="color" v-model="greetingConfig.color" @input="onGreetingChange"
                      class="w-16 h-16 border-2 border-gray-300 rounded-xl cursor-pointer shadow-sm" />
                    <div class="flex-1">
                      <div class="text-sm font-medium text-gray-700">Selected Color</div>
                      <div class="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded mt-1">
                        {{ greetingConfig.color }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Text Size Slider -->
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-semibold text-gray-700">Text Size</label>
                    <div class="bg-[#58091F] text-white px-3 py-1 rounded-full text-xs font-bold">
                      {{ greetingConfig.size.toFixed(2) }}
                    </div>
                  </div>
                  <div class="relative">
                    <input type="range" min="0.1" max="0.8" step="0.01" v-model.number="greetingConfig.size"
                      @input="onGreetingChange"
                      class="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider-thumb" />
                    <div class="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Small</span>
                      <span>Large</span>
                    </div>
                  </div>
                </div>

                <!-- Layout Selection -->
                <div class="space-y-3">
                  <label class="text-sm font-semibold text-gray-700 block">Text Layout</label>
                  <div class="grid grid-cols-1 gap-3">
                    <button v-for="layout in [
                      {
                        value: 'horizontal-top',
                        label: 'Horizontal',
                        desc: 'On Top, Flat',
                        icon: '➡️',
                      },
                      {
                        value: 'circular-top',
                        label: 'Circular',
                        desc: 'On Top, Curved',
                        icon: '🔄',
                      },
                      {
                        value: 'vertical-side',
                        label: 'Vertical',
                        desc: 'On Side, Upright',
                        icon: '⬆️',
                      },
                    ]" :key="layout.value" @click="
                        greetingConfig.layout = layout.value;
                      onGreetingChange();
                      " :class="[
                        'flex items-center justify-between p-4 border-2 rounded-xl transition-all duration-200 touch-manipulation',
                        greetingConfig.layout === layout.value
                          ? 'border-[#58091F] bg-gradient-to-br from-[#58091F]/10 to-[#7A0C29]/10 shadow-lg'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300 active:scale-95',
                      ]">
                      <div class="flex items-center space-x-3">
                        <div class="text-lg">{{ layout.icon }}</div>
                        <div class="text-left">
                          <div class="font-medium text-gray-800">{{ layout.label }}</div>
                          <div class="text-sm text-gray-500">{{ layout.desc }}</div>
                        </div>
                      </div>
                      <div v-if="greetingConfig.layout === layout.value" class="text-[#58091F] text-lg">
                        ✓
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Modal -->
      <div v-if="isSuccessModalOpen"
        class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999] animate-in fade-in duration-300"
        @click="closeSuccessModal">
        <div
          class="bg-white rounded-2xl max-w-md w-11/12 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300"
          @click.stop>
          <div class="flex justify-between items-center p-2 px-4 pb-0 border-b border-gray-100 mb-6">
            <h2 class="text-2xl font-bold text-[#58091F] m-0">Success</h2>
            <button
              class="bg-transparent border-0 text-2xl text-gray-400 cursor-pointer p-2 rounded-lg hover:bg-gray-100 hover:text-gray-600 transition-all duration-200"
              @click="closeSuccessModal">
              &times;
            </button>
          </div>
          <div class="px-6 pb-6 text-center">
            <ion-icon :icon="icons.checkmarkCircleOutline" class="text-6xl text-green-500 mb-2"></ion-icon>
            <h3 class="text-xl font-semibold text-gray-800 mb-2 m-0">
              Custom Cake Added Successfully!
            </h3>
            <p class="text-gray-600 text-base mb-6 m-0">
              What would you like to do next?
            </p>
            <div class="flex flex-col gap-3">
              <button @click="goToCheckout"
                class="flex items-center justify-center gap-2 px-6 py-4 md:py-3 bg-gradient-to-r from-[#58091F] to-[#7A0C29] text-white font-bold text-lg md:text-base uppercase tracking-wide rounded-2xl md:rounded-xl min-h-[56px] md:min-h-[48px] shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation w-full">
                Proceed to Checkout
              </button>
              <button @click="closeSuccessModal"
                class="flex items-center justify-center gap-2 px-6 py-4 md:py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold text-lg md:text-base uppercase tracking-wide rounded-2xl md:rounded-xl min-h-[56px] md:min-h-[48px] shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation w-full">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonHeader, IonToolbar, IonContent, IonIcon } from "@ionic/vue";
import {
  cubeOutline,
  settingsOutline,
  constructOutline,
  layersOutline,
  flameOutline,
  iceCreamOutline,
  sparklesOutline,
  chatbubbleOutline,
  cartOutline,
  clipboardOutline,
  resizeOutline,
  restaurantOutline,
  cashOutline,
  documentTextOutline,
  closeOutline,
  chevronBackOutline,
  ellipsisVerticalOutline,
  checkmarkOutline,
  checkmarkCircleOutline,
} from "ionicons/icons";
import { onMounted, onUnmounted, ref, computed, reactive, watch, nextTick } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { useRouter } from "vue-router";

const router = useRouter();

// Add ref for tabs container
const tabsContainer = ref(null);
const activeTab = ref("tab-design");

// Function to scroll to active tab
const scrollToTab = (tabId) => {
  activeTab.value = tabId;
  nextTick(() => {
    const container = tabsContainer.value;
    const activeButton = container?.querySelector(`[data-tab="${tabId}"]`);

    if (container && activeButton) {
      const scrollLeft =
        activeButton.offsetLeft -
        container.clientWidth / 2 +
        activeButton.clientWidth / 2;
      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  });
};

let scene, camera, renderer, cakeGroup, controls, cakeStand;
let cakeLayers = ref([]);
let layerIdCounter = 0;
let historyStack = [];
const MAX_HISTORY = 20; // Limit history to prevent memory issues

// Function to save current state to history
const saveToHistory = () => {
  const currentState = {
    cakeLayers: JSON.parse(JSON.stringify(cakeLayers.value)),
    layerIdCounter: layerIdCounter,
  };

  historyStack.push(currentState);

  // Limit history size
  if (historyStack.length > MAX_HISTORY) {
    historyStack.shift();
  }

  // Enable/disable undo button
  const undoButton = document.getElementById("undoBtn");
  if (undoButton) {
    undoButton.disabled = historyStack.length === 0;
  }
};

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let selectedLayerId = ref(null);
let originalLayerMaterials = new Map();

// Add texture cache for better performance and consistent sizing
let textureCache = new Map();

const defaultLayerSettings = {
  radius: 0.5,
  height: 0.5,
  color: "",
  toppings: [],
  flowerPosition: "inner", // Default flower position
  roseColor: "red", // Default rose color
  strawberryPosition: "inner", // Default strawberry position
  candlePosition: "center", // Default candle position
  topper: {
    enabled: false,
    type: "none",
    text: "",
    fontSize: 1,
    color: "#000000",
    style: "normal",
    position: "center",
    size: 1,
    stickHeight: 0.4,
  },
  edgeIcing: {
    enabled: false,
    style: "smooth",
    color: "#FFFFFF",
    thickness: 0.05,
    isAnimating: false,
    animationProgress: 0,
    animationSpeed: 0.5,
  },
  surfaceIcing: {
    // New: For icing on the top surface of the layer
    enabled: false,
    color: "#FFFFFF",
    thickness: 0.02, // A small thickness for the surface icing layer
  },
  patternedTopIcing: {
    // New: For styled icing patterns on the top surface
    enabled: false,
    style: "smooth", // e.g., smooth, curl, shell, rosette
    color: "#FFC0CB", // Default to pink for visibility
    thickness: 0.04,
    position: "inner", // e.g., inner, mid, outer
    isAnimating: false, // For potential future animations
    animationProgress: 0,
    animationSpeed: 0.5,
  },
  bottomIcing: {
    enabled: false,
    style: "smooth",
    color: "#FFFFFF",
    thickness: 0.05,
    isAnimating: false,
    animationProgress: 0,
    animationSpeed: 0.5,
  },
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
      {
        diameter: 4,
        height: 5,
      },
      {
        diameter: 6,
        height: 5,
      },
    ],
    price: 2199,
  },
  {
    name: "5 x 5 & 7 x 5",
    diameter: [
      {
        diameter: 5,
        height: 5,
      },
      {
        diameter: 7,
        height: 5,
      },
    ],
    price: 2399,
  },
  {
    name: "6 x 5 & 8 x 5",
    diameter: [
      {
        diameter: 6,
        height: 5,
      },
      {
        diameter: 8,
        height: 5,
      },
    ],
    price: 2599,
  },
  {
    name: "7 x 5 & 9 x 5",
    diameter: [
      {
        diameter: 7,
        height: 5,
      },
      {
        diameter: 9,
        height: 5,
      },
    ],
    price: 2799,
  },
  {
    name: "8 x 5 & 10 x 5",
    diameter: [
      {
        diameter: 8,
        height: 5,
      },
      {
        diameter: 10,
        height: 5,
      },
    ],
    price: 3399,
  },
  {
    name: "9 x 5 & 11 x 5",
    diameter: [
      {
        diameter: 9,
        height: 5,
      },
      {
        diameter: 11,
        height: 5,
      },
    ],
    price: 3999,
  },
];

const threeTierSizeOptions = [
  {
    name: "4 x 5 & 6 x 5 & 8 x 5",
    diameter: [
      {
        diameter: 4,
        height: 5,
      },
      {
        diameter: 6,
        height: 5,
      },
      {
        diameter: 8,
        height: 5,
      },
    ],
    price: 3299,
  },
  {
    name: "5 x 5 & 7 x 5 & 9 x 5",
    diameter: [
      {
        diameter: 5,
        height: 5,
      },
      {
        diameter: 7,
        height: 5,
      },
      {
        diameter: 9,
        height: 5,
      },
    ],
    price: 3599,
  },
  {
    name: "6 x 5 & 8 x 5 & 10 x 5",
    diameter: [
      {
        diameter: 6,
        height: 5,
      },
      {
        diameter: 8,
        height: 5,
      },
      {
        diameter: 10,
        height: 5,
      },
    ],
    price: 4399,
  },
  {
    name: "7 x 5 & 9 x 5 & 11 x 5",
    diameter: [
      {
        diameter: 7,
        height: 5,
      },
      {
        diameter: 9,
        height: 5,
      },
      {
        diameter: 11,
        height: 5,
      },
    ],
    price: 5799,
  },
];

// Define computed sizeOptions based on the selected number of layers
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
    name: "Chocolate",
    description: "Rich and decadent chocolate flavor",
    color: "#4A2C2A",
  },
  {
    name: "Ube",
    description: "Traditional Filipino purple yam flavor",
    color: "#8A2BE2",
  },
  {
    name: "Vanilla",
    description: "Classic and versatile vanilla flavor",
    color: "#F5F5DC",
  },
  {
    name: "Mocha",
    description: "Perfect blend of coffee and chocolate",
    color: "#6F4E37",
  },
  {
    name: "Strawberry",
    description: "Sweet and fruity strawberry flavor",
    color: "#FFB6C1",
  },
];

const showSelectionsModal = ref(true);
const currentStep = ref(1);
const selectedLayers = ref(1);
const selectedSize = ref(null);
const selectedFlavor = ref(null);
const selectedLayerFlavors = ref({}); // For multi-layer flavor selection
const currentLayerIndex = ref(1); // Track current layer being configured for multi-layer
const showResetConfirmModal = ref(false);
const isBackModalClosing = ref(false); // Track closing state for exit animations
const isCartModalClosing = ref(false); // Track closing state for cart modal exit animations

// Computed property to check if user can proceed to next step
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return selectedLayers.value !== null;
    case 2:
      return selectedSize.value !== null;
    case 3:
      // For single layer, check selectedFlavor
      if (selectedLayers.value === 1) {
        return selectedFlavor.value !== null;
      }
      // For multi-layer, check if all layers have flavors
      else {
        const requiredLayers = selectedLayers.value;
        const selectedCount = Object.keys(selectedLayerFlavors.value).length;
        return selectedCount === requiredLayers;
      }
    default:
      return false;
  }
});

// Computed property for progress percentage
const getProgressPercentage = computed(() => {
  switch (currentStep.value) {
    case 1:
      // Step 1: 0% to 33%
      return selectedLayers.value !== null ? 33 : 0;
    case 2:
      // Step 2: 33% to 66%
      return selectedSize.value !== null ? 66 : 33;
    case 3:
      // Step 3: 66% to 100%
      const baseProgress = 66;
      if (selectedLayers.value === 1) {
        // Single layer: simple completion
        return selectedFlavor.value !== null ? 100 : baseProgress;
      } else {
        // Multi-layer: gradual progress based on completed layers
        const requiredLayers = selectedLayers.value;
        const completedLayers = Object.keys(selectedLayerFlavors.value).length;
        const flavorProgress = (completedLayers / requiredLayers) * 34; // 34% for the flavor step
        return baseProgress + flavorProgress;
      }
    default:
      return 0;
  }
});
const areFlavorsCompleted = computed(() => {
  if (!selectedLayers.value) return false;

  // For single layer, check selectedFlavor
  if (selectedLayers.value === 1) {
    return selectedFlavor.value !== null;
  }
  // For multi-layer, check if all layers have flavors
  else {
    const requiredLayers = selectedLayers.value;
    const selectedCount = Object.keys(selectedLayerFlavors.value).length;
    return selectedCount === requiredLayers;
  }
});
// Adjust cake stand to be proportional to the cake
const createCakeStand = (cakeDiameter = 6) => {
  const standGroup = new THREE.Group();
  const baseRadius = (cakeDiameter + 1) / 2; // 1 inch larger than cake
  const baseHeight = 0.5; // Increased base height
  const baseGeometry = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, 32);
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.7,
    metalness: 0.3,
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = -baseHeight / 2;
  standGroup.add(base);

  const pillarRadius = 0.2;
  const pillarHeight = 2.5; // Increased pillar height
  const pillarGeometry = new THREE.CylinderGeometry(
    pillarRadius,
    pillarRadius,
    pillarHeight,
    16
  );
  const pillarMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.7,
    metalness: 0.3,
  });
  const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
  pillar.position.y = pillarHeight / 2;
  standGroup.add(pillar);

  const topRadius = (cakeDiameter + 0.5) / 2; // Slightly larger than cake
  const topHeight = 0.05;
  const topGeometry = new THREE.CylinderGeometry(topRadius, topRadius, topHeight, 32);
  const topMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.7,
    metalness: 0.3,
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
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
  window.removeEventListener("resize", onWindowResize);
});

const initScene = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f4f8);
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // Set initial camera position (closer to the scene)
  camera.position.set(0, 0, 20);
  camera.lookAt(0, 0, 0);

  const canvas = document.getElementById("cakeCanvas");
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(10, 20, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  scene.add(directionalLight);

  // Create and position the cake stand (use default 6 if not available)
  cakeStand = createCakeStand(
    selectedSize.value
      ? Array.isArray(selectedSize.value.diameter)
        ? Math.max(...selectedSize.value.diameter.map((d) => d.diameter))
        : selectedSize.value.diameter
      : 6
  );
  cakeStand.position.y = 0;
  scene.add(cakeStand);

  // Add ground grid for reference
  const gridHelper = new THREE.GridHelper(30, 30, 0x888888, 0xcccccc);
  gridHelper.position.y = -0.01;
  scene.add(gridHelper);

  // Setup controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.minDistance = 2;
  controls.maxDistance = 100;
  controls.maxPolarAngle = Math.PI / 2 + 0.1;

  cakeGroup = new THREE.Group();
  scene.add(cakeGroup);

  initTabs();
  // document.getElementById('addLayerBtn').addEventListener('click', addNewLayerAndSelect);
  document.getElementById("saveCakeBtn").addEventListener("click", saveCakeConfiguration);
  document
    .getElementById("loadCakeInput")
    .addEventListener("change", loadCakeConfiguration);
  // document.getElementById('resetCakeBtn').addEventListener('click', resetCakeDesign);
  // document.getElementById('undoBtn').addEventListener('click', undoLastAction);

  window.addEventListener("resize", onWindowResize, false);
  renderer.domElement.addEventListener("click", onCanvasClick, false);

  addNewLayerAndSelect();
  startAnimationLoop();
};

const initTabs = () => {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));
      button.classList.add("active");
      const targetTabId = button.getAttribute("data-tab");
      document.getElementById(targetTabId).classList.add("active");

      // Update controls based on selected layer and active tab
      if (selectedLayerId.value) {
        switch (targetTabId) {
          case "tab-layer-editor":
            updateControlsForSelectedLayer();
            break;
          case "tab-topper":
            // updateControlsForSelectedTopper(); // Commented out - now using template-based UI
            break;
          case "tab-icing":
            // updateControlsForSelectedIcing(); // Commented out - now using template-based UI
            break;
          case "tab-toppings":
            // updateControlsForSelectedToppings(); // Commented out - now using template-based UI
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

  // Safety check to ensure cakeGroup is initialized
  if (!cakeGroup) {
    console.warn("cakeGroup not initialized yet, skipping click handling");
    return;
  }

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(
    cakeGroup.children.filter((child) => child.userData.isCakeLayer)
  );
  if (intersects.length > 0) {
    const clickedLayerObject = intersects[0].object;
    if (clickedLayerObject.userData.layerId) {
      selectLayer(clickedLayerObject.userData.layerId);
      // Get the active tab
      const activeTab = document.querySelector(".tab-button.active");
      if (activeTab) {
        const tabId = activeTab.getAttribute("data-tab");
        switch (tabId) {
          case "tab-layer-editor":
            updateControlsForSelectedLayer();
            break;
          case "tab-topper":
            // updateControlsForSelectedTopper(); // Commented out - now using template-based UI
            break;
          case "tab-icing":
            // updateControlsForSelectedIcing(); // Commented out - now using template-based UI
            break;
          case "tab-toppings":
            // updateControlsForSelectedToppings(); // Commented out - now using template-based UI
            break;
        }
      }
    }
  } else {
    selectLayer(null);
  }
};

const selectLayer = (layerId) => {
  // Safety check to ensure cakeGroup is initialized
  if (!cakeGroup) {
    console.warn("cakeGroup not initialized yet, skipping layer selection");
    selectedLayerId.value = layerId; // Still update the selected layer ID
    return;
  }

  if (selectedLayerId.value) {
    const previousLayerMesh = cakeGroup.children.find(
      (child) => child.userData.layerId === selectedLayerId.value
    );
    if (previousLayerMesh && originalLayerMaterials.has(selectedLayerId.value)) {
      previousLayerMesh.material = originalLayerMaterials.get(selectedLayerId.value);
      originalLayerMaterials.delete(selectedLayerId.value);
    }
  }
  selectedLayerId.value = layerId;
  if (selectedLayerId.value) {
    const currentLayerMesh = cakeGroup.children.find(
      (child) => child.userData.layerId === selectedLayerId.value
    );
    if (currentLayerMesh) {
      if (!originalLayerMaterials.has(selectedLayerId.value)) {
        originalLayerMaterials.set(selectedLayerId.value, currentLayerMesh.material);
      }
      // The following lines that change the emissive color have been removed:
      // currentLayerMesh.material = currentLayerMesh.material.clone();
      // currentLayerMesh.material.emissive.setHex(0x555555);
    }
  }
  updateControlsForSelectedLayer();
  renderCake();
};

const createLayerMesh = (radius, height, color, layerId) => {
  const geometry = new THREE.CylinderGeometry(radius, radius, height, 64);
  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.7,
    metalness: 0.1,
  });
  const layerMesh = new THREE.Mesh(geometry, material);
  layerMesh.userData.isCakeLayer = true;
  layerMesh.userData.layerId = layerId;
  return layerMesh;
};

// Load multiple font variants for different styles including stylish cake topper fonts
let loadedFonts = {
  normal: null,
  bold: null,
  italic: null,
  script: null,
  decorative: null,
  elegant: null,
  playful: null,
  classic: null,
};

const fontLoader = new FontLoader();

// Load regular font
fontLoader.load(
  "https://cdn.jsdelivr.net/npm/three@0.164.1/examples/fonts/helvetiker_regular.typeface.json",
  (font) => {
    loadedFonts.normal = font;
    console.log("Regular font loaded");
    // Only call renderCake if the scene is fully initialized
    if (typeof renderCake === "function" && cakeGroup && scene && renderer) {
      console.log("Triggering renderCake after font load");
      renderCake();
    }
  }
);

// Load bold font
fontLoader.load(
  "https://cdn.jsdelivr.net/npm/three@0.164.1/examples/fonts/helvetiker_bold.typeface.json",
  (font) => {
    loadedFonts.bold = font;
    console.log("Bold font loaded");
    // Re-render if needed
    if (typeof renderCake === "function" && cakeGroup && scene && renderer) {
      renderCake();
    }
  },
  undefined,
  (error) => {
    console.warn("Bold font not available, using regular font as fallback");
    loadedFonts.bold = loadedFonts.normal; // Fallback to normal
  }
);

// Load script font (elegant cursive style)
fontLoader.load(
  "https://cdn.jsdelivr.net/npm/three@0.164.1/examples/fonts/gentilis_regular.typeface.json",
  (font) => {
    loadedFonts.script = font;
    console.log("Script font loaded");
    if (typeof renderCake === "function" && cakeGroup && scene && renderer) {
      renderCake();
    }
  },
  undefined,
  (error) => {
    console.warn("Script font not available, using regular font as fallback");
    loadedFonts.script = loadedFonts.normal;
  }
);

// Load decorative font (bold gentilis for decorative style)
fontLoader.load(
  "https://cdn.jsdelivr.net/npm/three@0.164.1/examples/fonts/gentilis_bold.typeface.json",
  (font) => {
    loadedFonts.decorative = font;
    console.log("Decorative font loaded");
    if (typeof renderCake === "function" && cakeGroup && scene && renderer) {
      renderCake();
    }
  },
  undefined,
  (error) => {
    console.warn("Decorative font not available, using bold font as fallback");
    loadedFonts.decorative = loadedFonts.bold || loadedFonts.normal;
  }
);

// Load elegant font (optimer regular - clean and elegant)
fontLoader.load(
  "https://cdn.jsdelivr.net/npm/three@0.164.1/examples/fonts/optimer_regular.typeface.json",
  (font) => {
    loadedFonts.elegant = font;
    console.log("Elegant font loaded");
    if (typeof renderCake === "function" && cakeGroup && scene && renderer) {
      renderCake();
    }
  },
  undefined,
  (error) => {
    console.warn("Elegant font not available, using regular font as fallback");
    loadedFonts.elegant = loadedFonts.normal;
  }
);

// Load playful font (optimer bold - fun and bold)
fontLoader.load(
  "https://cdn.jsdelivr.net/npm/three@0.164.1/examples/fonts/optimer_bold.typeface.json",
  (font) => {
    loadedFonts.playful = font;
    console.log("Playful font loaded");
    if (typeof renderCake === "function" && cakeGroup && scene && renderer) {
      renderCake();
    }
  },
  undefined,
  (error) => {
    console.warn("Playful font not available, using bold font as fallback");
    loadedFonts.playful = loadedFonts.bold || loadedFonts.normal;
  }
);

// Load classic font (droid serif - traditional serif style)
fontLoader.load(
  "https://cdn.jsdelivr.net/npm/three@0.164.1/examples/fonts/droid/droid_serif_regular.typeface.json",
  (font) => {
    loadedFonts.classic = font;
    console.log("Classic font loaded");
    if (typeof renderCake === "function" && cakeGroup && scene && renderer) {
      renderCake();
    }
  },
  undefined,
  (error) => {
    console.warn("Classic font not available, using regular font as fallback");
    loadedFonts.classic = loadedFonts.normal;
  }
);

// For italic, we'll use transformation since italic fonts are less commonly available
// We'll apply a shear transformation to simulate italic
loadedFonts.italic = "transform"; // Special marker to use transform

// Compatibility getter for legacy code
Object.defineProperty(window, "loadedFont", {
  get: function () {
    return loadedFonts.normal;
  },
});

// Helper function to get the appropriate font based on style
const getFontForStyle = (style) => {
  if (!style || style === "normal") {
    return loadedFonts.normal;
  } else if (style === "bold") {
    return loadedFonts.bold || loadedFonts.normal; // Fallback to normal if bold not available
  } else if (style === "italic") {
    return loadedFonts.normal; // We'll use transform for italic
  } else if (style === "script") {
    return loadedFonts.script || loadedFonts.normal; // Elegant cursive style
  } else if (style === "decorative") {
    return loadedFonts.decorative || loadedFonts.bold || loadedFonts.normal; // Bold decorative style
  } else if (style === "elegant") {
    return loadedFonts.elegant || loadedFonts.normal; // Clean elegant style
  } else if (style === "playful") {
    return loadedFonts.playful || loadedFonts.bold || loadedFonts.normal; // Fun playful style
  } else if (style === "classic") {
    return loadedFonts.classic || loadedFonts.normal; // Traditional serif style
  }
  return loadedFonts.normal; // Default fallback
};

// Enhanced function to update topper font style with immediate feedback
const updateTopperFontStyle = (style) => {
  if (!selectedLayerId.value) return;

  console.log(`Updating topper font style to: ${style}`);

  // Save state for undo functionality
  saveToHistory();

  // Update the layer property
  updateLayerProperty(selectedLayerId.value, "topper.style", style);

  // Force immediate re-render for visual feedback
  renderCake();
};

// Global helper function to dispose of geometries and materials
const disposeObject = (object) => {
  if (object.isMesh) {
    if (object.geometry && object.geometry.dispose) {
      object.geometry.dispose();
    }
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((material) => material.dispose());
      } else {
        if (object.material && object.material.dispose) {
          object.material.dispose();
        }
      }
    }
  }
  if (object.children) {
    object.children.forEach((child) => disposeObject(child));
  }
};

const addDecorations = (layerMesh, layerConfig) => {
  const {
    radius: layerRadius,
    height: layerHeight,
    toppings,
    topper,
    edgeIcing,
    bottomIcing,
    surfaceIcing, // New: For icing on the top surface of the layer
    patternedTopIcing, // New: For styled icing patterns on the top surface
  } = layerConfig;
  const topY = layerHeight / 2;
  const bottomY = -layerHeight / 2;

  // Remove existing decorations
  const existingEdgeIcing = layerMesh.getObjectByName("edgeIcingGroup");
  if (existingEdgeIcing) {
    disposeObject(existingEdgeIcing);
    layerMesh.remove(existingEdgeIcing);
  }
  const existingSurfaceIcing = layerMesh.getObjectByName("surfaceIcingMesh"); // New: Remove existing surface icing
  if (existingSurfaceIcing) {
    disposeObject(existingSurfaceIcing);
    layerMesh.remove(existingSurfaceIcing);
  }
  const existingPatternedTopIcingGroup = layerMesh.getObjectByName(
    "patternedTopIcingGroup"
  ); // Changed from patternedTopIcingMesh
  if (existingPatternedTopIcingGroup) {
    disposeObject(existingPatternedTopIcingGroup);
    layerMesh.remove(existingPatternedTopIcingGroup);
  }
  const existingToppings = layerMesh.getObjectByName("toppingGroup");
  if (existingToppings) {
    disposeObject(existingToppings);
    layerMesh.remove(existingToppings);
  }
  const existingTopper = layerMesh.getObjectByName("topperGroup");
  if (existingTopper) {
    disposeObject(existingTopper);
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
    const currentLayerIndex = cakeLayers.value.findIndex(
      (layer) => layer.id === layerConfig.id
    );
    const isTopLayer = currentLayerIndex === cakeLayers.value.length - 1;

    // If it's not the top layer, we need to adjust the stick height to avoid intersections
    if (!isTopLayer) {
      // Calculate maximum safe height to avoid intersection with layer above
      // Get distance to the bottom of the layer above
      const layersAbove = cakeLayers.value.slice(currentLayerIndex + 1);
      const nextLayerHeight = layersAbove.reduce(
        (total, layer) => total + layer.height,
        0
      );

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
    // Increase the image offset to prevent overlap with the stick
    let imageYOffset = 0.15;

    // Calculate topper base position
    let topperY = topY;
    let topperX = 0;
    let topperZ = 0;

    if (topper.position === "top") {
      topperY += 0.1; // Slightly above the layer
      stickBaseY = topperY;
      stickTopY = stickBaseY + stickHeight;
    } else if (topper.position === "bottom") {
      topperY = bottomY - 0.1; // Slightly below the layer
      stickBaseY = topperY;
      stickTopY = stickBaseY + stickHeight;
    } else if (topper.position === "front") {
      topperZ = layerRadius * 0.6; // Move towards front
      stickBaseY = topY;
      stickTopY = stickBaseY + stickHeight;
    } else if (topper.position === "back") {
      topperZ = -layerRadius * 0.6; // Move towards back
      stickBaseY = topY;
      stickTopY = stickBaseY + stickHeight;
    } else if (topper.position === "left") {
      topperX = -layerRadius * 0.6; // Move towards left
      stickBaseY = topY;
      stickTopY = stickBaseY + stickHeight;
    } else if (topper.position === "right") {
      topperX = layerRadius * 0.6; // Move towards right
      stickBaseY = topY;
      stickTopY = stickBaseY + stickHeight;
    } else if (topper.position === "front-left") {
      topperX = -layerRadius * 0.4; // Move towards front-left
      topperZ = layerRadius * 0.4;
      stickBaseY = topY;
      stickTopY = stickBaseY + stickHeight;
    } else if (topper.position === "front-right") {
      topperX = layerRadius * 0.4; // Move towards front-right
      topperZ = layerRadius * 0.4;
      stickBaseY = topY;
      stickTopY = stickBaseY + stickHeight;
    } else if (topper.position === "back-left") {
      topperX = -layerRadius * 0.4; // Move towards back-left
      topperZ = -layerRadius * 0.4;
      stickBaseY = topY;
      stickTopY = stickBaseY + stickHeight;
    } else if (topper.position === "back-right") {
      topperX = layerRadius * 0.4; // Move towards back-right
      topperZ = -layerRadius * 0.4;
      stickBaseY = topY;
      stickTopY = stickBaseY + stickHeight;
    } else {
      // Default center position
      stickBaseY = topY;
      stickTopY = stickBaseY + stickHeight;
    }

    // Add stick/support for the topper
    const stickGeometry = new THREE.CylinderGeometry(0.02, 0.02, stickHeight, 8);
    const stickMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.7,
      metalness: 0.3,
    });
    const stick = new THREE.Mesh(stickGeometry, stickMaterial);
    stick.position.set(topperX, stickBaseY + stickHeight / 2, topperZ); // Use calculated position
    topperGroup.add(stick);

    // Add a small base for the stick
    const baseGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.7,
      metalness: 0.3,
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(topperX, stickBaseY - 0.01, topperZ); // Use calculated position
    topperGroup.add(base);

    // Only create topper text if font is loaded
    if (topper.type === "text") {
      const fontStyle = topper.style || "normal";
      const selectedFont = getFontForStyle(fontStyle);

      if (!selectedFont) {
        console.warn("Font not loaded yet, skipping topper text creation");
        return;
      }
      if (topper.text && topper.text.trim().length > 0) {
        const topperText = topper.text.trim();
        const sizeMultiplier = topper.size || 1;

        // Create text geometry with appropriate font
        const textGeometry = new TextGeometry(topperText, {
          font: selectedFont,
          size: 0.12 * topper.fontSize * sizeMultiplier,
          height: 0.02 * sizeMultiplier,
          curveSegments: 4,
          bevelEnabled: false,
        });

        textGeometry.computeBoundingBox();
        const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
        textGeometry.translate(-textWidth / 2, 0, 0); // Center horizontally

        // Enhanced material for better text appearance
        const textMaterial = new THREE.MeshStandardMaterial({
          color: topper.color || "#000000",
          roughness: 0.3,
          metalness: 0.1,
          transparent: false,
        });

        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Apply font style transformations and enhancements
        if (fontStyle === "italic") {
          // Apply italic transformation (shear)
          const matrix = new THREE.Matrix4();
          matrix.set(
            1,
            0,
            0.2,
            0, // Shear in X direction
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1
          );
          textMesh.geometry.applyMatrix4(matrix);
        }

        if (fontStyle === "bold" && !loadedFonts.bold) {
          // If bold font not available, simulate bold with scaling
          textMesh.scale.x = 1.1;
          textMesh.scale.z = 1.2; // Make text thicker
        }

        // Apply stylish font enhancements
        if (fontStyle === "script") {
          // Script font gets elegant material properties
          textMaterial.roughness = 0.2;
          textMaterial.metalness = 0.3;
          // Slight rotation for more elegant appearance
          textMesh.rotation.z = Math.PI * 0.02; // 3.6 degrees
        } else if (fontStyle === "decorative") {
          // Decorative font gets enhanced metallic look
          textMaterial.roughness = 0.1;
          textMaterial.metalness = 0.5;
          // Add slight scale enhancement
          textMesh.scale.set(1.05, 1.05, 1.2);
        } else if (fontStyle === "elegant") {
          // Elegant font gets refined material properties
          textMaterial.roughness = 0.25;
          textMaterial.metalness = 0.2;
          // Add slight letter spacing effect via scaling
          textMesh.scale.x = 1.02;
        } else if (fontStyle === "playful") {
          // Playful font gets fun scaling
          textMaterial.roughness = 0.4;
          textMaterial.metalness = 0.1;
          // Add slight bounce effect with scaling
          textMesh.scale.set(1.08, 1.05, 1.1);
        } else if (fontStyle === "classic") {
          // Classic font gets traditional serif enhancement
          textMaterial.roughness = 0.35;
          textMaterial.metalness = 0.15;
          // Add subtle shadow depth
          textMesh.scale.z = 1.3;
        }

        textMesh.position.set(topperX, stickTopY + textYOffset, topperZ);
        textMesh.name = "topperText";
        topperGroup.add(textMesh);
      }
    }
    // Handle backward compatibility: if type is text_image, treat as image
    else if ((topper.type === "image" || topper.type === "text_image") && topper.image) {
      const sizeMultiplier = topper.size || 1;

      // Check if texture is already cached
      if (textureCache.has(topper.image)) {
        // Use cached texture for immediate rendering
        const cachedTexture = textureCache.get(topper.image);
        const imageGeometry = new THREE.PlaneGeometry(
          0.5 * sizeMultiplier,
          0.5 * sizeMultiplier
        );
        const imageMaterial = new THREE.MeshStandardMaterial({
          map: cachedTexture,
          side: THREE.DoubleSide,
          transparent: true,
        });
        const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);

        // Calculate half height of the image to position it properly
        const imageHeight = 0.5 * sizeMultiplier;
        const halfImageHeight = imageHeight / 2;

        // Position image with proper offset to avoid overlap with stick
        imageMesh.position.set(
          topperX,
          stickTopY + imageYOffset + halfImageHeight,
          topperZ
        );
        imageMesh.name = "topperImage";
        topperGroup.add(imageMesh);
      } else {
        // Load texture and cache it
        const textureLoader = new THREE.TextureLoader();

        textureLoader.load(
          topper.image,
          (texture) => {
            // Cache the texture for future use
            textureCache.set(topper.image, texture);

            // Create image geometry with current size
            const imageGeometry = new THREE.PlaneGeometry(
              0.5 * sizeMultiplier,
              0.5 * sizeMultiplier
            );
            const imageMaterial = new THREE.MeshStandardMaterial({
              map: texture,
              side: THREE.DoubleSide,
              transparent: true,
            });
            const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);

            // Calculate half height of the image to position it properly
            const imageHeight = 0.5 * sizeMultiplier;
            const halfImageHeight = imageHeight / 2;

            // Position image with proper offset to avoid overlap with stick
            imageMesh.position.set(
              topperX,
              stickTopY + imageYOffset + halfImageHeight,
              topperZ
            );
            imageMesh.name = "topperImage";
            topperGroup.add(imageMesh);

            // Force a render update after the texture is loaded
            if (renderer && scene && camera) {
              renderer.render(scene, camera);
            }
          },
          (progress) => {
            // Optional: Handle loading progress
            console.log(
              "Topper image loading progress:",
              (progress.loaded / progress.total) * 100 + "%"
            );
          },
          (error) => {
            console.error("Error loading topper image:", error);
          }
        );
      }
    }

    // Add a small connector between stick and content
    const connectorGeometry = new THREE.CylinderGeometry(0.04, 0.03, 0.05, 12);
    const connectorMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.7,
      metalness: 0.3,
    });
    const connector = new THREE.Mesh(connectorGeometry, connectorMaterial);

    // Position connector slightly higher than the top of the stick to create a gentle transition
    connector.position.set(topperX, stickTopY + 0.02, topperZ); // Use calculated position
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
      metalness: 0.1,
    });
    if (edgeIcing.style === "smooth") {
      let angle = edgeIcing.isAnimating
        ? edgeIcing.animationProgress * Math.PI * 2
        : Math.PI * 2;
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
    } else if (edgeIcing.style === "curl") {
      const curlR = edgeIcing.thickness * 0.8;
      // Calculate number of curls based on circumference with overlap
      const circumference = Math.PI * 2 * (layerRadius - curlR);
      // Increase number of curls to ensure no gaps
      const numTotal = Math.max(1, Math.floor(circumference / (curlR * 1.2)));
      let numShow = edgeIcing.isAnimating
        ? Math.floor(edgeIcing.animationProgress * numTotal)
        : numTotal;

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
    } else if (edgeIcing.style === "shell") {
      const shellR = edgeIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - shellR);
      const numTotal = Math.max(1, Math.floor(circumference / (shellR * 1.2)));
      let numShow = edgeIcing.isAnimating
        ? Math.floor(edgeIcing.animationProgress * numTotal)
        : numTotal;

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
    } else if (edgeIcing.style === "rosette") {
      const rosetteR = edgeIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - rosetteR);
      const numTotal = Math.max(1, Math.floor(circumference / (rosetteR * 2)));
      let numShow = edgeIcing.isAnimating
        ? Math.floor(edgeIcing.animationProgress * numTotal)
        : numTotal;

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
    } else if (edgeIcing.style === "ruffle") {
      const ruffleR = edgeIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - ruffleR);
      const numTotal = Math.max(1, Math.floor(circumference / (ruffleR * 1.5)));
      let numShow = edgeIcing.isAnimating
        ? Math.floor(edgeIcing.animationProgress * numTotal)
        : numTotal;

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
    } else if (edgeIcing.style === "zigzag") {
      const zigzagR = edgeIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - zigzagR);
      const numTotal = Math.max(1, Math.floor(circumference / (zigzagR * 1.5)));
      let numShow = edgeIcing.isAnimating
        ? Math.floor(edgeIcing.animationProgress * numTotal)
        : numTotal;

      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;

        // Create zigzag segment
        const zigzagGroup = new THREE.Group();

        // Main point
        const point = new THREE.Mesh(
          new THREE.ConeGeometry(zigzagR * 0.8, zigzagR * 1.5, 4),
          icingMaterial
        );
        point.rotation.x = -Math.PI / 2; // Point downward for bottom icing

        // Base
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(zigzagR * 0.6, zigzagR * 0.6, zigzagR * 0.3, 4),
          icingMaterial
        );
        base.position.y = zigzagR * 0.9; // Position above downward-pointing zigzag

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

  if (bottomIcing.enabled) {
    const bottomIcingGroup = new THREE.Group();
    bottomIcingGroup.name = "bottomIcingGroup";
    const bottomIcingMaterial = new THREE.MeshStandardMaterial({
      color: bottomIcing.color,
      roughness: 0.6,
      metalness: 0.1,
    });
    if (bottomIcing.style === "smooth") {
      let angle = bottomIcing.isAnimating
        ? bottomIcing.animationProgress * Math.PI * 2
        : Math.PI * 2;
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
    } else if (bottomIcing.style === "curl") {
      const curlR = bottomIcing.thickness * 0.8;
      // Calculate number of curls based on circumference with overlap
      const circumference = Math.PI * 2 * (layerRadius - curlR);
      // Increase number of curls to ensure no gaps
      const numTotal = Math.max(1, Math.floor(circumference / (curlR * 1.2)));
      let numShow = bottomIcing.isAnimating
        ? Math.floor(bottomIcing.animationProgress * numTotal)
        : numTotal;

      // Create a group for all curls
      const curlGroup = new THREE.Group();

      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;

        // Add variation to curl size (smaller range to maintain consistency)
        const sizeVariation = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
        const curlSize = curlR * sizeVariation;

        // Create the main curl
        const curlGeo = new THREE.SphereGeometry(curlSize, 12, 8);
        const curl = new THREE.Mesh(curlGeo, bottomIcingMaterial);

        // Position with minimal randomness to maintain continuity
        const radiusVariation = (Math.random() - 0.5) * 0.05; // -0.025 to 0.025
        const heightVariation = (Math.random() - 0.5) * 0.05; // -0.025 to 0.025
        const angleVariation = (Math.random() - 0.5) * 0.1; // -0.05 to 0.05

        // Calculate position with minimal variations
        const curlRadius = layerRadius - curlSize * 0.7 + radiusVariation;
        const curlX = Math.cos(ang + angleVariation) * curlRadius;
        const curlZ = Math.sin(ang + angleVariation) * curlRadius;
        const curlY = bottomY - curlSize * 0.3 + heightVariation; // Position at bottom

        curl.position.set(curlX, curlY, curlZ);

        // Add minimal tilt to maintain continuity
        curl.rotation.x = (Math.random() - 0.5) * 0.2;
        curl.rotation.z = (Math.random() - 0.5) * 0.2;

        // Add a connecting "tail" to make it look more continuous
        const tailGeo = new THREE.ConeGeometry(curlSize * 0.6, curlSize * 1.2, 8);
        const tail = new THREE.Mesh(tailGeo, bottomIcingMaterial);
        tail.position.y = curlSize * 0.6; // Flip direction for bottom
        tail.rotation.x = -Math.PI / 2; // Flip rotation for bottom
        curl.add(tail);

        curlGroup.add(curl);
      }

      bottomIcingGroup.add(curlGroup);
    } else if (bottomIcing.style === "shell") {
      const shellR = bottomIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - shellR);
      const numTotal = Math.max(1, Math.floor(circumference / (shellR * 1.2)));
      let numShow = bottomIcing.isAnimating
        ? Math.floor(bottomIcing.animationProgress * numTotal)
        : numTotal;
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
    } else if (bottomIcing.style === "rosette") {
      const rosetteR = bottomIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - rosetteR);
      const numTotal = Math.max(1, Math.floor(circumference / (rosetteR * 2)));
      let numShow = bottomIcing.isAnimating
        ? Math.floor(bottomIcing.animationProgress * numTotal)
        : numTotal;
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
    } else if (bottomIcing.style === "ruffle") {
      const ruffleR = bottomIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - ruffleR);
      const numTotal = Math.max(1, Math.floor(circumference / (ruffleR * 1.5)));
      let numShow = bottomIcing.isAnimating
        ? Math.floor(bottomIcing.animationProgress * numTotal)
        : numTotal;
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
    } else if (bottomIcing.style === "zigzag") {
      const zigzagR = bottomIcing.thickness * 0.8;
      const circumference = Math.PI * 2 * (layerRadius - zigzagR);
      const numTotal = Math.max(1, Math.floor(circumference / (zigzagR * 1.5)));
      let numShow = bottomIcing.isAnimating
        ? Math.floor(bottomIcing.animationProgress * numTotal)
        : numTotal;
      for (let i = 0; i < numShow; i++) {
        const ang = (i / numTotal) * Math.PI * 2;
        const zigzagGroup = new THREE.Group();
        const point = new THREE.Mesh(
          new THREE.ConeGeometry(zigzagR * 0.8, zigzagR * 1.5, 4),
          bottomIcingMaterial
        );
        point.rotation.x = -Math.PI / 2; // Point downward for bottom icing
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(zigzagR * 0.6, zigzagR * 0.6, zigzagR * 0.3, 4),
          bottomIcingMaterial
        );
        base.position.y = zigzagR * 0.9; // Position above downward-pointing zigzag
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

  // New: Add Surface Icing (on top of the layer)
  if (surfaceIcing && surfaceIcing.enabled) {
    const surfaceIcingMaterial = new THREE.MeshStandardMaterial({
      color: surfaceIcing.color || "#FFFFFF",
      roughness: 0.8, // Slightly rough to look like icing
      metalness: 0.1,
    });
    // Create a thin cylinder for the surface icing
    // Radius should be slightly smaller than layerRadius to avoid z-fighting if edge icing is also present
    // For now, let's make it slightly inset if edge icing is thick, otherwise full radius.
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

  // New: Add Patterned Top Icing (on top of the layer)
  if (patternedTopIcing && patternedTopIcing.enabled) {
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
        // Ensure baseRadius is large enough for curls
        const circumference = Math.PI * 2 * baseRadius;
        const numTotal = Math.max(1, Math.floor(circumference / (curlR * 1.5))); // Adjusted spacing
        for (let i = 0; i < numTotal; i++) {
          const ang = (i / numTotal) * Math.PI * 2;
          const sizeVariation = 0.9 + Math.random() * 0.2;
          const curlSize = curlR * sizeVariation;
          const curlGeo = new THREE.SphereGeometry(curlSize, 10, 6); // Reduced segments
          const curl = new THREE.Mesh(curlGeo, icingMaterial);
          const curlX = Math.cos(ang) * baseRadius;
          const curlZ = Math.sin(ang) * baseRadius;
          curl.position.set(curlX, icingYPosition, curlZ);
          const tailGeo = new THREE.ConeGeometry(curlSize * 0.6, curlSize * 1.2, 6);
          const tail = new THREE.Mesh(tailGeo, icingMaterial);
          tail.position.y = -curlSize * 0.6; // Pointing downwards slightly for top surface
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
          shellGroup.rotation.y = -ang + Math.PI / 2; // Orient shells outwards
          patternedTopIcingGroup.add(shellGroup);
        }
      }
    } else if (style === "rosette") {
      const rosetteR = thickness * 0.9; // Rosettes can be a bit larger
      if (baseRadius > rosetteR) {
        const circumference = Math.PI * 2 * baseRadius;
        const numTotal = Math.max(1, Math.floor(circumference / (rosetteR * 2.2))); // Wider spacing for rosettes
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
          rosetteGroup.rotation.x = Math.PI / 2; // Lay flat on surface
          rosetteGroup.rotation.y = -ang; // Orient with circle
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
          ruffleGroup.rotation.x = Math.PI / 2; // Lay flat
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
          point.rotation.x = Math.PI; // Point upwards for top surface
          const base = new THREE.Mesh(
            new THREE.CylinderGeometry(zigzagR * 0.6, zigzagR * 0.6, zigzagR * 0.3, 4),
            icingMaterial
          );
          base.position.y = -zigzagR * 0.9; // Position below upward-pointing zigzag
          zigzagGroup.add(point);
          zigzagGroup.add(base);
          zigzagGroup.position.set(
            Math.cos(ang) * baseRadius,
            icingYPosition,
            Math.sin(ang) * baseRadius
          );
          zigzagGroup.rotation.y = -ang + Math.PI / 4; // Align with segments
          patternedTopIcingGroup.add(zigzagGroup);
        }
      }
    }

    if (patternedTopIcingGroup.children.length > 0) {
      layerMesh.add(patternedTopIcingGroup);
    }
  }

  // Shared materials for better performance
  const sharedMaterials = {
    sprinkle: new THREE.MeshStandardMaterial({
      roughness: 0.8,
      metalness: 0.1,
    }),
    cherry: new THREE.MeshStandardMaterial({
      color: 0xaa0000,
      roughness: 0.4,
      metalness: 0.2,
    }),
    cherryStem: new THREE.MeshStandardMaterial({
      color: 0x006400,
      roughness: 0.6,
    }),
    strawberry: new THREE.MeshStandardMaterial({
      color: 0xff3b3b,
      roughness: 0.7,
      metalness: 0.1,
    }),
    strawberryLeaf: new THREE.MeshStandardMaterial({
      color: 0x228b22,
      roughness: 0.8,
    }),
    // Add more shared materials as needed
  };

  // Shared geometries for better performance
  const sharedGeometries = {
    sprinkle: new THREE.BoxGeometry(0.03, 0.15, 0.03),
    cherryBody: new THREE.SphereGeometry(0.15, 8, 8), // Reduced segments
    cherryStem: new THREE.CylinderGeometry(0.02, 0.02, 0.2, 6), // Reduced segments
    strawberryBody: new THREE.ConeGeometry(0.12, 0.25, 8), // Reduced segments
    strawberryLeaf: new THREE.CylinderGeometry(0.1, 0.05, 0.05, 8),
  };

  // Helper function to dispose of geometries and materials
  const disposeObject = (object) => {
    if (object.isMesh) {
      if (object.geometry && !Object.values(sharedGeometries).includes(object.geometry)) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    }
    if (object.children) {
      object.children.forEach((child) => disposeObject(child));
    }
  };

  const overallToppingGroup = new THREE.Group();
  overallToppingGroup.name = "toppingGroup";
  toppings.forEach((topping) => {
    if (topping.type === "sprinkles") {
      const sprinkleCount = 75; // Reduced from 150 for better performance
      for (let i = 0; i < sprinkleCount; i++) {
        const sprinkle = new THREE.Mesh(
          sharedGeometries.sprinkle,
          sharedMaterials.sprinkle.clone()
        );
        sprinkle.material.color.setHSL(Math.random(), 0.8, 0.6);
        const angle = Math.random() * Math.PI * 2;
        const sprinkleRadius =
          layerRadius - (edgeIcing.enabled ? edgeIcing.thickness : 0) - 0.1;
        const dist = Math.random() * Math.max(0, sprinkleRadius);
        sprinkle.position.set(
          Math.cos(angle) * dist,
          topY + 0.075,
          Math.sin(angle) * dist
        );
        sprinkle.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        overallToppingGroup.add(sprinkle);
      }
    } else if (topping.type === "cherries") {
      const cherryCount = Math.max(1, Math.floor(layerRadius * 2)); // Reduced multiplier from 3 to 2
      for (let i = 0; i < cherryCount; i++) {
        const cherry = new THREE.Group();
        const body = new THREE.Mesh(sharedGeometries.cherryBody, sharedMaterials.cherry);
        cherry.add(body);
        const stem = new THREE.Mesh(
          sharedGeometries.cherryStem,
          sharedMaterials.cherryStem
        );
        stem.position.y = 0.15 + 0.05;
        stem.rotation.z = Math.PI / 6;
        cherry.add(stem);

        let angle, dist;
        const availableRadius =
          layerRadius - (edgeIcing.enabled ? edgeIcing.thickness : 0) - 0.15;
        if (cherryCount === 1) {
          angle = 0;
          dist = 0;
        } else {
          // Improved distribution using golden ratio for better spacing
          const goldenRatio = 0.618033988749895;
          angle = (i * goldenRatio * Math.PI * 2) % (Math.PI * 2);
          // Create multiple rings of cherries
          const ringIndex = Math.floor(i / (cherryCount / 3));
          const ringRadius = (availableRadius * 0.75 * (ringIndex + 1)) / 3;
          dist = ringRadius;
          // Add slight randomness to position
          dist += (Math.random() - 0.5) * (availableRadius * 0.1);
        }
        cherry.position.set(Math.cos(angle) * dist, topY + 0.15, Math.sin(angle) * dist);
        // Add slight random rotation for more natural look
        cherry.rotation.y = Math.random() * Math.PI * 2;
        overallToppingGroup.add(cherry);
      }
    } else if (topping.type === "strawberries") {
      // Simplified strawberry creation - no individual seeds for better performance
      const strawberryPosition = layerConfig.strawberryPosition || "inner";
      const availableRadius =
        layerRadius - (edgeIcing.enabled ? edgeIcing.thickness : 0) - 0.15;

      // Define positioning based on user selection
      let rings = [];
      const minRadius = 0.2;
      const strawberrySpacing = 0.5; // Increased spacing for fewer strawberries

      if (strawberryPosition === "inner") {
        const innerRadius = minRadius + (availableRadius - minRadius) * 0.3;
        const circumference = 2 * Math.PI * innerRadius;
        const strawberryCount = Math.max(
          2,
          Math.floor(circumference / strawberrySpacing)
        );
        rings = [{ radius: innerRadius, count: strawberryCount }];
      } else if (strawberryPosition === "mid") {
        const midRadius = minRadius + (availableRadius - minRadius) * 0.6;
        const circumference = 2 * Math.PI * midRadius;
        const strawberryCount = Math.max(
          3,
          Math.floor(circumference / strawberrySpacing)
        );
        rings = [{ radius: midRadius, count: strawberryCount }];
      } else if (strawberryPosition === "outer") {
        const outerRadius = availableRadius * 0.9;
        const circumference = 2 * Math.PI * outerRadius;
        const strawberryCount = Math.max(
          4,
          Math.floor(circumference / strawberrySpacing)
        );
        rings = [{ radius: outerRadius, count: strawberryCount }];
      } else if (strawberryPosition === "all") {
        const numberOfRings = 2; // Reduced from 3 rings
        for (let ring = 0; ring < numberOfRings; ring++) {
          const ringRadius =
            minRadius + (ring / (numberOfRings - 1)) * (availableRadius - minRadius);
          const circumference = 2 * Math.PI * ringRadius;
          const strawberriesInRing = Math.max(
            2,
            Math.floor(circumference / strawberrySpacing)
          );
          rings.push({ radius: ringRadius, count: strawberriesInRing });
        }
      }

      // Create strawberries for each ring (simplified version)
      rings.forEach((ring, ringIndex) => {
        for (let i = 0; i < ring.count; i++) {
          const strawberry = new THREE.Group();

          // Create strawberry body with size variation
          const sizeVariation = 0.8 + Math.random() * 0.4;
          const body = new THREE.Mesh(
            sharedGeometries.strawberryBody,
            sharedMaterials.strawberry
          );
          body.scale.setScalar(sizeVariation);
          body.rotation.x = Math.PI; // Flip upside down
          strawberry.add(body);

          // Add green top/leaves
          const leaves = new THREE.Mesh(
            sharedGeometries.strawberryLeaf,
            sharedMaterials.strawberryLeaf
          );
          leaves.scale.setScalar(sizeVariation);
          leaves.position.y = 0.125 * sizeVariation;
          strawberry.add(leaves);

          // Position strawberry
          const baseAngle = (i / ring.count) * Math.PI * 2;
          strawberry.position.set(
            Math.cos(baseAngle) * ring.radius,
            topY + 0.125 * sizeVariation,
            Math.sin(baseAngle) * ring.radius
          );

          // Add natural rotation
          strawberry.rotation.y = Math.random() * Math.PI * 2;
          overallToppingGroup.add(strawberry);
        }
      });
    } else if (topping.type === "blueberries") {
      const blueberryCount = Math.max(2, Math.floor(layerRadius * 5)); // More blueberries as they're smaller
      const blueberryMaterial = new THREE.MeshStandardMaterial({
        color: 0x4169e1,
        roughness: 0.5,
        metalness: 0.2,
      });
      const highlightMaterial = new THREE.MeshStandardMaterial({
        color: 0xe6e6fa,
        roughness: 0.3,
        metalness: 0.4,
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
        const availableRadius =
          layerRadius - (edgeIcing.enabled ? edgeIcing.thickness : 0) - bodyRadius;

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
    } else if (topping.type === "candle") {
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
    } else if (topping.type === "crush_oreo") {
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
    } else if (topping.type === "christmas_balls") {
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

        overallToppingGroup.add(ball);
      }
    } else if (topping.type === "flowers") {
      // Get the selected flower position and rose color from layer config
      const flowerPosition = layerConfig.flowerPosition || "inner";
      const selectedRoseColor = layerConfig.roseColor || "red";
      const availableRadius =
        layerRadius - (edgeIcing.enabled ? edgeIcing.thickness : 0) - 0.25; // Increased from 0.15 to 0.25

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
      const minRadius = 0.25; // Increased from 0.2 to 0.25
      const flowerSpacing = 0.75; // Increased from 0.5 to 0.75 for larger roses

      if (flowerPosition === "inner") {
        // Single inner ring close to center with circumference-based count
        const innerRadius = minRadius + (availableRadius - minRadius) * 0.3;
        const circumference = 2 * Math.PI * innerRadius;
        const flowerCount = Math.max(4, Math.floor(circumference / flowerSpacing));
        rings = [{ radius: innerRadius, count: flowerCount }];
      } else if (flowerPosition === "mid") {
        // Single middle ring with circumference-based count
        const midRadius = minRadius + (availableRadius - minRadius) * 0.6;
        const circumference = 2 * Math.PI * midRadius;
        const flowerCount = Math.max(5, Math.floor(circumference / flowerSpacing));
        rings = [{ radius: midRadius, count: flowerCount }];
      } else if (flowerPosition === "outer") {
        // Single outer ring near edge with circumference-based count
        const outerRadius = availableRadius * 0.9;
        const circumference = 2 * Math.PI * outerRadius;
        const flowerCount = Math.max(6, Math.floor(circumference / flowerSpacing));
        rings = [{ radius: outerRadius, count: flowerCount }];
      } else if (flowerPosition === "all") {
        // Multiple concentric circles for full coverage
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
          const centerGeo = new THREE.SphereGeometry(0.05, 8, 8); // Increased from 0.03 to 0.05
          const center = new THREE.Mesh(centerGeo, roseMaterial);
          rose.add(center);

          // Create multiple layers of petals for 3D rose effect
          const petalLayers = 4; // Number of petal layers

          for (let layer = 0; layer < petalLayers; layer++) {
            const layerRadius = 0.06 + layer * 0.035; // Increased from 0.04+0.025 to 0.06+0.035
            const petalsInLayer = 5 + layer; // More petals in outer layers
            const layerHeight = layer * 0.03; // Increased from 0.02 to 0.03

            for (let p = 0; p < petalsInLayer; p++) {
              const petalAngle = (p / petalsInLayer) * Math.PI * 2 + layer * 0.3; // Offset each layer

              // Create petal using ellipsoid geometry for more realistic shape
              const petalGeo = new THREE.SphereGeometry(0.035 + layer * 0.015, 6, 4); // Increased from 0.025+0.01 to 0.035+0.015
              const petal = new THREE.Mesh(petalGeo, roseMaterial);

              // Position petal around the center
              const petalX = Math.cos(petalAngle) * layerRadius;
              const petalZ = Math.sin(petalAngle) * layerRadius;
              const petalY = layerHeight;

              petal.position.set(petalX, petalY, petalZ);

              // Scale and rotate petal for rose-like appearance
              petal.scale.set(1.5 + layer * 0.4, 0.4, 1.0 + layer * 0.3); // Increased from 1.2+0.3, 0.4, 0.8+0.2

              // Tilt petals outward and upward for realistic rose shape
              petal.rotation.x = -Math.PI / 6 + (layer * Math.PI) / 12;
              petal.rotation.y = petalAngle;
              petal.rotation.z = (Math.random() - 0.5) * 0.3; // Small random rotation

              rose.add(petal);
            }
          }

          // Add some outer guard petals for more realistic rose
          const guardPetals = 6;
          for (let g = 0; g < guardPetals; g++) {
            const guardAngle = (g / guardPetals) * Math.PI * 2;
            const guardGeo = new THREE.SphereGeometry(0.06, 6, 4);
            const guardPetal = new THREE.Mesh(guardGeo, roseMaterial);

            const guardRadius = 0.18;
            guardPetal.position.set(
              Math.cos(guardAngle) * guardRadius,
              -0.02,
              Math.sin(guardAngle) * guardRadius
            );

            guardPetal.scale.set(1.8, 0.3, 1.2);
            guardPetal.rotation.x = -Math.PI / 4;
            guardPetal.rotation.y = guardAngle;
            guardPetal.rotation.z = (Math.random() - 0.5) * 0.4;

            rose.add(guardPetal);
          }

          // Add green leaves to the rose
          const leafMaterial = new THREE.MeshStandardMaterial({
            color: 0x2e8b57, // Sea green color for leaves
            roughness: 0.7,
            metalness: 0.1,
          });

          // Add 2-3 leaves around the base of the rose
          const leafCount = 2 + Math.floor(Math.random() * 2); // 2-3 leaves
          for (let l = 0; l < leafCount; l++) {
            const leafAngle = (l / leafCount) * Math.PI * 2;

            // Create leaf using modified sphere geometry
            const leafGeo = new THREE.SphereGeometry(0.08, 6, 4);
            const leaf = new THREE.Mesh(leafGeo, leafMaterial);

            // Position leaf at the base of the rose, slightly offset
            const leafRadius = 0.2;
            leaf.position.set(
              Math.cos(leafAngle) * leafRadius,
              -0.1 - Math.random() * 0.05, // Below the rose
              Math.sin(leafAngle) * leafRadius
            );

            // Scale to create an elongated leaf shape
            leaf.scale.set(1.5, 0.2, 0.8);

            // Rotate to position naturally
            leaf.rotation.x = Math.PI / 3 + (Math.random() - 0.5) * 0.2; // Angle upward
            leaf.rotation.y = leafAngle + (Math.random() - 0.5) * 0.3; // Face outward
            leaf.rotation.z = (Math.random() - 0.5) * 0.4; // Random tilt

            rose.add(leaf);
          }

          // Position the rose in the current ring
          const angle = (i / ring.count) * Math.PI * 2;

          rose.position.set(
            Math.cos(angle) * ring.radius,
            topY + 0.12, // Increased from 0.08 to 0.12
            Math.sin(angle) * ring.radius
          );

          // Random rotation for natural look
          rose.rotation.y = Math.random() * Math.PI * 2;

          overallToppingGroup.add(rose);
        }
      });

      // Add a center rose for inner and all positions if there's space
      if ((flowerPosition === "inner" || flowerPosition === "all") && minRadius > 0.15) {
        const centerRose = new THREE.Group();

        // Create center 3D Rose
        const roseMaterial = new THREE.MeshStandardMaterial({
          color: roseColor,
          roughness: 0.3,
          metalness: 0.1,
        });

        // Create rose center
        const centerGeo = new THREE.SphereGeometry(0.05, 8, 8); // Increased from 0.03 to 0.05
        const center = new THREE.Mesh(centerGeo, roseMaterial);
        centerRose.add(center);

        // Create multiple layers of petals
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

            centerRose.add(petal);
          }
        }

        // Add guard petals
        const guardPetals = 6;
        for (let g = 0; g < guardPetals; g++) {
          const guardAngle = (g / guardPetals) * Math.PI * 2;
          const guardGeo = new THREE.SphereGeometry(0.06, 6, 4);
          const guardPetal = new THREE.Mesh(guardGeo, roseMaterial);

          const guardRadius = 0.18;
          guardPetal.position.set(
            Math.cos(guardAngle) * guardRadius,
            -0.02,
            Math.sin(guardAngle) * guardRadius
          );

          guardPetal.scale.set(1.8, 0.3, 1.2);
          guardPetal.rotation.x = -Math.PI / 4;
          guardPetal.rotation.y = guardAngle;
          guardPetal.rotation.z = (Math.random() - 0.5) * 0.4;

          centerRose.add(guardPetal);
        }

        // Add green leaves to the center rose
        const leafMaterial = new THREE.MeshStandardMaterial({
          color: 0x2e8b57, // Sea green color for leaves
          roughness: 0.7,
          metalness: 0.1,
        });

        // Add 2-3 leaves around the base of the rose
        const leafCount = 2 + Math.floor(Math.random() * 2); // 2-3 leaves
        for (let l = 0; l < leafCount; l++) {
          const leafAngle = (l / leafCount) * Math.PI * 2;

          // Create leaf using modified sphere geometry
          const leafGeo = new THREE.SphereGeometry(0.08, 6, 4);
          const leaf = new THREE.Mesh(leafGeo, leafMaterial);

          // Position leaf at the base of the rose, slightly offset
          const leafRadius = 0.2;
          leaf.position.set(
            Math.cos(leafAngle) * leafRadius,
            -0.1 - Math.random() * 0.05, // Below the rose
            Math.sin(leafAngle) * leafRadius
          );

          // Scale to create an elongated leaf shape
          leaf.scale.set(1.5, 0.2, 0.8);

          // Rotate to position naturally
          leaf.rotation.x = Math.PI / 3 + (Math.random() - 0.5) * 0.2; // Angle upward
          leaf.rotation.y = leafAngle + (Math.random() - 0.5) * 0.3; // Face outward
          leaf.rotation.z = (Math.random() - 0.5) * 0.4; // Random tilt

          centerRose.add(leaf);
        }

        // Position at center
        centerRose.position.set(0, topY + 0.12, 0); // Increased from 0.08 to 0.12
        centerRose.rotation.y = Math.random() * Math.PI * 2;

        overallToppingGroup.add(centerRose);
      }
    }
  });
  if (overallToppingGroup.children.length > 0) layerMesh.add(overallToppingGroup);
};

// Greeting config and group
const greetingConfig = reactive({
  enabled: false,
  text: "Happy B-Day!",
  color: "#333333",
  size: 0.25,
  depth: 0.05,
  layout: "horizontal-top",
});

function onGreetingChange() {
  renderCake();
}

// Computed property to get the currently selected layer configuration
const selectedLayerConfig = computed(() => {
  if (!selectedLayerId.value) return null;
  const layer = cakeLayers.value.find((l) => l.id === selectedLayerId.value);
  return layer;
});

// Function to update topping state
const updateToppingState = (toppingType, enabled) => {
  if (!selectedLayerId.value) return;

  const layer = cakeLayers.value.find((l) => l.id === selectedLayerId.value);
  if (!layer) return;

  saveToHistory(); // Save state before making changes

  const existingToppingIndex = layer.toppings.findIndex((t) => t.type === toppingType);

  if (enabled) {
    if (existingToppingIndex === -1) {
      layer.toppings.push({ type: toppingType });
    }
  } else {
    if (existingToppingIndex !== -1) {
      layer.toppings.splice(existingToppingIndex, 1);
    }
  }

  // Use debounced render for better performance
  debouncedRender();
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      updateLayerProperty(selectedLayerId.value, "topper.image", e.target.result);
    };
    reader.readAsDataURL(file);
  }
};

const addGreetingTextToCake = (currentHeightOffset, topLayerRadius, topLayerHeight) => {
  // Safety check to ensure cakeGroup is initialized
  if (!cakeGroup) {
    console.warn("cakeGroup not initialized yet, skipping greeting text");
    return;
  }

  // Remove existing greeting text if any
  const existingGreeting = cakeGroup.getObjectByName("greetingGroup");
  if (existingGreeting) {
    if (typeof disposeObject === "function") {
      disposeObject(existingGreeting);
    }
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
    bevelEnabled: false,
  });

  textGeometry.computeBoundingBox();
  const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
  const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;

  const textMaterial = new THREE.MeshStandardMaterial({
    color: greetingConfig.color,
    roughness: 0.7,
    metalness: 0.1,
  });

  const textMesh = new THREE.Mesh(textGeometry, textMaterial);

  // Position the text based on layout
  switch (greetingConfig.layout) {
    case "horizontal-top":
      textMesh.rotation.x = -Math.PI / 2;
      textMesh.position.set(
        -textWidth / 2,
        currentHeightOffset + 0.01, // Just above the cake's top
        0
      );
      break;
    case "circular-top":
      textMesh.position.set(0, currentHeightOffset + topLayerHeight / 2 + 0.1, 0);
      textMesh.rotation.x = -Math.PI / 2;
      // Create a circular path for the text
      const radius = topLayerRadius * 0.8;
      const textPath = new THREE.CurvePath();
      const circle = new THREE.EllipseCurve(
        0,
        0,
        radius,
        radius,
        0,
        Math.PI * 2,
        false,
        0
      );
      textPath.add(circle);
      // Apply the path to the text
      textMesh.geometry = new THREE.TextGeometry(greetingConfig.text, {
        font: loadedFonts.normal,
        size: greetingConfig.size,
        height: greetingConfig.depth,
        curveSegments: 12,
        bevelEnabled: false,
        path: textPath,
      });
      break;
    case "vertical-side":
      textMesh.position.set(
        topLayerRadius + 0.1,
        currentHeightOffset - topLayerHeight / 2,
        0
      );
      textMesh.rotation.y = Math.PI / 2;
      break;
  }

  greetingGroup.add(textMesh);
  cakeGroup.add(greetingGroup);
};

const addToppingsControlsUI = (layerConfig, container) => {
  const toppingsControlsDiv = document.createElement("div");
  toppingsControlsDiv.className = "control-group";

  // Get current toppings state
  const hasSprinkles = layerConfig.toppings.some((t) => t.type === "sprinkles");
  const hasCherries = layerConfig.toppings.some((t) => t.type === "cherries");
  const hasStrawberries = layerConfig.toppings.some((t) => t.type === "strawberries");
  const hasBlueberries = layerConfig.toppings.some((t) => t.type === "blueberries");
  const hasCandle = layerConfig.toppings.some((t) => t.type === "candle");
  const hasCrushOreo = layerConfig.toppings.some((t) => t.type === "crush_oreo");
  const hasChristmasBalls = layerConfig.toppings.some(
    (t) => t.type === "christmas_balls"
  );
  const hasFlowers = layerConfig.toppings.some((t) => t.type === "flowers");

  container.appendChild(toppingsControlsDiv);

  // Add event listeners for topping controls
  const sprinklesCheckbox = document.getElementById(
    `toppings_tab_sprinkles_${layerConfig.id}`
  );
  const sprinklesControls = document.getElementById(
    `sprinkles_controls_${layerConfig.id}`
  );

  sprinklesCheckbox.addEventListener("change", (e) => {
    updateLayerProperty(layerConfig.id, "toppings.sprinkles", e.target.checked);
    sprinklesControls.classList.toggle("hidden", !e.target.checked);
  });

  const cherriesCheckbox = document.getElementById(
    `toppings_tab_cherries_${layerConfig.id}`
  );
  const cherriesControls = document.getElementById(`cherries_controls_${layerConfig.id}`);

  cherriesCheckbox.addEventListener("change", (e) => {
    updateLayerProperty(layerConfig.id, "toppings.cherries", e.target.checked);
    cherriesControls.classList.toggle("hidden", !e.target.checked);
  });

  const strawberriesCheckbox = document.getElementById(
    `toppings_tab_strawberries_${layerConfig.id}`
  );
  const strawberriesControls = document.getElementById(
    `strawberries_controls_${layerConfig.id}`
  );

  strawberriesCheckbox.addEventListener("change", (e) => {
    updateLayerProperty(layerConfig.id, "toppings.strawberries", e.target.checked);
    strawberriesControls.classList.toggle("hidden", !e.target.checked);
  });

  // Add event listeners for strawberry position radio buttons
  const strawberryPositionRadios = document.querySelectorAll(
    `input[name="strawberry_position_${layerConfig.id}"]`
  );
  strawberryPositionRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      if (e.target.checked) {
        updateLayerProperty(layerConfig.id, "strawberryPosition", e.target.value);
      }
    });
  });

  const blueberriesCheckbox = document.getElementById(
    `toppings_tab_blueberries_${layerConfig.id}`
  );
  const blueberriesControls = document.getElementById(
    `blueberries_controls_${layerConfig.id}`
  );

  blueberriesCheckbox.addEventListener("change", (e) => {
    updateLayerProperty(layerConfig.id, "toppings.blueberries", e.target.checked);
    blueberriesControls.classList.toggle("hidden", !e.target.checked);
  });

  const candleCheckbox = document.getElementById(`toppings_tab_candle_${layerConfig.id}`);
  const candleControls = document.getElementById(`candle_controls_${layerConfig.id}`);

  candleCheckbox.addEventListener("change", (e) => {
    updateLayerProperty(layerConfig.id, "toppings.candle", e.target.checked);
    candleControls.classList.toggle("hidden", !e.target.checked);
  });

  const crushOreoCheckbox = document.getElementById(
    `toppings_tab_crush_oreo_${layerConfig.id}`
  );
  const crushOreoControls = document.getElementById(
    `crush_oreo_controls_${layerConfig.id}`
  );

  crushOreoCheckbox.addEventListener("change", (e) => {
    updateLayerProperty(layerConfig.id, "toppings.crush_oreo", e.target.checked);
    crushOreoControls.classList.toggle("hidden", !e.target.checked);
  });

  const christmasBallsCheckbox = document.getElementById(
    `toppings_tab_christmas_balls_${layerConfig.id}`
  );
  const christmasBallsControls = document.getElementById(
    `christmas_balls_controls_${layerConfig.id}`
  );

  christmasBallsCheckbox.addEventListener("change", (e) => {
    updateLayerProperty(layerConfig.id, "toppings.christmas_balls", e.target.checked);
    christmasBallsControls.classList.toggle("hidden", !e.target.checked);
  });

  const flowersCheckbox = document.getElementById(
    `toppings_tab_flowers_${layerConfig.id}`
  );
  const flowersControls = document.getElementById(`flowers_controls_${layerConfig.id}`);

  flowersCheckbox.addEventListener("change", (e) => {
    updateLayerProperty(layerConfig.id, "toppings.flowers", e.target.checked);
    flowersControls.classList.toggle("hidden", !e.target.checked);
  });

  // Add event listeners for flower position radio buttons
  const flowerPositionRadios = document.querySelectorAll(
    `input[name="flower_position_${layerConfig.id}"]`
  );
  flowerPositionRadios.forEach((radio) => {
    radio.addEventListener(
      "change",
      throttledInputHandler((e) => {
        if (e.target.checked) {
          updateLayerProperty(layerConfig.id, "flowerPosition", e.target.value);
        }
      }, 200)
    );
  });

  // Add event listeners for rose color radio buttons
  const roseColorRadios = document.querySelectorAll(
    `input[name="rose_color_${layerConfig.id}"]`
  );
  roseColorRadios.forEach((radio) => {
    radio.addEventListener(
      "change",
      throttledInputHandler((e) => {
        if (e.target.checked) {
          updateLayerProperty(layerConfig.id, "roseColor", e.target.value);
        }
      }, 200)
    );
  });
};

// Add to Cart related reactive variables
const showCartConfirmModal = ref(false);
const showBackConfirmModal = ref(false);
const isSuccessModalOpen = ref(false);

// Function to handle back modal closing with animation
const closeBackModal = () => {
  isBackModalClosing.value = true;
  setTimeout(() => {
    showBackConfirmModal.value = false;
    isBackModalClosing.value = false;
  }, 400); // Match the animation duration
};

// Function to handle cart modal closing with animation
const closeCartModal = () => {
  isCartModalClosing.value = true;
  setTimeout(() => {
    showCartConfirmModal.value = false;
    isCartModalClosing.value = false;
  }, 400); // Match the animation duration
};

// Success modal functions
const closeSuccessModal = () => {
  isSuccessModalOpen.value = false;
};

const goToCheckout = () => {
  closeSuccessModal();
  router.replace("/cart");
};
const isLoading = ref(false);

const handleBackButton = (event) => {
  // Prevent default back button behavior
  event.preventDefault();
  showBackConfirmModal.value = true;
};

const confirmBack = () => {
  showBackConfirmModal.value = false;
  resetCustomization();
  router.push("/home");
};

const confirmReset = () => {
  showResetConfirmModal.value = false;
  resetCustomization();
};

// Special instructions for the order
const customerInfo = reactive({
  message: "",
});

// Import cart store
import { useCartStore } from "@/stores/cartStore";
import { toastController } from "@ionic/vue";
const cartStore = useCartStore();

// No required fields in the form anymore, so it's always valid
const isFormValid = computed(() => {
  return true;
});

// Show the add to cart modal
const showAddToCartModal = async () => {
  console.log("add to cart button was clicked!");
  const isActive = await cartStore.checkUserStatus();
  console.log("User status check:", isActive);

  if (!isActive) {
    const toast = await toastController.create({
      message: "Your account has been blocked. Please contact support.",
      duration: 2000,
      position: "top",
      color: "danger",
    });
    await toast.present();
    return;
  }
  // Validate before showing modal
  if (cakeLayers.value.length === 0) {
    alert("Please design your cake before adding to cart.");
    return;
  }

  if (!selectedSize.value) {
    alert("Please select a cake size before adding to cart.");
    return;
  }

  // Check flavor validation for both single and multi-layer
  if (selectedLayers.value === 1) {
    if (!selectedFlavor.value) {
      alert("Please select a cake flavor before adding to cart.");
      return;
    }
  } else {
    const requiredLayers = selectedLayers.value;
    const selectedCount = Object.keys(selectedLayerFlavors.value).length;
    if (selectedCount !== requiredLayers) {
      alert(
        `Please select flavors for all ${requiredLayers} layers before adding to cart.`
      );
      return;
    }
  }

  // All validations passed, show the modal
  showCartConfirmModal.value = true;
};

// Add the cake to cart and save to Firebase
const addToCart = async () => {
  isLoading.value = true;

  try {
    // Ensure the scene is properly rendered from a good angle
    const originalCameraPosition = { ...camera.position };

    // Move camera to a better position for capturing the cake
    camera.position.set(
      cakeLayers.value.length > 0 ? cakeLayers.value[0].radius * 2 : 5,
      cakeLayers.value.reduce((sum, layer) => sum + layer.height, 0) + 3,
      cakeLayers.value.length > 0 ? cakeLayers.value[0].radius * 2.5 : 5
    );
    camera.lookAt(
      0,
      cakeLayers.value.reduce((sum, layer) => sum + layer.height, 0) / 2,
      0
    );

    // Force render to ensure scene is updated
    renderer.render(scene, camera);

    // Create a rendered image of the cake as base64
    let cakeImageBase64;
    try {
      cakeImageBase64 = renderer.domElement.toDataURL("image/png");
      console.log("Captured cake image successfully");
    } catch (imageError) {
      console.error("Error capturing cake image:", imageError);
      cakeImageBase64 = null; // Will use a fallback image in the cart
    }

    // Restore camera to original position
    camera.position.set(
      originalCameraPosition.x,
      originalCameraPosition.y,
      originalCameraPosition.z
    );
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);

    // Create a deep copy of the cake design data
    const cakeDesignData = {
      cakeLayers: JSON.parse(JSON.stringify(cakeLayers.value)),
      layerIdCounter: layerIdCounter,
    };

    // Verify the design data is valid
    if (!cakeDesignData.cakeLayers || cakeDesignData.cakeLayers.length === 0) {
      throw new Error("Cake design is incomplete. Please add at least one layer.");
    }

    console.log("Design data to be saved:", cakeDesignData);

    // Helper function to get cake name based on flavors
    const getCakeName = () => {
      if (selectedLayers.value === 1) {
        return (
          "Custom " +
          (selectedFlavor.value ? selectedFlavor.value.name : "Multi-Flavor") +
          " Cake"
        );
      } else {
        const flavors = Object.values(selectedLayerFlavors.value);
        if (flavors.length === 0) return "Custom Multi-Layer Cake";
        if (flavors.length === 1) return "Custom " + flavors[0].name + " Cake";
        const uniqueFlavors = [...new Set(flavors.map((f) => f.name))];
        if (uniqueFlavors.length === 1)
          return "Custom " + uniqueFlavors[0] + " Multi-Layer Cake";
        return "Custom Multi-Flavor " + selectedLayers.value + "-Layer Cake";
      }
    };

    // Calculate toppings cost breakdown
    const toppingsBreakdown = selectedToppingsSummary.value.map((topping) => ({
      name: topping.name,
      count: topping.count,
      unitPrice: topping.price,
      totalPrice: topping.price * topping.count,
    }));

    const totalToppingsCost = toppingsBreakdown.reduce(
      (sum, topping) => sum + topping.totalPrice,
      0
    );

    // Prepare the cake data without an orderId - this will be added during checkout
    const customCakeItem = {
      name: getCakeName(),
      size: selectedSize.value ? selectedSize.value.name : "",
      totalToppingsCost: totalToppingsCost,
      unitPrice: selectedSize.value ? selectedSize.value.price : 0,
      totalPrice: totalPrice.value,
      quantity: 1,
      imageUrl: cakeImageBase64,
      isCustomCake: true,
      cakeId: "custom_" + Date.now(), // Generate a unique cakeId for each custom cake
      customDetails: {
        // Save design data exactly as the Save Design button does
        designData: cakeDesignData,
        // Still keep the other important info
        layers: selectedLayers.value,
        flavor: selectedFlavor.value
          ? JSON.parse(JSON.stringify(selectedFlavor.value))
          : null,
        layerFlavors: selectedLayerFlavors.value
          ? JSON.parse(JSON.stringify(selectedLayerFlavors.value))
          : {},
        greeting: greetingConfig.enabled
          ? JSON.parse(JSON.stringify(greetingConfig))
          : null,
        message: customerInfo.message.trim() || "",
        // Add toppings cost breakdown
        toppings: toppingsBreakdown,
        totalToppingsCost: totalToppingsCost,
        baseCakePrice: selectedSize.value ? selectedSize.value.price : 0,
      },
    };

    console.log("Adding custom cake to cart:", customCakeItem);

    // Add the custom cake to the cart
    await cartStore.addItem(customCakeItem);

    // Hide the cart confirmation modal
    showCartConfirmModal.value = false;

    // Reset the customization
    resetCustomization();

    // Show success modal instead of toast
    isSuccessModalOpen.value = true;
  } catch (error) {
    console.error("Error adding to cart:", error);
    const toast = await toastController.create({
      message: "Failed to add custom cake to cart. Please try again.",
      duration: 2000,
      position: "top",
      color: "danger",
    });
    await toast.present();
  } finally {
    isLoading.value = false;
  }
};

// Finish the order process - removed as we now redirect directly to cart

const resetCustomization = () => {
  // Reset selection modal state
  showSelectionsModal.value = true;
  currentStep.value = 1;
  selectedLayers.value = 1;
  selectedSize.value = null;
  selectedFlavor.value = null;
  selectedLayerFlavors.value = {};
  currentLayerIndex.value = 1;

  // Reset cake layers
  cakeLayers.value = [];
  layerIdCounter = 0;
  selectedLayerId.value = null;

  // Reset greeting configuration
  greetingConfig.enabled = false;
  greetingConfig.text = "";
  greetingConfig.color = "#000000";
  greetingConfig.size = 0.3;
  greetingConfig.layout = "horizontal-top";

  // Clear history stack
  historyStack = [];
  const undoButton = document.getElementById("undoBtn");
  if (undoButton) {
    undoButton.disabled = true;
  }

  // Reset customer info
  customerInfo.message = "";

  // Reset active tab to default
  activeTab.value = "tab-design";

  // Reset 3D view
  if (cakeGroup) {
    while (cakeGroup.children.length) {
      const child = cakeGroup.children[0];
      child.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      cakeGroup.remove(child);
    }
  }

  // Add initial layer
  addNewLayerAndSelect();
  renderCake();
};

// Add pricing calculation to consider layers as well
// Define topping prices
const toppingsOptions = ref({
  sprinkles: { name: "Sprinkles", price: 0 },
  flowers: { name: "Flowers", price: 0 },
  cherries: { name: "Cherries", price: 10 },
  strawberries: { name: "Strawberries", price: 50 },
  blueberries: { name: "Blueberries", price: 0 },
  candle: { name: "Candle", price: 0 },
  crush_oreo: { name: "Crush Oreo", price: 0 },
  christmas_balls: { name: "Christmas Balls", price: 50 },
});

// Add this computed property for displaying total price in the cart modal
const totalPrice = computed(() => {
  let total = 0;
  if (selectedSize.value) {
    total += selectedSize.value.price;
  }

  // Add cost of toppings
  cakeLayers.value.forEach((layer) => {
    if (layer.toppings && Array.isArray(layer.toppings)) {
      layer.toppings.forEach((topping) => {
        if (topping.type && toppingsOptions.value[topping.type]) {
          total += toppingsOptions.value[topping.type].price;
        }
      });
    }
  });

  return total;
});

const selectedToppingsSummary = computed(() => {
  const summary = {};
  cakeLayers.value.forEach((layer) => {
    if (layer.toppings && Array.isArray(layer.toppings)) {
      layer.toppings.forEach((topping) => {
        if (topping.type && toppingsOptions.value[topping.type]) {
          const toppingInfo = toppingsOptions.value[topping.type];
          if (summary[topping.type]) {
            summary[topping.type].count++;
          } else {
            summary[topping.type] = {
              name: toppingInfo.name,
              price: toppingInfo.price,
              count: 1,
            };
          }
        }
      });
    }
  });
  return Object.values(summary).filter((item) => item.count > 0);
});

// Export icons for template use
const icons = {
  cubeOutline,
  settingsOutline,
  constructOutline,
  layersOutline,
  flameOutline,
  iceCreamOutline,
  sparklesOutline,
  chatbubbleOutline,
  cartOutline,
  clipboardOutline,
  resizeOutline,
  restaurantOutline,
  cashOutline,
  documentTextOutline,
  closeOutline,
  chevronBackOutline,
  ellipsisVerticalOutline,
  checkmarkOutline,
  checkmarkCircleOutline,
};

const saveCakeConfiguration = () => {
  try {
    // Create a deep copy of the cake design data
    const cakeDesignData = {
      cakeLayers: JSON.parse(JSON.stringify(cakeLayers.value)),
      layerIdCounter: layerIdCounter,
      greetingConfig: JSON.parse(JSON.stringify(greetingConfig)),
      selectedLayers: selectedLayers.value,
      selectedSize: selectedSize.value
        ? JSON.parse(JSON.stringify(selectedSize.value))
        : null,
      selectedFlavor: selectedFlavor.value
        ? JSON.parse(JSON.stringify(selectedFlavor.value))
        : null,
      selectedLayerFlavors: JSON.parse(JSON.stringify(selectedLayerFlavors.value)),
      timestamp: Date.now(),
    };

    // Create a downloadable blob
    const dataStr = JSON.stringify(cakeDesignData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    // Create download link
    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `cake-design-${new Date().toISOString().slice(0, 10)}.json`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("Cake design saved successfully");
  } catch (error) {
    console.error("Error saving cake design:", error);
    alert("Failed to save cake design. Please try again.");
  }
};

const loadCakeConfiguration = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const designData = JSON.parse(e.target.result);

      // Validate the loaded data
      if (!designData.cakeLayers || !Array.isArray(designData.cakeLayers)) {
        throw new Error("Invalid design file format");
      }

      // Save current state to history before loading
      saveToHistory();

      // Load the design data
      cakeLayers.value = designData.cakeLayers;
      layerIdCounter = designData.layerIdCounter || cakeLayers.value.length;

      // Load greeting config if it exists
      if (designData.greetingConfig) {
        Object.assign(greetingConfig, designData.greetingConfig);
      }

      // Load flavor selection data if it exists
      if (designData.selectedLayers) {
        selectedLayers.value = designData.selectedLayers;
      }
      if (designData.selectedSize) {
        selectedSize.value = designData.selectedSize;
      }
      if (designData.selectedFlavor) {
        selectedFlavor.value = designData.selectedFlavor;
      }
      if (designData.selectedLayerFlavors) {
        selectedLayerFlavors.value = designData.selectedLayerFlavors;
      }

      // Clear current selection
      selectedLayerId.value = null;

      // Re-render the cake
      renderCake();

      console.log("Cake design loaded successfully");
    } catch (error) {
      console.error("Error loading cake design:", error);
      alert("Failed to load cake design. Please check the file format.");
    }
  };

  reader.readAsText(file);
  // Clear the input so the same file can be loaded again if needed
  event.target.value = "";
};

const addNewLayerAndSelect = () => {
  saveToHistory(); // Save state before making changes
  layerIdCounter++;
  const newLayerId = `layer_${layerIdCounter}`;
  const newLayer = {
    id: newLayerId,
    ...JSON.parse(JSON.stringify(defaultLayerSettings)),
  };
  if (cakeLayers.value.length > 0) {
    const topLayer = cakeLayers.value[cakeLayers.value.length - 1];
    newLayer.radius = Math.max(0.5, topLayer.radius - 0.3);
    newLayer.height = Math.max(0.3, topLayer.height - 0.1);
  }
  cakeLayers.value.push(newLayer);
  renderCake();
  selectLayer(newLayerId);
  const layerEditorTabButton = document.querySelector(
    '.tab-button[data-tab="tab-layer-editor"]'
  );
  if (layerEditorTabButton) {
    layerEditorTabButton.click();
  }
};

const selectLayers = (num) => {
  selectedLayers.value = num;
  // Reset layer index and clear previous selections when changing layer count
  currentLayerIndex.value = 1;
  selectedLayerFlavors.value = {};
  selectedFlavor.value = null;
};

const selectSize = (size) => {
  selectedSize.value = size;
};

const selectFlavor = (flavor) => {
  selectedFlavor.value = flavor;
};

const selectLayerFlavor = (layerIndex, flavor) => {
  selectedLayerFlavors.value[layerIndex] = flavor;

  // If single layer, also set the main selectedFlavor
  if (selectedLayers.value === 1) {
    selectedFlavor.value = flavor;
  }

  // For multi-layer, automatically advance to next layer
  if (selectedLayers.value > 1 && layerIndex < selectedLayers.value) {
    setTimeout(() => {
      currentLayerIndex.value = layerIndex + 1;
    }, 300); // Small delay for smooth transition
  }
};

const nextStep = () => {
  if (canProceed.value && currentStep.value < 3) {
    currentStep.value++;
    // Reset to first layer when entering flavor selection for multi-layer
    if (currentStep.value === 3 && selectedLayers.value > 1) {
      currentLayerIndex.value = 1;
    }
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const finishSelection = () => {
  if (canProceed.value) {
    showSelectionsModal.value = false;
    generateCakeFromSelections();
  }
};

const generateCakeFromSelections = () => {
  console.log("=== generateCakeFromSelections called ===");
  console.log("selectedLayers:", selectedLayers.value);
  console.log("selectedSize:", selectedSize.value);
  console.log("selectedFlavor:", selectedFlavor.value);
  console.log("selectedLayerFlavors:", selectedLayerFlavors.value);

  // Clear existing layers
  cakeLayers.value = [];
  layerIdCounter = 0;

  // Helper function to get layer flavor and color
  const getLayerFlavorColor = (layerIndex) => {
    // For single layer, use selectedFlavor
    if (selectedLayers.value === 1) {
      return selectedFlavor.value ? selectedFlavor.value.color : "#F0E68D";
    }
    // For multi-layer, use selectedLayerFlavors
    else {
      const layerFlavor = selectedLayerFlavors.value[layerIndex];
      return layerFlavor ? layerFlavor.color : "#F0E68D";
    }
  };

  // Check if the selected size has specific tier configurations (diameter as array)
  if (selectedSize.value && Array.isArray(selectedSize.value.diameter)) {
    console.log("Multi-tier detected, diameter array:", selectedSize.value.diameter);
    // Multi-tier cake: create layers based on diameter array data (reverse for bottom-to-top order)
    const reversedTiers = [...selectedSize.value.diameter].reverse();
    console.log("Reversed tiers (bottom to top):", reversedTiers);
    reversedTiers.forEach((tier, index) => {
      layerIdCounter++;
      const layerId = `layer_${layerIdCounter}`;
      const layerIndex = index + 1; // Layer index for flavor selection
      const layer = {
        id: layerId,
        ...JSON.parse(JSON.stringify(defaultLayerSettings)),
        radius: tier.diameter / 2, // Convert diameter to radius
        height: tier.height * 0.5, // Scale factor for 3D units
        color: getLayerFlavorColor(layerIndex),
      };
      console.log(`Created tier ${index + 1}:`, layer);
      cakeLayers.value.push(layer);
    });
  } else {
    console.log("Single-tier or fallback logic");
    // Single-tier cake or fallback: use original logic
    for (let i = 0; i < selectedLayers.value; i++) {
      layerIdCounter++;
      const layerId = `layer_${layerIdCounter}`;
      const baseRadius = selectedSize.value
        ? Array.isArray(selectedSize.value.diameter)
          ? Math.max(...selectedSize.value.diameter.map((d) => d.diameter)) / 2
          : selectedSize.value.diameter / 2
        : 3;
      const radiusReduction = i * 0.4;
      const layerIndex = selectedLayers.value - i; // Top to bottom indexing for flavor selection
      const layer = {
        id: layerId,
        ...JSON.parse(JSON.stringify(defaultLayerSettings)),
        radius:
          selectedLayers.value === 1
            ? baseRadius
            : Math.max(0.8, baseRadius - radiusReduction),
        height: selectedSize.value
          ? selectedLayers.value === 1
            ? selectedSize.value.height * 0.5
            : (selectedSize.value.height * 0.5) / selectedLayers.value
          : 0.8,
        color: getLayerFlavorColor(layerIndex),
      };
      console.log(`Created layer ${i + 1}:`, layer);
      cakeLayers.value.push(layer);
    }
  }

  console.log("Final cakeLayers:", cakeLayers.value);

  // Render the generated cake
  renderCake();

  // Auto-select the bottom layer
  if (cakeLayers.value.length > 0) {
    selectLayer(cakeLayers.value[0].id);
  }
};

const renderCake = () => {
  console.log("=== renderCake called ===");
  console.log("cakeLayers.value.length:", cakeLayers.value.length);
  console.log("cakeGroup initialized:", !!cakeGroup);

  // Safety check to ensure cakeGroup is initialized
  if (!cakeGroup) {
    console.warn("cakeGroup not initialized yet, skipping render");
    return;
  }

  // Remove existing cake layers and clean up memory
  const layersToRemove = cakeGroup.children.filter((child) => child.userData.isCakeLayer);
  layersToRemove.forEach((child) => {
    if (
      originalLayerMaterials.has(child.userData.layerId) &&
      child.material !== originalLayerMaterials.get(child.userData.layerId)
    ) {
      if (child.material.dispose) child.material.dispose();
    } else if (
      !originalLayerMaterials.has(child.userData.layerId) &&
      child.material &&
      child.material.dispose
    ) {
      if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
      else child.material.dispose();
    }
    if (child.geometry && child.geometry.dispose) child.geometry.dispose();
    child.traverse((object) => {
      if (object.isMesh) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) object.material.forEach((m) => m.dispose());
          else object.material.dispose();
        }
      }
    });
    cakeGroup.remove(child);
  });
  originalLayerMaterials.clear();

  // Make the cake sit lower on the stand platform for better integration
  let currentHeightOffset = cakeStand.userData.totalHeight - 0.05;
  let topLayerRadius = 0;
  let topLayerHeight = 0;

  if (cakeLayers.value.length > 0) {
    console.log("Creating layer meshes for", cakeLayers.value.length, "layers");
    cakeLayers.value.forEach((layerConfig, index) => {
      console.log(`Creating mesh for layer ${index + 1}:`, {
        radius: layerConfig.radius,
        height: layerConfig.height,
        color: layerConfig.color,
        id: layerConfig.id,
      });
      const layerMesh = createLayerMesh(
        layerConfig.radius,
        layerConfig.height,
        layerConfig.color,
        layerConfig.id
      );
      layerMesh.position.y = currentHeightOffset + layerConfig.height / 2;
      console.log(`Layer ${index + 1} positioned at y:`, layerMesh.position.y);
      addDecorations(layerMesh, layerConfig);
      cakeGroup.add(layerMesh);
      console.log(`Layer ${index + 1} added to cakeGroup`);
      currentHeightOffset += layerConfig.height;
      if (index === cakeLayers.value.length - 1) {
        topLayerRadius = layerConfig.radius;
        topLayerHeight = layerConfig.height;
      }
    });
    console.log(
      "cakeGroup.children.length after adding layers:",
      cakeGroup.children.length
    );
  } else {
    console.log("No layers to render");
  }

  // Add greeting text after layers
  addGreetingTextToCake(currentHeightOffset, topLayerRadius, topLayerHeight);

  // Render the scene
  renderer.render(scene, camera);
};

const onWindowResize = () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
};

const addLayerControlsUI = (layerConfig, container) => {
  const layerIndex = cakeLayers.value.findIndex((l) => l.id === layerConfig.id) + 1;
  const controlsDiv = document.createElement("div");
  controlsDiv.className = "p-4 space-y-4";

  controlsDiv.innerHTML = `
    <h3 class="text-xl font-bold text-center p-2 my-2">Layer ${layerIndex} Settings</h3>
    
    <div class="bg-white rounded-lg p-4 shadow-sm space-y-4">
      <!-- Layer Radius -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Layer Radius (${layerConfig.radius.toFixed(2)}):
        </label>
        <input type="range" 
          id="layer_radius_${layerConfig.id}"
          min="0.5" 
          max="5" 
          step="0.1"
          value="${layerConfig.radius}"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
      </div>
      
      <!-- Layer Height -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Layer Height (${layerConfig.height.toFixed(2)}):
        </label>
        <input type="range" 
          id="layer_height_${layerConfig.id}"
          min="0.3" 
          max="3" 
          step="0.1"
          value="${layerConfig.height}"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
      </div>
      
      <!-- Layer Color -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Layer Color:</label>
        <div class="flex items-center gap-3">
          <input type="color" 
            id="layer_color_${layerConfig.id}"
            value="${layerConfig.color}"
            class="w-14 h-10 p-1 border border-gray-300 rounded-md shadow-sm cursor-pointer">
          <span class="text-sm font-mono">${layerConfig.color}</span>
        </div>
      </div>
      
      <!-- Remove Layer Button -->
      <div class="pt-4 border-t">
        <button 
          id="remove_layer_${layerConfig.id}"
          class="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200">
          Remove Layer ${layerIndex}
        </button>
      </div>
    </div>
  `;

  container.appendChild(controlsDiv);

  // Add event listeners for the controls
  document
    .getElementById(`layer_radius_${layerConfig.id}`)
    .addEventListener("input", (e) => {
      updateLayerProperty(layerConfig.id, "radius", parseFloat(e.target.value));
      // Update the label
      e.target.previousElementSibling.textContent = `Layer Radius (${parseFloat(
        e.target.value
      ).toFixed(2)}):`;
    });

  document
    .getElementById(`layer_height_${layerConfig.id}`)
    .addEventListener("input", (e) => {
      updateLayerProperty(layerConfig.id, "height", parseFloat(e.target.value));
      // Update the label
      e.target.previousElementSibling.textContent = `Layer Height (${parseFloat(
        e.target.value
      ).toFixed(2)}):`;
    });

  document
    .getElementById(`layer_color_${layerConfig.id}`)
    .addEventListener("input", (e) => {
      updateLayerProperty(layerConfig.id, "color", e.target.value);
      // Update the color display
      e.target.nextElementSibling.textContent = e.target.value;
    });

  document
    .getElementById(`remove_layer_${layerConfig.id}`)
    .addEventListener("click", () => {
      if (cakeLayers.value.length > 1) {
        removeLayer(layerConfig.id);
      } else {
        alert("Cannot remove the last layer. A cake must have at least one layer.");
      }
    });
};

const updateControlsForSelectedLayer = () => {
  const controlsContainer = document.getElementById("selectedLayerControlsContainer");
  const prompt = document.getElementById("layerEditPrompt");
  controlsContainer.innerHTML = "";
  if (selectedLayerId.value) {
    const layerConfig = cakeLayers.value.find((l) => l.id === selectedLayerId.value);
    if (layerConfig) {
      if (prompt) prompt.style.display = "none";
      addLayerControlsUI(layerConfig, controlsContainer);
    } else {
      if (prompt) {
        prompt.textContent = "Error: Layer data not found.";
        prompt.style.display = "block";
      }
    }
  } else {
    if (prompt) {
      prompt.textContent = "Click a cake layer in the 3D view to edit it.";
      prompt.style.display = "block";
    }
  }
};

const startAnimationLoop = () => {
  const animate = () => {
    requestAnimationFrame(animate);

    // Add any rotation or animation effects here if needed
    // For now, we'll keep it simple and just render the scene

    // Render the scene
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  };

  animate();
};

// Performance optimization functions for smooth control interactions
const throttledInputHandler = (callback, delay = 150) => {
  let timeoutId;
  return (event) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(event), delay);
  };
};

const debouncedRender = (() => {
  let timeoutId;
  return (delay = 50) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      renderCake();
    }, delay);
  };
})();

// Throttled handlers for topper controls to improve performance
const throttledTopperUpdate = (() => {
  let timeoutId;
  return (property, value) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      updateLayerProperty(selectedLayerId.value, property, value);
    }, 150);
  };
})();

const handleThrottledTopperInput = (property, event) => {
  const value = parseFloat(event.target.value);
  throttledTopperUpdate(property, value);
};

const updateLayerProperty = (layerId, propertyPath, value) => {
  if (!layerId) {
    console.warn("No layer selected for property update");
    return;
  }

  const layerIndex = cakeLayers.value.findIndex((l) => l.id === layerId);
  if (layerIndex === -1) {
    console.warn("Layer not found:", layerId);
    return;
  }

  // Create a new array for cakeLayers to ensure reactivity.
  const newCakeLayers = [...cakeLayers.value];
  // Create a new object for the specific layer being modified.
  const updatedLayer = { ...newCakeLayers[layerIndex] };

  // Save current state to history before making changes to the layer data itself.
  // saveToHistory() typically stringifies cakeLayers.value, so call it before this specific modification is reflected in cakeLayers.value.
  // However, the current saveToHistory() is inside this function which might be an issue if it's meant to save the state *before* this call.
  // For now, assuming saveToHistory() is intended to capture the state *before* the current property change within this function's scope.
  saveToHistory();

  const pathParts = propertyPath.split(".");
  let target = updatedLayer; // Work with the copied layer object.

  // Navigate to the target nested object, creating copies for reactivity.
  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i];
    // Ensure nested objects exist by creating new ones if necessary.
    target[part] = { ...(target[part] || {}) };
    target = target[part];
  }

  // Set the final property value on the copied nested object.
  const finalProperty = pathParts[pathParts.length - 1];
  target[finalProperty] = value;

  // Replace the old layer object with the updated one in the new array.
  newCakeLayers[layerIndex] = updatedLayer;
  // Assign the new array to cakeLayers.value to trigger reactivity.
  cakeLayers.value = newCakeLayers;

  // If the property is candlePosition, render immediately.
  // Otherwise, use debounced render for other properties.
  if (propertyPath === "candlePosition") {
    console.log("Candle position updated, rendering cake immediately.");
    renderCake();
  } else {
    debouncedRender();
  }

  console.log(
    `Updated ${propertyPath} to:`,
    value,
    "for layer:",
    layerId,
    "New layer config:",
    updatedLayer
  );
};

const removeLayer = (layerIdToRemove) => {
  const layerIndex = cakeLayers.value.findIndex((l) => l.id === layerIdToRemove);
  if (layerIndex !== -1) {
    saveToHistory(); // Save state before removing
    cakeLayers.value.splice(layerIndex, 1);

    // If the removed layer was selected, select another layer or clear selection
    if (selectedLayerId.value === layerIdToRemove) {
      if (cakeLayers.value.length > 0) {
        // Select the layer at the same index, or the last layer if index is out of bounds
        const newIndex = Math.min(layerIndex, cakeLayers.value.length - 1);
        selectLayer(cakeLayers.value[newIndex].id);
      } else {
        selectedLayerId.value = null;
      }
    }

    renderCake();
  }
};

// Computed property for reactive layer number
const currentLayerNumber = computed(() => {
  if (!selectedLayerId.value || !cakeLayers.value) {
    return 1; // Default to layer 1 if no selection or no layers
  }

  const index = cakeLayers.value.findIndex((l) => l.id === selectedLayerId.value);
  if (index === -1) {
    return 1; // Default to layer 1 if layer not found
  }

  return index + 1; // Convert 0-based index to 1-based layer number
});
</script>

<style scoped>
.customize-page {
  --background: linear-gradient(135deg, #fff7d0 0%, #c8ad7e 100%);
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
  padding: 1rem;
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

/* Hide scrollbar for overflow-x-auto containers */
.overflow-x-auto {
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE and Edge */
}

.overflow-x-auto::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari, Opera */
}

.tab-button {
  padding: 0.75rem 1.25rem;
  border: 1px solid #7a5c1e;
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
  border-color: #7a5c1e;
}

.tab-button.active {
  background-color: #7a5c1e;
  color: #ffffff;
  border-color: #7a5c1e;
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

  padding: 16px;
}

.layer-header {
  font-weight: 600;
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
  padding: 1.5rem 0;
  max-width: 100%;
  margin: 0;
  box-shadow: none;
  background: #ffffff;
  overflow-y: auto;
}

/* Progress Bar Styles */
.progress-container {
  padding: 0.8rem 0;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
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
  background: #58091f;
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Step Content Styles */
.step-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.selection-step h2 {
  font-size: 1.6rem;
  color: #333;
  text-align: center;
  font-weight: 700;
}

.step-description {
  text-align: center;
  color: #666;
  margin-bottom: 2.5rem;
  font-size: 0.8rem;
  line-height: 1.5;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
}

.option-button {
  padding: 0.75rem;
  min-height: 10px;
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

/* Navigation Buttons */
.modal-navigation {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  position: sticky;
  bottom: 0;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

/* Navigation Container - Modern Mobile First Design */
.navigation-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.navigation-container.justify-end {
  justify-content: flex-end;
}

.nav-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 24px;
  font-weight: 700;
  text-transform: uppercase;
  tracking-wide: 0.5px;
  border-radius: 16px;
  min-height: 56px;
  font-size: 16px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  border: none;
  position: relative;
  overflow: hidden;
}

/* Secondary Button (Back) - Outline Style */
.nav-button.back {
  background: transparent;
  color: #58091f;
  border: 2px solid #58091f;
  flex: 1;
}

.nav-button.back:hover:not(:disabled) {
  background: rgba(88, 9, 31, 0.05);
  transform: translateY(-1px);
  border-color: #58091f;
}

.nav-button.back:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
  background: rgba(88, 9, 31, 0.1);
}

/* Primary Button (Next/Finish) - Filled Style */
.nav-button.next,
.nav-button.finish {
  background: linear-gradient(to right, #58091f, #7a0c29);
  color: white;
  border: 2px solid transparent;
  box-shadow: 0 4px 12px rgba(88, 9, 31, 0.25);
  flex: 1;
}

.nav-button.next:hover:not(:disabled),
.nav-button.finish:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 20px rgba(88, 9, 31, 0.3);
}

.nav-button.next:active:not(:disabled),
.nav-button.finish:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 8px rgba(88, 9, 31, 0.4);
}

/* Enhanced Mobile Touch Feedback */
@media (max-width: 768px) {
  .nav-button:active:not(:disabled) {
    transform: scale(0.95);
  }

  .nav-button.back:active:not(:disabled) {
    background: rgba(88, 9, 31, 0.15);
  }
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  filter: grayscale(0.5);
}

/* Navigation Button Icons */
.back-icon,
.next-icon,
.finish-icon {
  font-size: 20px;
  font-weight: bold;
  transition: all 0.2s ease;
}

.nav-button:hover:not(:disabled) .back-icon,
.nav-button:hover:not(:disabled) .next-icon,
.nav-button:hover:not(:disabled) .finish-icon {
  transform: scale(1.1);
}

/* Enhance finish button with special styling */
.nav-button.finish {
  background: linear-gradient(to right, #58091f, #7a0c29);
  position: relative;
}

/* Removed arrow icons */

/* Mobile-First Responsive Design */

/* Large Mobile / Small Tablet */
@media (max-width: 768px) {
  .navigation-container {
    padding: 16px;
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
    gap: 12px;
  }

  .nav-button {
    padding: 16px 24px;
    font-size: 16px;
    min-height: 56px;
    border-radius: 16px;
  }

  .back-icon,
  .next-icon,
  .finish-icon {
    font-size: 20px;
  }
}

/* Mobile Portrait */
@media (max-width: 480px) {
  .navigation-container {
    padding: 12px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    gap: 8px;
  }
}

/* Success Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0%;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fade-in 0.3s ease-out;
}

.modal-content {
  background: white;

  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: scale-in 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #58091f;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 0 24px 24px;
  text-align: center;
}

.success-icon {
  font-size: 64px;
  color: #10b981;
  margin-bottom: 16px;
}

.modal-body h3 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.modal-body p {
  margin: 0 0 24px;
  color: #6b7280;
  font-size: 16px;
}

.modal-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes scale-in {
  from {
    transform: scale(0.9);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .nav-button {
    flex: 1;
    min-width: 0;
    padding: 16px 20px;
    font-size: 1rem;
    min-height: 54px;
    max-width: calc(50% - 6px);
  }

  .back-icon,
  .next-icon,
  .finish-icon {
    font-size: 1.3rem;
    margin: 0 6px;
  }
}

/* Very Small Mobile */
@media (max-width: 360px) {
  .navigation-container {
    padding: 14px 12px;
    padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px));
    gap: 8px;
  }

  .nav-button {
    padding: 16px 18px;
    font-size: 0.95rem;
    min-height: 52px;
    letter-spacing: 0.2px;
  }

  .back-icon,
  .next-icon,
  .finish-icon {
    font-size: 1.2rem;
    margin: 0 4px;
  }
}

/* Layer Selection Styles */
.layers-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  max-width: 600px;
  margin: 0 auto;
}

.layer-card {
  display: flex;
  align-items: center;
  gap: 2rem;
  background: #ffffff;
  border: 2px solid #e8e8e8;
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
}

.layer-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: #f0e68d;
}

.layer-card.selected {
  border-color: #58091f;
  background: rgba(240, 230, 141, 0.05);
  box-shadow: 0 8px 24px rgba(88, 9, 31, 0.12);
}

.layer-visual {
  flex: 0 0 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.layer-stack {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cake-layer {
  position: absolute;
  width: 80px;
  height: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.layer-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.layer-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
}

.layer-description {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.layer-features {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #555;
  background: #f5f5f5;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
}

.feature ion-icon {
  font-size: 1.1rem;
  color: #58091f;
}

.layer-card.selected .layer-title {
  color: #58091f;
}

.step-title {
  color: #58091f;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  line-height: 1.2;
}

.step-description {
  color: #666;
  font-size: 1.1rem;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.5;
}

/* Confirmation Modal */
.confirmation-modal {
  width: 95%;
  max-width: none;
}

.form-group input,
.form-group textarea {
  font-size: 16px;
  /* Prevents zoom on mobile */
}

.option-content {
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
}

.option-icon {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
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
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
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
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-top: 1px solid #e0e0e0;
  position: sticky;
  bottom: 0;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
}

.modal-navigation .nav-button {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  min-width: unset;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  justify-content: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modal-navigation .nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.modal-navigation .nav-button.back {
  background: #f8f9fa;
  color: #666;
  border: 2px solid #e0e0e0;
}

.modal-navigation .nav-button.next {
  background: #58091f;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
}

.modal-navigation .nav-button.finish {
  background: #28a745;
  color: white;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
}

.modal-navigation .nav-button:hover:not(:disabled) {
  opacity: 0.95;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.modal-navigation .nav-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modal-navigation .back-icon,
.modal-navigation .next-icon,
.modal-navigation .finish-icon {
  font-size: 1.3rem;
}

/* Mobile Responsive Adjustments for Modal Navigation */
@media (max-width: 768px) {
  .modal-navigation {
    padding: 1.5rem;
  }

  .modal-navigation .nav-button {
    padding: 1rem 2rem;
    font-size: 1.1rem;
    min-width: 160px;
  }

  .modal-navigation .back-icon,
  .modal-navigation .next-icon,
  .modal-navigation .finish-icon {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .modal-navigation {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .modal-navigation .nav-button {
    width: 100%;
    padding: 1rem;
    font-size: 1rem;
    min-width: unset;
  }

  .modal-navigation .nav-button.next,
  .modal-navigation .nav-button.finish {
    margin-left: 0;
  }
}

/* Responsive Adjustments */
@media (max-width: 480px) {
  .options-grid {
    grid-template-columns: 1fr;
  }

  .option-icon {
    width: 60px;
    height: 60px;
  }
}

/* Mobile-First Header Styles */
ion-header {
  --background: #ffffff;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

ion-toolbar {
  --background: #f0e68d;
  --border-width: 0;
  padding: 8px 16px;
}

.back-button {
  --color: #58091f;
}

.customize-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #58091f;
  letter-spacing: 0.5px;
  padding-left: 16px;
}

/* Mobile-First Form Styles */
.topper-section {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  margin: 0.5rem;
}

.topper-section select,
.topper-section input[type="text"] {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.topper-section input[type="file"] {
  width: 100%;
  margin-top: 5px;
}

.topper-section .sub-controls {
  padding: 8px;
  background-color: rgb(255, 0, 0);
  border-radius: 4px;
  margin-top: 8px;
}

/* Mobile-First Step Content */
.step-content {
  padding: 1rem;
}

.selection-step {
  padding: 0.5rem;
}

/* Mobile-First Progress Bar */
.progress-container {
  padding: 2.4rem 0.5rem 0 0;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: #666;
}

.step-label {
  font-size: 0.8rem;
  color: #666;
}

.progress-step.active .step-number {
  background: #58091f;
  color: white;
}

.progress-step.completed .step-number {
  background: #28a745;
  color: white;
}

.progress-bar {
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #58091f;
  transition: width 0.3s ease;
}

/* Mobile-First Modal */
.selections-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Mobile-First Confirmation Modal */
.confirmation-modal {
  width: 95%;
  padding: 1rem;
  border-radius: 12px;
  background: white;
}

.confirmation-header {
  text-align: center;
  margin-bottom: 1rem;
}

.confirmation-title {
  font-size: 1.25rem;
  color: #58091f;
  margin-bottom: 0.5rem;
}

.confirmation-subtitle {
  font-size: 0.9rem;
  color: #666;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.confirmation-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.confirmation-button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.success-btn {
  background: #28a745;
  color: white;
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
  grid-template-columns: repeat(1, fr);
  gap: 0.75rem;
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
  content: "";
  position: absolute;
  width: 80%;
  height: 80%;
  border: 2px dashed #fff;
  border-radius: 50%;
}

.flavor-preview.chocolate {
  background: #4a2c2a;
}

.flavor-preview.ube {
  background: #8a2be2;
}

.flavor-preview.vanilla {
  background: #f5f5dc;
}

.flavor-preview.mocha {
  background: #6f4e37;
}

.flavor-preview.strawberry {
  background: #ffb6c1;
}

.flavor-description {
  text-align: center;
  color: #666;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  padding: 0.35rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.option-button:hover .flavor-preview {
  transform: scale(1.1);
}

.option-button.selected {
  border: 3px solid #58091f !important;
  background: rgba(240, 230, 141, 0.1) !important;
  box-shadow: 0 4px 16px rgba(88, 9, 31, 0.15) !important;
  transform: scale(1.02);
}

.option-button.selected .flavor-preview {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(88, 9, 31, 0.3);
  border: 2px solid #58091f;
}

.option-button.selected .flavor-preview::after {
  content: "✓";
  position: absolute;
  width: auto;
  height: auto;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-button.selected .option-label {
  color: #58091f !important;
  font-weight: 700 !important;
}

.option-button.selected .flavor-description {
  background: rgba(88, 9, 31, 0.1) !important;
  color: #58091f !important;
  font-weight: 600 !important;
}

/* Topper Controls Styles */
.topper-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 0.75rem;
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
  padding: 0.75rem;
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
  border: 1px solid #7a5c1e;
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
  border-color: #7a5c1e;
}

.tab-button.active {
  background-color: #7a5c1e;
  color: #ffffff;
  border-color: #7a5c1e;
  font-weight: bold;
}

.tab-content {
  display: none;
  padding: 0;
}

.tab-content.active {
  display: block;
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
  background-color: #7a5c1e;
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
  background: #7a5c1e;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.mobile-slider::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #7a5c1e;
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

/* Custom slider styling for mobile-friendly controls */
.slider-thumb::-webkit-slider-thumb {
  appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #58091f 0%, #7a0c29 100%);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.slider-thumb::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.slider-thumb::-webkit-slider-thumb:active {
  transform: scale(1.2);
}

.slider-thumb::-moz-range-thumb {
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #58091f 0%, #7a0c29 100%);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

/* Add to Cart Button Styles */
.add-to-cart-btn {
  background: #7a1e1e !important;
  font-weight: 700;
  margin-top: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(122, 30, 30, 0.3);
  border-radius: 12px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.add-to-cart-btn:hover {
  background: #8f2424 !important;
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(122, 30, 30, 0.4);
}

.add-to-cart-btn:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(122, 30, 30, 0.4);
}

.cart-icon {
  font-size: 1.25rem;
  margin-right: 10px;
}

.btn-text {
  font-size: 1.1rem;
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
  font-size: 16px;
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

.step-title {
  color: #58091f;
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.step-description {
  color: #666;
  font-size: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.layer-option {
  background: #ffffff;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.layer-option:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #f0e68d;
}

.layer-option.selected {
  border-color: #58091f;
  background: rgba(240, 230, 141, 0.1);
  box-shadow: 0 4px 16px rgba(88, 9, 31, 0.1);
}

.layer-preview-container {
  width: 80px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.preview-layer {
  width: 100%;
  height: var(--layer-height);
  background: var(--layer-color);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.layer-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.layer-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #58091f;
}

.layer-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.layer-option.selected .layer-number,
.layer-option.selected .layer-label {
  color: #58091f;
}

/* Add CSS for price display */
.price {
  font-weight: 600;
  color: #28a745;
  font-size: 1.1rem;
  margin-top: 0.25rem;
}

.total-price {
  font-size: 1.1rem;
  margin-top: 10px;
  color: #28a745;
}

.price-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid #e0e0e0;
}

/* Mobile-First Design */
.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
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

.modal-navigation {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-top: 1px solid #e0e0e0;
  position: sticky;
  bottom: 0;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
}

/* These styles are for other navigation contexts */

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
}

.option-button {
  padding: 0.75rem;
  background: #ffffff;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.option-button:hover {
  border-color: #f0e68d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.option-icon {
  width: 60px;
  height: 60px;
}

/* Removed duplicate nav-button style */

.size-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  /* Responsive grid */
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
}

.size-preview-container {
  width: 100%;
  aspect-ratio: 1;
  /* Keep preview square */
  display: flex;
  align-items: center;
  justify-content: center;
}

.size-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.option-label {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-top: 0.5rem;
}

.size-servings {
  font-size: 1rem;
  /* Slightly larger font for key info */
  font-weight: 600;
  color: #555;
  /* Different color for servings */
}

.size-price {
  font-weight: 600;
  color: #28a745;
  /* Green for price */
  font-size: 1.1rem;
  margin-top: 0.25rem;
}

.size-dimensions {
  font-size: 0.8rem;
  /* Smaller font for detailed dimensions */
  color: #888;
  margin-top: 0.25rem;
}

/* Mobile-Optimized Layer Selection Styles */
.step-header {
  text-align: center;
}

.step-title {
  color: #58091f;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.step-description {
  color: #666;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.layer-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #ffffff;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-align: left;
  position: relative;
  overflow: hidden;
}

.layer-option:active {
  transform: scale(0.98);
}

.layer-option.selected {
  border: 3px solid #58091f;
  background: rgba(240, 230, 141, 0.1);
  box-shadow: 0 6px 16px rgba(88, 9, 31, 0.2);
  transform: translateY(-2px) scale(1.02);
}

.layer-option.selected::after {
  content: "✓";
  position: absolute;
  top: 10px;
  right: 10px;
  background: #58091f;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.layer-preview {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  flex-shrink: 0;
}

.preview-layer {
  position: absolute;
  width: 50px;
  height: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.layer-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
}

.layer-main-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.layer-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  transition: all 0.3s ease;
}

.layer-servings {
  font-size: 0.9rem;
  color: #666;
}

.layer-price {
  font-size: 1.1rem;
  font-weight: 600;
  color: #28a745;
  transition: all 0.3s ease;
}

.layer-option.selected .layer-name {
  color: #58091f;
  font-weight: 700;
  font-size: 1.2rem;
}

.layer-option.selected .layer-price {
  color: #58091f;
  font-weight: 700;
}

/* Hover states only for non-touch devices */
@media (hover: hover) {
  .layer-option:hover {
    border-color: #f0e68d;
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

/* Additional mobile optimizations */
@media (max-width: 360px) {
  .layer-option {
    padding: 0.5rem;
    gap: 0.75rem;
  }

  .preview-layer {
    width: 40px;
    height: 14px;
  }

  .layer-name {
    font-size: 1rem;
  }

  .layer-servings {
    font-size: 0.8rem;
  }

  .layer-price {
    font-size: 1rem;
  }
}

/* Size Preview Styles */
.size-preview {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #f5f5dc;
  border: 2px solid #7a5c1e;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.3s ease;
}

/* Different size classes */
.size-6 {
  width: 60px;
  height: 60px;
}

.size-7 {
  width: 70px;
  height: 70px;
}

.size-8 {
  width: 80px;
  height: 80px;
}

.size-9 {
  width: 90px;
  height: 90px;
}

.size-10 {
  width: 100px;
  height: 100px;
}

/* Hover and selected states */
.option-button:hover .size-preview {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.option-button.selected .size-preview {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  border-color: #58091f;
  background-color: #f0e68d;
}

/* Tier representation styles */
.tier-representation {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
}

.tier-indicator {
  background-color: #f0e68d;
  border: 2px solid #7a5c1e;
  border-radius: 4px;
  margin-bottom: 5px;
}

.no-options-message {
  text-align: center;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 1rem 0;
}

.no-options-message p {
  font-size: 1.1rem;
  color: #666;
}

/* Make the size preview container taller for multi-tier cakes */
.option-button:has(.tier-representation) .size-preview-container {
  min-height: 180px;
}

/* Make the size preview container taller for multi-tier cakes */
.multi-tier-preview {
  min-height: 180px;
}

/* Hover scale effects */
.hover\:scale-102:hover {
  transform: scale(1.02);
}

.active\:scale-98:active {
  transform: scale(0.98);
}

/* Back Modal animations - specific to back confirmation modal only */
.back-modal-overlay {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  animation: backModalOverlayFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.back-modal-content {
  transform: translateY(100%);
  animation: backModalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Closing animations */
.back-modal-overlay-closing {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  animation: backModalOverlayFadeOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.back-modal-content-closing {
  animation: backModalSlideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@media (min-width: 768px) {
  .back-modal-content {
    transform: scale(0.8) translateY(20px);
    opacity: 0;
    animation: backModalZoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .back-modal-content-closing {
    animation: backModalZoomOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
}

/* Keyframe animations - specific to back confirmation modal */
@keyframes backModalOverlayFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }

  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

@keyframes backModalSlideUp {
  from {
    transform: translateY(100%);
    opacity: 0.7;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes backModalZoomIn {
  from {
    transform: scale(0.8) translateY(20px);
    opacity: 0;
  }

  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* Exit animations keyframes */
@keyframes backModalOverlayFadeOut {
  from {
    opacity: 1;
    backdrop-filter: blur(8px);
  }

  to {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
}

@keyframes backModalSlideDown {
  from {
    transform: translateY(0);
    opacity: 1;
  }

  to {
    transform: translateY(100%);
    opacity: 0.7;
  }
}

@keyframes backModalZoomOut {
  from {
    transform: scale(1) translateY(0);
    opacity: 1;
  }

  to {
    transform: scale(0.8) translateY(20px);
    opacity: 0;
  }
}

/* Enhanced button animations - specific to back confirmation modal */
.back-modal-content button {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.back-modal-content button:hover {
  transform: translateY(-1px);
}

.back-modal-content button:active {
  transform: translateY(0) scale(0.98);
}

/* Content slide-in animations */
.animate-slideInUp {
  opacity: 0;
  transform: translateY(20px);
  animation: slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Warning icon animation */
.warning-icon {
  animation: warningPulse 2s ease-in-out infinite;
}

@keyframes warningPulse {

  0%,
  100% {
    transform: scale(1);
    filter: drop-shadow(0 0 0 rgba(255, 193, 7, 0.7));
  }

  50% {
    transform: scale(1.05);
    filter: drop-shadow(0 0 10px rgba(255, 193, 7, 0.8));
  }
}

/* Gentle animations for icons */
.animate-bounce-gentle {
  animation: bounceGentle 2s ease-in-out infinite;
}

@keyframes bounceGentle {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-3px);
  }
}

.animate-pulse-gentle {
  animation: pulseGentle 2s ease-in-out infinite;
}

@keyframes pulseGentle {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

/* Enhanced button hover effects */
.primary-button:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 10px 25px rgba(88, 9, 31, 0.3);
}

.secondary-button:hover {
  transform: translateY(-2px);
  border-color: #58091f;
  background: rgba(88, 9, 31, 0.1);
}

/* Cart Modal animations - specific to cart confirmation modal only */
.cart-modal-overlay {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  animation: cartModalOverlayFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.cart-modal-content {
  transform: translateY(100%);
  animation: cartModalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Cart Modal closing animations */
.cart-modal-overlay-closing {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  animation: cartModalOverlayFadeOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.cart-modal-content-closing {
  animation: cartModalSlideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@media (min-width: 768px) {
  .cart-modal-content {
    transform: scale(0.8) translateY(20px);
    opacity: 0;
    animation: cartModalZoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .cart-modal-content-closing {
    animation: cartModalZoomOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
}

/* Cart Modal keyframe animations */
@keyframes cartModalOverlayFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }

  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

@keyframes cartModalSlideUp {
  from {
    transform: translateY(100%);
    opacity: 0.7;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes cartModalZoomIn {
  from {
    transform: scale(0.8) translateY(20px);
    opacity: 0;
  }

  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* Cart Modal exit animations keyframes */
@keyframes cartModalOverlayFadeOut {
  from {
    opacity: 1;
    backdrop-filter: blur(8px);
  }

  to {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
}

@keyframes cartModalSlideDown {
  from {
    transform: translateY(0);
    opacity: 1;
  }

  to {
    transform: translateY(100%);
    opacity: 0.7;
  }
}

@keyframes cartModalZoomOut {
  from {
    transform: scale(1) translateY(0);
    opacity: 1;
  }

  to {
    transform: scale(0.8) translateY(20px);
    opacity: 0;
  }
}

.size-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.size-option:hover {
  border-color: #f0e68d;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.size-option.selected {
  background: #fffacd;
  border-color: #f0e68d;
  box-shadow: 0 2px 8px rgba(240, 230, 141, 0.3);
}

.size-name {
  font-weight: 600;
  color: #333;
}

.size-price {
  color: #8b8b00;
  font-weight: 600;
  font-size: 1.2rem;
  margin-top: 0.25rem;
}

.step-description {
  color: #666;
  margin-bottom: 1rem;
}

.size-option {
  display: block;
  width: 100%;
  background: #ffffff;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.size-option:hover {
  border-color: #f0e68d;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.size-option.selected {
  background: rgba(240, 230, 141, 0.1);
  border: 3px solid #58091f;
  box-shadow: 0 6px 16px rgba(88, 9, 31, 0.2);
  transform: translateY(-2px) scale(1.02);
}

.size-option.selected::after {
  content: "✓";
  position: absolute;
  top: 10px;
  right: 10px;
  background: #58091f;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.size-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.size-visual {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.cake-circle {
  position: relative;
  background: #fffacd;
  border: 2px solid #f0e68d;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.size-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #8b8b00;
}

.size-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.size-name {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.size-option.selected .size-name {
  color: #58091f;
  font-weight: 700;
}

.size-dimensions {
  color: #666;
  font-size: 0.9rem;
}

.size-price {
  color: #8b8b00;
  font-weight: 600;
  font-size: 1.2rem;
  margin-top: 0.25rem;
  transition: all 0.3s ease;
}

.size-option.selected .size-price {
  color: #58091f;
  font-weight: 700;
  font-size: 1.3rem;
}

.step-description {
  color: #666;
  margin-bottom: 1rem;
}

/* Custom slider styling for mobile-friendly icing controls */
.slider-thumb::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #58091f, #7a0c29);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(88, 9, 31, 0.3);
  border: 2px solid white;
  transition: all 0.2s ease;
}

.slider-thumb::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(88, 9, 31, 0.4);
}

.slider-thumb::-webkit-slider-thumb:active {
  transform: scale(0.95);
}

.slider-thumb::-moz-range-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #58091f, #7a0c29);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(88, 9, 31, 0.3);
  transition: all 0.2s ease;
}

.slider-thumb::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(88, 9, 31, 0.4);
}

.slider-thumb::-moz-range-thumb:active {
  transform: scale(0.95);
}

/* Custom Toolbar Styling */
.toolbar-custom {
  --background: transparent !important;
  --border-color: transparent !important;
  --color: #374151 !important;
  margin: 0 !important;
  padding: 0 !important;
  z-index: 0 !important;
}

.toolbar-custom ion-toolbar {
  --background: transparent !important;
  --border-color: transparent !important;
  --color: #374151 !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* Ensure toolbar takes full width and has no default ionic padding */
ion-header ion-toolbar {
  --padding-start: 0px !important;
  --padding-end: 0px !important;
  --min-height: auto !important;
}

/* Override any default ionic header styles */
ion-header.ion-no-border {
  box-shadow: none !important;
  border: none !important;
}

/* Additional responsive styles for very small screens */
@media (max-width: 350px) {
  .toolbar-custom h1 {
    font-size: 1rem !important;
  }

  .toolbar-custom p {
    font-size: 0.7rem !important;
  }
}

/* Flavor preview styles for multi-layer selection */
.flavor-preview-small {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.flavor-preview-medium {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  margin: 0 auto;
}

/* Flavor colors for different styles */
.flavor-preview-small.chocolate,
.flavor-preview-medium.chocolate {
  background: linear-gradient(135deg, #4a2c2a, #6b3e37);
}

.flavor-preview-small.vanilla,
.flavor-preview-medium.vanilla {
  background: linear-gradient(135deg, #f5f5dc, #f0e68d);
}

.flavor-preview-small.mocha,
.flavor-preview-medium.mocha {
  background: linear-gradient(135deg, #6f4e37, #8b4513);
}

.flavor-preview-small.strawberry,
.flavor-preview-medium.strawberry {
  background: linear-gradient(135deg, #ffb6c1, #ff69b4);
}

.flavor-preview-small.ube,
.flavor-preview-medium.ube {
  background: linear-gradient(135deg, #8a2be2, #9932cc);
}
</style>
