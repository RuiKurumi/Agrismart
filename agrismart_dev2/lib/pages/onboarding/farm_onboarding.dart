import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../main_shell.dart';

const List<String> _onionVarieties = [
  'Red Creole',
  'Yellow Granex',
  'White Onion',
  'Shallots (Sibuyas Tagalog)',
  'Red Pinoy',
];

const List<String> _irrigationTypes = [
  'Irrigated',
  'Rain-fed',
];

class FarmOnboardingPage extends StatefulWidget {
  const FarmOnboardingPage({super.key});

  @override
  State<FarmOnboardingPage> createState() => _FarmOnboardingPageState();
}

class _FarmOnboardingPageState extends State<FarmOnboardingPage> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  bool _isLoading = false;

  // Step 1 - Farm Profile
  final _farmSizeController = TextEditingController();
  String? _irrigationType;

  // Step 2 - Crop Setup
  String? _onionVariety;
  DateTime? _plantingDate;

  @override
  void dispose() {
    _pageController.dispose();
    _farmSizeController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentPage == 0) {
      if (_farmSizeController.text.isEmpty || _irrigationType == null) {
        _showError('Please fill in all fields.');
        return;
      }
    } else if (_currentPage == 1) {
      if (_onionVariety == null || _plantingDate == null) {
        _showError('Please select your onion variety and planting date.');
        return;
      }
    }
    _pageController.nextPage(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(msg)));
  }

  Future<void> _pickPlantingDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().subtract(const Duration(days: 30)),
      firstDate: DateTime.now().subtract(const Duration(days: 150)),
      lastDate: DateTime.now(),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(
            primary: Color(0xFF2E7D32),
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _plantingDate = picked);
  }

  String _getGrowthStage() {
    if (_plantingDate == null) return '--';
    final dap =
        DateTime.now().difference(_plantingDate!).inDays;
    if (dap <= 14) return 'Germination ($dap DAP)';
    if (dap <= 30) return 'Seedling ($dap DAP)';
    if (dap <= 60) return 'Vegetative ($dap DAP)';
    if (dap <= 90) return 'Bulbing ($dap DAP)';
    if (dap <= 110) return 'Maturation ($dap DAP)';
    return 'Ready for Harvest ($dap DAP)';
  }

  Future<void> _saveFarmProfile() async {
  final user = FirebaseAuth.instance.currentUser;
  if (user == null) return;
  setState(() => _isLoading = true);
  try {
    // Save first field as a subcollection document
    await FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .collection('fields')
        .add({
      'name': 'Field 1',
      'size': double.tryParse(_farmSizeController.text) ?? 0,
      'irrigationType': _irrigationType,
      'variety': _onionVariety,
      'plantingDate': Timestamp.fromDate(_plantingDate!),
      'status': 'active',
      'createdAt': FieldValue.serverTimestamp(),
    });

    // Mark onboarding complete on user document
    await FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .set({
      'onboardingComplete': true,
    }, SetOptions(merge: true));

    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const MainShell()),
      );
    }
  } catch (e) {
    _showError('Failed to save farm profile: $e');
  } finally {
    if (mounted) setState(() => _isLoading = false);
  }
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F5),
      body: SafeArea(
        child: Column(
          children: [
            // Progress indicator
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: List.generate(3, (i) => Expanded(
                      child: Container(
                        height: 4,
                        margin: EdgeInsets.only(right: i < 2 ? 8 : 0),
                        decoration: BoxDecoration(
                          color: i <= _currentPage
                              ? const Color(0xFF2E7D32)
                              : const Color(0xFFE0E0E0),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    )),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Step ${_currentPage + 1} of 3',
                    style: const TextStyle(
                        color: Colors.grey, fontSize: 12),
                  ),
                ],
              ),
            ),

            // Pages
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                onPageChanged: (i) =>
                    setState(() => _currentPage = i),
                children: [
                  _buildFarmProfilePage(),
                  _buildCropSetupPage(),
                  _buildSummaryPage(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFarmProfilePage() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Tell us about\nyour farm 🌱',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              height: 1.2,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'This helps us give you accurate advice for your specific farm.',
            style: TextStyle(color: Colors.grey, fontSize: 14),
          ),
          const SizedBox(height: 32),

          const Text('Farm Size (hectares)',
              style: TextStyle(
                  fontWeight: FontWeight.w600, fontSize: 14)),
          const SizedBox(height: 8),
          TextFormField(
            controller: _farmSizeController,
            keyboardType:
                const TextInputType.numberWithOptions(decimal: true),
            decoration: InputDecoration(
              hintText: 'e.g. 0.5',
              suffixText: 'ha',
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
            ),
          ),
          const SizedBox(height: 24),

          const Text('Irrigation Type',
              style: TextStyle(
                  fontWeight: FontWeight.w600, fontSize: 14)),
          const SizedBox(height: 8),
          ..._irrigationTypes.map((type) => GestureDetector(
                onTap: () =>
                    setState(() => _irrigationType = type),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: _irrigationType == type
                        ? const Color(0xFF2E7D32).withOpacity(0.1)
                        : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: _irrigationType == type
                          ? const Color(0xFF2E7D32)
                          : Colors.transparent,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        _irrigationType == type
                            ? Icons.check_circle
                            : Icons.circle_outlined,
                        color: _irrigationType == type
                            ? const Color(0xFF2E7D32)
                            : Colors.grey,
                      ),
                      const SizedBox(width: 12),
                      Text(type,
                          style: const TextStyle(fontSize: 15)),
                    ],
                  ),
                ),
              )),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: _nextPage,
            child: const Text('Continue'),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildCropSetupPage() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Set up your\ncrop details 🧅',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              height: 1.2,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'We\'ll track your crop\'s growth stage automatically.',
            style: TextStyle(color: Colors.grey, fontSize: 14),
          ),
          const SizedBox(height: 32),

          const Text('Onion Variety',
              style: TextStyle(
                  fontWeight: FontWeight.w600, fontSize: 14)),
          const SizedBox(height: 8),
          ..._onionVarieties.map((variety) => GestureDetector(
                onTap: () =>
                    setState(() => _onionVariety = variety),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: _onionVariety == variety
                        ? const Color(0xFF2E7D32).withOpacity(0.1)
                        : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: _onionVariety == variety
                          ? const Color(0xFF2E7D32)
                          : Colors.transparent,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        _onionVariety == variety
                            ? Icons.check_circle
                            : Icons.circle_outlined,
                        color: _onionVariety == variety
                            ? const Color(0xFF2E7D32)
                            : Colors.grey,
                      ),
                      const SizedBox(width: 12),
                      Text(variety,
                          style: const TextStyle(fontSize: 15)),
                    ],
                  ),
                ),
              )),
          const SizedBox(height: 24),

          const Text('Planting Date',
              style: TextStyle(
                  fontWeight: FontWeight.w600, fontSize: 14)),
          const SizedBox(height: 8),
          GestureDetector(
            onTap: _pickPlantingDate,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: _plantingDate != null
                      ? const Color(0xFF2E7D32)
                      : Colors.transparent,
                ),
              ),
              child: Row(
                children: [
                  const Icon(Icons.calendar_today,
                      color: Color(0xFF2E7D32), size: 20),
                  const SizedBox(width: 12),
                  Text(
                    _plantingDate != null
                        ? '${_plantingDate!.day}/${_plantingDate!.month}/${_plantingDate!.year}'
                        : 'Select planting date',
                    style: TextStyle(
                      color: _plantingDate != null
                          ? Colors.black
                          : Colors.grey,
                      fontSize: 15,
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (_plantingDate != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF2E7D32).withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.eco,
                      color: Color(0xFF2E7D32), size: 18),
                  const SizedBox(width: 8),
                  Text(
                    'Current stage: ${_getGrowthStage()}',
                    style: const TextStyle(
                      color: Color(0xFF2E7D32),
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: _nextPage,
            child: const Text('Continue'),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildSummaryPage() {
    final dap = _plantingDate != null
        ? DateTime.now().difference(_plantingDate!).inDays
        : 0;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'You\'re all set! 🎉',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Here\'s a summary of your farm profile.',
            style: TextStyle(color: Colors.grey, fontSize: 14),
          ),
          const SizedBox(height: 32),

          _SummaryCard(
            icon: Icons.agriculture,
            label: 'Farm Size',
            value: '${_farmSizeController.text} hectares',
          ),
          _SummaryCard(
            icon: Icons.water_drop,
            label: 'Irrigation',
            value: _irrigationType ?? '--',
          ),
          _SummaryCard(
            icon: Icons.eco,
            label: 'Onion Variety',
            value: _onionVariety ?? '--',
          ),
          _SummaryCard(
            icon: Icons.calendar_today,
            label: 'Planting Date',
            value: _plantingDate != null
                ? '${_plantingDate!.day}/${_plantingDate!.month}/${_plantingDate!.year}'
                : '--',
          ),
          _SummaryCard(
            icon: Icons.grass,
            label: 'Current Stage',
            value: _getGrowthStage(),
          ),
          const SizedBox(height: 32),

          ElevatedButton(
            onPressed: _isLoading ? null : _saveFarmProfile,
            child: _isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                        color: Colors.white, strokeWidth: 2),
                  )
                : const Text('Start Using AgriSmart'),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _SummaryCard({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFF2E7D32).withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon,
                color: const Color(0xFF2E7D32), size: 20),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label,
                  style: const TextStyle(
                      color: Colors.grey, fontSize: 12)),
              Text(value,
                  style: const TextStyle(
                      fontWeight: FontWeight.w600, fontSize: 15)),
            ],
          ),
        ],
      ),
    );
  }
}