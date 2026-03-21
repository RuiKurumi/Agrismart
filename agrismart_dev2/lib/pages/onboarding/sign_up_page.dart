import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../l10n/app_localizations.dart';
import '../../theme/app_theme.dart';
import 'sign_in_page.dart';
import 'phone_sign_in_page.dart';

class SignUpPage extends StatefulWidget {
  const SignUpPage({super.key});

  @override
  State<SignUpPage> createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _signUp() async {
    final l10n = AppLocalizations.of(context)!;
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      _showError(l10n.pleaseFillAllFields);
      return;
    }
    setState(() => _isLoading = true);
    try {
      await FirebaseAuth.instance.createUserWithEmailAndPassword(
        email: _emailController.text.trim(),
        password: _passwordController.text.trim(),
      );
      // AuthGate handles navigation
    } on FirebaseAuthException catch (e) {
      _showError(e.message ?? l10n.signUpFailed);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _signInWithGoogle() async {
    final l10n = AppLocalizations.of(context)!;
    try {
      final googleUser = await GoogleSignIn.instance.authenticate();
      final credential = GoogleAuthProvider.credential(
        idToken: googleUser.authentication.idToken,
        accessToken: (await GoogleSignIn.instance.authorizationClient
                .authorizeScopes(['email', 'profile']))
            .accessToken,
      );
      await FirebaseAuth.instance.signInWithCredential(credential);
    } on Exception catch (e) {
      if (!e.toString().contains('Pigeon') &&
          !e.toString().contains('List<Object?>')) {
        _showError('${l10n.googleSignInFailed}: $e');
      }
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 40),
              Text(
                l10n.signUpTitle,
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textDark,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                l10n.signUpSubtitle,
                style:
                    const TextStyle(fontSize: 14, color: AppTheme.textGrey),
              ),
              const SizedBox(height: 32),

              // Email field
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: l10n.emailAddress,
                  hintText: l10n.emailHint,
                ),
              ),
              const SizedBox(height: 16),

              // Password field
              TextFormField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: l10n.password,
                  hintText: l10n.passwordHint,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword
                          ? Icons.visibility_off
                          : Icons.visibility,
                      color: AppTheme.textGrey,
                    ),
                    onPressed: () =>
                        setState(() => _obscurePassword = !_obscurePassword),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Sign Up button
              Align(
                alignment: Alignment.centerRight,
                child: SizedBox(
                  width: 140,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _signUp,
                    child: _isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                                color: Colors.white, strokeWidth: 2),
                          )
                        : Text(l10n.signUpButton),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Social divider
              Center(
                child: Text(
                  l10n.useaSocialPlatform,
                  style: const TextStyle(
                      color: AppTheme.textGrey, fontSize: 13),
                ),
              ),
              const SizedBox(height: 16),

              // Social buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _SocialButton(
                    icon: Icons.g_mobiledata,
                    label: 'G',
                    onTap: _signInWithGoogle,
                  ),
                  const SizedBox(width: 16),
                  _SocialButton(icon: Icons.apple, onTap: () {}),
                  const SizedBox(width: 16),
                  _SocialButton(
                    icon: Icons.phone,
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const PhoneSignInPage()),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Already have account
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    l10n.alreadyHaveAccount,
                    style: const TextStyle(color: AppTheme.textGrey),
                  ),
                  GestureDetector(
                    onTap: () => Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const AppSignInPage()),
                    ),
                    child: Text(
                      l10n.login,
                      style: const TextStyle(
                        color: AppTheme.primaryGreen,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Continue as Guest
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () async {
                    await FirebaseAuth.instance.signInAnonymously();
                    // AuthGate handles navigation
                  },
                  style: OutlinedButton.styleFrom(
                    backgroundColor: AppTheme.guestButtonGrey,
                    side: BorderSide.none,
                    minimumSize: const Size(double.infinity, 52),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                  ),
                  child: Text(
                    l10n.continueAsGuest,
                    style: const TextStyle(
                      color: AppTheme.textDark,
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SocialButton extends StatelessWidget {
  final IconData icon;
  final String? label;
  final VoidCallback onTap;

  const _SocialButton({required this.icon, this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 52,
        height: 52,
        decoration: BoxDecoration(
          border: Border.all(color: AppTheme.borderGrey),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Center(
          child: label != null
              ? Text(label!,
                  style: const TextStyle(
                      fontSize: 20, fontWeight: FontWeight.bold))
              : Icon(icon, size: 24, color: AppTheme.textDark),
        ),
      ),
    );
  }
}