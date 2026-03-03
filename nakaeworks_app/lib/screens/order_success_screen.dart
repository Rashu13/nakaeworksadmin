import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/order_model.dart';
import '../utils/constants.dart';
import 'orders_screen.dart';

class OrderSuccessScreen extends StatefulWidget {
  final OrderModel order;

  const OrderSuccessScreen({super.key, required this.order});

  @override
  State<OrderSuccessScreen> createState() => _OrderSuccessScreenState();
}

class _OrderSuccessScreenState extends State<OrderSuccessScreen>
    with TickerProviderStateMixin {
  late AnimationController _checkCtrl;
  late AnimationController _slideCtrl;
  late Animation<double> _scaleAnim;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();

    _checkCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _slideCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );

    _scaleAnim = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _checkCtrl, curve: Curves.easeOutBack),
    );
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _slideCtrl, curve: Curves.easeOutCubic));

    Future.delayed(const Duration(milliseconds: 200), () {
      if (mounted) _checkCtrl.forward();
    });
    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted) _slideCtrl.forward();
    });
  }

  @override
  void dispose() {
    _checkCtrl.dispose();
    _slideCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final order = widget.order;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              children: [
                const SizedBox(height: 60),

                // ── Animated Check ──────────────────────────────────
                ScaleTransition(
                  scale: _scaleAnim,
                  child: Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      color: const Color(0xFFDCFCE7),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF16A34A).withValues(alpha: 0.2),
                          blurRadius: 30,
                          spreadRadius: 10,
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.check_rounded,
                      size: 60,
                      color: Color(0xFF16A34A),
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // ── Title ───────────────────────────────────────────
                SlideTransition(
                  position: _slideAnim,
                  child: FadeTransition(
                    opacity: _slideCtrl,
                    child: Column(
                      children: [
                        Text(
                          'Order Confirmed!',
                          style: GoogleFonts.inter(
                            fontSize: 30,
                            fontWeight: FontWeight.w900,
                            color: const Color(AppConstants.primaryDark),
                            letterSpacing: -1,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          'Your booking has been placed successfully.\nOur team will reach out to you shortly.',
                          style: GoogleFonts.inter(
                            fontSize: 15,
                            color: const Color(AppConstants.textGray),
                            height: 1.6,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // ── Booking ID ──────────────────────────────────────
                SlideTransition(
                  position: _slideAnim,
                  child: FadeTransition(
                    opacity: _slideCtrl,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 24, vertical: 16),
                      decoration: BoxDecoration(
                        color: const Color(AppConstants.bgLight),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                            color: const Color(AppConstants.borderColor)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.receipt_long_rounded,
                              size: 20,
                              color: Color(AppConstants.primaryBlue)),
                          const SizedBox(width: 10),
                          Text(
                            'Booking ID: ',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              color: const Color(AppConstants.textGray),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            order.id,
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.w900,
                              color: const Color(AppConstants.primaryBlue),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // ── Summary Card ────────────────────────────────────
                SlideTransition(
                  position: _slideAnim,
                  child: FadeTransition(
                    opacity: _slideCtrl,
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(
                            color: const Color(AppConstants.borderColor)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.04),
                            blurRadius: 16,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'BOOKING DETAILS',
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              fontWeight: FontWeight.w900,
                              color: const Color(AppConstants.textGray),
                              letterSpacing: 1.5,
                            ),
                          ),
                          const SizedBox(height: 16),
                          _detailRow(
                            icon: Icons.calendar_today_rounded,
                            label: 'Date',
                            value: _formatDate(order.serviceDate),
                          ),
                          const SizedBox(height: 14),
                          _detailRow(
                            icon: Icons.access_time_rounded,
                            label: 'Time Slot',
                            value: order.timeSlot,
                          ),
                          const SizedBox(height: 14),
                          _detailRow(
                            icon: Icons.location_on_rounded,
                            label: 'Address',
                            value: order.address,
                          ),
                          const SizedBox(height: 14),
                          _detailRow(
                            icon: Icons.payments_outlined,
                            label: 'Payment',
                            value: 'Pay at Service Time',
                          ),
                          const SizedBox(height: 14),
                          _detailRow(
                            icon: Icons.currency_rupee_rounded,
                            label: 'Total Amount',
                            value: '₹${order.totalAmount.toStringAsFixed(0)}',
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // ── Action Buttons ──────────────────────────────────
                SlideTransition(
                  position: _slideAnim,
                  child: FadeTransition(
                    opacity: _slideCtrl,
                    child: Column(
                      children: [
                        GestureDetector(
                          onTap: () {
                            Navigator.of(context).pushNamedAndRemoveUntil(
                                '/home', (_) => false);
                          },
                          child: Container(
                            height: 60,
                            decoration: BoxDecoration(
                              color: const Color(AppConstants.primaryDark),
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(AppConstants.primaryDark)
                                      .withValues(alpha: 0.3),
                                  blurRadius: 12,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Center(
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.home_rounded,
                                      color: Colors.white, size: 20),
                                  const SizedBox(width: 10),
                                  Text(
                                    'BACK TO HOME',
                                    style: GoogleFonts.inter(
                                      color: Colors.white,
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
                        const SizedBox(height: 14),
                        GestureDetector(
                          onTap: () {
                            Navigator.of(context).pushNamedAndRemoveUntil(
                                '/home', (_) => false);
                            Navigator.of(context).push(MaterialPageRoute(
                              builder: (_) => const OrdersScreen(),
                            ));
                          },
                          child: Container(
                            height: 54,
                            decoration: BoxDecoration(
                              color: const Color(AppConstants.bgLight),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                  color: const Color(AppConstants.borderColor)),
                            ),
                            child: Center(
                              child: Text(
                                'VIEW MY ORDERS',
                                style: GoogleFonts.inter(
                                  color: const Color(AppConstants.primaryBlue),
                                  fontWeight: FontWeight.w800,
                                  fontSize: 14,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _detailRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: const Color(AppConstants.bgLight),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon,
              size: 18, color: const Color(AppConstants.primaryBlue)),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: const Color(AppConstants.textGray),
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.5,
                  )),
              const SizedBox(height: 2),
              Text(value,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: const Color(AppConstants.primaryDark),
                  )),
            ],
          ),
        ),
      ],
    );
  }

  String _formatDate(DateTime date) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const days = [
      'Monday', 'Tuesday', 'Wednesday',
      'Thursday', 'Friday', 'Saturday', 'Sunday'
    ];
    return '${days[date.weekday - 1]}, ${date.day} ${months[date.month - 1]} ${date.year}';
  }
}
