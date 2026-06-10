import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../controllers/dashboard_controller.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../../../../core/theme/app_theme.dart';
import '../views/dashboard_overview_view.dart';
import '../../../bookings/presentation/views/bookings_view.dart';
import '../../../users/presentation/views/users_view.dart';
import '../../../services/presentation/views/services_view.dart';
import '../../../categories/presentation/views/categories_view.dart';
import '../../../coupons/presentation/views/coupons_view.dart';
import '../../../reviews/presentation/views/reviews_view.dart';

class MainLayoutPage extends GetView<DashboardController> {
  const MainLayoutPage({super.key});

  @override
  Widget build(BuildContext context) {
    final authController = Get.find<AuthController>();
    final isDesktop = MediaQuery.of(context).size.width >= 900;

    final subViews = const [
      DashboardOverviewView(),
      BookingsView(),
      UsersView(),
      ServicesView(),
      CategoriesView(),
      CouponsView(),
      ReviewsView(),
    ];

    final navItems = [
      _NavItem(title: 'Dashboard', icon: LucideIcons.layoutDashboard),
      _NavItem(title: 'Bookings', icon: LucideIcons.calendarClock),
      _NavItem(title: 'Users', icon: LucideIcons.users),
      _NavItem(title: 'Services', icon: LucideIcons.scissors),
      _NavItem(title: 'Categories', icon: LucideIcons.shapes),
      _NavItem(title: 'Coupons', icon: LucideIcons.ticket),
      _NavItem(title: 'Reviews', icon: LucideIcons.star),
    ];

    return Scaffold(
      appBar: isDesktop
          ? null
          : AppBar(
              title: Text(
                'NakaeWorks Admin',
                style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 18),
              ),
              backgroundColor: AppTheme.primaryNavy,
              foregroundColor: Colors.white,
              elevation: 0,
            ),
      drawer: isDesktop
          ? null
          : Drawer(
              child: Container(
                color: AppTheme.primaryNavy,
                child: Column(
                  children: [
                    _buildDrawerHeader(),
                    Expanded(
                      child: ListView.builder(
                        itemCount: navItems.length,
                        itemBuilder: (context, index) {
                          final item = navItems[index];
                          return Obx(() {
                            final isSelected = controller.activeTab.value == index;
                            return ListTile(
                              leading: Icon(item.icon, color: isSelected ? Colors.white : AppTheme.textGray, size: 20),
                              title: Text(
                                item.title,
                                style: GoogleFonts.outfit(
                                  color: isSelected ? Colors.white : AppTheme.textGray,
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                ),
                              ),
                              selected: isSelected,
                              onTap: () {
                                controller.changeTab(index);
                                Get.back(); // close drawer
                              },
                            );
                          });
                        },
                      ),
                    ),
                    _buildLogoutButton(authController),
                  ],
                ),
              ),
            ),
      body: Row(
        children: [
          // Sidebar for Desktop
          if (isDesktop) ...[
            Container(
              width: 260,
              color: AppTheme.primaryNavy,
              child: Column(
                children: [
                  _buildDrawerHeader(),
                  const SizedBox(height: 20),
                  Expanded(
                    child: ListView.builder(
                      itemCount: navItems.length,
                      itemBuilder: (context, index) {
                        final item = navItems[index];
                        return Obx(() {
                          final isSelected = controller.activeTab.value == index;
                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
                            child: InkWell(
                              onTap: () => controller.changeTab(index),
                              borderRadius: BorderRadius.circular(10),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                decoration: BoxDecoration(
                                  color: isSelected ? AppTheme.accentBlue : Colors.transparent,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      item.icon,
                                      color: isSelected ? Colors.white : AppTheme.textGray,
                                      size: 20,
                                    ),
                                    const SizedBox(width: 14),
                                    Text(
                                      item.title,
                                      style: GoogleFonts.outfit(
                                        color: isSelected ? Colors.white : AppTheme.textGray,
                                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                        fontSize: 15,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        });
                      },
                    ),
                  ),
                  _buildLogoutButton(authController),
                  const SizedBox(height: 16),
                ],
              ),
            ),
            const VerticalDivider(width: 1, color: AppTheme.borderLight),
          ],

          // Active Panel View
          Expanded(
            child: Obx(() => Container(
                  color: AppTheme.bgLight,
                  child: subViews[controller.activeTab.value],
                )),
          ),
        ],
      ),
    );
  }

  Widget _buildDrawerHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 24),
      alignment: Alignment.centerLeft,
      child: Row(
        children: [
          Icon(LucideIcons.shieldAlert, color: AppTheme.accentBlue, size: 28),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'NakaeWorks',
                style: GoogleFonts.outfit(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              Text(
                'ADMIN PORTAL',
                style: GoogleFonts.outfit(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.accentBlue,
                  letterSpacing: 1.5,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLogoutButton(AuthController authController) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: InkWell(
        onTap: authController.logout,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.white.withOpacity(0.1)),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(LucideIcons.logOut, color: Colors.redAccent.shade100, size: 18),
              const SizedBox(width: 10),
              Text(
                'Sign Out',
                style: GoogleFonts.outfit(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final String title;
  final IconData icon;

  _NavItem({required this.title, required this.icon});
}
