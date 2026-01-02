# BARM - Test Strategy

**バージョン:** 1.0
**作成日:** 2026-01-02
**ステータス:** Draft

---

## 1. Test Pyramid

```
                    ┌─────────┐
                    │   E2E   │  10%
                    │ (少量)  │  Integration Test
                    └────┬────┘
                         │
                ┌────────┴────────┐
                │    Widget Test   │  20%
                │  (コンポーネント) │
                └────────┬────────┘
                         │
        ┌────────────────┴────────────────┐
        │           Unit Test              │  70%
        │  (Domain Models, Repositories)   │
        └──────────────────────────────────┘
```

| Level | 比率 | 対象 | ツール |
|-------|------|------|--------|
| **Unit** | 70% | Domain models, Repositories, Utils | `flutter_test` |
| **Widget** | 20% | 個別Widget, 画面コンポーネント | `flutter_test` |
| **Integration** | 10% | ユーザーフロー全体 | `integration_test` |

---

## 2. Coverage Goals

| 対象 | 目標 |
|------|------|
| **Domain Models** | 100% |
| **Repositories** | 80% |
| **Controllers/Notifiers** | 80% |
| **Widgets (Critical)** | 60% |
| **全体** | 70% |

---

## 3. Test Priorities

### 3.1 Must Test (Critical Path)

PRDの機能要件に基づく最重要テスト。

| 機能 | テスト対象 | レベル |
|------|-----------|--------|
| **F-001: 認証** | Apple Sign In フロー | Integration |
| | AuthRepository.signInWithApple() | Unit |
| | ログイン状態の永続化 | Unit |
| **F-002: ミッション設定** | Mission model バリデーション | Unit |
| | MissionRepository CRUD | Unit |
| | ミッション作成画面 | Widget |
| **F-003: 記録トラッキング** | Record model | Unit |
| | RecordRepository.upsertTodayRecord() | Unit |
| | ストリーク計算ロジック | Unit |
| **F-004: グループ** | 招待コード生成・検証 | Unit |
| | GroupRepository 参加/退出 | Unit |
| **F-005: 仲間の記録閲覧** | グループメンバー記録取得 | Unit |
| **F-006: サブスクリプション** | 課金状態チェック | Unit |
| | ペイウォール表示ロジック | Widget |

### 3.2 Should Test (Important)

| カテゴリ | テスト対象 |
|----------|-----------|
| バリデーション | ニックネーム（1-20文字） |
| | ミッション名（1-50文字） |
| | 目標値（> 0） |
| エラーハンドリング | ネットワークエラー時のUI |
| | Firestore例外のラップ |
| 境界値 | ミッション最大10個制限 |
| | グループ最大5人制限 |
| | 1ユーザー1グループ制限 |

### 3.3 Won't Test (Low Priority)

| 対象 | 理由 |
|------|------|
| UIスタイリング | Visual Regression Test は費用対効果低 |
| アニメーション | 手動確認で十分 |
| Firebase SDK内部 | 外部ライブラリは信頼 |
| RevenueCat SDK内部 | 外部ライブラリは信頼 |

---

## 4. Mock Strategy

### 4.1 外部依存のモック方針

| 依存 | モック方法 | 理由 |
|------|-----------|------|
| **Firebase Auth** | `MockFirebaseAuth` (fake) | Unit Test で使用 |
| **Firestore** | `FakeFirebaseFirestore` (fake_cloud_firestore) | 実際のFirestore動作を模倣 |
| **RevenueCat** | Mock class | 課金状態を任意に設定 |
| **FCM** | Mock class | 通知は Integration Test でスキップ |

### 4.2 Repository のテスト

```dart
// 例: MissionRepository のテスト
void main() {
  late FakeFirebaseFirestore fakeFirestore;
  late MissionRepository repository;

  setUp(() {
    fakeFirestore = FakeFirebaseFirestore();
    repository = MissionRepository(fakeFirestore);
  });

  test('create() should add mission to Firestore', () async {
    // Arrange
    final input = MissionInput(
      name: '腕立て伏せ',
      type: MissionType.workout,
      targetValue: 50,
      unit: '回',
    );

    // Act
    final mission = await repository.create('user123', input);

    // Assert
    expect(mission.name, '腕立て伏せ');
    expect(mission.targetValue, 50);
  });
}
```

### 4.3 Controller のテスト

```dart
// Riverpod の ProviderContainer を使用
void main() {
  test('HomeController loads missions and today records', () async {
    // Arrange
    final container = ProviderContainer(
      overrides: [
        missionRepositoryProvider.overrideWithValue(MockMissionRepository()),
        recordRepositoryProvider.overrideWithValue(MockRecordRepository()),
      ],
    );

    // Act
    final controller = container.read(homeControllerProvider.notifier);
    await controller.build();

    // Assert
    final state = container.read(homeControllerProvider);
    expect(state.hasValue, true);
  });
}
```

---

## 5. Test Data Strategy

### 5.1 Fixtures

```
test/
├── fixtures/
│   ├── users.dart          # テストユーザーデータ
│   ├── missions.dart       # テストミッションデータ
│   ├── records.dart        # テスト記録データ
│   └── groups.dart         # テストグループデータ
```

**例: fixtures/users.dart**
```dart
class UserFixtures {
  static const testUser1 = {
    'displayName': 'テスト太郎',
    'groupId': null,
    'createdAt': '2026-01-01T00:00:00Z',
  };

  static const testUserWithGroup = {
    'displayName': 'グループ太郎',
    'groupId': 'group123',
    'createdAt': '2026-01-01T00:00:00Z',
  };
}
```

### 5.2 Factories (オプション)

ランダムデータが必要な場合は `faker_dart` を使用:

```dart
final faker = Faker();
final randomMission = Mission(
  id: faker.guid.guid(),
  name: faker.lorem.word(),
  targetValue: faker.randomGenerator.integer(100, min: 1),
  // ...
);
```

---

## 6. Test File Organization

```
test/
├── unit/
│   ├── domain/
│   │   ├── mission_test.dart
│   │   ├── record_test.dart
│   │   └── user_test.dart
│   ├── repositories/
│   │   ├── auth_repository_test.dart
│   │   ├── mission_repository_test.dart
│   │   ├── record_repository_test.dart
│   │   └── group_repository_test.dart
│   └── utils/
│       ├── date_utils_test.dart
│       └── validators_test.dart
│
├── widget/
│   ├── features/
│   │   ├── auth/
│   │   │   └── login_screen_test.dart
│   │   ├── mission/
│   │   │   ├── home_screen_test.dart
│   │   │   └── mission_card_test.dart
│   │   └── group/
│   │       └── group_screen_test.dart
│   └── shared/
│       └── primary_button_test.dart
│
├── integration/
│   └── app_test.dart
│
├── fixtures/
│   └── ...
│
└── mocks/
    ├── mock_auth_repository.dart
    ├── mock_mission_repository.dart
    └── ...
```

---

## 7. Test Naming Convention

```dart
// グループ化
group('MissionRepository', () {
  group('create()', () {
    test('should create mission with valid input', () {});
    test('should throw ValidationError when name is empty', () {});
    test('should throw ValidationError when targetValue is zero', () {});
  });

  group('delete()', () {
    test('should delete existing mission', () {});
    test('should throw NotFoundError when mission does not exist', () {});
  });
});
```

**命名パターン:** `should {期待する動作} when {条件}`

---

## 8. CI Integration

### 8.1 GitHub Actions (ci.yml)

```yaml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Setup Flutter
      uses: subosito/flutter-action@v2
      with:
        flutter-version: '3.24.0'
        channel: 'stable'
        cache: true

    - name: Install dependencies
      run: flutter pub get

    - name: Run tests with coverage
      run: flutter test --coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        files: coverage/lcov.info
        fail_ci_if_error: false
```

### 8.2 PR Requirements

| 条件 | 必須 |
|------|------|
| テスト全通過 | Yes |
| カバレッジ低下なし | Warning (ブロックしない) |
| Lint エラーなし | Yes |

---

## 9. TDD Workflow (Phase 7 以降)

```
1. 受け入れ基準を確認
   ↓
2. 失敗するテストを書く (Red)
   ↓
3. テストが通る最小限のコードを書く (Green)
   ↓
4. リファクタリング (Refactor)
   ↓
5. 次のテストへ
```

### 優先順位

1. **Domain Models** - 最初にテスト（依存なし）
2. **Repositories** - Fake Firestore でテスト
3. **Controllers** - Mock Repository でテスト
4. **Widgets** - 必要な画面のみ

---

## 10. Testing Dependencies

```yaml
# pubspec.yaml
dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

  # Testing
  mocktail: ^1.0.1              # Mock生成
  fake_cloud_firestore: ^2.4.1  # Firestore fake

  # Code generation
  build_runner: ^2.4.8
  riverpod_generator: ^2.3.9
  freezed: ^2.4.6
  json_serializable: ^6.7.1
```

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|----------|
| 1.0 | 2026-01-02 | 初版作成 |
