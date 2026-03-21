import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'home_page.dart';
import 'chatbot_page.dart';
import 'settings_page.dart';
import 'package:firebase_auth/firebase_auth.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  String get _userDisplayName {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return 'User';
    if (user.displayName != null && user.displayName!.isNotEmpty) {
      return user.displayName!;
    }
    return user.email?.split('@').first ?? 'User';
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> pages = [
      HomePage(displayName: _userDisplayName),
      const ChatbotPage(),
      const SettingsPage(),
    ];

    return Scaffold(
      body: pages[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        selectedItemColor: const Color(0xFF2E7D32),
        unselectedItemColor: Colors.grey,
        items:  [
          BottomNavigationBarItem(
            icon: Icon(Icons.bar_chart),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.school_outlined),
            label: 'CompOnion',
          ),
          BottomNavigationBarItem(
  icon: CircleAvatar(
    radius: 12,
    backgroundColor: const Color(0xFF2E7D32),
    backgroundImage: FirebaseAuth.instance.currentUser?.photoURL != null
        ? NetworkImage(FirebaseAuth.instance.currentUser!.photoURL!)
        : null,
    child: FirebaseAuth.instance.currentUser?.photoURL == null
        ? Text(
            (FirebaseAuth.instance.currentUser?.displayName?.isNotEmpty == true
                    ? FirebaseAuth.instance.currentUser!.displayName!
                    : FirebaseAuth.instance.currentUser?.email ?? 'U')[0]
                .toUpperCase(),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          )
        : null,
  ),
  label: 'Profile',
),
        ],
      ),
    );
  }
}