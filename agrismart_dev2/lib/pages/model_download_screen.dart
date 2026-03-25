import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/app_state.dart';

class ModelDownloadScreen extends StatefulWidget {
  final VoidCallback onComplete;
  final VoidCallback onSkip;

  const ModelDownloadScreen({
    super.key,
    required this.onComplete,
    required this.onSkip,
  });

  @override
  State<ModelDownloadScreen> createState() => _ModelDownloadScreenState();
}

class _ModelDownloadScreenState extends State<ModelDownloadScreen> {
  // TinyLlama 1.1B Chat v1.0 GGUF - Q3_K_M (~551 MB on HF)
  static const String _modelUrl =
      'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q3_K_M.gguf';
  static const String _modelFileName =
      'tinyllama-1.1b-chat-v1.0.Q3_K_M.gguf';

  static const String _prefKey = 'model_download_skipped';
  static const String _localModelPathKey = 'local_model_path';

  double _progress = 0;
  String _status = '';
  bool _isDownloading = false;
  bool _isComplete = false;
  bool _hasError = false;
  http.Client? _client;

  @override
  void dispose() {
    _client?.close();
    super.dispose();
  }

  Future<void> _startDownload() async {
    setState(() {
      _isDownloading = true;
      _hasError = false;
      _isComplete = false;
      _status = 'Starting download...';
      _progress = 0;
    });

    IOSink? sink;
    try {
      final dir = await getApplicationDocumentsDirectory();
      final filePath = '${dir.path}/$_modelFileName';
      final file = File(filePath);

      int existingBytes = 0;
      if (await file.exists()) {
        existingBytes = await file.length();
      }

      _client = http.Client();
      final request = http.Request('GET', Uri.parse(_modelUrl));
      request.followRedirects = true;   // ← add this
      request.maxRedirects = 5;         // ← add this

      if (existingBytes > 0) {
        request.headers['User-Agent'] = 'Mozilla/5.0 AgriSmart/1.0';
        request.headers['Range'] = 'bytes=$existingBytes-';
      }

      final response = await _client!.send(request);

      // Handle resume safely:
      // - 206 = server accepted Range, append
      // - 200 = server ignored Range, restart file from scratch
      final bool isResumed = existingBytes > 0 && response.statusCode == 206;
      final bool restarted = existingBytes > 0 && response.statusCode == 200;

      if (response.statusCode != 200 && response.statusCode != 206) {
        throw Exception('Download failed: HTTP ${response.statusCode}');
      }

      if (restarted) {
        await file.writeAsBytes([]);
        existingBytes = 0;
        setState(() {
          _status = 'Server restarted download from beginning...';
        });
      }

      sink = file.openWrite(
        mode: isResumed ? FileMode.append : FileMode.write,
      );

      final int totalBytes =
          (response.contentLength ?? 0) + (isResumed ? existingBytes : 0);

      int receivedBytes = isResumed ? existingBytes : 0;

      await for (final chunk in response.stream) {
        if (!_isDownloading) {
          await sink.close();
          return;
        }

        sink.add(chunk);
        receivedBytes += chunk.length;

        if (totalBytes > 0 && mounted) {
          setState(() {
            _progress = receivedBytes / totalBytes;
            _status =
                '${_formatBytes(receivedBytes)} / ${_formatBytes(totalBytes)}';
          });
        }
      }

      await sink.close();

      final fileSize = await file.length();

      // TinyLlama Q3_K_M is ~551 MB on HF, so use a realistic floor.
      const int minExpectedSize = 400 * 1024 * 1024; // 400 MB

      if (fileSize < minExpectedSize) {
        throw Exception('Downloaded file looks incomplete: $fileSize bytes');
      }

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_localModelPathKey, filePath);
      AppState.localModelPath = filePath;

      if (!mounted) return;

      setState(() {
        _isComplete = true;
        _isDownloading = false;
        _status = 'Downloaded! Model will be ready on next startup.';
        _progress = 1.0;
      });

      await Future.delayed(const Duration(seconds: 1));
      widget.onComplete();
    } catch (e) {
      try {
        await sink?.close();
      } catch (_) {}

      if (!mounted) return;

      setState(() {
        _hasError = true;
        _isDownloading = false;
        _status = 'Error: $e';
      });
    }
  }

  void _cancelDownload() {
    _client?.close();
    setState(() {
      _isDownloading = false;
      _status = 'Download cancelled';
      _progress = 0;
    });
  }

  Future<void> _skip() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_prefKey, true);
    widget.onSkip();
  }

  String _formatBytes(int bytes) {
    if (bytes < 1024 * 1024) {
      return '${(bytes / 1024).toStringAsFixed(1)} KB';
    }
    if (bytes < 1024 * 1024 * 1024) {
      return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
    return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(2)} GB';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F5),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: const Color(0xFF2E7D32).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Center(
                  child: Text('🤖', style: TextStyle(fontSize: 40)),
                ),
              ),
              const SizedBox(height: 24),

              const Text(
                'Enable Offline AI',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),

              const Text(
                'Download TinyLlama to use Maya AI without internet. '
                'The model is about 550 MB and only needs to be downloaded once.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 14, color: Colors.grey),
              ),
              const SizedBox(height: 16),

              const _FeatureRow(icon: '📴', text: 'Works fully offline'),
              const _FeatureRow(icon: '⚡', text: 'Smaller and lighter model'),
              const _FeatureRow(icon: '💬', text: 'Maya chatbot available offline'),
              const SizedBox(height: 32),

              if (_isDownloading || _isComplete || _hasError) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    children: [
                      if (_isComplete)
                        const Icon(Icons.check_circle,
                            color: Color(0xFF2E7D32), size: 48)
                      else if (_hasError)
                        const Icon(Icons.error_outline,
                            color: Colors.red, size: 48)
                      else
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: _progress,
                            backgroundColor: Colors.grey.withOpacity(0.2),
                            valueColor: const AlwaysStoppedAnimation<Color>(
                              Color(0xFF2E7D32),
                            ),
                            minHeight: 8,
                          ),
                        ),
                      const SizedBox(height: 12),
                      Text(
                        _isComplete ? 'Model ready! ✅' : _status,
                        style: TextStyle(
                          fontSize: 13,
                          color: _hasError
                              ? Colors.red
                              : _isComplete
                                  ? const Color(0xFF2E7D32)
                                  : Colors.grey,
                          fontWeight: _isComplete
                              ? FontWeight.bold
                              : FontWeight.normal,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      if (_isDownloading && _progress > 0) ...[
                        const SizedBox(height: 4),
                        Text(
                          '${(_progress * 100).toStringAsFixed(1)}%',
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF2E7D32),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              if (!_isDownloading && !_isComplete) ...[
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _startDownload,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2E7D32),
                      minimumSize: const Size(double.infinity, 52),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: Text(
                      _hasError ? 'Retry Download' : 'Download (~550 MB)',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: _skip,
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 52),
                      side: const BorderSide(color: Colors.grey),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: const Text(
                      'Skip for now',
                      style: TextStyle(color: Colors.grey),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'You can download it later from Advanced Settings',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
              ],

              if (_isDownloading)
                TextButton(
                  onPressed: _cancelDownload,
                  child: const Text(
                    'Cancel',
                    style: TextStyle(color: Colors.red),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FeatureRow extends StatelessWidget {
  final String icon;
  final String text;

  const _FeatureRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(icon, style: const TextStyle(fontSize: 16)),
          const SizedBox(width: 8),
          Text(
            text,
            style: const TextStyle(fontSize: 13, color: Colors.grey),
          ),
        ],
      ),
    );
  }
}