import 'dart:io';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:get/get.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

class ImageHelper {
  /// Compresses the image and converts it to WebP format.
  /// Standardizes resolution to fit within a 1200x1200px box.
  static Future<File?> compressAndConvertToWebp(File file, {int quality = 80}) async {
    try {
      final tempDir = await getTemporaryDirectory();
      final targetPath = p.join(
        tempDir.path,
        '${DateTime.now().millisecondsSinceEpoch}_compressed.webp',
      );

      final result = await FlutterImageCompress.compressAndGetFile(
        file.absolute.path,
        targetPath,
        format: CompressFormat.webp,
        quality: quality,
        minWidth: 1200,
        minHeight: 1200,
      );

      if (result != null) {
        return File(result.path);
      }
    } catch (e) {
      // Return original file if compression fails
      Get.log('Error compressing image: $e');
    }
    return file;
  }
}
