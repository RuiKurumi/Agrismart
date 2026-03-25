import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../l10n/app_localizations.dart';

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

class FarmManagementPage extends StatelessWidget {
  const FarmManagementPage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return const SizedBox();

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text(l10n.farmManagementTitle),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddFieldSheet(context, user.uid),
        backgroundColor: const Color(0xFF2E7D32),
        icon: const Icon(Icons.add, color: Colors.white),
        label: Text(l10n.farmAddField,
            style: TextStyle(color: Colors.white)),
      ),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance
            .collection('users')
            .doc(user.uid)
            .collection('fields')
            .orderBy('createdAt', descending: false)
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
                child: CircularProgressIndicator(
                    color: Color(0xFF2E7D32)));
          }

          final docs = snapshot.data?.docs ?? [];

          // Overview card
          final totalHectares = docs.fold<double>(
            0,
            (sum, doc) {
              final data = doc.data() as Map<String, dynamic>;
              return sum +
                  ((data['size'] as num?)?.toDouble() ?? 0);
            },
          );
          final activeFields = docs
              .where((doc) =>
                  (doc.data() as Map<String, dynamic>)['status'] ==
                  'active')
              .length;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Overview card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2E7D32),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisAlignment:
                        MainAxisAlignment.spaceAround,
                    children: [
                      _OverviewStat(
                        value: docs.length.toString(),
                        label: 'Total Fields',
                        icon: Icons.grid_view,
                      ),
                      _OverviewStat(
                        value:
                            '${totalHectares.toStringAsFixed(1)} ha',
                        label: 'Total Area',
                        icon: Icons.straighten,
                      ),
                      _OverviewStat(
                        value: activeFields.toString(),
                        label: 'Active',
                        icon: Icons.eco,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                if (docs.isEmpty)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        children: [
                          const Icon(Icons.agriculture,
                              size: 64, color: Colors.grey),
                          const SizedBox(height: 16),
                          Text(
                            l10n.farmNoFields,
                            style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            l10n.farmNoFieldsSubtitle,
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.grey),
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  ...docs.map((doc) {
                    final data =
                        doc.data() as Map<String, dynamic>;
                    return _FieldCard(
                      fieldId: doc.id,
                      userId: user.uid,
                      data: data,
                      onEdit: () =>
                          _showAddFieldSheet(context, user.uid,
                              fieldId: doc.id, existing: data),
                    );
                  }),

                // Bottom padding for FAB
                const SizedBox(height: 80),
              ],
            ),
          );
        },
      ),
    );
  }

  void _showAddFieldSheet(BuildContext context, String userId,
      {String? fieldId, Map<String, dynamic>? existing}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _AddFieldSheet(
        userId: userId,
        fieldId: fieldId,
        existing: existing,
      ),
    );
  }
}

class _OverviewStat extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;

  const _OverviewStat({
    required this.value,
    required this.label,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: Colors.white70, size: 20),
        const SizedBox(height: 6),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
              color: Colors.white70, fontSize: 11),
        ),
      ],
    );
  }
}

class _FieldCard extends StatelessWidget {
  final String fieldId;
  final String userId;
  final Map<String, dynamic> data;
  final VoidCallback onEdit;

  const _FieldCard({
    required this.fieldId,
    required this.userId,
    required this.data,
    required this.onEdit,
  });

  String _getGrowthStage() {
    final plantingDate = (data['plantingDate'] as dynamic)?.toDate();
    if (plantingDate == null) return '--';
    final dap = DateTime.now().difference(plantingDate).inDays;
    if (dap <= 14) return 'Germination';
    if (dap <= 30) return 'Seedling';
    if (dap <= 60) return 'Vegetative';
    if (dap <= 90) return 'Bulbing';
    if (dap <= 110) return 'Maturation';
    return 'Ready for Harvest';
  }

  double _getProgress() {
    final plantingDate = (data['plantingDate'] as dynamic)?.toDate();
    if (plantingDate == null) return 0;
    final dap = DateTime.now().difference(plantingDate).inDays;
    return (dap / 110).clamp(0.0, 1.0);
  }

  Color _getStageColor() {
    final stage = _getGrowthStage();
    switch (stage) {
      case 'Germination':
        return Colors.brown;
      case 'Seedling':
        return Colors.lightGreen;
      case 'Vegetative':
        return Colors.green;
      case 'Bulbing':
        return Colors.teal;
      case 'Maturation':
        return Colors.orange;
      case 'Ready for Harvest':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  Future<void> _deleteField(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Field'),
        content: Text(
            'Are you sure you want to delete "${data['name'] ?? 'this field'}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style:
                ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete',
                style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await FirebaseFirestore.instance
          .collection('users')
          .doc(userId)
          .collection('fields')
          .doc(fieldId)
          .delete();
    }
  }

  Future<void> _markHarvested(BuildContext context) async {
    await FirebaseFirestore.instance
        .collection('users')
        .doc(userId)
        .collection('fields')
        .doc(fieldId)
        .update({'status': 'harvested'});
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isHarvested = data['status'] == 'harvested';
    final stageColor = _getStageColor();
    final progress = _getProgress();
    final plantingDate =
        (data['plantingDate'] as dynamic)?.toDate() as DateTime?;
    final dap = plantingDate != null
        ? DateTime.now().difference(plantingDate).inDays
        : 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: isHarvested
            ? Border.all(color: Colors.grey.withOpacity(0.3))
            : null,
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        data['name'] ?? 'Unnamed Field',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: isHarvested
                              ? Colors.grey
                              : Colors.black,
                        ),
                      ),
                      Text(
                        '${data['variety'] ?? '--'} · ${data['size'] ?? '--'} ha · ${data['irrigationType'] ?? '--'}',
                        style: const TextStyle(
                            color: Colors.grey, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                PopupMenuButton<String>(
                  onSelected: (value) {
                    if (value == 'edit') onEdit();
                    if (value == 'harvest') _markHarvested(context);
                    if (value == 'delete') _deleteField(context);
                  },
                  itemBuilder: (_) => [
                    const PopupMenuItem(
                        value: 'edit',
                        child: Row(children: [
                          Icon(Icons.edit, size: 18),
                          SizedBox(width: 8),
                          Text('Edit')
                        ])),
                    if (!isHarvested)
                      const PopupMenuItem(
                          value: 'harvest',
                          child: Row(children: [
                            Icon(Icons.check_circle_outline,
                                size: 18),
                            SizedBox(width: 8),
                            Text('Mark as Harvested')
                          ])),
                    const PopupMenuItem(
                        value: 'delete',
                        child: Row(children: [
                          Icon(Icons.delete_outline,
                              size: 18, color: Colors.red),
                          SizedBox(width: 8),
                          Text('Delete',
                              style: TextStyle(color: Colors.red))
                        ])),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),

            if (isHarvested)
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.grey.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(l10n.farmHarvested,
                    style:
                        TextStyle(color: Colors.grey, fontSize: 12)),
              )
            else ...[
              // Growth stage badge
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: stageColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                          color: stageColor.withOpacity(0.3)),
                    ),
                    child: Text(
                      _getGrowthStage(),
                      style: TextStyle(
                          color: stageColor,
                          fontSize: 12,
                          fontWeight: FontWeight.w600),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text('$dap DAP',
                      style: const TextStyle(
                          color: Colors.grey, fontSize: 12)),
                ],
              ),
              const SizedBox(height: 10),

              // Progress bar
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: progress,
                  backgroundColor: Colors.grey.withOpacity(0.15),
                  valueColor:
                      AlwaysStoppedAnimation<Color>(stageColor),
                  minHeight: 6,
                ),
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                   Text(l10n.farmPlanted,
                      style: TextStyle(
                          color: Colors.grey, fontSize: 10)),
                  Text('${(progress * 100).toStringAsFixed(0)}%',
                      style: TextStyle(
                          color: stageColor,
                          fontSize: 10,
                          fontWeight: FontWeight.bold)),
                  Text(l10n.farmHarvestLabel,
                      style: TextStyle(
                          color: Colors.grey, fontSize: 10)),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _AddFieldSheet extends StatefulWidget {
  final String userId;
  final String? fieldId;
  final Map<String, dynamic>? existing;

  const _AddFieldSheet({
    required this.userId,
    this.fieldId,
    this.existing,
  });

  @override
  State<_AddFieldSheet> createState() => _AddFieldSheetState();
}

class _AddFieldSheetState extends State<_AddFieldSheet> {
  final _nameController = TextEditingController();
  final _sizeController = TextEditingController();
  String? _variety;
  String? _irrigationType;
  DateTime? _plantingDate;
  bool _isLoading = false;

  bool get _isEditing => widget.fieldId != null;

  @override
  void initState() {
    super.initState();
    if (widget.existing != null) {
      final e = widget.existing!;
      _nameController.text = e['name'] ?? '';
      _sizeController.text = e['size']?.toString() ?? '';
      _variety = e['variety'];
      _irrigationType = e['irrigationType'];
      _plantingDate =
          (e['plantingDate'] as dynamic)?.toDate() as DateTime?;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _sizeController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _plantingDate ??
          DateTime.now().subtract(const Duration(days: 30)),
      firstDate:
          DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now(),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(
              primary: Color(0xFF2E7D32)),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _plantingDate = picked);
  }

  Future<void> _save() async {
    if (_nameController.text.isEmpty ||
        _sizeController.text.isEmpty ||
        _variety == null ||
        _irrigationType == null ||
        _plantingDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all fields.')),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      final data = {
        'name': _nameController.text.trim(),
        'size': double.tryParse(_sizeController.text) ?? 0,
        'variety': _variety,
        'irrigationType': _irrigationType,
        'plantingDate': _plantingDate,
        'status': 'active',
        if (!_isEditing) 'createdAt': DateTime.now(),
      };

      final ref = FirebaseFirestore.instance
          .collection('users')
          .doc(widget.userId)
          .collection('fields');

      if (_isEditing) {
        await ref.doc(widget.fieldId).update(data);
      } else {
        await ref.add(data);
      }

      if (mounted) Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to save field: $e')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Handle bar
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),

            Text(
              _isEditing ? 'Edit Field' : 'Add New Field',
              style: const TextStyle(
                  fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),

            // Field name
            TextField(
              controller: _nameController,
              decoration: InputDecoration(
                hintText: 'Field name (e.g. Field A)',
                filled: true,
                fillColor: const Color(0xFFF5F5F5),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Size
            TextField(
              controller: _sizeController,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              decoration: InputDecoration(
                hintText: 'Size in hectares (e.g. 0.5)',
                suffixText: 'ha',
                filled: true,
                fillColor: const Color(0xFFF5F5F5),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Variety dropdown
            DropdownButtonFormField<String>(
              value: _variety,
              hint: Text(l10n.farmSelectVariety),
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFFF5F5F5),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
              items: _onionVarieties
                  .map((v) =>
                      DropdownMenuItem(value: v, child: Text(v)))
                  .toList(),
              onChanged: (v) => setState(() => _variety = v),
            ),
            const SizedBox(height: 12),

            // Irrigation dropdown
            DropdownButtonFormField<String>(
              value: _irrigationType,
              hint: Text(l10n.farmSelectIrrigation),
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFFF5F5F5),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
              items: _irrigationTypes
                  .map((v) =>
                      DropdownMenuItem(value: v, child: Text(v)))
                  .toList(),
              onChanged: (v) => setState(() => _irrigationType = v),
            ),
            const SizedBox(height: 12),

            // Planting date
            GestureDetector(
              onTap: _pickDate,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF5F5F5),
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
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Save button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _save,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2E7D32),
                  minimumSize: const Size(double.infinity, 52),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                            color: Colors.white, strokeWidth: 2),
                      )
                    : Text(
                        _isEditing ? l10n.saveChanges : l10n.farmAddField,
                        style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}