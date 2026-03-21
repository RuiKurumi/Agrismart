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

  // Default to Metro Manila coordinates — will update with user's province later
  final double _lat = 14.5995;
  final double _lon = 120.9842;
  final String _location = 'Metro Manila';

  @override
  void initState() {
    super.initState();
    _fetchWeather();
  }

  Future<void> _fetchWeather() async {
    try {
      final uri = Uri.parse(
        'https://api.open-meteo.com/v1/forecast'
        '?latitude=$_lat&longitude=$_lon'
        '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code'
        '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum'
        '&timezone=Asia%2FManila'
        '&forecast_days=5',
      );
      final response = await http.get(uri);
      if (response.statusCode == 200) {
        setState(() {
          _weatherData = json.decode(response.body);
          _weatherLoading = false;
        });
      } else {
        setState(() => _weatherLoading = false);
      }
    } catch (e) {
      setState(() => _weatherLoading = false);
    }
  }

  String get _humidity {
    if (_weatherData == null) return '--';
    return '${_weatherData!['current']['relative_humidity_2m']}%';
  }

  String get _windSpeed {
    if (_weatherData == null) return '--';
    return '${_weatherData!['current']['wind_speed_10m']} km/h';
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
        child: SingleChildScrollView(
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
                      style:
                          TextStyle(fontSize: 13, color: Colors.grey),
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
                          ? const Center(
                              child: CircularProgressIndicator(
                                  color: Colors.white))
                          : Column(
                              crossAxisAlignment:
                                  CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _location,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
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
                                    fontSize: 32,
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
                                  ],
                                ),
                              ],
                            ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // 5 Day Forecast banner
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

              // Alerts from Firestore
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
                    const Text(
                      'Alerts and Notifications',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    StreamBuilder<QuerySnapshot>(
                      stream: FirebaseFirestore.instance
                          .collection('alerts')
                          .where('active', isEqualTo: true)
                          .orderBy('createdAt', descending: true)
                          .limit(5)
                          .snapshots(),
                      builder: (context, snapshot) {
                        if (snapshot.connectionState ==
                            ConnectionState.waiting) {
                          return const Center(
                              child: CircularProgressIndicator());
                        }
                        if (!snapshot.hasData ||
                            snapshot.data!.docs.isEmpty) {
                          return const Text(
                            'No active alerts',
                            style: TextStyle(
                                color: Colors.grey, fontSize: 13),
                          );
                        }
                        return Column(
                          children: snapshot.data!.docs.map((doc) {
                            final data =
                                doc.data() as Map<String, dynamic>;
                            return _AlertItem(
                              title: data['title'] ?? '[alert]',
                              subtitle: data['subtitle'] ?? '',
                              status: data['active'] == true
                                  ? 'Active'
                                  : 'Inactive',
                            );
                          }).toList(),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
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
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white54, width: 6),
          ),
          child: Center(
            child: Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(label,
            style:
                const TextStyle(color: Colors.white, fontSize: 12)),
      ],
    );
  }
}

class _FiveDayForecast extends StatelessWidget {
  final Map<String, dynamic> daily;
  const _FiveDayForecast({required this.daily});

  @override
  Widget build(BuildContext context) {
    final dates = (daily['time'] as List).take(5).toList();
    final maxTemps =
        (daily['temperature_2m_max'] as List).take(5).toList();
    final minTemps =
        (daily['temperature_2m_min'] as List).take(5).toList();
    final precip =
        (daily['precipitation_sum'] as List).take(5).toList();

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: List.generate(5, (i) {
        final date = DateTime.parse(dates[i]);
        final day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            [date.weekday - 1];
        return Column(
          children: [
            Text(day,
                style: const TextStyle(
                    color: Colors.white70, fontSize: 11)),
            const SizedBox(height: 4),
            Text('${maxTemps[i]}°',
                style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 13)),
            Text('${minTemps[i]}°',
                style: const TextStyle(
                    color: Colors.white70, fontSize: 11)),
            const SizedBox(height: 4),
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
  final String status;
  const _AlertItem(
      {required this.title,
      required this.subtitle,
      required this.status});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 14)),
                if (subtitle.isNotEmpty)
                  Text(subtitle,
                      style: const TextStyle(
                          color: Colors.grey, fontSize: 12)),
              ],
            ),
          ),
          Text(
            status,
            style: TextStyle(
              color: status == 'Active' ? Colors.pink : Colors.grey,
              fontWeight: FontWeight.w500,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }
}