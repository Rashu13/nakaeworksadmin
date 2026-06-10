import '../../../bookings/data/models/booking_model.dart';

class DashboardStatsModel {
  final int totalUsers;
  final int totalProviders;
  final int liveWorkingProviders;
  final int totalConsumers;
  final int totalServices;
  final int totalBookings;
  final int todayBookings;
  final int pendingBookings;
  final int inProgressBookings;
  final int completedBookings;

  final double totalRevenue;
  final double monthlyRevenue;
  final double todayRevenue;
  final double totalPlatformFees;

  final List<BookingModel> recentBookings;

  DashboardStatsModel({
    required this.totalUsers,
    required this.totalProviders,
    required this.liveWorkingProviders,
    required this.totalConsumers,
    required this.totalServices,
    required this.totalBookings,
    required this.todayBookings,
    required this.pendingBookings,
    required this.inProgressBookings,
    required this.completedBookings,
    required this.totalRevenue,
    required this.monthlyRevenue,
    required this.todayRevenue,
    required this.totalPlatformFees,
    required this.recentBookings,
  });

  factory DashboardStatsModel.fromJson(Map<String, dynamic> json) {
    final stats = json['statistics'] ?? {};
    final rev = json['revenue'] ?? {};
    final list = json['recentBookings'] as List? ?? [];

    return DashboardStatsModel(
      totalUsers: stats['totalUsers'] ?? 0,
      totalProviders: stats['totalProviders'] ?? 0,
      liveWorkingProviders: stats['liveWorkingProviders'] ?? 0,
      totalConsumers: stats['totalConsumers'] ?? 0,
      totalServices: stats['totalServices'] ?? 0,
      totalBookings: stats['totalBookings'] ?? 0,
      todayBookings: stats['todayBookings'] ?? 0,
      pendingBookings: stats['pendingBookings'] ?? 0,
      inProgressBookings: stats['inProgressBookings'] ?? 0,
      completedBookings: stats['completedBookings'] ?? 0,
      totalRevenue: double.parse((rev['total'] ?? 0.0).toString()),
      monthlyRevenue: double.parse((rev['monthly'] ?? 0.0).toString()),
      todayRevenue: double.parse((rev['today'] ?? 0.0).toString()),
      totalPlatformFees: double.parse((rev['platformFees'] ?? 0.0).toString()),
      recentBookings: list.map((b) => BookingModel.fromJson(b)).toList(),
    );
  }
}
