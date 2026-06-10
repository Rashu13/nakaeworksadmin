import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../controllers/dashboard_controller.dart';
import '../../../../core/theme/app_theme.dart';

class DashboardOverviewView extends GetView<DashboardController> {
  const DashboardOverviewView({super.key});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (controller.isLoading.value) {
        return const Center(child: CircularProgressIndicator(color: AppTheme.accentBlue));
      }

      final stats = controller.stats.value;
      if (stats == null) {
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Failed to load dashboard statistics'),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: controller.fetchDashboardStats,
                child: const Text('Retry'),
              )
            ],
          ),
        );
      }

      final isDesktop = MediaQuery.of(context).size.width >= 1000;
      final currencyFormatter = NumberFormat.simpleCurrency(locale: 'en_IN', decimalDigits: 0);

      return SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Header
            Text(
              'Dashboard Overview',
              style: GoogleFonts.outfit(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: AppTheme.textDark,
              ),
            ),
            Text(
              'Here is what is happening with NakaeWorks today.',
              style: GoogleFonts.inter(
                fontSize: 14,
                color: AppTheme.textGray,
              ),
            ),
            const SizedBox(height: 28),

            // Responsive Metrics Grid
            GridView.count(
              crossAxisCount: isDesktop ? 4 : (MediaQuery.of(context).size.width >= 600 ? 2 : 1),
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              childAspectRatio: 1.6,
              children: [
                _buildStatCard(
                  title: 'TOTAL REVENUE',
                  value: currencyFormatter.format(stats.totalRevenue),
                  subtitle: 'Completed bookings',
                  icon: LucideIcons.indianRupee,
                  color: AppTheme.statusCompleted,
                ),
                _buildStatCard(
                  title: 'MONTHLY REVENUE',
                  value: currencyFormatter.format(stats.monthlyRevenue),
                  subtitle: 'Current billing month',
                  icon: LucideIcons.trendingUp,
                  color: AppTheme.accentBlue,
                ),
                _buildStatCard(
                  title: 'TOTAL BOOKINGS',
                  value: stats.totalBookings.toString(),
                  subtitle: '${stats.todayBookings} bookings today',
                  icon: LucideIcons.calendar,
                  color: AppTheme.statusPending,
                ),
                _buildStatCard(
                  title: 'TOTAL USERS',
                  value: stats.totalUsers.toString(),
                  subtitle: '${stats.totalProviders} active providers',
                  icon: LucideIcons.users,
                  color: AppTheme.primaryNavy,
                ),
              ],
            ),
            const SizedBox(height: 32),

            // Live status & mini counts
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Live Status Counts',
                      style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildStatusIndicator('Pending', stats.pendingBookings, AppTheme.statusPending),
                        _buildStatusIndicator('In Progress', stats.inProgressBookings, AppTheme.statusInProgress),
                        _buildStatusIndicator('Completed', stats.completedBookings, AppTheme.statusCompleted),
                        _buildStatusIndicator('Live Providers', stats.liveWorkingProviders, AppTheme.accentBlue),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),

            // Recent Bookings List
            Text(
              'Recent Bookings',
              style: GoogleFonts.outfit(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AppTheme.textDark,
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: stats.recentBookings.length,
                separatorBuilder: (context, index) => const Divider(color: AppTheme.borderLight),
                itemBuilder: (context, index) {
                  final booking = stats.recentBookings[index];
                  return ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    leading: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppTheme.bgLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(LucideIcons.clipboardList, color: AppTheme.primaryNavy, size: 20),
                    ),
                    title: Row(
                      children: [
                        Text(
                          booking.bookingNumber,
                          style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        const SizedBox(width: 8),
                        _buildBadge(booking.statusName, booking.statusSlug),
                      ],
                    ),
                    subtitle: Text(
                      '${booking.serviceName} • Customer: ${booking.consumerName}',
                      style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textGray),
                    ),
                    trailing: Text(
                      currencyFormatter.format(booking.totalAmount),
                      style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.textDark),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required Color color,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textGray,
                    letterSpacing: 1.1,
                  ),
                ),
                Icon(icon, color: color, size: 20),
              ],
            ),
            Text(
              value,
              style: GoogleFonts.outfit(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppTheme.textDark,
              ),
            ),
            Text(
              subtitle,
              style: GoogleFonts.inter(
                fontSize: 12,
                color: AppTheme.textGray,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusIndicator(String label, int value, Color color) {
    return Column(
      children: [
        Text(
          value.toString(),
          style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.bold, color: color),
        ),
        Text(
          label,
          style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textGray),
        ),
      ],
    );
  }

  Widget _buildBadge(String label, String slug) {
    Color bg = AppTheme.borderLight;
    Color fg = AppTheme.textDark;

    switch (slug) {
      case 'pending':
        bg = AppTheme.statusPending.withOpacity(0.12);
        fg = AppTheme.statusPending;
        break;
      case 'confirmed':
        bg = AppTheme.statusConfirmed.withOpacity(0.12);
        fg = AppTheme.statusConfirmed;
        break;
      case 'in_progress':
        bg = AppTheme.statusInProgress.withOpacity(0.12);
        fg = AppTheme.statusInProgress;
        break;
      case 'completed':
        bg = AppTheme.statusCompleted.withOpacity(0.12);
        fg = AppTheme.statusCompleted;
        break;
      case 'cancelled':
        bg = AppTheme.statusCancelled.withOpacity(0.12);
        fg = AppTheme.statusCancelled;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: fg),
      ),
    );
  }
}
