<script setup lang="ts">
import { defineEmits, defineProps, computed } from 'vue';

// Emitsの定義を追加
const emit = defineEmits<{
  (e: 'clickEvolve', index: number): void
  (e: 'clickSuperEvolve', index: number): void
}>()

const props = defineProps({
  // 親から残り回数を受け取る
  evolve: {
    type: Number,
    required: true,
  },
  // 超進化権の残り回数を受け取る
  superEvolve: {
    type: Number,
    required: true,
  },
  isAlwaysClickable: Boolean
});

const MAX_COUNT = 2;

const evolveIndicators = computed(() => {
    return Array(MAX_COUNT).fill(false).map((_, index) => {
        const isLit = index < props.evolve;
        const isClickable = isLit || props.isAlwaysClickable;
        return { isLit, isClickable };
    });
});

const superEvolveIndicators = computed(() => {
    return Array(MAX_COUNT).fill(false).map((_, index) => {
        const isLit = index < props.superEvolve;
        const isClickable = isLit || props.isAlwaysClickable;
        return { isLit, isClickable };
    });
});

// 新しいメソッド: クリックイベントを親に通知する
const handleEvolveClick = (index: number) => {
    console.log("click evolve")
    emit('clickEvolve', index); 
};

const handleSuperEvolveClick = (index: number) => {
    console.log("click super evolve")
    emit('clickSuperEvolve', index);
};

</script>

<template>
  <div class="evolve-indicators">
    <div class="indicator-group evolve">
      <span class="label">進化</span>
      <div class="lights">
        <div 
          v-for="(indicator, index) in evolveIndicators" 
          :key="`e-${index}`" 
          class="light"
          :class="{ 'is-lit': indicator.isLit, 'is-clickable': indicator.isClickable }"
          @click="indicator.isClickable && handleEvolveClick(index)"
        ></div>
      </div>
    </div>

    <div class="indicator-group super-evolve">
      <span class="label">超進化</span>
      <div class="lights">
        <div 
          v-for="(indicator, index) in superEvolveIndicators" 
          :key="`s-${index}`" 
          class="light"
          :class="{ 'is-lit': indicator.isLit, 'is-clickable': indicator.isClickable }"
          @click="indicator.isClickable && handleSuperEvolveClick(index)"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.evolve-indicators {
  display: flex; 
  gap: 20px;
  align-items: flex-start;
  justify-content: center;
}
.indicator-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.label {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
  letter-spacing: 0.5px;
}
.lights {
  display: flex;
  gap: 8px;
}
.light {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: #222;
  opacity: 0.6;
  transition: all 0.2s ease;
}
.evolve .light {
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 5px rgba(255, 174, 0, 0.3);
}
.super-evolve .light {
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 5px  rgba(255, 0, 242, 0.3)
}
.evolve .light.is-lit {
  background-color: #ffae00;
  opacity: 1;
}
.super-evolve .light.is-lit {
  background-color: #ff00f2;
  opacity: 1;
}
.light.is-clickable {
  cursor: pointer;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5); 
}
.light.is-clickable:hover {
  opacity: 0.8;
}
.value {
  font-size: 20px;
}
.counter.evolve:has(.value:only-child[data-value="0"]),
.counter.super-evolve:has(.value:only-child[data-value="0"]) {
    opacity: 0.5;
}
</style>