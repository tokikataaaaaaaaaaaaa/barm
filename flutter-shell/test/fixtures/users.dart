/// Test fixtures for User data
class UserFixtures {
  static const testUser1 = {
    'displayName': 'テスト太郎',
    'groupId': null,
    'fcmToken': null,
    'createdAt': '2026-01-01T00:00:00Z',
    'updatedAt': '2026-01-01T00:00:00Z',
  };

  static const testUserWithGroup = {
    'displayName': 'グループ太郎',
    'groupId': 'group123',
    'fcmToken': 'fcm_token_123',
    'createdAt': '2026-01-01T00:00:00Z',
    'updatedAt': '2026-01-01T00:00:00Z',
  };

  static const testUserId1 = 'user_test_001';
  static const testUserId2 = 'user_test_002';
}
