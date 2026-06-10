import 'dart:convert';
import 'package:get/get.dart';
import '../../../../core/network/api_client.dart';
import '../../../auth/data/models/user_model.dart';
import '../../../auth/domain/entities/user_entity.dart';

class UsersController extends GetxController {
  final ApiClient _apiClient;

  final users = <UserEntity>[].obs;
  final isLoading = false.obs;
  final selectedRole = 'consumer'.obs; // consumer, provider, admin

  UsersController(this._apiClient);

  @override
  void onInit() {
    super.onInit();
    fetchUsers();
  }

  Future<void> fetchUsers() async {
    isLoading.value = true;
    try {
      final endpoint = '/admin/users?role=${selectedRole.value}';
      final response = await _apiClient.request(endpoint: endpoint, method: 'GET');
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        if (body['success'] == true) {
          final list = body['data']['users'] as List? ?? [];
          users.value = list.map((u) => UserModel.fromJson(u)).toList();
        }
      }
    } catch (e) {
      Get.log('Error fetching users: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> createUser({
    required String name,
    required String email,
    required String password,
    required String phone,
    required String role,
    bool status = true,
  }) async {
    try {
      final response = await _apiClient.request(
        endpoint: '/admin/users',
        method: 'POST',
        body: {
          'name': name,
          'email': email,
          'password': password,
          'phone': phone,
          'role': role,
          'status': status,
        },
      );
      if (response.statusCode == 200) {
        fetchUsers();
        return true;
      }
    } catch (e) {
      Get.log('Error creating user: $e');
    }
    return false;
  }

  Future<bool> updateUser(int id, Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.request(
        endpoint: '/admin/users/$id',
        method: 'PUT',
        body: data,
      );
      if (response.statusCode == 200) {
        fetchUsers();
        return true;
      }
    } catch (e) {
      Get.log('Error updating user: $e');
    }
    return false;
  }

  Future<bool> toggleUserStatus(int id, bool newStatus) async {
    try {
      final response = await _apiClient.request(
        endpoint: '/admin/users/$id/status',
        method: 'PUT',
        body: {'status': newStatus},
      );
      if (response.statusCode == 200) {
        fetchUsers();
        return true;
      }
    } catch (e) {
      Get.log('Error toggling status: $e');
    }
    return false;
  }

  Future<bool> deleteUser(int id) async {
    try {
      final response = await _apiClient.request(
        endpoint: '/admin/users/$id',
        method: 'DELETE',
      );
      if (response.statusCode == 200) {
        fetchUsers();
        return true;
      }
    } catch (e) {
      Get.log('Error deleting user: $e');
    }
    return false;
  }

  void changeRoleFilter(String role) {
    selectedRole.value = role;
    fetchUsers();
  }
}
