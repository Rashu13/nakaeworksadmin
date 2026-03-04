import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import '../services/api_service.dart';
import '../models/service_model.dart';
import '../providers/notifications_provider.dart';
import '../utils/constants.dart';
import '../widgets/service_card.dart';
import '../main.dart' show MainShellState;
import 'notifications_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<CategoryModel> _categories = [];
  List<ServiceModel> _services = [];
  bool _loading = true;
  String _currentCity = 'New Delhi';
  bool _isGridView = false;

  @override
  void initState() {
    super.initState();
    _loadData();
    _fetchLocation();
  }

  Future<void> _fetchLocation() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.whileInUse ||
          permission == LocationPermission.always) {
        Position position = await Geolocator.getCurrentPosition(
            desiredAccuracy: LocationAccuracy.low);
        List<Placemark> placemarks = await placemarkFromCoordinates(
            position.latitude, position.longitude);
        if (placemarks.isNotEmpty) {
          if (mounted) {
            setState(() {
              _currentCity = placemarks[0].locality ?? 'New Delhi';
            });
          }
        }
      }
    } catch (_) {}
  }

  Future<void> _loadData() async {
    try {
      final results = await Future.wait([
        ApiService.getCategories(),
        ApiService.getServices(limit: 4),
      ]);
      if (mounted) {
        setState(() {
          _categories = results[0] as List<CategoryModel>;
          _services = results[1] as List<ServiceModel>;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 17) return 'GOOD AFTERNOON';
    if (hour < 21) return 'GOOD EVENING';
    return 'GOOD NIGHT';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(AppConstants.bgLight),
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            Expanded(
              child: RefreshIndicator(
                onRefresh: _loadData,
                color: const Color(AppConstants.primaryBlue),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.only(bottom: 80),
                  child: Column(
                    children: [
                      _buildSearchBar(),
                      _buildBanner(),
                      _buildSectionHeader('Categories', 'See All',
                          onAction: () {
                            context
                                .findAncestorStateOfType<MainShellState>()
                                ?.setTab(1);
                          }),
                      _buildCategories(),
                      _buildSectionHeader(
                        'Featured Services',
                        'Browse All',
                        onAction: () {
                          context
                              .findAncestorStateOfType<MainShellState>()
                              ?.setTab(1);
                        },
                        trailing: GestureDetector(
                          onTap: () => setState(() => _isGridView = !_isGridView),
                          child: Icon(
                            _isGridView ? Icons.view_list_rounded : Icons.grid_view_rounded,
                            size: 20,
                            color: const Color(AppConstants.primaryBlue),
                          ),
                        ),
                      ),
                      _buildServices(),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Consumer<NotificationsProvider>(
      builder: (context, notifs, _) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
          color: Colors.white,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _getGreeting(),
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: const Color(AppConstants.textGray),
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.location_on,
                          size: 16, color: Color(AppConstants.primaryBlue)),
                      const SizedBox(width: 4),
                      Text(
                        '$_currentCity ▾',
                        style: GoogleFonts.inter(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: const Color(AppConstants.primaryDark),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Row(
                children: [
                  // Bell with unread badge
                  GestureDetector(
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(
                          builder: (_) => const NotificationsScreen()),
                    ),
                    child: Stack(
                      clipBehavior: Clip.none,
                      children: [
                        _iconBtn(Icons.notifications_none_rounded),
                        if (notifs.unreadCount > 0)
                          Positioned(
                            top: -4,
                            right: -4,
                            child: Container(
                              width: 18,
                              height: 18,
                              decoration: const BoxDecoration(
                                color: Color(0xFFEF4444),
                                shape: BoxShape.circle,
                              ),
                              child: Center(
                                child: Text(
                                  '${notifs.unreadCount}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  _iconBtn(Icons.person_outline_rounded),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _iconBtn(IconData icon) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: const Color(AppConstants.bgLight),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(AppConstants.borderColor)),
      ),
      child: Icon(icon, size: 20, color: const Color(AppConstants.textGray)),
    );
  }

  Widget _buildSearchBar() {
    return GestureDetector(
      onTap: () {
        // switch to Explore tab
        final shell = context.findAncestorStateOfType<MainShellState>();
        shell?.setTab(1);
      },
      child: Container(
        margin: const EdgeInsets.fromLTRB(20, 20, 20, 0),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
          border: Border.all(color: const Color(AppConstants.borderColor)),
        ),
        child: Row(
          children: [
            const Icon(Icons.search_rounded,
                color: Color(AppConstants.primaryBlue), size: 20),
            const SizedBox(width: 12),
            Text(
              'Search for services...',
              style: GoogleFonts.inter(
                color: const Color(AppConstants.textGray),
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBanner() {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 24, 20, 0),
      height: 180,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        color: const Color(0xFFE2E8F0),
      ),
      clipBehavior: Clip.hardEdge,
      child: Stack(
        fit: StackFit.expand,
        children: [
          CachedNetworkImage(
            imageUrl:
                'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800',
            fit: BoxFit.cover,
          ),
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Colors.transparent, Colors.black.withOpacity(0.6)],
              ),
            ),
          ),
          Positioned(
            left: 24,
            bottom: 24,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFBBF24),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    'ELITE PROTOCOL',
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      color: const Color(AppConstants.primaryDark),
                      letterSpacing: 1,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Summer AC Service',
                  style: GoogleFonts.inter(
                    fontSize: 26,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: -1,
                  ),
                ),
                Text(
                  'Deep Cleaning @ ₹499',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    color: Colors.white70,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, String actionText,
      {VoidCallback? onAction, Widget? trailing}) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 32, 20, 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              title,
              style: GoogleFonts.inter(
                fontSize: 20,
                fontWeight: FontWeight.w900,
                color: const Color(AppConstants.primaryDark),
                letterSpacing: -0.5,
              ),
            ),
          ),
          if (trailing != null) ...[
            trailing,
            const SizedBox(width: 12),
          ],
          GestureDetector(
            onTap: onAction,
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(AppConstants.primaryBlue).withOpacity(0.08),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                actionText,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: const Color(AppConstants.primaryBlue),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategories() {
    if (_loading) {
      return const Padding(
        padding: EdgeInsets.all(20),
        child: CircularProgressIndicator(
          color: Color(AppConstants.primaryBlue),
        ),
      );
    }
    if (_categories.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Text('No categories found',
            style: GoogleFonts.inter(color: const Color(AppConstants.textGray))),
      );
    }
    return SizedBox(
      height: 110,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        itemCount: _categories.length,
        itemBuilder: (context, index) {
          final cat = _categories[index];
          final imageUrl = cat.image != null
              ? (cat.image!.startsWith('http')
                  ? cat.image!
                  : '${AppConstants.baseUrl}${cat.image}')
              : 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200';
          return GestureDetector(
            onTap: () {
              context
                  .findAncestorStateOfType<MainShellState>()
                  ?.setTab(1, category: cat.name);
            },
            child: Container(
              width: 80,
              margin: const EdgeInsets.symmetric(horizontal: 6),
              child: Column(
                children: [
                  Container(
                    width: 68,
                    height: 68,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(AppConstants.primaryBlue)
                              .withOpacity(0.08),
                          blurRadius: 16,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    clipBehavior: Clip.hardEdge,
                    child: CachedNetworkImage(
                      imageUrl: imageUrl,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        color: const Color(AppConstants.bgLight),
                        child: const Center(
                          child: SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Color(AppConstants.primaryBlue),
                            ),
                          ),
                        ),
                      ),
                      errorWidget: (context, url, error) => Container(
                        color: const Color(AppConstants.bgLight),
                        child: const Icon(
                          Icons.home_repair_service_rounded,
                          color: Color(AppConstants.primaryBlue),
                          size: 28,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    cat.name,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF334155),
                    ),
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildServices() {
    if (_loading) return const SizedBox();
    if (_services.isEmpty) {
      return Container(
        margin: const EdgeInsets.all(20),
        padding: const EdgeInsets.all(40),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: const Color(AppConstants.borderColor),
            strokeAlign: BorderSide.strokeAlignOutside,
          ),
        ),
        child: Center(
          child: Text(
            'No featured services currently.',
            style: GoogleFonts.inter(
              color: const Color(AppConstants.textGray),
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      );
    }

    if (_isGridView) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 0.75,
          ),
          itemCount: _services.length,
          itemBuilder: (context, index) => ServiceCard(
            service: _services[index],
            compact: true,
          ),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        children: _services
            .map((s) => Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: ServiceCard(service: s),
                ))
            .toList(),
      ),
    );
  }
}
