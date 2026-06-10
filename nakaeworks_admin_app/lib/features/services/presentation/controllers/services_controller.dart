import 'dart:convert';
import 'package:get/get.dart';
import '../../../../core/network/api_client.dart';
import '../../data/models/service_model.dart';

class ServicesController extends GetxController {
  final ApiClient _apiClient;

  final services = <ServiceModel>[].obs;
  final isLoading = false.obs;
  final categories = <dynamic>[].obs;
  final providers = <dynamic>[].obs;

  ServicesController(this._apiClient);

  @override
  void onInit() {
    super.onInit();
    fetchServices();
    fetchMetadata();
  }

  Future<void> fetchMetadata() async {
    try {
      final catRes = await _apiClient.request(
        endpoint: '/admin/categories',
        method: 'GET',
      );
      if (catRes.statusCode == 200) {
        final body = jsonDecode(catRes.body);
        if (body['success'] == true) {
          categories.value = body['data'] as List? ?? [];
        }
      }

      final provRes = await _apiClient.request(
        endpoint: '/admin/users?role=provider',
        method: 'GET',
      );
      if (provRes.statusCode == 200) {
        final body = jsonDecode(provRes.body);
        if (body['success'] == true) {
          providers.value = body['data']['users'] as List? ?? [];
        }
      }
    } catch (e) {
      Get.log('Error fetching metadata: $e');
    }
  }

  Future<void> fetchServices() async {
    isLoading.value = true;
    try {
      final response = await _apiClient.request(
        endpoint: '/admin/services',
        method: 'GET',
      );
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        if (body['success'] == true) {
          final list = body['data']['services'] as List? ?? [];
          services.value = list.map((s) => ServiceModel.fromJson(s)).toList();
        }
      }
    } catch (e) {
      Get.log('Error fetching services: $e');
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

  Future<bool> createService(Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.request(
        endpoint: '/admin/services',
        method: 'POST',
        body: data,
      );
      if (response.statusCode == 201 || response.statusCode == 200) {
        fetchServices();
        return true;
      }
    } catch (e) {
      Get.log('Error creating service: $e');
    }
    return false;
  }

  Future<bool> updateService(int id, Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.request(
        endpoint: '/admin/services/$id',
        method: 'PUT',
        body: data,
      );
      if (response.statusCode == 200) {
        fetchServices();
        return true;
      }
    } catch (e) {
      Get.log('Error updating service: $e');
    }
    return false;
  }

  Future<bool> toggleServiceStatus(int id, bool newStatus) async {
    try {
      final response = await _apiClient.request(
        endpoint: '/admin/services/$id/status',
        method: 'PUT',
        body: {'status': newStatus},
      );
      if (response.statusCode == 200) {
        fetchServices();
        return true;
      }
    } catch (e) {
      Get.log('Error toggling status: $e');
    }
    return false;
  }

  Future<bool> toggleServiceFeatured(int id, bool newFeatured) async {
    try {
      final response = await _apiClient.request(
        endpoint: '/admin/services/$id/featured',
        method: 'PUT',
        body: {'isFeatured': newFeatured},
      );
      if (response.statusCode == 200) {
        fetchServices();
        return true;
      }
    } catch (e) {
      Get.log('Error toggling featured status: $e');
    }
    return false;
  }

  Future<bool> deleteService(int id) async {
    try {
      final response = await _apiClient.request(
        endpoint: '/admin/services/$id',
        method: 'DELETE',
      );
      if (response.statusCode == 200) {
        fetchServices();
        return true;
      }
    } catch (e) {
      Get.log('Error deleting service: $e');
    }
    return false;
  }
}
