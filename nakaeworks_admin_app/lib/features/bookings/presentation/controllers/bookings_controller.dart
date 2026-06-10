import 'dart:convert';
import 'package:get/get.dart';
import '../../../../core/network/api_client.dart';
import '../../data/models/booking_model.dart';
import '../../../auth/domain/entities/user_entity.dart';
import '../../../auth/data/models/user_model.dart';

class BookingsController extends GetxController {
  final ApiClient _apiClient;

  final bookings = <BookingModel>[].obs;
  final isLoading = false.obs;
  
  final selectedStatus = ''.obs;
  final searchNumber = ''.obs;

  final providers = <UserEntity>[].obs;
  final isLoadingProviders = false.obs;
  
  BookingsController(this._apiClient);

  @override
  void onInit() {
    super.onInit();
    fetchBookings();
    fetchProviders();
  }

  Future<void> fetchProviders() async {
    isLoadingProviders.value = true;
    try {
      final response = await _apiClient.request(endpoint: '/admin/users?role=provider', method: 'GET');
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        if (body['success'] == true) {
          final list = body['data']['users'] as List? ?? [];
          providers.value = list.map((u) => UserModel.fromJson(u)).toList();
        }
      }
    } catch (e) {
      Get.log('Error fetching providers: $e');
    } finally {
      isLoadingProviders.value = false;
    }
  }

  Future<void> fetchBookings() async {
    isLoading.value = true;
    try {
      final queryParams = <String, String>{};
      if (selectedStatus.value.isNotEmpty) {
        queryParams['status'] = selectedStatus.value;
      }
      if (searchNumber.value.isNotEmpty) {
        queryParams['search'] = searchNumber.value;
      }
      
      final queryString = Uri(queryParameters: queryParams).query;
      final endpoint = '/admin/bookings${queryString.isNotEmpty ? '?$queryString' : ''}';
      
      final response = await _apiClient.request(endpoint: endpoint, method: 'GET');
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        if (body['success'] == true) {
          final list = body['data']['bookings'] as List? ?? [];
          bookings.value = list.map((b) => BookingModel.fromJson(b)).toList();
        }
      }
    } catch (e) {
      Get.log('Error fetching bookings: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> updateStatus(int bookingId, String statusSlug) async {
    try {
      final response = await _apiClient.request(
        endpoint: '/admin/bookings/$bookingId/status',
        method: 'PUT',
        body: {'status': statusSlug},
      );
      Get.log('Update status response: ${response.statusCode} - ${response.body}');
      if (response.statusCode == 200) {
        fetchBookings();
        return true;
      }
    } catch (e) {
      Get.log('Error updating status: $e');
    }
    return false;
  }

  Future<bool> assignProvider(int bookingId, int providerId) async {
    try {
      final response = await _apiClient.request(
        endpoint: '/admin/bookings/$bookingId/assign',
        method: 'PUT',
        body: {'providerId': providerId},
      );
      Get.log('Assign provider response: ${response.statusCode} - ${response.body}');
      if (response.statusCode == 200) {
        fetchBookings();
        return true;
      }
    } catch (e) {
      Get.log('Error assigning provider: $e');
    }
    return false;
  }

  void filterByStatus(String slug) {
    selectedStatus.value = slug;
    fetchBookings();
  }

  void searchBooking(String value) {
    searchNumber.value = value.trim();
    fetchBookings();
  }
}
