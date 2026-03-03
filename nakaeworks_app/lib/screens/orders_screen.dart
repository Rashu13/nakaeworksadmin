import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../models/order_model.dart';
import '../providers/orders_provider.dart';
import '../utils/constants.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    // Fetch real orders from backend
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrdersProvider>().fetchOrders();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(AppConstants.bgLight),
      body: Column(
        children: [
          _buildHeader(),
          _buildTabBar(),
          Expanded(
            child: Consumer<OrdersProvider>(
              builder: (context, provider, _) {
                return TabBarView(
                  controller: _tabController,
                  children: [
                    _buildOrderList(provider.activeOrders, isActive: true),
                    _buildOrderList(provider.pastOrders, isActive: false),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  // ─── Header ─────────────────────────────────────────────────────

  Widget _buildHeader() {
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
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'My Orders',
                style: GoogleFonts.inter(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: const Color(AppConstants.primaryDark),
                  letterSpacing: -0.5,
                ),
              ),
              Text(
                'Track your bookings',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  color: const Color(AppConstants.textGray),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ─── Tab Bar ─────────────────────────────────────────────────────

  Widget _buildTabBar() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
      child: Container(
        height: 44,
        decoration: BoxDecoration(
          color: const Color(AppConstants.bgLight),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(AppConstants.borderColor)),
        ),
        child: TabBar(
          controller: _tabController,
          indicator: BoxDecoration(
            color: const Color(AppConstants.primaryDark),
            borderRadius: BorderRadius.circular(12),
          ),
          indicatorSize: TabBarIndicatorSize.tab,
          dividerColor: Colors.transparent,
          labelColor: Colors.white,
          unselectedLabelColor: const Color(AppConstants.textGray),
          labelStyle: GoogleFonts.inter(
            fontWeight: FontWeight.w800,
            fontSize: 13,
          ),
          unselectedLabelStyle: GoogleFonts.inter(
            fontWeight: FontWeight.w600,
            fontSize: 13,
          ),
          tabs: const [
            Tab(text: 'Active'),
            Tab(text: 'Past Orders'),
          ],
        ),
      ),
    );
  }

  // ─── Order List ──────────────────────────────────────────────────

  Widget _buildOrderList(List<OrderModel> orders, {required bool isActive}) {
    if (orders.isEmpty) {
      return _buildEmpty(isActive);
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 80),
      itemCount: orders.length,
      itemBuilder: (context, index) => _OrderCard(
        order: orders[index],
        onCancel: isActive
            ? () => _confirmCancel(context, orders[index])
            : null,
      ),
    );
  }

  Widget _buildEmpty(bool isActive) {
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
                border: Border.all(color: const Color(AppConstants.borderColor)),
              ),
              child: Icon(
                isActive
                    ? Icons.hourglass_empty_rounded
                    : Icons.receipt_long_outlined,
                size: 36,
                color: const Color(AppConstants.textGray),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              isActive ? 'NO ACTIVE ORDERS' : 'NO PAST ORDERS',
              style: GoogleFonts.inter(
                fontSize: 16,
                fontWeight: FontWeight.w900,
                color: const Color(AppConstants.primaryDark),
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              isActive
                  ? 'Book a service and it will appear here.'
                  : 'Your completed bookings will show here.',
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

  void _confirmCancel(BuildContext context, OrderModel order) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Cancel Order?',
            style: GoogleFonts.inter(fontWeight: FontWeight.w900)),
        content: Text(
          'Are you sure you want to cancel booking #${order.id}?',
          style: GoogleFonts.inter(color: const Color(AppConstants.textGray)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Keep Order',
                style: GoogleFonts.inter(
                    color: const Color(AppConstants.textGray),
                    fontWeight: FontWeight.w600)),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              context.read<OrdersProvider>().cancelOrder(order.id);
            },
            child: Text('Cancel Order',
                style: GoogleFonts.inter(
                    color: const Color(0xFFEF4444),
                    fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
  }
}

// ─── Order Card ──────────────────────────────────────────────────────

class _OrderCard extends StatelessWidget {
  final OrderModel order;
  final VoidCallback? onCancel;

  const _OrderCard({required this.order, this.onCancel});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
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
          // ── Header row ──────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: Row(
              children: [
                // Status badge
                _StatusBadge(status: order.status),
                const Spacer(),
                Text(
                  '#${order.id}',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: const Color(AppConstants.textGray),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // ── Items ───────────────────────────────────────────
          ...order.items.take(2).map((item) => _ItemRow(item: item)),

          if (order.items.length > 2)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
              child: Text(
                '+${order.items.length - 2} more item(s)',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  color: const Color(AppConstants.textGray),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),

          const SizedBox(height: 12),
          Divider(height: 1, color: const Color(AppConstants.borderColor)),

          // ── Schedule & Address ─────────────────────────────
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _infoRow(
                  Icons.calendar_today_rounded,
                  '${_formatDate(order.serviceDate)}  •  ${order.timeSlot}',
                ),
                const SizedBox(height: 8),
                _infoRow(
                  Icons.location_on_rounded,
                  order.address,
                ),
                if (order.assignedProviderName != null && order.status != OrderStatus.pending) ...[
                  const SizedBox(height: 12),
                  _buildProviderInfo(order),
                ],
              ],
            ),
          ),

          // ── Price Breakdown ──
          if (order.taxAndFees > 1) // Only show if significant (e.g. > 1 rupee)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
              child: Column(
                children: [
                  _breakdownRow('Item Subtotal', '₹${order.itemsSubtotal.toStringAsFixed(0)}'),
                  const SizedBox(height: 6),
                  _breakdownRow(
                    'Taxes & Service Fees', 
                    '+ ₹${order.taxAndFees.toStringAsFixed(0)}',
                    isAccent: true,
                  ),
                ],
              ),
            ),

          Divider(height: 1, color: const Color(AppConstants.borderColor)),

          // ── Footer: Total + Action ──────────────────────────
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'TOTAL PAYABLE',
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        color: const Color(AppConstants.textGray),
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.5,
                      ),
                    ),
                    Text(
                      '₹${order.totalAmount.toStringAsFixed(0)}',
                      style: GoogleFonts.inter(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: const Color(AppConstants.primaryBlue),
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                if (onCancel != null)
                  GestureDetector(
                    onTap: onCancel,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFFECACA)),
                      ),
                      child: Text(
                        'Cancel',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFFEF4444),
                        ),
                      ),
                    ),
                  ),
                if (order.status == OrderStatus.completed)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      'Book Again',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: const Color(AppConstants.primaryBlue),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _breakdownRow(String label, String value, {bool isAccent = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 12,
            color: const Color(AppConstants.textGray),
            fontWeight: FontWeight.w500,
          ),
        ),
        Text(
          value,
          style: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: isAccent ? FontWeight.w800 : FontWeight.w700,
            color: isAccent ? const Color(0xFF16A34A) : const Color(AppConstants.primaryDark),
          ),
        ),
      ],
    );
  }

  Widget _buildProviderInfo(OrderModel order) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(AppConstants.primaryBlue).withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(AppConstants.primaryBlue).withValues(alpha: 0.1),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              border: Border.all(color: const Color(AppConstants.borderColor)),
            ),
            child: ClipOval(
              child: order.assignedProviderPicture != null
                  ? Image.network(
                      order.assignedProviderPicture!.startsWith('http')
                          ? order.assignedProviderPicture!
                          : '${AppConstants.baseUrl}${order.assignedProviderPicture}',
                      fit: BoxFit.cover,
                    )
                  : const Icon(Icons.person_rounded,
                      color: Color(AppConstants.textGray), size: 20),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'ASSIGNED PROVIDER',
                  style: GoogleFonts.inter(
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    color: const Color(AppConstants.primaryBlue),
                    letterSpacing: 0.5,
                  ),
                ),
                Text(
                  order.assignedProviderName!,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: const Color(AppConstants.primaryDark),
                  ),
                ),
              ],
            ),
          ),
          if (order.assignedProviderPhone != null)
            GestureDetector(
              onTap: () {
                // TODO: Implement call functionality if needed
              },
              child: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: const Color(AppConstants.primaryBlue),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.phone_rounded,
                    color: Colors.white, size: 18),
              ),
            ),
        ],
      ),
    );
  }

  Widget _infoRow(IconData icon, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: const Color(AppConstants.primaryBlue)),
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

  String _formatDate(DateTime date) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return '${days[date.weekday - 1]}, ${date.day} ${months[date.month - 1]}';
  }
}

// ─── Item Row ────────────────────────────────────────────────────────

class _ItemRow extends StatelessWidget {
  final OrderItem item;
  const _ItemRow({required this.item});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: const Color(AppConstants.bgLight),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.home_repair_service_rounded,
                color: Color(AppConstants.primaryBlue), size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.serviceName,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: const Color(AppConstants.primaryDark),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  'Qty: ${item.quantity}  •  ₹${item.total.toStringAsFixed(0)}',
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
}

// ─── Status Badge ─────────────────────────────────────────────────────

class _StatusBadge extends StatelessWidget {
  final OrderStatus status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    Color textColor;
    IconData icon;

    switch (status) {
      case OrderStatus.pending:
        bgColor = const Color(0xFFFFFBEB);
        textColor = const Color(0xFF92400E);
        icon = Icons.hourglass_top_rounded;
        break;
      case OrderStatus.confirmed:
        bgColor = const Color(0xFFEFF6FF);
        textColor = const Color(AppConstants.primaryBlue);
        icon = Icons.check_circle_outline_rounded;
        break;
      case OrderStatus.inProgress:
        bgColor = const Color(0xFFF0FDF4);
        textColor = const Color(0xFF15803D);
        icon = Icons.engineering_rounded;
        break;
      case OrderStatus.completed:
        bgColor = const Color(0xFFDCFCE7);
        textColor = const Color(0xFF15803D);
        icon = Icons.verified_rounded;
        break;
      case OrderStatus.cancelled:
        bgColor = const Color(0xFFFEF2F2);
        textColor = const Color(0xFFEF4444);
        icon = Icons.cancel_outlined;
        break;
    }

    final labels = {
      OrderStatus.pending: 'Pending',
      OrderStatus.confirmed: 'Confirmed',
      OrderStatus.inProgress: 'In Progress',
      OrderStatus.completed: 'Completed',
      OrderStatus.cancelled: 'Cancelled',
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: textColor),
          const SizedBox(width: 6),
          Text(
            labels[status]!,
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }
}
