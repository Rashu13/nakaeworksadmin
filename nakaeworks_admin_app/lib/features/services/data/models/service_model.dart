class ServiceModel {
  final int id;
  final String name;
  final String slug;
  final String? description;
  final double price;
  final double discount;
  final int duration;
  final String? thumbnail;
  final bool status;
  final bool isFeatured;
  final double rating;
  final int reviewCount;
  final int? categoryId;
  final String? categoryName;
  final int? providerId;
  final String? providerName;
  final DateTime? createdAt;

  ServiceModel({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    required this.price,
    required this.discount,
    required this.duration,
    this.thumbnail,
    required this.status,
    required this.isFeatured,
    required this.rating,
    required this.reviewCount,
    this.categoryId,
    this.categoryName,
    this.providerId,
    this.providerName,
    this.createdAt,
  });

  double get discountedPrice => price - (price * discount / 100);

  factory ServiceModel.fromJson(Map<String, dynamic> json) {
    return ServiceModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      description: json['description'],
      price: double.parse((json['price'] ?? 0.0).toString()),
      discount: double.parse((json['discount'] ?? 0.0).toString()),
      duration: json['duration'] is int ? json['duration'] : int.parse((json['duration'] ?? 60).toString()),
      thumbnail: json['thumbnail'],
      status: json['status'] == true || json['status'] == 1,
      isFeatured: json['isFeatured'] == true || json['isFeatured'] == 1,
      rating: double.parse((json['rating'] ?? 0.0).toString()),
      reviewCount: json['reviewCount'] is int ? json['reviewCount'] : int.parse((json['reviewCount'] ?? 0).toString()),
      categoryId: json['category'] != null ? json['category']['id'] : json['categoryId'],
      categoryName: json['category'] != null ? json['category']['name'] : null,
      providerId: json['provider'] != null ? json['provider']['id'] : json['providerId'],
      providerName: json['provider'] != null ? json['provider']['name'] : null,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'description': description,
      'price': price,
      'discount': discount,
      'duration': duration,
      'thumbnail': thumbnail,
      'status': status,
      'isFeatured': isFeatured,
      'rating': rating,
      'reviewCount': reviewCount,
      'categoryId': categoryId,
      'providerId': providerId,
    };
  }
}
