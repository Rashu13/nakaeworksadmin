import 'dart:convert';
import 'dart:io';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';
import '../utils/image_helper.dart';

class ApiClient extends GetxService {
  final http.Client _client = http.Client();

  Future<Map<String, String>> _getHeaders(String method) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(AppConstants.tokenKey);

    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }

  String _getRequestMethod(String method) {
    return method.toUpperCase();
  }

  Future<http.Response> request({
    required String endpoint,
    required String method,
    dynamic body,
  }) async {
    final uri = Uri.parse('${AppConstants.apiUrl}$endpoint');
    final headers = await _getHeaders(method);
    final reqMethod = _getRequestMethod(method);
    
    final encodedBody = body != null && body is! String 
        ? jsonEncode(body) 
        : body;

    http.Response response;
    
    try {
      switch (reqMethod) {
        case 'POST':
          response = await _client
              .post(uri, headers: headers, body: encodedBody)
              .timeout(const Duration(seconds: 10));
          break;
        case 'PUT':
          response = await _client
              .put(uri, headers: headers, body: encodedBody)
              .timeout(const Duration(seconds: 10));
          break;
        case 'DELETE':
          response = await _client
              .delete(uri, headers: headers, body: encodedBody)
              .timeout(const Duration(seconds: 10));
          break;
        case 'PATCH':
          response = await _client
              .patch(uri, headers: headers, body: encodedBody)
              .timeout(const Duration(seconds: 10));
          break;
        case 'GET':
        default:
          response = await _client
              .get(uri, headers: headers)
              .timeout(const Duration(seconds: 10));
          break;
      }
    } catch (e) {
      Get.log('API Request connection error: $e');
      throw Exception('Connection failed to ${uri.host}:${uri.port}. Details: $e');
    }

    _handleAuthError(response);
    return _normalizeResponse(response);
  }

  // File Upload Helper
  Future<http.Response> uploadImage(String filePath, List<int> bytes, String fileName) async {
    final uri = Uri.parse('${AppConstants.apiUrl}/upload');
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(AppConstants.tokenKey);

    var request = http.MultipartRequest('POST', uri);
    
    if (token != null && token.isNotEmpty) {
      request.headers['Authorization'] = 'Bearer $token';
    }

    List<int> uploadBytes = bytes;
    String uploadFileName = fileName;

    // Perform compression and WebP conversion if a local file path is available
    if (filePath.isNotEmpty) {
      try {
        final originalFile = File(filePath);
        if (await originalFile.exists()) {
          final compressedFile = await ImageHelper.compressAndConvertToWebp(originalFile);
          if (compressedFile != null) {
            uploadBytes = await compressedFile.readAsBytes();
            final baseName = uploadFileName.split('.').first;
            uploadFileName = '$baseName.webp';
          }
        }
      } catch (e) {
        Get.log('Image compression failed, using original bytes: $e');
      }
    }

    var multipartFile = http.MultipartFile.fromBytes(
      'image',
      uploadBytes,
      filename: uploadFileName,
    );
    request.files.add(multipartFile);

    http.Response response;
    try {
      var streamedResponse = await request.send().timeout(const Duration(seconds: 20));
      response = await http.Response.fromStream(streamedResponse);
    } catch (e) {
      Get.log('API upload image error: $e');
      throw Exception('Image upload failed. Details: $e');
    }
    
    _handleAuthError(response);
    return _normalizeResponse(response);
  }

  void _handleAuthError(http.Response response) async {
    if (response.statusCode == 401) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(AppConstants.tokenKey);
      await prefs.remove(AppConstants.userKey);
      
      // Navigate to login if token expired or unauthorized
      if (Get.currentRoute != '/login') {
        Get.offAllNamed('/login');
      }
    }
  }

  http.Response _normalizeResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      try {
        final decoded = jsonDecode(response.body);
        final normalized = _normalizeKeys(decoded);
        return http.Response(
          jsonEncode(normalized),
          response.statusCode,
          headers: response.headers,
          isRedirect: response.isRedirect,
          persistentConnection: response.persistentConnection,
          reasonPhrase: response.reasonPhrase,
          request: response.request,
        );
      } catch (_) {
        // Not a JSON response, return raw
      }
    }
    return response;
  }

  dynamic _normalizeKeys(dynamic json) {
    if (json is List) {
      return json.map((item) => _normalizeKeys(item)).toList();
    } else if (json is Map) {
      final normalized = <String, dynamic>{};
      json.forEach((key, value) {
        if (key.isNotEmpty) {
          final camelKey = key[0].toLowerCase() + key.substring(1);
          normalized[camelKey] = _normalizeKeys(value);
        } else {
          normalized[key] = _normalizeKeys(value);
        }
      });
      return normalized;
    }
    return json;
  }
}
