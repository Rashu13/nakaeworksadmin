import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../controllers/coupons_controller.dart';
import '../../../../core/theme/app_theme.dart';

class CouponsView extends GetView<CouponsController> {
  const CouponsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Title and Add Action
        Padding(
          padding: const EdgeInsets.only(left: 24, right: 24, top: 24),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Promotional Coupons',
                    style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    'Configure customer promotional coupon codes and fixed/percentage values.',
                    style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textGray),
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: () => _showAddCouponDialog(context),
                icon: const Icon(LucideIcons.plus, size: 16),
                label: const Text('Add Coupon'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accentBlue,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // List
        Expanded(
          child: Obx(() {
            if (controller.isLoading.value) {
              return const Center(child: CircularProgressIndicator(color: AppTheme.accentBlue));
            }

            if (controller.coupons.isEmpty) {
              return Center(
                child: Text('No active coupons found.', style: GoogleFonts.inter(color: AppTheme.textGray)),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              itemCount: controller.coupons.length,
              itemBuilder: (context, index) {
                final coupon = controller.coupons[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    leading: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.bgLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(LucideIcons.ticket, color: AppTheme.accentBlue, size: 24),
                    ),
                    title: Row(
                      children: [
                        Text(
                          coupon.code,
                          style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 17, letterSpacing: 1.1),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.accentBlue.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            coupon.discountType == 'percentage'
                                ? '${coupon.discountValue.toStringAsFixed(0)}% Off'
                                : '₹${coupon.discountValue.toStringAsFixed(0)} Off',
                            style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.accentBlue),
                          ),
                        ),
                      ],
                    ),
                    subtitle: Text(
                      'Min Order: ₹${coupon.minAmount.toStringAsFixed(0)} • Usage Limit: ${coupon.usageLimit}\nMax Discount: ₹${coupon.maxDiscount.toStringAsFixed(0)}',
                      style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textGray),
                    ),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Switch(
                          value: coupon.status,
                          activeColor: AppTheme.statusCompleted,
                          onChanged: (val) async {
                            final success = await controller.toggleCouponStatus(coupon.id, val);
                            if (success) {
                              Get.snackbar('Success', 'Coupon status updated', backgroundColor: AppTheme.statusCompleted, colorText: Colors.white);
                            }
                          },
                        ),
                        const SizedBox(width: 8),
                        IconButton(
                          icon: const Icon(LucideIcons.trash2, size: 18, color: Colors.redAccent),
                          onPressed: () => _confirmDelete(context, coupon.id, coupon.code),
                        ),
                      ],
                    ),
                  ),
                );
              },
            );
          }),
        ),
      ],
    );
  }

  void _showAddCouponDialog(BuildContext context) {
    final codeCtrl = TextEditingController();
    final valueCtrl = TextEditingController();
    final minCtrl = TextEditingController();
    final maxCtrl = TextEditingController();
    final limitCtrl = TextEditingController();
    String discountType = 'percentage';

    Get.dialog(
      AlertDialog(
        title: const Text('Create Coupon'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: codeCtrl, decoration: const InputDecoration(hintText: 'Coupon Code (e.g. WELCOME50)')),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: discountType,
                items: const [
                  DropdownMenuItem(value: 'percentage', child: Text('Percentage (%)')),
                  DropdownMenuItem(value: 'fixed', child: Text('Fixed Amount (₹)')),
                ],
                onChanged: (val) {
                  if (val != null) discountType = val;
                },
                decoration: const InputDecoration(hintText: 'Discount Type'),
              ),
              const SizedBox(height: 12),
              TextField(controller: valueCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(hintText: 'Discount Value')),
              const SizedBox(height: 12),
              TextField(controller: minCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(hintText: 'Minimum Booking Amount')),
              const SizedBox(height: 12),
              TextField(controller: maxCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(hintText: 'Maximum Discount (For Percent)')),
              const SizedBox(height: 12),
              TextField(controller: limitCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(hintText: 'Usage Limit per User')),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (codeCtrl.text.isEmpty || valueCtrl.text.isEmpty) return;
              final data = {
                'code': codeCtrl.text.trim().toUpperCase(),
                'discountType': discountType,
                'discountValue': double.tryParse(valueCtrl.text) ?? 0.0,
                'minAmount': double.tryParse(minCtrl.text) ?? 0.0,
                'maxDiscount': double.tryParse(maxCtrl.text) ?? 0.0,
                'usageLimit': int.tryParse(limitCtrl.text) ?? 1,
                'status': true,
              };
              final success = await controller.createCoupon(data);
              Get.back();
              if (success) {
                Get.snackbar('Success', 'Coupon created successfully', backgroundColor: AppTheme.statusCompleted, colorText: Colors.white);
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accentBlue, foregroundColor: Colors.white),
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(BuildContext context, int id, String code) {
    Get.dialog(
      AlertDialog(
        title: const Text('Delete Coupon'),
        content: Text('Are you sure you want to delete coupon "$code"?'),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final success = await controller.deleteCoupon(id);
              Get.back();
              if (success) {
                Get.snackbar('Success', 'Coupon deleted successfully', backgroundColor: AppTheme.statusCompleted, colorText: Colors.white);
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, foregroundColor: Colors.white),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}
