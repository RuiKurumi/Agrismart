import 'dart:io';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:image_picker/image_picker.dart';
import '../../theme/app_theme.dart';
import 'package:firebase_storage/firebase_storage.dart';

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

  @override
  void initState() {
    super.initState();
    _loadExistingProfile();
  }

  String? _existingPhotoUrl;

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
    setState(() {
      _nameController.text = data['name'] ?? '';
      _cityController.text = data['city'] ?? '';
      _bioController.text = data['bio'] ?? '';
      _selectedProvince = data['province'];
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
  final ref = FirebaseStorage.instance
      .ref()
      .child('profile_images')
      .child('${user.uid}.jpg');
  await ref.putFile(_profileImage!);
  return await ref.getDownloadURL();
}
Future<void> _pickImage() async {
  final picker = ImagePicker();
  final picked = await picker.pickImage(source: ImageSource.gallery);
  if (picked != null) setState(() => _profileImage = File(picked.path));
}
Future<void> _saveChanges() async {
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
        const SnackBar(content: Text('Profile saved!')),
      );
      if (Navigator.canPop(context)) Navigator.pop(context);
    }
  } catch (e) {
    print('Save error: $e');
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to save profile: $e')),
      );
    }
  } finally {
    if (mounted) setState(() => _isLoading = false);
  }
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create or Edit Profile')),
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
            ? const Icon(Icons.person, size: 40, color: Colors.grey)
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
          child: const Icon(Icons.edit, size: 14, color: Colors.white),
        ),
      ),
    ],
  ),
),

            // Name
            TextFormField(
              controller: _nameController,
              decoration:
                  const InputDecoration(hintText: 'Your Name'),
            ),
            const SizedBox(height: 16),

            // City/Municipality
            TextFormField(
              controller: _cityController,
              decoration: const InputDecoration(
                  hintText: 'Your City / Municipality'),
            ),
            const SizedBox(height: 16),

            // Province dropdown
            DropdownButtonFormField<String>(
              value: _selectedProvince,
              hint: const Text('Select Province'),
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
              onChanged: (v) =>
                  setState(() => _selectedProvince = v),
            ),
            const SizedBox(height: 16),

            // Bio
            TextFormField(
              controller: _bioController,
              minLines: 3,
              maxLines: 5,
              decoration: const InputDecoration(
                hintText: 'Your bio',
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
                  : const Text('Save Changes'),
            ),
          ],
        ),
      ),
    );
  }
}