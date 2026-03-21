import 'package:flutter/material.dart';
import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:llama_flutter_android/llama_flutter_android.dart' as llama;
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:flutter_dotenv/flutter_dotenv.dart';

final String _geminiApiKey = dotenv.env['GEMINI_API_KEY']?? '';

const String _systemPrompt =
    'You are Maya, an AI agricultural assistant for AgriSmart — a platform '
    'designed to help Filipino farmers. You specialize in crop management, pest '
    'and disease identification, weather interpretation, soil health, and general '
    'farming advice relevant to the Philippines. You are friendly, patient, and '
    'speak in a conversational tone. You may occasionally use simple Filipino '
    'words to feel more approachable. Always prioritize practical, actionable '
    'advice suited to smallholder farmers. If asked about something outside '
    'agriculture, politely redirect the conversation back to farming topics.';

class ChatMessage {
  final String text;
  final bool isUser;
  ChatMessage({required this.text, required this.isUser});
}

class ChatbotPage extends StatefulWidget {
  const ChatbotPage({super.key});

  @override
  State<ChatbotPage> createState() => _ChatbotPageState();
}

class _ChatbotPageState extends State<ChatbotPage> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  final List<ChatMessage> _messages = [];
  bool _isLoading = false;
  bool _isOnline = true;
  File? _uploadedFile;
  String? _uploadedFileName;

  late final GenerativeModel _geminiModel;
  late final ChatSession _chatSession;

  llama.LlamaController? _llamaController;
  bool _llamaLoaded = false;

  @override
  void initState() {
    super.initState();
    _initGemini();
    _checkConnectivity();
    _listenConnectivity();
    _messages.add(ChatMessage(
      text:
          "Kamusta! I'm Maya, your AgriSmart assistant 🌱 I'm here to help you "
          "with crop advice, pest management, weather insights, and more. "
          "Ano ang maitutulong ko sa inyo ngayon?",
      isUser: false,
    ));
  }

  void _initGemini() {
    _geminiModel = GenerativeModel(
      model: 'gemini-2.5-flash',
      apiKey: _geminiApiKey,
      systemInstruction: Content.system(_systemPrompt),
    );
    _chatSession = _geminiModel.startChat();
  }

  Future<void> _checkConnectivity() async {
    final result = await Connectivity().checkConnectivity();
    setState(() => _isOnline = result != ConnectivityResult.none);
  }

  void _listenConnectivity() {
    Connectivity().onConnectivityChanged.listen((result) {
      setState(() => _isOnline = result != ConnectivityResult.none);
    });
  }

  Future<void> _pickFile() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery);
    if (picked != null) {
      setState(() {
        _uploadedFile = File(picked.path);
        _uploadedFileName = picked.name;
      });
    }
  }

  Future<void> _loadLlamaModel() async {
    final pathController = TextEditingController();
    final path = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Load Local Model'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Enter the full path to your GGUF model file:',
              style: TextStyle(fontSize: 13),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: pathController,
              decoration: const InputDecoration(
                hintText: '/storage/emulated/0/models/model.gguf',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, pathController.text),
            style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2E7D32)),
            child:
                const Text('Load', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (path == null || path.isEmpty) return;
    setState(() => _isLoading = true);
    try {
      _llamaController = llama.LlamaController();
      await _llamaController!
          .loadModel(modelPath: path, threads: 4, contextSize: 2048);
      setState(() => _llamaLoaded = true);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Local model loaded!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Failed: $e')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _messages.add(ChatMessage(text: text, isUser: true));
      _isLoading = true;
    });
    _messageController.clear();
    _scrollToBottom();

    try {
      if (_isOnline) {
        final response =
            await _chatSession.sendMessage(Content.text(text));
        setState(() {
          _messages.add(ChatMessage(
            text: response.text ?? 'Sorry, no response.',
            isUser: false,
          ));
        });
      } else {
        if (!_llamaLoaded || _llamaController == null) {
          setState(() {
            _messages.add(ChatMessage(
              text:
                  "I'm offline and no local model is loaded. Tap the upload "
                  "icon in the top right to load a GGUF model.",
              isUser: false,
            ));
          });
        } else {
          final buffer = StringBuffer();
          await for (final token in _llamaController!.generateChat(
            messages: [
              llama.ChatMessage(role: 'system', content: _systemPrompt),
              llama.ChatMessage(role: 'user', content: text),
            ],
            temperature: 0.7,
            maxTokens: 512,
          )) {
            buffer.write(token);
          }
          setState(() {
            _messages
                .add(ChatMessage(text: buffer.toString(), isUser: false));
          });
        }
      }
    } catch (e) {
      setState(() {
        _messages.add(ChatMessage(
          text: 'Something went wrong. Please try again.',
          isUser: false,
        ));
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _llamaController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(
          children: [
            const CircleAvatar(
              backgroundColor: Color(0xFF2E7D32),
              radius: 16,
              child: Text('M',
                  style: TextStyle(
                      color: Colors.white, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Maya',
                    style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1A1A1A))),
                Text(
                  _isOnline ? 'Online · Gemini' : 'Offline · Local Model',
                  style: TextStyle(
                    fontSize: 11,
                    color: _isOnline ? Colors.green : Colors.orange,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          if (!_isOnline)
            IconButton(
              icon: Icon(
                _llamaLoaded ? Icons.memory : Icons.upload_file,
                color: _llamaLoaded ? Colors.green : Colors.orange,
              ),
              tooltip:
                  _llamaLoaded ? 'Model loaded' : 'Load local model',
              onPressed: _llamaLoaded ? null : _loadLlamaModel,
            ),
        ],
      ),
      body: Column(
        children: [
          // File upload strip
          Container(
            margin: const EdgeInsets.fromLTRB(12, 12, 12, 0),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE0E0E0)),
            ),
            child: _uploadedFile != null
                ? ListTile(
                    dense: true,
                    leading: const Icon(Icons.insert_drive_file,
                        color: Color(0xFF2E7D32), size: 20),
                    title: Text(_uploadedFileName ?? 'File',
                        style: const TextStyle(fontSize: 13)),
                    trailing: IconButton(
                      icon: const Icon(Icons.close,
                          color: Colors.red, size: 18),
                      onPressed: () => setState(() {
                        _uploadedFile = null;
                        _uploadedFileName = null;
                      }),
                    ),
                  )
                : Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 10),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text('Click Add File',
                            style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w500)),
                        const SizedBox(width: 12),
                        ElevatedButton.icon(
                          onPressed: _pickFile,
                          icon: const Icon(Icons.add, size: 16),
                          label: const Text('Add File'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF2E7D32),
                            foregroundColor: Colors.white,
                            minimumSize: Size.zero,
                            padding: const EdgeInsets.symmetric(
                                horizontal: 14, vertical: 8),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(30),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
          ),

          // Messages
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(12),
              itemCount: _messages.length + (_isLoading ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length) {
                  return const _TypingIndicator();
                }
                return _ChatBubble(message: _messages[index]);
              },
            ),
          ),

          // Input bar
          Container(
            color: Colors.white,
            padding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    onSubmitted: (_) => _sendMessage(),
                    decoration: InputDecoration(
                      hintText: 'Ask Maya anything...',
                      filled: true,
                      fillColor: const Color(0xFFF0F2F5),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: _sendMessage,
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: const BoxDecoration(
                      color: Color(0xFF2E7D32),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.send,
                        color: Colors.white, size: 20),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ChatBubble extends StatelessWidget {
  final ChatMessage message;
  const _ChatBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment:
          message.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.75),
        decoration: BoxDecoration(
          color:
              message.isUser ? const Color(0xFF2E7D32) : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft:
                Radius.circular(message.isUser ? 16 : 4),
            bottomRight:
                Radius.circular(message.isUser ? 4 : 16),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Text(
          message.text,
          style: TextStyle(
            color: message.isUser
                ? Colors.white
                : const Color(0xFF1A1A1A),
            fontSize: 14,
          ),
        ),
      ),
    );
  }
}

class _TypingIndicator extends StatelessWidget {
  const _TypingIndicator();

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Maya is typing...',
                style: TextStyle(color: Colors.grey, fontSize: 13)),
            SizedBox(width: 8),
            SizedBox(
              width: 14,
              height: 14,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: Color(0xFF2E7D32),
              ),
            ),
          ],
        ),
      ),
    );
  }
}