import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../l10n/app_localizations.dart';
import 'firebase_options.dart';
import 'theme/app_theme.dart';
import 'auth_gate.dart';
import 'splash_screen.dart';
import 'services/app_state.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  await GoogleSignIn.instance.initialize(
    serverClientId: dotenv.env['GOOGLE_WEB_CLIENT_ID'],
  );
  await AppState.preloadLocalModel();  // ← add this
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  static _MyAppState? of(BuildContext context) =>
      context.findAncestorStateOfType<_MyAppState>();

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  bool _isDarkMode = false;
  Locale _locale = const Locale('en');
  bool _settingsLoaded = false;

  @override
  void initState() {
    super.initState();
    _loadSettings();
    AppState.locale.addListener(() {
      setState(() => _locale = AppState.locale.value);
      _saveSettings();
    });
  }

  @override
  void dispose() {
    AppState.locale.removeListener(() {});
    super.dispose();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final langCode = prefs.getString('locale') ?? 'en';
    final loadedLocale = Locale(langCode);
    setState(() {
      _isDarkMode = prefs.getBool('darkMode') ?? false;
      _locale = loadedLocale;
      _settingsLoaded = true;
    });
    // Sync AppState so advanced settings page reflects saved locale
    AppState.locale.value = loadedLocale;
  }

  Future<void> _saveSettings() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('darkMode', _isDarkMode);
    await prefs.setString('locale', _locale.languageCode);
  }

  void toggleDarkMode(bool value) {
    setState(() => _isDarkMode = value);
    _saveSettings();
  }

  void setLocale(Locale locale) {
    setState(() => _locale = locale);
    _saveSettings();
  }

  @override
  Widget build(BuildContext context) {
    // Show nothing until settings are loaded to avoid flash
    if (!_settingsLoaded) {
      return const MaterialApp(
        debugShowCheckedModeBanner: false,
        home: Scaffold(
          backgroundColor: Color(0xFF2E7D32),
          body: Center(
            child: CircularProgressIndicator(color: Colors.white),
          ),
        ),
      );
    }

    return MaterialApp(
      title: 'AgriSmart',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.theme,
      darkTheme: AppTheme.darkTheme,
      themeMode: _isDarkMode ? ThemeMode.dark : ThemeMode.light,
      locale: _locale,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('en'),
        Locale('tl'),
      ],
      home: const SplashScreen(),
    );
  }
}