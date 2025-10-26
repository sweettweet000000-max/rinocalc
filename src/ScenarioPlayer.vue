<script setup lang="ts">
import { reactive, computed, ref, onBeforeUpdate } from 'vue';
import type { GameState } from '../stores/card.ts';
import { useGameStore } from '../stores/game.ts';
import EvolveCounter from './EvolveCounter.vue';
import Card from './Card.vue';

const store = useGameStore();

// 状態はストアから取得
const cardList = computed(() => store.cardList);
const hand = computed(() => store.hand);
const myField = computed(() => store.myField);
const enemyField = computed(() => store.enemyField);

const enemyHP = computed(() => store.enemyHP);
const myPP = computed(() => store.myPP);
const myEvolvePoints = computed(() => store.myEvolvePoints);
const mySuperEvolvePoints = computed(() => store.mySuperEvolvePoints);
const myCombo = computed(() => store.myCombo);
const maxHP = computed(() => store.maxHP);
const maxPP = computed(() => store.maxPP);

// 敵の場のカードコンポーネントのDOM要素を保持するためのリアクティブなオブジェクトを定義
const enemyCardElements = ref<Record<string, any>>({});
onBeforeUpdate(() => {
    // コンポーネントツリーが更新される前に、既存の参照を空にする
    enemyCardElements.value = {}; 
});

// ターゲット選択モードかどうかを computed で定義
const isTargeting = computed(() => store.isTargeting);
const selectionRequirements = computed(() => store.selectionRequirements);

type Area = 'cardList' | 'hand' | 'myField' | 'enemyField' | 'outside';
type ArrowSourceType = 'card' | 'evolve' | 'superEvolve' | null;

interface ArrowState {
  isVisible: boolean;
  cardId: string | null;
  sourceType: string | null;
  color: string | undefined;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const arrowState = reactive<ArrowState>({
  isVisible: false,
  cardId: null,
  sourceType: null,
  color: undefined,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
});

const arrowPath = computed(() => {
  if (!arrowState.isVisible) return '';

  const { startX, startY, endX, endY } = arrowState;

  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  const dx = endX - startX;
  const dy = endY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const curveIntensity = Math.min(distance * 0.4, 150);
  
  let cpx = midX;
  let cpy = midY - curveIntensity;

  return `M ${startX} ${startY} Q ${cpx} ${cpy} ${endX} ${endY}`;
});

const handleAttackStart = (payload: { cardId: string, startX: number, startY: number, endX: number, endY: number }) => {
    arrowState.isVisible = true;
    arrowState.cardId = payload.cardId;
    arrowState.sourceType = 'card';
    arrowState.color = 'yellow';
    arrowState.startX = payload.startX;
    arrowState.startY = payload.startY;
    arrowState.endX = payload.endX;
    arrowState.endY = payload.endY;
};

const handleAttacking = (payload: { endX: number, endY: number }) => {
    if (arrowState.isVisible) {
        // リアルタイムで終点をカーソル位置に更新
        arrowState.endX = payload.endX;
        arrowState.endY = payload.endY;
    }
};

const handleAttackEnd = (payload: { endX: number, endY: number }) => {
    arrowState.isVisible = false;
    const dropX = payload.endX;
    const dropY = payload.endY;
    
    const attackerId = arrowState.cardId;
    if (!attackerId) {
        console.log('Attack cancelled: No attacker ID.');
        return;
    }

    let targetCardId: string | null = null;
    
    for (const card of store.enemyField) {
        if(card.kind != 'follower') continue;
        const cardComponent = enemyCardElements.value[card.id];
        const cardElement = cardComponent?.$el;

        if (cardElement instanceof HTMLElement) {
            const rect = cardElement.getBoundingClientRect();
            if (dropX >= rect.left && dropX <= rect.right && dropY >= rect.top && dropY <= rect.bottom) {
                targetCardId = card.id;
                break;
            }
        }
    }

    if (targetCardId) {
        console.log(`Attack executed from ${attackerId} to target card ${targetCardId}`);
        store.executeAttack(attackerId, targetCardId); 
    } else {
        // ターゲットが敵の場のカードではない場合（例：敵リーダーへの攻撃）
        // 既存の document.elementFromPoint ロジックを残すか、
        // 敵リーダー用に専用のDOM要素と座標を用意する。
        const targetElement = document.elementFromPoint(payload.endX, payload.endY);
        
        // 敵リーダーの要素に 'enemy-leader-area' のようなクラスが付与されていると仮定
        if (targetElement && targetElement.classList.contains('enemy-leader-area')) {
             console.log('Attack target: Enemy Leader');
             // store.executeAttack(attackerId, 'ENEMY_LEADER_ID'); // リーダーのIDなど
        } else {
             console.log('Attack cancelled: No valid target found.');
        }
    }
    
    arrowState.cardId = null;
};

const handleEvolveDragStart = (payload: { sourceType: string, startX: number, startY: number, endX: number, endY: number }) => {
    arrowState.isVisible = true;
    arrowState.sourceType = payload.sourceType;
    arrowState.color = payload.sourceType == 'evolve' ? '#ffae00' : '#ff00f2';
    arrowState.startX = payload.startX;
    arrowState.startY = payload.startY;
    arrowState.endX = payload.endX;
    arrowState.endY = payload.endY;
};

const handleEvolveDragEnd = (payload: { endX: number, endY: number }) => {
    arrowState.isVisible = false;
    
    // ここで進化対象の判定ロジックを実装します。
    // 例: 場に出ている自分のフォロワーをターゲットにしたか
    const targetElement = document.elementFromPoint(payload.endX, payload.endY);
    
    if (targetElement && targetElement.closest('.field-area')) {
        console.log('Evolve Drag End: Target is Field Area. (ここで進化対象のカードを特定し、進化処理を呼び出す)');
    } else {
        console.log('Evolve Drag End: Target is outside or invalid. (進化キャンセル)');
    }
    
    arrowState.sourceType = null;
};

// EvolveCounterからイベントを受け取るハンドラ
const handleEvolveClick = (index: number) => {
};

const handleSuperEvolveClick = (index: number) => {
};

// --- ドラッグイベントハンドラ ---

/**
 * ドラッグ開始時: カードIDと元のエリアを保存
 * @param event ドラッグイベント
 * @param cardId ドラッグされるカードのID
 * @param sourceArea カードが存在するエリア ('cardList', 'hand', 'myField', 'enemyField')
 */
const handleDragStart = (event: DragEvent, cardId: string, sourceArea: string) => {
    if (event.dataTransfer) {
        event.dataTransfer.setData('cardId', cardId);
        event.dataTransfer.setData('sourceArea', sourceArea);
    }
};

// ドロップされた場所の上にあるとき
const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
    }
};

/**
 * ドロップ時: カードの移動ロジックを実行
 * @param event ドロップイベント
 * @param targetArea ドロップされたエリア ('hand', 'myField', 'enemyField')
 */
const handleDrop = async (event: DragEvent, targetArea: string) => {
    event.preventDefault();

    if (!event.dataTransfer) return;

    const cardId = event.dataTransfer.getData('cardId');
    const sourceArea = event.dataTransfer.getData('sourceArea');

    if (!cardId || !sourceArea) return;

    await store.playCardFromHand(cardId);
};

const handleRightClick = async (cardId: string) => {
    console.log("rightclicked", cardId);
    await store.actCardOnField(cardId);
}

const handleLoad = () => {
    // ユーザーが編集した最新の gameState.value を saveState に渡す
    store.loadState();
};

const currentSelectionIds = ref<string[]>([]);
const isValidSelection = computed(() => {
    return currentSelectionIds.value.length === selectionRequirements.value.count;
});
const targetableList = computed(() => {
    // ターゲットエリアが 'myField' でない場合は、空の配列を返す
    if (selectionRequirements.value.targetArea !== 'myField') {
        return [];
    }

    let targetableList = myField;

    const exceptions = selectionRequirements.value.targetExceptions || [];

    return targetableList.value.filter((card) => !exceptions.includes(card.id));
});

// 決定ボタンのクリックハンドラ
const handleConfirmSelection = (selectedIds: string[] | null) => {
    store.completeTargetingAction(selectedIds);
    // バグの原因
    // currentSelectionIds.value.length = 0; 
};

// キャンセルボタンのクリックハンドラ
const handleCancelSelection = () => {
    store.completeTargetingAction(null);
    // バグの原因
    // currentSelectionIds.value.length = 0; 
};

/**
 * カードの選択/非選択を切り替える
 * @param cardId 選択されたカードのID
 */
const toggleSelection = (cardId: string) => {
    const index = currentSelectionIds.value.indexOf(cardId);
    const requirements = selectionRequirements.value;

    if (index > -1) {
        currentSelectionIds.value.splice(index, 1);
    } else {
        if (currentSelectionIds.value.length < requirements.count) {
            currentSelectionIds.value.push(cardId);
        } else if (requirements.count === 1) {
            currentSelectionIds.value.splice(0, currentSelectionIds.value.length, cardId);
        }
    }
};

</script>

<template>
  <div 
    class="game-container"
    @contextmenu.prevent
  > 
    <svg 
        v-if="arrowState.isVisible" 
        class="arrow-overlay"
        :style="{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none', // SVGの下の要素をクリック可能にする
            zIndex: 999 
        }"
    >
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" :fill="arrowState.color" />
            </marker>
        </defs>

        <path
            :d="arrowPath"
            :stroke="arrowState.color"
            stroke-width="4"
            fill="none"
            marker-end="url(#arrowhead)" 
        />
    </svg>
        <div class="game-board">
            <div v-if="isTargeting" class="target-selection-overlay">
            <h2>ターゲットを選択してください ({{ selectionRequirements.count }}枚)</h2>
            
            <div class="field-card-list">
                <div 
                    v-for="card in targetableList" 
                    :key="card.id"
                    class="target-card-item"
                    :class="{ 'is-selected': currentSelectionIds.includes(card.id) }"
                    @click="toggleSelection(card.id)"
                >
                    {{ card.name }} (ID: {{ card.id }})
                </div>
            </div>
            
            <button @click="handleConfirmSelection(currentSelectionIds)" 
                    :disabled="!isValidSelection">
                決定
            </button>
            
            <button v-if="selectionRequirements.canCancel" 
                    @click="handleCancelSelection">
                キャンセル
            </button>
        </div>

        <h2>場</h2>
        <div 
            class="field-area"
        >
        <Card 
            v-for="card in enemyField" 
            :key="card.id" 
            :id="card.id"
            :name="card.name"
            :kind="card.kind"
            :cost="card.cost"
            :ref="(el) => { if (el) enemyCardElements[card.id] = el }"
            v-bind="card.kind === 'follower' ? { attack: card.attack, hp: card.hp } : {}"
        />
        </div>

        <hr />

        <div 
            class="field-area"
            @dragover="handleDragOver"
            @drop.stop="handleDrop($event, 'myField')" 
        >
            <Card 
                v-for="card in myField" 
                :key="card.id" 
                :id="card.id"
                :name="card.name"
                :kind="card.kind"
                :cost="card.cost"
                :is-on-field=true
                draggable="true" 
                @dragstart="handleDragStart($event, card.id, 'myField')" 
                @drag-start-attack="handleAttackStart"
                @dragging-attack="handleAttacking"
                @drag-end-attack="handleAttackEnd"
                @right-click="handleRightClick"
                v-bind="card.kind === 'follower' ? { attack: card.attack, hp: card.hp, rush: card.rush, storm: card.storm} : {}"
            />
        </div>

        <hr />

        <EvolveCounter 
            :evolve="myEvolvePoints"
            :super-evolve="mySuperEvolvePoints"
            @click-evolve="handleEvolveClick" 
            @click-super-evolve="handleSuperEvolveClick"
            @drag-start-evolve="handleEvolveDragStart" 
            @dragging-evolve="handleAttacking"
            @drag-end-evolve="handleEvolveDragEnd"
        />

        <h2>手札 ({{ store.handCount }}枚)</h2>
        <div 
            class="hand-area"
        >
        <Card 
            v-for="card in hand" 
            :key="card.id" 
            :id="card.id"
            :name="card.name"
            :kind="card.kind"
            :cost="card.cost"
            draggable="true" 
            @dragstart="handleDragStart($event, card.id, 'hand')" 
			      v-bind="card.kind === 'follower' ? { attack: card.attack, hp: card.hp } : {}"
        />
        </div>
    </div>

    <div class="status-panel">
        <div class="status-item enemy-status">
            <h3>敵HP</h3>
            <div class="hp-value">{{enemyHP}}</div>
        </div>

        <div class="status-item my-status">
            <h3>PP</h3>
            <p class="pp-value">
                <div class="current-pp">{{myPP}}</div>
                /
                <div class="max-pp">{{maxPP}}</div>
            </p>
        </div>

        <div class="status-item my-status">
            <h3>コンボ数</h3>
            <div class="combo-value">{{myCombo}}</div>
        </div>
        
        <div class="status-item action-buttons">
            <button @click="handleLoad">状態を読込</button>
        </div>
    </div>
  </div>
</template>

<style scoped>
.game-container {
  display: flex;
  user-select: none;
  -webkit-user-select: none; /* Safari/Chrome */
  -moz-user-select: none;    /* Firefox */
  -ms-user-select: none;     /* IE/Edge */
}
.game-board {
  flex-grow: 1; 
  padding: 20px;
  padding-right: 20px; 
}
.status-panel {
    width: 100px;
    min-width: 150px;
    border-left: 1px solid #ccc;
    background-color: #f9f9f9;
    padding: 20px;
    display: flex;
    flex-direction: column;
}
.status-item {
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
}
.status-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
}
.status-item h3 {
    margin-top: 0;
    margin-bottom: 8px;
    font-size: 1.1em;
    color: #333;
}
.hp-value {
    width: 100px;
    font-weight: bold;
    color: #c0392b;
}
.pp-value {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-size: 1.2em;
    font-weight: bold;
}
.combo-value {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-size: 1.2em;
    font-weight: bold;
}
.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
}
.action-buttons button {
    padding: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s;
}
.action-buttons button:nth-child(1) {
    background-color: #3498db;
    color: white;
}
.action-buttons button:nth-child(1):hover {
    background-color: #2980b9;
}
.action-buttons button:nth-child(2) {
    background-color: #2ecc71;
    color: white;
}
.action-buttons button:nth-child(2):hover {
    background-color: #27ae60;
}
.hand-area {
  min-height: 180px;
  display: flex;
  border: 1px dashed gray;
  padding: 10px;
  flex-wrap: nowrap;
  max-width: 100%; 
  overflow-x: scroll; 
  overflow-y: hidden; 
}
.cardlist-area {
  display: flex;
  border: 1px dashed gray;
  padding: 10px;
  flex-wrap: nowrap;
  max-width: 100%; 
  overflow-x: scroll; 
  overflow-y: hidden; 
}
.field-area {
  min-height: 180px;
  border: 3px solid green;
  background-color: #f0fff0;
  display: flex;
  padding: 5px;
  align-items: center;
  justify-content: center;
}
</style>