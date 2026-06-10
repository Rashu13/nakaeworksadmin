class UserEntity {
  final int id;
  final String name;
  final String email;
  final String? phone;
  final String role;
  final bool status;
  final String? avatar;

  UserEntity({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    required this.role,
    required this.status,
    this.avatar,
  });
}
