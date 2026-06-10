import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../controllers/bookings_controller.dart';
import '../../../../core/theme/app_theme.dart';

class BookingsView extends GetView<BookingsController> {
  const BookingsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Title & Search
        Padding(
          padding: const EdgeInsets.only(left: 24, right: 24, top: 24),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Booking Management',
                    style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    'View and manage customer service reservations.',
                    style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textGray),
                  ),
                ],
              ),
              // Search input
              SizedBox(
                width: 250,
                child: TextField(
                  onChanged: controller.searchBooking,
                  decoration: const InputDecoration(
                    hintText: 'Search by Booking #...',
                    prefixIcon: Icon(LucideIcons.search, size: 18),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Filters Tab Row
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Obx(() => Row(
                  children: [
                    _buildFilterChip('All Bookings', ''),
                    _buildFilterChip('Pending', 'pending'),
                    _buildFilterChip('Confirmed', 'confirmed'),
                    _buildFilterChip('In Progress', 'in_progress'),
                    _buildFilterChip('Completed', 'completed'),
                    _buildFilterChip('Cancelled', 'cancelled'),
                  ],
                )),
          ),
        ),
        const SizedBox(height: 16),

        // Bookings List
        Expanded(
          child: Obx(() {
            if (controller.isLoading.value) {
              return const Center(child: CircularProgressIndicator(color: AppTheme.accentBlue));
            }

            if (controller.bookings.isEmpty) {
              return Center(
                child: Text(
                  'No bookings found matching filters.',
                  style: GoogleFonts.inter(color: AppTheme.textGray),
                ),
              );
            }

            final currencyFormatter = NumberFormat.simpleCurrency(locale: 'en_IN', decimalDigits: 0);

            return ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              itemCount: controller.bookings.length,
              itemBuilder: (context, index) {
                final booking = controller.bookings[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: LayoutBuilder(
                      builder: (context, constraints) {
                        final isMobile = constraints.maxWidth < 650;
                        final bookingInfo = Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppTheme.bgLight,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(LucideIcons.calendarDays, color: AppTheme.primaryNavy, size: 24),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        booking.bookingNumber,
                                        style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16),
                                      ),
                                      const SizedBox(width: 8),
                                      _buildBadge(booking.statusName, booking.statusSlug),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Service: ${booking.serviceName}',
                                    style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: AppTheme.textDark),
                                  ),
                                  Text(
                                    'Customer: ${booking.consumerName} (${booking.consumerEmail})',
                                    style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textGray),
                                  ),
                                  Text(
                                    'Date: ${DateFormat('dd MMM yyyy, hh:mm a').format(booking.dateTime)}',
                                    style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textGray),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        );

                        final bookingActions = [
                          Text(
                            currencyFormatter.format(booking.totalAmount),
                            style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 18),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              ElevatedButton.icon(
                                onPressed: () => _showStatusDialog(context, booking.id, booking.statusSlug),
                                icon: const Icon(LucideIcons.checkSquare, size: 14),
                                label: const Text('Status'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.white,
                                  foregroundColor: AppTheme.primaryNavy,
                                  side: const BorderSide(color: AppTheme.borderLight),
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                              ),
                              const SizedBox(width: 8),
                              ElevatedButton.icon(
                                onPressed: () => _showAssignDialog(context, booking.id),
                                icon: const Icon(LucideIcons.userPlus, size: 14),
                                label: const Text('Assign'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppTheme.accentBlue,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                              ),
                            ],
                          ),
                        ];

                        if (isMobile) {
                          return Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              bookingInfo,
                              const Divider(color: AppTheme.borderLight, height: 24),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    currencyFormatter.format(booking.totalAmount),
                                    style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 18),
                                  ),
                                  Row(
                                    children: [
                                      ElevatedButton(
                                        onPressed: () => _showStatusDialog(context, booking.id, booking.statusSlug),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: Colors.white,
                                          foregroundColor: AppTheme.primaryNavy,
                                          side: const BorderSide(color: AppTheme.borderLight),
                                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                        ),
                                        child: const Text('Status'),
                                      ),
                                      const SizedBox(width: 8),
                                      ElevatedButton(
                                        onPressed: () => _showAssignDialog(context, booking.id),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: AppTheme.accentBlue,
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                        ),
                                        child: const Text('Assign'),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          );
                        }

                        return Row(
                          children: [
                            Expanded(child: bookingInfo),
                            const SizedBox(width: 16),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: bookingActions,
                            ),
                          ],
                        );
                      },
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

  Widget _buildFilterChip(String label, String slug) {
    final isSelected = controller.selectedStatus.value == slug;
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (selected) {
          if (selected) {
            controller.filterByStatus(slug);
          }
        },
        selectedColor: AppTheme.primaryNavy,
        backgroundColor: Colors.white,
        labelStyle: TextStyle(
          color: isSelected ? Colors.white : AppTheme.textDark,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: isSelected ? AppTheme.primaryNavy : AppTheme.borderLight),
        ),
      ),
    );
  }

  Widget _buildBadge(String label, String slug) {
    Color bg = AppTheme.borderLight;
    Color fg = AppTheme.textDark;

    switch (slug) {
      case 'pending':
        bg = AppTheme.statusPending.withOpacity(0.12);
        fg = AppTheme.statusPending;
        break;
      case 'confirmed':
        bg = AppTheme.statusConfirmed.withOpacity(0.12);
        fg = AppTheme.statusConfirmed;
        break;
      case 'in_progress':
        bg = AppTheme.statusInProgress.withOpacity(0.12);
        fg = AppTheme.statusInProgress;
        break;
      case 'completed':
        bg = AppTheme.statusCompleted.withOpacity(0.12);
        fg = AppTheme.statusCompleted;
        break;
      case 'cancelled':
        bg = AppTheme.statusCancelled.withOpacity(0.12);
        fg = AppTheme.statusCancelled;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: fg),
      ),
    );
  }

  void _showStatusDialog(BuildContext context, int bookingId, String currentSlug) {
    Get.dialog(
      AlertDialog(
        title: Text(
          'Update Booking Status',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        content: SizedBox(
          width: 350,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildDialogStatusOption(context, bookingId, 'Pending', 'pending'),
              _buildDialogStatusOption(context, bookingId, 'Confirmed', 'confirmed'),
              _buildDialogStatusOption(context, bookingId, 'In Progress', 'in_progress'),
              _buildDialogStatusOption(context, bookingId, 'Completed', 'completed'),
              _buildDialogStatusOption(context, bookingId, 'Cancelled', 'cancelled'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDialogStatusOption(BuildContext context, int bookingId, String name, String slug) {
    return ListTile(
      title: Text(name),
      onTap: () async {
        final success = await controller.updateStatus(bookingId, slug);
        Get.back();
        if (success) {
          Get.snackbar('Success', 'Booking status updated successfully', backgroundColor: AppTheme.statusCompleted, colorText: Colors.white);
        } else {
          Get.snackbar('Error', 'Failed to update booking status', backgroundColor: Colors.redAccent, colorText: Colors.white);
        }
      },
    );
  }

  void _showAssignDialog(BuildContext context, int bookingId) {
    final selectedProviderId = RxnInt();
    
    // Refresh providers list when opening dialog
    controller.fetchProviders();

    Get.dialog(
      AlertDialog(
        title: const Text('Assign Provider'),
        content: SizedBox(
          width: 400,
          child: Obx(() {
            if (controller.isLoadingProviders.value) {
              return const SizedBox(
                height: 100,
                child: Center(child: CircularProgressIndicator(color: AppTheme.accentBlue)),
              );
            }

            if (controller.providers.isEmpty) {
              return const Padding(
                padding: EdgeInsets.symmetric(vertical: 20),
                child: Text('No active providers found in the system.'),
              );
            }

            return Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Select a provider from the list to assign to this job:'),
                const SizedBox(height: 16),
                DropdownButtonFormField<int>(
                  value: selectedProviderId.value,
                  decoration: const InputDecoration(
                    labelText: 'Choose Provider',
                    border: OutlineInputBorder(),
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                  items: controller.providers.map((prov) {
                    return DropdownMenuItem<int>(
                      value: prov.id,
                      child: Text('${prov.name} (ID: ${prov.id})'),
                    );
                  }).toList(),
                  onChanged: (val) {
                    selectedProviderId.value = val;
                  },
                ),
              ],
            );
          }),
        ),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Cancel')),
          Obx(() {
            final isEnabled = selectedProviderId.value != null;
            return ElevatedButton(
              onPressed: isEnabled
                  ? () async {
                      final success = await controller.assignProvider(bookingId, selectedProviderId.value!);
                      Get.back();
                      if (success) {
                        Get.snackbar(
                          'Success',
                          'Provider assigned successfully',
                          backgroundColor: AppTheme.statusCompleted,
                          colorText: Colors.white,
                        );
                      } else {
                        Get.snackbar(
                          'Error',
                          'Failed to assign provider.',
                          backgroundColor: Colors.redAccent,
                          colorText: Colors.white,
                        );
                      }
                    }
                  : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.accentBlue,
                foregroundColor: Colors.white,
              ),
              child: const Text('Assign'),
            );
          }),
        ],
      ),
    );
  }
}
