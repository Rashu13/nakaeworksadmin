import 'package:flutter/material.dart';

enum NotifType { order, promo, system, reminder }

class AppNotification {
  final String id;
  final String title;
  final String body;
  final NotifType type;
  final DateTime time;
  bool isRead;

  AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.time,
    this.isRead = false,
  });
}

class NotificationsProvider extends ChangeNotifier {
  final List<AppNotification> _notifications = [
    AppNotification(
      id: '1',
      title: 'Booking Confirmed ✅',
      body: 'Your AC Service booking has been confirmed for tomorrow.',
      type: NotifType.order,
      time: DateTime.now().subtract(const Duration(minutes: 10)),
    ),
    AppNotification(
      id: '2',
      title: '🎉 Special Offer — 20% Off',
      body: 'Get 20% off on all Home Cleaning services this weekend only!',
      type: NotifType.promo,
      time: DateTime.now().subtract(const Duration(hours: 2)),
    ),
    AppNotification(
      id: '3',
      title: 'Technician on the way 🔧',
      body: 'Your technician Ramesh will arrive in 30 minutes.',
      type: NotifType.order,
      time: DateTime.now().subtract(const Duration(hours: 5)),
    ),
    AppNotification(
      id: '4',
      title: 'Service Reminder ⏰',
      body: 'Your Plumbing service is scheduled for tomorrow at 10:00 AM.',
      type: NotifType.reminder,
      time: DateTime.now().subtract(const Duration(days: 1)),
    ),
    AppNotification(
      id: '5',
      title: 'App Update Available',
      body: 'NakaeWorks v2.0 is available with exciting new features.',
      type: NotifType.system,
      time: DateTime.now().subtract(const Duration(days: 2)),
      isRead: true,
    ),
    AppNotification(
      id: '6',
      title: '⭐ Rate Your Experience',
      body: 'How was your Electrical Repair service? Tap to rate.',
      type: NotifType.order,
      time: DateTime.now().subtract(const Duration(days: 3)),
      isRead: true,
    ),
  ];

  List<AppNotification> get all => _notifications;
  int get unreadCount => _notifications.where((n) => !n.isRead).length;

  void markRead(String id) {
    final n = _notifications.where((n) => n.id == id).firstOrNull;
    if (n != null && !n.isRead) {
      n.isRead = true;
      notifyListeners();
    }
  }

  void markAllRead() {
    for (final n in _notifications) {
      n.isRead = true;
    }
    notifyListeners();
  }

  void delete(String id) {
    _notifications.removeWhere((n) => n.id == id);
    notifyListeners();
  }

  void addOrderNotification(String title, String body) {
    addNotification(title, body, NotifType.order);
  }

  void addNotification(String title, String body, NotifType type) {
    _notifications.insert(
      0,
      AppNotification(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: title,
        body: body,
        type: type,
        time: DateTime.now(),
      ),
    );
    notifyListeners();
  }

  void clearAll() {
    _notifications.clear();
    notifyListeners();
  }
}
