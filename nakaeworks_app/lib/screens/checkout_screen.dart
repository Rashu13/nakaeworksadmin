import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import '../providers/cart_provider.dart';
import '../providers/auth_provider.dart';
import '../providers/orders_provider.dart';
import '../providers/addresses_provider.dart';
import '../utils/constants.dart';
import 'order_success_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _landmarkCtrl = TextEditingController();
  final _couponCtrl = TextEditingController();

  DateTime? _selectedDate;
  String? _selectedSlot;
  bool _isPlacing = false;
  int _currentStep = 0; // 0=Address, 1=Schedule, 2=Review
  String? _selectedAddressId; // from backend saved addresses

  // For displaying validation errors in UI
  String? _couponError;

  final List<String> _timeSlots = [
    '08:00 AM – 10:00 AM',
    '10:00 AM – 12:00 PM',
    '12:00 PM – 02:00 PM',
    '02:00 PM – 04:00 PM',
    '04:00 PM – 06:00 PM',
    '06:00 PM – 08:00 PM',
  ];

  @override
  void initState() {
    super.initState();
    // Pre-fill user data & Fetch addresses
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = context.read<AuthProvider>().user;
      if (user != null) {
        _nameCtrl.text = user.name;
        _phoneCtrl.text = user.phone ?? '';
      }
      // Load saved addresses from API
      context.read<AddressesProvider>().fetchAddresses();
      
      // Initialize coupon controller if already applied in cart
      final cart = context.read<CartProvider>();
      if (cart.appliedCoupon != null) {
        _couponCtrl.text = cart.appliedCoupon!;
      }
    });
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _addressCtrl.dispose();
    _landmarkCtrl.dispose();
    _couponCtrl.dispose();
    super.dispose();
  }

  Widget _buildLocationPickerButton() {
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

      setState(() => _isPlacing = true);
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
          _isPlacing = false;
        });
      } else {
        if (!mounted) return;
        setState(() => _isPlacing = false);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isPlacing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  Future<void> _validateCoupon() async {
    final cart = context.read<CartProvider>();
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

  void _removeCoupon() {
    context.read<CartProvider>().removeCoupon();
    _couponCtrl.clear();
    setState(() => _couponError = null);
  }



  Future<void> _placeOrder() async {
    final cart = context.read<CartProvider>();
    final ordersProvider = context.read<OrdersProvider>();
    final addressesProvider = context.read<AddressesProvider>();
    setState(() => _isPlacing = true);

    try {
      // Determine addressId — use selected saved address OR create one if manual
      String addressId = _selectedAddressId ?? '';

      // If no saved address selected, use first available from API
      if (addressId.isEmpty) {
        final defaultAddr = addressesProvider.defaultAddress;
        if (defaultAddr != null) {
          addressId = defaultAddr.id;
        } else {
          // Add the manually entered address first
          final newAddr = AddressModel(
            id: '',
            label: 'home',
            fullAddress: _addressCtrl.text.trim() +
                (_landmarkCtrl.text.trim().isNotEmpty
                    ? ', ${_landmarkCtrl.text.trim()}'
                    : ''),
            city: '',
            state: '',
            pincode: '',
            type: AddressType.home,
            isDefault: true,
          );
          await addressesProvider.addAddress(newAddr);
          addressId = addressesProvider.defaultAddress?.id ?? '';
        }
      }

      if (addressId.isEmpty) {
        throw Exception('Please add an address first');
      }

      // Get providerId from first cart item
      final providerId = cart.items.isNotEmpty
          ? (cart.items.first.service.providerId ?? '0')
          : '0';

      final order = await ordersProvider.placeOrder(
        cartItems: List.from(cart.items),
        customerName: _nameCtrl.text.trim(),
        phone: _phoneCtrl.text.trim(),
        address: _addressCtrl.text.trim(),
        serviceDate: _selectedDate!,
        timeSlot: _selectedSlot!,
        addressId: addressId,
        providerId: providerId,
        couponCode: cart.appliedCoupon,
      );

      cart.clear();
      if (!mounted) return;
      setState(() => _isPlacing = false);

      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => OrderSuccessScreen(order: order),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _isPlacing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Booking failed: ${e.toString().replaceAll('Exception: ', '')}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  bool get _canProceedStep0 =>
      _nameCtrl.text.trim().isNotEmpty &&
      _phoneCtrl.text.trim().length >= 10 &&
      _addressCtrl.text.trim().isNotEmpty;

  bool get _canProceedStep1 =>
      _selectedDate != null && _selectedSlot != null;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(AppConstants.bgLight),
      body: Column(
        children: [
          _buildHeader(),
          _buildStepIndicator(),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 120),
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: _currentStep == 0
                    ? _buildAddressStep()
                    : _currentStep == 1
                        ? _buildScheduleStep()
                        : _buildReviewStep(),
              ),
            ),
          ),
          _buildBottomBar(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      color: Colors.white,
      padding: EdgeInsets.fromLTRB(
          20, MediaQuery.of(context).padding.top + 12, 20, 16),
      child: Row(
        children: [
          GestureDetector(
            onTap: () {
              if (_currentStep > 0) {
                setState(() => _currentStep--);
              } else {
                Navigator.of(context).pop();
              }
            },
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: const Color(AppConstants.bgLight),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(AppConstants.borderColor)),
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
                  ['Delivery Details', 'Schedule Service', 'Review Order'][_currentStep],
                  style: GoogleFonts.inter(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: const Color(AppConstants.primaryDark),
                    letterSpacing: -0.5,
                  ),
                ),
                Text(
                  'Step ${_currentStep + 1} of 3',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: const Color(AppConstants.textGray),
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

  Widget _buildStepIndicator() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
      child: Row(
        children: List.generate(3, (i) {
          final isActive = i == _currentStep;
          final isDone = i < _currentStep;
          return Expanded(
            child: Row(
              children: [
                // Circle
                AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: isDone
                        ? const Color(0xFF16A34A)
                        : isActive
                            ? const Color(AppConstants.primaryBlue)
                            : const Color(AppConstants.bgLight),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isDone
                          ? const Color(0xFF16A34A)
                          : isActive
                              ? const Color(AppConstants.primaryBlue)
                              : const Color(AppConstants.borderColor),
                      width: 2,
                    ),
                  ),
                  child: Center(
                    child: isDone
                        ? const Icon(Icons.check_rounded,
                            size: 14, color: Colors.white)
                        : Text(
                            '${i + 1}',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: isActive
                                  ? Colors.white
                                  : const Color(AppConstants.textGray),
                            ),
                          ),
                  ),
                ),
                // Line
                if (i < 2)
                  Expanded(
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      height: 2,
                      color: i < _currentStep
                          ? const Color(0xFF16A34A)
                          : const Color(AppConstants.borderColor),
                    ),
                  ),
              ],
            ),
          );
        }),
      ),
    );
  }

  // ─── STEP 1: Address ────────────────────────────────────────────

  Widget _buildSavedAddressesList() {
    return Consumer<AddressesProvider>(
      builder: (context, provider, _) {
        if (provider.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }
        if (provider.addresses.isEmpty) {
          return Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(AppConstants.borderColor)),
            ),
            child: Text(
              'No saved addresses found. Add one below.',
              style: GoogleFonts.inter(color: const Color(AppConstants.textGray)),
            ),
          );
        }

        return SizedBox(
          height: 100,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: provider.addresses.length,
            itemBuilder: (context, index) {
              final addr = provider.addresses[index];
              final isSelected = _selectedAddressId == addr.id;
              return GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedAddressId = addr.id;
                    _addressCtrl.text = addr.fullAddress;
                    // If backend specific fields needed, we can set them here
                  });
                },
                child: Container(
                  width: 200,
                  margin: const EdgeInsets.only(right: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? const Color(AppConstants.primaryBlue).withOpacity(0.1)
                        : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected
                          ? const Color(AppConstants.primaryBlue)
                          : const Color(AppConstants.borderColor),
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(addr.typeIcon,
                              size: 16,
                              color: isSelected
                                  ? const Color(AppConstants.primaryBlue)
                                  : const Color(AppConstants.textGray)),
                          const SizedBox(width: 8),
                          Text(
                            addr.label,
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: isSelected
                                  ? const Color(AppConstants.primaryBlue)
                                  : const Color(AppConstants.primaryDark),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        addr.fullAddress,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: const Color(AppConstants.textGray),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildAddressStep() {
    return Form(
      key: _formKey,
      child: Column(
        key: const ValueKey('step0'),
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionLabel('SAVED ADDRESSES'),
          const SizedBox(height: 12),
          _buildSavedAddressesList(),
          const SizedBox(height: 24),
          _sectionLabel('OR ENTER MANUALLY'),
          const SizedBox(height: 12),
          _buildCard([
            _buildTextField(
              ctrl: _nameCtrl,
              label: 'Full Name',
              icon: Icons.person_outline_rounded,
              onChanged: (_) => setState(() {}),
            ),
            _divider(),
            _buildTextField(
              ctrl: _phoneCtrl,
              label: 'Phone Number',
              icon: Icons.phone_outlined,
              keyboardType: TextInputType.phone,
              onChanged: (_) => setState(() {}),
            ),
          ]),
          const SizedBox(height: 24),
          _sectionLabel('SERVICE ADDRESS'),
          const SizedBox(height: 12),
          _buildLocationPickerButton(),
          const SizedBox(height: 16),
          _buildCard([
            _buildTextField(
              ctrl: _addressCtrl,
              label: 'Full Address',
              icon: Icons.home_outlined,
              maxLines: 2,
              onChanged: (_) => setState(() {}),
            ),
            _divider(),
            _buildTextField(
              ctrl: _landmarkCtrl,
              label: 'Landmark (Optional)',
              icon: Icons.location_on_outlined,
              onChanged: (_) => setState(() {}),
            ),
          ]),
          const SizedBox(height: 16),
          // Address type selector
          _sectionLabel('ADDRESS TYPE'),
          const SizedBox(height: 12),
          _AddressTypeSelector(),
        ],
      ),
    );
  }

  // ─── STEP 2: Schedule ────────────────────────────────────────────

  Widget _buildScheduleStep() {
    return Column(
      key: const ValueKey('step1'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionLabel('SELECT DATE'),
        const SizedBox(height: 12),
        _buildDateSelector(),
        const SizedBox(height: 24),
        _sectionLabel('SELECT TIME SLOT'),
        const SizedBox(height: 12),
        ..._timeSlots.map((slot) => _buildSlotTile(slot)),
      ],
    );
  }

  Widget _buildDateSelector() {
    return SizedBox(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 4),
        itemCount: 14, // Next 14 days
        itemBuilder: (context, index) {
          final date = DateTime.now().add(Duration(days: index + 1));
          final isSelected = _selectedDate != null &&
              _selectedDate!.year == date.year &&
              _selectedDate!.month == date.month &&
              _selectedDate!.day == date.day;

          return GestureDetector(
            onTap: () => setState(() => _selectedDate = date),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 70,
              margin: const EdgeInsets.only(right: 12),
              decoration: BoxDecoration(
                color: isSelected
                    ? const Color(AppConstants.primaryBlue)
                    : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected
                      ? const Color(AppConstants.primaryBlue)
                      : const Color(AppConstants.borderColor),
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: const Color(AppConstants.primaryBlue).withOpacity(0.3),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        )
                      ]
                    : null,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _weekDayShort(date).toUpperCase(),
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: isSelected ? Colors.white70 : const Color(AppConstants.textGray),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    date.day.toString(),
                    style: GoogleFonts.inter(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      color: isSelected ? Colors.white : const Color(AppConstants.primaryDark),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    _monthShort(date),
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: isSelected ? Colors.white70 : const Color(AppConstants.textGray),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  String _weekDayShort(DateTime date) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[date.weekday - 1];
  }

  String _monthShort(DateTime date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.month - 1];
  }

  Widget _buildSlotTile(String slot) {
    final isSelected = _selectedSlot == slot;
    return GestureDetector(
      onTap: () => setState(() => _selectedSlot = slot),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(AppConstants.primaryBlue).withOpacity(0.08)
              : Colors.white,
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
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: isSelected
                    ? const Color(AppConstants.primaryBlue)
                    : const Color(AppConstants.bgLight),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                Icons.access_time_rounded,
                size: 20,
                color: isSelected
                    ? Colors.white
                    : const Color(AppConstants.textGray),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                slot,
                style: GoogleFonts.inter(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: isSelected
                      ? const Color(AppConstants.primaryBlue)
                      : const Color(AppConstants.primaryDark),
                ),
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle_rounded,
                  color: Color(AppConstants.primaryBlue), size: 22),
          ],
        ),
      ),
    );
  }

  // ─── STEP 3: Review ────────────────────────────────────────────

  Widget _buildReviewStep() {
    final cart = context.watch<CartProvider>();

    return Column(
      key: const ValueKey('step2'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Order Items
        _sectionLabel('ORDER ITEMS'),
        const SizedBox(height: 12),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(AppConstants.borderColor)),
          ),
          child: Column(
            children: [
              for (int i = 0; i < cart.items.length; i++) ...[
                _ReviewItem(item: cart.items[i]),
                if (i < cart.items.length - 1)
                  Divider(
                      height: 1,
                      indent: 20,
                      color: const Color(AppConstants.borderColor)),
              ],
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Address Summary
        _sectionLabel('SERVICE ADDRESS'),
        const SizedBox(height: 12),
        _reviewInfoCard(
          icon: Icons.location_on_rounded,
          iconColor: const Color(0xFFEF4444),
          title: _nameCtrl.text,
          subtitle: '${_addressCtrl.text}'
              '${_landmarkCtrl.text.isNotEmpty ? '\n${_landmarkCtrl.text}' : ''}',
          trailing: _phoneCtrl.text,
        ),
        const SizedBox(height: 16),

        // Schedule Summary
        _sectionLabel('SCHEDULE'),
        const SizedBox(height: 12),
        _reviewInfoCard(
          icon: Icons.event_rounded,
          iconColor: const Color(AppConstants.primaryBlue),
          title: _formatDate(_selectedDate!),
          subtitle: _weekDay(_selectedDate!),
          trailing: _selectedSlot ?? '',
        ),
        const SizedBox(height: 24),

        // Coupon Section
        _sectionLabel('COUPON CODE'),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
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
                    hintText: 'Enter coupon code',
                    hintStyle: GoogleFonts.inter(fontSize: 14),
                    border: InputBorder.none,
                    errorText: _couponError,
                  ),
                  style: GoogleFonts.inter(fontWeight: FontWeight.bold),
                ),
              ),
              if (cart.appliedCoupon != null)
                TextButton(
                  onPressed: _removeCoupon,
                  child: const Text('REMOVE', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                )
              else
                cart.isValidating
                    ? const Padding(
                        padding: EdgeInsets.all(8.0),
                        child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
                      )
                    : TextButton(
                        onPressed: _validateCoupon,
                        child: const Text('APPLY', style: TextStyle(color: Color(AppConstants.primaryBlue), fontWeight: FontWeight.bold)),
                      ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Price Breakdown
        _sectionLabel('PRICE BREAKDOWN'),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(AppConstants.borderColor)),
          ),
          child: Column(
            children: [
              _priceRow('Subtotal', '₹${cart.subtotal.toStringAsFixed(0)}'),
              if (cart.discountAmount > 0) ...[
                const SizedBox(height: 10),
                _priceRow(
                  'Coupon Discount',
                  '- ₹${cart.discountAmount.toStringAsFixed(0)}',
                  valueColor: const Color(0xFF16A34A),
                ),
              ],
              const SizedBox(height: 10),
              _priceRow('Service Charges', '₹0', valueColor: const Color(0xFF16A34A)),
              const SizedBox(height: 10),
              _priceRow('Taxes', '₹0'),
              const Divider(height: 24),
              _priceRow(
                'TOTAL PAYABLE',
                '₹${cart.totalAmount.toStringAsFixed(0)}',
                isBold: true,
                valueColor: const Color(AppConstants.primaryBlue),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),
        // Payment method hint
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFFFFFBEB),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFFDE68A)),
          ),
          child: Row(
            children: [
              const Icon(Icons.payments_outlined,
                  color: Color(0xFFB45309), size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Pay via Cash, UPI, or Card at service time',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF92400E),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ─── Bottom Action Bar ───────────────────────────────────────────

  Widget _buildBottomBar() {
    final canNext = _currentStep == 0
        ? _canProceedStep0
        : _currentStep == 1
            ? _canProceedStep1
            : true;

    return Container(
      padding: EdgeInsets.fromLTRB(
          20, 16, 20, MediaQuery.of(context).padding.bottom + 16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.07),
            blurRadius: 20,
            offset: const Offset(0, -6),
          ),
        ],
      ),
      child: GestureDetector(
        onTap: canNext
            ? () {
                if (_currentStep < 2) {
                  setState(() => _currentStep++);
                } else {
                  _placeOrder();
                }
              }
            : null,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          height: 60,
          decoration: BoxDecoration(
            color: canNext
                ? const Color(AppConstants.primaryDark)
                : const Color(AppConstants.borderColor),
            borderRadius: BorderRadius.circular(20),
            boxShadow: canNext
                ? [
                    BoxShadow(
                      color: const Color(AppConstants.primaryDark)
                          .withOpacity(0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ]
                : [],
          ),
          child: Center(
            child: _isPlacing
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                        color: Colors.white, strokeWidth: 2.5),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        _currentStep == 2
                            ? 'PLACE ORDER'
                            : 'CONTINUE',
                        style: GoogleFonts.inter(
                          color: canNext
                              ? Colors.white
                              : const Color(AppConstants.textGray),
                          fontWeight: FontWeight.w900,
                          fontSize: 16,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Icon(
                        _currentStep == 2
                            ? Icons.check_circle_outline_rounded
                            : Icons.arrow_forward_rounded,
                        color: canNext
                            ? Colors.white
                            : const Color(AppConstants.textGray),
                        size: 20,
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }

  // ─── Helpers ───────────────────────────────────────────────────

  Widget _sectionLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        text,
        style: GoogleFonts.inter(
          fontSize: 11,
          fontWeight: FontWeight.w900,
          color: const Color(AppConstants.textGray),
          letterSpacing: 1.5,
        ),
      ),
    );
  }

  Widget _buildCard(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(AppConstants.borderColor)),
      ),
      child: Column(children: children),
    );
  }

  Widget _buildTextField({
    required TextEditingController ctrl,
    required String label,
    required IconData icon,
    TextInputType? keyboardType,
    int maxLines = 1,
    ValueChanged<String>? onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 20, color: const Color(AppConstants.primaryBlue)),
          const SizedBox(width: 12),
          Expanded(
            child: TextField(
              controller: ctrl,
              keyboardType: keyboardType,
              maxLines: maxLines,
              onChanged: onChanged,
              style: GoogleFonts.inter(
                fontSize: 15,
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
                contentPadding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _divider() => Divider(
      height: 1, indent: 48, color: const Color(AppConstants.borderColor));

  Widget _reviewInfoCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required String trailing,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(AppConstants.borderColor)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: iconColor, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: GoogleFonts.inter(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: const Color(AppConstants.primaryDark))),
                const SizedBox(height: 4),
                Text(subtitle,
                    style: GoogleFonts.inter(
                        fontSize: 13,
                        color: const Color(AppConstants.textGray),
                        height: 1.5)),
                if (trailing.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(AppConstants.bgLight),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(trailing,
                        style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: const Color(AppConstants.primaryBlue))),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _priceRow(String label, String value,
      {bool isBold = false, Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label,
            style: GoogleFonts.inter(
                fontSize: isBold ? 13 : 14,
                fontWeight: isBold ? FontWeight.w900 : FontWeight.w500,
                color: isBold
                    ? const Color(AppConstants.primaryDark)
                    : const Color(AppConstants.textGray),
                letterSpacing: isBold ? 0.5 : 0)),
        Text(value,
            style: GoogleFonts.inter(
                fontSize: isBold ? 20 : 14,
                fontWeight: FontWeight.w900,
                color: valueColor ?? const Color(AppConstants.primaryDark))),
      ],
    );
  }

  String _formatDate(DateTime date) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  String _weekDay(DateTime date) {
    const days = [
      'Monday', 'Tuesday', 'Wednesday',
      'Thursday', 'Friday', 'Saturday', 'Sunday'
    ];
    return days[date.weekday - 1];
  }
}

// ─── Address Type Selector ─────────────────────────────────────────

class _AddressTypeSelector extends StatefulWidget {
  @override
  State<_AddressTypeSelector> createState() => _AddressTypeSelectorState();
}

class _AddressTypeSelectorState extends State<_AddressTypeSelector> {
  int _selected = 0;
  final _types = [
    (Icons.home_rounded, 'Home'),
    (Icons.work_rounded, 'Office'),
    (Icons.location_on_rounded, 'Other'),
  ];

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(_types.length, (i) {
        final isActive = _selected == i;
        return Expanded(
          child: GestureDetector(
            onTap: () => setState(() => _selected = i),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: EdgeInsets.only(right: i < 2 ? 10 : 0),
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                color: isActive
                    ? const Color(AppConstants.primaryBlue).withOpacity(0.1)
                    : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isActive
                      ? const Color(AppConstants.primaryBlue)
                      : const Color(AppConstants.borderColor),
                  width: isActive ? 2 : 1,
                ),
              ),
              child: Column(
                children: [
                  Icon(
                    _types[i].$1,
                    size: 22,
                    color: isActive
                        ? const Color(AppConstants.primaryBlue)
                        : const Color(AppConstants.textGray),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _types[i].$2,
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
      }),
    );
  }
}

// ─── Review Item Widget ─────────────────────────────────────────────

class _ReviewItem extends StatelessWidget {
  final CartItem item;
  const _ReviewItem({required this.item});

  @override
  Widget build(BuildContext context) {
    final thumb = item.service.thumbnail != null
        ? (item.service.thumbnail!.startsWith('http')
            ? item.service.thumbnail!
            : '${AppConstants.baseUrl}${item.service.thumbnail}')
        : 'https://images.unsplash.com/photo-1581578731117-104f8a746950?w=200';

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: CachedNetworkImage(
              imageUrl: thumb,
              width: 60,
              height: 60,
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.service.name,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: const Color(AppConstants.primaryDark),
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  'Qty: ${item.quantity}',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: const Color(AppConstants.textGray),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          Text(
            '₹${item.total.toStringAsFixed(0)}',
            style: GoogleFonts.inter(
              fontSize: 16,
              fontWeight: FontWeight.w900,
              color: const Color(AppConstants.primaryBlue),
            ),
          ),
        ],
      ),
    );
  }
}
