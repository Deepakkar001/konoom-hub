// Translation dictionaries. English is the source of truth: every other
// language must provide the same keys (enforced by the `Messages` type).
//
// To add a language: add an entry to LANGUAGES and a matching dictionary
// below. To translate a new screen: add keys here and call `t("your.key")`.

import { arScreens, enScreens, frScreens } from "./screens";

export const LANGUAGES = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
] as const;

export type Lang = (typeof LANGUAGES)[number]["code"];
export type Dir = (typeof LANGUAGES)[number]["dir"];
export const DEFAULT_LANG: Lang = "en";

const enCore = {
  // Login
  "login.eyebrow": "CEMAC Inter-Wallet Remittance",
  "login.heroTitle": "One hub, every corridor, settled with confidence.",
  "login.heroBody":
    "Real-time wallet-to-wallet transfers across seven CEMAC markets — orchestrated centrally, credited instantly, reconciled without exception.",
  "login.feature.markets.title": "7 markets, one settlement engine",
  "login.feature.markets.desc":
    "Net settlement, FX and revenue share handled centrally per corridor.",
  "login.feature.compliance.title": "Compliance built in",
  "login.feature.compliance.desc":
    "KYC, AML and sanctions checks at initiation, pre-credit and post-transaction.",
  "login.feature.visibility.title": "Live operational visibility",
  "login.feature.visibility.desc":
    "Real-time monitoring across partners, with full audit trail.",
  "login.title": "Sign in to your account",
  "login.subtitle":
    "Access the Central Hub console with your assigned credentials.",
  "login.userId": "User ID",
  "login.userIdPlaceholder": "you@konoom.com",
  "login.password": "Password",
  "login.passwordPlaceholder": "Enter your password",
  "login.forgot": "Forgot password?",
  "login.submit": "Sign in",
  "login.language": "Language",
  "login.showPassword": "Show password",
  "login.hidePassword": "Hide password",
  "login.error.invalid_credentials": "Incorrect User ID or password.",
  "login.error.account_disabled":
    "This account has been disabled. Contact your administrator.",
  "login.error.partner_inactive":
    "{partner} is currently {status}. Contact Konoom Hub support.",
  "login.error.generic": "Unable to sign in. Please try again.",

  // Footer
  "footer.faqs": "FAQs",
  "footer.privacy": "Privacy Policy",
  "footer.terms": "Terms and Conditions",
  "footer.unsubscribe": "Unsubscribe",
  "footer.copyright": "Copyright {year} All Rights Reserved Koonom Central Hub",

  // Navigation
  "nav.dashboard": "Dashboard",
  "nav.partners": "Partners",
  "nav.corridors": "Corridors",
  "nav.transactions": "Transactions",
  "nav.users": "Web Users",
  "nav.settlement": "Settlement",
  "nav.reconciliation": "Reconciliation",
  "nav.reports": "Reports",
  "nav.settings": "System Settings",
  "nav.profile": "Partner Profile",
  "nav.configuration": "Configuration",
  "nav.serviceChargeRule": "Service Charge Rule",
  "nav.transactionRule": "Transaction Rule",
  "nav.comingSoon": "Coming Soon",
  "nav.comingSoonMessage": "Coming Soon",

  // Top bar
  "topbar.notifications": "Notifications",
  "topbar.unreadOne": "{count} unread update",
  "topbar.unreadMany": "{count} unread updates",
  "topbar.allCaughtUp": "You are all caught up",
  "topbar.markAllRead": "Mark all read",
  "topbar.closeNotifications": "Close notifications",
  "topbar.myAccount": "My Account",
  "topbar.signOut": "Sign out",
  "topbar.language": "Language",
};

const en = { ...enCore, ...enScreens };

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;

const frCore = {
  "login.eyebrow": "Transfert inter-portefeuilles CEMAC",
  "login.heroTitle": "Un seul hub, chaque corridor, réglé en toute confiance.",
  "login.heroBody":
    "Transferts portefeuille à portefeuille en temps réel sur sept marchés de la CEMAC — orchestrés au centre, crédités instantanément, rapprochés sans exception.",
  "login.feature.markets.title": "7 marchés, un seul moteur de règlement",
  "login.feature.markets.desc":
    "Règlement net, change et partage des revenus gérés au centre pour chaque corridor.",
  "login.feature.compliance.title": "Conformité intégrée",
  "login.feature.compliance.desc":
    "Contrôles KYC, LBC et sanctions à l'initiation, avant crédit et après transaction.",
  "login.feature.visibility.title": "Visibilité opérationnelle en direct",
  "login.feature.visibility.desc":
    "Suivi en temps réel des partenaires, avec piste d'audit complète.",
  "login.title": "Connectez-vous à votre compte",
  "login.subtitle":
    "Accédez à la console Central Hub avec les identifiants qui vous ont été attribués.",
  "login.userId": "Identifiant",
  "login.userIdPlaceholder": "vous@konoom.com",
  "login.password": "Mot de passe",
  "login.passwordPlaceholder": "Saisissez votre mot de passe",
  "login.forgot": "Mot de passe oublié ?",
  "login.submit": "Se connecter",
  "login.language": "Langue",
  "login.showPassword": "Afficher le mot de passe",
  "login.hidePassword": "Masquer le mot de passe",
  "login.error.invalid_credentials": "Identifiant ou mot de passe incorrect.",
  "login.error.account_disabled":
    "Ce compte a été désactivé. Contactez votre administrateur.",
  "login.error.partner_inactive":
    "{partner} est actuellement {status}. Contactez le support Konoom Hub.",
  "login.error.generic": "Connexion impossible. Veuillez réessayer.",

  "footer.faqs": "FAQ",
  "footer.privacy": "Politique de confidentialité",
  "footer.terms": "Conditions générales",
  "footer.unsubscribe": "Se désabonner",
  "footer.copyright": "Copyright {year} Tous droits réservés Konoom Central Hub",

  "nav.dashboard": "Tableau de bord",
  "nav.partners": "Partenaires",
  "nav.corridors": "Corridors",
  "nav.transactions": "Transactions",
  "nav.users": "Utilisateurs web",
  "nav.settlement": "Règlement",
  "nav.reconciliation": "Rapprochement",
  "nav.reports": "Rapports",
  "nav.settings": "Paramètres système",
  "nav.profile": "Profil du partenaire",
  "nav.configuration": "Configuration",
  "nav.serviceChargeRule": "Règle de frais de service",
  "nav.transactionRule": "Règle de transaction",
  "nav.comingSoon": "Bientôt disponible",
  "nav.comingSoonMessage": "Bientôt disponible",

  "topbar.notifications": "Notifications",
  "topbar.unreadOne": "{count} mise à jour non lue",
  "topbar.unreadMany": "{count} mises à jour non lues",
  "topbar.allCaughtUp": "Vous êtes à jour",
  "topbar.markAllRead": "Tout marquer comme lu",
  "topbar.closeNotifications": "Fermer les notifications",
  "topbar.myAccount": "Mon compte",
  "topbar.signOut": "Se déconnecter",
  "topbar.language": "Langue",
};

const fr: Messages = { ...frCore, ...frScreens };

const arCore = {
  "login.eyebrow": "حوالات المحافظ البينية في CEMAC",
  "login.heroTitle": "منصة واحدة لكل ممر، وتسوية بثقة.",
  "login.heroBody":
    "تحويلات فورية من محفظة إلى محفظة عبر سبعة أسواق في CEMAC — تُدار مركزياً، وتُقيَّد فوراً، وتُطابَق دون استثناء.",
  "login.feature.markets.title": "7 أسواق، ومحرك تسوية واحد",
  "login.feature.markets.desc":
    "التسوية الصافية وسعر الصرف وحصة الإيراد تُدار مركزياً لكل ممر.",
  "login.feature.compliance.title": "امتثال مدمج",
  "login.feature.compliance.desc":
    "فحوصات اعرف عميلك ومكافحة غسل الأموال والعقوبات عند البدء، وقبل الإيداع، وبعد المعاملة.",
  "login.feature.visibility.title": "رؤية تشغيلية مباشرة",
  "login.feature.visibility.desc":
    "متابعة الشركاء في الوقت الفعلي، مع سجل تدقيق كامل.",
  "login.title": "تسجيل الدخول إلى حسابك",
  "login.subtitle":
    "ادخل إلى وحدة التحكم Central Hub باستخدام بيانات الدخول المخصصة لك.",
  "login.userId": "معرّف المستخدم",
  "login.userIdPlaceholder": "you@konoom.com",
  "login.password": "كلمة المرور",
  "login.passwordPlaceholder": "أدخل كلمة المرور",
  "login.forgot": "هل نسيت كلمة المرور؟",
  "login.submit": "تسجيل الدخول",
  "login.language": "اللغة",
  "login.showPassword": "إظهار كلمة المرور",
  "login.hidePassword": "إخفاء كلمة المرور",
  "login.error.invalid_credentials": "معرّف المستخدم أو كلمة المرور غير صحيحة.",
  "login.error.account_disabled":
    "تم تعطيل هذا الحساب. تواصل مع المسؤول.",
  "login.error.partner_inactive":
    "{partner} حالته حالياً {status}. تواصل مع دعم Konoom Central Hub.",
  "login.error.generic": "تعذر تسجيل الدخول. يرجى المحاولة مرة أخرى.",

  "footer.faqs": "الأسئلة الشائعة",
  "footer.privacy": "سياسة الخصوصية",
  "footer.terms": "الشروط والأحكام",
  "footer.unsubscribe": "إلغاء الاشتراك",
  "footer.copyright": "حقوق النشر {year} جميع الحقوق محفوظة لـ Konoom Central Hub",

  "nav.dashboard": "لوحة المعلومات",
  "nav.partners": "الشركاء",
  "nav.corridors": "ممرات التحويل",
  "nav.transactions": "المعاملات",
  "nav.users": "مستخدمو الويب",
  "nav.settlement": "التسوية",
  "nav.reconciliation": "المطابقة",
  "nav.reports": "التقارير",
  "nav.settings": "إعدادات النظام",
  "nav.profile": "ملف الشريك",
  "nav.configuration": "الإعدادات",
  "nav.serviceChargeRule": "قاعدة رسوم الخدمة",
  "nav.transactionRule": "قاعدة المعاملات",
  "nav.comingSoon": "قريباً",
  "nav.comingSoonMessage": "متوفر قريباً",

  "topbar.notifications": "الإشعارات",
  "topbar.unreadOne": "{count} تحديث غير مقروء",
  "topbar.unreadMany": "{count} تحديثات غير مقروءة",
  "topbar.allCaughtUp": "لا توجد تحديثات جديدة",
  "topbar.markAllRead": "تعليم الكل كمقروء",
  "topbar.closeNotifications": "إغلاق الإشعارات",
  "topbar.myAccount": "حسابي",
  "topbar.signOut": "تسجيل الخروج",
  "topbar.language": "اللغة",
};

const ar: Messages = { ...arCore, ...arScreens };

export const MESSAGES: Record<Lang, Messages> = { en, fr, ar };
