import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_tl.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('tl')
  ];

  /// No description provided for @appName.
  ///
  /// In en, this message translates to:
  /// **'AgriSmart'**
  String get appName;

  /// No description provided for @signInTitle.
  ///
  /// In en, this message translates to:
  /// **'Welcome Back!'**
  String get signInTitle;

  /// No description provided for @signInSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Use the form below to access your account.'**
  String get signInSubtitle;

  /// No description provided for @signInButton.
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get signInButton;

  /// No description provided for @signUpTitle.
  ///
  /// In en, this message translates to:
  /// **'Get Started'**
  String get signUpTitle;

  /// No description provided for @signUpSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Create an account by using the form below.'**
  String get signUpSubtitle;

  /// No description provided for @signUpButton.
  ///
  /// In en, this message translates to:
  /// **'Sign Up'**
  String get signUpButton;

  /// No description provided for @forgotPassword.
  ///
  /// In en, this message translates to:
  /// **'Forgot Password?'**
  String get forgotPassword;

  /// No description provided for @forgotPasswordTitle.
  ///
  /// In en, this message translates to:
  /// **'Forgot Password'**
  String get forgotPasswordTitle;

  /// No description provided for @forgotPasswordSubtitle.
  ///
  /// In en, this message translates to:
  /// **'We will send you an email with a link to reset your password, please enter the email associated with your account below.'**
  String get forgotPasswordSubtitle;

  /// No description provided for @sendResetLink.
  ///
  /// In en, this message translates to:
  /// **'Send Reset Link'**
  String get sendResetLink;

  /// No description provided for @resetLinkSent.
  ///
  /// In en, this message translates to:
  /// **'Reset link sent! Check your email.'**
  String get resetLinkSent;

  /// No description provided for @continueAsGuest.
  ///
  /// In en, this message translates to:
  /// **'Continue as Guest'**
  String get continueAsGuest;

  /// No description provided for @useaSocialPlatform.
  ///
  /// In en, this message translates to:
  /// **'Use a social platform to continue'**
  String get useaSocialPlatform;

  /// No description provided for @dontHaveAccount.
  ///
  /// In en, this message translates to:
  /// **'Don\'t have an account? '**
  String get dontHaveAccount;

  /// No description provided for @createAccount.
  ///
  /// In en, this message translates to:
  /// **'Create Account'**
  String get createAccount;

  /// No description provided for @alreadyHaveAccount.
  ///
  /// In en, this message translates to:
  /// **'Already have an account? '**
  String get alreadyHaveAccount;

  /// No description provided for @login.
  ///
  /// In en, this message translates to:
  /// **'Login'**
  String get login;

  /// No description provided for @emailAddress.
  ///
  /// In en, this message translates to:
  /// **'Email Address'**
  String get emailAddress;

  /// No description provided for @emailHint.
  ///
  /// In en, this message translates to:
  /// **'Enter your email here...'**
  String get emailHint;

  /// No description provided for @emailLabel.
  ///
  /// In en, this message translates to:
  /// **'Your email'**
  String get emailLabel;

  /// No description provided for @emailHintReset.
  ///
  /// In en, this message translates to:
  /// **'Enter your email to receive a link...'**
  String get emailHintReset;

  /// No description provided for @password.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get password;

  /// No description provided for @passwordHint.
  ///
  /// In en, this message translates to:
  /// **'Enter your password here...'**
  String get passwordHint;

  /// No description provided for @phoneNumber.
  ///
  /// In en, this message translates to:
  /// **'Your Phone Number'**
  String get phoneNumber;

  /// No description provided for @phoneHint.
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid number...'**
  String get phoneHint;

  /// No description provided for @phoneSignInTitle.
  ///
  /// In en, this message translates to:
  /// **'Phone Sign In'**
  String get phoneSignInTitle;

  /// No description provided for @phoneSignInSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Type in your phone number below to register.'**
  String get phoneSignInSubtitle;

  /// No description provided for @signInWithPhone.
  ///
  /// In en, this message translates to:
  /// **'Sign In with Phone'**
  String get signInWithPhone;

  /// No description provided for @confirmCodeTitle.
  ///
  /// In en, this message translates to:
  /// **'Confirm your Code'**
  String get confirmCodeTitle;

  /// No description provided for @confirmCodeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'This code helps keep your account safe and secure.'**
  String get confirmCodeSubtitle;

  /// No description provided for @confirmAndContinue.
  ///
  /// In en, this message translates to:
  /// **'Confirm & Continue'**
  String get confirmAndContinue;

  /// No description provided for @enterSixDigitCode.
  ///
  /// In en, this message translates to:
  /// **'Please enter the 6-digit code.'**
  String get enterSixDigitCode;

  /// No description provided for @invalidCode.
  ///
  /// In en, this message translates to:
  /// **'Invalid code.'**
  String get invalidCode;

  /// No description provided for @verificationFailed.
  ///
  /// In en, this message translates to:
  /// **'Verification failed.'**
  String get verificationFailed;

  /// No description provided for @pleaseEnterValidPhone.
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid phone number.'**
  String get pleaseEnterValidPhone;

  /// No description provided for @createOrEditProfile.
  ///
  /// In en, this message translates to:
  /// **'Create or Edit Profile'**
  String get createOrEditProfile;

  /// No description provided for @yourName.
  ///
  /// In en, this message translates to:
  /// **'Your Name'**
  String get yourName;

  /// No description provided for @yourCity.
  ///
  /// In en, this message translates to:
  /// **'Your City / Municipality'**
  String get yourCity;

  /// No description provided for @selectProvince.
  ///
  /// In en, this message translates to:
  /// **'Select Province'**
  String get selectProvince;

  /// No description provided for @yourBio.
  ///
  /// In en, this message translates to:
  /// **'Your bio'**
  String get yourBio;

  /// No description provided for @saveChanges.
  ///
  /// In en, this message translates to:
  /// **'Save Changes'**
  String get saveChanges;

  /// No description provided for @profileSaved.
  ///
  /// In en, this message translates to:
  /// **'Profile saved!'**
  String get profileSaved;

  /// No description provided for @failedToSaveProfile.
  ///
  /// In en, this message translates to:
  /// **'Failed to save profile.'**
  String get failedToSaveProfile;

  /// No description provided for @pleaseFillAllFields.
  ///
  /// In en, this message translates to:
  /// **'Please fill in all fields.'**
  String get pleaseFillAllFields;

  /// No description provided for @signInFailed.
  ///
  /// In en, this message translates to:
  /// **'Sign in failed.'**
  String get signInFailed;

  /// No description provided for @signUpFailed.
  ///
  /// In en, this message translates to:
  /// **'Sign up failed.'**
  String get signUpFailed;

  /// No description provided for @googleSignInFailed.
  ///
  /// In en, this message translates to:
  /// **'Google sign in failed.'**
  String get googleSignInFailed;

  /// No description provided for @errorOccurred.
  ///
  /// In en, this message translates to:
  /// **'Error occurred.'**
  String get errorOccurred;

  /// No description provided for @pleaseEnterEmail.
  ///
  /// In en, this message translates to:
  /// **'Please enter your email address.'**
  String get pleaseEnterEmail;

  /// No description provided for @farmOnboardingStep.
  ///
  /// In en, this message translates to:
  /// **'Step {step} of {total}'**
  String farmOnboardingStep(int step, int total);

  /// No description provided for @tellUsAboutFarm.
  ///
  /// In en, this message translates to:
  /// **'Tell us about\nyour farm 🌱'**
  String get tellUsAboutFarm;

  /// No description provided for @farmProfileSubtitle.
  ///
  /// In en, this message translates to:
  /// **'This helps us give you accurate advice for your specific farm.'**
  String get farmProfileSubtitle;

  /// No description provided for @farmSize.
  ///
  /// In en, this message translates to:
  /// **'Farm Size (hectares)'**
  String get farmSize;

  /// No description provided for @farmSizeHint.
  ///
  /// In en, this message translates to:
  /// **'e.g. 0.5'**
  String get farmSizeHint;

  /// No description provided for @irrigationType.
  ///
  /// In en, this message translates to:
  /// **'Irrigation Type'**
  String get irrigationType;

  /// No description provided for @irrigated.
  ///
  /// In en, this message translates to:
  /// **'Irrigated'**
  String get irrigated;

  /// No description provided for @rainFed.
  ///
  /// In en, this message translates to:
  /// **'Rain-fed'**
  String get rainFed;

  /// No description provided for @continueButton.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get continueButton;

  /// No description provided for @cropSetupTitle.
  ///
  /// In en, this message translates to:
  /// **'Set up your\ncrop details 🧅'**
  String get cropSetupTitle;

  /// No description provided for @cropSetupSubtitle.
  ///
  /// In en, this message translates to:
  /// **'We\'ll track your crop\'s growth stage automatically.'**
  String get cropSetupSubtitle;

  /// No description provided for @onionVariety.
  ///
  /// In en, this message translates to:
  /// **'Onion Variety'**
  String get onionVariety;

  /// No description provided for @plantingDate.
  ///
  /// In en, this message translates to:
  /// **'Planting Date'**
  String get plantingDate;

  /// No description provided for @selectPlantingDate.
  ///
  /// In en, this message translates to:
  /// **'Select planting date'**
  String get selectPlantingDate;

  /// No description provided for @currentStage.
  ///
  /// In en, this message translates to:
  /// **'Current stage: {stage}'**
  String currentStage(String stage);

  /// No description provided for @summaryTitle.
  ///
  /// In en, this message translates to:
  /// **'You\'re all set! 🎉'**
  String get summaryTitle;

  /// No description provided for @summarySubtitle.
  ///
  /// In en, this message translates to:
  /// **'Here\'s a summary of your farm profile.'**
  String get summarySubtitle;

  /// No description provided for @farmSizeLabel.
  ///
  /// In en, this message translates to:
  /// **'Farm Size'**
  String get farmSizeLabel;

  /// No description provided for @hectares.
  ///
  /// In en, this message translates to:
  /// **'{size} hectares'**
  String hectares(String size);

  /// No description provided for @irrigationLabel.
  ///
  /// In en, this message translates to:
  /// **'Irrigation'**
  String get irrigationLabel;

  /// No description provided for @onionVarietyLabel.
  ///
  /// In en, this message translates to:
  /// **'Onion Variety'**
  String get onionVarietyLabel;

  /// No description provided for @plantingDateLabel.
  ///
  /// In en, this message translates to:
  /// **'Planting Date'**
  String get plantingDateLabel;

  /// No description provided for @currentStageLabel.
  ///
  /// In en, this message translates to:
  /// **'Current Stage'**
  String get currentStageLabel;

  /// No description provided for @startUsingAgriSmart.
  ///
  /// In en, this message translates to:
  /// **'Start Using AgriSmart'**
  String get startUsingAgriSmart;

  /// No description provided for @failedToSaveFarmProfile.
  ///
  /// In en, this message translates to:
  /// **'Failed to save farm profile.'**
  String get failedToSaveFarmProfile;

  /// No description provided for @pleaseSelectVarietyAndDate.
  ///
  /// In en, this message translates to:
  /// **'Please select your onion variety and planting date.'**
  String get pleaseSelectVarietyAndDate;

  /// No description provided for @growthGermination.
  ///
  /// In en, this message translates to:
  /// **'Germination'**
  String get growthGermination;

  /// No description provided for @growthSeedling.
  ///
  /// In en, this message translates to:
  /// **'Seedling'**
  String get growthSeedling;

  /// No description provided for @growthVegetative.
  ///
  /// In en, this message translates to:
  /// **'Vegetative'**
  String get growthVegetative;

  /// No description provided for @growthBulbing.
  ///
  /// In en, this message translates to:
  /// **'Bulbing'**
  String get growthBulbing;

  /// No description provided for @growthMaturation.
  ///
  /// In en, this message translates to:
  /// **'Maturation'**
  String get growthMaturation;

  /// No description provided for @growthHarvest.
  ///
  /// In en, this message translates to:
  /// **'Ready for Harvest'**
  String get growthHarvest;

  /// No description provided for @daysAfterPlanting.
  ///
  /// In en, this message translates to:
  /// **'{stage} ({dap} DAP)'**
  String daysAfterPlanting(String stage, int dap);
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'tl'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'tl':
      return AppLocalizationsTl();
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}
