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
export type Area = 'cardList' | 'hand' | 'myField' | 'enemyField' | 'outside';

export interface CardActionSet {
    changeEnemyHP: (amount: number) => void;
    removeCard: (cardId: number, sourceArea: Area) => boolean;
    addCard: (cardData: Card, targetArea: Area) => boolean;
}

interface BaseCard {
    id: number;
    name: string;
    cost: number;
    onPlayFromHand?: (actions: CardActionSet) => void;
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