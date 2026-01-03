import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/document.dart';
import '../../core/api/api_client.dart';

class DocumentState {
  final List<Document> documents;
  final bool isLoading;
  final String? error;

  DocumentState({this.documents = const [], this.isLoading = false, this.error});

  DocumentState copyWith({List<Document>? documents, bool? isLoading, String? error}) {
    return DocumentState(
      documents: documents ?? this.documents,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class DocumentNotifier extends StateNotifier<DocumentState> {
  final ApiClient _apiClient = ApiClient();

  DocumentNotifier() : super(DocumentState()) {
    fetchDocuments();
  }

  Future<void> fetchDocuments() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiClient.dio.get('/documents');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'];
        final docs = data.map((json) => Document.fromJson(json)).toList();
        state = state.copyWith(documents: docs, isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> approveDocument(String id) async {
    try {
      await _apiClient.dio.patch('/documents/$id/approve');
      await fetchDocuments();
    } catch (e) {
      state = state.copyWith(error: 'Approval failed');
    }
  }
}

final documentProvider = StateNotifierProvider<DocumentNotifier, DocumentState>((ref) {
  return DocumentNotifier();
});
