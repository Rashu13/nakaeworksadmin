class AppConstants {
  static String get baseUrl => 'https://babylon.pathostar.in';

  static String get apiUrl => '$baseUrl/api';

  // Storage Keys
  static const String tokenKey = 'admin_token';
  static const String userKey = 'admin_user';

  // Format Helper for Image URL
  static String getFullImageUrl(String? path) {
    if (path == null || path.isEmpty) {
      return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop';
    }
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return '$baseUrl${path.startsWith('/') ? '' : '/'}$path';
  }
}
