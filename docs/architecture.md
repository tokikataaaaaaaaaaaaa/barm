# BARM - Architecture Design

**バージョン:** 1.0
**作成日:** 2026-01-02
**ステータス:** Draft

---

## 1. System Architecture

### 1.1 Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         iOS App (Flutter)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │    Auth     │  │   Mission   │  │    Group    │              │
│  │   Feature   │  │   Feature   │  │   Feature   │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│  ┌──────┴────────────────┴────────────────┴──────┐              │
│  │              Riverpod Providers               │              │
│  │         (State Management Layer)              │              │
│  └──────────────────────┬────────────────────────┘              │
│                         │                                        │
│  ┌──────────────────────┴────────────────────────┐              │
│  │              Repository Layer                  │              │
│  │    (Firebase / RevenueCat Abstraction)        │              │
│  └──────────────────────┬────────────────────────┘              │
└─────────────────────────┼────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┬───────────────┐
          ▼               ▼               ▼               ▼
   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
   │  Firebase  │  │  Firebase  │  │  Firebase  │  │ RevenueCat │
   │    Auth    │  │ Firestore  │  │    FCM     │  │            │
   └────────────┘  └────────────┘  └────────────┘  └────────────┘
          │               │               │               │
          └───────────────┴───────────────┴───────────────┘
                          │
                    ┌─────┴─────┐
                    │ App Store │
                    │    IAP    │
                    └───────────┘
```

### 1.2 Tech Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| **UI** | Flutter 3.x | クロスプラットフォームUI |
| **State** | Riverpod | 状態管理、DI |
| **Routing** | go_router | 宣言的ルーティング |
| **Auth** | Firebase Auth | Apple Sign In |
| **Database** | Firestore | NoSQL ドキュメントDB |
| **Push** | FCM | プッシュ通知 |
| **Analytics** | Firebase Analytics | イベント計測 |
| **Crash** | Crashlytics | クラッシュレポート |
| **Payment** | RevenueCat | サブスク管理 |
| **Code Gen** | freezed, riverpod_generator | ボイラープレート削減 |

### 1.3 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        User Action                           │
│                    (Button Tap, Input)                       │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Widget                                │
│              (ConsumerWidget / HookWidget)                   │
│                  ref.read(provider)                          │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Notifier / Controller                     │
│              (AsyncNotifier / StateNotifier)                 │
│                 Business Logic Here                          │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Repository                             │
│           (FirestoreRepository, AuthRepository)              │
│              Firebase SDK Abstraction                        │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase / RevenueCat                     │
│                   (External Services)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Database Design (Firestore)

### 2.1 Schema Overview

```
firestore/
├── users/{userId}                    # ユーザー情報
├── groups/{groupId}                  # グループ情報
│   └── members/{userId}              # グループメンバー（サブコレクション）
├── missions/{missionId}              # ミッション定義
├── records/{recordId}                # 日々の記録
└── subscriptions/{userId}            # サブスク状態（RevenueCatから同期）
```

### 2.2 Collections

#### users
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| displayName | string | required, max 20 chars | ニックネーム |
| groupId | string | nullable | 所属グループID |
| fcmToken | string | nullable | FCMトークン |
| createdAt | timestamp | required | 作成日時 |
| updatedAt | timestamp | required | 更新日時 |

#### groups
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| name | string | required, max 30 chars | グループ名 |
| inviteCode | string | required, unique, 6 chars | 招待コード |
| ownerId | string | required | オーナーのuserId |
| memberCount | number | default 1, max 5 | メンバー数 |
| createdAt | timestamp | required | 作成日時 |

#### groups/{groupId}/members (subcollection)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| displayName | string | required | 参加時のニックネーム |
| joinedAt | timestamp | required | 参加日時 |

#### missions
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| userId | string | required | 作成者のuserId |
| type | string | required, enum: 'workout' \| 'study' | ミッション種別 |
| name | string | required, max 50 chars | ミッション名 |
| targetValue | number | required, > 0 | 目標値 |
| unit | string | required, max 10 chars | 単位（回、分、ページ等） |
| isActive | boolean | default true | アクティブ状態 |
| sortOrder | number | default 0 | 表示順 |
| createdAt | timestamp | required | 作成日時 |
| updatedAt | timestamp | required | 更新日時 |

#### records
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| userId | string | required | ユーザーID |
| missionId | string | required | ミッションID |
| value | number | required, >= 0 | 達成値 |
| date | string | required, YYYY-MM-DD | 記録日（ローカル日付） |
| createdAt | timestamp | required | 作成日時 |
| updatedAt | timestamp | required | 更新日時 |

**Composite Index:**
- `userId` + `missionId` + `date` (unique)
- `userId` + `date` (desc)

#### subscriptions
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| status | string | enum: 'active' \| 'cancelled' \| 'expired' \| 'none' | 課金状態 |
| productId | string | nullable | RevenueCat product ID |
| isGoalAchieved | boolean | default false | 月間目標達成フラグ |
| currentPeriodEnd | timestamp | nullable | 現在の課金期間終了日 |
| updatedAt | timestamp | required | 更新日時 |

### 2.3 Indexes

| Collection | Fields | Order | Purpose |
|------------|--------|-------|---------|
| missions | userId, isActive, sortOrder | ASC | ユーザーのアクティブミッション一覧 |
| records | userId, date | DESC | ユーザーの記録履歴 |
| records | userId, missionId, date | - | 特定ミッションの記録（unique） |
| groups | inviteCode | - | 招待コードでグループ検索 |

### 2.4 Data Denormalization

パフォーマンスのため、以下のデータを複製:

1. **groups.memberCount**: メンバー追加/削除時に更新（subcollection countを避ける）
2. **groups/members.displayName**: 毎回usersを参照しない（グループ画面表示用）

---

## 3. Security Rules

### 3.1 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isGroupMember(groupId) {
      return exists(/databases/$(database)/documents/groups/$(groupId)/members/$(request.auth.uid));
    }

    function hasActiveSubscription() {
      let sub = get(/databases/$(database)/documents/subscriptions/$(request.auth.uid));
      return sub != null && sub.data.status == 'active';
    }

    // Users
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if false; // ソフトデリートのみ
    }

    // Groups
    match /groups/{groupId} {
      allow read: if isAuthenticated() && isGroupMember(groupId);
      allow create: if isAuthenticated() && hasActiveSubscription();
      allow update: if isAuthenticated() && isGroupMember(groupId);
      allow delete: if isAuthenticated() &&
                      resource.data.ownerId == request.auth.uid;

      // Members subcollection
      match /members/{memberId} {
        allow read: if isAuthenticated() && isGroupMember(groupId);
        allow create: if isAuthenticated() &&
                        isOwner(memberId) &&
                        hasActiveSubscription();
        allow delete: if isAuthenticated() &&
                        (isOwner(memberId) ||
                         get(/databases/$(database)/documents/groups/$(groupId)).data.ownerId == request.auth.uid);
      }
    }

    // Missions
    match /missions/{missionId} {
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
      allow update: if isAuthenticated() && isOwner(resource.data.userId);
      allow delete: if isAuthenticated() && isOwner(resource.data.userId);
    }

    // Records
    match /records/{recordId} {
      // 自分の記録は読み書き可能
      allow read, write: if isAuthenticated() && isOwner(resource.data.userId);

      // グループメンバーの記録は読み取りのみ可能
      allow read: if isAuthenticated() &&
                    hasActiveSubscription() &&
                    isGroupMember(get(/databases/$(database)/documents/users/$(resource.data.userId)).data.groupId);
    }

    // Subscriptions (read only - RevenueCat webhook で更新)
    match /subscriptions/{userId} {
      allow read: if isOwner(userId);
      allow write: if false; // Cloud Functions経由のみ
    }
  }
}
```

---

## 4. Frontend Architecture

### 4.1 Directory Structure

```
lib/
├── main.dart                          # Entry point
├── app/
│   ├── app.dart                       # MaterialApp configuration
│   ├── router.dart                    # go_router configuration
│   └── providers.dart                 # Global providers
│
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   └── auth_repository.dart
│   │   ├── domain/
│   │   │   └── user.dart              # freezed model
│   │   ├── presentation/
│   │   │   ├── login_screen.dart
│   │   │   ├── nickname_screen.dart
│   │   │   └── auth_controller.dart
│   │   └── providers.dart
│   │
│   ├── mission/
│   │   ├── data/
│   │   │   ├── mission_repository.dart
│   │   │   └── record_repository.dart
│   │   ├── domain/
│   │   │   ├── mission.dart
│   │   │   └── record.dart
│   │   ├── presentation/
│   │   │   ├── home_screen.dart
│   │   │   ├── mission_create_screen.dart
│   │   │   ├── mission_detail_screen.dart
│   │   │   ├── home_controller.dart
│   │   │   └── widgets/
│   │   │       ├── mission_card.dart
│   │   │       └── record_input.dart
│   │   └── providers.dart
│   │
│   ├── group/
│   │   ├── data/
│   │   │   └── group_repository.dart
│   │   ├── domain/
│   │   │   ├── group.dart
│   │   │   └── member.dart
│   │   ├── presentation/
│   │   │   ├── group_screen.dart
│   │   │   ├── group_create_screen.dart
│   │   │   ├── group_join_screen.dart
│   │   │   ├── group_controller.dart
│   │   │   └── widgets/
│   │   │       └── member_card.dart
│   │   └── providers.dart
│   │
│   ├── subscription/
│   │   ├── data/
│   │   │   └── subscription_repository.dart
│   │   ├── domain/
│   │   │   └── subscription.dart
│   │   ├── presentation/
│   │   │   ├── paywall_screen.dart
│   │   │   └── subscription_controller.dart
│   │   └── providers.dart
│   │
│   └── settings/
│       └── presentation/
│           └── settings_screen.dart
│
├── shared/
│   ├── providers/
│   │   ├── firebase_providers.dart    # Firebase instances
│   │   └── user_provider.dart         # Current user state
│   ├── services/
│   │   └── analytics_service.dart
│   └── widgets/
│       ├── loading_overlay.dart
│       ├── error_dialog.dart
│       └── primary_button.dart
│
└── core/
    ├── constants/
    │   ├── app_constants.dart
    │   └── firestore_paths.dart
    ├── theme/
    │   ├── app_theme.dart
    │   └── app_colors.dart
    ├── utils/
    │   ├── date_utils.dart
    │   └── validators.dart
    └── extensions/
        └── context_extensions.dart
```

### 4.2 State Management Pattern

```dart
// Provider定義（riverpod_generator使用）
@riverpod
class HomeController extends _$HomeController {
  @override
  Future<HomeState> build() async {
    final user = await ref.watch(currentUserProvider.future);
    final missions = await ref.watch(activeMissionsProvider.future);
    final todayRecords = await ref.watch(todayRecordsProvider.future);

    return HomeState(
      user: user,
      missions: missions,
      todayRecords: todayRecords,
    );
  }

  Future<void> updateRecord(String missionId, int value) async {
    final repository = ref.read(recordRepositoryProvider);
    await repository.upsertTodayRecord(missionId, value);
    ref.invalidateSelf();
  }
}
```

### 4.3 Routing

```dart
final router = GoRouter(
  initialLocation: '/splash',
  redirect: (context, state) {
    final isLoggedIn = /* check auth state */;
    final isOnboarded = /* check nickname set */;

    if (!isLoggedIn) return '/login';
    if (!isOnboarded) return '/nickname';
    return null;
  },
  routes: [
    GoRoute(path: '/splash', builder: (_, __) => SplashScreen()),
    GoRoute(path: '/login', builder: (_, __) => LoginScreen()),
    GoRoute(path: '/nickname', builder: (_, __) => NicknameScreen()),

    ShellRoute(
      builder: (_, __, child) => MainShell(child: child),
      routes: [
        GoRoute(path: '/home', builder: (_, __) => HomeScreen()),
        GoRoute(path: '/group', builder: (_, __) => GroupScreen()),
        GoRoute(path: '/settings', builder: (_, __) => SettingsScreen()),
      ],
    ),

    GoRoute(path: '/mission/create', builder: (_, __) => MissionCreateScreen()),
    GoRoute(path: '/mission/:id', builder: (_, state) =>
      MissionDetailScreen(id: state.pathParameters['id']!)),
    GoRoute(path: '/group/create', builder: (_, __) => GroupCreateScreen()),
    GoRoute(path: '/group/join', builder: (_, __) => GroupJoinScreen()),
    GoRoute(path: '/paywall', builder: (_, __) => PaywallScreen()),
  ],
);
```

### 4.4 Screen Navigation Flow

```
┌─────────────┐
│   Splash    │
└──────┬──────┘
       │
       ▼
┌─────────────┐    Not logged in    ┌─────────────┐
│  Auth Check │ ───────────────────▶│    Login    │
└──────┬──────┘                     └──────┬──────┘
       │ Logged in                         │
       ▼                                   ▼
┌─────────────┐    No nickname      ┌─────────────┐
│ Nick Check  │ ───────────────────▶│  Nickname   │
└──────┬──────┘                     └──────┬──────┘
       │ Has nickname                      │
       ▼                                   ▼
┌─────────────────────────────────────────────────┐
│                  Main Shell                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │  Home   │  │  Group  │  │ Settings│         │
│  └────┬────┘  └────┬────┘  └────┬────┘         │
└───────┼────────────┼────────────┼───────────────┘
        │            │            │
        ▼            ▼            ▼
   Mission       Group         Paywall
   Create/       Create/       (Modal)
   Detail        Join
```

---

## 5. External Services Integration

### 5.1 Firebase

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **Auth** | ユーザー認証 | Apple Sign In のみ有効化 |
| **Firestore** | データ永続化 | asia-northeast1 (Tokyo) |
| **FCM** | プッシュ通知 | APNs Key 設定必要 |
| **Analytics** | イベント計測 | 自動収集 + カスタムイベント |
| **Crashlytics** | クラッシュ監視 | 自動設定 |

### 5.2 RevenueCat

| Item | Value |
|------|-------|
| Product ID (Standard) | `barm_monthly_300` |
| Product ID (Discount) | `barm_monthly_100` |
| Entitlement | `premium` |
| Webhook URL | Cloud Functions endpoint |

**Webhook Events:**
- `INITIAL_PURCHASE` → subscriptions/{userId} 作成
- `RENEWAL` → status 更新
- `CANCELLATION` → status = 'cancelled'
- `EXPIRATION` → status = 'expired'

---

## 6. Technical Constraints

### 6.1 Performance Requirements

| Metric | Target | How to Achieve |
|--------|--------|----------------|
| Cold Start | < 3s | Minimal main.dart, lazy loading |
| Screen Transition | < 500ms | Pre-fetch data, skeleton UI |
| List Scroll | 60fps | ListView.builder, const widgets |
| Firestore Latency | < 1s | Optimistic UI, local cache |

### 6.2 Offline Support

```
┌─────────────────────────────────────────────┐
│              Offline Strategy                │
├─────────────────────────────────────────────┤
│ Records: Firestore offline persistence      │
│ - 記録入力はオフラインでも保存              │
│ - 再接続時に自動同期                        │
│                                             │
│ Missions: Read from cache                   │
│ - 一度取得したらキャッシュ                  │
│                                             │
│ Group: Online only                          │
│ - 仲間の記録はリアルタイム性が重要          │
│ - オフライン時はキャッシュ表示 + 警告       │
└─────────────────────────────────────────────┘
```

### 6.3 Security Considerations

1. **API Keys**: Firebaseの設定はアプリに埋め込み（App Checkで保護）
2. **RevenueCat**: Webhook secret は Cloud Functions の環境変数
3. **User Data**: Firestore Security Rules で厳格に制御
4. **FCM Token**: ユーザードキュメントに保存、他ユーザーからはアクセス不可

---

## 7. Analytics Events

| Event | Parameters | Trigger |
|-------|------------|---------|
| `sign_up` | method | 新規登録完了 |
| `login` | method | ログイン |
| `mission_created` | type, name | ミッション作成 |
| `record_logged` | mission_type, value, is_goal_achieved | 記録入力 |
| `streak_achieved` | days | ストリーク達成（7, 14, 30日） |
| `group_created` | - | グループ作成 |
| `group_joined` | - | グループ参加 |
| `subscription_started` | product_id | 課金開始 |
| `subscription_cancelled` | - | 課金キャンセル |

---

## 8. Development Guidelines

### 8.1 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | snake_case | `mission_repository.dart` |
| Classes | PascalCase | `MissionRepository` |
| Variables | camelCase | `activeMissions` |
| Constants | SCREAMING_SNAKE | `MAX_MISSIONS` |
| Providers | camelCase + Provider | `missionRepositoryProvider` |

### 8.2 Error Handling

```dart
// Repository層でExceptionをthrow
class MissionRepository {
  Future<Mission> create(MissionInput input) async {
    try {
      final doc = await _firestore.collection('missions').add(input.toJson());
      return Mission.fromDoc(await doc.get());
    } on FirebaseException catch (e) {
      throw MissionException.fromFirebase(e);
    }
  }
}

// Controller層でcatchしてUIに反映
@riverpod
class MissionController extends _$MissionController {
  Future<void> create(MissionInput input) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final mission = await ref.read(missionRepositoryProvider).create(input);
      return mission;
    });
  }
}

// Widget層でエラー表示
Widget build(BuildContext context, WidgetRef ref) {
  final state = ref.watch(missionControllerProvider);
  return state.when(
    data: (mission) => MissionCard(mission),
    loading: () => const CircularProgressIndicator(),
    error: (e, _) => ErrorView(message: e.toString()),
  );
}
```

### 8.3 Testing Strategy

| Layer | Test Type | Coverage Target |
|-------|-----------|-----------------|
| Domain (Models) | Unit Test | 100% |
| Repository | Unit Test (with mock) | 80% |
| Controller | Unit Test (with mock) | 80% |
| Widget | Widget Test | Critical paths |
| E2E | Integration Test | Happy path |

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|----------|
| 1.0 | 2026-01-02 | 初版作成 |
