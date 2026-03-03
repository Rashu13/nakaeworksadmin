import 'service_model.dart';

enum OrderStatus { pending, confirmed, inProgress, completed, cancelled }

class OrderItem {
  final String serviceId;
  final String serviceName;
  final int quantity;
  final double price;
  final double total;
  final ServiceModel? service;
  final String? providerName;
  final String? providerPhone;

  OrderItem({
    required this.serviceId,
    required this.serviceName,
    required this.quantity,
    required this.price,
    required this.total,
    this.service,
    this.providerName,
    this.providerPhone,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      serviceId: json['serviceId']?.toString() ?? '',
      serviceName: json['serviceName'] ?? 'Service',
      quantity: json['quantity'] ?? 1,
      price: double.tryParse(json['price']?.toString() ?? '0') ?? 0,
      total: double.tryParse(json['total']?.toString() ?? '0') ?? 0,
      providerName: json['providerName'],
      providerPhone: json['providerPhone'],
    );
  }
}

class OrderModel {
  final String id;
  final String bookingNumber;
  final List<OrderItem> items;
  final String customerName;
  final String phone;
  final String address;
  final DateTime serviceDate;
  final String timeSlot;
  final double totalAmount;
  final DateTime placedAt;
  OrderStatus status;
  final String? assignedProviderName;
  final String? assignedProviderPhone;
  final String? assignedProviderPicture;

  OrderModel({
    required this.id,
    required this.bookingNumber,
    required this.items,
    required this.customerName,
    required this.phone,
    required this.address,
    required this.serviceDate,
    required this.timeSlot,
    required this.totalAmount,
    required this.placedAt,
    this.status = OrderStatus.pending,
    this.assignedProviderName,
    this.assignedProviderPhone,
    this.assignedProviderPicture,
  });

  double get itemsSubtotal => items.fold(0.0, (sum, item) => sum + item.total);
  double get taxAndFees => totalAmount - itemsSubtotal;

  String get statusLabel {
    switch (status) {
      case OrderStatus.pending:
        return 'Pending';
      case OrderStatus.confirmed:
        return 'Confirmed';
      case OrderStatus.inProgress:
        return 'In Progress';
      case OrderStatus.completed:
        return 'Completed';
      case OrderStatus.cancelled:
        return 'Cancelled';
    }
  }

  static OrderStatus _parseStatus(String? s) {
    switch ((s ?? '').toLowerCase()) {
      case 'confirmed':
      case 'accepted':
        return OrderStatus.confirmed;
      case 'in progress':
      case 'inprogress':
        return OrderStatus.inProgress;
      case 'completed':
        return OrderStatus.completed;
      case 'cancelled':
        return OrderStatus.cancelled;
      default:
        return OrderStatus.pending;
    }
  }

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    final items = <OrderItem>[];
    if (json['items'] != null && json['items'] is List) {
      for (final item in json['items']) {
        items.add(OrderItem.fromJson(item as Map<String, dynamic>));
      }
    } else {
      // Single-item booking fallback
      items.add(OrderItem(
        serviceId: json['serviceId']?.toString() ?? '',
        serviceName: json['serviceName'] ?? '',
        quantity: 1,
        price: double.tryParse(json['servicePrice']?.toString() ?? '0') ?? 0,
        total: double.tryParse(json['totalAmount']?.toString() ?? '0') ?? 0,
      ));
    }

    final addr = json['address'];
    String addressStr = '';
    if (addr is Map) {
      final parts = [addr['addressLine1'], addr['city'], addr['state']]
          .where((e) => e != null && e.toString().isNotEmpty)
          .join(', ');
      addressStr = parts;
    } else if (addr is String) {
      addressStr = addr;
    }

    return OrderModel(
      id: json['id']?.toString() ?? '',
      bookingNumber: json['bookingNumber'] ?? '#',
      items: items,
      customerName: json['consumerName'] ?? '',
      phone: '',
      address: addressStr,
      serviceDate: DateTime.tryParse(json['dateTime'] ?? '') ?? DateTime.now(),
      timeSlot: json['description'] ?? '',
      totalAmount:
          double.tryParse(json['totalAmount']?.toString() ?? '0') ?? 0,
      placedAt:
          DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      status: _parseStatus(json['status']),
      assignedProviderName: json['providerName'] ?? json['assignedProviderName'],
      assignedProviderPhone: json['providerPhone'] ?? json['assignedProviderPhone'],
      assignedProviderPicture: json['providerPicture'] ?? json['assignedProviderPicture'],
    );
  }
}
