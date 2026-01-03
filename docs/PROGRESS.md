# BARM - Build Progress

## Current Phase

**Phase 7: Implementation** ✅ 完了（Web App）

**Next: Phase 5 - Flutter Shell** ⬜ 未着手

---

## 実装前TODO（外部サービス連携）

### 完了

- [x] **Firebase プロジェクト作成**
  - ✅ Firebase Console でプロジェクト作成
  - ✅ Web アプリ登録
  - ✅ SDK 設定完了（`web/src/lib/firebase/config.ts`）

- [x] **Vercel 連携**
  - ✅ プロジェクトデプロイ完了
  - ✅ 環境変数設定（Firebase config）
  - ✅ Production URL: https://web-pied-three-77.vercel.app

- [x] **Firebase Authentication 設定**
  - ⚠️ Email/Password を Firebase Console で有効化必要（開発用）
  - Apple Sign In は Phase 8 で対応

### Phase 5 で対応（Flutter Shell 実装時）

- [ ] **RevenueCat セットアップ**
  - アカウント作成
  - App Store Connect 連携
  - Offering / Entitlement 設定

- [ ] **App Store Connect**
  - サブスクリプショングループ作成
  - 月額300円/100円プラン設定
  - Sandbox テスト設定

### Phase 8（App Store 審査前）で対応

- [ ] **Apple Developer Program 登録**
  - 年額 $99 の課金
  - Sign In with Apple 有効化
  - Service ID 作成・認証設定

- [ ] **Firebase Auth で Apple 連携**
  - Firebase Console → Authentication → Apple 有効化
  - Service ID・Team ID 設定

- [ ] **CI に iOS ビルドジョブを追加**
  - `.github/workflows/ci.yml` の iOS ビルドを有効化
  - コード署名設定（Fastlane match 等）
  - TestFlight 自動デプロイ設定

---

## Phase Progress

| Phase | Name | Status | Completed |
|-------|------|--------|-----------|
| 1 | Brainstorming | ✅ Done | 2026-01-02 |
| 2 | Strategy | ✅ Done | 2026-01-03 |
| 3 | Requirements | ✅ Done | 2026-01-02 |
| 4 | Project Setup | ✅ Done | 2026-01-02 |
| 5 | Architecture | ✅ Done | 2026-01-03 |
| 6 | Test Strategy | ✅ Done | 2026-01-03 |
| 7 | Implement | ✅ Done (Web) | 2026-01-03 |
| 8 | Refactor | ⬜ Pending | - |
| 9 | Review | ⬜ Pending | - |
| 10 | Pull Request | ⬜ Pending | - |

---

## Artifacts

| Phase | Artifact | Location |
|-------|----------|----------|
| 1 | Brainstorming | `docs/brainstorming.md` |
| 2 | Strategy | `docs/strategy.md` |
| 3 | PRD | `docs/prd.md` |
| 3 | Tasks | `docs/tasks.md` |
| 5 | Architecture | `docs/architecture.md` |
| 6 | Test Strategy | `docs/test-strategy.md` |

---

## Next Steps

1. ~~Firebase プロジェクト作成~~ ✅ 完了
2. ~~Vercel デプロイ設定~~ ✅ 完了
3. ~~Firebase Console で Email/Password 認証を有効化~~ ✅ 完了（開発用）
4. ~~Phase 7: Web App 実装~~ ✅ 完了
5. **Phase 5: Flutter Shell + Native Bridge** ← 次のステップ
6. Phase 8: Refactor & Polish
7. 実装完了後 → Apple Developer 登録 → Apple Sign In 有効化

## Implementation Progress

### Phase 2: 認証 ✅ 完了
- [x] User データモデル・リポジトリ
- [x] 認証状態管理（Zustand）
- [x] ログイン画面（Email/Apple）
- [x] ニックネーム設定画面
- [x] ログアウト機能

### Phase 3: ミッション ✅ 完了
- [x] Mission データモデル・リポジトリ
- [x] Record データモデル・リポジトリ
- [x] ミッション作成画面
- [x] ホーム画面（ミッション一覧）
- [x] 記録入力機能（+/- ボタン）
- [x] 達成プログレス表示

### Phase 4: グループ ✅ 完了
- [x] Group データモデル・リポジトリ（TDD）
- [x] 招待コード生成（6文字英数字）
- [x] グループ作成・参加・離脱・削除
- [x] メンバー一覧・達成状況
- [x] use-group フック群

### Phase 4.5: ミッション詳細 ✅ 完了
- [x] ミッション詳細画面（カレンダー表示）
- [x] ミッション編集画面
- [x] ミッション削除機能
- [x] ストリーク計算ユーティリティ（TDD）
- [x] MissionCard のストリーク表示・タップ遷移

### Phase 4.6: 設定・App Store 対応 ✅ 完了
- [x] BottomNav コンポーネント
- [x] Footer コンポーネント
- [x] Settings ページ（プロフィール編集、ログアウト）
- [x] 利用規約ページ（/terms）
- [x] プライバシーポリシーページ（/privacy）
- [x] グループプレースホルダーページ

### Phase 4.7: デザインシステム更新 ✅ 完了
- [x] tailwind.config.ts 拡張（カラー、タイポグラフィ、アニメーション）
- [x] CSS 変数・ユーティリティ追加
- [x] Button コンポーネント改善（variant、isLoading）
- [x] Card コンポーネント改善
- [x] Input/Textarea コンポーネント改善
- [x] Dialog、Toast、Progress、Avatar、Badge コンポーネント追加

### Phase 5: Flutter Shell ⬜ 未着手
- [ ] WebView 設定
- [ ] Native Bridge
- [ ] RevenueCat 連携

---

## Architecture

**WebView + Flutter Shell 方式**（2026-01-03 移行）

```
Web App (Next.js) → Vercel デプロイ → 即時反映
Flutter Shell (WebView) → App Store 配布
```

---

## Notes

- 最終更新: 2026-01-03
- アーキテクチャ変更: Flutter Native → WebView + Flutter Shell
- 開発用認証: Firebase Console で Email/Password を有効化してテスト
- 本番認証: Apple Sign In（Phase 8 で有効化）

## テスト結果

- 全 46 テストがパス
  - streak.test.ts: 19 テスト
  - groups.test.ts: 23 テスト
  - native-bridge.test.ts: 4 テスト
- TypeScript コンパイル: エラーなし
- ビルド: 成功
