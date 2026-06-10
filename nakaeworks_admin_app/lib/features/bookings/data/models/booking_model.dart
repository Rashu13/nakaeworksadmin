class BookingModel {
  final int id;
  final String bookingNumber;
  final int consumerId;
  final String consumerName;
  final String consumerEmail;
  final String? consumerPhone;
  final int? providerId;
  final String? providerName;
  final int serviceId;
  final String serviceName;
  final String? serviceThumbnail;
  final int statusId;
  final String statusName;
  final String statusSlug;
  final double totalAmount;
  final String? paymentStatus;
  final String? paymentMethod;
  final DateTime dateTime;
  final DateTime createdAt;

  BookingModel({
    required this.id,
    required this.bookingNumber,
    required this.consumerId,
    required this.consumerName,
    required this.consumerEmail,
    this.consumerPhone,
    this.providerId,
    this.providerName,
    required this.serviceId,
    required this.serviceName,
    this.serviceThumbnail,
    required this.statusId,
    required this.statusName,
    required this.statusSlug,
    required this.totalAmount,
    this.paymentStatus,
    this.paymentMethod,
    required this.dateTime,
    required this.createdAt,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    return BookingModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      bookingNumber: json['bookingNumber'] ?? '',
      consumerId: json['consumer'] != null ? json['consumer']['id'] : (json['consumerId'] ?? 0),
      consumerName: json['consumer'] != null ? json['consumer']['name'] : 'Customer',
      consumerEmail: json['consumer'] != null ? json['consumer']['email'] : '',
      consumerPhone: json['consumer'] != null ? json['consumer']['phone'] : null,
      providerId: json['provider'] != null ? json['provider']['id'] : json['providerId'],
      providerName: json['provider'] != null ? json['provider']['name'] : null,
      serviceId: json['service'] != null ? json['service']['id'] : (json['serviceId'] ?? 0),
      serviceName: json['service'] != null ? json['service']['name'] : 'Service',
      serviceThumbnail: json['service'] != null ? json['service']['thumbnail'] : null,
      statusId: json['status'] != null ? json['status']['id'] : (json['bookingStatusId'] ?? 0),
      statusName: json['status'] != null ? json['status']['name'] : 'Pending',
      statusSlug: json['status'] != null ? json['status']['slug'] : 'pending',
      totalAmount: double.parse((json['totalAmount'] ?? 0.0).toString()),
      paymentStatus: json['paymentStatus'],
      paymentMethod: json['paymentMethod'],
      dateTime: json['dateTime'] != null ? DateTime.parse(json['dateTime']) : DateTime.now(),
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }
}
