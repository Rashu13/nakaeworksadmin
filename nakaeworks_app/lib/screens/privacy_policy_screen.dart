import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../utils/constants.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('Privacy Policy', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(AppConstants.primaryDark),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _section('1. Introduction', 'Welcome to Nakaeworks. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.'),
            _section('2. Information We Collect', 'We collect personal information that you provide to us such as name, address, contact information, passwords and security data, and payment information.'),
            _section('3. How We Use Your Information', 'We use personal information collected via our App for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.'),
            _section('4. Sharing Your Information', 'We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.'),
            _section('5. Security of Your Information', 'We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.'),
          ],
        ),
      ),
    );
  }

  Widget _section(String title, String content) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: const Color(AppConstants.primaryDark))),
        const SizedBox(height: 8),
        Text(content, style: GoogleFonts.inter(fontSize: 14, color: const Color(AppConstants.textGray), height: 1.5)),
        const SizedBox(height: 24),
      ],
    );
  }
}
