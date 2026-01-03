# BARM - Architecture Design

**Version:** 2.0
**Created:** 2026-01-02
**Updated:** 2026-01-03
**Status:** Draft

---

## 1. System Architecture

### 1.1 Overview

```
+------------------------------------------+
|         iOS App (Flutter Shell)          |
|  +------------------------------------+  |
|  |           WebView                  |  |
|  |    (InAppWebView / webview_flutter)|  |
|  |                                    |  |
|  |   +----------------------------+   |  |
|  |   |    Next.js Web App         |   |  |
|  |   |    (React + TailwindCSS)   |   |  |
|  |   +----------------------------+   |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |  Native Bridge (Payment/Push)     |  |
|  |  - RevenueCat (App Store IAP)     |  |
|  |  - FCM Token Retrieval            |  |
|  +------------------------------------+  |
+------------------------------------------+
              |
              v
+------------------------------------------+
|           Firebase (Web SDK)             |
|  Auth / Firestore / Analytics            |
+------------------------------------------+
```

### 1.2 Tech Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Web UI** | Next.js 14 (App Router) | Webアプリケーション |
| **Web Framework** | React 18 | UIライブラリ |
| **Web Styling** | TailwindCSS + shadcn/ui | スタイリング |
| **Web State** | Zustand or Jotai | クライアント状態管理 |
| **Mobile Shell** | Flutter 3.x | iOS アプリシェル |
| **WebView** | flutter_inappwebview | WebView実装 |
| **Auth** | Firebase Auth (Web SDK) | Apple Sign In |
| **Database** | Firestore (Web SDK) | NoSQL ドキュメントDB |
| **Push** | FCM (Native Bridge経由) | プッシュ通知 |
| **Analytics** | Firebase Analytics (Web SDK) | イベント計測 |
| **Payment** | RevenueCat (Native) | サブスク管理 |

### 1.3 Data Flow

```
+-------------------------------------------------------------+
|                       User Action                            |
|                    (Button Click, Input)                     |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                    Next.js Web App                           |
|              (React Components + Hooks)                      |
+------------------------------+------------------------------+
                               |
          +--------------------+--------------------+
          |                                         |
          v                                         v
+-----------------------+              +-----------------------+
|   Firebase Web SDK    |              |   Native Bridge       |
|   (Auth/Firestore/    |              |   (JavaScript Channel)|
|    Analytics)         |              +-----------+-----------+
+-----------+-----------+                          |
            |                                      v
            v                          +-----------------------+
+-----------------------+              |   Flutter Native      |
|   Firebase Backend    |              |   (RevenueCat/FCM)    |
+-----------------------+              +-----------+-----------+
                                                   |
                                                   v
                                       +-----------------------+
                                       |   App Store IAP       |
                                       +-----------------------+
```

### 1.4 Communication Flow

```
+-------------------+    JavaScript    +-------------------+
|    Next.js App    | <-------------> |   Flutter Shell   |
|    (WebView)      |     Channel     |   (Native Code)   |
+-------------------+                 +-------------------+
        |                                      |
        |  window.flutter_inappwebview         |
        |  .callHandler('methodName', args)    |
        |                                      |
        +------------------------------------->+
                                               |
                                               v
                                    +-------------------+
                                    |  RevenueCat SDK   |
                                    |  Firebase FCM     |
                                    +-------------------+
```

---

## 2. Database Design (Firestore)

### 2.1 Schema Overview

```
firestore/
+-- users/{userId}                    # User info
+-- groups/{groupId}                  # Group info
|   +-- members/{userId}              # Group members (subcollection)
+-- missions/{missionId}              # Mission definitions
+-- records/{recordId}                # Daily records
+-- subscriptions/{userId}            # Subscription status (synced from RevenueCat)
```

### 2.2 Collections

#### users
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| displayName | string | required, max 20 chars | Nickname |
| groupId | string | nullable | Group ID |
| fcmToken | string | nullable | FCM Token |
| createdAt | timestamp | required | Created at |
| updatedAt | timestamp | required | Updated at |

#### groups
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| name | string | required, max 30 chars | Group name |
| inviteCode | string | required, unique, 6 chars | Invite code |
| ownerId | string | required | Owner's userId |
| memberCount | number | default 1, max 5 | Member count |
| createdAt | timestamp | required | Created at |

#### groups/{groupId}/members (subcollection)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| displayName | string | required | Nickname at join time |
| joinedAt | timestamp | required | Joined at |

#### missions
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| userId | string | required | Creator's userId |
| type | string | required, enum: 'workout' \| 'study' | Mission type |
| name | string | required, max 50 chars | Mission name |
| targetValue | number | required, > 0 | Target value |
| unit | string | required, max 10 chars | Unit (reps, mins, pages, etc.) |
| isActive | boolean | default true | Active status |
| sortOrder | number | default 0 | Display order |
| createdAt | timestamp | required | Created at |
| updatedAt | timestamp | required | Updated at |

#### records
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| userId | string | required | User ID |
| missionId | string | required | Mission ID |
| value | number | required, >= 0 | Achieved value |
| date | string | required, YYYY-MM-DD | Record date (local date) |
| createdAt | timestamp | required | Created at |
| updatedAt | timestamp | required | Updated at |

**Composite Index:**
- `userId` + `missionId` + `date` (unique)
- `userId` + `date` (desc)

#### subscriptions
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| status | string | enum: 'active' \| 'cancelled' \| 'expired' \| 'none' | Subscription status |
| productId | string | nullable | RevenueCat product ID |
| isGoalAchieved | boolean | default false | Monthly goal achieved flag |
| currentPeriodEnd | timestamp | nullable | Current period end date |
| updatedAt | timestamp | required | Updated at |

### 2.3 Indexes

| Collection | Fields | Order | Purpose |
|------------|--------|-------|---------|
| missions | userId, isActive, sortOrder | ASC | User's active missions list |
| records | userId, date | DESC | User's record history |
| records | userId, missionId, date | - | Specific mission records (unique) |
| groups | inviteCode | - | Search group by invite code |

### 2.4 Data Denormalization

For performance, following data is duplicated:

1. **groups.memberCount**: Updated on member add/remove (avoid subcollection count)
2. **groups/members.displayName**: Avoid users lookup (for group screen display)

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
      allow delete: if false; // Soft delete only
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
      // Own records are readable and writable
      allow read, write: if isAuthenticated() && isOwner(resource.data.userId);

      // Group members' records are read-only
      allow read: if isAuthenticated() &&
                    hasActiveSubscription() &&
                    isGroupMember(get(/databases/$(database)/documents/users/$(resource.data.userId)).data.groupId);
    }

    // Subscriptions (read only - updated via RevenueCat webhook)
    match /subscriptions/{userId} {
      allow read: if isOwner(userId);
      allow write: if false; // Cloud Functions only
    }
  }
}
```

---

## 4. Frontend Architecture (Next.js)

### 4.1 Directory Structure

```
web/
+-- app/
|   +-- (auth)/
|   |   +-- login/
|   |   |   +-- page.tsx              # Login screen
|   |   +-- nickname/
|   |       +-- page.tsx              # Nickname setup screen
|   |
|   +-- (main)/
|   |   +-- layout.tsx                # Main shell with bottom nav
|   |   +-- home/
|   |   |   +-- page.tsx              # Home screen (missions)
|   |   +-- group/
|   |   |   +-- page.tsx              # Group screen
|   |   +-- settings/
|   |       +-- page.tsx              # Settings screen
|   |
|   +-- mission/
|   |   +-- create/
|   |   |   +-- page.tsx              # Mission create screen
|   |   +-- [id]/
|   |       +-- page.tsx              # Mission detail screen
|   |
|   +-- group/
|   |   +-- create/
|   |   |   +-- page.tsx              # Group create screen
|   |   +-- join/
|   |       +-- page.tsx              # Group join screen
|   |
|   +-- paywall/
|   |   +-- page.tsx                  # Paywall screen
|   |
|   +-- layout.tsx                    # Root layout
|   +-- page.tsx                      # Splash / redirect
|   +-- globals.css                   # Global styles
|   +-- providers.tsx                 # Context providers
|
+-- components/
|   +-- ui/                           # shadcn/ui components
|   |   +-- button.tsx
|   |   +-- card.tsx
|   |   +-- input.tsx
|   |   +-- dialog.tsx
|   |   +-- ...
|   |
|   +-- features/
|   |   +-- mission/
|   |   |   +-- mission-card.tsx
|   |   |   +-- record-input.tsx
|   |   +-- group/
|   |   |   +-- member-card.tsx
|   |   +-- auth/
|   |       +-- apple-sign-in-button.tsx
|   |
|   +-- shared/
|       +-- loading-spinner.tsx
|       +-- error-message.tsx
|       +-- bottom-nav.tsx
|
+-- lib/
|   +-- firebase/
|   |   +-- config.ts                 # Firebase initialization
|   |   +-- auth.ts                   # Auth functions
|   |   +-- firestore.ts              # Firestore functions
|   |
|   +-- hooks/
|   |   +-- use-auth.ts               # Auth hook
|   |   +-- use-missions.ts           # Missions hook
|   |   +-- use-records.ts            # Records hook
|   |   +-- use-group.ts              # Group hook
|   |   +-- use-subscription.ts       # Subscription hook
|   |   +-- use-native-bridge.ts      # Native bridge hook
|   |
|   +-- stores/
|   |   +-- auth-store.ts             # Zustand auth store
|   |   +-- mission-store.ts          # Zustand mission store
|   |
|   +-- types/
|   |   +-- user.ts
|   |   +-- mission.ts
|   |   +-- record.ts
|   |   +-- group.ts
|   |   +-- subscription.ts
|   |
|   +-- utils/
|       +-- date.ts
|       +-- validators.ts
|       +-- constants.ts
|
+-- public/
|   +-- icons/
|   +-- images/
|
+-- next.config.js
+-- tailwind.config.js
+-- tsconfig.json
+-- package.json
```

### 4.2 State Management (Zustand)

```typescript
// lib/stores/auth-store.ts
import { create } from 'zustand';
import { User } from '@/lib/types/user';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));
```

```typescript
// lib/stores/mission-store.ts
import { create } from 'zustand';
import { Mission, Record } from '@/lib/types';

interface MissionState {
  missions: Mission[];
  todayRecords: Map<string, Record>;
  setMissions: (missions: Mission[]) => void;
  updateRecord: (missionId: string, record: Record) => void;
}

export const useMissionStore = create<MissionState>((set) => ({
  missions: [],
  todayRecords: new Map(),
  setMissions: (missions) => set({ missions }),
  updateRecord: (missionId, record) =>
    set((state) => {
      const newRecords = new Map(state.todayRecords);
      newRecords.set(missionId, record);
      return { todayRecords: newRecords };
    }),
}));
```

### 4.3 Firebase Integration

```typescript
// lib/firebase/config.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics (client-side only)
export const initAnalytics = async () => {
  if (typeof window !== 'undefined' && await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};
```

### 4.4 Custom Hooks

```typescript
// lib/hooks/use-auth.ts
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getUserProfile } from '@/lib/firebase/firestore';

export function useAuth() {
  const { user, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return { user, isLoading };
}
```

### 4.5 Screen Navigation Flow

```
+-------------+
|   Splash    |
+------+------+
       |
       v
+-------------+    Not logged in    +-------------+
|  Auth Check | -----------------> |    Login    |
+------+------+                    +------+------+
       | Logged in                        |
       v                                  v
+-------------+    No nickname     +-------------+
| Nick Check  | -----------------> |  Nickname   |
+------+------+                    +------+------+
       | Has nickname                     |
       v                                  v
+-----------------------------------------------+
|                  Main Shell                    |
|  +---------+  +---------+  +---------+        |
|  |  Home   |  |  Group  |  | Settings|        |
|  +----+----+  +----+----+  +----+----+        |
+--------+------------+------------+-------------+
         |            |            |
         v            v            v
    Mission       Group         Paywall
    Create/       Create/       (Modal)
    Detail        Join
```

---

## 5. Native Bridge Design

### 5.1 Flutter Shell Structure

```
flutter_shell/
+-- lib/
|   +-- main.dart                     # Entry point
|   +-- app.dart                      # MaterialApp configuration
|   +-- webview_screen.dart           # WebView screen
|   +-- native_bridge.dart            # JavaScript handler definitions
|   +-- services/
|   |   +-- revenuecat_service.dart   # RevenueCat integration
|   |   +-- fcm_service.dart          # FCM integration
|   +-- models/
|       +-- purchase_result.dart
|       +-- subscription_info.dart
|
+-- ios/
|   +-- ...
+-- pubspec.yaml
```

### 5.2 WebView Configuration

```dart
// lib/webview_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'native_bridge.dart';

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  InAppWebViewController? _webViewController;
  final NativeBridge _nativeBridge = NativeBridge();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: InAppWebView(
          initialUrlRequest: URLRequest(
            url: WebUri('https://barm.app'), // Production URL
          ),
          initialSettings: InAppWebViewSettings(
            javaScriptEnabled: true,
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserGesture: false,
          ),
          onWebViewCreated: (controller) {
            _webViewController = controller;
            _nativeBridge.registerHandlers(controller);
          },
          onLoadStop: (controller, url) async {
            // Inject initial data if needed
            await _nativeBridge.injectFcmToken(controller);
          },
        ),
      ),
    );
  }
}
```

### 5.3 Native Bridge Implementation

```dart
// lib/native_bridge.dart
import 'dart:convert';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'services/revenuecat_service.dart';
import 'services/fcm_service.dart';

class NativeBridge {
  final RevenueCatService _revenueCat = RevenueCatService();
  final FcmService _fcm = FcmService();

  void registerHandlers(InAppWebViewController controller) {
    // Purchase handler
    controller.addJavaScriptHandler(
      handlerName: 'purchase',
      callback: (args) async {
        final productId = args[0] as String;
        try {
          final result = await _revenueCat.purchase(productId);
          return jsonEncode({
            'success': true,
            'data': result.toJson(),
          });
        } catch (e) {
          return jsonEncode({
            'success': false,
            'error': e.toString(),
          });
        }
      },
    );

    // Restore purchases handler
    controller.addJavaScriptHandler(
      handlerName: 'restorePurchases',
      callback: (args) async {
        try {
          final result = await _revenueCat.restorePurchases();
          return jsonEncode({
            'success': true,
            'data': result.toJson(),
          });
        } catch (e) {
          return jsonEncode({
            'success': false,
            'error': e.toString(),
          });
        }
      },
    );

    // Get subscription info handler
    controller.addJavaScriptHandler(
      handlerName: 'getSubscriptionInfo',
      callback: (args) async {
        try {
          final info = await _revenueCat.getSubscriptionInfo();
          return jsonEncode({
            'success': true,
            'data': info?.toJson(),
          });
        } catch (e) {
          return jsonEncode({
            'success': false,
            'error': e.toString(),
          });
        }
      },
    );

    // Get FCM token handler
    controller.addJavaScriptHandler(
      handlerName: 'getFcmToken',
      callback: (args) async {
        try {
          final token = await _fcm.getToken();
          return jsonEncode({
            'success': true,
            'data': token,
          });
        } catch (e) {
          return jsonEncode({
            'success': false,
            'error': e.toString(),
          });
        }
      },
    );
  }

  Future<void> injectFcmToken(InAppWebViewController controller) async {
    final token = await _fcm.getToken();
    if (token != null) {
      await controller.evaluateJavascript(
        source: "window.fcmToken = '$token';",
      );
    }
  }
}
```

### 5.4 Web-side Native Bridge Hook

```typescript
// lib/hooks/use-native-bridge.ts

interface NativeBridgeResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useNativeBridge() {
  const isNative = typeof window !== 'undefined' &&
    window.flutter_inappwebview !== undefined;

  const callNative = async <T>(
    method: string,
    args: unknown[] = []
  ): Promise<NativeBridgeResult<T>> => {
    if (!isNative) {
      return { success: false, error: 'Not running in native app' };
    }

    try {
      const result = await window.flutter_inappwebview.callHandler(method, ...args);
      return JSON.parse(result);
    } catch (e) {
      return { success: false, error: String(e) };
    }
  };

  const purchase = async (productId: string) => {
    return callNative<PurchaseResult>('purchase', [productId]);
  };

  const restorePurchases = async () => {
    return callNative<SubscriptionInfo>('restorePurchases');
  };

  const getSubscriptionInfo = async () => {
    return callNative<SubscriptionInfo>('getSubscriptionInfo');
  };

  const getFcmToken = async () => {
    // First check if token is already injected
    if (typeof window !== 'undefined' && window.fcmToken) {
      return { success: true, data: window.fcmToken };
    }
    return callNative<string>('getFcmToken');
  };

  return {
    isNative,
    purchase,
    restorePurchases,
    getSubscriptionInfo,
    getFcmToken,
  };
}

// Type declarations
declare global {
  interface Window {
    flutter_inappwebview?: {
      callHandler: (method: string, ...args: unknown[]) => Promise<string>;
    };
    fcmToken?: string;
  }
}

interface PurchaseResult {
  productId: string;
  transactionId: string;
  purchaseDate: string;
}

interface SubscriptionInfo {
  isActive: boolean;
  productId: string | null;
  expirationDate: string | null;
}
```

### 5.5 RevenueCat Service

```dart
// lib/services/revenuecat_service.dart
import 'package:purchases_flutter/purchases_flutter.dart';
import '../models/purchase_result.dart';
import '../models/subscription_info.dart';

class RevenueCatService {
  static const String _apiKey = 'YOUR_REVENUECAT_API_KEY';

  Future<void> init() async {
    await Purchases.setLogLevel(LogLevel.debug);
    await Purchases.configure(
      PurchasesConfiguration(_apiKey)
        ..appUserID = null, // Will be set after auth
    );
  }

  Future<void> setUserId(String userId) async {
    await Purchases.logIn(userId);
  }

  Future<PurchaseResult> purchase(String productId) async {
    final offerings = await Purchases.getOfferings();
    final package = offerings.current?.availablePackages
        .firstWhere((p) => p.storeProduct.identifier == productId);

    if (package == null) {
      throw Exception('Product not found');
    }

    final result = await Purchases.purchasePackage(package);
    final transaction = result.nonSubscriptionTransactions.isNotEmpty
        ? result.nonSubscriptionTransactions.last
        : null;

    return PurchaseResult(
      productId: productId,
      transactionId: transaction?.transactionIdentifier ?? '',
      purchaseDate: DateTime.now().toIso8601String(),
    );
  }

  Future<SubscriptionInfo> restorePurchases() async {
    final customerInfo = await Purchases.restorePurchases();
    return _mapCustomerInfo(customerInfo);
  }

  Future<SubscriptionInfo?> getSubscriptionInfo() async {
    final customerInfo = await Purchases.getCustomerInfo();
    return _mapCustomerInfo(customerInfo);
  }

  SubscriptionInfo _mapCustomerInfo(CustomerInfo info) {
    final isActive = info.entitlements.active.containsKey('premium');
    final activeEntitlement = info.entitlements.active['premium'];

    return SubscriptionInfo(
      isActive: isActive,
      productId: activeEntitlement?.productIdentifier,
      expirationDate: activeEntitlement?.expirationDate,
    );
  }
}
```

---

## 6. External Services Integration

### 6.1 Firebase

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **Auth** | User authentication | Apple Sign In only |
| **Firestore** | Data persistence | asia-northeast1 (Tokyo) |
| **FCM** | Push notifications | APNs Key required |
| **Analytics** | Event tracking | Auto collection + custom events |

### 6.2 RevenueCat

| Item | Value |
|------|-------|
| Product ID (Standard) | `barm_monthly_300` |
| Product ID (Discount) | `barm_monthly_100` |
| Entitlement | `premium` |
| Webhook URL | Cloud Functions endpoint |

**Webhook Events:**
- `INITIAL_PURCHASE` -> Create subscriptions/{userId}
- `RENEWAL` -> Update status
- `CANCELLATION` -> status = 'cancelled'
- `EXPIRATION` -> status = 'expired'

---

## 7. Technical Constraints

### 7.1 Performance Requirements

| Metric | Target | How to Achieve |
|--------|--------|----------------|
| Web Load | < 3s | Next.js static generation, CDN |
| FCP | < 1.5s | Minimal JS bundle, lazy loading |
| WebView Start | < 2s | Pre-warm WebView, splash screen |
| API Latency | < 1s | Firestore local cache |

### 7.2 Offline Support

```
+---------------------------------------------+
|              Offline Strategy                |
+---------------------------------------------+
| Records: Firestore offline persistence      |
| - Record input works offline                |
| - Auto sync on reconnect                    |
|                                             |
| Missions: Read from cache                   |
| - Cache after first fetch                   |
|                                             |
| Group: Online only                          |
| - Members' records need real-time           |
| - Show cached data + warning when offline   |
+---------------------------------------------+
```

### 7.3 Security Considerations

1. **Firebase Config**: Embedded in web app (protected by Firebase App Check)
2. **RevenueCat**: Webhook secret in Cloud Functions environment variables
3. **User Data**: Strict control via Firestore Security Rules
4. **FCM Token**: Stored in user document, inaccessible to other users
5. **WebView**: Only load trusted URLs (barm.app domain)

---

## 8. Analytics Events

| Event | Parameters | Trigger |
|-------|------------|---------|
| `sign_up` | method | Sign up complete |
| `login` | method | Login |
| `mission_created` | type, name | Mission created |
| `record_logged` | mission_type, value, is_goal_achieved | Record input |
| `streak_achieved` | days | Streak achieved (7, 14, 30 days) |
| `group_created` | - | Group created |
| `group_joined` | - | Group joined |
| `subscription_started` | product_id | Subscription started |
| `subscription_cancelled` | - | Subscription cancelled |

---

## 9. Development Guidelines

### 9.1 Web Development (Next.js)

#### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `mission-card.tsx` |
| Components | PascalCase | `MissionCard` |
| Hooks | camelCase with use prefix | `useMissions` |
| Stores | camelCase with Store suffix | `useAuthStore` |
| Types | PascalCase | `Mission`, `Record` |

#### Component Structure

```typescript
// components/features/mission/mission-card.tsx
'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Mission, Record } from '@/lib/types';
import { RecordInput } from './record-input';

interface MissionCardProps {
  mission: Mission;
  record?: Record;
  onRecordUpdate: (value: number) => void;
}

export function MissionCard({ mission, record, onRecordUpdate }: MissionCardProps) {
  return (
    <Card>
      <CardHeader>
        <h3>{mission.name}</h3>
        <span>{mission.targetValue} {mission.unit}</span>
      </CardHeader>
      <CardContent>
        <RecordInput
          currentValue={record?.value ?? 0}
          targetValue={mission.targetValue}
          onChange={onRecordUpdate}
        />
      </CardContent>
    </Card>
  );
}
```

### 9.2 Flutter Shell Development

#### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | snake_case | `native_bridge.dart` |
| Classes | PascalCase | `NativeBridge` |
| Variables | camelCase | `webViewController` |
| Constants | camelCase or SCREAMING_SNAKE | `apiKey`, `MAX_RETRIES` |

### 9.3 Error Handling

```typescript
// Web-side error handling
export async function handleApiError<T>(
  promise: Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await promise;
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof FirebaseError) {
      // Handle specific Firebase errors
      switch (error.code) {
        case 'permission-denied':
          toast.error('Permission denied');
          break;
        case 'unavailable':
          toast.error('Service unavailable. Please try again.');
          break;
        default:
          toast.error('An error occurred');
      }
    }

    return fallback;
  }
}
```

### 9.4 Testing Strategy

| Layer | Test Type | Coverage Target |
|-------|-----------|-----------------|
| Types/Utils | Unit Test | 100% |
| Hooks | Unit Test (with mocks) | 80% |
| Components | Component Test (Testing Library) | Critical paths |
| Native Bridge | Integration Test | All handlers |
| E2E | Cypress/Playwright | Happy path |

---

## Change History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-02 | Initial creation (Flutter native) |
| 2.0 | 2026-01-03 | WebView + Flutter Shell architecture |
