import '../utils/constants.dart';

class UserModel {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String? token;
  final String? picture;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.token,
    this.picture,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    String? pic = json['picture'] ?? json['Picture'] ?? json['avatar'] ?? json['Avatar'];
    if (pic != null && !pic.startsWith('http')) {
      pic = '${AppConstants.baseUrl}${pic.startsWith('/') ? '' : '/'}$pic';
    } else if (pic != null && pic.contains('.sslip.io')) {
      pic = pic.replaceFirst(RegExp(r'http://.*\.sslip\.io'), AppConstants.baseUrl);
    }

    return UserModel(
      id: json['id']?.toString() ?? json['Id']?.toString() ?? '',
      name: json['name'] ?? json['Name'] ?? '',
      email: json['email'] ?? json['Email'] ?? '',
      phone: json['phone'] ?? json['Phone'],
      token: json['token'] ?? json['Token'],
      picture: pic,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'token': token,
      'picture': picture,
    };
  }
}
