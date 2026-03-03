import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/service_model.dart';
import '../providers/cart_provider.dart';
import '../providers/favorites_provider.dart';
import '../utils/constants.dart';
import '../screens/service_detail_screen.dart';
import '../main.dart' show MainShellState;

class ServiceCard extends StatelessWidget {
  final ServiceModel service;
  final bool compact;

  const ServiceCard({super.key, required this.service, this.compact = false});

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final favs = context.watch<FavoritesProvider>();
    final inCart = cart.items.any((i) => i.service.id == service.id);
    final isFav = favs.isFavorite(service.id);

    final thumb = service.thumbnail != null
        ? (service.thumbnail!.startsWith('http')
            ? service.thumbnail!
            : '${AppConstants.baseUrl}${service.thumbnail}')
        : 'https://images.unsplash.com/photo-1581578731117-104f8a746950?w=400';

    return GestureDetector(
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => ServiceDetailScreen(service: service),
        ),
      ),
      child: compact
          ? _buildCompact(context, thumb, inCart, isFav, favs)
          : _buildFull(context, thumb, inCart, isFav, favs),
    );
  }

  // ── Full List Card ────────────────────────────────────────────────

  Widget _buildFull(BuildContext context, String thumb, bool inCart,
      bool isFav, FavoritesProvider favs) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(AppConstants.borderColor)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image
          Stack(
            children: [
              ClipRRect(
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(22)),
                child: CachedNetworkImage(
                  imageUrl: thumb,
                  height: 160,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  placeholder: (_, __) => Container(
                    height: 160,
                    color: const Color(AppConstants.bgLight),
                    child: const Center(
                      child: CircularProgressIndicator(
                          color: Color(AppConstants.primaryBlue),
                          strokeWidth: 2),
                    ),
                  ),
                ),
              ),
              // Favorite button
              Positioned(
                top: 12,
                right: 12,
                child: GestureDetector(
                  onTap: () => favs.toggle(service),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: isFav
                          ? const Color(0xFFFEF2F2)
                          : Colors.white.withValues(alpha: 0.9),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      isFav
                          ? Icons.favorite_rounded
                          : Icons.favorite_border_rounded,
                      size: 18,
                      color: isFav
                          ? const Color(0xFFEF4444)
                          : const Color(AppConstants.textGray),
                    ),
                  ),
                ),
              ),
              // Category badge
              if (service.category != null)
                Positioned(
                  top: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.6),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      service.category!,
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          // Content
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  service.name,
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: const Color(AppConstants.primaryDark),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (service.description != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    service.description!,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: const Color(AppConstants.textGray),
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                const SizedBox(height: 12),
                Row(
                  children: [
                    // Price
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (service.discount != null && service.discount! > 0)
                          Text(
                            '₹${service.price.toStringAsFixed(0)}',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: const Color(AppConstants.textGray),
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                        Text(
                          '₹${service.discountedPrice.toStringAsFixed(0)}',
                          style: GoogleFonts.inter(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: const Color(AppConstants.primaryBlue),
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    // Rating
                    if (service.rating != null)
                      Row(
                        children: [
                          const Icon(Icons.star_rounded,
                              color: Color(0xFFFBBF24), size: 16),
                          const SizedBox(width: 4),
                          Text(
                            service.rating!.toStringAsFixed(1),
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: const Color(AppConstants.primaryDark),
                            ),
                          ),
                        ],
                      ),
                    const SizedBox(width: 12),
                    // Add to Cart
                    GestureDetector(
                      onTap: () {
                        context.read<CartProvider>().addToCart(service);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('${service.name} added to cart'),
                            duration: const Duration(seconds: 2),
                            action: SnackBarAction(
                              label: 'VIEW',
                              onPressed: () => context
                                  .findAncestorStateOfType<MainShellState>()
                                  ?.setTab(2),
                            ),
                          ),
                        );
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 10),
                        decoration: BoxDecoration(
                          color: inCart
                              ? const Color(AppConstants.primaryBlue)
                              : const Color(AppConstants.primaryDark),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Text(
                          inCart ? 'Added ✓' : 'Add',
                          style: GoogleFonts.inter(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
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

  // ── Compact Grid Card ─────────────────────────────────────────────

  Widget _buildCompact(BuildContext context, String thumb, bool inCart,
      bool isFav, FavoritesProvider favs) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(AppConstants.borderColor)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image
          Stack(
            children: [
              ClipRRect(
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(18)),
                child: CachedNetworkImage(
                  imageUrl: thumb,
                  height: 110,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  placeholder: (_, __) => Container(
                    height: 110,
                    color: const Color(AppConstants.bgLight),
                  ),
                ),
              ),
              Positioned(
                top: 8,
                right: 8,
                child: GestureDetector(
                  onTap: () => favs.toggle(service),
                  child: Container(
                    width: 30,
                    height: 30,
                    decoration: BoxDecoration(
                      color: isFav
                          ? const Color(0xFFFEF2F2)
                          : Colors.white.withValues(alpha: 0.9),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      isFav
                          ? Icons.favorite_rounded
                          : Icons.favorite_border_rounded,
                      size: 15,
                      color: isFav
                          ? const Color(0xFFEF4444)
                          : const Color(AppConstants.textGray),
                    ),
                  ),
                ),
              ),
            ],
          ),
          // Content
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    service.name,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: const Color(AppConstants.primaryDark),
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const Spacer(),
                  Row(
                    children: [
                      Text(
                        '₹${service.discountedPrice.toStringAsFixed(0)}',
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                          color: const Color(AppConstants.primaryBlue),
                        ),
                      ),
                      const Spacer(),
                      GestureDetector(
                        onTap: () {
                          context.read<CartProvider>().addToCart(service);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('${service.name} added to cart'),
                              duration: const Duration(milliseconds: 1500),
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              margin: const EdgeInsets.only(bottom: 100, left: 20, right: 20),
                              action: SnackBarAction(
                                label: 'VIEW',
                                onPressed: () => context
                                    .findAncestorStateOfType<MainShellState>()
                                    ?.setTab(2),
                              ),
                            ),
                          );
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          width: 30,
                          height: 30,
                          decoration: BoxDecoration(
                            color: inCart
                                ? const Color(AppConstants.primaryBlue)
                                : const Color(AppConstants.primaryDark),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(
                            inCart
                                ? Icons.check_rounded
                                : Icons.add_rounded,
                            size: 16,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
