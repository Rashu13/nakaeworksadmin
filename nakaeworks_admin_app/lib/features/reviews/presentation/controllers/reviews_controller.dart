import 'dart:convert';
import 'package:get/get.dart';
import '../../../../core/network/api_client.dart';
import '../../data/models/review_model.dart';

class ReviewsController extends GetxController {
  final ApiClient _apiClient;

  final reviews = <ReviewModel>[].obs;
  final isLoading = false.obs;

  ReviewsController(this._apiClient);

  @override
  void onInit() {
    super.onInit();
    fetchReviews();
  }

  Future<void> fetchReviews() async {
    isLoading.value = true;
    try {
      final response = await _apiClient.request(
        endpoint: '/admin/reviews',
        method: 'GET',
      );
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        if (body['success'] == true) {
          final list = body['data']['reviews'] as List? ?? [];
          reviews.value = list.map((r) => ReviewModel.fromJson(r)).toList();
        }
      }
    } catch (e) {
      Get.log('Error fetching reviews: $e');
    } finally {
      isLoading.value = false;
    }
  }
}
