// エリアの型定義
export type Area = 'cardList' | 'hand' | 'myField' | 'enemyField' | 'outside';
export type CardType = 'any' | 'follower' | 'spell' | 'amulet';

export interface CardActionSet {
    changeEnemyHP: (amount: number) => void;
    removeCard: (cardId: string, sourceArea: Area) => boolean;
    addCard: (cardData: CardClass, targetArea: Area) => boolean;
    moveCard: (cardId: string, sourceArea: Area, targetArea: Area) => boolean;
    myCombo: number;
    /**
     * 場の特定のカードを選択するよう、UIに要求し、結果を待機する。
     * @param requirements 選択に必要な条件（何枚選ぶか、どんな特性のカードかなど）
     * @returns ユーザーが選択したカードのIDの配列
     */
    requestTargetSelection: (
        requirements: SelectionRequirements
    ) => Promise<string[] | null>;
}

export interface SelectionRequirements {
    targetKind: CardType;
    targetArea: Area;
    targetExceptions: string[];
    count: number;
    canCancel: boolean;
}

export type TargetResolver = (selectedIds: string[] | null) => void;

export abstract class BaseCardClass {
    public id: string;
    public name: string;
    public cost: number;

    constructor(data: { id: string, name: string, cost: number }) {
        this.id = data.id;
        this.name = data.name;
        this.cost = data.cost;
    }

    public async onPlayFromHand(actions: CardActionSet): Promise<boolean> {
        // デフォルトでは何もしない（能力を持たないカードの場合）
        console.log(`[${this.name}] がプレイされました。特殊効果なし。`);
        return true;
    }

    public async onActOnField(actions: CardActionSet): Promise<boolean> {
        // デフォルトでは何もしない（能力を持たないカードの場合）
        console.log(`[${this.name}] がアクトされました。特殊効果なし。`);
        return false;
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
}

export class SpellCardClass extends BaseCardClass {
    public kind: 'spell' = 'spell';

    constructor(data: any) {
        super(data);
    }
}

export class AmuletCardClass extends BaseCardClass {
    public kind: 'amulet' = 'amulet';

    constructor(data: any) {
        super(data);
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

    public async onPlayFromHand(actions: CardActionSet): Promise<boolean> {
        actions.addCard(new フェアリー(crypto.randomUUID()), 'hand'); 
        actions.addCard(new フェアリー(crypto.randomUUID()), 'hand'); 
        return true;
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

    public async onPlayFromHand(actions: CardActionSet): Promise<boolean> {
        console.log(`[${this.name}] がプレイされました。ターゲットを選択します...`);
        
        const selectedIds = await actions.requestTargetSelection({
            targetKind: 'any',
            targetArea: "myField",
            targetExceptions: [this.id],
            count: 1,
            canCancel: true
        });

        if(selectedIds && selectedIds?.length == 0){
            console.log(`ターゲットが存在しないため、特殊効果は発動しません`);
        }
        else if (selectedIds && selectedIds.length > 0) {
            const targetId = selectedIds[0];
            console.log(`ターゲットカード (${targetId}) に効果を発動します。`);
            
            if(!targetId) {
                console.log("ターゲットを適切に選べませんでした。")
                return false;
            }

            // 選択したカードを場から取り除く効果
            actions.moveCard(targetId, 'myField', 'hand'); 
        } else {
            // 選択がキャンセルされた、または失敗した場合の処理
            console.log("ターゲット選択が完了しませんでした。");
            return false;
        }

        return true;
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

export class リノセウス extends FollowerCardClass {
    constructor(id: string) {
        super({ id: id, name: 'リノセウス', cost: 3, attack: 0, hp: 2, storm: true });
    }

    public async onPlayFromHand(actions: CardActionSet): Promise<boolean> {
        this.attack = actions.myCombo + 1;
        return true;
    }
}

// export const ギルネリーゼ: FollowerCard = {
//     id: 15,
//     name: 'ギルネリーゼ',
//     kind: 'follower', 
//     cost: 3, 
//     attack: 0, 
//     hp: 3
// }

export class 杖 extends AmuletCardClass {
    constructor(id: string) {
        super({ id: id, name: '杖', cost: 3});
    }

    public async onActOnField(actions: CardActionSet): Promise<boolean> {
        console.log(`[${this.name}] がアクトされました。ターゲットを選択します...`);
        
        const selectedIds = await actions.requestTargetSelection({
            targetKind: 'any',
            targetArea: "myField",
            targetExceptions: [this.id],
            count: 1,
            canCancel: true
        });

        if (selectedIds && selectedIds.length > 0) {
            const targetId = selectedIds[0];
            console.log(`ターゲットカード (${targetId}) に効果を発動します。`);
            
            if(!targetId) {
                console.log("ターゲットを適切に選べませんでした。")
                return false;
            }

            // 選択したカードを場から取り除く効果
            actions.moveCard(targetId, 'myField', 'hand'); 
        } else {
            // 選択がキャンセルされた、または失敗した場合の処理
            console.log("ターゲット選択が完了しませんでした。");
            return false;
        }

        return true;
    }
}

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


export type CardClass = フェアリー | リリィ | フェアリーテイマー | フェンサーフェアリー | カーバンクル | 杖 | リノセウス;

export const CardConstructorMap: Record<string, new (data: any) => BaseCardClass> = {
    'フェアリー': フェアリー,
    'リリィ': リリィ,
    'テイマー': フェアリーテイマー,
    'フェンサー': フェンサーフェアリー,
    'カバン': カーバンクル,
    '杖': 杖,
    'リノセウス': リノセウス
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

    isTargeting: Boolean;
    selectionRequirements: SelectionRequirements;
    targetResolver: TargetResolver | null;
}