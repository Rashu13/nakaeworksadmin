import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:provider/provider.dart';
import '../models/service_model.dart';
import '../providers/cart_provider.dart';
import '../providers/favorites_provider.dart';
import '../utils/constants.dart';

class ServiceDetailScreen extends StatelessWidget {
  final ServiceModel service;

  const ServiceDetailScreen({super.key, required this.service});

  @override
  Widget build(BuildContext context) {
    final thumb = service.thumbnail != null
        ? (service.thumbnail!.startsWith('http')
            ? service.thumbnail!
            : '${AppConstants.baseUrl}${service.thumbnail}')
        : 'https://images.unsplash.com/photo-1581578731117-104f8a746950?w=800';

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          // ── Hero Image App Bar ──────────────────────────────
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            backgroundColor: const Color(AppConstants.primaryDark),
            leading: GestureDetector(
              onTap: () => Navigator.of(context).pop(),
              child: Container(
                margin: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.4),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.arrow_back_ios_new_rounded,
                    color: Colors.white, size: 18),
              ),
            ),
            actions: [
              Consumer<FavoritesProvider>(
                builder: (context, favs, _) {
                  final isFav = favs.isFavorite(service.id);
                  return GestureDetector(
                    onTap: () => favs.toggle(service),
                    child: Container(
                      margin: const EdgeInsets.all(8),
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.4),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        isFav
                            ? Icons.favorite_rounded
                            : Icons.favorite_border_rounded,
                        color: isFav
                            ? const Color(0xFFEF4444)
                            : Colors.white,
                        size: 20,
                      ),
                    ),
                  );
                },
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  CachedNetworkImage(
                    imageUrl: thumb,
                    fit: BoxFit.cover,
                    placeholder: (_, __) => Container(
                      color: const Color(AppConstants.bgLight),
                      child: const Center(
                        child: CircularProgressIndicator(
                          color: Color(AppConstants.primaryBlue),
                          strokeWidth: 2,
                        ),
                      ),
                    ),
                    errorWidget: (_, __, ___) => Container(
                      color: const Color(AppConstants.bgLight),
                      child: const Icon(Icons.home_repair_service_rounded,
                          size: 60, color: Color(AppConstants.primaryBlue)),
                    ),
                  ),
                  // gradient overlay
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.55),
                        ],
                      ),
                    ),
                  ),
                  // Category badge
                  if (service.category != null)
                    Positioned(
                      bottom: 16,
                      left: 16,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 5),
                        decoration: BoxDecoration(
                          color: const Color(AppConstants.primaryBlue),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          service.category!.toUpperCase(),
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                            letterSpacing: 1,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),

          // ── Content ─────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Name + Rating row
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          service.name,
                          style: GoogleFonts.inter(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            color: const Color(AppConstants.primaryDark),
                            height: 1.2,
                          ),
                        ),
                      ),
                      if (service.rating != null && service.rating! > 0) ...[
                        const SizedBox(width: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFFBEB),
                            borderRadius: BorderRadius.circular(12),
                            border:
                                Border.all(color: const Color(0xFFFDE68A)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.star_rounded,
                                  color: Color(0xFFFBBF24), size: 16),
                              const SizedBox(width: 4),
                              Text(
                                service.rating!.toStringAsFixed(1),
                                style: GoogleFonts.inter(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                  color: const Color(0xFF92400E),
                                ),
                              ),
                              if (service.reviewCount != null &&
                                  service.reviewCount! > 0) ...[
                                Text(
                                  ' (${service.reviewCount})',
                                  style: GoogleFonts.inter(
                                    fontSize: 11,
                                    color: const Color(0xFFB45309),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Price section
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(AppConstants.bgLight),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                          color: const Color(AppConstants.borderColor)),
                    ),
                    child: Row(
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Service Price',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                color: const Color(AppConstants.textGray),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  '₹${service.discountedPrice.toStringAsFixed(0)}',
                                  style: GoogleFonts.inter(
                                    fontSize: 28,
                                    fontWeight: FontWeight.w900,
                                    color: const Color(AppConstants.primaryBlue),
                                  ),
                                ),
                                if (service.discount != null &&
                                    service.discount! > 0) ...[
                                  const SizedBox(width: 8),
                                  Padding(
                                    padding: const EdgeInsets.only(bottom: 4),
                                    child: Text(
                                      '₹${service.price.toStringAsFixed(0)}',
                                      style: GoogleFonts.inter(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w600,
                                        color: const Color(AppConstants.textGray),
                                        decoration: TextDecoration.lineThrough,
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ],
                        ),
                        const Spacer(),
                        if (service.discount != null && service.discount! > 0)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: const Color(0xFFDCFCE7),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '${((service.discount! / service.price) * 100).toStringAsFixed(0)}% OFF',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                                color: const Color(0xFF16A34A),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Description
                  if (service.description != null &&
                      service.description!.isNotEmpty) ...[
                    Text(
                      'About this Service',
                      style: GoogleFonts.inter(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: const Color(AppConstants.primaryDark),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      service.description!,
                      style: GoogleFonts.inter(
                        fontSize: 15,
                        color: const Color(AppConstants.textGray),
                        height: 1.6,
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // What's included section
                  Text(
                    "What's Included",
                    style: GoogleFonts.inter(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: const Color(AppConstants.primaryDark),
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...[
                    'Professional technician visit',
                    'Service warranty included',
                    'Genuine spare parts used',
                    'Post-service cleanup',
                  ].map((item) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Row(
                          children: [
                            Container(
                              width: 22,
                              height: 22,
                              decoration: const BoxDecoration(
                                color: Color(0xFFEFF6FF),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.check_rounded,
                                size: 14,
                                color: Color(AppConstants.primaryBlue),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              item,
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                color: const Color(AppConstants.primaryDark),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      )),

                  // Space for bottom button
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),

      // ── Bottom Add to Cart Button ────────────────────────────
      bottomNavigationBar: Consumer<CartProvider>(
        builder: (context, cart, _) {
          final inCart = cart.items.any((i) => i.service.id == service.id);
          return Container(
            padding: EdgeInsets.fromLTRB(
                24, 16, 24, MediaQuery.of(context).padding.bottom + 16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.08),
                  blurRadius: 20,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            child: Row(
              children: [
                // Book Now button
                Expanded(
                  child: GestureDetector(
                    onTap: () => cart.addToCart(service),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      height: 54,
                      decoration: BoxDecoration(
                        color: inCart
                            ? const Color(0xFF16A34A)
                            : const Color(AppConstants.primaryDark),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(AppConstants.primaryDark)
                                .withOpacity(0.3),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Center(
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              inCart
                                  ? Icons.check_circle_rounded
                                  : Icons.shopping_bag_rounded,
                              color: Colors.white,
                              size: 20,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              inCart ? 'Added to Cart ✓' : 'Book Now',
                              style: GoogleFonts.inter(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
