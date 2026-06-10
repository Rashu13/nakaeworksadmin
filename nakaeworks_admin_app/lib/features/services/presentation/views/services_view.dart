import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../controllers/services_controller.dart';
import '../../data/models/service_model.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/constants/app_constants.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:image_picker/image_picker.dart';

class ServicesView extends GetView<ServicesController> {
  const ServicesView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Title and Create Service Action
        Padding(
          padding: const EdgeInsets.only(left: 24, right: 24, top: 24),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Services Catalog',
                    style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    'Create, edit, and toggle active status of NakaeWorks services.',
                    style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textGray),
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: () => _showAddServiceDialog(context),
                icon: const Icon(LucideIcons.plus, size: 16),
                label: const Text('Add Service'),
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
        const SizedBox(height: 20),

        // Catalog Grid/List
        Expanded(
          child: Obx(() {
            if (controller.isLoading.value) {
              return const Center(child: CircularProgressIndicator(color: AppTheme.accentBlue));
            }

            if (controller.services.isEmpty) {
              return Center(
                child: Text('No services found in catalog.', style: GoogleFonts.inter(color: AppTheme.textGray)),
              );
            }

            final isDesktop = MediaQuery.of(context).size.width >= 1000;

            return GridView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: isDesktop ? 3 : (MediaQuery.of(context).size.width >= 650 ? 2 : 1),
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 1.15,
              ),
              itemCount: controller.services.length,
              itemBuilder: (context, index) {
                final service = controller.services[index];
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Service header with Image and info
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: CachedNetworkImage(
                                imageUrl: AppConstants.getFullImageUrl(service.thumbnail),
                                width: 80,
                                height: 80,
                                fit: BoxFit.cover,
                                placeholder: (context, url) => Container(color: AppTheme.bgLight, child: const Icon(LucideIcons.image, color: AppTheme.textGray)),
                                errorWidget: (context, url, error) => Container(color: AppTheme.bgLight, child: const Icon(LucideIcons.image, color: AppTheme.textGray)),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    service.name,
                                    style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.textDark),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  Text(
                                    'MRP: ₹${service.price.toStringAsFixed(0)}  •  ${service.discount.toStringAsFixed(0)}% Off',
                                    style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textGray, fontWeight: FontWeight.w500),
                                  ),
                                  Text(
                                    'Final: ₹${service.discountedPrice.toStringAsFixed(0)}',
                                    style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.accentBlue),
                                  ),
                                  Text(
                                    'Duration: ${service.duration} mins',
                                    style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textGray),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const Spacer(),

                        // Toggles for active and featured
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Text('Featured:', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textGray)),
                                const SizedBox(width: 4),
                                SizedBox(
                                  height: 24,
                                  child: Switch(
                                    value: service.isFeatured,
                                    activeColor: AppTheme.accentBlue,
                                    onChanged: (val) async {
                                      final success = await controller.toggleServiceFeatured(service.id, val);
                                      if (success) {
                                        Get.snackbar('Success', 'Featured status updated', backgroundColor: AppTheme.statusCompleted, colorText: Colors.white);
                                      }
                                    },
                                  ),
                                ),
                              ],
                            ),
                            Row(
                              children: [
                                Text('Active:', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textGray)),
                                const SizedBox(width: 4),
                                SizedBox(
                                  height: 24,
                                  child: Switch(
                                    value: service.status,
                                    activeColor: AppTheme.statusCompleted,
                                    onChanged: (val) async {
                                      final success = await controller.toggleServiceStatus(service.id, val);
                                      if (success) {
                                        Get.snackbar('Success', 'Service status updated', backgroundColor: AppTheme.statusCompleted, colorText: Colors.white);
                                      }
                                    },
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const Divider(color: AppTheme.borderLight, height: 20),

                        // Modify actions
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            IconButton(
                              icon: const Icon(LucideIcons.edit2, size: 18, color: AppTheme.textGray),
                              onPressed: () => _showEditServiceDialog(context, service),
                            ),
                            const SizedBox(width: 4),
                            IconButton(
                              icon: const Icon(LucideIcons.trash2, size: 18, color: Colors.redAccent),
                              onPressed: () => _confirmDelete(context, service.id, service.name),
                            ),
                          ],
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

  void _showAddServiceDialog(BuildContext context) {
    final nameCtrl = TextEditingController();
    final slugCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final priceCtrl = TextEditingController();
    final discCtrl = TextEditingController();
    final durCtrl = TextEditingController();
    final selectedCategoryId = RxnInt();
    final selectedProviderId = RxnInt();
    final uploadedThumbnailUrl = RxnString();
    final isUploading = false.obs;

    final finalPrice = 0.0.obs;
    void calculateFinalPrice() {
      final price = double.tryParse(priceCtrl.text) ?? 0.0;
      final discount = double.tryParse(discCtrl.text) ?? 0.0;
      finalPrice.value = price - (price * discount / 100);
    }
    priceCtrl.addListener(calculateFinalPrice);
    discCtrl.addListener(calculateFinalPrice);

    Get.dialog(
      AlertDialog(
        title: Text(
          'Add New Service',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 20),
        ),
        content: SizedBox(
          width: MediaQuery.of(context).size.width > 700 ? 700 : MediaQuery.of(context).size.width * 0.9,
          child: SingleChildScrollView(
            child: Obx(() {
              final isDesktop = MediaQuery.of(context).size.width > 700;
              return Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (isDesktop) ...[
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: nameCtrl,
                            decoration: const InputDecoration(labelText: 'Service Name'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextField(
                            controller: slugCtrl,
                            decoration: const InputDecoration(labelText: 'Slug (e.g. house-cleaning)'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: priceCtrl,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'Price (₹)'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextField(
                            controller: discCtrl,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'Discount (%)'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextField(
                            controller: durCtrl,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'Duration (Minutes)'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Obx(() => Text(
                      'Amount after discount: ₹${finalPrice.value.toStringAsFixed(0)}',
                      style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.accentBlue),
                    )),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<int>(
                            value: controller.categories.any((cat) => (cat['id'] as num).toInt() == selectedCategoryId.value) ? selectedCategoryId.value : null,
                            hint: const Text('Select Category'),
                            decoration: const InputDecoration(labelText: 'Category'),
                            items: controller.categories.map<DropdownMenuItem<int>>((cat) {
                              return DropdownMenuItem<int>(
                                value: (cat['id'] as num).toInt(),
                                child: Text(cat['name'] ?? ''),
                              );
                            }).toList(),
                            onChanged: (val) => selectedCategoryId.value = val,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: DropdownButtonFormField<int>(
                            value: controller.providers.any((prov) => (prov['id'] as num).toInt() == selectedProviderId.value) ? selectedProviderId.value : null,
                            hint: const Text('Select Provider'),
                            decoration: const InputDecoration(labelText: 'Provider'),
                            items: controller.providers.map<DropdownMenuItem<int>>((prov) {
                              return DropdownMenuItem<int>(
                                value: (prov['id'] as num).toInt(),
                                child: Text(prov['name'] ?? ''),
                              );
                            }).toList(),
                            onChanged: (val) => selectedProviderId.value = val,
                          ),
                        ),
                      ],
                    ),
                  ] else ...[
                    TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Service Name')),
                    const SizedBox(height: 8),
                    TextField(controller: slugCtrl, decoration: const InputDecoration(labelText: 'Slug (e.g. house-cleaning)')),
                    const SizedBox(height: 8),
                    TextField(controller: priceCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Price (₹)')),
                    const SizedBox(height: 8),
                    TextField(controller: discCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Discount (%)')),
                    const SizedBox(height: 8),
                    Obx(() => Text(
                      'Amount after discount: ₹${finalPrice.value.toStringAsFixed(0)}',
                      style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.accentBlue),
                    )),
                    const SizedBox(height: 8),
                    TextField(controller: durCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Duration (Minutes)')),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<int>(
                      value: controller.categories.any((cat) => (cat['id'] as num).toInt() == selectedCategoryId.value) ? selectedCategoryId.value : null,
                      hint: const Text('Select Category'),
                      decoration: const InputDecoration(labelText: 'Category'),
                      items: controller.categories.map<DropdownMenuItem<int>>((cat) {
                        return DropdownMenuItem<int>(
                          value: (cat['id'] as num).toInt(),
                          child: Text(cat['name'] ?? ''),
                        );
                      }).toList(),
                      onChanged: (val) => selectedCategoryId.value = val,
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<int>(
                      value: controller.providers.any((prov) => (prov['id'] as num).toInt() == selectedProviderId.value) ? selectedProviderId.value : null,
                      hint: const Text('Select Provider'),
                      decoration: const InputDecoration(labelText: 'Provider'),
                      items: controller.providers.map<DropdownMenuItem<int>>((prov) {
                        return DropdownMenuItem<int>(
                          value: (prov['id'] as num).toInt(),
                          child: Text(prov['name'] ?? ''),
                        );
                      }).toList(),
                      onChanged: (val) => selectedProviderId.value = val,
                    ),
                  ],
                  const SizedBox(height: 12),
                  TextField(
                    controller: descCtrl,
                    maxLines: 3,
                    decoration: const InputDecoration(labelText: 'Description'),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Service Thumbnail',
                    style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const SizedBox(height: 8),
                  if (isUploading.value)
                    const Center(child: CircularProgressIndicator(color: AppTheme.accentBlue))
                  else if (uploadedThumbnailUrl.value != null)
                    Center(
                      child: Stack(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: Image.network(
                              AppConstants.getFullImageUrl(uploadedThumbnailUrl.value),
                              height: 100,
                              width: 100,
                              fit: BoxFit.cover,
                            ),
                          ),
                          Positioned(
                            top: 0,
                            right: 0,
                            child: CircleAvatar(
                              radius: 12,
                              backgroundColor: Colors.black54,
                              child: IconButton(
                                padding: EdgeInsets.zero,
                                icon: const Icon(Icons.close, color: Colors.white, size: 14),
                                onPressed: () => uploadedThumbnailUrl.value = null,
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
                                uploadedThumbnailUrl.value = url;
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
                        icon: const Icon(LucideIcons.upload, size: 14),
                        label: const Text('Pick Image'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.bgLight,
                          foregroundColor: AppTheme.textDark,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                        ),
                      ),
                    ),
                ],
              );
            }),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: Text('Cancel', style: GoogleFonts.inter(fontWeight: FontWeight.w500)),
          ),
          ElevatedButton(
            onPressed: () async {
              if (nameCtrl.text.isEmpty || priceCtrl.text.isEmpty) return;
              final data = {
                'name': nameCtrl.text.trim(),
                'slug': slugCtrl.text.trim().isEmpty ? nameCtrl.text.trim().toLowerCase().replaceAll(' ', '-') : slugCtrl.text.trim(),
                'description': descCtrl.text.trim(),
                'price': double.tryParse(priceCtrl.text) ?? 0.0,
                'discount': double.tryParse(discCtrl.text) ?? 0.0,
                'duration': int.tryParse(durCtrl.text) ?? 60,
                'categoryId': selectedCategoryId.value,
                'providerId': selectedProviderId.value,
                'thumbnail': uploadedThumbnailUrl.value,
                'status': true,
              };
              final success = await controller.createService(data);
              Get.back();
              if (success) {
                Get.snackbar('Success', 'Service created successfully', backgroundColor: AppTheme.statusCompleted, colorText: Colors.white);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.accentBlue,
              foregroundColor: Colors.white,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
            ),
            child: Text('Create', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showEditServiceDialog(BuildContext context, ServiceModel service) {
    final nameCtrl = TextEditingController(text: service.name);
    final priceCtrl = TextEditingController(text: service.price.toStringAsFixed(0));
    final discCtrl = TextEditingController(text: service.discount.toStringAsFixed(0));
    final durCtrl = TextEditingController(text: service.duration.toString());
    final selectedCategoryId = RxnInt(service.categoryId);
    final selectedProviderId = RxnInt(service.providerId);
    final uploadedThumbnailUrl = RxnString(service.thumbnail);
    final isUploading = false.obs;

    final finalPrice = 0.0.obs;
    void calculateFinalPrice() {
      final price = double.tryParse(priceCtrl.text) ?? 0.0;
      final discount = double.tryParse(discCtrl.text) ?? 0.0;
      finalPrice.value = price - (price * discount / 100);
    }
    priceCtrl.addListener(calculateFinalPrice);
    discCtrl.addListener(calculateFinalPrice);
    calculateFinalPrice();

    Get.dialog(
      AlertDialog(
        title: Text(
          'Edit Service Details',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 20),
        ),
        content: SizedBox(
          width: MediaQuery.of(context).size.width > 700 ? 700 : MediaQuery.of(context).size.width * 0.9,
          child: SingleChildScrollView(
            child: Obx(() {
              final isDesktop = MediaQuery.of(context).size.width > 700;
              return Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (isDesktop) ...[
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: nameCtrl,
                            decoration: const InputDecoration(labelText: 'Service Name'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: priceCtrl,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'Price (₹)'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextField(
                            controller: discCtrl,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'Discount (%)'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextField(
                            controller: durCtrl,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'Duration (Minutes)'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Obx(() => Text(
                      'Amount after discount: ₹${finalPrice.value.toStringAsFixed(0)}',
                      style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.accentBlue),
                    )),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<int>(
                            value: controller.categories.any((cat) => (cat['id'] as num).toInt() == selectedCategoryId.value) ? selectedCategoryId.value : null,
                            hint: const Text('Select Category'),
                            decoration: const InputDecoration(labelText: 'Category'),
                            items: controller.categories.map<DropdownMenuItem<int>>((cat) {
                              return DropdownMenuItem<int>(
                                value: (cat['id'] as num).toInt(),
                                child: Text(cat['name'] ?? ''),
                              );
                            }).toList(),
                            onChanged: (val) => selectedCategoryId.value = val,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: DropdownButtonFormField<int>(
                            value: controller.providers.any((prov) => (prov['id'] as num).toInt() == selectedProviderId.value) ? selectedProviderId.value : null,
                            hint: const Text('Select Provider'),
                            decoration: const InputDecoration(labelText: 'Provider'),
                            items: controller.providers.map<DropdownMenuItem<int>>((prov) {
                              return DropdownMenuItem<int>(
                                value: (prov['id'] as num).toInt(),
                                child: Text(prov['name'] ?? ''),
                              );
                            }).toList(),
                            onChanged: (val) => selectedProviderId.value = val,
                          ),
                        ),
                      ],
                    ),
                  ] else ...[
                    TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Service Name')),
                    const SizedBox(height: 8),
                    TextField(controller: priceCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Price (₹)')),
                    const SizedBox(height: 8),
                    TextField(controller: discCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Discount (%)')),
                    const SizedBox(height: 8),
                    Obx(() => Text(
                      'Amount after discount: ₹${finalPrice.value.toStringAsFixed(0)}',
                      style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.accentBlue),
                    )),
                    const SizedBox(height: 8),
                    TextField(controller: durCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Duration (Minutes)')),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<int>(
                      value: controller.categories.any((cat) => (cat['id'] as num).toInt() == selectedCategoryId.value) ? selectedCategoryId.value : null,
                      hint: const Text('Select Category'),
                      decoration: const InputDecoration(labelText: 'Category'),
                      items: controller.categories.map<DropdownMenuItem<int>>((cat) {
                        return DropdownMenuItem<int>(
                          value: (cat['id'] as num).toInt(),
                          child: Text(cat['name'] ?? ''),
                        );
                      }).toList(),
                      onChanged: (val) => selectedCategoryId.value = val,
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<int>(
                      value: controller.providers.any((prov) => (prov['id'] as num).toInt() == selectedProviderId.value) ? selectedProviderId.value : null,
                      hint: const Text('Select Provider'),
                      decoration: const InputDecoration(labelText: 'Provider'),
                      items: controller.providers.map<DropdownMenuItem<int>>((prov) {
                        return DropdownMenuItem<int>(
                          value: (prov['id'] as num).toInt(),
                          child: Text(prov['name'] ?? ''),
                        );
                      }).toList(),
                      onChanged: (val) => selectedProviderId.value = val,
                    ),
                  ],
                  const SizedBox(height: 16),
                  Text(
                    'Service Thumbnail',
                    style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const SizedBox(height: 8),
                  if (isUploading.value)
                    const Center(child: CircularProgressIndicator(color: AppTheme.accentBlue))
                  else if (uploadedThumbnailUrl.value != null)
                    Center(
                      child: Stack(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: Image.network(
                              AppConstants.getFullImageUrl(uploadedThumbnailUrl.value),
                              height: 100,
                              width: 100,
                              fit: BoxFit.cover,
                            ),
                          ),
                          Positioned(
                            top: 0,
                            right: 0,
                            child: CircleAvatar(
                              radius: 12,
                              backgroundColor: Colors.black54,
                              child: IconButton(
                                padding: EdgeInsets.zero,
                                icon: const Icon(Icons.close, color: Colors.white, size: 14),
                                onPressed: () => uploadedThumbnailUrl.value = null,
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
                                uploadedThumbnailUrl.value = url;
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
                        icon: const Icon(LucideIcons.upload, size: 14),
                        label: const Text('Pick Image'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.bgLight,
                          foregroundColor: AppTheme.textDark,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                        ),
                      ),
                    ),
                ],
              );
            }),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: Text('Cancel', style: GoogleFonts.inter(fontWeight: FontWeight.w500)),
          ),
          ElevatedButton(
            onPressed: () async {
              if (nameCtrl.text.isEmpty || priceCtrl.text.isEmpty) return;
              final data = {
                'name': nameCtrl.text.trim(),
                'price': double.tryParse(priceCtrl.text) ?? 0.0,
                'discount': double.tryParse(discCtrl.text) ?? 0.0,
                'duration': int.tryParse(durCtrl.text) ?? 60,
                'categoryId': selectedCategoryId.value,
                'providerId': selectedProviderId.value,
                'thumbnail': uploadedThumbnailUrl.value,
              };
              final success = await controller.updateService(service.id, data);
              Get.back();
              if (success) {
                Get.snackbar('Success', 'Service updated successfully', backgroundColor: AppTheme.statusCompleted, colorText: Colors.white);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.accentBlue,
              foregroundColor: Colors.white,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
            ),
            child: Text('Save', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(BuildContext context, int serviceId, String name) {
    Get.dialog(
      AlertDialog(
        title: const Text('Delete Service'),
        content: Text('Are you sure you want to delete service "$name"? This will remove it from the consumer catalog.'),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final success = await controller.deleteService(serviceId);
              Get.back();
              if (success) {
                Get.snackbar('Success', 'Service deleted successfully', backgroundColor: AppTheme.statusCompleted, colorText: Colors.white);
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
