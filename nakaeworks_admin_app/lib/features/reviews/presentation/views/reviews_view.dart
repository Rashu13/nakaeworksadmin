import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../controllers/reviews_controller.dart';
import '../../../../core/theme/app_theme.dart';

class ReviewsView extends GetView<ReviewsController> {
  const ReviewsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Title
        Padding(
          padding: const EdgeInsets.only(left: 24, right: 24, top: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Customer Reviews',
                style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              Text(
                'View ratings and feedback submitted by consumers for services completed.',
                style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textGray),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // List
        Expanded(
          child: Obx(() {
            if (controller.isLoading.value) {
              return const Center(child: CircularProgressIndicator(color: AppTheme.accentBlue));
            }

            if (controller.reviews.isEmpty) {
              return Center(
                child: Text('No reviews submitted yet.', style: GoogleFonts.inter(color: AppTheme.textGray)),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              itemCount: controller.reviews.length,
              itemBuilder: (context, index) {
                final review = controller.reviews[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              review.consumerName,
                              style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            Text(
                              DateFormat('dd MMM yyyy').format(review.createdAt),
                              style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textGray),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: List.generate(5, (starIdx) {
                            return Icon(
                              starIdx < review.rating ? LucideIcons.star : LucideIcons.star,
                              color: starIdx < review.rating ? Colors.amber : AppTheme.borderLight,
                              size: 16,
                            );
                          }),
                        ),
                        if (review.comment != null && review.comment!.isNotEmpty) ...[
                          const SizedBox(height: 10),
                          Text(
                            '"${review.comment}"',
                            style: GoogleFonts.inter(fontSize: 14, fontStyle: FontStyle.italic, color: AppTheme.textDark),
                          ),
                        ],
                        const Divider(color: AppTheme.borderLight, height: 24),
                        Row(
                          children: [
                            Icon(LucideIcons.scissors, size: 14, color: AppTheme.textGray),
                            const SizedBox(width: 4),
                            Text(
                              'Service: ${review.serviceName}',
                              style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.textGray),
                            ),
                            const Spacer(),
                            Icon(LucideIcons.user, size: 14, color: AppTheme.textGray),
                            const SizedBox(width: 4),
                            Text(
                              'Provider: ${review.providerName}',
                              style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.textGray),
                            ),
                          ],
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
}
