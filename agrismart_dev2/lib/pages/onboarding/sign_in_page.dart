import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../l10n/app_localizations.dart';
import '../../theme/app_theme.dart';
import '../onboarding/sign_up_page.dart';
import '../onboarding/forgot_password_page.dart';
import '../onboarding/phone_sign_in_page.dart';
import '../onboarding/create_profile_page.dart';

class AppSignInPage extends StatefulWidget {
  const AppSignInPage({super.key});

  @override
  State<AppSignInPage> createState() => _SignInPageState();
}

class _SignInPageState extends State<AppSignInPage> {
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

  Future<void> _signIn() async {
    final l10n = AppLocalizations.of(context)!;
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      _showError(l10n.pleaseFillAllFields);
      return;
    }
    setState(() => _isLoading = true);
    try {
      await FirebaseAuth.instance.signInWithEmailAndPassword(
        email: _emailController.text.trim(),
        password: _passwordController.text.trim(),
      );
    } on FirebaseAuthException catch (e) {
      _showError(e.message ?? l10n.signInFailed);
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
                l10n.signInTitle,
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textDark,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                l10n.signInSubtitle,
                style: const TextStyle(fontSize: 14, color: AppTheme.textGrey),
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
              const SizedBox(height: 20),

              // Forgot Password + Sign In row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton(
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const ForgotPasswordPage()),
                    ),
                    child: Text(
                      l10n.forgotPassword,
                      style: const TextStyle(color: AppTheme.textGrey),
                    ),
                  ),
                  SizedBox(
                    width: 140,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _signIn,
                      child: _isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                  color: Colors.white, strokeWidth: 2),
                            )
                          : Text(l10n.signInButton),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Social divider
              Center(
                child: Text(
                  l10n.useaSocialPlatform,
                  style:
                      const TextStyle(color: AppTheme.textGrey, fontSize: 13),
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
                  _SocialButton(
                    icon: Icons.apple,
                    onTap: () {},
                  ),
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

              // Create account
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    l10n.dontHaveAccount,
                    style: const TextStyle(color: AppTheme.textGrey),
                  ),
                  GestureDetector(
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const SignUpPage()),
                    ),
                    child: Text(
                      l10n.createAccount,
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