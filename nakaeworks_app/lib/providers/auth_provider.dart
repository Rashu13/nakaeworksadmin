import 'dart:io';
import 'package:flutter/material.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  UserModel? _user;
  bool _isLoading = false;
  String? _error;
  bool _isLoggedIn = false;

  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isLoggedIn => _isLoggedIn;

  Future<void> checkLoginStatus() async {
    _isLoggedIn = await ApiService.isLoggedIn();
    if (_isLoggedIn) {
      _user = await ApiService.getStoredUser();
      syncFcmToken();
    }
    notifyListeners();
  }

  Future<void> syncFcmToken() async {
    if (!_isLoggedIn) return;
    try {
      final token = await FirebaseMessaging.instance.getToken();
      if (token != null) {
        await ApiService.updateFcmToken(token);
        debugPrint('FCM Token synced: $token');
      }
    } catch (e) {
      debugPrint('Error syncing FCM token: $e');
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _user = await ApiService.login(email, password);
      _isLoggedIn = true;
      syncFcmToken();
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await ApiService.logout();
    _user = null;
    _isLoggedIn = false;
    notifyListeners();
  }

  Future<bool> updateProfile({
    required String name,
    required String phone,
    String? email,
    File? image,
  }) async {
    if (_user == null) return false;
    _isLoading = true;
    notifyListeners();

    try {
      _user = await ApiService.updateProfile(
        name: name,
        phone: phone,
        email: email,
        image: image,
      );
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}
