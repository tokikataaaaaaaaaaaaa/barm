# BARM - Build Progress

## Current Phase

**Phase 7: Implementation** ⏳ 準備中

---

## 実装前TODO（外部サービス連携）

### 今すぐ必要

- [ ] **Firebase プロジェクト作成**
  - Firebase Console でプロジェクト作成
  - Web アプリ登録
  - iOS アプリ登録（Bundle ID 設定）
  - Apple Sign In 有効化（Firebase Auth）

- [ ] **Apple Developer 設定**
  - Sign In with Apple 有効化
  - Service ID 作成
  - 認証設定（Return URL等）

### Phase 5 前までに対応

- [ ] **Vercel 連携**
  - GitHub リポジトリ連携
  - 環境変数設定
  - デプロイ確認

### Phase 5 で対応

- [ ] **RevenueCat セットアップ**
  - アカウント作成
  - App Store Connect 連携
  - Offering / Entitlement 設定

- [ ] **App Store Connect**
  - サブスクリプショングループ作成
  - 月額300円/100円プラン設定
  - Sandbox テスト設定

### Phase 8（App Store 審査前）で対応

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
| 7 | Implement | ⏳ Next | - |
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

1. Firebase プロジェクト作成（15分）
2. Apple Developer で Sign In with Apple 有効化
3. `/build-phase7-implement barm` を実行
4. TDD サイクルで実装を進める

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
