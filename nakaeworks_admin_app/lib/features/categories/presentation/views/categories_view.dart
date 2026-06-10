import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../controllers/categories_controller.dart';
import '../../data/models/category_model.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/constants/app_constants.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:image_picker/image_picker.dart';

class CategoriesView extends GetView<CategoriesController> {
  const CategoriesView({super.key});

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
                    'Service Categories',
                    style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    'Group your services into categories with custom icons.',
                    style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textGray),
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: () => _showAddCategoryDialog(context),
                icon: const Icon(LucideIcons.plus, size: 16),
                label: const Text('Add Category'),
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

        // List
        Expanded(
          child: Obx(() {
            if (controller.isLoading.value) {
              return const Center(child: CircularProgressIndicator(color: AppTheme.accentBlue));
            }

            if (controller.categories.isEmpty) {
              return Center(
                child: Text('No categories found.', style: GoogleFonts.inter(color: AppTheme.textGray)),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              itemCount: controller.categories.length,
              itemBuilder: (context, index) {
                final category = controller.categories[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    leading: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: CachedNetworkImage(
                        imageUrl: AppConstants.getFullImageUrl(category.icon),
                        width: 48,
                        height: 48,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(color: AppTheme.bgLight, child: const Icon(LucideIcons.shapes, color: AppTheme.textGray)),
                        errorWidget: (context, url, error) => Container(color: AppTheme.bgLight, child: const Icon(LucideIcons.shapes, color: AppTheme.textGray)),
                      ),
                    ),
                    title: Text(
                      category.name,
                      style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    subtitle: Text(
                      'Slug: ${category.slug} • Services: ${category.servicesCount}',
                      style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textGray),
                    ),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(LucideIcons.edit2, size: 18, color: AppTheme.textGray),
                          onPressed: () => _showEditCategoryDialog(context, category),
                        ),
                        IconButton(
                          icon: const Icon(LucideIcons.trash2, size: 18, color: Colors.redAccent),
                          onPressed: () => _confirmDelete(context, category.id, category.name),
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

  void _showAddCategoryDialog(BuildContext context) {
    final nameCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final uploadedIconUrl = RxnString();
    final isUploading = false.obs;

    Get.dialog(
      AlertDialog(
        title: const Text('Add New Category'),
        content: Obx(() => Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(controller: nameCtrl, decoration: const InputDecoration(hintText: 'Category Name')),
            const SizedBox(height: 12),
            TextField(controller: descCtrl, decoration: const InputDecoration(hintText: 'Description (Optional)')),
            const SizedBox(height: 16),
            const Text('Category Icon/Image', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 8),
            if (isUploading.value)
              const Center(child: CircularProgressIndicator(color: AppTheme.accentBlue))
            else if (uploadedIconUrl.value != null)
              Center(
                child: Stack(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.network(
                        AppConstants.getFullImageUrl(uploadedIconUrl.value),
                        height: 100,
                        width: 100,
                        fit: BoxFit.cover,
                      ),
                    ),
                    Positioned(
                      top: 0,
                      right: 0,
                      child: CircleAvatar(
                        radius: 16,
                        backgroundColor: Colors.black54,
                        child: IconButton(
                          padding: EdgeInsets.zero,
                          icon: const Icon(Icons.close, color: Colors.white, size: 16),
                          onPressed: () => uploadedIconUrl.value = null,
                        ),
                      ),
                    ),
                  ],
                ),
              )
            else
              Center(
                child: ElevatedButton.icon(
                  onPressed: () async {
                    final picker = ImagePicker();
                    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
                    if (pickedFile != null) {
                      isUploading.value = true;
                      try {
                        final bytes = await pickedFile.readAsBytes();
                        final url = await controller.uploadImage(
                          pickedFile.path,
                          bytes,
                          pickedFile.name,
                        );
                        if (url != null) {
                          uploadedIconUrl.value = url;
                        } else {
                          Get.snackbar('Error', 'Failed to upload image');
                        }
                      } catch (e) {
                        Get.log('Error picking/uploading: $e');
                      } finally {
                        isUploading.value = false;
                      }
                    }
                  },
                  icon: const Icon(LucideIcons.upload, size: 16),
                  label: const Text('Pick Image'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.bgLight,
                    foregroundColor: AppTheme.textDark,
                  ),
                ),
              ),
          ],
        )),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (nameCtrl.text.isEmpty) return;
              final success = await controller.createCategory(
                nameCtrl.text.trim(),
                uploadedIconUrl.value,
                descCtrl.text.trim(),
              );
              Get.back();
              if (success) {
                Get.snackbar('Success', 'Category created successfully', backgroundColor: AppTheme.statusCompleted, colorText: Colors.white);
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accentBlue, foregroundColor: Colors.white),
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }

  void _showEditCategoryDialog(BuildContext context, CategoryModel category) {
    final nameCtrl = TextEditingController(text: category.name);
    final uploadedIconUrl = RxnString(category.icon);
    final isUploading = false.obs;

    Get.dialog(
      AlertDialog(
        title: const Text('Edit Category'),
        content: Obx(() => Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(controller: nameCtrl, decoration: const InputDecoration(hintText: 'Category Name')),
            const SizedBox(height: 16),
            const Text('Category Icon/Image', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 8),
            if (isUploading.value)
              const Center(child: CircularProgressIndicator(color: AppTheme.accentBlue))
            else if (uploadedIconUrl.value != null)
              Center(
                child: Stack(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.network(
                        AppConstants.getFullImageUrl(uploadedIconUrl.value),
                        height: 100,
                        width: 100,
                        fit: BoxFit.cover,
                      ),
                    ),
                    Positioned(
                      top: 0,
                      right: 0,
                      child: CircleAvatar(
                        radius: 16,
                        backgroundColor: Colors.black54,
                        child: IconButton(
                          padding: EdgeInsets.zero,
                          icon: const Icon(Icons.close, color: Colors.white, size: 16),
                          onPressed: () => uploadedIconUrl.value = null,
                        ),
                      ),
                    ),
                  ],
                ),
              )
            else
              Center(
                child: ElevatedButton.icon(
                  onPressed: () async {
                    final picker = ImagePicker();
                    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
                    if (pickedFile != null) {
                      isUploading.value = true;
                      try {
                        final bytes = await pickedFile.readAsBytes();
                        final url = await controller.uploadImage(
                          pickedFile.path,
                          bytes,
                          pickedFile.name,
                        );
                        if (url != null) {
                          uploadedIconUrl.value = url;
                        } else {
                          Get.snackbar('Error', 'Failed to upload image');
                        }
                      } catch (e) {
                        Get.log('Error picking/uploading: $e');
                      } finally {
                        isUploading.value = false;
                      }
                    }
                  },
                  icon: const Icon(LucideIcons.upload, size: 16),
                  label: const Text('Pick Image'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.bgLight,
                    foregroundColor: AppTheme.textDark,
                  ),
                ),
              ),
          ],
        )),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (nameCtrl.text.isEmpty) return;
              final success = await controller.updateCategory(category.id, {
                'name': nameCtrl.text.trim(),
                'icon': uploadedIconUrl.value,
              });
              Get.back();
              if (success) {
                Get.snackbar('Success', 'Category updated successfully', backgroundColor: AppTheme.statusCompleted, colorText: Colors.white);
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accentBlue, foregroundColor: Colors.white),
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(BuildContext context, int id, String name) {
    Get.dialog(
      AlertDialog(
        title: const Text('Delete Category'),
        content: Text('Are you sure you want to delete category "$name"? This will remove it from the catalog.'),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final success = await controller.deleteCategory(id);
              Get.back();
              if (success) {
                Get.snackbar('Success', 'Category deleted successfully', backgroundColor: AppTheme.statusCompleted, colorText: Colors.white);
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
