import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';

enum AddressType { home, office, other }

class AddressModel {
  final String id;
  String label;
  String fullAddress;
  String? city;
  String? state;
  String? pincode;
  AddressType type;
  bool isDefault;

  AddressModel({
    required this.id,
    required this.label,
    required this.fullAddress,
    this.city,
    this.state,
    this.pincode,
    this.type = AddressType.home,
    this.isDefault = false,
  });

  String get typeLabel {
    switch (type) {
      case AddressType.home:
        return 'Home';
      case AddressType.office:
        return 'Office';
      case AddressType.other:
        return 'Other';
    }
  }

  IconData get typeIcon {
    switch (type) {
      case AddressType.home:
        return Icons.home_rounded;
      case AddressType.office:
        return Icons.work_rounded;
      case AddressType.other:
        return Icons.location_on_rounded;
    }
  }

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    final typeStr = (json['type'] ?? 'home').toString().toLowerCase();
    final addrType = typeStr == 'office'
        ? AddressType.office
        : typeStr == 'other'
            ? AddressType.other
            : AddressType.home;

    final parts = [
      json['addressLine1'] ?? json['AddressLine1'] ?? '',
      json['city'] ?? '',
      json['state'] ?? '',
    ].where((e) => e.toString().isNotEmpty).join(', ');

    return AddressModel(
      id: json['id']?.toString() ?? '',
      label: (json['type'] ?? 'Home').toString(),
      fullAddress: parts,
      city: json['city'],
      state: json['state'],
      pincode: json['pincode'],
      type: addrType,
      isDefault: json['isPrimary'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'addressLine1': fullAddress,
      'city': city ?? '',
      'state': state ?? '',
      'pincode': pincode ?? '',
      'country': 'India',
      'type': typeLabel.toLowerCase(),
      'isPrimary': isDefault,
    };
  }
}

class AddressesProvider extends ChangeNotifier {
  final List<AddressModel> _addresses = [];
  bool _isLoading = false;
  String? _error;

  List<AddressModel> get addresses => List.unmodifiable(_addresses);
  bool get isLoading => _isLoading;
  String? get error => _error;

  AddressModel? get defaultAddress =>
      _addresses.where((a) => a.isDefault).firstOrNull ??
      (_addresses.isNotEmpty ? _addresses.first : null);

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Map<String, String> _authHeaders(String token) => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };

  // ── FETCH all addresses from API ──
  Future<void> fetchAddresses() async {
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
        Uri.parse('${AppConstants.baseUrl}/api/addresses'),
        headers: _authHeaders(token),
      );
      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        _addresses
          ..clear()
          ..addAll(data.map((e) => AddressModel.fromJson(e)));
      } else {
        _error = 'Failed to load addresses';
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ── ADD address via API ──
  Future<bool> addAddress(AddressModel address) async {
    try {
      final token = await _getToken();
      if (token == null) return false;
      final response = await http.post(
        Uri.parse('${AppConstants.baseUrl}/api/addresses'),
        headers: _authHeaders(token),
        body: jsonEncode(address.toJson()),
      );
      if (response.statusCode == 201 || response.statusCode == 200) {
        await fetchAddresses();
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  // ── UPDATE address via API ──
  Future<bool> updateAddress(AddressModel updated) async {
    try {
      final token = await _getToken();
      if (token == null) return false;
      final response = await http.put(
        Uri.parse('${AppConstants.baseUrl}/api/addresses/${updated.id}'),
        headers: _authHeaders(token),
        body: jsonEncode(updated.toJson()),
      );
      if (response.statusCode == 200) {
        await fetchAddresses();
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  // ── DELETE address via API ──
  Future<bool> deleteAddress(String id) async {
    try {
      final token = await _getToken();
      if (token == null) return false;
      final response = await http.delete(
        Uri.parse('${AppConstants.baseUrl}/api/addresses/$id'),
        headers: _authHeaders(token),
      );
      if (response.statusCode == 200) {
        _addresses.removeWhere((a) => a.id == id);
        notifyListeners();
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }
}
