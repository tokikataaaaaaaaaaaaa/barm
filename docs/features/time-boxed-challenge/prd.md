# Time-Boxed Challenge - PRD

**Feature Name:** `time-boxed-challenge`
**Service:** `barm`
**Phase:** 5 - Implemented
**Created:** 2026-01-03
**Updated:** 2026-01-04
**Status:** Implemented
**Demo:** `/demo/time-boxed-challenge`

---

## 1. Overview

### Summary

期間限定チャレンジ（1週間/2週間/1ヶ月）に参加し、同時期に始めた仲間と一緒にゴールを目指す機能。初回無料、成功後課金モデルで継続率と課金転換率を向上させる。

### Background

現在の BARM は「個人ミッション + グループ」モデルで、Todo アプリと差別化が不十分。ユーザーは「一人だと続かない」「いつでもやめられる」心理で離脱しやすい。

**課題:**
- 差別化不足（Todo アプリと大差ない）
- 仲間意識の欠如（「一緒に頑張ってる」感が薄い）
- コミットメント不足（いつでもやめられる）
- 課金タイミングの壁（無料→有料で離脱）

### Goals

1. **コミットメント強化**: 期限付きチャレンジで「やらなきゃ」感を創出
2. **仲間意識の醸成**: 同時スタートの参加者表示で「一緒に頑張る」感覚
3. **課金転換率向上**: 成功体験後の課金で抵抗感を軽減
4. **競合との差別化**: Cohorty/みんチャレとの明確な差別化

### Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| 7日継続率 | 40% | 70%+ | Firebase Analytics |
| 課金転換率 | 5% | 15%+ | RevenueCat Dashboard |
| チャレンジ完走率 | N/A | 60%+ | Firestore Aggregation |
| NPS | +20 | +40+ | アプリ内サーベイ |

### Design Principles

以下のデザイン原則はデモレビューで決定されたもの。実装時に遵守すること。

1. **自分中心の表示**
   - 自分の記録は常に画面上部に表示
   - カレンダーの色は自分の達成状況で決まる（他人の達成は関係ない）
   - 他人より自分が達成できていると優越感・自己肯定感が得られる

2. **パーセンテージ非表示**
   - UIでパーセンテージは表示しない
   - 全て「X/Y日達成」形式で表示
   - 例: 「85%」ではなく「6/7日」

3. **メモの可視化**
   - 自分・他人のメモが確認できる
   - カレンダーの日付タップで詳細表示

4. **シンプルなオンボーディング再表示**
   - 待機画面・詳細画面から (i) アイコンでオンボーディング再表示
   - 再表示時は確認画面（参加する/やめておく）を省略

---

## 2. User Stories

### US-001: チャレンジ一覧を見る (P0)

**Story:** ユーザーとして、現在参加可能なチャレンジ一覧を見たい。どのチャレンジに参加するか選ぶため。

**Acceptance Criteria:**
- [ ] トップページにチャレンジ一覧が表示される
- [ ] 各チャレンジに期間（1週間/2週間/1ヶ月）が表示される
- [ ] 各チャレンジに現在の参加者数が表示される
- [ ] 各チャレンジに参加者のアバター（最大5人）が表示される
- [ ] 開始日・終了日が表示される

**Effort:** 0.5日

---

### US-002: チャレンジに参加する (P0)

**Story:** ユーザーとして、チャレンジに参加したい。期限付きの目標を設定して仲間と一緒に頑張るため。

**Acceptance Criteria:**
- [ ] 「参加する」ボタンをタップできる
- [ ] 確認画面で「途中キャンセル不可」の注意が表示される
- [ ] オンボーディングでチャレンジの流れが説明される
- [ ] オンボーディングでチーム分け（5〜9人）の仕組みが説明される
- [ ] オンボーディングで通知設定の説明がある
- [ ] 「小さな一歩から」のガイダンスが表示される
- [ ] 目標カテゴリをボタンで選択できる（筋トレ/運動/学習/習慣/その他）
- [ ] カテゴリ内の具体的な目標をチップで選択できる
- [ ] 回数/時間をプリセットから選択できる（推奨値あり）
- [ ] 初回チャレンジは無料で参加できる
- [ ] 参加完了画面で目標と期間が確認できる
- [ ] 参加後、待機画面（開始前）またはチャレンジ詳細画面に遷移する

**Effort:** 2日（オンボーディングフロー追加）

---

### US-002.5: チャレンジ開始前の待機 (P0)

**Story:** ユーザーとして、チャレンジ開始前に準備をしたい。通知設定や辞退ができるようにするため。

**Acceptance Criteria:**
- [ ] チャレンジ開始前は待機画面が表示される
- [ ] 待機画面でチャレンジ開始日までのカウントダウンが表示される
- [ ] 待機画面で「辞退する」ボタンが表示される（開始前のみ）
- [ ] 辞退時は確認ダイアログが表示される
- [ ] 待機画面で通知時刻を設定できる（毎日のリマインダー）
- [ ] 待機画面で (i) アイコンからオンボーディングを再表示できる（確認画面なし）
- [ ] 待機画面で目標を変更できる（カテゴリ選択→詳細設定の2ステップ）
- [ ] チャレンジ開始後は待機画面から詳細画面に自動遷移

**Effort:** 1日

---

### US-002.6: 通知設定 (P1)

**Story:** ユーザーとして、毎日のリマインダー時刻を設定したい。忘れずに記録するため。

**Acceptance Criteria:**
- [ ] 待機画面で通知時刻を設定できる
- [ ] チャレンジ詳細画面でも通知時刻を変更できる
- [ ] 通知をオフにすることもできる（チャレンジは継続）
- [ ] デフォルトの通知時刻は 20:00
- [ ] 通知時刻は1時間単位で選択（6:00〜23:00）

**Effort:** 0.5日

---

### US-003: チャレンジ参加者の記録を見る (P0)

**Story:** ユーザーとして、同じチャレンジの参加者の記録を見たい。「一緒に頑張る仲間がいる」と感じ、自分の達成感を味わうため。

**Acceptance Criteria:**
- [ ] 自分の記録が常に上部に表示される（カレンダー形式）
- [ ] 自分の達成日数/全体日数が表示される（X/Y日）
- [ ] 自分のメモ（直近3件）が表示される
- [ ] カレンダーで日付をタップすると、その日の全参加者の記録が見られる
- [ ] 各参加者の達成状況、記録値、メモが確認できる
- [ ] カレンダーの色は自分の達成状況で決まる（達成=緑、未達成=グレー）

**Design Decision:**
カレンダーの色は「全員が達成したか」ではなく「自分が達成したか」で決まる。
他人が未達成でも自分が達成していれば緑色になり、優越感・自己肯定感が得られる。

**Effort:** 1日

---

### US-004: 日々の記録をつける (P0)

**Story:** ユーザーとして、毎日の達成を記録したい。チャレンジの進捗を可視化するため。

**Acceptance Criteria:**
- [ ] チャレンジ詳細画面から記録を入力できる
- [ ] +/- ボタンで値を増減できる
- [ ] メモを一緒に記録できる（任意）
- [ ] 目標達成時に視覚的なフィードバックがある
- [ ] 記録は日付ごとに保存される
- [ ] カレンダー形式で過去の記録を確認できる
- [ ] 過去の記録のメモも確認できる

**Effort:** 0.5日（既存機能を流用）

---

### US-005: チャレンジの進捗を確認する (P1)

**Story:** ユーザーとして、チャレンジ全体の進捗を確認したい。あと何日で完走できるか把握するため。

**Acceptance Criteria:**
- [ ] 残り日数が表示される
- [ ] 自分の達成日数/全体日数が表示される（X/Y日形式）
- [ ] プログレスバーで視覚化される

**Design Decision:**
パーセンテージ表記は使用しない。「X/Y日達成」の方が直感的で意味がある。

**Effort:** 0.5日

---

### US-006: チャレンジを完走する (P1)

**Story:** ユーザーとして、チャレンジを完走したら祝福されたい。達成感を味わうため。

**Acceptance Criteria:**
- [ ] チャレンジ終了日に完走判定が行われる
- [ ] 達成日数に応じた結果が表示される（完走/惜しい/リタイア）
- [ ] 結果画面で「X/Y日達成」が大きく表示される
- [ ] 仲間のランキングも「X/Y日」形式で表示される
- [ ] 完走時（80%以上）はお祝いアニメーションが表示される
- [ ] 次のチャレンジへの誘導が表示される

**Effort:** 1日

---

### US-007: 次のチャレンジに課金して参加する (P0)

**Story:** ユーザーとして、チャレンジ完走後に次のチャレンジに課金して参加したい。

**Acceptance Criteria:**
- [ ] チャレンジ終了後、次のチャレンジ選択画面が表示される
- [ ] 各期間の料金が表示される（1週間100円/2週間200円/1ヶ月300円）
- [ ] App Store 決済で支払いできる
- [ ] 支払い完了後、新しいチャレンジに参加できる
- [ ] 支払い履歴は RevenueCat で管理される

**Effort:** 1.5日

---

## 3. Functional Specifications

### F-001: チャレンジ一覧表示

**Description:** ホーム画面の「チャレンジ」タブでアクティブなチャレンジを表示

**UI:** `ux-design.md` Section 3.1 (C-001)

**Behavior:**
1. 「チャレンジ」タブをタップ
2. アクティブなチャレンジを Firestore から取得
3. チャレンジカードを表示（期間・参加者数・アバター）
4. 参加済みの場合は「参加中」バッジを表示

**Edge Cases:**
- チャレンジが0件: 「チャレンジ準備中」メッセージを表示
- ネットワークエラー: リトライボタンを表示

---

### F-002: チャレンジ参加（オンボーディングフロー）

**Description:** ステップ形式で目標を設定し、チャレンジに参加

**UI:** `ux-design.md` Section 3.2 (C-002)

**Behavior:**
1. 「参加する」ボタンをタップ → フルスクリーンフローへ遷移
2. **Step 1 確認**: 「途中キャンセル不可」の注意を表示、確認後次へ
3. **Step 2 オンボーディング**: チャレンジの流れを4ステップで説明
4. **Step 3 導入**: 「小さな一歩から」のガイダンス表示
5. **Step 4 カテゴリ選択**: 筋トレ/運動/学習/習慣/その他からタップ選択
6. **Step 5 詳細設定**: カテゴリ内の目標をチップで選択、回数をプリセットから選択
7. **Step 6 完了**: 参加完了画面で目標と期間を確認
8. 「さっそく記録する」でチャレンジ詳細画面に遷移

**Edge Cases:**
- 途中で戻る: 前のステップに戻れる
- 途中で閉じる: 確認ダイアログ「参加をやめますか？」
- 既に参加済み: チャレンジ詳細画面に遷移

---

### F-003: 参加者一覧表示

**Description:** チャレンジの参加者と今日の達成状況を表示

**UI:** `ux-design.md` Section 3.3 (C-003)

**Behavior:**
1. 参加者を joinedAt 順で取得（最大100人）
2. 各参加者の今日の記録を取得
3. 達成/未達成をステータスで表示
4. 自分の行はハイライト + sticky 表示

**Edge Cases:**
- 参加者が100人超: 「さらに表示」で追加読み込み
- 自分の記録なし: 「未達成」として表示

---

### F-004: 記録入力

**Description:** 今日の達成値を入力・保存

**UI:** `ux-design.md` Section 3.3 (C-003)

**Behavior:**
1. +/- ボタンで値を増減
2. 「記録する」ボタンで ChallengeRecord を upsert
3. 目標達成時は視覚フィードバック（ゴールドグロウ + トースト）
4. カレンダーに達成状況を反映

**Edge Cases:**
- 値が0未満: 0に固定
- 保存失敗: 自動リトライ（3回）

---

### F-005: 完走判定・結果表示

**Description:** チャレンジ終了時に結果を表示

**UI:** `ux-design.md` Section 3.4 (C-004)

**Behavior:**
1. チャレンジ終了日を過ぎたら結果画面を表示
2. 達成日数/全体日数を計算
3. 結果に応じた表示（判定は内部的に達成率を使用）:
   - 80%以上（例: 6/7日）: 🎉「COMPLETED」+ お祝いアニメーション
   - 50-79%（例: 5/7日）: 💪「惜しい！」
   - 50%未満: 励ましメッセージ
4. 結果画面では「X/Y日達成」を大きく表示（パーセンテージは表示しない）
5. 仲間のランキングも「X/Y日」形式で表示
6. 「次に挑戦する」ボタンで課金確認画面へ

**Edge Cases:**
- 期間中に1度も記録なし: 0/7日として処理

---

### F-006: 課金処理

**Description:** 次回チャレンジの課金

**UI:** `ux-design.md` Section 3.5 (C-005)

**Behavior:**
1. チャレンジ期間を選択（1週間/2週間/1ヶ月）
2. 料金を表示（100円/200円/300円）
3. Apple Pay ボタンで RevenueCat 経由で決済
4. 成功時: ChallengeParticipation.isPaid = true
5. 新しいチャレンジ詳細画面へ遷移

**Edge Cases:**
- 決済キャンセル: 課金確認画面に戻る
- 決済失敗: エラーモーダル + リトライオプション

---

## 4. Technical Specifications

### 4.1 Data Model

```typescript
// Challenge（チャレンジ）
interface Challenge {
  id: string
  type: '1week' | '2week' | '1month'
  startDate: Timestamp
  endDate: Timestamp
  status: 'upcoming' | 'active' | 'completed'
  participantCount: number
  createdAt: Timestamp
}

// Team（チーム）- チャレンジ開始時に自動生成
interface Team {
  id: string
  challengeId: string
  memberCount: number
  createdAt: Timestamp
}

// ChallengeParticipation（チャレンジ参加）
interface ChallengeParticipation {
  id: string
  challengeId: string
  teamId?: string  // チャレンジ開始時に割り当て
  userId: string
  goal: {
    name: string
    targetValue: number
    unit: string
    icon?: string
  }
  isPaid: boolean
  achievedDays: number  // 達成した日数（パーセンテージ不使用）
  notificationTime: string  // HH:MM形式（例: "20:00"）
  notificationEnabled: boolean
  joinedAt: Timestamp
}

// ChallengeRecord（チャレンジ記録）
interface ChallengeRecord {
  id: string
  participationId: string
  date: string  // YYYY-MM-DD
  value: number
  achieved: boolean  // 目標達成したか
  memo?: string  // 任意のメモ
  createdAt: Timestamp
}
```

### 4.1.1 チーム分けロジック

**チーム人数:** 最小5人・最大9人

**分配アルゴリズム:**
```typescript
const MIN_TEAM_SIZE = 5
const MAX_TEAM_SIZE = 9

function distributeToTeams(participantCount: number): number[] {
  if (participantCount < MIN_TEAM_SIZE) {
    return [participantCount]  // 最小人数未満は1チーム（開始時に人数不足警告）
  }

  if (participantCount <= MAX_TEAM_SIZE) {
    return [participantCount]  // 1チームで収まる
  }

  // 最適なチーム数を計算（各チームが5-9人になるように）
  const teamCount = Math.ceil(participantCount / MAX_TEAM_SIZE)
  const baseSize = Math.floor(participantCount / teamCount)
  const remainder = participantCount % teamCount

  return Array.from({ length: teamCount }, (_, i) =>
    baseSize + (i < remainder ? 1 : 0)
  )
}

// 例:
// 5人 → [5]（1チーム）
// 9人 → [9]（1チーム）
// 10人 → [5, 5]（2チーム）
// 14人 → [7, 7]（2チーム）
// 18人 → [9, 9]（2チーム）
// 19人 → [7, 6, 6]（3チーム）
```

**チーム割り当てタイミング:** チャレンジ開始日の0:00にCloud Functionsで自動実行

---

### 4.2 Firestore Structure

```
challenges/
  {challengeId}/
    type: string
    startDate: timestamp
    endDate: timestamp
    status: string
    participantCount: number
    createdAt: timestamp

challengeParticipations/
  {participationId}/
    challengeId: string
    userId: string
    teamId: string           # チーム分け後に設定
    goal: { name, targetValue, unit, icon }
    isPaid: boolean
    achievedDays: number     # 達成日数
    joinedAt: timestamp

challengeRecords/
  {recordId}/
    participationId: string
    date: string
    value: number
    achieved: boolean        # 目標達成したか
    memo: string             # 任意メモ (optional)
    createdAt: timestamp
```

### 4.3 Firestore Security Rules

```javascript
match /challenges/{challengeId} {
  allow read: if request.auth != null;
  allow write: if false; // Admin only via Console
}

match /challengeParticipations/{participationId} {
  allow read: if request.auth != null;
  allow create: if request.auth.uid == request.resource.data.userId;
  allow update: if request.auth.uid == resource.data.userId;
}

match /challengeRecords/{recordId} {
  allow read: if request.auth != null;
  allow write: if isOwnerOfParticipation(request.resource.data.participationId);
}
```

### 4.4 React Query Hooks

```typescript
// チャレンジ一覧取得
useChallenges(): UseQueryResult<Challenge[]>

// チャレンジ参加者取得
useParticipants(challengeId: string): UseQueryResult<ParticipantWithStatus[]>

// チャレンジ参加
useJoinChallenge(): UseMutationResult<void, Error, JoinChallengeInput>

// チャレンジ記録作成/更新
useUpsertChallengeRecord(): UseMutationResult<void, Error, UpsertRecordInput>

// 自分の参加情報取得
useMyParticipation(challengeId: string): UseQueryResult<ChallengeParticipation | null>
```

### 4.5 State Management

```typescript
// チャレンジ詳細画面の状態
interface ChallengeDetailState {
  challenge: Challenge
  participation: ChallengeParticipation
  participants: ParticipantWithStatus[]
  records: ChallengeRecord[]
  todayRecord: ChallengeRecord | null
  isRecording: boolean
}

// 記録入力の状態
interface RecordInputState {
  value: number
  isAchieved: boolean
  isSaving: boolean
}
```

---

## 5. Demo Page

**URL:** `/demo/time-boxed-challenge`
**Purpose:** PO 承認前の UX 確認

### Demo Features

- [ ] チャレンジ一覧（3種類のカード）
- [ ] 参加モーダル（目標設定フォーム）
- [ ] チャレンジ詳細（進捗・参加者一覧・記録入力）
- [ ] 結果画面（完走/惜しい/リタイア）
- [ ] 課金確認画面（プラン選択）
- [ ] 状態切り替えコントロール（Loading/Error）

### Demo Controls

```
[Scene Selector]
- Challenge List
- Join Modal
- Challenge Detail
- Result (Completed)
- Result (Almost)
- Pricing

[State Toggle]
- Loading
- Loaded
- Error
```

---

## 6. Implementation Tasks

### Phase 1: Data & Hooks (1.5日)

- [ ] Firestore コレクション作成（challenges, participations, records）
- [ ] TypeScript 型定義
- [ ] Firestore Security Rules
- [ ] useChallenges hook
- [ ] useParticipants hook
- [ ] useJoinChallenge hook
- [ ] useUpsertChallengeRecord hook

### Phase 2: UI Components (2日)

- [ ] ChallengeCard コンポーネント
- [ ] ChallengeJoinModal コンポーネント
- [ ] ParticipantCard コンポーネント
- [ ] ParticipantList コンポーネント
- [ ] ChallengeProgress コンポーネント
- [ ] ChallengeRecord コンポーネント
- [ ] ChallengeResult コンポーネント
- [ ] PricingCard コンポーネント

### Phase 3: Pages (2日)

- [ ] ホーム画面に「チャレンジ」タブ追加
- [ ] チャレンジ詳細ページ `/challenge/[id]`
- [ ] 結果ページ `/challenge/[id]/result`
- [ ] 課金確認ページ `/challenge/pricing`

### Phase 4: Integration (1.5日)

- [ ] RevenueCat 連携（Flutter Bridge 経由）
- [ ] お祝いアニメーション実装
- [ ] エラーハンドリング
- [ ] オフライン対応

### Phase 5: Testing (1日)

- [ ] Unit Tests（hooks, utils）
- [ ] Integration Tests（API）
- [ ] E2E Tests（主要フロー）

**Total Effort:** 8日

---

## 7. Open Questions

- [x] チャレンジの開始タイミング → 毎週月曜日に新規チャレンジ開始
- [ ] 参加者が少ない場合の対応 → 最低3人で開始 or ダミー表示
- [ ] 完走率の閾値 → 80%以上で「完走」、50-79%で「惜しい」
- [ ] チャレンジ作成方法 → 初期は Firestore Console から手動

---

## 8. Appendix

### References

- Requirements: `docs/features/time-boxed-challenge/requirements.md`
- UX Design: `docs/features/time-boxed-challenge/ux-design.md`
- Brainstorm: `docs/features/time-boxed-challenge/brainstorm.md`

### Competitive Research

| 競合 | 特徴 | BARM の差別化 |
|------|------|--------------|
| Cohorty | 5-10人コホート、静かなサポート | 男性特化、成功後課金 |
| みんチャレ | 5人1組、チャット機能 | チャットなし、シンプル |

### Pricing Model

| 期間 | 価格 | 日割り単価 |
|------|------|-----------|
| 1週間 | ¥100 | ¥14.3/日 |
| 2週間 | ¥200 | ¥14.3/日 |
| 1ヶ月 | ¥300 | ¥10/日 |

---

**Created:** 2026-01-03
**Updated:** 2026-01-04
**Status:** Implemented
**Demo:** `/demo/time-boxed-challenge`
