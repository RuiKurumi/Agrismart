// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appName => 'AgriSmart';

  @override
  String get signInTitle => 'Welcome Back!';

  @override
  String get signInSubtitle => 'Use the form below to access your account.';

  @override
  String get signInButton => 'Sign In';

  @override
  String get signUpTitle => 'Get Started';

  @override
  String get signUpSubtitle => 'Create an account by using the form below.';

  @override
  String get signUpButton => 'Sign Up';

  @override
  String get forgotPassword => 'Forgot Password?';

  @override
  String get forgotPasswordTitle => 'Forgot Password';

  @override
  String get forgotPasswordSubtitle =>
      'We will send you an email with a link to reset your password, please enter the email associated with your account below.';

  @override
  String get sendResetLink => 'Send Reset Link';

  @override
  String get resetLinkSent => 'Reset link sent! Check your email.';

  @override
  String get continueAsGuest => 'Continue as Guest';

  @override
  String get useaSocialPlatform => 'Use a social platform to continue';

  @override
  String get dontHaveAccount => 'Don\'t have an account? ';

  @override
  String get createAccount => 'Create Account';

  @override
  String get alreadyHaveAccount => 'Already have an account? ';

  @override
  String get login => 'Login';

  @override
  String get emailAddress => 'Email Address';

  @override
  String get emailHint => 'Enter your email here...';

  @override
  String get emailLabel => 'Your email';

  @override
  String get emailHintReset => 'Enter your email to receive a link...';

  @override
  String get password => 'Password';

  @override
  String get passwordHint => 'Enter your password here...';

  @override
  String get phoneNumber => 'Your Phone Number';

  @override
  String get phoneHint => 'Please enter a valid number...';

  @override
  String get phoneSignInTitle => 'Phone Sign In';

  @override
  String get phoneSignInSubtitle =>
      'Type in your phone number below to register.';

  @override
  String get signInWithPhone => 'Sign In with Phone';

  @override
  String get confirmCodeTitle => 'Confirm your Code';

  @override
  String get confirmCodeSubtitle =>
      'This code helps keep your account safe and secure.';

  @override
  String get confirmAndContinue => 'Confirm & Continue';

  @override
  String get enterSixDigitCode => 'Please enter the 6-digit code.';

  @override
  String get invalidCode => 'Invalid code.';

  @override
  String get verificationFailed => 'Verification failed.';

  @override
  String get pleaseEnterValidPhone => 'Please enter a valid phone number.';

  @override
  String get createOrEditProfile => 'Create or Edit Profile';

  @override
  String get yourName => 'Your Name';

  @override
  String get yourCity => 'Your City / Municipality';

  @override
  String get selectProvince => 'Select Province';

  @override
  String get yourBio => 'Your bio';

  @override
  String get saveChanges => 'Save Changes';

  @override
  String get profileSaved => 'Profile saved!';

  @override
  String get failedToSaveProfile => 'Failed to save profile.';

  @override
  String get pleaseFillAllFields => 'Please fill in all fields.';

  @override
  String get signInFailed => 'Sign in failed.';

  @override
  String get signUpFailed => 'Sign up failed.';

  @override
  String get googleSignInFailed => 'Google sign in failed.';

  @override
  String get errorOccurred => 'Error occurred.';

  @override
  String get pleaseEnterEmail => 'Please enter your email address.';

  @override
  String farmOnboardingStep(int step, int total) {
    return 'Step $step of $total';
  }

  @override
  String get tellUsAboutFarm => 'Tell us about\nyour farm 🌱';

  @override
  String get farmProfileSubtitle =>
      'This helps us give you accurate advice for your specific farm.';

  @override
  String get farmSize => 'Farm Size (hectares)';

  @override
  String get farmSizeHint => 'e.g. 0.5';

  @override
  String get irrigationType => 'Irrigation Type';

  @override
  String get irrigated => 'Irrigated';

  @override
  String get rainFed => 'Rain-fed';

  @override
  String get continueButton => 'Continue';

  @override
  String get cropSetupTitle => 'Set up your\ncrop details 🧅';

  @override
  String get cropSetupSubtitle =>
      'We\'ll track your crop\'s growth stage automatically.';

  @override
  String get onionVariety => 'Onion Variety';

  @override
  String get plantingDate => 'Planting Date';

  @override
  String get selectPlantingDate => 'Select planting date';

  @override
  String currentStage(String stage) {
    return 'Current stage: $stage';
  }

  @override
  String get summaryTitle => 'You\'re all set! 🎉';

  @override
  String get summarySubtitle => 'Here\'s a summary of your farm profile.';

  @override
  String get farmSizeLabel => 'Farm Size';

  @override
  String hectares(String size) {
    return '$size hectares';
  }

  @override
  String get irrigationLabel => 'Irrigation';

  @override
  String get onionVarietyLabel => 'Onion Variety';

  @override
  String get plantingDateLabel => 'Planting Date';

  @override
  String get currentStageLabel => 'Current Stage';

  @override
  String get startUsingAgriSmart => 'Start Using AgriSmart';

  @override
  String get failedToSaveFarmProfile => 'Failed to save farm profile.';

  @override
  String get pleaseSelectVarietyAndDate =>
      'Please select your onion variety and planting date.';

  @override
  String get growthGermination => 'Germination';

  @override
  String get growthSeedling => 'Seedling';

  @override
  String get growthVegetative => 'Vegetative';

  @override
  String get growthBulbing => 'Bulbing';

  @override
  String get growthMaturation => 'Maturation';

  @override
  String get growthHarvest => 'Ready for Harvest';

  @override
  String daysAfterPlanting(String stage, int dap) {
    return '$stage ($dap DAP)';
  }
}
