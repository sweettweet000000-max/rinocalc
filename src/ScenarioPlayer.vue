<script setup lang="ts">
import { reactive, computed } from 'vue';
import type { GameState } from '../stores/game_types.ts';
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

type Area = 'cardList' | 'hand' | 'myField' | 'enemyField' | 'outside';

interface ArrowState {
  isVisible: boolean;
  cardId: number | null;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const arrowState = reactive<ArrowState>({
  isVisible: false,
  cardId: null,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
});


// カードコンポーネントからのイベントハンドラ

const handleAttackStart = (payload: { cardId: number, startX: number, startY: number, endX: number, endY: number }) => {
    arrowState.isVisible = true;
    arrowState.cardId = payload.cardId;
    arrowState.startX = payload.startX;
    arrowState.startY = payload.startY;
    // 初期座標はカーソル位置に設定
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
    
    // ターゲット判定ロジック
    // 例: payload.endX, payload.endY が敵カードの領域内にあるか判定する
    const targetElement = document.elementFromPoint(payload.endX, payload.endY);
    
    if (targetElement && targetElement.classList.contains('enemy-card')) {
    } else {
        // 攻撃キャンセル
        console.log('Attack cancelled.');
    }
    
    arrowState.cardId = null;
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
const handleDragStart = (event: DragEvent, cardId: number, sourceArea: string) => {
    if (event.dataTransfer) {
        event.dataTransfer.setData('cardId', cardId.toString());
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
const handleDrop = (event: DragEvent, targetArea: string) => {
    event.preventDefault();

    if (!event.dataTransfer) return;

    const cardIdString = event.dataTransfer.getData('cardId');
    const sourceArea = event.dataTransfer.getData('sourceArea');

    if (!cardIdString || !sourceArea) return;

    const cardId = parseInt(cardIdString);

    store.playCardFromHand(cardId);
};

const handleLoad = () => {
    // ユーザーが編集した最新の gameState.value を saveState に渡す
    store.loadState();
};

</script>

<template>
  <div 
    class="game-container"
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
                <polygon points="0 0, 10 3.5, 0 7" fill="yellow" />
            </marker>
        </defs>

        <line
            :x1="arrowState.startX"
            :y1="arrowState.startY"
            :x2="arrowState.endX"
            :y2="arrowState.endY"
            stroke="yellow"
            stroke-width="4"
            marker-end="url(#arrowhead)" 
        />
    </svg>
    <div class="game-board">
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
                v-bind="card.kind === 'follower' ? { attack: card.attack, hp: card.hp, rush: card.rush, storm: card.storm} : {}"
            />
        </div>

        <hr />

        <EvolveCounter 
            :evolve="myEvolvePoints"
            :super-evolve="mySuperEvolvePoints"
            @click-evolve="handleEvolveClick" 
            @click-super-evolve="handleSuperEvolveClick" 
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