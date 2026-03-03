import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/favorites_provider.dart';
import '../utils/constants.dart';
import '../widgets/service_card.dart';

class FavoritesScreen extends StatelessWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(AppConstants.bgLight),
      body: SafeArea(
        child: Consumer<FavoritesProvider>(
          builder: (context, favs, _) {
            return Column(
              children: [
                Container(
                  color: Colors.white,
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'FAVORITES',
                        style: GoogleFonts.inter(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: const Color(AppConstants.primaryDark),
                          letterSpacing: -0.5,
                        ),
                      ),
                      Text(
                        '${favs.favorites.length} saved services',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: const Color(AppConstants.textGray),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: favs.favorites.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.favorite_border_rounded,
                                  size: 64, color: Colors.grey.shade300),
                              const SizedBox(height: 24),
                              Text(
                                'NO FAVORITES YET',
                                style: GoogleFonts.inter(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w900,
                                  color: const Color(AppConstants.primaryDark),
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Tap the heart icon on any service to save it.',
                                style: GoogleFonts.inter(
                                  color: const Color(AppConstants.textGray),
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.fromLTRB(20, 16, 20, 80),
                          itemCount: favs.favorites.length,
                          itemBuilder: (context, i) => Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: ServiceCard(service: favs.favorites[i]),
                          ),
                        ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
