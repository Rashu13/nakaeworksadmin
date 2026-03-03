import 'package:flutter/material.dart';
import '../models/service_model.dart';

class FavoritesProvider extends ChangeNotifier {
  final List<ServiceModel> _favorites = [];

  List<ServiceModel> get favorites => _favorites;

  bool isFavorite(String id) => _favorites.any((s) => s.id == id);

  void toggle(ServiceModel service) {
    if (isFavorite(service.id)) {
      _favorites.removeWhere((s) => s.id == service.id);
    } else {
      _favorites.add(service);
    }
    notifyListeners();
  }
}
