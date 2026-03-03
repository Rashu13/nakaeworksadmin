import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import '../providers/addresses_provider.dart';
import '../utils/constants.dart';

class SavedAddressesScreen extends StatefulWidget {
  /// If true, user is picking an address (from checkout picker)
  final bool pickMode;

  const SavedAddressesScreen({super.key, this.pickMode = false});

  @override
  State<SavedAddressesScreen> createState() => _SavedAddressesScreenState();
}

class _SavedAddressesScreenState extends State<SavedAddressesScreen> {
  bool get pickMode => widget.pickMode;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AddressesProvider>().fetchAddresses();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(AppConstants.bgLight),
      body: Consumer<AddressesProvider>(
        builder: (context, provider, _) {
          return Column(
            children: [
              _buildHeader(context, provider),
              Expanded(
                child: provider.addresses.isEmpty
                    ? _buildEmpty(context)
                    : _buildList(context, provider),
              ),
            ],
          );
        },
      ),
      floatingActionButton: _buildFAB(context),
    );
  }

  // ─── Header ─────────────────────────────────────────────────────

  Widget _buildHeader(BuildContext context, AddressesProvider provider) {
    return Container(
      color: Colors.white,
      padding: EdgeInsets.fromLTRB(
          20, MediaQuery.of(context).padding.top + 12, 20, 16),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.of(context).pop(),
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: const Color(AppConstants.bgLight),
                borderRadius: BorderRadius.circular(14),
                border:
                    Border.all(color: const Color(AppConstants.borderColor)),
              ),
              child: const Icon(Icons.arrow_back_ios_new_rounded,
                  size: 16, color: Color(AppConstants.primaryDark)),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  pickMode ? 'Select Address' : 'Saved Addresses',
                  style: GoogleFonts.inter(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: const Color(AppConstants.primaryDark),
                    letterSpacing: -0.5,
                  ),
                ),
                Text(
                  '${provider.addresses.length} saved location(s)',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: const Color(AppConstants.textGray),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─── List ────────────────────────────────────────────────────────

  Widget _buildList(BuildContext context, AddressesProvider provider) {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
      itemCount: provider.addresses.length,
      itemBuilder: (context, index) {
        final addr = provider.addresses[index];
        return _AddressCard(
          address: addr,
          pickMode: pickMode,
          onSelect: pickMode
              ? () => Navigator.of(context).pop(addr)
              : null,
          onEdit: () => _showAddressSheet(context, addr),
          onDelete: () => _confirmDelete(context, provider, addr.id),
          onSetDefault: () async => await provider.updateAddress(
            AddressModel(
              id: addr.id,
              label: addr.label,
              fullAddress: addr.fullAddress,
              city: addr.city,
              state: addr.state,
              pincode: addr.pincode,
              type: addr.type,
              isDefault: true,
            ),
          ),
        );
      },
    );
  }

  // ─── Empty State ─────────────────────────────────────────────────

  Widget _buildEmpty(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 90,
            height: 90,
            decoration: BoxDecoration(
              color: const Color(AppConstants.bgLight),
              shape: BoxShape.circle,
              border:
                  Border.all(color: const Color(AppConstants.borderColor)),
            ),
            child: const Icon(Icons.location_off_outlined,
                size: 40, color: Color(AppConstants.textGray)),
          ),
          const SizedBox(height: 20),
          Text(
            'NO SAVED ADDRESSES',
            style: GoogleFonts.inter(
              fontSize: 16,
              fontWeight: FontWeight.w900,
              color: const Color(AppConstants.primaryDark),
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Add your home, office or any\nfrequent location for quick booking.',
            style: GoogleFonts.inter(
              fontSize: 13,
              color: const Color(AppConstants.textGray),
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          GestureDetector(
            onTap: () => _showAddressSheet(context, null),
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
              decoration: BoxDecoration(
                color: const Color(AppConstants.primaryDark),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.add_rounded, color: Colors.white, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    'ADD ADDRESS',
                    style: GoogleFonts.inter(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      fontSize: 14,
                      letterSpacing: 0.5,
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

  // ─── FAB ─────────────────────────────────────────────────────────

  Widget _buildFAB(BuildContext context) {
    return FloatingActionButton.extended(
      onPressed: () => _showAddressSheet(context, null),
      backgroundColor: const Color(AppConstants.primaryDark),
      icon: const Icon(Icons.add_location_alt_rounded, color: Colors.white),
      label: Text(
        'ADD ADDRESS',
        style: GoogleFonts.inter(
          color: Colors.white,
          fontWeight: FontWeight.w800,
          fontSize: 13,
          letterSpacing: 0.5,
        ),
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    );
  }

  // ─── Delete Confirm ──────────────────────────────────────────────

  void _confirmDelete(
      BuildContext context, AddressesProvider provider, String id) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Delete Address?',
            style: GoogleFonts.inter(fontWeight: FontWeight.w900)),
        content: Text(
          'This address will be permanently removed.',
          style:
              GoogleFonts.inter(color: const Color(AppConstants.textGray)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel',
                style: GoogleFonts.inter(
                    color: const Color(AppConstants.textGray),
                    fontWeight: FontWeight.w600)),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              provider.deleteAddress(id);
            },
            child: Text('Delete',
                style: GoogleFonts.inter(
                    color: const Color(0xFFEF4444),
                    fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
  }

  // ─── Add/Edit Bottom Sheet ───────────────────────────────────────

  void _showAddressSheet(BuildContext context, AddressModel? existing) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _AddressFormSheet(existing: existing),
    );
  }
}

// ─── Address Card ─────────────────────────────────────────────────────

class _AddressCard extends StatelessWidget {
  final AddressModel address;
  final bool pickMode;
  final VoidCallback? onSelect;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final VoidCallback onSetDefault;

  const _AddressCard({
    required this.address,
    required this.pickMode,
    this.onSelect,
    required this.onEdit,
    required this.onDelete,
    required this.onSetDefault,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: pickMode ? onSelect : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 14),
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: address.isDefault
                ? const Color(AppConstants.primaryBlue)
                : const Color(AppConstants.borderColor),
            width: address.isDefault ? 2 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: address.isDefault
                  ? const Color(AppConstants.primaryBlue).withValues(alpha: 0.08)
                  : Colors.black.withValues(alpha: 0.03),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Top Row ────────────────────────────────────────
            Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: address.isDefault
                        ? const Color(AppConstants.primaryBlue).withValues(alpha: 0.12)
                        : const Color(AppConstants.bgLight),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(
                    address.typeIcon,
                    size: 22,
                    color: address.isDefault
                        ? const Color(AppConstants.primaryBlue)
                        : const Color(AppConstants.textGray),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            address.label,
                            style: GoogleFonts.inter(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              color: const Color(AppConstants.primaryDark),
                            ),
                          ),
                          if (address.isDefault) ...[
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(AppConstants.primaryBlue),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                'DEFAULT',
                                style: GoogleFonts.inter(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      Text(
                        address.typeLabel,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: const Color(AppConstants.textGray),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                // 3-dot menu
                if (!pickMode)
                  _MoreMenu(
                    isDefault: address.isDefault,
                    onEdit: onEdit,
                    onDelete: onDelete,
                    onSetDefault: onSetDefault,
                  ),
                if (pickMode)
                  Icon(
                    Icons.chevron_right_rounded,
                    color: const Color(AppConstants.textGray),
                  ),
              ],
            ),
            const SizedBox(height: 14),
            Divider(height: 1, color: const Color(AppConstants.borderColor)),
            const SizedBox(height: 14),

            // ── Address Details ─────────────────────────────────
            _addressRow(Icons.location_on_outlined, address.fullAddress),
            if (address.city?.isNotEmpty == true) ...[
              const SizedBox(height: 4),
              _addressRow(Icons.location_city_outlined, '${address.city ?? ''}, ${address.state ?? ''} ${address.pincode ?? ''}'),
            ],
          ],
        ),
      ),
    );
  }

  Widget _addressRow(IconData icon, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 15, color: const Color(AppConstants.textGray)),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: GoogleFonts.inter(
              fontSize: 13,
              color: const Color(AppConstants.textGray),
              fontWeight: FontWeight.w500,
              height: 1.4,
            ),
          ),
        ),
      ],
    );
  }
}

// ─── More Menu ───────────────────────────────────────────────────────

class _MoreMenu extends StatelessWidget {
  final bool isDefault;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final VoidCallback onSetDefault;

  const _MoreMenu({
    required this.isDefault,
    required this.onEdit,
    required this.onDelete,
    required this.onSetDefault,
  });

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      icon: const Icon(Icons.more_vert_rounded,
          color: Color(AppConstants.textGray), size: 20),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      onSelected: (val) {
        if (val == 'edit') onEdit();
        if (val == 'delete') onDelete();
        if (val == 'default') onSetDefault();
      },
      itemBuilder: (_) => [
        PopupMenuItem(
          value: 'edit',
          child: Row(children: [
            const Icon(Icons.edit_outlined, size: 18),
            const SizedBox(width: 12),
            Text('Edit', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
          ]),
        ),
        if (!isDefault)
          PopupMenuItem(
            value: 'default',
            child: Row(children: [
              const Icon(Icons.star_outline_rounded,
                  size: 18, color: Color(AppConstants.primaryBlue)),
              const SizedBox(width: 12),
              Text('Set as Default',
                  style: GoogleFonts.inter(
                      fontWeight: FontWeight.w600,
                      color: const Color(AppConstants.primaryBlue))),
            ]),
          ),
        PopupMenuItem(
          value: 'delete',
          child: Row(children: [
            const Icon(Icons.delete_outline_rounded,
                size: 18, color: Color(0xFFEF4444)),
            const SizedBox(width: 12),
            Text('Delete',
                style: GoogleFonts.inter(
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFFEF4444))),
          ]),
        ),
      ],
    );
  }
}

// ─── Add/Edit Form Sheet ─────────────────────────────────────────────

class _AddressFormSheet extends StatefulWidget {
  final AddressModel? existing;
  const _AddressFormSheet({this.existing});

  @override
  State<_AddressFormSheet> createState() => _AddressFormSheetState();
}

class _AddressFormSheetState extends State<_AddressFormSheet> {
  final _labelCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _stateCtrl = TextEditingController();
  final _pincodeCtrl = TextEditingController();
  AddressType _type = AddressType.home;
  bool _isDefault = false;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    if (widget.existing != null) {
      final a = widget.existing!;
      _labelCtrl.text = a.label;
      _addressCtrl.text = a.fullAddress;
      _cityCtrl.text = a.city ?? '';
      _stateCtrl.text = a.state ?? '';
      _pincodeCtrl.text = a.pincode ?? '';
      _type = a.type;
      _isDefault = a.isDefault;
    }
  }

  @override
  void dispose() {
    _labelCtrl.dispose();
    _addressCtrl.dispose();
    _cityCtrl.dispose();
    _stateCtrl.dispose();
    _pincodeCtrl.dispose();
    super.dispose();
  }

  bool get _isValid =>
      _labelCtrl.text.trim().isNotEmpty &&
      _addressCtrl.text.trim().isNotEmpty;

  Future<void> _save() async {
    if (!_isValid || _saving) return;
    setState(() => _saving = true);

    // Capture before async gap
    final provider = context.read<AddressesProvider>();

    final newAddr = AddressModel(
      id: widget.existing?.id ?? '',
      label: _labelCtrl.text.trim(),
      fullAddress: _addressCtrl.text.trim(),
      city: _cityCtrl.text.trim(),
      state: _stateCtrl.text.trim(),
      pincode: _pincodeCtrl.text.trim().isNotEmpty ? _pincodeCtrl.text.trim() : null,
      type: _type,
      isDefault: _isDefault,
    );

    bool success;
    if (widget.existing != null) {
      success = await provider.updateAddress(newAddr);
    } else {
      success = await provider.addAddress(newAddr);
    }
    if (!mounted) return;
    setState(() => _saving = false);
    if (success) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.existing != null;
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Drag handle
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
              isEdit ? 'Edit Address' : 'Add New Address',
              style: GoogleFonts.inter(
                fontSize: 20,
                fontWeight: FontWeight.w900,
                color: const Color(AppConstants.primaryDark),
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 20),

            // Use Current Location
            _locationButton(),
            const SizedBox(height: 12),

            // Address Type Selector
            _typeSelector(),
            const SizedBox(height: 20),

            // Fields
            _field(_labelCtrl, 'Label (e.g. My Home)', Icons.label_outline),
            _field(_addressCtrl, 'Full Address', Icons.home_outlined,
                maxLines: 2),
            _field(_cityCtrl, 'City', Icons.location_city_outlined),
            _field(_stateCtrl, 'State', Icons.map_outlined),
            _field(_pincodeCtrl, 'Pincode (Optional)', Icons.pin_outlined,
                keyboardType: TextInputType.number),

            // Set as default toggle
            _defaultToggle(),
            const SizedBox(height: 20),

            // Save button
            StatefulBuilder(
              builder: (ctx, setBtn) => GestureDetector(
                onTap: _isValid ? _save : null,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  height: 58,
                  decoration: BoxDecoration(
                    color: _isValid
                        ? const Color(AppConstants.primaryDark)
                        : const Color(AppConstants.borderColor),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Center(
                    child: _saving
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(
                                color: Colors.white, strokeWidth: 2.5),
                          )
                        : Text(
                            isEdit ? 'UPDATE ADDRESS' : 'SAVE ADDRESS',
                            style: GoogleFonts.inter(
                              color: _isValid
                                  ? Colors.white
                                  : const Color(AppConstants.textGray),
                              fontWeight: FontWeight.w900,
                              fontSize: 15,
                              letterSpacing: 0.5,
                            ),
                          ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _typeSelector() {
    final types = [
      (AddressType.home, Icons.home_rounded, 'Home'),
      (AddressType.office, Icons.work_rounded, 'Office'),
      (AddressType.other, Icons.location_on_rounded, 'Other'),
    ];
    return Row(
      children: types.map((t) {
        final isActive = _type == t.$1;
        return Expanded(
          child: GestureDetector(
            onTap: () => setState(() => _type = t.$1),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: EdgeInsets.only(right: t.$1 != AddressType.other ? 10 : 0),
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: isActive
                    ? const Color(AppConstants.primaryBlue).withValues(alpha: 0.1)
                    : const Color(AppConstants.bgLight),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isActive
                      ? const Color(AppConstants.primaryBlue)
                      : const Color(AppConstants.borderColor),
                  width: isActive ? 2 : 1,
                ),
              ),
              child: Column(
                children: [
                  Icon(t.$2,
                      size: 20,
                      color: isActive
                          ? const Color(AppConstants.primaryBlue)
                          : const Color(AppConstants.textGray)),
                  const SizedBox(height: 4),
                  Text(
                    t.$3,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: isActive
                          ? const Color(AppConstants.primaryBlue)
                          : const Color(AppConstants.textGray),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _locationButton() {
    return GestureDetector(
      onTap: _getCurrentLocation,
      child: Container(
        height: 52,
        decoration: BoxDecoration(
          color: const Color(AppConstants.primaryBlue).withOpacity(0.08),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: const Color(AppConstants.primaryBlue).withOpacity(0.2),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.my_location_rounded,
                size: 18, color: Color(AppConstants.primaryBlue)),
            const SizedBox(width: 10),
            Text(
              'USE CURRENT LOCATION',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w800,
                color: const Color(AppConstants.primaryBlue),
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _getCurrentLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Location services are disabled.')),
        );
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Location permissions are denied.')),
          );
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Location permissions are permanently denied.')),
        );
        return;
      }

      setState(() => _saving = true);
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      List<Placemark> placemarks =
          await placemarkFromCoordinates(position.latitude, position.longitude);

      if (placemarks.isNotEmpty) {
        Placemark place = placemarks[0];
        if (!mounted) return;
        setState(() {
          _addressCtrl.text =
              "${place.street ?? ''}, ${place.subLocality ?? ''}, ${place.locality ?? ''}";
          _cityCtrl.text = place.locality ?? '';
          _stateCtrl.text = place.administrativeArea ?? '';
          _pincodeCtrl.text = place.postalCode ?? '';
          _saving = false;
        });
      } else {
        if (!mounted) return;
        setState(() => _saving = false);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _saving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  Widget _field(
    TextEditingController ctrl,
    String label,
    IconData icon, {
    TextInputType? keyboardType,
    int maxLines = 1,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: const Color(AppConstants.bgLight),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(AppConstants.borderColor)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
        child: Row(
          children: [
            Icon(icon, size: 18, color: const Color(AppConstants.primaryBlue)),
            const SizedBox(width: 10),
            Expanded(
              child: TextField(
                controller: ctrl,
                keyboardType: keyboardType,
                maxLines: maxLines,
                onChanged: (_) => setState(() {}),
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: const Color(AppConstants.primaryDark),
                ),
                decoration: InputDecoration(
                  labelText: label,
                  labelStyle: GoogleFonts.inter(
                    fontSize: 13,
                    color: const Color(AppConstants.textGray),
                    fontWeight: FontWeight.w500,
                  ),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(vertical: 14),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _defaultToggle() {
    return GestureDetector(
      onTap: () => setState(() => _isDefault = !_isDefault),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: _isDefault
              ? const Color(AppConstants.primaryBlue).withValues(alpha: 0.08)
              : const Color(AppConstants.bgLight),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: _isDefault
                ? const Color(AppConstants.primaryBlue)
                : const Color(AppConstants.borderColor),
          ),
        ),
        child: Row(
          children: [
            Icon(Icons.star_rounded,
                size: 20,
                color: _isDefault
                    ? const Color(AppConstants.primaryBlue)
                    : const Color(AppConstants.textGray)),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Set as default address',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: _isDefault
                      ? const Color(AppConstants.primaryBlue)
                      : const Color(AppConstants.textGray),
                ),
              ),
            ),
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: _isDefault
                    ? const Color(AppConstants.primaryBlue)
                    : Colors.white,
                shape: BoxShape.circle,
                border: Border.all(
                  color: _isDefault
                      ? const Color(AppConstants.primaryBlue)
                      : const Color(AppConstants.borderColor),
                  width: 2,
                ),
              ),
              child: _isDefault
                  ? const Icon(Icons.check_rounded,
                      size: 14, color: Colors.white)
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}
