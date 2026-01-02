# BARM (Be-a-real-man) Phase 2 Strategy Document

**作成日:** 2026-01-02
**ステータス:** Phase 2 完了 → Phase 3 (Requirements) へ

---

## Executive Summary

BARMは「男性特化の筋トレ×勉強習慣化アプリ」として、競合不在の市場ポジションを確立する。Flutter + Firebase + RevenueCatのモダンスタックで、4ヶ月以内にMVPをリリース。Twitter運用とASOに集中したローコストマーケティングで初期ユーザーを獲得する。

---

## 1. MVP Scope Definition

### Must-have（MVP必須）

| 機能 | 説明 | 優先度 |
|------|------|--------|
| ミッション設定・トラッキング | 筋トレ/勉強の目標設定と記録 | P0 |
| 筋トレ種目の自由追加 | 腕立て、懸垂、スクワット等 | P0 |
| 仲間の記録閲覧 | 3-5人の小グループで記録共有 | P0 |
| サブスク課金 | 月300円、達成時100円 | P0 |

### Should-have（余裕があれば）

| 機能 | 説明 |
|------|------|
| 勉強種目の自由追加 | 英語、資格勉強等 |
| アプリからのミッション提案 | デフォルトテンプレート |
| 通知・リマインダー | プッシュ通知（FCM） |

### Could-have（将来検討）

| 機能 | 説明 |
|------|------|
| ランキング・バッジ | ゲーミフィケーション |
| SNSシェア機能 | 口コミ拡散 |

### Won't-have（明確に除外）

| 機能 | 理由 |
|------|------|
| 動画コンテンツ | 開発コスト高 |
| AIトレーナー | 複雑すぎる |
| Android版（初期） | iOS先行 |

---

## 2. Tech Stack Selection

### 推奨スタック

```
Frontend:  Flutter + Riverpod（状態管理）
Backend:   Firebase（Firestore + Auth + FCM）
Database:  Firestore（NoSQL）
Payment:   RevenueCat + App Store IAP
Analytics: Firebase Analytics + Crashlytics
```

### 選定理由

| 技術 | 選定理由 |
|------|----------|
| **Flutter** | iOS先行でも将来Android展開可能。ホットリロードで高速開発。 |
| **Firebase** | 通知(FCM)・Analytics・Crashlyticsが統合。Flutter連携が成熟。日本語情報豊富。 |
| **RevenueCat** | サブスク管理を簡素化。月$2,500収益まで無料。 |

### Firestore Data Structure

```
users/
  {userId}/
    displayName: string
    createdAt: timestamp

groups/
  {groupId}/
    name: string
    inviteCode: string
    createdAt: timestamp
    members/
      {userId}/
        joinedAt: timestamp

missions/
  {missionId}/
    userId: string
    type: 'workout' | 'study'
    name: string
    targetValue: number
    unit: string
    isActive: boolean
    createdAt: timestamp

records/
  {recordId}/
    userId: string
    missionId: string
    value: number
    recordedAt: date
    createdAt: timestamp

subscriptions/
  {userId}/
    status: 'active' | 'cancelled' | 'expired'
    isGoalAchieved: boolean
    currentPeriodEnd: timestamp
```

### コスト見積もり

| 項目 | 月額 |
|------|------|
| Firebase | $0〜$10（従量課金、初期は無料枠内） |
| Apple Developer | 約1,000円 |
| RevenueCat | $0 |
| **合計** | **約1,000〜2,000円/月** |

### Firebase無料枠

| サービス | 無料枠 |
|----------|--------|
| Firestore | 1GB storage, 50K reads/day, 20K writes/day |
| Auth | 無制限 |
| FCM | 無制限 |
| Analytics | 無制限 |
| Crashlytics | 無制限 |

---

## 3. Marketing Strategy

### 市場ポジショニング

**Core Value:**
「男だけの少人数チームで、筋トレと勉強を"やりきる"習慣をつくる」

**Target Segment:**
- Primary: 20〜30代社会人男性（可処分所得あり、課金抵抗低い）
- Secondary: 10代学生男性（口コミ拡散力高い）

**差別化:**
| vs 競合 | BARMの優位性 |
|---------|-------------|
| みんチャレ | 男性専用＋筋トレ特化 |
| Habitica | 「男同士のプレッシャー」で継続 |
| バーンフィット | 仲間との共有が核、価格半額以下 |

### メッセージング

**Primary Message:**
「一人じゃ続かない。だから、男5人で変わる。」

**Tone:** 男らしい・ストレート・煽りすぎない

### チャネル戦略

| Channel | Priority | 施策 |
|---------|----------|------|
| **Twitter (X)** | High | 開発過程発信、βテスター募集 |
| **ASO** | High | キーワード最適化（筋トレ 習慣、筋トレ 仲間） |
| Apple Search Ads | Medium | ローンチ後、月1〜2万円 |

### ローンチアプローチ

1. **クローズドβ（Phase A）:** 知人10〜20人、2週間
2. **クローズドβ（Phase B）:** Twitter募集50〜100人、4週間
3. **ソフトローンチ:** ASO最適化してApp Store公開

### 成功指標

| 指標 | ベータ目標 | ローンチ3ヶ月目標 |
|------|-----------|------------------|
| 継続率（7日） | 50% | 40% |
| 継続率（30日） | 30% | 25% |
| 課金転換率 | 10% | 5% |
| グループ作成率 | 60% | 50% |

---

## 4. Implementation Roadmap

### 開発フェーズ

| Phase | 期間 | 内容 |
|-------|------|------|
| 1 | 2週間 | 認証・ユーザー管理（Firebase Auth） |
| 2 | 3週間 | ミッション設定・トラッキング |
| 3 | 3週間 | グループ・仲間機能 |
| 4 | 2週間 | 決済連携（RevenueCat） |
| 5 | 1週間 | プッシュ通知（FCM） |
| 6 | 2週間 | UI/UX磨き込み |
| 7 | 2週間 | テスト・バグ修正 |
| 8 | 1-2週間 | App Store審査対応 |
| **合計** | **約4ヶ月** | |

### マーケティングフェーズ

| Phase | 期間 | 内容 | 目標 |
|-------|------|------|------|
| 検証 | 0〜3ヶ月 | クローズドβ → ソフトローンチ | 有料100人 |
| 成長 | 3〜6ヶ月 | Apple Search Ads + インフルエンサー | 有料500人 |

---

## 5. リスクと対策

| リスク | 影響度 | 対策 |
|--------|--------|------|
| グループが集まらない | 高 | マッチング機能検討、Twitter上でチームメイト募集支援 |
| App Store審査リジェクト | 中 | ガイドライン遵守、課金機能は早めにテスト |
| 継続率が低い | 高 | 通知最適化、ゲーミフィケーション強化 |
| Firestore読み取りコスト増 | 中 | キャッシュ活用、クエリ最適化 |

---

## 6. 技術実装で考慮すべきマーケティング要件

- **招待コード機能:** ベータ管理＋バイラル係数計測
- **UTMパラメータ対応:** 流入元トラッキング
- **App Store用素材:** スクリーンショット（6.7/6.5インチ）
- **Firebase Analytics イベント:** 登録、グループ作成、初回記録、7日継続、課金

---

## 次のステップ

### Phase 3 (Requirements) へ進む

1. PRD（Product Requirements Document）作成
2. 詳細なUI/UX設計
3. Firestoreセキュリティルール設計
4. テストケース定義

### 今すぐ実行可能なアクション

1. Flutter開発環境構築
2. Firebaseプロジェクト作成
3. Twitter開発者アカウント開設
4. Apple Developer登録（未登録の場合）

---

## 調査チーム

- **PM:** MVPスコープ定義、オーケストレーション
- **Architect:** 技術スタック選定
- **Marketer:** マーケティング戦略立案
