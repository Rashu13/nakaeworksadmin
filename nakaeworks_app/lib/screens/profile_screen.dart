import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../utils/constants.dart';
import 'orders_screen.dart';
import 'edit_profile_screen.dart';
import 'saved_addresses_screen.dart';
import 'privacy_policy_screen.dart';
import 'terms_conditions_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    return Scaffold(
      backgroundColor: const Color(AppConstants.bgLight),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'MY ACCOUNT',
                style: GoogleFonts.inter(
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                  color: const Color(AppConstants.primaryDark),
                  letterSpacing: -0.5,
                ),
              ),
              Text(
                'Manage professional services & configurations',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: const Color(AppConstants.textGray),
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 24),

              // Profile Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.03),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: const Color(AppConstants.primaryDark),
                        borderRadius: BorderRadius.circular(32),
                      ),
                      child: ClipOval(
                        child: user?.picture != null
                            ? Image.network(
                                user!.picture!.startsWith('http')
                                    ? user.picture!
                                    : '${AppConstants.baseUrl}${user.picture}',
                                width: 64,
                                height: 64,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) =>
                                    _buildPlaceholder(user!.name),
                              )
                            : _buildPlaceholder(user?.name ?? 'U'),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user?.name ?? 'User',
                            style: GoogleFonts.inter(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: const Color(AppConstants.primaryDark),
                            ),
                          ),
                          Text(
                            user?.email ?? 'user@example.com',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              color: const Color(AppConstants.textGray),
                            ),
                          ),
                          if (user?.phone != null)
                            Text(
                              user!.phone!,
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                color: const Color(AppConstants.textGray),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                        ],
                      ),
                    ),
                    GestureDetector(
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(
                            builder: (_) => const EditProfileScreen()),
                      ),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: const Color(AppConstants.bgLight),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          'EDIT',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: const Color(AppConstants.primaryDark),
                            letterSpacing: 1,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Menu
              _sectionLabel('SYSTEM CONTROLS'),
              const SizedBox(height: 12),
              _menuContainer([
                _MenuItem(
                    icon: Icons.person_outline_rounded,
                    title: 'User Intel (Profile Data)'),
                _MenuItem(
                    icon: Icons.shopping_bag_outlined,
                    title: 'Service History (Missions)',
                    onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(
                              builder: (_) => const OrdersScreen()),
                        )),
                _MenuItem(
                    icon: Icons.location_on_outlined,
                    title: 'Saved Coordinates',
                    onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(
                              builder: (_) =>
                                  const SavedAddressesScreen()),
                        )),
                _MenuItem(
                    icon: Icons.key_outlined,
                    title: 'Access Protocol (Security)'),
              ]),
              const SizedBox(height: 32),

              // Legal
              _sectionLabel('LEGAL PROTOCOLS'),
              const SizedBox(height: 12),
              _menuContainer([
                _MenuItem(
                    icon: Icons.policy_outlined,
                    title: 'Privacy (Data Safety)',
                    onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(
                              builder: (_) => const PrivacyPolicyScreen()),
                        )),
                _MenuItem(
                    icon: Icons.description_outlined,
                    title: 'Terms of Use (Engagement)',
                    onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(
                              builder: (_) => const TermsConditionsScreen()),
                        )),
              ]),
              const SizedBox(height: 32),

              // Logout
              _menuContainer([
                _MenuItem(
                  icon: Icons.logout_rounded,
                  title: 'Terminate Session',
                  isDestructive: true,
                  onTap: () => _confirmLogout(context),
                ),
              ], destructive: true),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPlaceholder(String name) {
    return Center(
      child: Text(
        (name.isNotEmpty ? name[0] : 'U').toUpperCase(),
        style: GoogleFonts.inter(
          fontSize: 24,
          fontWeight: FontWeight.w900,
          color: Colors.white,
        ),
      ),
    );
  }

  Widget _sectionLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 8),
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
  }

  Widget _menuContainer(List<Widget> items, {bool destructive = false}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color:
              destructive ? const Color(0xFFFEE2E2) : const Color(AppConstants.borderColor),
        ),
      ),
      child: Column(
        children: [
          for (int i = 0; i < items.length; i++) ...[
            items[i],
            if (i < items.length - 1)
              Divider(
                  height: 1, indent: 72, color: const Color(AppConstants.borderColor)),
          ],
        ],
      ),
    );
  }

  void _confirmLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Sign Out',
            style: GoogleFonts.inter(fontWeight: FontWeight.w900)),
        content: Text('Are you sure you want to terminate this session?',
            style: GoogleFonts.inter()),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel',
                style: GoogleFonts.inter(
                    color: const Color(AppConstants.textGray))),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              await context.read<AuthProvider>().logout();
              if (context.mounted) {
                Navigator.of(context).pushReplacementNamed('/login');
              }
            },
            child: Text('Sign Out',
                style: GoogleFonts.inter(
                    color: Colors.red, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final bool isDestructive;
  final VoidCallback? onTap;

  const _MenuItem({
    required this.icon,
    required this.title,
    this.isDestructive = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap ?? () {},
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: isDestructive
                    ? const Color(0xFFFEF2F2)
                    : const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                size: 20,
                color: isDestructive
                    ? const Color(0xFFEF4444)
                    : const Color(AppConstants.primaryBlue),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: GoogleFonts.inter(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: isDestructive
                      ? const Color(0xFFEF4444)
                      : const Color(0xFF334155),
                ),
              ),
            ),
            Icon(
              Icons.chevron_right_rounded,
              color: isDestructive
                  ? const Color(0xFFF87171)
                  : const Color(0xFFCBD5E1),
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
