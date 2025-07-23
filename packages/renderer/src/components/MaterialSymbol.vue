<script lang="ts" setup>
/**
 * MaterialSymbol Component
 * 
 * A wrapper for Google's Material Symbols icons with customizable properties.
 * See https://fonts.google.com/icons for available icons and https://m3.material.io/styles/icons/overview for usage guidelines.
 */

// Define component props with TypeScript interface
withDefaults(defineProps<{
  /** The icon name from Material Symbols library (required) */
  icon: string,
  /** Whether the icon should be filled (default: false) */
  fill?: boolean,
}>(), {
  fill: false,
});
</script>

<template>
  <div class="flex items-center justify-center w-fit h-fit">
    <span
      translate="no"
      class="material-symbols-outlined"
      :class="{ fill }"
      aria-hidden="true"
      role="img"
    >
      {{ icon }}
    </span>
  </div>
</template>

<style scoped>
/* Ensure proper display of Material Symbols */
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  font-size: inherit;
  -webkit-font-smoothing: antialiased;
}

.fill {
  font-variation-settings: 'FILL' 1;
}
</style>
