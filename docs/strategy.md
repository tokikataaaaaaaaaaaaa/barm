# BARM (Be-a-real-man) Phase 2 Strategy Document

**作成日:** 2026-01-02
**ステータス:** Phase 2 完了 → Phase 3 (Requirements) へ

---

## Executive Summary

BARMは「男性特化の筋トレ×勉強習慣化アプリ」として、競合不在の市場ポジションを確立する。**WebView + Flutter シェル方式**（Next.js Web アプリ + Flutter WebView ラッパー）を採用し、**3ヶ月以内にMVPをリリース**。Web デプロイで即時反映できるため、App Store 審査を最小化し高速リリースサイクルを実現。Twitter運用とASOに集中したローコストマーケティングで初期ユーザーを獲得する。

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

### 推奨スタック（WebView + Flutter シェル方式）

```
Web App:       Next.js 14 (App Router) + React + TailwindCSS
Mobile Shell:  Flutter (WebView only) + RevenueCat
Backend:       Firebase (Web SDK)
               - Firestore (NoSQL)
               - Firebase Auth
               - Cloud Functions (必要に応じて)
Database:      Firestore（NoSQL）
Payment:       RevenueCat (Flutter側で処理) + App Store IAP
Analytics:     Firebase Analytics (Web SDK) + Vercel Analytics
Hosting:       Vercel (Web App)
```

### アーキテクチャ概要

```
┌─────────────────────────────────────────────────────┐
│                    iOS App                          │
│  ┌───────────────────────────────────────────────┐  │
│  │         Flutter Shell (WebView)              │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │                                         │  │  │
│  │  │         Next.js Web App                 │  │  │
│  │  │         (Vercel hosted)                 │  │  │
│  │  │                                         │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  │                                               │  │
│  │  ┌─────────────┐   ┌─────────────────────┐   │  │
│  │  │ RevenueCat  │   │ Native Bridge       │   │  │
│  │  │ (課金処理)  │   │ (JS <-> Flutter)    │   │  │
│  │  └─────────────┘   └─────────────────────┘   │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │      Firebase         │
              │   (Web SDK経由)       │
              └───────────────────────┘
```

### 選定理由

| 技術 | 選定理由 |
|------|----------|
| **Next.js + TailwindCSS** | 高速開発。Web デプロイで即時反映。SEO対応不要なのでCSR中心。 |
| **Flutter WebView** | iOS/Android 両対応のシェル。App Store 公開に必要。ネイティブ機能（課金）へのブリッジ。 |
| **Firebase (Web SDK)** | Next.js から直接利用。認証・DB・Analyticsが統合。日本語情報豊富。 |
| **RevenueCat (Flutter)** | App Store IAP 必須のため Flutter 側で処理。サブスク管理を簡素化。月$2,500収益まで無料。 |
| **Vercel** | Next.js の最適なホスティング。無料枠で十分。デプロイが高速。 |

### WebView + Flutter シェル方式のメリット

| メリット | 説明 |
|----------|------|
| **高速リリースサイクル** | Web アプリの変更は Vercel デプロイで即時反映。App Store 審査不要。 |
| **App Store 審査最小化** | 初回審査とシェル更新時のみ。UI/機能変更は Web 側で完結。 |
| **開発効率** | React/Next.js の豊富なエコシステム。Hot Reload で高速開発。 |
| **将来の展開** | Web 版単体公開も可能。PWA 化も容易。 |

### WebView + Flutter シェル方式の注意点

| 注意点 | 対策 |
|--------|------|
| **オフライン対応が限定的** | Service Worker でキャッシュ。重要データは IndexedDB に保存。 |
| **ネイティブ機能へのアクセス** | JavaScript Bridge で Flutter 側と通信。課金は Flutter 側で処理。 |
| **パフォーマンス** | シンプルな UI 設計。重い処理は避ける。 |

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

| 項目 | 月額 | 備考 |
|------|------|------|
| Vercel | $0 | Hobby プラン（個人利用）で十分 |
| Firebase | $0〜$10 | 従量課金、初期は無料枠内 |
| Apple Developer | 約1,000円 | 年額約12,000円 |
| RevenueCat | $0 | 月$2,500収益まで無料 |
| **合計** | **約1,000〜2,000円/月** | |

### Vercel無料枠

| リソース | 無料枠 |
|----------|--------|
| Bandwidth | 100GB/月 |
| Serverless Function実行 | 100GB-Hours/月 |
| ビルド時間 | 6,000分/月 |
| デプロイ | 無制限 |

### Firebase無料枠

| サービス | 無料枠 |
|----------|--------|
| Firestore | 1GB storage, 50K reads/day, 20K writes/day |
| Auth | 無制限 |
| Analytics | 無制限 |

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

| Phase | 期間 | 内容 | 担当 |
|-------|------|------|------|
| 1 | 1週間 | プロジェクトセットアップ（Next.js + Flutter Shell） | 共通 |
| 2 | 1週間 | 認証・ユーザー管理（Firebase Auth Web SDK） | Web |
| 3 | 2週間 | ミッション設定・トラッキング | Web |
| 4 | 2週間 | グループ・仲間機能 | Web |
| 5 | 1週間 | Flutter Shell + WebView 連携 | Flutter |
| 6 | 1週間 | 決済連携（RevenueCat + JS Bridge） | Flutter + Web |
| 7 | 1週間 | UI/UX磨き込み | Web |
| 8 | 1週間 | テスト・バグ修正 | 共通 |
| 9 | 1週間 | App Store審査対応 | Flutter |
| **合計** | **約3ヶ月** | | |

### 開発フロー

```
Web App 開発 (Next.js)
├─ 認証 → ミッション → グループ → UI磨き込み
│           ↓
│     Vercel にデプロイ（即時反映）
│           ↓
│     ブラウザでテスト
│           ↓
Flutter Shell 開発（並行）
├─ WebView 設定
├─ RevenueCat 連携
├─ JS Bridge 実装
│           ↓
App Store 審査（初回のみ重要）
│           ↓
リリース後の機能追加は Web 側のみ
```

### マーケティングフェーズ

| Phase | 期間 | 内容 | 目標 |
|-------|------|------|------|
| 検証 | 0〜2ヶ月 | クローズドβ → ソフトローンチ | 有料100人 |
| 成長 | 2〜5ヶ月 | Apple Search Ads + インフルエンサー | 有料500人 |

---

## 5. リスクと対策

| リスク | 影響度 | 対策 |
|--------|--------|------|
| グループが集まらない | 高 | マッチング機能検討、Twitter上でチームメイト募集支援 |
| App Store審査リジェクト | 低 | WebView アプリは比較的審査通りやすい。課金は RevenueCat で標準実装。 |
| WebView パフォーマンス問題 | 中 | シンプルな UI 設計。重い処理は避ける。必要なら Native 機能追加。 |
| オフライン対応の制限 | 中 | Service Worker でキャッシュ。重要データは IndexedDB に保存。 |
| 継続率が低い | 高 | 通知最適化、ゲーミフィケーション強化（Web Push 検討） |
| Firestore読み取りコスト増 | 中 | キャッシュ活用、クエリ最適化、React Query でクライアントキャッシュ |

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
4. JS Bridge API 設計（Web <-> Flutter 通信）
5. テストケース定義

### 今すぐ実行可能なアクション

1. Node.js 開発環境構築
2. Flutter 開発環境構築（WebView + RevenueCat 用）
3. Firebase プロジェクト作成
4. Vercel アカウント作成
5. Apple Developer 登録（未登録の場合）
6. Twitter 開発者アカウント開設

---

## 調査チーム

- **PM:** MVPスコープ定義、オーケストレーション
- **Architect:** 技術スタック選定
- **Marketer:** マーケティング戦略立案
