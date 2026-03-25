import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'pages/onboarding/sign_in_page.dart';
import 'pages/onboarding/farm_onboarding.dart';
import 'pages/main_shell.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'pages/model_download_screen.dart';
import 'services/app_state.dart';

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

Future<bool> _shouldShowModelDownload() async {
  final prefs = await SharedPreferences.getInstance();
  
  // Don't show if already downloaded
  final savedPath = prefs.getString('local_model_path');
  if (savedPath != null && savedPath.isNotEmpty) return false;
  
  // Don't show if user already skipped
  final skipped = prefs.getBool('model_download_skipped') ?? false;
  if (skipped) return false;
  
  return true;
}

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(
                  color: Color(0xFF2E7D32)),
            ),
          );
        }

        if (!snapshot.hasData) {
          return AppSignInPage();
        }

        // User is logged in — check onboarding status
        return FutureBuilder<DocumentSnapshot>(
          future: FirebaseFirestore.instance
              .collection('users')
              .doc(snapshot.data!.uid)
              .get(),
          builder: (context, userSnapshot) {
            if (userSnapshot.connectionState ==
                ConnectionState.waiting) {
              return const Scaffold(
                body: Center(
                  child: CircularProgressIndicator(
                      color: Color(0xFF2E7D32)),
                ),
              );
            }

            final data = userSnapshot.data?.data()
                as Map<String, dynamic>?;
            final onboardingComplete =
                data?['onboardingComplete'] == true;

            if (!onboardingComplete) {
              return const FarmOnboardingPage();
            }

            return FutureBuilder<bool>(
            future: _shouldShowModelDownload(),
            builder: (context, snapshot) {
            if (!snapshot.hasData) return const SizedBox();
            if (snapshot.data == true) {
            return ModelDownloadScreen(
              onComplete: () => Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (_) => const MainShell()),
              ),
              onSkip: () => Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (_) => const MainShell()),
              ),
            );
          }
          return const MainShell();
        },
      );

          },
        );
      },
    );
  }
}