import 'dart:convert';
import 'package:get/get.dart';
import '../../../../core/network/api_client.dart';
import '../../data/models/category_model.dart';

class CategoriesController extends GetxController {
  final ApiClient _apiClient;

  final categories = <CategoryModel>[].obs;
  final isLoading = false.obs;

  CategoriesController(this._apiClient);

  @override
  void onInit() {
    super.onInit();
    fetchCategories();
  }

  Future<void> fetchCategories() async {
    isLoading.value = true;
    try {
      final response = await _apiClient.request(
        endpoint: '/admin/categories',
        method: 'GET',
      );
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        if (body['success'] == true) {
          final list = body['data'] as List? ?? [];
          categories.value = list.map((c) => CategoryModel.fromJson(c)).toList();
        }
      }
    } catch (e) {
      Get.log('Error fetching categories: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<String?> uploadImage(String filePath, List<int> bytes, String fileName) async {
    try {
      final response = await _apiClient.uploadImage(filePath, bytes, fileName);
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return body['imageUrl'] ?? (body['data'] != null ? body['data']['imageUrl'] : null);
      }
    } catch (e) {
      Get.log('Error uploading image: $e');
    }
    return null;
  }

  Future<bool> createCategory(String name, String? icon, String? description) async {
    try {
      final response = await _apiClient.request(
        endpoint: '/admin/categories',
        method: 'POST',
        body: {
          'name': name,
          'icon': icon,
          'description': description,
        },
      );
      if (response.statusCode == 201 || response.statusCode == 200) {
        fetchCategories();
        return true;
      }
    } catch (e) {
      Get.log('Error creating category: $e');
    }
    return false;
  }

  Future<bool> updateCategory(int id, Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.request(
        endpoint: '/admin/categories/$id',
        method: 'PUT',
        body: data,
      );
      if (response.statusCode == 200) {
        fetchCategories();
        return true;
      }
    } catch (e) {
      Get.log('Error updating category: $e');
    }
    return false;
  }

  Future<bool> deleteCategory(int id) async {
    try {
      final response = await _apiClient.request(
        endpoint: '/admin/categories/$id',
        method: 'DELETE',
      );
      if (response.statusCode == 200) {
        fetchCategories();
        return true;
      }
    } catch (e) {
      Get.log('Error deleting category: $e');
    }
    return false;
  }
}
