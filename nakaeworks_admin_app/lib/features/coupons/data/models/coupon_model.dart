class CouponModel {
  final int id;
  final String code;
  final String discountType; // 'percentage' or 'fixed'
  final double discountValue;
  final double minAmount;
  final double maxDiscount;
  final int usageLimit;
  final bool status;
  final DateTime? startDate;
  final DateTime? endDate;

  CouponModel({
    required this.id,
    required this.code,
    required this.discountType,
    required this.discountValue,
    required this.minAmount,
    required this.maxDiscount,
    required this.usageLimit,
    required this.status,
    this.startDate,
    this.endDate,
  });

  factory CouponModel.fromJson(Map<String, dynamic> json) {
    return CouponModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      code: json['code'] ?? '',
      discountType: json['discountType'] ?? 'percentage',
      discountValue: double.parse((json['discountValue'] ?? 0.0).toString()),
      minAmount: double.parse((json['minAmount'] ?? 0.0).toString()),
      maxDiscount: double.parse((json['maxDiscount'] ?? 0.0).toString()),
      usageLimit: json['usageLimit'] is int ? json['usageLimit'] : int.parse((json['usageLimit'] ?? 0).toString()),
      status: json['status'] == true || json['status'] == 1,
      startDate: json['startDate'] != null ? DateTime.parse(json['startDate']) : null,
      endDate: json['endDate'] != null ? DateTime.parse(json['endDate']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'discountType': discountType,
      'discountValue': discountValue,
      'minAmount': minAmount,
      'maxDiscount': maxDiscount,
      'usageLimit': usageLimit,
      'status': status,
      'startDate': startDate?.toIso8601String(),
      'endDate': endDate?.toIso8601String(),
    };
  }
}
