import type {FollowerCard, SpellCard, AmuletCard} from './game_types'

export const 森の神秘: SpellCard = {
    id: 1, 
    name: '神秘',
    kind: 'spell',
    cost: 0
}

export const フェアリー: FollowerCard = {
    id: 2,
    name: 'フェアリー',
    kind: 'follower',
    cost: 1,
    attack: 1,
    hp: 1,
    rush: true 
}

export const メイ: FollowerCard = {
    id: 3,
    name: 'メイ',
    kind: 'follower', 
    cost: 1, 
    attack: 1, 
    hp: 1 
}

export const 招集: SpellCard = {
    id: 4, 
    name: '招集', 
    kind: 'spell',
    cost: 1  
}

export const 虫の知らせ: SpellCard = {
    id: 5, 
    name: '虫の知らせ', 
    kind: 'spell', 
    cost: 1  
}

export const 樹上からの急襲: SpellCard = {
    id: 6,
    name: '急襲', 
    kind: 'spell', 
    cost: 1  
}

export const 駆逐の死矢: SpellCard = {
    id: 7,
    name: '死矢', 
    kind: 'spell', 
    cost: 1  
}

export const リリィ: FollowerCard = {
    id: 8,
    name: 'リリィ',
    kind: 'follower', 
    cost: 2, 
    attack: 1, 
    hp: 3 
}

export const フェアリーテイマー: FollowerCard = {
    id: 9,
    name: 'テイマー',
    kind: 'follower', 
    cost: 2, 
    attack: 1, 
    hp: 1,
    onPlayFromHand(actions) {
        actions.addCard(フェアリー, 'hand');
        console.log("fairy tamer summoned")
    },
}

export const フェンサーフェアリー: FollowerCard = {
    id: 10,
    name: 'フェンサー',
    kind: 'follower', 
    cost: 2, 
    attack: 2, 
    hp: 2 
}

export const カーバンクル: FollowerCard = {
    id: 11,
    name: 'カバン',
    kind: 'follower', 
    cost: 2, 
    attack: 2, 
    hp: 2 
}

export const 花園: SpellCard = {
    id: 12,
    name: '花園', 
    kind: 'spell', 
    cost: 2
}

export const 燐光の岩: AmuletCard = {
    id: 13,
    name: '岩', 
    kind: 'amulet', 
    cost: 2
}

export const リノセウス: FollowerCard = {
    id: 14,
    name: 'リノセウス',
    kind: 'follower', 
    cost: 3, 
    attack: 0, 
    hp: 2, 
    storm: true 
}

export const ギルネリーゼ: FollowerCard = {
    id: 15,
    name: 'ギルネリーゼ',
    kind: 'follower', 
    cost: 3, 
    attack: 0, 
    hp: 3
}

export const 杖: AmuletCard = {
    id: 16,
    name: '杖', 
    kind: 'amulet', 
    cost: 3
}

export const バックウッド: FollowerCard = {
    id: 17,
    name: 'バックウッド',
    kind: 'follower', 
    cost: 5, 
    attack: 3, 
    hp: 3
}

export const ベイル: FollowerCard = {
    id: 18,
    name: 'ベイル',
    kind: 'follower', 
    cost: 8, 
    attack: 4, 
    hp: 4
}