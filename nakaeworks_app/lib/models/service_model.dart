class ServiceModel {
  final String id;
  final String name;
  final String? description;
  final double price;
  final double? discount;
  final String? thumbnail;
  final String? category;
  final double? rating;
  final int? reviewCount;
  final String? providerId; // needed for booking API

  ServiceModel({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    this.discount,
    this.thumbnail,
    this.category,
    this.rating,
    this.reviewCount,
    this.providerId,
  });

  double get discountedPrice => price - (discount ?? 0);

  factory ServiceModel.fromJson(Map<String, dynamic> json) {
    return ServiceModel(
      id: json['id']?.toString() ?? json['Id']?.toString() ?? '',
      name: json['name'] ?? json['Name'] ?? '',
      description: json['description'] ?? json['Description'],
      price: _toDouble(json['price'] ?? json['Price']),
      discount: _toDouble(json['discount'] ?? json['Discount']),
      thumbnail: json['thumbnail'] ?? json['Thumbnail'],
      category: json['category'] ?? json['Category'] ?? json['categoryName'],
      rating: _toDouble(json['rating'] ?? json['Rating']),
      reviewCount: json['reviewCount'] ?? json['ReviewCount'],
      providerId: json['providerId']?.toString() ?? json['ProviderId']?.toString(),
    );
  }

  static double _toDouble(dynamic val) {
    if (val == null) return 0.0;
    return double.tryParse(val.toString()) ?? 0.0;
  }
}

class CategoryModel {
  final String id;
  final String name;
  final String? image;

  CategoryModel({required this.id, required this.name, this.image});

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id']?.toString() ?? json['Id']?.toString() ?? '',
      name: json['name'] ?? json['Name'] ?? '',
      // API returns 'icon' field with full URL
      image: json['icon'] ?? json['image'] ?? json['imageUrl'] ?? json['Image'],
    );
  }
}
