import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/api_client.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../models/user_model.dart';

class AuthRepositoryImpl implements AuthRepository {
  final ApiClient _apiClient;

  AuthRepositoryImpl(this._apiClient);

  @override
  Future<UserEntity?> login(String email, String password) async {
    final response = await _apiClient.request(
      endpoint: '/auth/login',
      method: 'POST',
      body: {'email': email, 'password': password},
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['token'] != null) {
        final userJson = data['user'];
        final userModel = UserModel.fromJson(userJson);

        if (userModel.role.toLowerCase() != 'admin') {
          throw Exception('Unauthorized: Access denied. Administrator privilege required.');
        }

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(AppConstants.tokenKey, data['token'] ?? '');
        await prefs.setString(AppConstants.userKey, jsonEncode(userJson));

        return userModel;
      } else {
        throw Exception(data['message'] ?? 'Login failed');
      }
    } else {
      final errData = jsonDecode(response.body);
      throw Exception(errData['message'] ?? 'Invalid credentials or server error');
    }
  }

  @override
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.tokenKey);
    await prefs.remove(AppConstants.userKey);
  }

  @override
  Future<UserEntity?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString(AppConstants.userKey);
    if (userStr != null && userStr.isNotEmpty) {
      return UserModel.fromJson(jsonDecode(userStr));
    }
    return null;
  }
}
