import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../l10n/app_localizations.dart';
import 'onboarding/create_profile_page.dart';
import './advanced_settings.dart';
import './onboarding/sign_in_page.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  String? _photoUrl;

  @override
  void initState() {
    super.initState();
    _loadPhotoUrl();
  }

  Future<void> _loadPhotoUrl() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    final doc = await FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .get();
    if (doc.exists && mounted) {
      setState(() {
        _photoUrl = doc.data()?['photoUrl'] as String?;
      });
    }
  }

  Future<void> _signOut() async {
    await FirebaseAuth.instance.signOut();
    if (mounted) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => AppSignInPage()),
        (_) => false,
      );
    }
  }

  Future<void> _goToEditProfile() async {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const CreateProfilePage()),
    );
    await _loadPhotoUrl();
    await FirebaseAuth.instance.currentUser?.reload();
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final user = FirebaseAuth.instance.currentUser;
    final displayName = user?.displayName?.isNotEmpty == true
        ? user!.displayName!
        : user?.email?.split('@').first ?? 'User';

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Container(
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(16),
            ),
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header — avatar + name/email only, no button
                Row(
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: const Color(0xFF2E7D32),
                      backgroundImage: _photoUrl != null
                          ? NetworkImage(_photoUrl!)
                          : null,
                      child: _photoUrl == null
                          ? Text(
                              displayName[0].toUpperCase(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                              ),
                            )
                          : null,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            displayName,
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            user?.email ?? '',
                            style: const TextStyle(
                                color: Colors.grey, fontSize: 12),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Account section
                Text(l10n.settingsAccount,
                    style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Colors.grey)),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFFE0E0E0)),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      _SettingsItem(
                        icon: Icons.person_outline,
                        label: l10n.settingsEditProfile,
                        onTap: _goToEditProfile,
                      ),
                      const Divider(height: 1),
                      _SettingsItem(
                        icon: Icons.tune,
                        label: l10n.settingsAdvanced,
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const AdvancedSettingsPage()),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // General section
                Text(l10n.settingsGeneral,
                    style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Colors.grey)),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFFE0E0E0)),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      _SettingsItem(
                        icon: Icons.help_outline,
                        label: l10n.settingsSupport,
                        onTap: () {},
                      ),
                      const Divider(height: 1),
                      _SettingsItem(
                        icon: Icons.info_outline,
                        label: l10n.settingsTerms,
                        onTap: () {},
                      ),
                      const Divider(height: 1),
                      _SettingsItem(
                        icon: Icons.ios_share,
                        label: l10n.settingsInvite,
                        onTap: () {},
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Sign out
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: _signOut,
                    icon: const Icon(Icons.logout, color: Colors.red),
                    label: Text(l10n.settingsSignOut,
                        style: const TextStyle(color: Colors.red)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.red),
                      minimumSize: const Size(double.infinity, 48),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
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

class _SettingsItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _SettingsItem(
      {required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, size: 22, color: const Color(0xFF555555)),
      title: Text(label, style: const TextStyle(fontSize: 14)),
      trailing: const Icon(Icons.chevron_right, color: Colors.grey),
      onTap: onTap,
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
    );
  }
}