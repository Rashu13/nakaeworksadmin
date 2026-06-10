import 'package:get/get.dart';
import '../../features/auth/presentation/bindings/auth_binding.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/dashboard/presentation/bindings/dashboard_binding.dart';
import '../../features/dashboard/presentation/pages/main_layout_page.dart';

class AppRoutes {
  static const String initial = '/login';
  static const String login = '/login';
  static const String dashboard = '/dashboard';

  static final routes = [
    GetPage(
      name: login,
      page: () => const LoginPage(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: dashboard,
      page: () => const MainLayoutPage(),
      binding: DashboardBinding(),
    ),
  ];
}
