import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'firebase_options.dart';
import 'theme/app_theme.dart';
import 'auth_gate.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import '../../l10n/app_localizations.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  await GoogleSignIn.instance.initialize(
  serverClientId: dotenv.env['GOOGLE_WEB_CLIENT_ID'],
);

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

  void toggleDarkMode(bool value) {
    setState(() => _isDarkMode = value);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AgriSmart',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.theme,
      darkTheme: AppTheme.darkTheme,
      themeMode: _isDarkMode ? ThemeMode.dark : ThemeMode.light,
      home: const AuthGate(),
    );
  }
}