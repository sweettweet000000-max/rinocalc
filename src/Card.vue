<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';

// 親コンポーネントから受け取るデータ
const props = defineProps({
  id: Number,
  name: String,
  kind: String,
  cost: Number,
  attack: Number,
  hp: Number,
  rush: Boolean,
  storm: Boolean,
  isOnField: Boolean,
});

const emit = defineEmits(['drag-start-attack', 'dragging-attack', 'drag-end-attack']);

// **【パターン1: 通常ドラッグ（プレイ）】**
const handleDragStart = (event: DragEvent) => {
  // 攻撃モードに入っていない、かつプレイ可能な場合のみ標準D&Dを許可
  if (isAttacking || props.isOnField) {
    event.preventDefault(); // ドラッグをキャンセル
    return;
  }
  // dataTransferにカードIDを設定（幽霊イメージが表示される）
  event.dataTransfer!.setData('cardId', String(props.id)); 
};

// **【パターン2: カスタムドラッグ（攻撃）】**
let isAttacking = false;

const handleMouseDown = (event: MouseEvent) => {
  // 場にあり、フォロワーであり、攻撃可能な状態かチェック
  if (props.isOnField && (props.rush || props.storm)) {
    isAttacking = true;
    event.preventDefault(); // これが重要！ブラウザ標準のドラッグを停止し、幽霊表示をブロックする

    // カードの中心座標を取得 (矢印の始点)
    const cardElement = event.currentTarget as HTMLElement;
    const cardRect = cardElement.getBoundingClientRect();
    const startX = cardRect.left + cardRect.width / 2;
    const startY = cardRect.top + cardRect.height / 2;
    
    // 矢印描画開始を親に通知
    emit('drag-start-attack', { 
      cardId: props.id, 
      startX, 
      startY, 
      endX: event.clientX, 
      endY: event.clientY 
    });

    // グローバルリスナーを追加
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
};

const handleMouseMove = (event: MouseEvent) => {
  if (isAttacking) {
    emit('dragging-attack', { endX: event.clientX, endY: event.clientY });
  }
};

const handleMouseUp = (event: MouseEvent) => {
  if (isAttacking) {
    isAttacking = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // 矢印描画終了と攻撃ターゲット判定を親に通知
    emit('drag-end-attack', { endX: event.clientX, endY: event.clientY });
  }
};

// kindに応じて動的にクラス名を生成
const kindClass = computed(() => {
  if (props.kind) {
    return `kind-${props.kind.toLowerCase()}`;
  }
  return 'kind-default';
});

const isFollower = computed(() => props.kind && props.kind.toLowerCase() === 'follower');

const abilityShadowClass = computed(() => {
  if (props.rush) {
    return 'has-rush';
  }
  if (props.storm) {
    return 'has-storm';
  }
  return '';
});
</script>

<template>
  <div
    class="card"
    :class="[kindClass, abilityShadowClass]"
    :draggable="!props.isOnField" @dragstart="handleDragStart"
    @mousedown="handleMouseDown"
  >
    <div class="card-stat card-cost">{{ cost }}</div>
    
    <h3>{{ name }}</h3>

    <div 
        class="card-stat card-attack"
        v-if=isFollower
    >{{ attack }}</div> 

    <div 
        class="card-stat card-hp"
        v-if=isFollower
    >{{ hp }}</div> 
  </div>
</template>

<style scoped>
.card {
  position: relative;
  min-width: 8%;
  height: 140px;
  border: 1px solid black;
  border-radius: 8px;
  margin: 7px;
  padding: 10px;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
  cursor: grab;
  opacity: 0.9;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
.card:hover {
  transform: scale(1.05);
  box-shadow: 4px 4px 10px rgba(0,0,0,0.4); 
  z-index: 10; 
}
.card-stat {
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid white; 
  box-shadow: 1px 1px 3px rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 14px;
  color: white; 
}
.card-cost {
  top: -10px;
  left: -10px;
  background-color: #4CAF50;
}
.card-attack {
  bottom: -10px; 
  left: -10px; 
  background-color: #F44336;
}
.card-hp {
  bottom: -10px;
  right: -10px;
  background-color: #2196F3;
}
.kind-default {
  background-color: #f8f8f8;
  border-color: #333;
}
.kind-spell {
  background-color: #e0f2f7; 
  border-color: #007bb5; 
}
.kind-follower {
  background-color: #f7e2e0; 
  border-color: #a04030;
}
.kind-amulet {
  background-color: #f7f2e0; 
  border-color: #a08000; 
}
.kind-spell:hover {
  border-color: #005680;
}
.kind-follower:hover {
  border-color: #803326;
}
.kind-amulet:hover {
  border-color: #806600;
}
.card.has-rush {
  box-shadow: 0 0 5px 5px rgba(255, 200, 0, 0.7), 2px 2px 5px rgba(0,0,0,0.2);
  transition: transform 0.2s ease-in-out, box-shadow 0.3s ease-in-out, border-color 0.2s;
}
.card.has-rush:hover {
  box-shadow: 0 0 10px 8px rgba(255, 220, 0, 0.8), 4px 4px 10px rgba(0,0,0,0.4);
}
.card.has-storm {
  box-shadow: 0 0 5px 5px rgba(1, 156, 1, 0.7), 2px 2px 5px rgba(0,0,0,0.2);
  transition: transform 0.2s ease-in-out, box-shadow 0.3s ease-in-out, border-color 0.2s;
}
.card.has-storm:hover {
  box-shadow: 0 0 10px 8px rgba(1, 156, 1, 0.7), 4px 4px 10px rgba(0,0,0,0.4);
}

</style>