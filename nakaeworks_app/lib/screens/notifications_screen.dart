import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/notifications_provider.dart';
import '../utils/constants.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(AppConstants.bgLight),
      body: Consumer<NotificationsProvider>(
        builder: (context, provider, _) {
          return Column(
            children: [
              _buildHeader(context, provider),
              Expanded(
                child: provider.all.isEmpty
                    ? _buildEmpty()
                    : _buildList(context, provider),
              ),
            ],
          );
        },
      ),
    );
  }

  // ─── Header ─────────────────────────────────────────────────────

  Widget _buildHeader(BuildContext context, NotificationsProvider provider) {
    return Container(
      color: Colors.white,
      padding: EdgeInsets.fromLTRB(
          20, MediaQuery.of(context).padding.top + 12, 20, 16),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.of(context).pop(),
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: const Color(AppConstants.bgLight),
                borderRadius: BorderRadius.circular(14),
                border:
                    Border.all(color: const Color(AppConstants.borderColor)),
              ),
              child: const Icon(Icons.arrow_back_ios_new_rounded,
                  size: 16, color: Color(AppConstants.primaryDark)),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Notifications',
                  style: GoogleFonts.inter(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: const Color(AppConstants.primaryDark),
                    letterSpacing: -0.5,
                  ),
                ),
                Text(
                  provider.unreadCount > 0
                      ? '${provider.unreadCount} unread'
                      : 'All caught up!',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: provider.unreadCount > 0
                        ? const Color(AppConstants.primaryBlue)
                        : const Color(AppConstants.textGray),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          // Mark all read button
          if (provider.unreadCount > 0)
            GestureDetector(
              onTap: provider.markAllRead,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(AppConstants.primaryBlue).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  'Mark all read',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: const Color(AppConstants.primaryBlue),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  // ─── List ────────────────────────────────────────────────────────

  Widget _buildList(BuildContext context, NotificationsProvider provider) {
    // Group by today / yesterday / earlier
    final now = DateTime.now();
    final today = <AppNotification>[];
    final yesterday = <AppNotification>[];
    final earlier = <AppNotification>[];

    for (final n in provider.all) {
      final diff = now.difference(n.time);
      if (diff.inHours < 24 && now.day == n.time.day) {
        today.add(n);
      } else if (diff.inHours < 48) {
        yesterday.add(n);
      } else {
        earlier.add(n);
      }
    }

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 80),
      children: [
        if (today.isNotEmpty) ...[
          _groupLabel('TODAY'),
          const SizedBox(height: 10),
          ...today.map((n) => _NotifTile(notif: n)),
          const SizedBox(height: 20),
        ],
        if (yesterday.isNotEmpty) ...[
          _groupLabel('YESTERDAY'),
          const SizedBox(height: 10),
          ...yesterday.map((n) => _NotifTile(notif: n)),
          const SizedBox(height: 20),
        ],
        if (earlier.isNotEmpty) ...[
          _groupLabel('EARLIER'),
          const SizedBox(height: 10),
          ...earlier.map((n) => _NotifTile(notif: n)),
        ],
      ],
    );
  }

  Widget _groupLabel(String text) => Padding(
        padding: const EdgeInsets.only(left: 4),
        child: Text(
          text,
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: FontWeight.w900,
            color: const Color(AppConstants.textGray),
            letterSpacing: 1.5,
          ),
        ),
      );

  // ─── Empty State ─────────────────────────────────────────────────

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 90,
            height: 90,
            decoration: BoxDecoration(
              color: const Color(AppConstants.bgLight),
              shape: BoxShape.circle,
              border:
                  Border.all(color: const Color(AppConstants.borderColor)),
            ),
            child: const Icon(Icons.notifications_off_outlined,
                size: 40, color: Color(AppConstants.textGray)),
          ),
          const SizedBox(height: 20),
          Text(
            'NO NOTIFICATIONS',
            style: GoogleFonts.inter(
              fontSize: 16,
              fontWeight: FontWeight.w900,
              color: const Color(AppConstants.primaryDark),
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            "You're all caught up! Check back later.",
            style: GoogleFonts.inter(
              fontSize: 13,
              color: const Color(AppConstants.textGray),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Notification Tile ────────────────────────────────────────────────

class _NotifTile extends StatelessWidget {
  final AppNotification notif;
  const _NotifTile({required this.notif});

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: Key(notif.id),
      direction: DismissDirection.endToStart,
      onDismissed: (_) =>
          context.read<NotificationsProvider>().delete(notif.id),
      background: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: const Color(0xFFEF4444),
          borderRadius: BorderRadius.circular(20),
        ),
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        child: const Icon(Icons.delete_outline_rounded,
            color: Colors.white, size: 24),
      ),
      child: GestureDetector(
        onTap: () => context.read<NotificationsProvider>().markRead(notif.id),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: notif.isRead ? Colors.white : const Color(0xFFEFF6FF),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: notif.isRead
                  ? const Color(AppConstants.borderColor)
                  : const Color(AppConstants.primaryBlue).withValues(alpha: 0.25),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: notif.isRead ? 0.02 : 0.05),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Icon bubble
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: _iconBg(notif.type),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(
                  _iconData(notif.type),
                  size: 22,
                  color: _iconColor(notif.type),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            notif.title,
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: notif.isRead
                                  ? FontWeight.w600
                                  : FontWeight.w800,
                              color: const Color(AppConstants.primaryDark),
                            ),
                          ),
                        ),
                        if (!notif.isRead)
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: Color(AppConstants.primaryBlue),
                              shape: BoxShape.circle,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      notif.body,
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        color: const Color(AppConstants.textGray),
                        height: 1.4,
                        fontWeight: FontWeight.w500,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _timeAgo(notif.time),
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: notif.isRead
                            ? const Color(AppConstants.textGray)
                            : const Color(AppConstants.primaryBlue),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ─── Type helpers ───────────────────────────────────────────────

  IconData _iconData(NotifType type) {
    switch (type) {
      case NotifType.order:
        return Icons.shopping_bag_outlined;
      case NotifType.promo:
        return Icons.local_offer_outlined;
      case NotifType.system:
        return Icons.info_outline_rounded;
      case NotifType.reminder:
        return Icons.alarm_rounded;
    }
  }

  Color _iconBg(NotifType type) {
    switch (type) {
      case NotifType.order:
        return const Color(0xFFEFF6FF);
      case NotifType.promo:
        return const Color(0xFFFFFBEB);
      case NotifType.system:
        return const Color(0xFFF0FDF4);
      case NotifType.reminder:
        return const Color(0xFFFDF4FF);
    }
  }

  Color _iconColor(NotifType type) {
    switch (type) {
      case NotifType.order:
        return const Color(AppConstants.primaryBlue);
      case NotifType.promo:
        return const Color(0xFFF59E0B);
      case NotifType.system:
        return const Color(0xFF16A34A);
      case NotifType.reminder:
        return const Color(0xFF9333EA);
    }
  }

  String _timeAgo(DateTime time) {
    final diff = DateTime.now().difference(time);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays == 1) return 'Yesterday';
    return '${diff.inDays}d ago';
  }
}
