import 'package:flutter/material.dart';

class AppTheme {
  static const Color primaryGreen = Color(0xFF2E7D32);
  static const Color lightGreen = Color(0xFF4CAF50);
  static const Color backgroundWhite = Color(0xFFFFFFFF);
  static const Color textDark = Color(0xFF1A1A1A);
  static const Color textGrey = Color(0xFF757575);
  static const Color borderGrey = Color(0xFFE0E0E0);
  static const Color guestButtonGrey = Color(0xFFEEEEEE);

  static ThemeData get theme => _buildTheme(Brightness.light);
  static ThemeData get darkTheme => _buildTheme(Brightness.dark);

  static ThemeData _buildTheme(Brightness brightness) {
    final isDark = brightness == Brightness.dark;
    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryGreen,
        primary: primaryGreen,
        brightness: brightness,
      ),
      scaffoldBackgroundColor:
          isDark ? const Color(0xFF121212) : backgroundWhite,
      fontFamily: 'Roboto',
      appBarTheme: AppBarTheme(
        backgroundColor:
            isDark ? const Color(0xFF1E1E1E) : backgroundWhite,
        elevation: 0,
        iconTheme:
            IconThemeData(color: isDark ? Colors.white : textDark),
        titleTextStyle: TextStyle(
          color: isDark ? Colors.white : textDark,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: false,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: borderGrey),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: borderGrey),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: primaryGreen, width: 2),
        ),
        labelStyle: const TextStyle(color: textGrey, fontSize: 13),
        hintStyle: const TextStyle(color: textGrey),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryGreen,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(30),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

const List<String> philippineProvinces = [
  'Abra', 'Agusan del Norte', 'Agusan del Sur', 'Aklan', 'Albay',
  'Antique', 'Apayao', 'Aurora', 'Basilan', 'Bataan',
  'Batanes', 'Batangas', 'Benguet', 'Biliran', 'Bohol',
  'Bukidnon', 'Bulacan', 'Cagayan', 'Camarines Norte', 'Camarines Sur',
  'Camiguin', 'Capiz', 'Catanduanes', 'Cavite', 'Cebu',
  'Cotabato', 'Davao de Oro', 'Davao del Norte', 'Davao del Sur',
  'Davao Occidental', 'Davao Oriental', 'Dinagat Islands', 'Eastern Samar',
  'Guimaras', 'Ifugao', 'Ilocos Norte', 'Ilocos Sur', 'Iloilo',
  'Isabela', 'Kalinga', 'La Union', 'Laguna', 'Lanao del Norte',
  'Lanao del Sur', 'Leyte', 'Maguindanao del Norte', 'Maguindanao del Sur',
  'Marinduque', 'Masbate', 'Metro Manila', 'Misamis Occidental',
  'Misamis Oriental', 'Mountain Province', 'Negros Occidental',
  'Negros Oriental', 'Northern Samar', 'Nueva Ecija', 'Nueva Vizcaya',
  'Occidental Mindoro', 'Oriental Mindoro', 'Palawan', 'Pampanga',
  'Pangasinan', 'Quezon', 'Quirino', 'Rizal', 'Romblon', 'Samar',
  'Sarangani', 'Siquijor', 'Sorsogon', 'South Cotabato', 'Southern Leyte',
  'Sultan Kudarat', 'Sulu', 'Surigao del Norte', 'Surigao del Sur',
  'Tarlac', 'Tawi-Tawi', 'Zambales', 'Zamboanga del Norte',
  'Zamboanga del Sur', 'Zamboanga Sibugay',
];