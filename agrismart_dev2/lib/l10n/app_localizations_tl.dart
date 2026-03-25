// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Tagalog (`tl`).
class AppLocalizationsTl extends AppLocalizations {
  AppLocalizationsTl([String locale = 'tl']) : super(locale);

  @override
  String get appName => 'AgriSmart';

  @override
  String get signInTitle => 'Maligayang Pagbabalik!';

  @override
  String get signInSubtitle =>
      'Gamitin ang form sa ibaba para ma-access ang inyong account.';

  @override
  String get signInButton => 'Mag-sign In';

  @override
  String get signUpTitle => 'Magsimula Na';

  @override
  String get signUpSubtitle => 'Gumawa ng account gamit ang form sa ibaba.';

  @override
  String get signUpButton => 'Mag-sign Up';

  @override
  String get forgotPassword => 'Nakalimutan ang Password?';

  @override
  String get forgotPasswordTitle => 'Nakalimutan ang Password';

  @override
  String get forgotPasswordSubtitle =>
      'Magpapadala kami ng email na may link para i-reset ang inyong password. Mangyaring ilagay ang email na nauugnay sa inyong account sa ibaba.';

  @override
  String get sendResetLink => 'Magpadala ng Reset Link';

  @override
  String get resetLinkSent =>
      'Naipadala ang reset link! Tingnan ang inyong email.';

  @override
  String get continueAsGuest => 'Magpatuloy bilang Bisita';

  @override
  String get useaSocialPlatform => 'Gumamit ng social platform para magpatuloy';

  @override
  String get dontHaveAccount => 'Wala pang account? ';

  @override
  String get createAccount => 'Gumawa ng Account';

  @override
  String get alreadyHaveAccount => 'Mayroon nang account? ';

  @override
  String get login => 'Mag-login';

  @override
  String get emailAddress => 'Email Address';

  @override
  String get emailHint => 'Ilagay ang inyong email dito...';

  @override
  String get emailLabel => 'Ang inyong email';

  @override
  String get emailHintReset =>
      'Ilagay ang inyong email para makatanggap ng link...';

  @override
  String get password => 'Password';

  @override
  String get passwordHint => 'Ilagay ang inyong password dito...';

  @override
  String get phoneNumber => 'Ang Inyong Numero ng Telepono';

  @override
  String get phoneHint => 'Mangyaring maglagay ng wastong numero...';

  @override
  String get phoneSignInTitle => 'Mag-sign In gamit ang Telepono';

  @override
  String get phoneSignInSubtitle =>
      'Ilagay ang inyong numero ng telepono sa ibaba para mag-rehistro.';

  @override
  String get signInWithPhone => 'Mag-sign In gamit ang Telepono';

  @override
  String get confirmCodeTitle => 'Kumpirmahin ang Inyong Code';

  @override
  String get confirmCodeSubtitle =>
      'Tinutulungan ng code na ito na panatilihing ligtas ang inyong account.';

  @override
  String get confirmAndContinue => 'Kumpirmahin at Magpatuloy';

  @override
  String get enterSixDigitCode => 'Mangyaring ilagay ang 6-digit na code.';

  @override
  String get invalidCode => 'Hindi wastong code.';

  @override
  String get verificationFailed => 'Nabigo ang pag-verify.';

  @override
  String get pleaseEnterValidPhone =>
      'Mangyaring maglagay ng wastong numero ng telepono.';

  @override
  String get createOrEditProfile => 'Gumawa o I-edit ang Profile';

  @override
  String get yourName => 'Ang Inyong Pangalan';

  @override
  String get yourCity => 'Ang Inyong Lungsod / Munisipyo';

  @override
  String get selectProvince => 'Pumili ng Probinsya';

  @override
  String get yourBio => 'Ang inyong bio';

  @override
  String get saveChanges => 'I-save ang mga Pagbabago';

  @override
  String get profileSaved => 'Nai-save ang profile!';

  @override
  String get failedToSaveProfile => 'Nabigo ang pag-save ng profile.';

  @override
  String get pleaseFillAllFields => 'Mangyaring punan ang lahat ng field.';

  @override
  String get signInFailed => 'Nabigo ang pag-sign in.';

  @override
  String get signUpFailed => 'Nabigo ang pag-sign up.';

  @override
  String get googleSignInFailed => 'Nabigo ang pag-sign in gamit ang Google.';

  @override
  String get errorOccurred => 'May naganap na error.';

  @override
  String get pleaseEnterEmail => 'Mangyaring ilagay ang inyong email address.';

  @override
  String farmOnboardingStep(int step, int total) {
    return 'Hakbang $step ng $total';
  }

  @override
  String get tellUsAboutFarm =>
      'Sabihin sa amin ang\ntungkol sa inyong bukid 🌱';

  @override
  String get farmProfileSubtitle =>
      'Tinutulungan kami nitong magbigay ng tumpak na payo para sa inyong partikular na bukid.';

  @override
  String get farmSize => 'Sukat ng Bukid (ektarya)';

  @override
  String get farmSizeHint => 'Sukat sa ektarya (hal. 0.5)';

  @override
  String get irrigationType => 'Uri ng Patubig';

  @override
  String get irrigated => 'May Patubig';

  @override
  String get rainFed => 'Ulan lamang';

  @override
  String get continueButton => 'Magpatuloy';

  @override
  String get cropSetupTitle => 'I-set up ang inyong\ndetalye ng pananim 🧅';

  @override
  String get cropSetupSubtitle =>
      'Awtomatiko naming susubaybayan ang yugto ng paglaki ng inyong pananim.';

  @override
  String get onionVariety => 'Uri ng Sibuyas';

  @override
  String get plantingDate => 'Petsa ng Pagtatanim';

  @override
  String get selectPlantingDate => 'Pumili ng petsa ng pagtatanim';

  @override
  String currentStage(String stage) {
    return 'Kasalukuyang yugto: $stage';
  }

  @override
  String get summaryTitle => 'Handa na kayo! 🎉';

  @override
  String get summarySubtitle => 'Narito ang buod ng inyong profile ng bukid.';

  @override
  String get farmSizeLabel => 'Sukat ng Bukid';

  @override
  String hectares(String size) {
    return '$size ektarya';
  }

  @override
  String get irrigationLabel => 'Patubig';

  @override
  String get onionVarietyLabel => 'Uri ng Sibuyas';

  @override
  String get plantingDateLabel => 'Petsa ng Pagtatanim';

  @override
  String get currentStageLabel => 'Kasalukuyang Yugto';

  @override
  String get startUsingAgriSmart => 'Simulan ang Paggamit ng AgriSmart';

  @override
  String get failedToSaveFarmProfile =>
      'Nabigo ang pag-save ng profile ng bukid.';

  @override
  String get pleaseSelectVarietyAndDate =>
      'Mangyaring piliin ang uri ng sibuyas at petsa ng pagtatanim.';

  @override
  String get growthGermination => 'Pagtubo ng Buto';

  @override
  String get growthSeedling => 'Punla';

  @override
  String get growthVegetative => 'Paglaki ng Dahon';

  @override
  String get growthBulbing => 'Pagbuo ng Bombilya';

  @override
  String get growthMaturation => 'Paghinog';

  @override
  String get growthHarvest => 'Handa na para Anihin';

  @override
  String daysAfterPlanting(String stage, int dap) {
    return '$stage ($dap DAP)';
  }

  @override
  String get settingsTitle => 'Ang Inyong Profile';

  @override
  String get settingsSubtitle => 'Nasa ibaba ang inyong mga setting';

  @override
  String get settingsAccount => 'Account';

  @override
  String get settingsGeneral => 'Pangkalahatan';

  @override
  String get settingsEditProfile => 'I-edit ang Profile';

  @override
  String get settingsSupport => 'Suporta';

  @override
  String get settingsTerms => 'Mga Tuntunin ng Serbisyo';

  @override
  String get settingsInvite => 'Mag-imbita ng mga Kaibigan';

  @override
  String get settingsAdvanced => 'Mga Advanced na Setting';

  @override
  String get settingsSignOut => 'Mag-sign Out';

  @override
  String get advancedSettingsTitle => 'Mga Advanced na Setting';

  @override
  String get advancedAppearance => 'Hitsura';

  @override
  String get advancedDarkMode => 'Dark Mode';

  @override
  String get advancedDarkModeSubtitle => 'Piliin ang light or dark na tema';

  @override
  String get advancedLanguage => 'Wika';

  @override
  String get advancedLanguageSubtitle => 'Piliin ang inyong gustong wika';

  @override
  String get advancedAI => 'AI Model';

  @override
  String get advancedAISubtitle => 'Awtomatikong nagpapalit batay sa koneksyon';

  @override
  String get advancedAILoadModel => 'Mag-load ng Local na Model';

  @override
  String get advancedAIModelLoaded => 'Na-load ang lokal na modelo ✅';

  @override
  String get advancedAIModelNotLoaded => 'Walang lokal na modelo na na-load';

  @override
  String get languageEnglish => 'Ingles';

  @override
  String get languageTagalog => 'Filipino (Tagalog)';

  @override
  String homeWelcome(String name) {
    return 'Maligayang pagdating $name';
  }

  @override
  String get homeOverview => 'Narito ang inyong Pangkalahatang-tanaw ngayon';

  @override
  String get homeCurrentConditions => 'Kasalukuyang Kondisyon';

  @override
  String get homeFiveDayForecast => '5-Araw na Hula';

  @override
  String get homeLoadingForecast => 'Nilo-load ang hula...';

  @override
  String get homeYourAlerts => 'Ang Inyong mga Alerto';

  @override
  String get homeRegionalAlerts => 'Mga Rehiyonal na Alerto';

  @override
  String get homeNoActiveAlerts => 'Walang aktibong alerto ✅';

  @override
  String get homeSignInAlerts =>
      'Mag-sign in para makita ang inyong mga alerto';

  @override
  String get homeGuidesArticles => 'Mga Gabay at Artikulo';

  @override
  String get homeNoGuides => 'Wala pang mga gabay.';

  @override
  String get homeFarmManagement => 'Pamamahala ng Bukid';

  @override
  String get homeFarmManagementSubtitle =>
      'Pamahalaan ang inyong mga bukid at subaybayan ang mga yugto ng paglaki';

  @override
  String get homeHumidity => 'Halumigmig %';

  @override
  String get homeWind => 'Hangin km/h';

  @override
  String get homeRain => 'Ulan mm';

  @override
  String get farmManagementTitle => 'Pamamahala ng Bukid';

  @override
  String get farmAddField => 'Magdagdag ng Bukid';

  @override
  String get farmTotalFields => 'Kabuuang Bukid';

  @override
  String get farmTotalArea => 'Kabuuang Lugar';

  @override
  String get farmActive => 'Aktibo';

  @override
  String get farmNoFields => 'Wala pang mga bukid';

  @override
  String get farmNoFieldsSubtitle =>
      'Pindutin ang pindutan sa ibaba para idagdag ang inyong unang bukid.';

  @override
  String get farmEditField => 'I-edit ang Bukid';

  @override
  String get farmAddNewField => 'Magdagdag ng Bagong Bukid';

  @override
  String get farmFieldName => 'Pangalan ng bukid (hal. Bukid A)';

  @override
  String get farmSelectVariety => 'Pumili ng uri ng sibuyas';

  @override
  String get farmSelectIrrigation => 'Pumili ng uri ng patubig';

  @override
  String get farmSelectPlantingDate => 'Pumili ng petsa ng pagtatanim';

  @override
  String get farmSaveChanges => 'I-save ang mga Pagbabago';

  @override
  String get farmAddFieldButton => 'Magdagdag ng Bukid';

  @override
  String get farmFailedToSave => 'Nabigo ang pag-save ng bukid';

  @override
  String get farmEdit => 'I-edit';

  @override
  String get farmMarkHarvested => 'Markahan bilang Naani';

  @override
  String get farmDelete => 'Burahin';

  @override
  String get farmDeleteTitle => 'Burahin ang Bukid';

  @override
  String farmDeleteConfirm(String name) {
    return 'Sigurado ka bang gusto mong burahin ang \"$name\"?';
  }

  @override
  String get farmHarvested => 'Naani na ✅';

  @override
  String get farmPlanted => 'Itanim';

  @override
  String get farmHarvestLabel => 'Pag-aani';

  @override
  String get farmGermination => 'Pagtubo ng Buto';

  @override
  String get farmSeedling => 'Punla';

  @override
  String get farmVegetative => 'Paglaki ng Dahon';

  @override
  String get farmBulbing => 'Pagbuo ng Bombilya';

  @override
  String get farmMaturation => 'Paghinog';

  @override
  String get farmReadyForHarvest => 'Handa na para Anihin';

  @override
  String get chatbotOnline => 'Online · Gemini';

  @override
  String get chatbotOffline => 'Offline · Lokal na Modelo';

  @override
  String get chatbotModelLoaded => 'Na-load ang modelo';

  @override
  String get chatbotLoadLocalModel => 'Mag-load ng lokal na modelo';

  @override
  String get chatbotClickAddFile => 'I-click ang Magdagdag ng File';

  @override
  String get chatbotAddFile => 'Magdagdag ng File';

  @override
  String get chatbotAskMaya => 'Magtanong kay Maya...';

  @override
  String get chatbotTyping => 'Nagta-type si Maya...';

  @override
  String get chatbotNoResponse => 'Paumanhin, walang tugon.';

  @override
  String get chatbotOfflineNoModel =>
      'Offline ako at walang lokal na modelo na na-load. Pindutin ang icon sa kanang itaas para mag-load ng GGUF modelo.';

  @override
  String get chatbotError => 'May nangyaring mali. Pakisubukan muli.';

  @override
  String get chatbotLoadModelTitle => 'Mag-load ng Lokal na Modelo';

  @override
  String get chatbotLoadModelHint => '/storage/emulated/0/models/model.gguf';

  @override
  String get chatbotLoadModelDesc =>
      'Ilagay ang buong landas sa inyong GGUF model file:';

  @override
  String get chatbotModelLoadedSnack => 'Na-load ang lokal na modelo!';

  @override
  String get chatbotModelFailed => 'Nabigo';

  @override
  String get cancel => 'Kanselahin';

  @override
  String get load => 'I-load';

  @override
  String get navHome => 'Tahanan';

  @override
  String get navCompOnion => 'CompOnion';

  @override
  String get navProfile => 'Profile';
}
