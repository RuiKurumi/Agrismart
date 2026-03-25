import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class WeatherCacheService {
  static const String _weatherKey = 'cached_weather';
  static const String _weatherTimeKey = 'cached_weather_time';
  static const String _locationKey = 'cached_weather_location';

  /// Save weather data to cache
  static Future<void> saveWeather({
    required Map<String, dynamic> weatherData,
    required String locationName,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_weatherKey, json.encode(weatherData));
    await prefs.setString(_locationKey, locationName);
    await prefs.setInt(
        _weatherTimeKey, DateTime.now().millisecondsSinceEpoch);
  }

  /// Load cached weather data
  static Future<Map<String, dynamic>?> loadWeather() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_weatherKey);
    if (raw == null) return null;
    try {
      return json.decode(raw) as Map<String, dynamic>;
    } catch (e) {
      return null;
    }
  }

  /// Load cached location name
  static Future<String?> loadLocationName() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_locationKey);
  }

  /// Get how old the cache is as a human-readable string
  static Future<String?> getCacheAge() async {
    final prefs = await SharedPreferences.getInstance();
    final timestamp = prefs.getInt(_weatherTimeKey);
    if (timestamp == null) return null;
    final cached = DateTime.fromMillisecondsSinceEpoch(timestamp);
    final diff = DateTime.now().difference(cached);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }

  /// Check if cache exists
  static Future<bool> hasCachedWeather() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.containsKey(_weatherKey);
  }

  /// Clear cache
  static Future<void> clearCache() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_weatherKey);
    await prefs.remove(_weatherTimeKey);
    await prefs.remove(_locationKey);
  }
}