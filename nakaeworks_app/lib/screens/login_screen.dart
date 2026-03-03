import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  // Tab: 'otp' or 'email'
  String _authMode = 'otp';

  // Email login
  final _emailController = TextEditingController(text: 'user@test.com');
  final _passwordController = TextEditingController(text: 'Password123@');
  bool _obscurePassword = true;

  // OTP login
  final _phoneController = TextEditingController();
  final List<TextEditingController> _otpControllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _otpFocusNodes =
      List.generate(6, (_) => FocusNode());
  bool _otpSent = false;
  int _countdown = 0;

  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _startCountdownTimer();
  }

  void _startCountdownTimer() {
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return false;
      if (_countdown > 0) setState(() => _countdown--);
      return mounted;
    });
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _phoneController.dispose();
    for (final c in _otpControllers) {
      c.dispose();
    }
    for (final f in _otpFocusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  // ── Email Login ──────────────────────────────────────────────
  Future<void> _handleEmailLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();
    if (email.isEmpty || password.isEmpty) {
      setState(() => _error = 'Please enter email and password');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    final auth = context.read<AuthProvider>();
    final success = await auth.login(email, password);
    if (!mounted) return;
    setState(() => _loading = false);
    if (success) {
      Navigator.of(context).pushReplacementNamed('/home');
    } else {
      setState(() => _error = auth.error ?? 'Login failed');
    }
  }

  // ── OTP flow ─────────────────────────────────────────────────
  Future<void> _handleSendOtp() async {
    final phone = _phoneController.text.trim();
    if (phone.length != 10) {
      setState(() => _error = 'Please enter a valid 10-digit phone number');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await ApiService.sendOtp(phone);
      if (!mounted) return;
      setState(() {
        _otpSent = true;
        _countdown = 30;
        _loading = false;
        for (final c in _otpControllers) {
          c.clear();
        }
      });
      Future.delayed(const Duration(milliseconds: 100),
          () => _otpFocusNodes[0].requestFocus());
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
        _loading = false;
      });
    }
  }

  Future<void> _handleVerifyOtp() async {
    final otp = _otpControllers.map((c) => c.text).join();
    if (otp.length != 6) return;
    final phone = _phoneController.text.trim();
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await ApiService.verifyOtp(phone, otp);
      if (!mounted) return;
      // Save user in provider
      final auth = context.read<AuthProvider>();
      await auth.checkLoginStatus();
      if (!mounted) return;
      Navigator.of(context).pushReplacementNamed('/home');
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
        _loading = false;
        for (final c in _otpControllers) {
          c.clear();
        }
      });
      _otpFocusNodes[0].requestFocus();
    }
  }

  void _onOtpChanged(int index, String value) {
    if (value.isNotEmpty && index < 5) {
      _otpFocusNodes[index + 1].requestFocus();
    }
    // Auto verify when last digit entered
    if (index == 5 && value.isNotEmpty) {
      final otp = _otpControllers.map((c) => c.text).join();
      if (otp.length == 6) _handleVerifyOtp();
    }
  }

  // ── Quick fill dummy credentials ────────────────────────────
  void _fillDummy(String role) {
    setState(() {
      _authMode = 'email';
      _error = null;
      if (role == 'user') {
        _emailController.text = 'user@test.com';
      } else if (role == 'provider') {
        _emailController.text = 'provider@test.com';
      } else {
        _emailController.text = 'admin@test.com';
      }
      _passwordController.text = 'Password123@';
    });
  }

  // ── UI ───────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 52),
              _buildLogo(),
              const SizedBox(height: 40),
              _buildCard(),
              const SizedBox(height: 24),
              _buildSignUpRow(),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLogo() {
    return Column(
      children: [
        Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            color: const Color(AppConstants.primaryDark),
            borderRadius: BorderRadius.circular(22),
            boxShadow: [
              BoxShadow(
                color: const Color(AppConstants.primaryDark).withOpacity(0.3),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Center(
            child: Text(
              'N',
              style: GoogleFonts.inter(
                fontSize: 36,
                fontWeight: FontWeight.w900,
                color: Colors.white,
              ),
            ),
          ),
        ),
        const SizedBox(height: 14),
        RichText(
          text: TextSpan(children: [
            TextSpan(
              text: 'Nakae',
              style: GoogleFonts.inter(
                fontSize: 28,
                fontWeight: FontWeight.w900,
                color: const Color(AppConstants.primaryDark),
              ),
            ),
            TextSpan(
              text: 'Works',
              style: GoogleFonts.inter(
                fontSize: 28,
                fontWeight: FontWeight.w900,
                color: const Color(AppConstants.primaryBlue),
              ),
            ),
          ]),
        ),
        const SizedBox(height: 6),
        Text(
          'Welcome back',
          style: GoogleFonts.inter(
            fontSize: 15,
            color: const Color(AppConstants.textGray),
          ),
        ),
      ],
    );
  }

  Widget _buildCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(AppConstants.borderColor)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ── Tab Toggle ─────────────────────────────────────
          _buildTabToggle(),
          const SizedBox(height: 24),

          // ── Error ──────────────────────────────────────────
          if (_error != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFFECACA)),
              ),
              child: Text(
                _error!,
                style: GoogleFonts.inter(
                  color: const Color(0xFFDC2626),
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],

          // ── Tab Content ────────────────────────────────────
          _authMode == 'otp' ? _buildOtpSection() : _buildEmailSection(),
        ],
      ),
    );
  }

  Widget _buildTabToggle() {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: const Color(AppConstants.bgLight),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          _tabButton('otp', Icons.phone_android_rounded, 'Phone OTP'),
          _tabButton('email', Icons.mail_outline_rounded, 'Email'),
        ],
      ),
    );
  }

  Widget _tabButton(String mode, IconData icon, String label) {
    final isActive = _authMode == mode;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() {
          _authMode = mode;
          _error = null;
        }),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isActive ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.07),
                      blurRadius: 8,
                    )
                  ]
                : [],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 16,
                color: isActive
                    ? const Color(AppConstants.primaryBlue)
                    : const Color(AppConstants.textGray),
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight:
                      isActive ? FontWeight.w700 : FontWeight.w500,
                  color: isActive
                      ? const Color(AppConstants.primaryBlue)
                      : const Color(AppConstants.textGray),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── OTP Section ──────────────────────────────────────────────
  Widget _buildOtpSection() {
    if (!_otpSent) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Phone Number',
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: const Color(AppConstants.primaryDark),
            ),
          ),
          const SizedBox(height: 8),
          _buildPhoneField(),
          const SizedBox(height: 20),
          _buildPrimaryButton(
            label: 'Send OTP',
            onTap: _loading ? null : _handleSendOtp,
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'OTP sent to +91 ${_phoneController.text}',
          textAlign: TextAlign.center,
          style: GoogleFonts.inter(
            fontSize: 13,
            color: const Color(AppConstants.textGray),
          ),
        ),
        const SizedBox(height: 20),
        _buildOtpBoxes(),
        const SizedBox(height: 20),
        _buildPrimaryButton(
          label: 'Verify OTP',
          onTap: _loading ? null : _handleVerifyOtp,
        ),
        const SizedBox(height: 14),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextButton(
              onPressed: () => setState(() {
                _otpSent = false;
                _error = null;
              }),
              child: Text(
                'Change Number',
                style: GoogleFonts.inter(
                  color: const Color(AppConstants.primaryBlue),
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
            ),
            if (_countdown > 0) ...[
              Text(
                '  •  Resend in ${_countdown}s',
                style: GoogleFonts.inter(
                  color: const Color(AppConstants.textGray),
                  fontSize: 13,
                ),
              ),
            ] else ...[
              TextButton(
                onPressed: _loading ? null : _handleSendOtp,
                child: Text(
                  'Resend OTP',
                  style: GoogleFonts.inter(
                    color: const Color(AppConstants.primaryBlue),
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ],
        ),
      ],
    );
  }

  Widget _buildPhoneField() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(AppConstants.bgLight),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(AppConstants.borderColor)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
            child: Text(
              '+91',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                color: const Color(AppConstants.primaryDark),
                fontSize: 15,
              ),
            ),
          ),
          Container(width: 1, height: 24, color: const Color(AppConstants.borderColor)),
          Expanded(
            child: TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(10),
              ],
              style: GoogleFonts.inter(
                color: const Color(AppConstants.primaryDark),
                fontSize: 15,
                fontWeight: FontWeight.w500,
              ),
              decoration: InputDecoration(
                hintText: '9876543210',
                hintStyle: GoogleFonts.inter(
                    color: const Color(AppConstants.textGray).withOpacity(0.6)),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOtpBoxes() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: List.generate(6, (i) {
        return SizedBox(
          width: 46,
          height: 54,
          child: Container(
            decoration: BoxDecoration(
              color: const Color(AppConstants.bgLight),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(AppConstants.borderColor)),
            ),
            child: TextField(
              controller: _otpControllers[i],
              focusNode: _otpFocusNodes[i],
              textAlign: TextAlign.center,
              keyboardType: TextInputType.number,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(1),
              ],
              style: GoogleFonts.inter(
                fontSize: 20,
                fontWeight: FontWeight.w900,
                color: const Color(AppConstants.primaryDark),
              ),
              decoration: const InputDecoration(border: InputBorder.none),
              onChanged: (v) => _onOtpChanged(i, v),
            ),
          ),
        );
      }),
    );
  }

  // ── Email Section ────────────────────────────────────────────
  Widget _buildEmailSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Quick fill buttons
        Row(
          children: [
            _quickFillBtn('👤 User', 'user'),
            const SizedBox(width: 8),
            _quickFillBtn('💼 Provider', 'provider'),
            const SizedBox(width: 8),
            _quickFillBtn('🛡️ Admin', 'admin'),
          ],
        ),
        const SizedBox(height: 20),

        // Email
        Text(
          'Email address',
          style: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: const Color(AppConstants.primaryDark),
          ),
        ),
        const SizedBox(height: 8),
        _buildInputField(
          controller: _emailController,
          hint: 'name@example.com',
          icon: Icons.mail_outline_rounded,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 16),

        // Password
        Text(
          'Password',
          style: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: const Color(AppConstants.primaryDark),
          ),
        ),
        const SizedBox(height: 8),
        _buildInputField(
          controller: _passwordController,
          hint: '••••••••',
          icon: Icons.lock_outline_rounded,
          obscure: _obscurePassword,
          suffixIcon: GestureDetector(
            onTap: () => setState(() => _obscurePassword = !_obscurePassword),
            child: Icon(
              _obscurePassword
                  ? Icons.visibility_outlined
                  : Icons.visibility_off_outlined,
              color: const Color(AppConstants.textGray),
              size: 20,
            ),
          ),
        ),
        const SizedBox(height: 20),

        _buildPrimaryButton(
          label: 'Sign In',
          onTap: _loading ? null : _handleEmailLogin,
        ),
      ],
    );
  }

  Widget _quickFillBtn(String label, String role) {
    return Expanded(
      child: GestureDetector(
        onTap: () => _fillDummy(role),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: const Color(AppConstants.bgLight),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(AppConstants.borderColor)),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: const Color(AppConstants.primaryDark),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPrimaryButton({required String label, VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: 52,
        decoration: BoxDecoration(
          color: onTap == null
              ? const Color(AppConstants.primaryDark).withOpacity(0.5)
              : const Color(AppConstants.primaryDark),
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: const Color(AppConstants.primaryDark).withOpacity(0.25),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Center(
          child: _loading
              ? const SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(
                      color: Colors.white, strokeWidth: 2),
                )
              : Text(
                  label,
                  style: GoogleFonts.inter(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),
        ),
      ),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    bool obscure = false,
    Widget? suffixIcon,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(AppConstants.bgLight),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(AppConstants.borderColor)),
      ),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        obscureText: obscure,
        style: GoogleFonts.inter(
          color: const Color(AppConstants.primaryDark),
          fontSize: 15,
          fontWeight: FontWeight.w500,
        ),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: GoogleFonts.inter(
              color: const Color(AppConstants.textGray).withOpacity(0.6)),
          prefixIcon:
              Icon(icon, color: const Color(AppConstants.textGray), size: 20),
          suffixIcon: suffixIcon,
          border: InputBorder.none,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        ),
      ),
    );
  }

  Widget _buildSignUpRow() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          "Don't have an account? ",
          style: GoogleFonts.inter(
            color: const Color(AppConstants.textGray),
            fontSize: 14,
          ),
        ),
        GestureDetector(
          onTap: () {},
          child: Text(
            'Sign up',
            style: GoogleFonts.inter(
              color: const Color(AppConstants.primaryBlue),
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
        ),
      ],
    );
  }
}
