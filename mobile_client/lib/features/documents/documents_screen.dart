import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'document_provider.dart';
import '../../widgets/document_card.dart';

class DocumentsScreen extends ConsumerWidget {
  const DocumentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final docState = ref.watch(documentProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Documents'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(documentProvider.notifier).fetchDocuments(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(documentProvider.notifier).fetchDocuments(),
        child: docState.isLoading && docState.documents.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : docState.error != null && docState.documents.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 48, color: Colors.red),
                        const SizedBox(height: 16),
                        Text('Error: ${docState.error}'),
                        ElevatedButton(
                          onPressed: () => ref.read(documentProvider.notifier).fetchDocuments(),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: docState.documents.length,
                    itemBuilder: (context, index) {
                      final doc = docState.documents[index];
                      return DocumentCard(
                        document: doc,
                        onTap: () {
                          context.push('/documents/detail', extra: doc);
                        },
                      );
                    },
                  ),
      ),
    );
  }
}
