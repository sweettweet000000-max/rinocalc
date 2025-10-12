import { defineStore } from 'pinia';

interface BaseCard {
    id: number;
    name: string;
    cost: number;
}

export interface FollowerCard extends BaseCard {
    kind: 'follower';
    attack: number;
    hp: number;
    rush?: boolean;
    storm?: boolean;
}

export interface AmuletCard extends BaseCard {
    kind: 'amulet'; 
}

export interface SpellCard extends BaseCard {
    kind: 'spell'; 
}

export type Card = FollowerCard | AmuletCard | SpellCard;

// 初期の手札データ
const cardList: Card[] = [
  { id: 1, name: '神秘', kind: 'spell', cost: 0  },
  { id: 2, name: 'フェアリー', kind: 'follower', cost: 1, attack: 1, hp: 1, rush: true },
  { id: 3, name: 'メイ', kind: 'follower', cost: 1, attack: 1, hp: 1   },
  { id: 4, name: '招集', kind: 'spell', cost: 1  },
  { id: 5, name: '虫の知らせ', kind: 'spell', cost: 1  },
  { id: 6, name: '急襲', kind: 'spell', cost: 1  },
  { id: 7, name: '死矢', kind: 'spell', cost: 1  },
  { id: 8, name: 'リリィ', kind: 'follower', cost: 2, attack: 1, hp: 3  },
  { id: 9, name: 'テイマー', kind: 'follower', cost: 2, attack: 1, hp: 1   },
  { id: 10, name: 'カバン', kind: 'follower', cost: 2, attack: 2, hp: 2   },
  { id: 11, name: '花園', kind: 'spell', cost: 2  },
  { id: 12, name: '岩', kind: 'amulet', cost: 2  },
  { id: 13, name: 'リノセウス', kind: 'follower', cost: 3, attack: 0, hp: 2, storm: true  },
  { id: 14, name: '杖', kind: 'amulet', cost: 3  },
  { id: 15, name: 'バックウッド', kind: 'follower', cost: 5, attack: 3, hp: 3   },
  { id: 16, name: 'ベイル', kind: 'follower', cost: 8, attack: 4, hp: 4  },
];

export interface GameState {
    scenarioName: string;
    myHP: number;
    myPP: number;
    myExtraPP: boolean;
    myEvolvePoints: number;
    mySuperEvolvePoints: number;
    myCombo: number;
    enemyHP: number;
    cardList: Card[];
    hand: Card[];
    myField: Card[];
    enemyField: Card[];
    maxHP: number;
    maxPP: number;
    maxFieldSize: number;
    maxHandSize: number;
}

// エリアの型定義
type Area = 'cardList' | 'hand' | 'myField' | 'enemyField' | 'outside';

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