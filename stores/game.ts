import { defineStore } from 'pinia';
import type { Card, GameState, Area, CardActionSet } from './game_types';
import { フェアリー, 森の神秘, メイ, 招集, 虫の知らせ, 樹上からの急襲, 駆逐の死矢, リリィ, フェアリーテイマー, フェンサーフェアリー, カーバンクル, 花園, 燐光の岩, リノセウス, ギルネリーゼ, 杖, バックウッド, ベイル } from './card';

// 初期の手札データ
const cardList: Card[] = [
    森の神秘,
    フェアリー,
    メイ,
    招集, 
    虫の知らせ,
    樹上からの急襲,
    駆逐の死矢,
    リリィ,
    フェアリーテイマー,
    フェンサーフェアリー,
    カーバンクル,
    花園,
    燐光の岩,
    リノセウス,
    ギルネリーゼ,
    杖,
    バックウッド,
    ベイル
];

export const useGameStore = defineStore('game', {
    // === 状態 (State) ===
    state: (): GameState => ({
        scenarioName: "sample",
        myHP: 20,
        myPP: 0,
        myExtraPP: false,
        myEvolvePoints: 2,
        mySuperEvolvePoints: 0,
        myCombo: 0,
        enemyHP: 20,
        cardList: cardList,
        hand: [],
        myField: [],
        enemyField: [],
        maxHP: 20,
        maxPP: 10,
        maxFieldSize: 5,
        maxHandSize: 9,
    }),

    // === ゲッター (Getters) ===
    getters: {
        handCount: (state) => state.hand.length,
        isMyFieldFull: (state) => state.myField.length >= state.maxFieldSize,
        getAreaCards: (state) => (area: Area): Card[] => {
            if (area === 'cardList') return state.cardList;
            if (area === 'hand') return state.hand;
            if (area === 'myField') return state.myField;
            if (area === 'enemyField') return state.enemyField;
            return [];
        },
    },

    // === アクション (Actions) ===
    actions: {
        /**
         * エリアからカードを削除する
         * @param cardId 削除するカードのID
         * @param sourceArea 削除元のエリア名
         */
        removeCard(cardId: number, sourceArea: Area): boolean {
            const cards = this.getAreaCards(sourceArea);
            const index = cards.findIndex(c => c.id === cardId);

            if (index !== -1) {
                cards.splice(index, 1);
                return true;
            }

            return false;
        },

        /**
         * エリアにカードを追加する
         * @param cardData 追加するカードデータ
         * @param targetArea 追加先のエリア名
         */
        addCard(cardData: Card, targetArea: Area): boolean {
            if (targetArea === 'cardList') {
                return false;
            }

            // フィールドの上限チェック
            if (targetArea === 'myField' || targetArea === 'enemyField') {
                if (this.getAreaCards(targetArea).length >= this.maxFieldSize) {
                    return false;
                }
                if(cardData.kind != 'follower' && cardData.kind != 'amulet'){
                    return false;
                }
            }

            // フィールドの上限チェック
            if (targetArea === 'hand') {
                if (this.getAreaCards(targetArea).length >= this.maxHandSize) {
                    return false;
                }
            }
            
            const cards = this.getAreaCards(targetArea);
            cards.push(cardData);
            return true;
        },

        /**
         * カードをあるエリアから別のエリアへ移動させる（シナリオエディタ用）
         * @param cardId 移動するカードのID
         * @param sourceArea 移動元のエリア名
         * @param targetArea 移動先のエリア名
         */
        moveCard(cardId: number, sourceArea: Area, targetArea: Area) {
            let cardToMove: Card | undefined;

            if (sourceArea === 'cardList') {
                cardToMove = this.cardList.find(c => c.id === cardId);
                if (!cardToMove) return;

                const newCardData = { ...cardToMove, id: Date.now() };
                this.addCard(newCardData, targetArea);
                
            } else {
                // 移動元からカードデータを取得
                cardToMove = this.getAreaCards(sourceArea).find(c => c.id === cardId);
                if (!cardToMove) return;

                this.addCard(cardToMove, targetArea);
                this.removeCard(cardId, sourceArea);
            }
        },

        playCardFromHand(cardId: number): boolean {
            if (this.isMyFieldFull) {
                console.warn('場が満員のため、カードを出せません。');
                return false;
            }

            const cardToMove = this.hand.find(card => card.id === cardId);

            if (cardToMove) {
                if (this.myPP < cardToMove.cost) { 
                    return false;
                }

                this.hand = this.hand.filter(card => card.id !== cardId);

                if(cardToMove.kind === "follower"
                    ||
                    cardToMove.kind === "amulet"
                ){
                    if(cardToMove.onPlayFromHand){
                        // 実行に必要な Actions だけを抽出・定義
                        const actionRunner: CardActionSet = {
                            changeEnemyHP: this.changeEnemyHP,
                            removeCard: this.removeCard,
                            addCard: this.addCard
                        };
                        
                        cardToMove.onPlayFromHand(actionRunner); 
                    }else{
                        console.log('play ', cardToMove.name);
                    }
                    this.myField.push(cardToMove);
                }
                
                this.myPP -= cardToMove.cost; 

                this.myCombo++;
                
                return true; // 成功
            }
            
            // カードが見つからなかった場合
            return false;
        },
        
        /**
         * HPを変更するアクション
         * @param {number} amount - HPの増減量
         */
        changeEnemyHP(amount: number): void { 
            this.enemyHP += amount;
            if (this.enemyHP <= 0) {
                console.log('ゲーム終了: 勝利');
                // ゲーム終了処理...
            }
        },

        setMyEvolvePoints(point: number): void {
            this.myEvolvePoints = point;
        },

        setMySuperEvolvePoints(point: number): void {
            this.mySuperEvolvePoints = point;
        },

        saveState(state: GameState, filename: string = 'scenario.json'): void {
            localStorage.setItem('savedScenario', JSON.stringify(state));
        },

        loadState(): Boolean {
            const jsonString = localStorage.getItem('savedScenario');
            if (!jsonString) {
                return false; // 保存されたデータがない
            }
            
            try {
                // JSON文字列を GameState 型にパースして返す
                this.$state = JSON.parse(jsonString) as GameState;
                console.log('Game state loaded successfully.');
                return true;
            } catch (e) {
                console.error('Failed to parse game state JSON from localStorage:', e);
                return false;
            }
        }
    }
})