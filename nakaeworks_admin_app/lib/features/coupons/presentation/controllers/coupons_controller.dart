import 'dart:convert';
import 'package:get/get.dart';
import '../../../../core/network/api_client.dart';
import '../../data/models/coupon_model.dart';

class CouponsController extends GetxController {
  final ApiClient _apiClient;

  final coupons = <CouponModel>[].obs;
  final isLoading = false.obs;

  CouponsController(this._apiClient);

  @override
  void onInit() {
    super.onInit();
    fetchCoupons();
  }

  Future<void> fetchCoupons() async {
    isLoading.value = true;
    try {
      final response = await _apiClient.request(
        endpoint: '/coupons',
        method: 'GET',
      );
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        if (body['success'] == true) {
          final list = body['data'] as List? ?? [];
          coupons.value = list.map((c) => CouponModel.fromJson(c)).toList();
        }
      }
    } catch (e) {
      Get.log('Error fetching coupons: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> createCoupon(Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.request(
        endpoint: '/coupons',
        method: 'POST',
        body: data,
      );
      if (response.statusCode == 201 || response.statusCode == 200) {
        fetchCoupons();
        return true;
      }
    } catch (e) {
      Get.log('Error creating coupon: $e');
    }
    return false;
  }

  Future<bool> updateCoupon(int id, Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.request(
        endpoint: '/coupons/$id',
        method: 'PUT',
        body: data,
      );
      if (response.statusCode == 200) {
        fetchCoupons();
        return true;
      }
    } catch (e) {
      Get.log('Error updating coupon: $e');
    }
    return false;
  }

  Future<bool> toggleCouponStatus(int id, bool newStatus) async {
    try {
      final response = await _apiClient.request(
        endpoint: '/coupons/$id/status',
        method: 'PATCH',
        body: {'status': newStatus},
      );
      if (response.statusCode == 200) {
        fetchCoupons();
        return true;
      }
    } catch (e) {
      Get.log('Error toggling status: $e');
    }
    return false;
  }

  Future<bool> deleteCoupon(int id) async {
    try {
      final response = await _apiClient.request(
        endpoint: '/coupons/$id',
        method: 'DELETE',
      );
      if (response.statusCode == 200) {
        fetchCoupons();
        return true;
      }
    } catch (e) {
      Get.log('Error deleting coupon: $e');
    }
    return false;
  }
}
