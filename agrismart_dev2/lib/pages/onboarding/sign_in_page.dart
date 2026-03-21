import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../theme/app_theme.dart';
import '../onboarding/sign_up_page.dart';
import '../onboarding/forgot_password_page.dart';
import '../onboarding/phone_sign_in_page.dart';
import '../onboarding/create_profile_page.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
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
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      _showError('Please fill in all fields.');
      return;
    }
    setState(() => _isLoading = true);
    try {
      await FirebaseAuth.instance.signInWithEmailAndPassword(
        email: _emailController.text.trim(),
        password: _passwordController.text.trim(),
      );
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const CreateProfilePage()),
        );
      }
    } on FirebaseAuthException catch (e) {
      _showError(e.message ?? 'Sign in failed.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _signInWithGoogle() async {
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
      _showError('Google sign in failed: $e');
    }
  }
}

  void _showError(String message) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 40),
              const Text(
                'Welcome Back!',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textDark,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Use the form below to access your account.',
                style: TextStyle(fontSize: 14, color: AppTheme.textGrey),
              ),
              const SizedBox(height: 32),

              // Email field
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'Email Address',
                  hintText: 'Enter your email here...',
                ),
              ),
              const SizedBox(height: 16),

              // Password field
              TextFormField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: 'Password',
                  hintText: 'Enter your password here...',
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
                    child: const Text(
                      'Forgot Password?',
                      style: TextStyle(color: AppTheme.textGrey),
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
                          : const Text('Sign In'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Social divider
              const Center(
                child: Text(
                  'Use a social platform to continue',
                  style: TextStyle(color: AppTheme.textGrey, fontSize: 13),
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
                  const Text(
                    "Don't have an account? ",
                    style: TextStyle(color: AppTheme.textGrey),
                  ),
                  GestureDetector(
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const SignUpPage()),
                    ),
                    child: const Text(
                      'Create Account',
                      style: TextStyle(
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
                    if (mounted) {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const CreateProfilePage()),
                      );
                    }
                  },
                  style: OutlinedButton.styleFrom(
                    backgroundColor: AppTheme.guestButtonGrey,
                    side: BorderSide.none,
                    minimumSize: const Size(double.infinity, 52),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                  ),
                  child: const Text(
                    'Continue as Guest',
                    style: TextStyle(
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