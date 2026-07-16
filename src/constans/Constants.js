export const SCREEN_NAMES = {
  SPLASH: 'Splash',
  LOGIN: 'Login',
  CREATE_ACCOUNT: 'CreateAccount',
  FORGOT_PASSWORD: 'ForgotPassword',
  MAIN: 'Main',
  BUYER_TABS: 'BuyerTabs',
  SELLER_TABS: 'SellerTabs',
  DASHBOARD_STACK: 'DashboardStack',
  JOBS_STACK: 'JobsStack',
  CHAT_STACK: 'ChatStack',
  WALLET_STACK: 'WalletStack',
  PROFILE_STACK: 'ProfileStack',
  DASHBOARD: 'Dashboard',
  JOBS_BOOKINGS: 'JobsBookings',
  VIEW_BIDS: 'ViewBids',
  BOOKING_DETAILS: 'BookingDetails',
  CHAT: 'Chat',
  CHAT_CONVERSATION: 'ChatConversation',
  WALLET: 'Wallet',
  PROFILE: 'Profile',
  NOTIFICATIONS: 'Notifications',
  SELLER_DASHBOARD: 'SellerDashboard',
  SELLER_JOBS: 'SellerJobs',
  SELLER_WORK: 'SellerWork',
  SELLER_PROFILE: 'SellerProfile',
  SELLER_WALLET: 'SellerWallet',
  SELLER_MY_SERVICES: 'SellerMyServices',
  SELLER_CONNECTS: 'SellerConnects',
};

export const BUYER_TABS = {
  DASHBOARD_STACK: 'DashboardStack',
  JOBS_STACK: 'JobsStack',
  CHAT_STACK: 'ChatStack',
  WALLET_STACK: 'WalletStack',
  PROFILE_STACK: 'ProfileStack',
};

export const SELLER_TABS = {
  DASHBOARD_STACK: 'SellerDashboardStack',
  JOBS_STACK: 'SellerJobsStack',
  WORK_STACK: 'SellerWorkStack',
  CHAT_STACK: 'SellerChatStack',
  PROFILE_STACK: 'SellerProfileStack',
};

export const SELLER_WORK_TABS = {
  BIDS: 'bids',
  BOOKINGS: 'bookings',
  OFFERS: 'offers',
};

export const JOBS_BOOKINGS_TABS = {
  JOBS: 'jobs',
  SERVICES: 'services',
  BOOKINGS: 'bookings',
};

export const SPLASH_DURATION = 2500;

export const USER_ROLES = {
  CREATOR: 'creator',
  BUYER: 'buyer',
};

export const LOGIN_TABS = {
  PHONE: 'phone',
  EMAIL: 'email',
};

export const INVALID_LOGIN_MESSAGE = 'Invalid email or password';

// Splash
export const SPLASH_APP_NAME = 'MatchCreatorz';
export const CONNECT_CREATE = 'Connect. Create.';
export const SUCCEED = 'Succeed.';
export const SPLASH_TAGLINE = "Let's Work!";

// Login
export const WELCOME_BACK = 'Welcome back';
export const SIGN_IN_SUBTITLE = 'Sign in to your account to continue';
export const OR_SIGN_IN_WITH = 'Or sign in with';
export const CONTINUE_WITH_GOOGLE = 'Continue with Google';
export const CONTINUE_WITH_FACEBOOK = 'Continue with Facebook';
export const PHONE = 'Phone';
export const EMAIL = 'Email';
export const PHONE_NUMBER = 'Phone number';
export const EMAIL_ADDRESS = 'Email address';
export const PASSWORD = 'Password';
export const FORGOT_PASSWORD = 'Forgot password?';
export const SIGN_IN = 'Sign in';
export const DONT_HAVE_ACCOUNT = "Don't have an account?";
export const SIGN_UP = 'Sign up';

// Sign up
export const CREATE_ACCOUNT = 'Create account';
export const CHOOSE_ACCOUNT_TYPE = 'Choose your account type to get started';
export const CREATOR_SELLER = 'Creator / Seller';
export const CREATOR_SUBTITLE = 'I want to sell my work';
export const BUYER_CLIENT = 'Buyer / Client';
export const BUYER_SUBTITLE = 'I want to hire talent';
export const OR_SIGN_UP_WITH = 'Or sign up with';
export const FULL_NAME = 'Full name';
export const CONFIRM_PASSWORD = 'Confirm password';
export const ACCEPT_TERMS = 'I accept the';
export const TERMS_AND_CONDITIONS = 'Terms and Conditions';
export const SMS_CONSENT = 'I consent to receive SMS messages for verification.';
export const ALREADY_HAVE_ACCOUNT = 'Already have an account?';
export const SELECTED = 'Selected';
export const JOIN_PLATFORM_TEXT = 'Join 50K+ creators and buyers already on the platform';

// Promo
export const PROMO_TAGLINE =
  'The premier marketplace connecting talented creators with ambitious buyers worldwide.';
export const STAT_CREATORS_VALUE = '50K+';
export const STAT_CREATORS_LABEL = 'Creators';
export const STAT_PROJECTS_VALUE = '120K+';
export const STAT_PROJECTS_LABEL = 'Projects';
export const STAT_SATISFACTION_VALUE = '98%';
export const STAT_SATISFACTION_LABEL = 'Satisfaction';

// Validation
export const PHONE_MAX_LENGTH = 10;
export const MIN_PASSWORD_LENGTH = 8;
export const ERROR_PHONE_REQUIRED = 'Phone number is required';
export const ERROR_PHONE_INVALID = 'Phone number must be 10 digits';
export const ERROR_EMAIL_REQUIRED = 'Email is required';
export const ERROR_EMAIL_INVALID = 'Enter a valid email address';
export const ERROR_PASSWORD_REQUIRED = 'Password is required';
export const ERROR_PASSWORD_MIN = 'Password must be at least 8 characters';
export const ERROR_CONFIRM_PASSWORD_REQUIRED = 'Confirm password is required';
export const ERROR_PASSWORD_MISMATCH = 'Passwords do not match';
export const ERROR_FULL_NAME_REQUIRED = 'Full name is required';
export const ERROR_TERMS_REQUIRED = 'You must accept Terms and Conditions';

// Seller signup steps
export const SIGNUP_STEPS = {
  ACCOUNT: 1,
  PROFILE: 2,
  PORTFOLIO: 3,
};

export const STEP_ACCOUNT = 'Account';
export const STEP_PROFILE = 'Profile';
export const STEP_PORTFOLIO = 'Portfolio';
export const JOIN_CREATORS_SUBTITLE = 'Join thousands of creators and buyers';
export const NEXT_PROFILE = 'Next: Profile';
export const NEXT_PORTFOLIO = 'Next: Portfolio';
export const SUBMIT_PROFILE = 'Submit Profile';
export const BACK = 'Back';
export const PROFILE_DETAILS = 'Profile Details';
export const PORTFOLIO = 'Portfolio';
export const OPTIONAL = 'Optional';
export const PORTFOLIO_SUBTITLE = 'Showcase your best work to attract more clients.';
export const UPLOAD_FILES = 'Upload images, videos or files';
export const UPLOAD_FILES_HINT = 'JPG, PNG, PDF, MP4 (max 20MB each)';
export const PHOTO_LIBRARY = 'Photo Library';
export const TAKE_PHOTO = 'Take Photo';
export const BROWSE_FILES = 'Browse Files';
export const PORTFOLIO_UPLOAD = 'PORTFOLIO UPLOAD';
export const ADD_MORE_FILES = 'Tap to add more files';
export const PORTFOLIO_LINKS = 'PORTFOLIO LINKS';
export const PORTFOLIO_LINK_PLACEHOLDER = 'https://behance.net/yourwork';
export const UPLOAD_RESUME = 'Upload PDF/DOC';
export const BIO = 'BIO';
export const BIO_PLACEHOLDER = 'Tell clients about yourself and your expertise...';
export const TAGS_SKILLS = 'TAGS / SKILLS';
export const PRICE_RANGE = 'PRICE RANGE';
export const DATE_OF_BIRTH = 'DATE OF BIRTH';
export const COUNTRY = 'COUNTRY';
export const STATE = 'STATE';
export const CITY = 'City';
export const CITY_PLACEHOLDER = 'Enter your city';
export const ZIP_PLACEHOLDER = '110001';
export const GENDER = 'GENDER';

// Uppercase labels shown above form fields
export const LABEL_FULL_NAME = 'FULL NAME';
export const LABEL_EMAIL_ADDRESS = 'EMAIL ADDRESS';
export const LABEL_PHONE_NUMBER = 'PHONE NUMBER';
export const LABEL_PASSWORD = 'PASSWORD';
export const LABEL_CONFIRM_PASSWORD = 'CONFIRM PASSWORD';
export const LABEL_CITY = 'CITY';
export const LABEL_ZIP_CODE = 'ZIP CODE';
export const LABEL_OTP = 'VERIFICATION CODE';
export const CATEGORY = 'CATEGORY';
export const RESPONSE_TIME = 'RESPONSE TIME';
export const RESUME_CV = 'RESUME / CV';
export const SET_PASSWORD = 'Set Password';
export const SET_PASSWORD_SUBTITLE = 'Create a secure password to protect your account';
export const SELLER_ACCOUNT_SUBTITLE = 'Enter your basic details to get started';
export const SELLER_PASSWORD_HINT = "You'll set your password in the final step.";
export const DOB_PLACEHOLDER = 'mm/dd/yyyy';
export const ACCOUNT_CREATED_TITLE = 'Account Created!';
export const ACCOUNT_CREATED_MESSAGE =
  'Your account has been created successfully. Please login after admin approval.';

export const APP_CURRENCY = '$';

export const PRICE_RANGE_OPTIONS = [
  '$500–$1,000/project',
  '$1,000–$5,000/project',
  '$5,000–$10,000/project',
  '$10,000+/project',
];

export const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export const CATEGORY_OPTIONS = ['Design', 'Development', 'Marketing', 'Writing', 'Video', 'Photography'];

export const RESPONSE_TIME_OPTIONS = [
  'Within 1 hour',
  'Within 4 hours',
  'Within 24 hours',
  'Within 2 days',
  'Within a week',
];

export const SKILL_TAGS = [
  'Logo',
  'Branding',
  'UI/UX',
  'WordPress',
  'React',
  'SEO',
  'Content',
  'Video',
  'Reels',
  'Photography',
  'Animation',
  'Editing',
];

// Forgot password
export const FORGOT_PASSWORD_TITLE = 'Forgot password';
export const FORGOT_PASSWORD_EMAIL_HEADING = 'Reset your password';
export const FORGOT_PASSWORD_EMAIL_SUBTITLE =
  "Don't worry, it happens. Enter the email linked to your MatchCreators account.";
export const FORGOT_PASSWORD_EMAIL_NOTE =
  'We will send a secure 6-digit verification code to this email address.';
export const FORGOT_PASSWORD_OTP_HEADING = 'Verify your email';
export const FORGOT_PASSWORD_OTP_SUBTITLE =
  'Enter the verification code we sent to your registered email address.';
export const FORGOT_PASSWORD_OTP_SENT_TO = 'Code sent to';
export const FORGOT_PASSWORD_OTP_NOTE =
  "Didn't get the code? Check spam folder or tap Resend OTP after the timer ends.";
export const FORGOT_PASSWORD_NEW_PASSWORD_HEADING = 'Create new password';
export const FORGOT_PASSWORD_NEW_PASSWORD_SUBTITLE =
  'Choose a strong password that you have not used before on this account.';
export const FORGOT_PASSWORD_PASSWORD_HINT = 'Password must be at least 8 characters long.';
export const FORGOT_PASSWORD_SECURE_NOTE =
  'Your account security matters. Never share your password with anyone.';
export const NEXT = 'Next';
export const CONTINUE = 'Continue';
export const OK = 'OK';
export const RESEND_OTP = 'Resend OTP';
export const RESEND_OTP_IN = 'Resend OTP in';
export const PASSWORD_RESET_SUCCESS_TITLE = 'Password Reset Successful';
export const PASSWORD_RESET_SUCCESS_MESSAGE =
  'Your password has been reset. You can now login with your new password.';
export const OTP_LENGTH = 6;
export const RESEND_OTP_SECONDS = 60;
export const ERROR_OTP_REQUIRED = 'OTP is required';
export const ERROR_OTP_INVALID = 'Please enter a valid 6-digit OTP';
export const ERROR_FORGOT_PASSWORD_FAILED = 'Failed to send OTP. Please try again.';
export const ERROR_VERIFY_OTP_FAILED = 'OTP verification failed. Please try again.';
export const ERROR_RESET_PASSWORD_FAILED = 'Failed to reset password. Please try again.';

// Bottom tabs
export const TAB_DASHBOARD = 'Dashboard';
export const TAB_JOBS = 'Jobs/Bookings';
export const TAB_SELLER_JOBS = 'Jobs';
export const TAB_SELLER_WORK = 'Work';
export const TAB_SELLER_MY_BIDS = 'My Bids';
export const TAB_SELLER_BOOKINGS_SEGMENT = 'Bookings';
export const TAB_SELLER_OFFERS = 'Offers';
export const TAB_CHAT = 'Chat';

export const CHAT_MESSAGES_TITLE = 'Messages';
export const CHAT_SEARCH_PLACEHOLDER = 'Search conversations...';
export const CHAT_UNREAD_LABEL = 'unread';
export const CHAT_ONLINE = 'Online';
export const CHAT_VIEW_ORDER = 'View Order';
export const CHAT_TYPE_MESSAGE = 'Type a message...';
export const CHAT_PRESS_ENTER = 'Tap send to deliver your message';
export const CHAT_TODAY = 'Today';
export const CHAT_EMPTY_CONVERSATION_MESSAGE = 'Send a message to start the conversation.';

export const EMPTY_BIDS_TITLE = 'No bids yet';
export const EMPTY_BIDS_MESSAGE = 'Creators will appear here once they bid on your job.';

export const EMPTY_SEARCH_TITLE = 'No results found';
export const EMPTY_SEARCH_MESSAGE = 'Try adjusting your search terms';

export const EMPTY_JOBS_TITLE = 'No jobs posted yet';
export const EMPTY_JOBS_MESSAGE = 'Post a job to start receiving bids from talented creators.';

export const EMPTY_BOOKINGS_TITLE = 'No bookings yet';
export const EMPTY_BOOKINGS_MESSAGE = 'Your bookings will appear here once you hire a creator.';

export const EMPTY_CHATS_TITLE = 'No conversations yet';
export const EMPTY_CHATS_MESSAGE = 'Start a chat with a creator after hiring them for a job.';

export const EMPTY_DASHBOARD_BOOKINGS_TITLE = 'No recent bookings';
export const EMPTY_DASHBOARD_BOOKINGS_MESSAGE = 'Book a creator to see your bookings here.';

export const EMPTY_DASHBOARD_CREATORS_TITLE = 'No creators yet';
export const EMPTY_DASHBOARD_CREATORS_MESSAGE = 'Browse creators and your favourites will show up here.';

export const EMPTY_NOTIFICATIONS_TITLE = 'No notifications yet';
export const EMPTY_NOTIFICATIONS_MESSAGE = 'You are all caught up! New alerts will appear here.';
export const TAB_WALLET = 'Wallet';
export const WALLET_TITLE = 'Wallet';
export const WALLET_BALANCE_LABEL = 'Wallet Balance';
export const WALLET_AVAILABLE_SUBTITLE = 'Available';
export const WALLET_TOTAL_SPENT_LABEL = 'Total Spent';
export const WALLET_TOTAL_REFUNDED_LABEL = 'Total Refunded';
export const WALLET_ALL_TIME = 'All time';
export const WALLET_ADD_MONEY_TITLE = 'Add Money to Wallet';
export const WALLET_ADD_MONEY_DESC = 'Funds added instantly via Stripe. Use for booking services.';
export const WALLET_CURRENT_BALANCE = 'Current balance';
export const WALLET_ADD_MONEY_BTN = 'Add Money';
export const WALLET_TRANSACTION_HISTORY = 'Transaction History';
export const WALLET_ADD_MONEY_TOAST = 'Stripe payment coming soon.';
export const EMPTY_WALLET_TRANSACTIONS_TITLE = 'No transactions yet';
export const EMPTY_WALLET_TRANSACTIONS_MESSAGE = 'Your wallet activity will show up here.';
export const TAB_PROFILE = 'Profile';
export const PROFILE_TITLE = 'My Account';
export const PROFILE_PERSONAL_INFO = 'Personal Information';
export const PROFILE_SAVE = 'Save';
export const PROFILE_EDIT = 'Edit';
export const PROFILE_CANCEL = 'Cancel';
export const PROFILE_UPLOAD_PHOTO = 'Update Profile Photo';
export const PROFILE_SAVED_TITLE = 'Profile Updated';
export const PROFILE_SAVED_MESSAGE = 'Your profile has been saved successfully.';
export const PROFILE_FULL_NAME = 'FULL NAME';
export const PROFILE_EMAIL = 'EMAIL ADDRESS';
export const PROFILE_EMAIL_LOGIN_HINT = 'Used for login and cannot be changed.';
export const PROFILE_ACCOUNT_SETTINGS = 'Account Settings';
export const PROFILE_PHONE = 'PHONE NUMBER';
export const PROFILE_LOCATION = 'LOCATION';
export const PROFILE_BIO = 'BIO';
export const PROFILE_BUYER_ROLE = 'Buyer';
export const PROFILE_STAT_WALLET = 'Wallet';
export const PROFILE_STAT_BOOKINGS = 'Bookings';
export const PROFILE_STAT_JOBS = 'Jobs Posted';
export const BUYER_STAT_ACTIVE_BOOKINGS = 'Active Bookings';
export const BUYER_STAT_COMPLETED_BOOKINGS = 'Completed';
export const BUYER_STAT_TOTAL_SPENT = 'Total Spent';
export const BUYER_STAT_TOTAL_JOBS = 'Total Jobs';
export const BUYER_STAT_OPEN_JOBS = 'Open Jobs';
export const PROFILE_NOTIFICATION_SETTINGS = 'Notification Settings';
export const PROFILE_NOTIFICATION_SETTINGS_DESC = 'Control which alerts you receive';
export const PROFILE_LOGOUT = 'Logout';
export const PROFILE_LOGOUT_TITLE = 'Logout?';
export const PROFILE_LOGOUT_MESSAGE = 'Are you sure you want to logout from your account?';
export const PROFILE_LOGOUT_CONFIRM = 'Yes, Logout';
export const PROFILE_DELETE_ACCOUNT = 'Delete Account';
export const PROFILE_DELETE_TITLE = 'Delete Account?';
export const PROFILE_DELETE_MESSAGE =
  'This action cannot be undone. All your data, bookings and wallet balance will be permanently removed.';
export const PROFILE_DELETE_CONFIRM = 'Yes, Delete';
export const NOTIFICATION_PREFS_TITLE = 'Notification Preferences';
export const NOTIFICATION_PREFS_SUBTITLE = 'Control which alerts you receive';
export const NOTIF_EMAIL = 'Email Notifications';
export const NOTIF_EMAIL_DESC = 'Receive updates via email';
export const NOTIF_SMS = 'SMS Notifications';
export const NOTIF_SMS_DESC = 'Receive alerts on your phone';
export const NOTIF_NEW_OFFERS = 'New Offers';
export const NOTIF_NEW_OFFERS_DESC = 'When sellers send you an offer';
export const NOTIF_BOOKING_UPDATES = 'Booking Updates';
export const NOTIF_BOOKING_UPDATES_DESC = 'Updates on your bookings';
export const NOTIF_PAYMENT_ALERTS = 'Payment Alerts';
export const NOTIF_PAYMENT_ALERTS_DESC = 'Alerts for wallet transactions';
export const NOTIF_CHAT_MESSAGES = 'Chat Messages';
export const NOTIF_CHAT_MESSAGES_DESC = 'New messages from sellers';
export const TAB_MY_JOBS = 'My Jobs';
export const TAB_SERVICES = 'Services';
export const TAB_BOOKINGS = 'Bookings';

// Dashboard
export const DASHBOARD_TITLE = 'Dashboard';
export const DASHBOARD_SEARCH_PLACEHOLDER = 'Search creators, jobs...';
export const DASHBOARD_WELCOME_PREFIX = 'Welcome back,';
export const DASHBOARD_POST_JOB = 'Post a Job';
export const DASHBOARD_QUICK_ACTIONS = 'Quick Actions';
export const DASHBOARD_RECENT_BOOKINGS = 'Recent Bookings';
export const DASHBOARD_TOP_CREATORS = 'Top Creators';
export const DASHBOARD_SEE_ALL = 'See all';

export const NOTIFICATIONS_TITLE = 'Notifications';
export const MARK_ALL_READ = 'Mark all as read';
export const UNREAD_NOTIFICATIONS_COUNT = 3;

export const NOTIFICATION_FILTER_TABS = {
  ALL: 'all',
  BOOKINGS: 'bookings',
  PAYMENTS: 'payments',
  SYSTEM: 'system',
};

export const NOTIFICATION_FILTER_LABELS = {
  ALL: 'All',
  BOOKINGS: 'Bookings',
  PAYMENTS: 'Payments',
  SYSTEM: 'System',
};

// Jobs & Bookings screen
export const JOBS_SCREEN_TITLE = 'My Jobs';
export const BOOKINGS_SCREEN_TITLE = 'My Bookings';
export const SERVICES_SCREEN_TITLE = 'Browse Services';
export const SERVICES_SEARCH_PLACEHOLDER = 'Search services...';
export const EMPTY_SERVICES_TITLE = 'No services found';
export const EMPTY_SERVICES_MESSAGE = 'Active seller services will appear here.';

export const BUYER_SERVICE_DETAIL_MODAL = {
  title: 'Service Details',
  seller: 'Seller',
  category: 'Category',
  delivery: 'Delivery Time',
  revisions: 'Revisions',
  orders: 'Orders',
  description: 'Description',
  images: 'Images',
  rating: 'Rating',
  reviews: 'Reviews',
  noReviews: 'No reviews yet for this service.',
  daysSuffix: 'days',
  contactSeller: 'Contact Seller',
  contactAgain: 'Contact Again',
  contactedHint: 'You have already contacted this seller. You can contact again if you want.',
};

export const CONTACT_SELLER_BTN = 'Contact Seller';
export const CONTACT_SELLER_AGAIN_BTN = 'Contact Again';
export const CONTACTED_SELLER_HINT =
  'You have already contacted this seller. You can contact again if you want.';

export const CONFIRM_BOOKING_MODAL = {
  title: 'Confirm Booking',
  amount: 'Amount',
  delivery: 'Delivery',
  daysSuffix: 'days',
  platformFeeNote: 'Platform fee of 10% will be applied. Total:',
  notesLabel: 'NOTES (optional)',
  notesPlaceholder: 'Any specific requirements or instructions for the seller...',
  cancel: 'Cancel',
  confirm: 'Confirm Booking',
  successTitle: 'Booking Created',
  successMessage: 'Your booking request has been sent to the seller.',
  missingSeller: 'Seller information is missing for this service.',
  failed: 'Could not create booking. Please try again.',
};

export const PLATFORM_FEE_RATE = 0.1;

export const JOBS_SEARCH_PLACEHOLDER = 'Search...';

export const MY_JOBS_SUB_TABS = {
  POSTED: 'posted',
  NEW_JOB: 'new_job',
};

export const MY_JOBS_POSTED_TAB = 'My Posted Jobs';
export const MY_JOBS_POST_NEW_TAB = 'Post New Job';
export const POST_JOB_TITLE = 'Post a New Job';
export const POST_JOB_SUBTITLE = 'Fill in the details to attract the right creators';
export const POST_JOB_BTN = 'Post Job';
export const TIPS_TITLE = 'Tips for a Great Post';
export const PLATFORM_STATS_TITLE = 'Platform Stats';

export const MY_JOBS_STATS_CONFIG = [
  { id: 'total', label: 'Total Posted', icon: 'briefcase', color: '#E94545' },
  { id: 'open', label: 'Open', icon: 'circle', color: '#1B7A45' },
  { id: 'progress', label: 'In Progress', icon: 'loader', color: '#3B6981' },
  { id: 'bids', label: 'Total Bids', icon: 'award', color: '#FFA928' },
];

export const JOB_CATEGORIES = ['Design', 'Development', 'Video', 'Writing', 'Marketing', 'Photography'];
export const JOB_TYPES = ['Fixed Price', 'Hourly'];
export const EXPERIENCE_LEVELS = ['Any Level', 'Entry Level', 'Intermediate', 'Expert'];

export const POST_JOB_PLACEHOLDERS = {
  title: 'e.g. Logo Design for My Startup',
  description:
    'Describe your project requirements, deliverables, timeline expectations, and any references...',
  budgetMin: '500',
  budgetMax: '5000',
  deadline: 'Select deadline',
  skills: 'e.g. Photoshop, Illustrator, Branding (comma separated)',
};

export const POST_JOB_LABELS = {
  title: 'Job Title',
  description: 'Description',
  category: 'Category',
  jobType: 'Job Type',
  budgetMin: 'Budget Min ($)',
  budgetMax: 'Budget Max ($)',
  deadline: 'Deadline',
  experienceLevel: 'Experience Level',
  skills: 'Required Skills',
};

export const POST_JOB_TIPS = [
  'Write a clear, specific title',
  'Describe requirements in detail',
  'Set a realistic budget range',
  'Add relevant skills and tools',
  'Include examples or references if possible',
];

export const PLATFORM_STATS = [
  { id: '1', label: 'Avg. Bids per Job', value: '8-12', color: '#E94545' },
  { id: '2', label: 'Avg. Hire Time', value: '24 hours', color: '#3B6981' },
  { id: '3', label: 'Active Creators', value: '12,000+', color: '#1B7A45' },
];

export const BUYER_PROTECTION = {
  title: 'Buyer Protection',
  text: 'Your payment is held in escrow and released only when you approve the work.',
};

export const JOB_ACTIONS = {
  VIEW_BIDS: 'View Bids',
  EDIT: 'Edit',
};

export const JOB_DETAIL_MODAL = {
  title: 'Job Details',
  postedOn: 'Posted On',
  bids: 'Bids Received',
  noSkills: 'No skills listed',
  loadError: 'Could not load latest job details.',
};

export const BOOKING_DETAIL_MODAL = {
  title: 'Booking Details',
  postedOn: 'Booked On',
  service: 'Service',
  delivery: 'Delivery Days',
  notes: 'Notes',
  noNotes: 'No notes',
  cancelReason: 'Cancel Reason',
  disputeReason: 'Dispute Reason',
  buyer: 'Buyer',
  amount: 'Amount',
  loadError: 'Could not load booking details.',
};

export const BOOKINGS_FILTER_TABS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const BOOKINGS_FILTER_LABELS = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const BOOKING_ACTIONS = {
  DETAILS: 'Details',
  CANCEL: 'Cancel',
  ACCEPT: 'Accept',
  REJECT: 'Reject',
  REVIEW: 'Leave Review',
  REVIEWED: 'Reviewed',
};

export const SUBMIT_REVIEW_MODAL = {
  title: 'Rate Your Experience',
  subtitle: 'Share feedback for this completed booking',
  ratingLabel: 'RATING',
  commentLabel: 'COMMENT (optional)',
  commentPlaceholder: 'What went well? Any feedback for the seller...',
  cancel: 'Cancel',
  submit: 'Submit Review',
  ratingRequired: 'Please select a rating.',
  successTitle: 'Review Submitted',
  successMessage: 'Thanks! Your review has been submitted.',
  failed: 'Could not submit review. Please try again.',
  alreadyReviewed: 'You have already reviewed this booking.',
};

export const SELLER_PREFIX = 'Seller:';
export const BUYER_PREFIX = 'Buyer:';
export const BIDS_SUFFIX = 'bids';
export const FEE_INCL_PREFIX = 'incl.';
export const FEE_SUFFIX = 'fee';

export const VIEW_BIDS_TITLE = 'View Bids';
export const BOOKING_DETAILS_TITLE = 'Booking Details';
export const BOOKING_ID_PREFIX = 'Booking ID';
export const BOOKING_TIMELINE = 'Timeline';
export const BOOKING_PRICE_BREAKDOWN = 'Price Breakdown';
export const BOOKING_SUBTOTAL = 'Subtotal';
export const BOOKING_SERVICE_FEE = 'Service Fee';
export const BOOKING_TOTAL = 'Total';
export const BOOKING_DESCRIPTION = 'Description';
export const HIRE_CREATOR = 'Hire Creator';
export const HIRE_CREATOR_CONFIRM_TITLE = 'Hire Creator?';
export const HIRE_CREATOR_CONFIRM_MESSAGE =
  'Are you sure you want to hire this creator for the job? This will accept their bid.';
export const HIRE_CREATOR_CONFIRM_BTN = 'Yes, Hire';
export const ERROR_HIRE_CREATOR_FAILED = 'Failed to hire creator. Please try again.';
export const REJECT_BID = 'Reject';
export const REJECT_BID_CONFIRM_TITLE = 'Reject Bid?';
export const REJECT_BID_CONFIRM_MESSAGE =
  'Are you sure you want to reject this bid? This action cannot be undone.';
export const REJECT_BID_CONFIRM_BTN = 'Yes, Reject';
export const ERROR_REJECT_BID_FAILED = 'Failed to reject bid. Please try again.';
export const UPDATE_JOB_BTN = 'Update Job';

export const CONFIRM_CANCEL = 'Cancel';
export const CONFIRM_YES = 'Yes, Confirm';

export const BOOKING_ACCEPT_TITLE = 'Accept Delivery?';
export const BOOKING_ACCEPT_MESSAGE =
  'Are you sure you want to accept this delivery? Payment will be released to the seller.';
export const BOOKING_REJECT_TITLE = 'Reject Delivery?';
export const BOOKING_REJECT_MESSAGE =
  'Please share a reason for rejecting this delivery. The booking will move to dispute.';
export const BOOKING_CANCEL_TITLE = 'Cancel Booking?';
export const BOOKING_CANCEL_MESSAGE =
  'Please share a reason for cancelling this booking. This action cannot be undone.';
export const BOOKING_REASON_PLACEHOLDER = 'Enter reason...';
export const BOOKING_REASON_REQUIRED = 'Reason is required.';
export const BOOKING_ACCEPT_CONFIRM_BTN = 'Yes, Accept';
export const BOOKING_REJECT_CONFIRM_BTN = 'Yes, Reject';
export const BOOKING_CANCEL_CONFIRM_BTN = 'Yes, Cancel';
export const ERROR_BOOKING_ACTION_FAILED = 'Booking action failed. Please try again.';

// Seller
export const SELLER_STATIC_USER = {
  name: 'User Seller',
  initials: 'US',
  email: 'seller@yopmail.com',
};

export const SELLER_DASHBOARD_TITLE = 'My Dashboard';
export const SELLER_DASHBOARD_SEARCH_PLACEHOLDER = 'Search jobs, bookings...';
export const SELLER_DASHBOARD_WELCOME_PREFIX = 'Welcome back,';
export const SELLER_DASHBOARD_BROWSE_JOBS = 'Browse Jobs';
export const SELLER_DASHBOARD_MY_SERVICES = 'My Services';
export const SELLER_DASHBOARD_CONNECTS = 'My Connects';
export const SELLER_DASHBOARD_CONNECTS_REMAINING = 'Connects remaining';
export const SELLER_DASHBOARD_BUY_CONNECTS = 'Buy More Connects';
export const SELLER_DASHBOARD_ACTIVE_BOOKINGS = 'Active Bookings';
export const SELLER_DASHBOARD_QUICK_ACTIONS = 'Quick Actions';
export const SELLER_DASHBOARD_SEE_ALL = 'View all';

export const SELLER_STAT_WALLET = 'Wallet Balance';
export const SELLER_STAT_BOOKINGS = 'Active Bookings';
export const SELLER_STAT_COMPLETED_BOOKINGS = 'Completed';
export const SELLER_STAT_EARNINGS = 'Total Earnings';
export const SELLER_STAT_RATING = 'Avg Rating';
export const SELLER_STAT_TOTAL_SERVICES = 'Total Services';
export const SELLER_STAT_PENDING_BIDS = 'Pending Bids';

export const SELLER_JOBS_TITLE = 'Browse Jobs';
export const SELLER_JOBS_SEARCH_PLACEHOLDER = 'Search jobs...';
export const SELLER_PROFILE_TITLE = 'My Account';
export const SELLER_PROFILE_QUICK_LINKS = 'Seller Tools';
export const SELLER_PROFILE_ROLE = 'Seller';
export const SELLER_PROFILE_CONNECTS = 'Connects';
export const SELLER_PROFILE_MY_SERVICES = 'My Services';

export const EMPTY_SELLER_JOBS_TITLE = 'No jobs found';
export const EMPTY_SELLER_JOBS_MESSAGE = 'New jobs will appear here when buyers post them.';
export const EMPTY_SELLER_BIDS_TITLE = 'No bids yet';
export const EMPTY_SELLER_BIDS_MESSAGE = 'Place bids on jobs to see them here.';
export const EMPTY_SELLER_OFFERS_TITLE = 'No offers yet';
export const EMPTY_SELLER_OFFERS_MESSAGE = 'Your offers will appear here.';

export const SELLER_WALLET_TITLE = 'Wallet';
export const SELLER_WALLET_AVAILABLE = 'Available Balance';
export const SELLER_WALLET_AVAILABLE_SUB = 'Ready to withdraw';
export const SELLER_WALLET_TOTAL_EARNINGS = 'Total Earnings';
export const SELLER_WALLET_TOTAL_WITHDRAWN = 'Total Withdrawn';
export const SELLER_WALLET_ALL_TIME = 'All time';
export const SELLER_WALLET_WITHDRAW_TITLE = 'Request Withdrawal';
export const SELLER_WALLET_WITHDRAW_DESC = 'Minimum withdrawal: $500 · Processed within 3-5 business days';
export const SELLER_WALLET_WITHDRAW_BTN = 'Withdraw Funds';
export const SELLER_WALLET_WITHDRAW_TOAST = 'Withdrawal request submitted successfully.';
export const SELLER_WALLET_HISTORY = 'Transaction History';

export const SELLER_SERVICES_TITLE = 'My Services';
export const SELLER_SERVICES_ADD = 'Add Service';
export const SELLER_SERVICES_SEARCH = 'Search services...';
export const EMPTY_SELLER_SERVICES_TITLE = 'No services yet';
export const EMPTY_SELLER_SERVICES_MESSAGE = 'Add a service to start getting hired.';

export const SELLER_ADD_SERVICE_MODAL = {
  title: 'Add New Service',
  titleLabel: 'Service Title',
  titlePlaceholder: 'e.g. Professional Logo Design',
  descriptionLabel: 'Description',
  descriptionPlaceholder: 'Describe what you offer...',
  imagesLabel: 'Service Images (max 5 — JPG, PNG, WEBP)',
  addPhoto: 'Add photo',
  categoryLabel: 'Category (multiple)',
  categoryPlaceholder: 'Select categories...',
  priceLabel: 'Price ($)',
  pricePlaceholder: '999',
  deliveryLabel: 'Delivery (days)',
  deliveryPlaceholder: '3',
  revisionsLabel: 'Revisions',
  revisionsPlaceholder: '1',
  tagsLabel: 'Tags (comma separated)',
  tagsPlaceholder: 'logo, branding, design',
  cancel: 'Cancel',
  submit: 'Add Service',
  titleRequired: 'Enter a service title',
  descriptionRequired: 'Enter a description',
  categoryRequired: 'Select at least one category',
  priceRequired: 'Enter a valid price',
  deliveryRequired: 'Enter delivery days',
  revisionsRequired: 'Enter revisions count',
  maxImages: 'You can upload up to 5 images',
  imageTooLarge: 'Each image must be under 5 MB',
  submitError: 'Failed to create service. Please try again.',
  successTitle: 'Service Created!',
  successMessage: 'Your service has been added successfully.',
  loadCategoriesError: 'Could not load categories.',
  editTitle: 'Edit Service',
  editSubmit: 'Save Changes',
  editSubmitError: 'Failed to update service. Please try again.',
  editSuccessTitle: 'Service Updated!',
  editSuccessMessage: 'Your service has been updated successfully.',
};

export const SELLER_SERVICE_DETAIL_MODAL = {
  title: 'Service Details',
  status: 'Status',
  price: 'Price',
  delivery: 'Delivery',
  revisions: 'Revisions',
  category: 'Category',
  tags: 'Tags',
  description: 'Description',
  rating: 'Rating',
  reviews: 'Reviews',
  noReviews: 'No reviews yet for this service.',
  bookings: 'Bookings',
  images: 'Images',
  edit: 'Edit',
  loadError: 'Could not load service details.',
  daysSuffix: 'days',
};

export const SELLER_CONNECTS_TITLE = 'Connects';
export const SELLER_CONNECTS_AVAILABLE = 'Available Connects';
export const SELLER_CONNECTS_AVAILABLE_SUB = 'Use to bid on jobs';
export const SELLER_CONNECTS_PURCHASED = 'Total Purchased';
export const SELLER_CONNECTS_USED = 'Total Used';
export const SELLER_CONNECTS_BUY_TITLE = 'Buy Connects';
export const SELLER_CONNECTS_HISTORY = 'Connect History';
export const SELLER_CONNECTS_BUY_NOW = 'Buy Now';
export const SELLER_CONNECTS_MOST_POPULAR = 'Most Popular';

export const SELLER_BIDS_TITLE = 'My Bids';
export const SELLER_BOOKINGS_TITLE = 'My Bookings';
export const SELLER_OFFERS_TITLE = 'Offers';
export const SELLER_BIDS_TOTAL = 'Total Bids';
export const SELLER_BIDS_PENDING = 'Pending';
export const SELLER_BIDS_ACCEPTED = 'Accepted';
export const SELLER_BIDS_SUCCESS_RATE = 'Success Rate';
export const SELLER_BIDS_FILTER_ALL = 'All';
export const SELLER_BIDS_FILTER_REJECTED = 'Rejected';
export const SELLER_BIDS_YOUR_BID = 'Your Bid';
export const SELLER_BIDS_BUDGET = 'Budget';
export const SELLER_BIDS_DELIVERY = 'Delivery';
export const SELLER_PLACE_BID = 'Place Bid';
export const SELLER_VIEW_JOB = 'View';
export const SELLER_BID_PENDING = 'Pending';
export const SELLER_BID_ACCEPTED = 'Accepted';
export const SELLER_BID_REJECTED = 'Rejected';
export const SELLER_YOUR_BID_PREFIX = 'Your bid';

export const SELLER_PLACE_BID_MODAL = {
  title: 'Place a Bid',
  jobLabel: 'JOB',
  budgetSuffix: 'budget',
  amountLabel: 'Bid Amount ($)',
  amountPlaceholder: 'e.g. 250',
  deliveryLabel: 'Delivery Days',
  deliveryPlaceholder: 'e.g. 5',
  proposalLabel: 'Proposal',
  proposalPlaceholder: 'Describe why you are the best fit for this job...',
  connectsInfo: 'This will use 2 connects from your balance.',
  cancel: 'Cancel',
  submit: 'Submit Bid',
  amountRequired: 'Enter a valid bid amount',
  deliveryRequired: 'Enter delivery days',
  proposalRequired: 'Enter your proposal',
  submitError: 'Failed to place bid. Please try again.',
  successTitle: 'Bid Placed!',
  successMessage: 'Your bid has been submitted successfully.',
};

export const SELLER_JOB_DETAIL_MODAL = {
  title: 'Job Details',
  buyer: 'Buyer',
  postedOn: 'Posted On',
  yourBid: 'Your Bid',
  bidAmount: 'Bid Amount',
  deliveryDays: 'Delivery Days',
  bidStatus: 'Bid Status',
  proposal: 'Proposal',
  noBid: 'You have not placed a bid yet',
  noSkills: 'No skills listed',
  loadError: 'Could not load job details.',
};

export const SELLER_BOOKINGS_SEARCH = 'Search by buyer or service...';
export const SELLER_BOOKINGS_VIEW = 'View';
export const SELLER_BOOKINGS_ACCEPT = 'Accept';
export const SELLER_BOOKINGS_CANCEL = 'Cancel';
export const SELLER_BOOKINGS_SUBMIT = 'Submit Work';

export const SELLER_BOOKING_ACCEPT_TITLE = 'Accept Booking?';
export const SELLER_BOOKING_ACCEPT_MESSAGE =
  'Are you sure you want to accept this booking? Status will change to Ongoing.';
export const SELLER_BOOKING_ACCEPT_CONFIRM = 'Yes, Accept';

export const SELLER_BOOKING_SUBMIT_TITLE = 'Submit Work?';
export const SELLER_BOOKING_SUBMIT_MESSAGE =
  'Confirm that you have delivered the work. The buyer will review and release payment.';
export const SELLER_BOOKING_SUBMIT_CONFIRM = 'Yes, Submit';

export const SELLER_BOOKING_CANCEL_TITLE = 'Cancel Booking?';
export const SELLER_BOOKING_CANCEL_MESSAGE =
  'Are you sure you want to cancel this pending booking? Please provide a reason.';
export const SELLER_BOOKING_CANCEL_CONFIRM = 'Yes, Cancel';

export const SELLER_BOOKING_DETAIL_MODAL = {
  title: 'Booking Details',
  loadError: 'Could not load booking details.',
};

export const SELLER_OFFERS_RECEIVED = 'Received Offers';
export const SELLER_OFFERS_SENT = 'Sent Offers';
export const SELLER_OFFERS_DECLINE = 'Decline';
export const SELLER_OFFERS_ACCEPT = 'Accept';

export const SELLER_OFFER_ACCEPT_TITLE = 'Accept Offer?';
export const SELLER_OFFER_ACCEPT_MESSAGE = 'Are you sure you want to accept this offer? A booking will be created.';
export const SELLER_OFFER_DECLINE_TITLE = 'Decline Offer?';
export const SELLER_OFFER_DECLINE_MESSAGE = 'Are you sure you want to decline this offer?';

export const SELLER_CONNECTS_BUY_CONFIRM_TITLE = 'Purchase Connects?';
export const SELLER_CONNECTS_BUY_CONFIRM_MESSAGE = 'Are you sure you want to purchase this connects plan?';

export const SELLER_SERVICE_ACTIVATE_TITLE = 'Activate Service?';
export const SELLER_SERVICE_ACTIVATE_MESSAGE =
  'Your service will be visible to buyers and can accept new bookings.';
export const SELLER_SERVICE_PAUSE_TITLE = 'Pause Service?';
export const SELLER_SERVICE_PAUSE_MESSAGE =
  'Your service will be hidden and will not accept new bookings.';

export const SELLER_NOTIF_NEW_JOBS = 'New Job Alerts';
export const SELLER_NOTIF_NEW_JOBS_DESC = 'When new jobs match your skills';
export const SELLER_NOTIF_BID_RESPONSES = 'Bid Responses';
export const SELLER_NOTIF_BID_RESPONSES_DESC = 'When buyers respond to your bids';
export const SELLER_NOTIF_OFFER_ALERTS = 'Offer Alerts';
export const SELLER_NOTIF_OFFER_ALERTS_DESC = 'When you receive new offers';

export const SELLER_JOB_CATEGORIES = ['All', 'Design', 'Development', 'Marketing', 'Writing', 'Video'];



export const API_ROLES = {
  SELLER: 'SELLER',
  BUYER: 'BUYER',
};

export const mapAppRoleToApiRole = role =>
  role === USER_ROLES.CREATOR ? API_ROLES.SELLER : API_ROLES.BUYER;

export const mapApiRoleToAppRole = role => {
  const normalized = String(role || '')
    .trim()
    .toUpperCase();
  if (normalized === API_ROLES.SELLER || normalized === 'CREATOR') {
    return USER_ROLES.CREATOR;
  }
  return USER_ROLES.BUYER;
};

export const AUTH_TOKEN_KEY = 'matchcreators_auth_token';
export const AUTH_USER_KEY = 'matchcreators_auth_user';
export const AUTH_ROLE_KEY = 'matchcreators_auth_role';

export const ERROR_PASSWORD_STRENGTH =
  'Password must include at least 1 uppercase letter and 1 number';
export const ERROR_CITY_REQUIRED = 'City is required';
export const ERROR_COUNTRY_REQUIRED = 'Country is required';
export const ERROR_SKILLS_REQUIRED = 'Please select at least one skill';
export const ERROR_HOURLY_RATE_REQUIRED = 'Hourly rate is required';
export const ERROR_HOURLY_RATE_INVALID = 'Enter a valid hourly rate';
export const ERROR_REGISTER_FAILED = 'Registration failed. Please try again.';
export const ERROR_PROFILE_UPDATE_FAILED = 'Failed to update profile. Please try again.';
export const ERROR_POST_JOB_FAILED = 'Failed to post job. Please try again.';
export const ERROR_UPDATE_JOB_FAILED = 'Failed to update job. Please try again.';

export const COMPANY_NAME = 'Company name (optional)';
export const LABEL_COMPANY_NAME = 'COMPANY NAME';
export const LABEL_HOURLY_RATE = 'HOURLY RATE ($)';
export const HOURLY_RATE_PLACEHOLDER = 'e.g. 500';

// API
export const API_BASE_URL = 'https://adminbackend.matchcreatorz.com/api/v1';

export const API_ENDPOINTS = {
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
  AUTH_VERIFY_FORGOT_OTP: '/auth/verify-forgot-otp',
  AUTH_RESET_PASSWORD: '/auth/reset-password',
  BUYER_PROFILE: '/buyer/profile',
  BUYER_STATS: '/buyer/stats',
  BUYER_JOBS: '/buyer/jobs',
  BUYER_BOOKINGS: '/buyer/bookings',
  BUYER_SERVICES: '/buyer/services',
  BUYER_REVIEWS: '/buyer/reviews',
  SELLER_PROFILE: '/seller/profile',
  SELLER_STATS: '/seller/stats',
  SELLER_JOBS: '/seller/jobs',
  SELLER_BIDS: '/seller/bids',
  SELLER_BOOKINGS: '/seller/bookings',
  SELLER_SERVICES: '/seller/services',
  SELLER_REVIEWS: '/seller/reviews',
  SELLER_UPLOAD: '/seller/upload',
  CATEGORIES: '/categories',
};