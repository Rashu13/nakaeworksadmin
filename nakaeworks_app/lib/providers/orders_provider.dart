import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/order_model.dart';
import '../services/api_service.dart';
import '../providers/cart_provider.dart';
import '../utils/constants.dart';

class OrdersProvider extends ChangeNotifier {
  final List<OrderModel> _orders = [];
  bool _isLoading = false;
  String? _error;

  List<OrderModel> get orders => List.unmodifiable(_orders);
  bool get isLoading => _isLoading;
  String? get error => _error;

  List<OrderModel> get activeOrders => _orders
      .where((o) =>
          o.status == OrderStatus.pending ||
          o.status == OrderStatus.confirmed ||
          o.status == OrderStatus.inProgress)
      .toList();

  List<OrderModel> get pastOrders => _orders
      .where((o) =>
          o.status == OrderStatus.completed ||
          o.status == OrderStatus.cancelled)
      .toList();

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Map<String, String> _authHeaders(String token) => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };

  // ── FETCH all bookings from API ──
  Future<void> fetchOrders() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final token = await _getToken();
      if (token == null) {
        _isLoading = false;
        notifyListeners();
        return;
      }
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/api/bookings'),
        headers: _authHeaders(token),
      );
      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        _orders
          ..clear()
          ..addAll(data.map((e) => OrderModel.fromJson(e)));
      } else {
        _error = 'Failed to load orders';
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ── PLACE ORDER via API ──
  Future<OrderModel> placeOrder({
    required List<CartItem> cartItems,
    required String customerName,
    required String phone,
    required String address,
    required DateTime serviceDate,
    required String timeSlot,
    required String addressId,
    required String providerId,
    String? couponCode,
  }) async {
    final token = await _getToken();
    if (token == null) throw Exception('Not logged in');

    // Build items list
    final items = cartItems
        .map((ci) => {
              'serviceId': int.tryParse(ci.service.id) ?? 0,
              'quantity': ci.quantity,
            })
        .toList();

    final body = jsonEncode({
      'items': items,
      'addressId': int.tryParse(addressId) ?? 0,
      'providerId': int.tryParse(providerId) ?? 0,
      'dateTime': serviceDate.toUtc().toIso8601String(),
      'description': timeSlot,
      'paymentMethod': 'cash',
      if (couponCode != null && couponCode.isNotEmpty) 'couponCode': couponCode,
    });

    final response = await http.post(
      Uri.parse('${AppConstants.baseUrl}/api/bookings'),
      headers: _authHeaders(token),
      body: body,
    );

    if (response.statusCode == 201 || response.statusCode == 200) {
      final json = jsonDecode(response.body);
      final order = OrderModel.fromJson(json is Map<String, dynamic> ? json : json);
      _orders.insert(0, order);
      notifyListeners();
      return order;
    }

    final err = jsonDecode(response.body);
    throw Exception(err['message'] ?? 'Booking failed (${response.statusCode})');
  }

  // ── CANCEL order via API ──
  Future<void> cancelOrder(String orderId) async {
    try {
      final token = await _getToken();
      if (token == null) return;
      final response = await http.put(
        Uri.parse('${AppConstants.baseUrl}/api/bookings/$orderId/cancel'),
        headers: _authHeaders(token),
      );
      if (response.statusCode == 200) {
        final order = _orders.where((o) => o.id == orderId).firstOrNull;
        if (order != null) {
          order.status = OrderStatus.cancelled;
          notifyListeners();
        }
      }
    } catch (_) {}
  }

  Future<Map<String, dynamic>> validateCoupon(String code, double orderValue) async {
    try {
      return await ApiService.validateCoupon(code, orderValue);
    } catch (e) {
      return {'isValid': false, 'message': 'Coupon validation failed: ${e.toString()}'};
    }
  }
}
