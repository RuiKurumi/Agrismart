import 'package:flutter/material.dart';
import 'auth_gate.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  // Individual controllers for staggered effect
  late final AnimationController _iconController;
  late final AnimationController _titleController;
  late final AnimationController _taglineController;
  late final AnimationController _exitController;

  late final Animation<double> _iconSlide;
  late final Animation<double> _iconFade;
  late final Animation<double> _titleSlide;
  late final Animation<double> _titleFade;
  late final Animation<double> _taglineSlide;
  late final Animation<double> _taglineFade;
  late final Animation<double> _exitFade;

  @override
  void initState() {
    super.initState();

    _iconController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _titleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _taglineController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _exitController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );

    // Icon: slides up + fades in
    _iconSlide = Tween<double>(begin: 60, end: 0).animate(
      CurvedAnimation(parent: _iconController, curve: Curves.easeOutCubic),
    );
    _iconFade = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _iconController, curve: Curves.easeIn),
    );

    // Title: slides up + fades in
    _titleSlide = Tween<double>(begin: 40, end: 0).animate(
      CurvedAnimation(parent: _titleController, curve: Curves.easeOutCubic),
    );
    _titleFade = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _titleController, curve: Curves.easeIn),
    );

    // Tagline: slides up + fades in
    _taglineSlide = Tween<double>(begin: 30, end: 0).animate(
      CurvedAnimation(parent: _taglineController, curve: Curves.easeOutCubic),
    );
    _taglineFade = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _taglineController, curve: Curves.easeIn),
    );

    // Exit: fade to white before navigating
    _exitFade = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _exitController, curve: Curves.easeIn),
    );

    _runSequence();
  }

  Future<void> _runSequence() async {
    // Staggered entrance
    await Future.delayed(const Duration(milliseconds: 200));
    _iconController.forward();

    await Future.delayed(const Duration(milliseconds: 300));
    _titleController.forward();

    await Future.delayed(const Duration(milliseconds: 250));
    _taglineController.forward();

    // Hold for a moment
    await Future.delayed(const Duration(milliseconds: 400));

    // Fade out and navigate
    await _exitController.forward();

    if (mounted) {
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (_, __, ___) => const AuthGate(),
          transitionsBuilder: (_, animation, __, child) =>
              FadeTransition(opacity: animation, child: child),
          transitionDuration: const Duration(milliseconds: 400),
        ),
      );
    }
  }

  @override
  void dispose() {
    _iconController.dispose();
    _titleController.dispose();
    _taglineController.dispose();
    _exitController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _exitController,
      builder: (context, child) {
        return Stack(
          children: [
            child!,
            // Exit fade overlay
            if (_exitController.value > 0)
              Opacity(
                opacity: _exitFade.value,
                child: Container(color: const Color(0xFF2E7D32)),
              ),
          ],
        );
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF2E7D32),
        body: SafeArea(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(flex: 2),

                // Icon
                AnimatedBuilder(
                  animation: _iconController,
                  builder: (context, _) => Transform.translate(
                    offset: Offset(0, _iconSlide.value),
                    child: Opacity(
                      opacity: _iconFade.value,
                      child: Container(
                        width: 100,
                        height: 100,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(28),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.3),
                            width: 1.5,
                          ),
                        ),
                        child: const Center(
                          child: Text(
                            '🧅',
                            style: TextStyle(fontSize: 52),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 28),

                // App name
                AnimatedBuilder(
                  animation: _titleController,
                  builder: (context, _) => Transform.translate(
                    offset: Offset(0, _titleSlide.value),
                    child: Opacity(
                      opacity: _titleFade.value,
                      child: const Text(
                        'AgriSmart',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 40,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.5,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 10),

                // Tagline
                AnimatedBuilder(
                  animation: _taglineController,
                  builder: (context, _) => Transform.translate(
                    offset: Offset(0, _taglineSlide.value),
                    child: Opacity(
                      opacity: _taglineFade.value,
                      child: const Text(
                        'Smart Farming for Filipino Farmers',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 14,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ),
                ),

                const Spacer(flex: 2),

                // Bottom loading indicator
                AnimatedBuilder(
                  animation: _taglineController,
                  builder: (context, _) => Opacity(
                    opacity: _taglineFade.value,
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 48),
                      child: SizedBox(
                        width: 40,
                        child: LinearProgressIndicator(
                          backgroundColor: Colors.white24,
                          valueColor: const AlwaysStoppedAnimation<Color>(
                              Colors.white),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}