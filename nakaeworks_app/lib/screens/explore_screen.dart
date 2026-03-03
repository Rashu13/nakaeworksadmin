import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../utils/constants.dart';
import '../widgets/service_card.dart';
import '../services/api_service.dart';
import '../models/service_model.dart';

enum SortOption { relevance, priceLow, priceHigh, rating }

class ExploreScreen extends StatefulWidget {
  final String? initialCategory;
  const ExploreScreen({super.key, this.initialCategory});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen>
    with SingleTickerProviderStateMixin {
  // ── Data ──────────────────────────────────────────────────────────
  List<ServiceModel> _services = [];
  List<CategoryModel> _categories = [];
  bool _loading = true;

  // ── Filter State ─────────────────────────────────────────────────
  String _query = '';
  String? _selectedCategory; // null = All
  SortOption _sortOption = SortOption.relevance;
  bool _isGridView = false;

  final _searchCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory;
    _load();
  }

  @override
  void didUpdateWidget(ExploreScreen oldWidget) {
    if (widget.initialCategory != oldWidget.initialCategory) {
      setState(() {
        _selectedCategory = widget.initialCategory;
      });
    }
    super.didUpdateWidget(oldWidget);
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  // ── Data Loading ─────────────────────────────────────────────────

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        ApiService.getServices(),
        ApiService.getCategories(),
      ]);
      if (mounted) {
        setState(() {
          _services = results[0] as List<ServiceModel>;
          _categories = results[1] as List<CategoryModel>;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  // ── Filtered + Sorted List ────────────────────────────────────────

  List<ServiceModel> get _filtered {
    var list = _services.where((s) {
      final matchesQuery =
          _query.isEmpty || s.name.toLowerCase().contains(_query.toLowerCase());
      final matchesCat = _selectedCategory == null ||
          (s.category?.toLowerCase() ==
              _selectedCategory!.toLowerCase());
      return matchesQuery && matchesCat;
    }).toList();

    switch (_sortOption) {
      case SortOption.priceLow:
        list.sort((a, b) => a.discountedPrice.compareTo(b.discountedPrice));
        break;
      case SortOption.priceHigh:
        list.sort((a, b) => b.discountedPrice.compareTo(a.discountedPrice));
        break;
      case SortOption.rating:
        list.sort((a, b) => (b.rating ?? 0).compareTo(a.rating ?? 0));
        break;
      case SortOption.relevance:
        break;
    }
    return list;
  }

  int get _activeFilterCount {
    int count = 0;
    if (_selectedCategory != null) count++;
    if (_sortOption != SortOption.relevance) count++;
    return count;
  }

  void _clearAll() {
    setState(() {
      _query = '';
      _searchCtrl.clear();
      _selectedCategory = null;
      _sortOption = SortOption.relevance;
    });
  }

  // ── Build ─────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(AppConstants.bgLight),
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            _buildCategoryChips(),
            _buildFilterRow(),
            Expanded(child: _buildBody()),
          ],
        ),
      ),
    );
  }

  // ── Header ────────────────────────────────────────────────────────

  Widget _buildHeader() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Explore',
                      style: GoogleFonts.inter(
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        color: const Color(AppConstants.primaryDark),
                        letterSpacing: -1,
                      ),
                    ),
                    Text(
                      'Find the perfect service for you',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        color: const Color(AppConstants.textGray),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              // Grid / List toggle
              GestureDetector(
                onTap: () => setState(() => _isGridView = !_isGridView),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: _isGridView
                        ? const Color(AppConstants.primaryBlue)
                            .withValues(alpha: 0.1)
                        : const Color(AppConstants.bgLight),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                        color: _isGridView
                            ? const Color(AppConstants.primaryBlue)
                            : const Color(AppConstants.borderColor)),
                  ),
                  child: Icon(
                    _isGridView
                        ? Icons.view_list_rounded
                        : Icons.grid_view_rounded,
                    size: 20,
                    color: _isGridView
                        ? const Color(AppConstants.primaryBlue)
                        : const Color(AppConstants.textGray),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Search bar
          Container(
            decoration: BoxDecoration(
              color: const Color(AppConstants.bgLight),
              borderRadius: BorderRadius.circular(16),
              border:
                  Border.all(color: const Color(AppConstants.borderColor)),
            ),
            child: TextField(
              controller: _searchCtrl,
              onChanged: (q) => setState(() => _query = q),
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: const Color(AppConstants.primaryDark),
              ),
              decoration: InputDecoration(
                hintText: 'Search services...',
                hintStyle: GoogleFonts.inter(
                  color: const Color(AppConstants.textGray),
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
                prefixIcon: const Icon(Icons.search_rounded,
                    color: Color(AppConstants.primaryBlue), size: 20),
                suffixIcon: _query.isNotEmpty
                    ? GestureDetector(
                        onTap: () {
                          _searchCtrl.clear();
                          setState(() => _query = '');
                        },
                        child: const Icon(Icons.close_rounded,
                            color: Color(AppConstants.textGray), size: 18),
                      )
                    : null,
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 14),
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  // ── Category Chips ────────────────────────────────────────────────

  Widget _buildCategoryChips() {
    if (_loading || _categories.isEmpty) return const SizedBox.shrink();

    return Container(
      color: Colors.white,
      child: Column(
        children: [
          Divider(height: 1, color: const Color(AppConstants.borderColor)),
          SizedBox(
            height: 52,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              children: [
                // "All" chip first
                _CategoryChip(
                  label: 'All',
                  icon: Icons.apps_rounded,
                  isSelected: _selectedCategory == null,
                  onTap: () => setState(() => _selectedCategory = null),
                ),
                const SizedBox(width: 8),
                ..._categories.map((cat) => Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: _CategoryChip(
                        label: cat.name,
                        isSelected: _selectedCategory == cat.name,
                        onTap: () => setState(() {
                          _selectedCategory = _selectedCategory == cat.name
                              ? null
                              : cat.name;
                        }),
                      ),
                    )),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Filter Row (Sort + Count + Clear) ─────────────────────────────

  Widget _buildFilterRow() {
    final filtered = _filtered;
    return Container(
      color: const Color(AppConstants.bgLight),
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
      child: Row(
        children: [
          // Result count
          Expanded(
            child: RichText(
              text: TextSpan(
                children: [
                  TextSpan(
                    text: '${filtered.length} ',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                      color: const Color(AppConstants.primaryDark),
                    ),
                  ),
                  TextSpan(
                    text: 'services found',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: const Color(AppConstants.textGray),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Clear filters
          if (_activeFilterCount > 0)
            GestureDetector(
              onTap: _clearAll,
              child: Container(
                margin: const EdgeInsets.only(right: 8),
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF2F2),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFFECACA)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.close_rounded,
                        size: 14, color: Color(0xFFEF4444)),
                    const SizedBox(width: 4),
                    Text(
                      'Clear ($_activeFilterCount)',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFFEF4444),
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // Sort button
          GestureDetector(
            onTap: _showSortSheet,
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
              decoration: BoxDecoration(
                color: _sortOption != SortOption.relevance
                    ? const Color(AppConstants.primaryBlue).withValues(alpha: 0.1)
                    : Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: _sortOption != SortOption.relevance
                      ? const Color(AppConstants.primaryBlue)
                      : const Color(AppConstants.borderColor),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.sort_rounded,
                    size: 16,
                    color: _sortOption != SortOption.relevance
                        ? const Color(AppConstants.primaryBlue)
                        : const Color(AppConstants.textGray),
                  ),
                  const SizedBox(width: 5),
                  Text(
                    'Sort',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: _sortOption != SortOption.relevance
                          ? const Color(AppConstants.primaryBlue)
                          : const Color(AppConstants.textGray),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Body ──────────────────────────────────────────────────────────

  Widget _buildBody() {
    if (_loading) {
      return const Center(
        child: CircularProgressIndicator(
            color: Color(AppConstants.primaryBlue)),
      );
    }

    final items = _filtered;

    if (items.isEmpty) {
      return _buildEmpty();
    }

    if (_isGridView) {
      return RefreshIndicator(
        onRefresh: _load,
        color: const Color(AppConstants.primaryBlue),
        child: GridView.builder(
          controller: _scrollCtrl,
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 80),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 0.75,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
          ),
          itemCount: items.length,
          itemBuilder: (context, index) => ServiceCard(
            service: items[index],
            compact: true,
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      color: const Color(AppConstants.primaryBlue),
      child: ListView.builder(
        controller: _scrollCtrl,
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 80),
        itemCount: items.length,
        itemBuilder: (context, index) => Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: ServiceCard(service: items[index]),
        ),
      ),
    );
  }

  // ── Empty State ───────────────────────────────────────────────────

  Widget _buildEmpty() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: const Color(AppConstants.bgLight),
                shape: BoxShape.circle,
                border:
                    Border.all(color: const Color(AppConstants.borderColor)),
              ),
              child: const Icon(Icons.search_off_rounded,
                  size: 36, color: Color(AppConstants.textGray)),
            ),
            const SizedBox(height: 20),
            Text(
              'NO RESULTS FOUND',
              style: GoogleFonts.inter(
                fontSize: 16,
                fontWeight: FontWeight.w900,
                color: const Color(AppConstants.primaryDark),
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _query.isNotEmpty
                  ? 'No services match "$_query"'
                  : 'No services in this category',
              style: GoogleFonts.inter(
                fontSize: 13,
                color: const Color(AppConstants.textGray),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            GestureDetector(
              onTap: _clearAll,
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 20, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(AppConstants.primaryDark),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Text(
                  'CLEAR FILTERS',
                  style: GoogleFonts.inter(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 13,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Sort Bottom Sheet ─────────────────────────────────────────────

  void _showSortSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => _SortSheet(
        current: _sortOption,
        onSelect: (opt) => setState(() => _sortOption = opt),
      ),
    );
  }
}

// ─── Category Chip ────────────────────────────────────────────────────

class _CategoryChip extends StatelessWidget {
  final String label;
  final IconData? icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _CategoryChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(AppConstants.primaryDark)
              : Colors.white,
          borderRadius: BorderRadius.circular(30),
          border: Border.all(
            color: isSelected
                ? const Color(AppConstants.primaryDark)
                : const Color(AppConstants.borderColor),
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(AppConstants.primaryDark)
                        .withValues(alpha: 0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ]
              : [],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon,
                  size: 14,
                  color: isSelected
                      ? Colors.white
                      : const Color(AppConstants.textGray)),
              const SizedBox(width: 5),
            ],
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                color: isSelected
                    ? Colors.white
                    : const Color(AppConstants.textGray),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Sort Sheet ───────────────────────────────────────────────────────

class _SortSheet extends StatelessWidget {
  final SortOption current;
  final ValueChanged<SortOption> onSelect;

  const _SortSheet({required this.current, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    final options = [
      (SortOption.relevance, 'Relevance', Icons.auto_awesome_rounded),
      (SortOption.priceLow, 'Price: Low to High', Icons.arrow_upward_rounded),
      (SortOption.priceHigh, 'Price: High to Low', Icons.arrow_downward_rounded),
      (SortOption.rating, 'Top Rated', Icons.star_rounded),
    ];

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(AppConstants.borderColor),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'SORT BY',
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w900,
              color: const Color(AppConstants.textGray),
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          ...options.map((opt) {
            final isSelected = current == opt.$1;
            return GestureDetector(
              onTap: () {
                onSelect(opt.$1);
                Navigator.pop(context);
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: isSelected
                      ? const Color(AppConstants.primaryBlue)
                          .withValues(alpha: 0.08)
                      : const Color(AppConstants.bgLight),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected
                        ? const Color(AppConstants.primaryBlue)
                        : const Color(AppConstants.borderColor),
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      opt.$3,
                      size: 20,
                      color: isSelected
                          ? const Color(AppConstants.primaryBlue)
                          : const Color(AppConstants.textGray),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Text(
                        opt.$2,
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: isSelected
                              ? FontWeight.w800
                              : FontWeight.w600,
                          color: isSelected
                              ? const Color(AppConstants.primaryBlue)
                              : const Color(AppConstants.primaryDark),
                        ),
                      ),
                    ),
                    if (isSelected)
                      const Icon(Icons.check_circle_rounded,
                          size: 20,
                          color: Color(AppConstants.primaryBlue)),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
