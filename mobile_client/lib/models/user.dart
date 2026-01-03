class User {
  final String id;
  final String username;
  final String fullName;
  final String role;
  final String? department;

  User({
    required this.id,
    required this.username,
    required this.fullName,
    required this.role,
    this.department,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id']?.toString() ?? '',
      username: json['username']?.toString() ?? '',
      fullName: (json['fullName'] ?? json['full_name'] ?? '').toString(),
      role: json['role']?.toString() ?? '',
      department: (json['department']?['name'] ?? json['Department']?['name'])?.toString(),
    );
  }
}
