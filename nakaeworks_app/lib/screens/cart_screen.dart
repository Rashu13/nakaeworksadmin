import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../providers/cart_provider.dart';
import '../utils/constants.dart';
import 'checkout_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final _couponCtrl = TextEditingController();
  String? _couponError;

  @override
  void dispose() {
    _couponCtrl.dispose();
    super.dispose();
  }

  Future<void> _applyCoupon(CartProvider cart) async {
    final code = _couponCtrl.text.trim();
    if (code.isEmpty) return;

    final result = await cart.applyCoupon(code);
    if (result['isValid'] == true) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Coupon applied!'), backgroundColor: Colors.green),
      );
      setState(() => _couponError = null);
    } else {
      setState(() => _couponError = result['message']);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(AppConstants.bgLight),
      body: SafeArea(
        child: Consumer<CartProvider>(
          builder: (context, cart, _) {
            return Column(
              children: [
                // Header
                Container(
                  color: Colors.white,
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
                  child: Row(
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'SHOPPING BAG',
                            style: GoogleFonts.inter(
                              fontSize: 24,
                              fontWeight: FontWeight.w900,
                              color: const Color(AppConstants.primaryDark),
                              letterSpacing: -0.5,
                            ),
                          ),
                          Text(
                            '${cart.totalItems} items in protocol',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              color: const Color(AppConstants.textGray),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: cart.items.isEmpty
                      ? _buildEmpty(context)
                      : Stack(
                          children: [
                            ListView.builder(
                              padding:
                                  const EdgeInsets.fromLTRB(20, 16, 20, 220),
                              itemCount: cart.items.length,
                              itemBuilder: (context, index) =>
                                  _CartItem(item: cart.items[index]),
                            ),
                            Positioned(
                              bottom: 0,
                              left: 0,
                              right: 0,
                              child: _buildFooter(context, cart),
                            ),
                          ],
                        ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildEmpty(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.shopping_bag_outlined,
                size: 64, color: Colors.grey.shade300),
            const SizedBox(height: 24),
            Text(
              'YOUR BAG IS EMPTY',
              style: GoogleFonts.inter(
                fontSize: 20,
                fontWeight: FontWeight.w900,
                color: const Color(AppConstants.primaryDark),
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Add some professional services to your cart.',
              style: GoogleFonts.inter(
                fontSize: 13,
                color: const Color(AppConstants.textGray),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCouponSection(CartProvider cart) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(AppConstants.bgLight),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: cart.appliedCoupon != null ? Colors.green : (_couponError != null ? Colors.red : const Color(AppConstants.borderColor)),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _couponCtrl,
              enabled: cart.appliedCoupon == null,
              decoration: InputDecoration(
                hintText: 'Promo Code',
                hintStyle: GoogleFonts.inter(fontSize: 13, color: const Color(AppConstants.textGray)),
                border: InputBorder.none,
                errorText: _couponError,
                isDense: true,
              ),
              style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13),
            ),
          ),
          if (cart.appliedCoupon != null)
            GestureDetector(
              onTap: () {
                cart.removeCoupon();
                _couponCtrl.clear();
                setState(() => _couponError = null);
              },
              child: const Icon(Icons.close_rounded, color: Colors.red, size: 20),
            )
          else
            cart.isValidating
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : GestureDetector(
                    onTap: () => _applyCoupon(cart),
                    child: Text(
                      'APPLY',
                      style: GoogleFonts.inter(
                        color: const Color(AppConstants.primaryBlue),
                        fontWeight: FontWeight.w900,
                        fontSize: 13,
                      ),
                    ),
                  ),
        ],
      ),
    );
  }

  Widget _buildFooter(BuildContext context, CartProvider cart) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius:
            const BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, -10),
          ),
        ],
      ),
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildCouponSection(cart),
          const SizedBox(height: 20),
          _summaryRow('Subtotal', '₹${cart.subtotal.toStringAsFixed(0)}'),
          if (cart.discountAmount > 0) ...[
            const SizedBox(height: 8),
            _summaryRow(
              'Coupon Discount',
              '- ₹${cart.discountAmount.toStringAsFixed(0)}',
              valueColor: const Color(0xFF16A34A),
            ),
          ],
          const SizedBox(height: 8),
          _summaryRow('Service Fee', '₹0'),
          const Divider(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'TOTAL',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  color: const Color(AppConstants.textGray),
                  letterSpacing: 1,
                ),
              ),
              Text(
                '₹${cart.totalAmount.toStringAsFixed(0)}',
                style: GoogleFonts.inter(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: const Color(AppConstants.primaryBlue),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const CheckoutScreen()),
            ),
            child: Container(
              height: 60,
              decoration: BoxDecoration(
                color: const Color(0xFF0A2357),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF0A2357).withOpacity(0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'CONFIRM ORDER',
                    style: GoogleFonts.inter(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                      fontSize: 15,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Icon(Icons.arrow_forward_rounded,
                      color: Colors.white, size: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _summaryRow(String label, String value, {Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label,
            style: GoogleFonts.inter(
                fontSize: 14,
                color: const Color(AppConstants.textGray),
                fontWeight: FontWeight.w600)),
        Text(value,
            style: GoogleFonts.inter(
                fontSize: 14,
                color: valueColor ?? const Color(AppConstants.primaryDark),
                fontWeight: FontWeight.w900)),
      ],
    );
  }
}

class _CartItem extends StatelessWidget {
  final CartItem item;
  const _CartItem({required this.item});

  @override
  Widget build(BuildContext context) {
    final thumb = item.service.thumbnail != null
        ? (item.service.thumbnail!.startsWith('http')
            ? item.service.thumbnail!
            : '${AppConstants.baseUrl}${item.service.thumbnail}')
        : 'https://images.unsplash.com/photo-1581578731117-104f8a746950?w=400';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(AppConstants.borderColor)),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: CachedNetworkImage(
              imageUrl: thumb,
              width: 80,
              height: 80,
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.service.name,
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: const Color(AppConstants.primaryDark),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  '₹${item.service.discountedPrice.toStringAsFixed(0)}',
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: const Color(AppConstants.primaryBlue),
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _QtyControl(item: item),
                    const Spacer(),
                    GestureDetector(
                      onTap: () => context
                          .read<CartProvider>()
                          .removeFromCart(item.service.id),
                      child: const Icon(Icons.delete_outline_rounded,
                          color: Color(0xFFEF4444), size: 22),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _QtyControl extends StatelessWidget {
  final CartItem item;
  const _QtyControl({required this.item});

  @override
  Widget build(BuildContext context) {
    final cart = context.read<CartProvider>();
    return Container(
      decoration: BoxDecoration(
        color: const Color(AppConstants.bgLight),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(AppConstants.borderColor)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _btn(Icons.remove, () => cart.updateQuantity(item.service.id, -1)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Text(
              '${item.quantity}',
              style: GoogleFonts.inter(
                  fontSize: 14, fontWeight: FontWeight.w900),
            ),
          ),
          _btn(Icons.add, () => cart.updateQuantity(item.service.id, 1)),
        ],
      ),
    );
  }

  Widget _btn(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 30,
        height: 30,
        margin: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, size: 14, color: const Color(AppConstants.textGray)),
      ),
    );
  }
}
