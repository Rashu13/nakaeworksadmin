import 'package:flutter/material.dart';
import '../models/service_model.dart';
import '../services/api_service.dart';

class CartItem {
  final ServiceModel service;
  int quantity;

  CartItem({required this.service, this.quantity = 1});

  double get total => service.discountedPrice * quantity;
}

class CartProvider extends ChangeNotifier {
  final List<CartItem> _items = [];
  String? _appliedCoupon;
  double _discountAmount = 0.0;
  bool _isValidating = false;

  List<CartItem> get items => _items;
  String? get appliedCoupon => _appliedCoupon;
  double get discountAmount => _discountAmount;
  bool get isValidating => _isValidating;

  int get totalItems => _items.fold(0, (sum, item) => sum + item.quantity);
  double get subtotal => _items.fold(0.0, (sum, item) => sum + item.total);
  double get totalAmount => subtotal - _discountAmount;

  Future<Map<String, dynamic>> applyCoupon(String code) async {
    _isValidating = true;
    notifyListeners();
    try {
      final result = await ApiService.validateCoupon(code, subtotal);
      if (result['isValid'] == true) {
        _appliedCoupon = code;
        _discountAmount = double.tryParse(result['discountAmount'].toString()) ?? 0.0;
      }
      _isValidating = false;
      notifyListeners();
      return result;
    } catch (e) {
      _isValidating = false;
      notifyListeners();
      return {'isValid': false, 'message': 'Coupon validation failed'};
    }
  }

  void removeCoupon() {
    _appliedCoupon = null;
    _discountAmount = 0.0;
    notifyListeners();
  }

  void addToCart(ServiceModel service) {
    final existing = _items.where((e) => e.service.id == service.id).firstOrNull;
    if (existing != null) {
      existing.quantity++;
    } else {
      _items.add(CartItem(service: service));
    }
    notifyListeners();
  }

  void removeFromCart(String serviceId) {
    _items.removeWhere((e) => e.service.id == serviceId);
    notifyListeners();
  }

  void updateQuantity(String serviceId, int delta) {
    final item = _items.where((e) => e.service.id == serviceId).firstOrNull;
    if (item != null) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        _items.remove(item);
      }
    }
    notifyListeners();
  }

  void clear() {
    _items.clear();
    _appliedCoupon = null;
    _discountAmount = 0.0;
    notifyListeners();
  }
}
