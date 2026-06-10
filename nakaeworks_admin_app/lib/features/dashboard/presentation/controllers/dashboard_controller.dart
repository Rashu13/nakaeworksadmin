import 'dart:convert';
import 'package:get/get.dart';
import '../../../../core/network/api_client.dart';
import '../../data/models/dashboard_stats_model.dart';

class DashboardController extends GetxController {
  final ApiClient _apiClient;

  final activeTab = 0.obs; // 0: Dashboard, 1: Bookings, 2: Users, 3: Services, 4: Categories, 5: Coupons, 6: Reviews
  final isLoading = false.obs;
  final stats = Rxn<DashboardStatsModel>();

  DashboardController(this._apiClient);

  @override
  void onInit() {
    super.onInit();
    fetchDashboardStats();
  }

  Future<void> fetchDashboardStats() async {
    isLoading.value = true;
    try {
      final response = await _apiClient.request(
        endpoint: '/admin/dashboard',
        method: 'GET',
      );
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        if (body['success'] == true) {
          stats.value = DashboardStatsModel.fromJson(body['data']);
        }
      }
    } catch (e) {
      Get.log('Error fetching dashboard stats: $e');
    } finally {
      isLoading.value = false;
    }
  }

  void changeTab(int index) {
    activeTab.value = index;
    if (index == 0) {
      fetchDashboardStats();
    }
  }
}
