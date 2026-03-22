export interface AccountTranslationConfig {
  sourceLocale: string;
  targetLocale: string;
  shop: string;
}

export interface LoginLabels {
  email: string;
  password: string;
  signIn: string;
  forgotPassword: string;
  rememberMe: string;
  noAccount: string;
  createAccount: string;
}

export interface RegistrationLabels {
  createAccount: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: string;
  alreadyHaveAccount: string;
  signIn: string;
}

export interface PasswordResetLabels {
  resetPassword: string;
  enterEmail: string;
  sendResetLink: string;
  backToLogin: string;
  newPassword: string;
  confirmNewPassword: string;
  passwordUpdated: string;
}

export interface AccountDetailsLabels {
  myAccount: string;
  personalInfo: string;
  editProfile: string;
  changePassword: string;
  currentPassword: string;
  saveChanges: string;
  accountUpdated: string;
}

export interface OrderHistoryLabels {
  orderHistory: string;
  orderNumber: string;
  orderDate: string;
  orderStatus: string;
  orderTotal: string;
  viewDetails: string;
  trackOrder: string;
  noOrders: string;
  reorder: string;
}

export interface AddressBookLabels {
  addressBook: string;
  addAddress: string;
  editAddress: string;
  deleteAddress: string;
  defaultAddress: string;
  setAsDefault: string;
  noAddresses: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  country: string;
  province: string;
  postalCode: string;
  phone: string;
}

export interface AccountLabels {
  login: LoginLabels;
  registration: RegistrationLabels;
  passwordReset: PasswordResetLabels;
  accountDetails: AccountDetailsLabels;
  orderHistory: OrderHistoryLabels;
  addressBook: AddressBookLabels;
}

export interface OrderStatusLabel {
  status: string;
  label: string;
}

export interface TranslatedAccountPage {
  labels: AccountLabels;
  direction: "rtl" | "ltr";
  locale: string;
}
