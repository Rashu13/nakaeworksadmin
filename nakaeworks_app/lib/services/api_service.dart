import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';
import '../models/user_model.dart';
import '../models/service_model.dart';

class ApiService {
  static String get baseUrl => AppConstants.apiUrl;

  // Get auth token from storage
  static Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // Build headers with optional auth
  static Future<Map<String, String>> _headers({bool auth = true}) async {
    final headers = {'Content-Type': 'application/json'};
    if (auth) {
      final token = await _getToken();
      if (token != null) headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  // Normalize .NET response: unwrap Success/Data envelope
  static dynamic _unwrap(dynamic data) {
    if (data is Map) {
      if (data.containsKey('success') || data.containsKey('Success')) {
        return data['data'] ?? data['Data'] ?? data;
      }
    }
    return data;
  }

  // -- AUTH --
  static Future<UserModel> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: await _headers(auth: false),
        body: jsonEncode({'email': email, 'password': password}),
      );
      
      if (response.body.isEmpty) {
        throw Exception('Server se koi response nahi aaya. Please try again.');
      }

      if (response.statusCode == 200) {
        final json = _unwrap(jsonDecode(response.body));
        final user = UserModel.fromJson(json['user'] ?? json);
        // Save token
        final prefs = await SharedPreferences.getInstance();
        final token = json['token'] ?? json['Token'] ?? '';
        await prefs.setString('token', token);
        await prefs.setString('user', jsonEncode((json['user'] ?? json)));
        return user;
      }
      final err = jsonDecode(response.body);
      throw Exception(err['message'] ?? err['error'] ?? 'Login failed');
    } on FormatException {
      throw Exception('Server se invalid response aaya. Server down ho sakta hai.');
    } on http.ClientException {
      throw Exception('Server se connect nahi ho paa raha. Internet check karein.');
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('Login failed: $e');
    }
  }

  static Future<void> sendOtp(String phone) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/send-otp'),
      headers: await _headers(auth: false),
      body: jsonEncode({'phone': phone}),
    );
    if (response.statusCode != 200) {
      final err = jsonDecode(response.body);
      throw Exception(err['message'] ?? 'Failed to send OTP');
    }
  }

  static Future<UserModel> verifyOtp(String phone, String otp) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/verify-otp'),
      headers: await _headers(auth: false),
      body: jsonEncode({'phone': phone, 'otp': otp}),
    );
    if (response.statusCode == 200) {
      final json = _unwrap(jsonDecode(response.body));
      final user = UserModel.fromJson(json['user'] ?? json);
      final prefs = await SharedPreferences.getInstance();
      final token = json['token'] ?? json['Token'] ?? '';
      await prefs.setString('token', token);
      await prefs.setString('user', jsonEncode(json['user'] ?? json));
      return user;
    }
    final err = jsonDecode(response.body);
    throw Exception(err['message'] ?? 'Invalid OTP');
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
  }

  static Future<UserModel?> getStoredUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user');
    if (userData != null) {
      return UserModel.fromJson(jsonDecode(userData));
    }
    return null;
  }

  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token') != null;
  }

  // -- SERVICES --
  static Future<List<ServiceModel>> getServices({int? limit}) async {
    var url = '$baseUrl/services';
    if (limit != null) url += '?limit=$limit';
    final response = await http.get(
      Uri.parse(url),
      headers: await _headers(),
    );
    if (response.statusCode == 200) {
      final raw = _unwrap(jsonDecode(response.body));
      final List list = raw is List ? raw : (raw['data'] ?? raw['items'] ?? []);
      return list.map((e) => ServiceModel.fromJson(e)).toList();
    }
    throw Exception('Failed to load services');
  }

  static Future<List<CategoryModel>> getCategories() async {
    final response = await http.get(
      Uri.parse('$baseUrl/services/categories'),
      headers: await _headers(),
    );
    if (response.statusCode == 200) {
      final raw = _unwrap(jsonDecode(response.body));
      final List list = raw is List ? raw : (raw['data'] ?? raw['items'] ?? []);
      return list.map((e) => CategoryModel.fromJson(e)).toList();
    }
    throw Exception('Failed to load categories');
  }
  static Future<UserModel> updateProfile({
    required String name,
    required String phone,
    String? email,
    File? image,
  }) async {
    final token = await _getToken();
    var request = http.MultipartRequest('POST', Uri.parse('$baseUrl/users/update-profile'));
    
    request.headers['Authorization'] = 'Bearer $token';
    request.fields['name'] = name;
    request.fields['phone'] = phone;
    if (email != null) request.fields['email'] = email;
    
    if (image != null) {
      request.files.add(await http.MultipartFile.fromPath('picture', image.path));
    }
    
    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    
    if (response.statusCode == 200) {
      final json = _unwrap(jsonDecode(response.body));
      final user = UserModel.fromJson(json['user'] ?? json);
      
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user', jsonEncode(user.toJson()));
      return user;
    }
    
    final err = jsonDecode(response.body);
    throw Exception(err['message'] ?? 'Failed to update profile');
  }

  // -- COUPONS --
  static Future<Map<String, dynamic>> validateCoupon(String code, double orderValue) async {
    final response = await http.post(
      Uri.parse('${AppConstants.baseUrl}/api/coupons/validate'),
      headers: await _headers(),
      body: jsonEncode({'code': code, 'orderValue': orderValue}),
    );
    return jsonDecode(response.body);
  }
  // -- NOTIFICATIONS --
  static Future<void> updateFcmToken(String token) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/update-fcm-token'),
      headers: await _headers(),
      body: jsonEncode({'token': token}),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to update FCM token');
    }
  }
}
