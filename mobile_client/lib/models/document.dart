class Document {
  final String id;
  final String title;
  final String description;
  final String status;
  final String type;
  final String filePath;
  final DateTime createdAt;
  final String creatorName;
  final String? departmentName;
  final List<String> tags;

  Document({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.type,
    required this.filePath,
    required this.createdAt,
    required this.creatorName,
    this.departmentName,
    required this.tags,
  });

  factory Document.fromJson(Map<String, dynamic> json) {
    return Document(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      type: json['type']?.toString() ?? '',
      filePath: (json['filePath'] ?? json['file_path'] ?? '').toString(),
      createdAt: DateTime.parse(json['createdAt'] ?? json['created_at'] ?? DateTime.now().toIso8601String()),
      creatorName: (json['creator']?['fullName'] ?? json['creator']?['full_name'] ?? 'Unknown').toString(),
      departmentName: json['department']?['name']?.toString(),
      tags: (json['tags'] as List? ?? []).map((t) => t['name']?.toString() ?? '').toList(),
    );
  }
}
