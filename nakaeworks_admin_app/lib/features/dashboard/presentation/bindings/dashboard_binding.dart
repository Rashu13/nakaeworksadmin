import 'package:get/get.dart';
import '../../../../core/network/api_client.dart';
import '../controllers/dashboard_controller.dart';
import '../../../bookings/presentation/controllers/bookings_controller.dart';
import '../../../users/presentation/controllers/users_controller.dart';
import '../../../services/presentation/controllers/services_controller.dart';
import '../../../categories/presentation/controllers/categories_controller.dart';
import '../../../coupons/presentation/controllers/coupons_controller.dart';
import '../../../reviews/presentation/controllers/reviews_controller.dart';

class DashboardBinding implements Bindings {
  @override
  void dependencies() {
    final client = Get.find<ApiClient>();
    Get.lazyPut<DashboardController>(() => DashboardController(client));
    Get.lazyPut<BookingsController>(() => BookingsController(client));
    Get.lazyPut<UsersController>(() => UsersController(client));
    Get.lazyPut<ServicesController>(() => ServicesController(client));
    Get.lazyPut<CategoriesController>(() => CategoriesController(client));
    Get.lazyPut<CouponsController>(() => CouponsController(client));
    Get.lazyPut<ReviewsController>(() => ReviewsController(client));
  }
}
