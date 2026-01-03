/// Test fixtures for Group data
class GroupFixtures {
  static const testGroup = {
    'name': 'テストグループ',
    'inviteCode': 'ABC123',
    'ownerId': 'user_test_001',
    'memberCount': 2,
    'createdAt': '2026-01-01T00:00:00Z',
  };

  static const fullGroup = {
    'name': '満員グループ',
    'inviteCode': 'XYZ789',
    'ownerId': 'user_test_002',
    'memberCount': 5,
    'createdAt': '2026-01-01T00:00:00Z',
  };

  static const testGroupId = 'group_test_001';
  static const testInviteCode = 'ABC123';
}
