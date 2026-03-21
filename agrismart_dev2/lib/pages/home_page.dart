import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class HomePage extends StatefulWidget {
  final String displayName;
  const HomePage({super.key, required this.displayName});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  Map<String, dynamic>? _weatherData;
  bool _weatherLoading = true;
  String _locationName = 'Loading...';
  double _lat = 14.5995;
  double _lon = 120.9842;

  @override
  void initState() {
    super.initState();
    _loadLocationAndWeather();
  }

  Future<void> _loadLocationAndWeather() async {
    await _loadUserLocation();
    await _fetchWeather();
  }

  Future<void> _loadUserLocation() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    final doc = await FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .get();

    if (!doc.exists) return;

    final data = doc.data()!;
    final province = data['province'] as String? ?? '';
    final city = data['city'] as String? ?? '';

    final query = city.isNotEmpty ? '$city, $province, Philippines'
        : province.isNotEmpty ? '$province, Philippines'
        : 'Metro Manila, Philippines';

    // Use Open-Meteo geocoding to get coordinates
    try {
      final geoUri = Uri.parse(
        'https://geocoding-api.open-meteo.com/v1/search'
        '?name=${Uri.encodeComponent(query)}&count=1&language=en&format=json',
      );
      final geoResponse = await http.get(geoUri);
      if (geoResponse.statusCode == 200) {
        final geoData = json.decode(geoResponse.body);
        if (geoData['results'] != null && geoData['results'].isNotEmpty) {
          final result = geoData['results'][0];
          setState(() {
            _lat = result['latitude'];
            _lon = result['longitude'];
            _locationName = city.isNotEmpty
                ? '$city, $province'
                : province.isNotEmpty
                    ? province
                    : 'Metro Manila';
          });
        }
      }
    } catch (e) {
      setState(() => _locationName = 'Metro Manila');
    }
  }

  Future<void> _fetchWeather() async {
    setState(() => _weatherLoading = true);
    try {
      final uri = Uri.parse(
        'https://api.open-meteo.com/v1/forecast'
        '?latitude=$_lat&longitude=$_lon'
        '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,'
        'precipitation,weather_code'
        '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,'
        'wind_speed_10m_max,weather_code'
        '&timezone=Asia%2FManila'
        '&forecast_days=5',
      );
      final response = await http.get(uri);
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _weatherData = data;
          _weatherLoading = false;
        });
        await _generateAlerts(data);
      } else {
        setState(() => _weatherLoading = false);
      }
    } catch (e) {
      setState(() => _weatherLoading = false);
    }
  }

  Future<void> _generateAlerts(Map<String, dynamic> weatherData) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    final current = weatherData['current'];
    final daily = weatherData['daily'];
    final List<Map<String, dynamic>> alerts = [];

    final double windSpeed =
        (current['wind_speed_10m'] as num).toDouble();
    final double humidity =
        (current['relative_humidity_2m'] as num).toDouble();
    final double temp =
        (current['temperature_2m'] as num).toDouble();
    final double precipitation =
        (current['precipitation'] as num).toDouble();

    // Check 5-day forecast for rain
    final List precipSum = daily['precipitation_sum'];
    final List windMax = daily['wind_speed_10m_max'];
    final double maxForecastRain =
        precipSum.map((e) => (e as num).toDouble()).reduce(
            (a, b) => a > b ? a : b);
    final double maxForecastWind =
        windMax.map((e) => (e as num).toDouble()).reduce(
            (a, b) => a > b ? a : b);

    // Rain/Flooding alert
    if (precipitation > 10 || maxForecastRain > 20) {
      alerts.add({
        'type': 'rain',
        'title': '🌧 Heavy Rain Expected',
        'subtitle':
            'Heavy rainfall detected in $_locationName. Risk of flooding in low-lying areas.',
        'active': true,
        'severity': precipitation > 30 ? 'high' : 'medium',
      });
    }

    // Typhoon/Strong winds alert
    if (windSpeed > 60 || maxForecastWind > 60) {
      alerts.add({
        'type': 'wind',
        'title': '🌀 Strong Winds / Typhoon Risk',
        'subtitle':
            'Wind speeds of ${windSpeed.toStringAsFixed(0)} km/h detected. Secure crops and equipment.',
        'active': true,
        'severity': windSpeed > 100 ? 'high' : 'medium',
        'isGlobal': true, // Typhoons are global alerts
      });
    }

    // Extreme heat alert
    if (temp > 38) {
      alerts.add({
        'type': 'heat',
        'title': '🌡 Extreme Heat Warning',
        'subtitle':
            'Temperature of ${temp.toStringAsFixed(1)}°C in $_locationName. Irrigate crops and avoid midday fieldwork.',
        'active': true,
        'severity': 'high',
      });
    }

    // High humidity alert
    if (humidity > 85) {
      alerts.add({
        'type': 'humidity',
        'title': '💧 High Humidity Alert',
        'subtitle':
            'Humidity at ${humidity.toStringAsFixed(0)}% in $_locationName. Watch for fungal diseases in crops.',
        'active': true,
        'severity': 'medium',
      });
    }

    // Drought risk — no rain in forecast
    if (maxForecastRain < 1 && humidity < 40) {
      alerts.add({
        'type': 'drought',
        'title': '☀️ Drought Risk',
        'subtitle':
            'No rainfall expected in $_locationName for the next 5 days. Consider irrigation.',
        'active': true,
        'severity': 'medium',
      });
    }

    // Write alerts to Firestore
    final batch = FirebaseFirestore.instance.batch();
    final now = Timestamp.now();

    for (final alert in alerts) {
      final isGlobal = alert['isGlobal'] == true;

      if (isGlobal) {
        // Write to global alerts collection
        final globalRef = FirebaseFirestore.instance
            .collection('alerts')
            .doc('${alert['type']}_${_locationName.replaceAll(' ', '_')}');
        batch.set(globalRef, {
          ...alert,
          'location': _locationName,
          'createdAt': now,
          'autoGenerated': true,
        }, SetOptions(merge: true));
      }

      // Always write to user's personal alerts
      final userRef = FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .collection('alerts')
          .doc(alert['type']);
      batch.set(userRef, {
        ...alert,
        'location': _locationName,
        'createdAt': now,
        'autoGenerated': true,
      }, SetOptions(merge: true));
    }

    await batch.commit();
  }

  String get _temperature {
    if (_weatherData == null) return '--';
    return '${_weatherData!['current']['temperature_2m']}°C';
  }

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadLocationAndWeather,
          color: const Color(0xFF2E7D32),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Welcome + Weather card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Theme.of(context).cardColor,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Welcome ${widget.displayName}',
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        "Here's your Overview for today",
                        style: TextStyle(
                            fontSize: 13, color: Colors.grey),
                      ),
                      const SizedBox(height: 16),

                      // Weather card
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFF4A90D9),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: _weatherLoading
                            ? const SizedBox(
                                height: 120,
                                child: Center(
                                  child: CircularProgressIndicator(
                                      color: Colors.white),
                                ),
                              )
                            : Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        _locationName,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.refresh,
                                            color: Colors.white70,
                                            size: 20),
                                        onPressed:
                                            _loadLocationAndWeather,
                                        padding: EdgeInsets.zero,
                                        constraints:
                                            const BoxConstraints(),
                                      ),
                                    ],
                                  ),
                                  const Text(
                                    'Current Conditions',
                                    style: TextStyle(
                                        color: Colors.white70,
                                        fontSize: 12),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    _temperature,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 36,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceEvenly,
                                    children: [
                                      _WeatherCircle(
                                        value: _weatherData?['current']
                                                    ['relative_humidity_2m']
                                                ?.toString() ??
                                            '--',
                                        label: 'Humidity %',
                                      ),
                                      _WeatherCircle(
                                        value: _weatherData?['current']
                                                    ['wind_speed_10m']
                                                ?.toString() ??
                                            '--',
                                        label: 'Wind km/h',
                                      ),
                                      _WeatherCircle(
                                        value: _weatherData?['current']
                                                    ['precipitation']
                                                ?.toString() ??
                                            '--',
                                        label: 'Rain mm',
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // 5 Day Forecast
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2E7D32),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '5 Day Forecast',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      if (_weatherData != null)
                        _FiveDayForecast(
                            daily: _weatherData!['daily'])
                      else
                        const Text(
                          'Loading forecast...',
                          style: TextStyle(
                              color: Colors.white70, fontSize: 12),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Personal Alerts
                _AlertsSection(
                  title: 'Your Alerts',
                  stream: user != null
                      ? FirebaseFirestore.instance
                          .collection('users')
                          .doc(user.uid)
                          .collection('alerts')
                          .where('active', isEqualTo: true)
                          .orderBy('createdAt', descending: true)
                          .snapshots()
                      : null,
                ),
                const SizedBox(height: 16),

                // Global Alerts
                _AlertsSection(
                  title: 'Regional Alerts',
                  stream: FirebaseFirestore.instance
                      .collection('alerts')
                      .where('active', isEqualTo: true)
                      .orderBy('createdAt', descending: true)
                      .limit(5)
                      .snapshots(),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _AlertsSection extends StatelessWidget {
  final String title;
  final Stream<QuerySnapshot>? stream;

  const _AlertsSection({required this.title, this.stream});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          if (stream == null)
            const Text('Sign in to see your alerts',
                style: TextStyle(color: Colors.grey, fontSize: 13))
          else
            StreamBuilder<QuerySnapshot>(
              stream: stream,
              builder: (context, snapshot) {
                if (snapshot.connectionState ==
                    ConnectionState.waiting) {
                  return const Center(
                      child: CircularProgressIndicator());
                }
                if (!snapshot.hasData ||
                    snapshot.data!.docs.isEmpty) {
                  return const Text(
                    'No active alerts ✅',
                    style:
                        TextStyle(color: Colors.grey, fontSize: 13),
                  );
                }
                return Column(
                  children: snapshot.data!.docs.map((doc) {
                    final data =
                        doc.data() as Map<String, dynamic>;
                    return _AlertItem(
                      title: data['title'] ?? '[alert]',
                      subtitle: data['subtitle'] ?? '',
                      severity: data['severity'] ?? 'medium',
                    );
                  }).toList(),
                );
              },
            ),
        ],
      ),
    );
  }
}

class _WeatherCircle extends StatelessWidget {
  final String value;
  final String label;
  const _WeatherCircle({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white54, width: 5),
          ),
          child: Center(
            child: Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        const SizedBox(height: 6),
        Text(label,
            style:
                const TextStyle(color: Colors.white, fontSize: 11)),
      ],
    );
  }
}

class _FiveDayForecast extends StatelessWidget {
  final Map<String, dynamic> daily;
  const _FiveDayForecast({required this.daily});

  String _weatherIcon(int code) {
    if (code == 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫';
    if (code <= 67) return '🌧';
    if (code <= 77) return '❄️';
    if (code <= 82) return '🌦';
    if (code <= 99) return '⛈';
    return '🌤';
  }

  @override
  Widget build(BuildContext context) {
    final dates = (daily['time'] as List).take(5).toList();
    final maxTemps =
        (daily['temperature_2m_max'] as List).take(5).toList();
    final minTemps =
        (daily['temperature_2m_min'] as List).take(5).toList();
    final precip =
        (daily['precipitation_sum'] as List).take(5).toList();
    final codes =
        (daily['weather_code'] as List).take(5).toList();

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: List.generate(5, (i) {
        final date = DateTime.parse(dates[i]);
        final day = [
          'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
        ][date.weekday - 1];
        return Column(
          children: [
            Text(day,
                style: const TextStyle(
                    color: Colors.white70, fontSize: 11)),
            const SizedBox(height: 4),
            Text(_weatherIcon(codes[i] as int),
                style: const TextStyle(fontSize: 18)),
            const SizedBox(height: 4),
            Text('${maxTemps[i]}°',
                style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 13)),
            Text('${minTemps[i]}°',
                style: const TextStyle(
                    color: Colors.white70, fontSize: 11)),
            const SizedBox(height: 2),
            Text('${precip[i]}mm',
                style: const TextStyle(
                    color: Colors.white70, fontSize: 10)),
          ],
        );
      }),
    );
  }
}

class _AlertItem extends StatelessWidget {
  final String title;
  final String subtitle;
  final String severity;

  const _AlertItem({
    required this.title,
    required this.subtitle,
    required this.severity,
  });

  Color get _severityColor {
    switch (severity) {
      case 'high':
        return Colors.red;
      case 'medium':
        return Colors.orange;
      default:
        return Colors.blue;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 4,
            height: 40,
            decoration: BoxDecoration(
              color: _severityColor,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14)),
                if (subtitle.isNotEmpty)
                  Text(subtitle,
                      style: const TextStyle(
                          color: Colors.grey, fontSize: 12)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(
                horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: _severityColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                  color: _severityColor.withOpacity(0.3)),
            ),
            child: Text(
              severity.toUpperCase(),
              style: TextStyle(
                color: _severityColor,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}