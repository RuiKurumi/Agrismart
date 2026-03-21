import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../l10n/app_localizations.dart';
import '../../theme/app_theme.dart';
import 'phone_verify_page.dart';

class PhoneSignInPage extends StatefulWidget {
  const PhoneSignInPage({super.key});

  @override
  State<PhoneSignInPage> createState() => _PhoneSignInPageState();
}

class _PhoneSignInPageState extends State<PhoneSignInPage> {
  final _phoneController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _signInWithPhone() async {
    final l10n = AppLocalizations.of(context)!;
    if (_phoneController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.pleaseEnterValidPhone)),
      );
      return;
    }
    setState(() => _isLoading = true);
    await FirebaseAuth.instance.verifyPhoneNumber(
      phoneNumber: _phoneController.text.trim(),
      verificationCompleted: (PhoneAuthCredential credential) async {
        await FirebaseAuth.instance.signInWithCredential(credential);
      },
      verificationFailed: (FirebaseAuthException e) {
        if (mounted) {
          setState(() => _isLoading = false);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(e.message ?? l10n.verificationFailed)),
          );
        }
      },
      codeSent: (String verificationId, int? resendToken) {
        if (mounted) {
          setState(() => _isLoading = false);
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) =>
                  PhoneVerifyPage(verificationId: verificationId),
            ),
          );
        }
      },
      codeAutoRetrievalTimeout: (String verificationId) {
        if (mounted) setState(() => _isLoading = false);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(l10n.phoneSignInTitle),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            Text(
              l10n.phoneSignInSubtitle,
              style:
                  const TextStyle(fontSize: 14, color: AppTheme.textGrey),
            ),
            const SizedBox(height: 24),
            TextFormField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(
                labelText: l10n.phoneNumber,
                hintText: l10n.phoneHint,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _signInWithPhone,
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2),
                    )
                  : Text(l10n.signInWithPhone),
            ),
          ],
        ),
      ),
    );
  }
}