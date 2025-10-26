import { defineStore } from 'pinia';
import type { CardClass, GameState, Area, CardActionSet, SelectionRequirements, TargetResolver } from './card';
// import { フェアリー, 森の神秘, メイ, 招集, 虫の知らせ, 樹上からの急襲, 駆逐の死矢, リリィ, フェアリーテイマー, フェンサーフェアリー, カーバンクル, 花園, 燐光の岩, リノセウス, ギルネリーゼ, 杖, バックウッド, ベイル } from './card';

import { フェアリー , リリィ , フェアリーテイマー , フェンサーフェアリー , カーバンクル, 杖, リノセウス, 人形, reconstructCard } from './card';

const cardList: CardClass[] = [
    
    new フェアリー(crypto.randomUUID()),
    new リリィ(crypto.randomUUID()),
    new フェアリーテイマー(crypto.randomUUID()),
    new フェンサーフェアリー(crypto.randomUUID()),
    new カーバンクル(crypto.randomUUID()),
    new 杖(crypto.randomUUID()),
    new リノセウス(crypto.randomUUID()),
    new 人形(crypto.randomUUID())
    
];


// 初期の手札データ
// const cardList: CardClass[] = [
//     森の神秘,
//     フェアリー,
//     メイ,
//     招集, 
//     虫の知らせ,
//     樹上からの急襲,
//     駆逐の死矢,
//     リリィ,
//     フェアリーテイマー,
//     フェンサーフェアリー,
//     カーバンクル,
//     花園,
//     燐光の岩,
//     リノセウス,
//     ギルネリーゼ,
//     杖,
//     バックウッド,
//     ベイル
// ];

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

        isTargeting: false,
        selectionRequirements: {
            targetKind: 'any',
            targetArea: "myField",
            targetExceptions: [],
            count: 0,
            canCancel: true
        },
        targetResolver: null
    }),

    // === ゲッター (Getters) ===
    getters: {
        handCount: (state) => state.hand.length,
        isMyFieldFull: (state) => state.myField.length >= state.maxFieldSize,
        getAreaCards: (state) => (area: Area): CardClass[] => {
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
        removeCard(cardId: string, sourceArea: Area): boolean {
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
        addCard(cardData: CardClass, targetArea: Area, ): boolean {
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
        moveCard(cardId: string, sourceArea: Area, targetArea: Area): boolean {
            let cardToMove: CardClass | undefined;

            if (sourceArea === 'cardList') {
                cardToMove = this.cardList.find(c => c.id === cardId);
                if (!cardToMove) return false;

                cardToMove.id = crypto.randomUUID();
                this.addCard(cardToMove, targetArea);
                
            } else {
                // 移動元からカードデータを取得
                cardToMove = this.getAreaCards(sourceArea).find(c => c.id === cardId);
                if (!cardToMove) return false;

                this.addCard(cardToMove, targetArea);
                this.removeCard(cardId, sourceArea);
            }

            return true;
        },

        // ユーザー選択を待つための実装
        requestTargetSelection(requirements: SelectionRequirements): Promise<string[] | null> {
            let canTarget = true;
            switch(requirements.targetArea) {
                case 'myField':
                    canTarget = this.myField.filter(
                        (card) => !requirements.targetExceptions.includes(card.id)
                    ).length != 0;
                    requirements.count = Math.min(this.myField.length, requirements.count);
                    break;
            }

            if (!canTarget) {
                return Promise.resolve([]); 
            }else {
                return new Promise<string[] | null>((resolve) => {
                    // 【重要な処理】
                    this.isTargeting = true;
                    this.selectionRequirements = requirements;
                    this.targetResolver = resolve;
                });
            }
        },

        completeTargetingAction(selectedIds: string[] | null): void {
            if (this.isTargeting && this.targetResolver) {
                this.targetResolver(selectedIds);
            
                this.isTargeting = false;
                this.selectionRequirements = {
                    targetKind: 'any',
                    targetArea: "myField",
                    targetExceptions: [],
                    count: 0,
                    canCancel: true
                };
                this.targetResolver = null;
            }
        },

        async playCardFromHand(cardId: string): Promise<boolean> {
            if (this.isMyFieldFull) {
                console.warn('場が満員のため、カードを出せません。');
                return false;
            }

            const cardToMove = this.hand.find(card => card.id === cardId);

            if (cardToMove) {
                if (this.myPP < cardToMove.cost) { 
                    console.log("PPが足りないため、カードを出せません。");
                    return false;
                }

                if(cardToMove.kind === "follower"
                    ||
                    cardToMove.kind === "amulet"
                ){
                    if(cardToMove.onPlayFromHand){
                        // 実行に必要な Actions だけを抽出・定義
                        const actionRunner: CardActionSet = {
                            changeEnemyHP: this.changeEnemyHP,
                            removeCard: this.removeCard,
                            addCard: this.addCard,
                            moveCard: this.moveCard,
                            requestTargetSelection: this.requestTargetSelection,
                            myCombo: this.myCombo
                        };
                        
                        //キャンセルした場合はfalseとなる
                        if(!await cardToMove.onPlayFromHand(actionRunner)){
                            return false;
                        }
                    }else{
                        console.log('play ', cardToMove.name);
                    }
                    this.myField.push(cardToMove);
                }

                this.removeCard(cardId, 'hand');
                
                this.myPP -= cardToMove.cost; 

                this.myCombo++;
                
                return true; // 成功
            }
            
            // カードが見つからなかった場合
            console.error("カードが見つかりません");
            return false;
        },

        async actCardOnField(cardId: string): Promise<boolean> {
            const cardToMove = this.myField.find(card => card.id === cardId);

            if (cardToMove && cardToMove.onActOnField) {
                // 実行に必要な Actions だけを抽出・定義
                const actionRunner: CardActionSet = {
                    changeEnemyHP: this.changeEnemyHP,
                    removeCard: this.removeCard,
                    addCard: this.addCard,
                    moveCard: this.moveCard,
                    requestTargetSelection: this.requestTargetSelection,
                    myCombo: this.myCombo
                };
                
                //キャンセルした場合はfalseとなる
                if(!await cardToMove.onActOnField(actionRunner)){
                    return false;
                }

                this.removeCard(cardId, 'myField');
                
                return true; // 成功
            }
            
            // カードが見つからなかった場合
            console.error("カードが見つかりません");
            return false;
        },

        executeAttack(attackerId: string, targetId: string): void {
            const attacker = this.myField.find(card => card.id === attackerId);

            if(attacker && targetId == 'ENEMY_LEADER'){
                this.changeEnemyHP(-attacker.getAttack());
            }
            else {
                const target = this.enemyField.find(card => card.id === targetId);

                if(attacker && target){
                    if(attacker.onDamage(target.getAttack())){
                        this.removeCard(attackerId, 'myField');
                    }
                    if(target.onDamage(attacker.getAttack())){
                        this.removeCard(targetId, 'enemyField');
                    }

                    console.log("攻撃処理完了")
                }
            }
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
                    const rawState = JSON.parse(jsonString); 
                    
                    if (rawState.hand) {
                        rawState.hand = rawState.hand.map((cardData: any) => reconstructCard(cardData));
                    }
                    if (rawState.myField) {
                        rawState.myField = rawState.myField.map((cardData: any) => reconstructCard(cardData));
                    }
                    if (rawState.enemyField) {
                        rawState.enemyField = rawState.enemyField.map((cardData: any) => reconstructCard(cardData));
                    }
                    if(rawState.cardList){
                        rawState.cardList = rawState.cardList.map((cardData: any) => reconstructCard(cardData));
                    }

                    console.log(rawState);

                    this.$state = rawState as GameState;

                    console.log('Game state loaded successfully.');
                    return true;
                } catch (e) {
                    console.error('Failed to parse or reconstruct game state:', e);
                    return false;
                }
        }
    }
})