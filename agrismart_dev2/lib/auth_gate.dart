import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'pages/onboarding/sign_in_page.dart';
import 'pages/onboarding/farm_onboarding.dart';
import 'pages/main_shell.dart';

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

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

            return const MainShell();
          },
        );
      },
    );
  }
}