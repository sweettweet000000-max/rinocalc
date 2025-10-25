// エリアの型定義
export type Area = 'cardList' | 'hand' | 'myField' | 'enemyField' | 'outside';

export interface CardActionSet {
    changeEnemyHP: (amount: number) => void;
    removeCard: (cardId: string, sourceArea: Area) => boolean;
    addCard: (cardData: CardClass, targetArea: Area) => boolean;
}

export abstract class BaseCardClass {
    public id: string;
    public name: string;
    public cost: number;

    constructor(data: { id: string, name: string, cost: number }) {
        this.id = data.id;
        this.name = data.name;
        this.cost = data.cost;
    }

    public onPlayFromHand(actions: CardActionSet): void {
        // デフォルトでは何もしない（能力を持たないカードの場合）
        console.log(`[${this.name}] がプレイされました。特殊効果なし。`);
    }
}

export class FollowerCardClass extends BaseCardClass {
    public kind: 'follower' = 'follower';
    public attack: number;
    public hp: number;
    public rush?: boolean;
    public storm?: boolean;

    constructor(data: any) {
        super(data); // BaseCardClassのプロパティを初期化
        this.attack = data.attack;
        this.hp = data.hp;
        this.rush = data.rush;
        this.storm = data.storm;
    }

    // 💡 攻撃時効果などのロジックをここにonAttack()メソッドとして追加できます
    // public onAttack(target: FollowerCardClass, actions: CardActionSet): void { ... }
}

export class SpellCardClass extends BaseCardClass {
    public kind: 'spell' = 'spell';

    constructor(data: any) {
        super(data); // BaseCardClassのプロパティを初期化
    }
}

export class AmuletCardClass extends BaseCardClass {
    public kind: 'amulet' = 'amulet';

    constructor(data: any) {
        super(data); // BaseCardClassのプロパティを初期化
    }
}

// export const 森の神秘: SpellCard = {
//     id: 1, 
//     name: '神秘',
//     kind: 'spell',
//     cost: 0
// }

export class フェアリー extends FollowerCardClass {
    constructor(id: string) {
        super({ id: id, name: 'フェアリー', cost: 1, attack: 1, hp: 1, rush: true });
    }
}

// export const メイ: FollowerCard = {
//     id: 3,
//     name: 'メイ',
//     kind: 'follower', 
//     cost: 1, 
//     attack: 1, 
//     hp: 1 
// }

// export const 招集: SpellCard = {
//     id: 4, 
//     name: '招集', 
//     kind: 'spell',
//     cost: 1  
// }

// export const 虫の知らせ: SpellCard = {
//     id: 5, 
//     name: '虫の知らせ', 
//     kind: 'spell', 
//     cost: 1  
// }

// export const 樹上からの急襲: SpellCard = {
//     id: 6,
//     name: '急襲', 
//     kind: 'spell', 
//     cost: 1  
// }

// export const 駆逐の死矢: SpellCard = {
//     id: 7,
//     name: '死矢', 
//     kind: 'spell', 
//     cost: 1  
// }

export class リリィ extends FollowerCardClass {
    constructor(id: string) {
        super({ id: id, name: 'リリィ', cost: 2, attack: 1, hp: 3 });
    }
}

export class フェアリーテイマー extends FollowerCardClass {
    constructor(id: string) {
        super({ id: id, name: 'テイマー', cost: 2, attack: 1, hp: 1 });
    }

    public onPlayFromHand(actions: CardActionSet): void {
        actions.addCard(new フェアリー(crypto.randomUUID()), 'hand'); 
        actions.addCard(new フェアリー(crypto.randomUUID()), 'hand'); 
    }
}

export class フェンサーフェアリー extends FollowerCardClass {
    constructor(id: string) {
        super({ id: id, name: 'フェンサー', cost: 2, attack: 2, hp: 2 });
    }
}

export class カーバンクル extends FollowerCardClass {
    constructor(id: string) {
        super({ id: id, name: 'カバン', cost: 2, attack: 2, hp: 2 });
    }
}

// export const 花園: SpellCard = {
//     id: 12,
//     name: '花園', 
//     kind: 'spell', 
//     cost: 2
// }

// export const 燐光の岩: AmuletCard = {
//     id: 13,
//     name: '岩', 
//     kind: 'amulet', 
//     cost: 2
// }

// export const リノセウス: FollowerCard = {
//     id: 14,
//     name: 'リノセウス',
//     kind: 'follower', 
//     cost: 3, 
//     attack: 0, 
//     hp: 2, 
//     storm: true 
// }

// export const ギルネリーゼ: FollowerCard = {
//     id: 15,
//     name: 'ギルネリーゼ',
//     kind: 'follower', 
//     cost: 3, 
//     attack: 0, 
//     hp: 3
// }

// export const 杖: AmuletCard = {
//     id: 16,
//     name: '杖', 
//     kind: 'amulet', 
//     cost: 3
// }

// export const バックウッド: FollowerCard = {
//     id: 17,
//     name: 'バックウッド',
//     kind: 'follower', 
//     cost: 5, 
//     attack: 3, 
//     hp: 3
// }

// export const ベイル: FollowerCard = {
//     id: 18,
//     name: 'ベイル',
//     kind: 'follower', 
//     cost: 8, 
//     attack: 4, 
//     hp: 4
// }


export type CardClass = フェアリー | リリィ | フェアリーテイマー | フェンサーフェアリー | カーバンクル;

export const CardConstructorMap: Record<string, new (data: any) => BaseCardClass> = {
    'フェアリー': フェアリー,
    'リリィ': リリィ,
    'テイマー': フェアリーテイマー,
    'フェンサー': フェンサーフェアリー,
    'カバン': カーバンクル
};

// JSONデータ（メソッドを持たないオブジェクト）をクラスインスタンスに変換する関数
export function reconstructCard(cardData: any): CardClass {
    const cardClass = CardConstructorMap[cardData.name];
    
    if (!cardClass) {
        // 未知のカードIDの場合のフォールバック処理
        throw new Error(`Unknown card ID: ${cardData.id}`);
    }

    // 💡 データを使って、正しいクラスのインスタンスを生成する
    return new cardClass(crypto.randomUUID()) as CardClass;
}

export interface GameState {
    scenarioName: string;
    myHP: number;
    myPP: number;
    myExtraPP: boolean;
    myEvolvePoints: number;
    mySuperEvolvePoints: number;
    myCombo: number;
    enemyHP: number;
    cardList: CardClass[];
    hand: CardClass[];
    myField: CardClass[];
    enemyField: CardClass[];
    maxHP: number;
    maxPP: number;
    maxFieldSize: number;
    maxHandSize: number;
}