import 'dart:io';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:image_picker/image_picker.dart';
import 'package:firebase_storage/firebase_storage.dart';
import '../../l10n/app_localizations.dart';
import '../../theme/app_theme.dart';

class CreateProfilePage extends StatefulWidget {
  const CreateProfilePage({super.key});

  @override
  State<CreateProfilePage> createState() => _CreateProfilePageState();
}

class _CreateProfilePageState extends State<CreateProfilePage> {
  final _nameController = TextEditingController();
  final _cityController = TextEditingController();
  final _bioController = TextEditingController();
  String? _selectedProvince;
  File? _profileImage;
  bool _isLoading = false;
  String? _existingPhotoUrl;

  @override
  void initState() {
    super.initState();
    _loadExistingProfile();
  }

  Future<void> _loadExistingProfile() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    setState(() => _existingPhotoUrl = user.photoURL);
    final doc = await FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .get();
    if (doc.exists && mounted) {
      final data = doc.data()!;
      final savedProvince = data['province'] as String?;
      setState(() {
        _nameController.text = data['name'] ?? '';
        _cityController.text = data['city'] ?? '';
        _bioController.text = data['bio'] ?? '';
        _selectedProvince = philippineProvinces.contains(savedProvince)
            ? savedProvince
            : null;
        _existingPhotoUrl = data['photoUrl'] ?? user.photoURL;
      });
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _cityController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  Future<String?> _uploadProfileImage(User user) async {
    if (_profileImage == null) return null;
    try {
      print('Uploading image...');
      final ref = FirebaseStorage.instance
          .ref()
          .child('profile_images')
          .child('${user.uid}.jpg');
      await ref.putFile(_profileImage!);
      final url = await ref.getDownloadURL();
      print('Upload successful: $url');
      return url;
    } catch (e) {
      print('Upload error: $e');
      return null;
    }
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery);
    if (picked != null) setState(() => _profileImage = File(picked.path));
  }

  Future<void> _saveChanges() async {
    final l10n = AppLocalizations.of(context)!;
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    setState(() => _isLoading = true);
    try {
      final photoUrl = await _uploadProfileImage(user);

      final Map<String, dynamic> updates = {
        'email': user.email,
        'updatedAt': FieldValue.serverTimestamp(),
      };

      if (_nameController.text.trim().isNotEmpty) {
        updates['name'] = _nameController.text.trim();
      }
      if (_cityController.text.trim().isNotEmpty) {
        updates['city'] = _cityController.text.trim();
      }
      if (_selectedProvince != null) {
        updates['province'] = _selectedProvince;
      }
      if (_bioController.text.trim().isNotEmpty) {
        updates['bio'] = _bioController.text.trim();
      }
      if (photoUrl != null) {
        updates['photoUrl'] = photoUrl;
      }

      await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .set(updates, SetOptions(merge: true));

      if (_nameController.text.trim().isNotEmpty) {
        await user.updateDisplayName(_nameController.text.trim());
      }
      if (photoUrl != null) await user.updatePhotoURL(photoUrl);
      await user.reload();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.profileSaved)),
        );
        if (Navigator.canPop(context)) Navigator.pop(context);
      }
    } catch (e) {
      print('Save error: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${l10n.failedToSaveProfile}: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.createOrEditProfile)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const SizedBox(height: 8),

            // Profile photo
            GestureDetector(
              onTap: _pickImage,
              child: Stack(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: AppTheme.borderGrey,
                    backgroundImage: _profileImage != null
                        ? FileImage(_profileImage!) as ImageProvider
                        : _existingPhotoUrl != null
                            ? NetworkImage(_existingPhotoUrl!)
                            : null,
                    child: _profileImage == null && _existingPhotoUrl == null
                        ? const Icon(Icons.person,
                            size: 40, color: Colors.grey)
                        : null,
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Color(0xFF2E7D32),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.edit,
                          size: 14, color: Colors.white),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Name
            TextFormField(
              controller: _nameController,
              decoration: InputDecoration(hintText: l10n.yourName),
            ),
            const SizedBox(height: 16),

            // City/Municipality
            TextFormField(
              controller: _cityController,
              decoration: InputDecoration(hintText: l10n.yourCity),
            ),
            const SizedBox(height: 16),

            // Province dropdown
            DropdownButtonFormField<String>(
              value: _selectedProvince,
              hint: Text(l10n.selectProvince),
              decoration: InputDecoration(
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide:
                      const BorderSide(color: AppTheme.borderGrey),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide:
                      const BorderSide(color: AppTheme.borderGrey),
                ),
              ),
              items: philippineProvinces
                  .map((p) =>
                      DropdownMenuItem(value: p, child: Text(p)))
                  .toList(),
              onChanged: (v) => setState(() => _selectedProvince = v),
            ),
            const SizedBox(height: 16),

            // Bio
            TextFormField(
              controller: _bioController,
              minLines: 3,
              maxLines: 5,
              decoration: InputDecoration(
                hintText: l10n.yourBio,
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 32),

            // Save button
            ElevatedButton(
              onPressed: _isLoading ? null : _saveChanges,
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2),
                    )
                  : Text(l10n.saveChanges),
            ),
          ],
        ),
      ),
    );
  }
}