import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart';
import '../main.dart';
import '../services/app_state.dart';

class AdvancedSettingsPage extends StatefulWidget {
  const AdvancedSettingsPage({super.key});
  
  @override
  State<AdvancedSettingsPage> createState() => _AdvancedSettingsPageState();
}

class _AdvancedSettingsPageState extends State<AdvancedSettingsPage> {
  bool _darkMode = false;
  String _selectedLanguage = 'en';
  bool _llamaLoaded = false;


  @override
  void initState(){
    super.initState();
  }

bool _initialized = false;

  @override
  void didChangeDependencies(){
    super.didChangeDependencies();
    if(!_initialized){
    final brightness = Theme.of(context).brightness;
    _darkMode = brightness == Brightness.dark;
    _selectedLanguage = Localizations.localeOf(context).languageCode;
    _initialized = true;
    }
  }
  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text(l10n.advancedSettingsTitle),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Appearance section
            Text(
              l10n.advancedAppearance,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                border: Border.all(color: const Color(0xFFE0E0E0)),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(l10n.advancedDarkMode,
                            style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w500)),
                        Text(l10n.advancedDarkModeSubtitle,
                            style: const TextStyle(
                                fontSize: 12, color: Colors.grey)),
                      ],
                    ),
                    Row(
                      children: [
                        Switch(
                          value: _darkMode,
                          onChanged: (v) {
                            setState(() => _darkMode = v);
                            MyApp.of(context)?.toggleDarkMode(v);
                          },
                          activeColor: const Color(0xFF2E7D32),
                        ),
                        const Icon(Icons.bedtime_outlined,
                            size: 20, color: Colors.grey),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Language section
            Text(
              l10n.advancedLanguage,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                border: Border.all(color: const Color(0xFFE0E0E0)),
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(l10n.advancedLanguageSubtitle,
                      style: const TextStyle(
                          fontSize: 12, color: Colors.grey)),
                  const SizedBox(height: 12),
                  _LanguageOption(
                    label: l10n.languageEnglish,
                    value: 'en',
                    groupValue: _selectedLanguage,
                    onChanged: (v) {
                      setState(() => _selectedLanguage = v!);
                      AppState.locale.value = Locale(v!);
                    },
                  ),
                  const SizedBox(height: 8),
                  _LanguageOption(
                    label: l10n.languageTagalog,
                    value: 'tl',
                    groupValue: _selectedLanguage,
                    onChanged: (v) {
                      setState(() => _selectedLanguage = v!);
                      AppState.locale.value = Locale(v!);
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // AI Model section
            Text(
              l10n.advancedAI,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                border: Border.all(color: const Color(0xFFE0E0E0)),
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(l10n.advancedAISubtitle,
                      style: const TextStyle(
                          fontSize: 12, color: Colors.grey)),
                  const SizedBox(height: 16),

                  // Online model status
                  _AIModelCard(
                    icon: Icons.cloud_outlined,
                    title: 'Gemini 1.5 Flash',
                    subtitle: 'Online — Active when connected',
                    isActive: true,
                    color: Colors.blue,
                  ),
                  const SizedBox(height: 8),

                  // Offline model status
                  _AIModelCard(
                    icon: Icons.memory,
                    title: 'Local GGUF Model',
                    subtitle: _llamaLoaded
                        ? l10n.advancedAIModelLoaded
                        : l10n.advancedAIModelNotLoaded,
                    isActive: _llamaLoaded,
                    color: Colors.orange,
                  ),
                  const SizedBox(height: 16),

                  // Load model button
                  if (!_llamaLoaded)
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: _loadLocalModel,
                        icon: const Icon(Icons.upload_file,
                            color: Color(0xFF2E7D32)),
                        label: Text(l10n.advancedAILoadModel,
                            style: const TextStyle(
                                color: Color(0xFF2E7D32))),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(
                              color: Color(0xFF2E7D32)),
                          minimumSize: const Size(double.infinity, 48),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _loadLocalModel() async {
    final l10n = AppLocalizations.of(context)!;
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
            child: const Text('Load',
                style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (path == null || path.isEmpty) return;
    final success = await AppState.setLocalModelPath(path);  // ← replaces setState
    if (mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(success
        ? l10n.chatbotModelLoadedSnack
        : 'Failed to load model')),
    );
    }
  }
}

class _LanguageOption extends StatelessWidget {
  final String label;
  final String value;
  final String groupValue;
  final ValueChanged<String?> onChanged;

  const _LanguageOption({
    required this.label,
    required this.value,
    required this.groupValue,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final isSelected = value == groupValue;
    return GestureDetector(
      onTap: () => onChanged(value),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFF2E7D32).withOpacity(0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF2E7D32)
                : Colors.transparent,
          ),
        ),
        child: Row(
          children: [
            Icon(
              isSelected ? Icons.check_circle : Icons.circle_outlined,
              color: isSelected
                  ? const Color(0xFF2E7D32)
                  : Colors.grey,
              size: 20,
            ),
            const SizedBox(width: 12),
            Text(label, style: const TextStyle(fontSize: 14)),
          ],
        ),
      ),
    );
  }
}

class _AIModelCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool isActive;
  final Color color;

  const _AIModelCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.isActive,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isActive ? color.withOpacity(0.08) : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isActive ? color.withOpacity(0.3) : const Color(0xFFE0E0E0),
        ),
      ),
      child: Row(
        children: [
          Icon(icon, color: isActive ? color : Colors.grey, size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(
                        fontSize: 14, fontWeight: FontWeight.w500)),
                Text(subtitle,
                    style: const TextStyle(
                        fontSize: 12, color: Colors.grey)),
              ],
            ),
          ),
          if (isActive)
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: color.withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'Active',
                style: TextStyle(
                    color: color,
                    fontSize: 11,
                    fontWeight: FontWeight.bold),
              ),
            ),
        ],
      ),
    );
  }
}