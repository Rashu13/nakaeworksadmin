import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../controllers/users_controller.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/constants/app_constants.dart';
import 'package:cached_network_image/cached_network_image.dart';

class UsersView extends GetView<UsersController> {
  const UsersView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Title and Create Action
        Padding(
          padding: const EdgeInsets.only(left: 24, right: 24, top: 24),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'User Accounts',
                    style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    'Manage consumers, providers, and administrative system accounts.',
                    style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textGray),
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: () => _showAddUserDialog(context),
                icon: const Icon(LucideIcons.plus, size: 16),
                label: const Text('Add User'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accentBlue,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Roles Filter
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Obx(() => Row(
                children: [
                  _buildRoleTab('Customers', 'consumer'),
                  const SizedBox(width: 8),
                  _buildRoleTab('Providers', 'provider'),
                  const SizedBox(width: 8),
                  _buildRoleTab('Administrators', 'admin'),
                ],
              )),
        ),
        const SizedBox(height: 16),

        // Users Grid/List
        Expanded(
          child: Obx(() {
            if (controller.isLoading.value) {
              return const Center(child: CircularProgressIndicator(color: AppTheme.accentBlue));
            }

            if (controller.users.isEmpty) {
              return Center(
                child: Text('No users found.', style: GoogleFonts.inter(color: AppTheme.textGray)),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              itemCount: controller.users.length,
              itemBuilder: (context, index) {
                final user = controller.users[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    leading: CircleAvatar(
                      radius: 24,
                      backgroundColor: AppTheme.borderLight,
                      child: ClipOval(
                        child: CachedNetworkImage(
                          imageUrl: AppConstants.getFullImageUrl(user.avatar),
                          width: 48,
                          height: 48,
                          fit: BoxFit.cover,
                          placeholder: (context, url) => const Icon(LucideIcons.user, color: AppTheme.textGray),
                          errorWidget: (context, url, error) => const Icon(LucideIcons.user, color: AppTheme.textGray),
                        ),
                      ),
                    ),
                    title: Text(
                      user.name,
                      style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    subtitle: Text(
                      'ID: ${user.id} • Email: ${user.email}\nPhone: ${user.phone ?? 'N/A'}',
                      style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textGray),
                    ),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Status Toggle Switch
                        Switch(
                          value: user.status,
                          activeColor: AppTheme.statusCompleted,
                          onChanged: (val) async {
                            final success = await controller.toggleUserStatus(user.id, val);
                            if (success) {
                              Get.snackbar('Success', 'User status updated', backgroundColor: AppTheme.statusCompleted, colorText: Colors.white);
                            }
                          },
                        ),
                        const SizedBox(width: 8),
                        IconButton(
                          icon: const Icon(LucideIcons.trash2, color: Colors.redAccent, size: 20),
                          onPressed: () => _confirmDelete(context, user.id, user.name),
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

  Widget _buildRoleTab(String label, String role) {
    final isSelected = controller.selectedRole.value == role;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          controller.changeRoleFilter(role);
        }
      },
      selectedColor: AppTheme.primaryNavy,
      backgroundColor: Colors.white,
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : AppTheme.textDark,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(color: isSelected ? AppTheme.primaryNavy : AppTheme.borderLight),
      ),
    );
  }

  void _showAddUserDialog(BuildContext context) {
    final nameCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final pwdCtrl = TextEditingController();
    String selectedRole = 'consumer';

    Get.dialog(
      AlertDialog(
        title: const Text('Add New User Account'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameCtrl, decoration: const InputDecoration(hintText: 'Full Name')),
              const SizedBox(height: 12),
              TextField(controller: emailCtrl, decoration: const InputDecoration(hintText: 'Email Address')),
              const SizedBox(height: 12),
              TextField(controller: phoneCtrl, decoration: const InputDecoration(hintText: 'Phone Number')),
              const SizedBox(height: 12),
              TextField(controller: pwdCtrl, obscureText: true, decoration: const InputDecoration(hintText: 'Password')),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: selectedRole,
                items: const [
                  DropdownMenuItem(value: 'consumer', child: Text('Customer')),
                  DropdownMenuItem(value: 'provider', child: Text('Provider')),
                  DropdownMenuItem(value: 'admin', child: Text('Administrator')),
                ],
                onChanged: (val) {
                  if (val != null) selectedRole = val;
                },
                decoration: const InputDecoration(hintText: 'Account Role'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (nameCtrl.text.isEmpty || emailCtrl.text.isEmpty || pwdCtrl.text.isEmpty) return;
              final success = await controller.createUser(
                name: nameCtrl.text.trim(),
                email: emailCtrl.text.trim(),
                password: pwdCtrl.text,
                phone: phoneCtrl.text.trim(),
                role: selectedRole,
              );
              Get.back();
              if (success) {
                Get.snackbar('Success', 'User created successfully', backgroundColor: AppTheme.statusCompleted, colorText: Colors.white);
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accentBlue, foregroundColor: Colors.white),
            child: const Text('Add User'),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(BuildContext context, int userId, String userName) {
    Get.dialog(
      AlertDialog(
        title: const Text('Delete Account'),
        content: Text('Are you sure you want to delete account for "$userName"? This action is irreversible.'),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final success = await controller.deleteUser(userId);
              Get.back();
              if (success) {
                Get.snackbar('Success', 'Account deleted successfully', backgroundColor: AppTheme.statusCompleted, colorText: Colors.white);
              } else {
                Get.snackbar('Error', 'Cannot delete admin or active entity accounts', backgroundColor: Colors.redAccent, colorText: Colors.white);
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, foregroundColor: Colors.white),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}
