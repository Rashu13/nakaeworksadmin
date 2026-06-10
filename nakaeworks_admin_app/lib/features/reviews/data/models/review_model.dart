class ReviewModel {
  final int id;
  final double rating;
  final String? comment;
  final String consumerName;
  final String providerName;
  final String serviceName;
  final DateTime createdAt;

  ReviewModel({
    required this.id,
    required this.rating,
    this.comment,
    required this.consumerName,
    required this.providerName,
    required this.serviceName,
    required this.createdAt,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      rating: double.parse((json['rating'] ?? 0.0).toString()),
      comment: json['comment'],
      consumerName: json['consumer'] != null ? json['consumer']['name'] : 'Customer',
      providerName: json['provider'] != null ? json['provider']['name'] : 'Provider',
      serviceName: json['service'] != null ? json['service']['name'] : 'Service',
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }
}
