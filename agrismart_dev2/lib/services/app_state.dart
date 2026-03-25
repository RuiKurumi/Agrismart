import 'package:flutter/material.dart';
import 'package:llama_flutter_android/llama_flutter_android.dart' as llama;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:io';

class AppState {
  static final ValueNotifier<bool> forceOffline = ValueNotifier(false);
  static final ValueNotifier<Locale> locale = ValueNotifier(const Locale('en'));

  static String? localModelPath;
  static llama.LlamaController? llamaController;
  static bool llamaLoaded = false;

  /// Call this on app startup to preload the local model if a path is saved
  static Future<void> preloadLocalModel() async {
  final prefs = await SharedPreferences.getInstance();
  final savedPath = prefs.getString('local_model_path');
  if (savedPath == null || savedPath.isEmpty) return;

  final file = File(savedPath);
  
  // Don't try to load if file doesn't exist or is too small
  if (!await file.exists()) {
    print('Model file not found, clearing saved path');
    await prefs.remove('local_model_path');
    localModelPath = null;
    return;
  }

  final fileSize = await file.length();
  const minExpectedSize = 1000000000; // 1GB minimum
  if (fileSize < minExpectedSize) {
    print('Model file too small ($fileSize bytes), likely corrupted — clearing');
    await prefs.remove('local_model_path');
    await file.delete();
    localModelPath = null;
    return;
  }

  localModelPath = savedPath;
  await _loadModel(savedPath);
}

  /// Save model path and load it
  static Future<bool> setLocalModelPath(String path) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('local_model_path', path);
    localModelPath = path;
    return await _loadModel(path);
  }

  static Future<bool> _loadModel(String path) async {
  try {
    llamaController?.dispose();
    llamaController = null;
    llamaLoaded = false;

    // Check available memory before attempting load
    llamaController = llama.LlamaController();
    await llamaController!.loadModel(
      modelPath: path,
      threads: 2,        // reduce threads to save memory
      contextSize: 512,  // reduce context size to save memory
    );
    llamaLoaded = true;
    print('Local model loaded: $path');
    return true;
  } catch (e) {
    print('Failed to load local model: $e');
    llamaController?.dispose();
    llamaController = null;
    llamaLoaded = false;
    return false;
  }
}

  /// Clear saved model path
  static Future<void> clearLocalModel() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('local_model_path');
    llamaController?.dispose();
    llamaController = null;
    llamaLoaded = false;
    localModelPath = null;
  }
}