<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { reactive, computed } from 'vue';
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

const maxHP = computed(() => store.maxHP);
const maxPP = computed(() => store.maxPP);

// プレイヤー/敵のステータスもストアから取得
const { 
    enemyHP, 
    myPP,
    myEvolvePoints, 
    mySuperEvolvePoints 
} = storeToRefs(store);

type Area = 'cardList' | 'hand' | 'myField' | 'enemyField' | 'outside';

// EvolveCounterからイベントを受け取るハンドラ
const handleEvolveClick = (index: number) => {
  if (myEvolvePoints.value === 0) {
    store.setMyEvolvePoints(1);
  }
  else if(myEvolvePoints.value === 2){
    store.setMyEvolvePoints(1);
  }
  else if(index === 0){
    store.setMyEvolvePoints(0);
  }
  else if(index === 1){
    store.setMyEvolvePoints(2);
  }
  else{
    console.warn("unexpected error");
  }
};

const handleSuperEvolveClick = (index: number) => {
  if (mySuperEvolvePoints.value === 0) {
    store.setMySuperEvolvePoints(1);
  }
  else if(mySuperEvolvePoints.value === 2){
    store.setMySuperEvolvePoints(1);
  }
  else if(index === 0){
    store.setMySuperEvolvePoints(0);
  }
  else if(index === 1){
    store.setMySuperEvolvePoints(2);
  }
  else{
    console.warn("unexpected error");
  }
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

    const cardId = event.dataTransfer.getData('cardId');
    const sourceArea = event.dataTransfer.getData('sourceArea');

    if (!cardId || !sourceArea) return;

    // ストアに移動処理を依頼
    store.moveCard(cardId, sourceArea as Area, targetArea as Area); 
};

const handleSave = () => {
    // ユーザーが編集した最新の gameState.value を saveState に渡す
    store.saveState(
        store, 
        `scenario-${store.scenarioName.replace(/\s/g, '_')}.json`
    );
};

const handleLoad = () => {
    // ユーザーが編集した最新の gameState.value を saveState に渡す
    store.loadState();
};

</script>

<template>
  <div 
    class="game-container"
    @dragover="handleDragOver"
    @drop="handleDrop($event, 'outside')" 
  > 
    <div class="game-board">
        <h2>場</h2>
        <div 
            class="field-area"
            @dragover="handleDragOver"
            @drop.stop="handleDrop($event, 'enemyField')" 
        >
        <Card 
            v-for="card in enemyField" 
            :key="card.id" 
            :id="card.id"
            :name="card.name"
            :kind="card.kind"
            :cost="card.cost"
            draggable="true" 
            @dragstart="handleDragStart($event, card.id, 'enemyField')" 
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
                draggable="true" 
                @dragstart="handleDragStart($event, card.id, 'myField')" 
                v-bind="card.kind === 'follower' ? { attack: card.attack, hp: card.hp } : {}"
            />
        </div>

        <hr />

        <EvolveCounter 
            :evolve="myEvolvePoints"
            :super-evolve="mySuperEvolvePoints"
            :is-always-clickable=true
            @click-evolve="handleEvolveClick" 
            @click-super-evolve="handleSuperEvolveClick" 
        />

        <h2>手札 ({{ store.handCount }}枚)</h2>
        <div 
            class="hand-area"
            @dragover="handleDragOver"
            @drop.stop="handleDrop($event, 'hand')" 
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

        <h2>カードリスト</h2>
        <div class="cardlist-area">
        <Card 
			v-for="card in cardList" 
			:key="card.id" 
			:id="card.id"
			:name="card.name"
			:kind="card.kind"
			:cost="card.cost"
            draggable="true" 
            @dragstart="handleDragStart($event, card.id, 'cardList')" 
			v-bind="card.kind === 'follower' ? { attack: card.attack, hp: card.hp } : {}"
        />
        </div>
    </div>

    <div class="status-panel">
        <div class="status-item enemy-status">
            <h3>敵HP</h3>
            <input type="number" v-model.number="enemyHP" min="0" :max="maxHP" class="hp-input">
        </div>

        <div class="status-item my-status">
            <h3>PP</h3>
            <p class="pp-value">
                <input type="number" v-model.number="myPP" min="0" :max="maxPP" class="pp-input current-pp">
                /
                <div class="max-pp">{{maxPP}}</div>
            </p>
            </div>

        
        <div class="status-item action-buttons">
            <button @click="handleSave">状態を保存</button>
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
input[type="number"] {
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 4px;
    text-align: center;
    font-size: 1em;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    margin: 0;
}
.hp-input {
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
.pp-input {
    width: 50px;
    font-size: 1.1em;
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