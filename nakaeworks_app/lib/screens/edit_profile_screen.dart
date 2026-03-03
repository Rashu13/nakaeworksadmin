import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../utils/constants.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen>
    with SingleTickerProviderStateMixin {
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();

  late AnimationController _animCtrl;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  bool _saving = false;
  bool _saved = false;
  
  File? _imageFile;
  final _picker = ImagePicker();

  // Track active field for highlight
  String? _activeField;

  @override
  void initState() {
    super.initState();

    _animCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _fadeAnim = CurvedAnimation(parent: _animCtrl, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.08),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _animCtrl, curve: Curves.easeOutCubic));

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = context.read<AuthProvider>().user;
      if (user != null) {
        _nameCtrl.text = user.name;
        _emailCtrl.text = user.email;
        _phoneCtrl.text = user.phone ?? '';
      }
      _animCtrl.forward();
    });
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _animCtrl.dispose();
    super.dispose();
  }

  bool get _hasChanges {
    final user = context.read<AuthProvider>().user;
    if (user == null) return false;
    return _nameCtrl.text.trim() != user.name ||
        _emailCtrl.text.trim() != user.email ||
        _phoneCtrl.text.trim() != (user.phone ?? '') ||
        _imageFile != null;
  }

  Widget _buildInitials(String initials) {
    return Text(
      initials,
      style: GoogleFonts.inter(
        fontSize: 36,
        fontWeight: FontWeight.w900,
        color: Colors.white,
      ),
    );
  }

  Future<void> _save() async {
    if (!_hasChanges || _saving) return;

    final name = _nameCtrl.text.trim();
    if (name.isEmpty) {
      _showSnack('Name cannot be empty', isError: true);
      return;
    }

    setState(() => _saving = true);

    final success = await context.read<AuthProvider>().updateProfile(
          name: name,
          phone: _phoneCtrl.text.trim(),
          email: _emailCtrl.text.trim(),
          image: _imageFile,
        );

    if (!mounted) return;
    setState(() {
      _saving = false;
      _saved = success;
    });

    if (success) {
      _showSnack('Profile updated successfully!');
      await Future.delayed(const Duration(milliseconds: 800));
      if (mounted) Navigator.of(context).pop();
    } else {
      _showSnack('Failed to update profile', isError: true);
    }
  }

  Future<void> _pickImage() async {
    try {
      final pickedFile = await _picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 512,
        maxHeight: 512,
        imageQuality: 75,
      );
      
      if (pickedFile != null) {
        setState(() {
          _imageFile = File(pickedFile.path);
        });
        _showSnack('Photo selected. Please press save.');
      }
    } catch (e) {
      _showSnack('Error picking image: $e', isError: true);
    }
  }

  void _showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              isError ? Icons.error_outline_rounded : Icons.check_circle_rounded,
              color: Colors.white,
              size: 18,
            ),
            const SizedBox(width: 10),
            Text(msg,
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                )),
          ],
        ),
        backgroundColor:
            isError ? const Color(0xFFEF4444) : const Color(0xFF16A34A),
        behavior: SnackBarBehavior.floating,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(AppConstants.bgLight),
      body: Column(
        children: [
          _buildHeader(),
          Expanded(
            child: SlideTransition(
              position: _slideAnim,
              child: FadeTransition(
                opacity: _fadeAnim,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 100),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // ── Avatar Section ──────────────────────────
                      _buildAvatarSection(),
                      const SizedBox(height: 32),

                      // ── Personal Info ───────────────────────────
                      _sectionLabel('PERSONAL INFORMATION'),
                      const SizedBox(height: 12),
                      _buildInfoCard(),
                      const SizedBox(height: 24),

                      // ── Account Info ────────────────────────────
                      _sectionLabel('ACCOUNT DETAILS'),
                      const SizedBox(height: 12),
                      _buildAccountCard(),
                      const SizedBox(height: 24),

                      // ── Danger Zone ─────────────────────────────
                      _sectionLabel('SECURITY'),
                      const SizedBox(height: 12),
                      _buildSecurityCard(),
                    ],
                  ),
                ),
              ),
            ),
          ),
          _buildSaveBar(),
        ],
      ),
    );
  }

  // ─── Header ─────────────────────────────────────────────────────

  Widget _buildHeader() {
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
                  'Edit Profile',
                  style: GoogleFonts.inter(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: const Color(AppConstants.primaryDark),
                    letterSpacing: -0.5,
                  ),
                ),
                Text(
                  'Update your personal details',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: const Color(AppConstants.textGray),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─── Avatar Section ──────────────────────────────────────────────

  Widget _buildAvatarSection() {
    final user = context.watch<AuthProvider>().user;
    final initials = (user?.name.isNotEmpty == true
            ? user!.name
                .split(' ')
                .take(2)
                .map((w) => w.isNotEmpty ? w[0] : '')
                .join()
            : 'U')
        .toUpperCase();

    return Center(
      child: Column(
        children: [
          Stack(
            children: [
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [
                      Color(AppConstants.primaryBlue),
                      Color(AppConstants.primaryDark),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: const Color(AppConstants.primaryBlue)
                          .withValues(alpha: 0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Center(
                  child: _imageFile != null
                      ? ClipOval(
                          child: Image.file(
                            _imageFile!,
                            width: 100,
                            height: 100,
                            fit: BoxFit.cover,
                          ),
                        )
                      : user?.picture != null
                          ? ClipOval(
                              child: Image.network(
                                user!.picture!.startsWith('http')
                                    ? user.picture!
                                    : '${AppConstants.baseUrl}${user.picture}',
                                width: 100,
                                height: 100,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) =>
                                    _buildInitials(initials),
                              ),
                            )
                          : _buildInitials(initials),
                ),
              ),
              // Camera button
              Positioned(
                bottom: 0,
                right: 0,
                child: GestureDetector(
                  onTap: _pickImage,
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: const Color(AppConstants.primaryBlue),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                    child: const Icon(Icons.camera_alt_rounded,
                        size: 16, color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            user?.name ?? 'User',
            style: GoogleFonts.inter(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              color: const Color(AppConstants.primaryDark),
            ),
          ),
          Text(
            user?.email ?? '',
            style: GoogleFonts.inter(
              fontSize: 13,
              color: const Color(AppConstants.textGray),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  // ─── Info Card ───────────────────────────────────────────────────

  Widget _buildInfoCard() {
    return _card([
      _EditField(
        ctrl: _nameCtrl,
        label: 'Full Name',
        icon: Icons.person_outline_rounded,
        isActive: _activeField == 'name',
        onTap: () => setState(() => _activeField = 'name'),
        onChanged: (_) => setState(() {}),
        textInputAction: TextInputAction.next,
      ),
      _cardDivider(),
      _EditField(
        ctrl: _phoneCtrl,
        label: 'Phone Number',
        icon: Icons.phone_outlined,
        keyboardType: TextInputType.phone,
        isActive: _activeField == 'phone',
        onTap: () => setState(() => _activeField = 'phone'),
        onChanged: (_) => setState(() {}),
        textInputAction: TextInputAction.done,
      ),
    ]);
  }

  // ─── Account Card ────────────────────────────────────────────────

  Widget _buildAccountCard() {
    return _card([
      _EditField(
        ctrl: _emailCtrl,
        label: 'Email Address',
        icon: Icons.email_outlined,
        keyboardType: TextInputType.emailAddress,
        isActive: _activeField == 'email',
        onTap: () => setState(() => _activeField = 'email'),
        onChanged: (_) => setState(() {}),
        textInputAction: TextInputAction.next,
      ),
    ]);
  }

  // ─── Security Card ───────────────────────────────────────────────

  Widget _buildSecurityCard() {
    return _card([
      _SecurityTile(
        icon: Icons.lock_outline_rounded,
        title: 'Change Password',
        subtitle: 'Update your account password',
        onTap: () => _showComingSoon('Change Password'),
      ),
      _cardDivider(),
      _SecurityTile(
        icon: Icons.verified_user_outlined,
        title: 'Two-Factor Authentication',
        subtitle: 'Extra security for your account',
        onTap: () => _showComingSoon('Two-Factor Auth'),
      ),
    ]);
  }

  void _showComingSoon(String feature) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$feature — Coming Soon!',
            style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
        backgroundColor: const Color(AppConstants.primaryDark),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  // ─── Save Bar ────────────────────────────────────────────────────

  Widget _buildSaveBar() {
    final canSave = _hasChanges && !_saving;

    return Container(
      padding: EdgeInsets.fromLTRB(
          20, 16, 20, MediaQuery.of(context).padding.bottom + 16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.07),
            blurRadius: 20,
            offset: const Offset(0, -6),
          ),
        ],
      ),
      child: GestureDetector(
        onTap: canSave ? _save : null,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          height: 58,
          decoration: BoxDecoration(
            color: _saved
                ? const Color(0xFF16A34A)
                : canSave
                    ? const Color(AppConstants.primaryDark)
                    : const Color(AppConstants.borderColor),
            borderRadius: BorderRadius.circular(18),
            boxShadow: canSave
                ? [
                    BoxShadow(
                      color: const Color(AppConstants.primaryDark)
                          .withValues(alpha: 0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ]
                : [],
          ),
          child: Center(
            child: _saving
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                        color: Colors.white, strokeWidth: 2.5),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _saved
                            ? Icons.check_rounded
                            : Icons.save_outlined,
                        color: canSave || _saved
                            ? Colors.white
                            : const Color(AppConstants.textGray),
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _saved ? 'SAVED!' : 'SAVE CHANGES',
                        style: GoogleFonts.inter(
                          color: canSave || _saved
                              ? Colors.white
                              : const Color(AppConstants.textGray),
                          fontWeight: FontWeight.w900,
                          fontSize: 15,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }

  // ─── Helper Widgets ──────────────────────────────────────────────

  Widget _sectionLabel(String text) => Padding(
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

  Widget _card(List<Widget> children) => Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(AppConstants.borderColor)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(children: children),
      );

  Widget _cardDivider() => Divider(
      height: 1, indent: 52, color: const Color(AppConstants.borderColor));
}

// ─── Edit Field Widget ──────────────────────────────────────────────

class _EditField extends StatelessWidget {
  final TextEditingController ctrl;
  final String label;
  final IconData icon;
  final TextInputType? keyboardType;
  final bool isActive;
  final VoidCallback onTap;
  final ValueChanged<String>? onChanged;
  final TextInputAction? textInputAction;

  const _EditField({
    required this.ctrl,
    required this.label,
    required this.icon,
    required this.isActive,
    required this.onTap,
    this.keyboardType,
    this.onChanged,
    this.textInputAction,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        color: isActive
            ? const Color(AppConstants.primaryBlue).withValues(alpha: 0.03)
            : Colors.transparent,
        borderRadius: BorderRadius.circular(20),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Row(
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: isActive
                  ? const Color(AppConstants.primaryBlue).withValues(alpha: 0.12)
                  : const Color(AppConstants.bgLight),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              icon,
              size: 18,
              color: isActive
                  ? const Color(AppConstants.primaryBlue)
                  : const Color(AppConstants.textGray),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: TextField(
              controller: ctrl,
              keyboardType: keyboardType,
              textInputAction: textInputAction,
              onTap: onTap,
              onChanged: onChanged,
              style: GoogleFonts.inter(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: const Color(AppConstants.primaryDark),
              ),
              decoration: InputDecoration(
                labelText: label,
                labelStyle: GoogleFonts.inter(
                  fontSize: 13,
                  color: isActive
                      ? const Color(AppConstants.primaryBlue)
                      : const Color(AppConstants.textGray),
                  fontWeight: FontWeight.w500,
                ),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 16),
                focusedBorder: InputBorder.none,
                enabledBorder: InputBorder.none,
              ),
            ),
          ),
          if (ctrl.text.isNotEmpty)
            Icon(
              Icons.edit_rounded,
              size: 16,
              color: isActive
                  ? const Color(AppConstants.primaryBlue)
                  : const Color(AppConstants.borderColor),
            ),
        ],
      ),
    );
  }
}

// ─── Security Tile ──────────────────────────────────────────────────

class _SecurityTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _SecurityTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon,
                  size: 20, color: const Color(AppConstants.primaryBlue)),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: const Color(AppConstants.primaryDark),
                      )),
                  Text(subtitle,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: const Color(AppConstants.textGray),
                        fontWeight: FontWeight.w500,
                      )),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded,
                color: Color(AppConstants.borderColor), size: 20),
          ],
        ),
      ),
    );
  }
}
