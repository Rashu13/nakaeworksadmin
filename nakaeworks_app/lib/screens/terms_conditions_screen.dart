import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../utils/constants.dart';

class TermsConditionsScreen extends StatelessWidget {
  const TermsConditionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('Terms & Conditions', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(AppConstants.primaryDark),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _section('1. Agreement to Terms', 'These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and Nakaeworks (“we,” “us” or “our”), concerning your access to and use of our mobile application.'),
            _section('2. Intellectual Property Rights', 'Unless otherwise indicated, the App is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the App (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us.'),
            _section('3. User Representations', 'By using the App, you represent and warrant that all registration information you submit will be true, accurate, current, and complete.'),
            _section('4. Prohibited Activities', 'You may not access or use the App for any purpose other than that for which we make the App available.'),
            _section('5. Term and Termination', 'These Terms of Use shall remain in full force and effect while you use the App.'),
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
