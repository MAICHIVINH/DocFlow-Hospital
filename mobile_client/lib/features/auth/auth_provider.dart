import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';
import '../../models/user.dart';
import '../../core/api/api_client.dart';

class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;

  AuthState({this.user, this.isLoading = false, this.error});

  AuthState copyWith({User? user, bool? isLoading, String? error}) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient _apiClient = ApiClient();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  AuthNotifier() : super(AuthState()) {
    checkAuthStatus();
  }

  Future<void> checkAuthStatus() async {
    state = state.copyWith(isLoading: true);
    final token = await _storage.read(key: 'jwt_token');
    
    if (token == null) {
      state = state.copyWith(isLoading: false);
      return;
    }

    try {
      final response = await _apiClient.dio.get('/users/me');
      if (response.statusCode == 200) {
        state = state.copyWith(user: User.fromJson(response.data), isLoading: false);
      } else {
        await logout();
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<bool> login(String username, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiClient.dio.post('/auth/login', data: {
        'username': username,
        'password': password,
      });

      if (response.statusCode == 200) {
        final token = response.data['accessToken']; // Backend returns 'accessToken'
        await _storage.write(key: 'jwt_token', value: token);
        state = state.copyWith(user: User.fromJson(response.data), isLoading: false);
        return true;
      }
      return false;
    } catch (e) {
      String errorMsg = 'Login failed';
      if (e is DioException) {
        errorMsg = e.response?.data['message'] ?? e.message ?? 'Network error (check IP/Wifi)';
      } else {
        errorMsg = e.toString();
      }
      state = state.copyWith(isLoading: false, error: errorMsg);
      return false;
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
    state = AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
