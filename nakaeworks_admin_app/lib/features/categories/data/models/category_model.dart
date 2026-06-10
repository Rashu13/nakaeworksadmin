class CategoryModel {
  final int id;
  final String name;
  final String slug;
  final String? icon;
  final bool status;
  final int servicesCount;
  final DateTime? createdAt;

  CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.icon,
    required this.status,
    required this.servicesCount,
    this.createdAt,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      icon: json['icon'],
      status: json['status'] == true || json['status'] == 1,
      servicesCount: json['servicesCount'] is int ? json['servicesCount'] : int.parse((json['servicesCount'] ?? 0).toString()),
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'icon': icon,
      'status': status,
      'servicesCount': servicesCount,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}
