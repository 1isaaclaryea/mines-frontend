# Push Notifications Setup Guide

This guide will help you set up push notifications for your Larnis Insights mobile application using Firebase Cloud Messaging (FCM) and Capacitor.

## ✅ Already Implemented

Your application already has push notifications integrated with the following features:

- **Equipment Alert Push Notifications**: Critical equipment alerts (status='down' or severity='critical') automatically trigger push notifications
- **Local Notifications**: Uses @capacitor/local-notifications for immediate alerts
- **Toast Notifications**: In-app notifications using Sonner
- **Navigation Support**: Push notifications can navigate to equipment page
- **Firebase Integration**: Ready for Firebase Cloud Messaging

## Prerequisites

- Firebase project created at [Firebase Console](https://console.firebase.google.com/)
- Android Studio (for Android setup)
- Xcode (for iOS setup)
- Node.js and npm installed

## 1. Firebase Project Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "Larnis Insights")
4. Follow the setup steps

### 1.2 Add Android App
1. In Firebase console, click "Add app"
2. Select Android
3. Package name: `com.larnis.app` (from your capacitor.config.json)
4. Download `google-services.json`
5. Place it in `android/app/google-services.json` ✅ **Already done**

### 1.3 Add iOS App
1. In Firebase console, click "Add app"
2. Select iOS
3. Bundle ID: `com.larnis.app` (from your capacitor.config.json)
4. Download `GoogleService-Info.plist`
5. Place it in `ios/App/App/GoogleService-Info.plist`

## 2. Android Configuration

### 2.1 Update Android Build Files

**android/build.gradle**: ✅ **Already configured**
```gradle
buildscript {
    dependencies {
        // Add this line
        classpath 'com.google.gms:google-services:4.4.4'
    }
}
```

**android/app/build.gradle**: ✅ **Already configured**
```gradle
// Add to the bottom of the file
apply plugin: 'com.google.gms.google-services'
```

### 2.2 Add Firebase Dependencies

**android/app/build.gradle**: ✅ **Already added**
```gradle
dependencies {
    implementation 'com.google.firebase:firebase-messaging:23.1.2'
}
```

### 2.3 Update AndroidManifest.xml

**android/app/src/main/AndroidManifest.xml**: ✅ **Already configured**
```xml
<application>
    <!-- Firebase Cloud Messaging Service -->
    <service
        android:name="com.google.firebase.messaging.FirebaseMessagingService"
        android:exported="false">
        <intent-filter>
            <action android:name="com.google.firebase.MESSAGING_EVENT" />
        </intent-filter>
    </service>
</application>
```

### 2.4 Notification Icon ✅ **Already created**

Notification icon created at: `android/app/src/main/res/drawable/ic_stat_notification.xml`

## 3. iOS Configuration

### 3.1 Enable Push Notifications in Xcode
1. Open `ios/App/App.xcodeproj` in Xcode
2. Select your app target
3. Go to "Signing & Capabilities"
4. Click "+ Capability"
5. Add "Push Notifications"
6. Add "Background Modes" and check "Remote notifications"

### 3.2 Add Firebase SDK

**ios/App/Podfile**:
```ruby
target 'App' do
  capacitor_pods
  # Add your Pods here
  pod 'Firebase/Messaging'
end
```

Then run:
```bash
cd ios
pod install
```

### 3.3 Configure AppDelegate

**ios/App/App/AppDelegate.swift**:
```swift
import Firebase
import FirebaseMessaging

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

  var window: UIWindow?

  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // Override point for customization after application launch.
    
    // Configure Firebase
    FirebaseApp.configure()
    
    // Set up messaging delegate
    Messaging.messaging().delegate = self
    
    // Register for remote notifications
    if #available(iOS 10.0, *) {
      UNUserNotificationCenter.current().delegate = self
      let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
      UNUserNotificationCenter.current().requestAuthorization(
        options: authOptions,
        completionHandler: {_, _ in })
    } else {
      let settings: UIUserNotificationSettings =
      UIUserNotificationSettings(types: [.alert, .badge, .sound], categories: nil)
      application.registerUserNotificationSettings(settings)
    }
    
    application.registerForRemoteNotifications()
    
    return true
  }
}

// MARK: - MessagingDelegate
extension AppDelegate: MessagingDelegate {
  func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
    print("Firebase registration token: \(String(describing: fcmToken))")
    
    // Send token to your backend if needed
    if let token = fcmToken {
      // You can store this token or send it to your backend
    }
  }
}

// MARK: - UNUserNotificationCenterDelegate
@available(iOS 10, *)
extension AppDelegate: UNUserNotificationCenterDelegate {
  func userNotificationCenter(_ center: UNUserNotificationCenter,
                              willPresent notification: UNNotification,
                              withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
    let userInfo = notification.request.content.userInfo
    
    // Print full message
    print(userInfo)
    
    // Change this to your preferred presentation option
    completionHandler([[.alert, .sound]])
  }
  
  func userNotificationCenter(_ center: UNUserNotificationCenter,
                              didReceive response: UNNotificationResponse,
                              withCompletionHandler completionHandler: @escaping () -> Void) {
    let userInfo = response.notification.request.content.userInfo
    print(userInfo)
    
    completionHandler()
  }
}
```

## 4. Backend Integration

### 4.1 Create Push Notification Endpoint

Your backend needs an endpoint to register push tokens and send notifications:

```javascript
// Example Express.js endpoint
app.post('/api/notifications/register-push-token', async (req, res) => {
  const { token, platform } = req.body;
  
  try {
    // Store token in your database associated with the user
    await User.updateOne(
      { _id: req.user.id },
      { 
        $push: { 
          pushTokens: { 
            token, 
            platform, 
            createdAt: new Date() 
          } 
        } 
      }
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 4.2 Send Push Notifications

```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function sendPushNotification(userTokens, title, body, data = {}) {
  const message = {
    notification: {
      title,
      body,
    },
    data,
    tokens: userTokens,
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    console.log(`${response.successCount} messages were sent successfully`);
    return response;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}
```

## 5. Testing Push Notifications

### 5.1 Firebase Console Testing
1. Go to Firebase Console → Cloud Messaging
2. Click "Create your first campaign"
3. Select "Notification message"
4. Enter title and body
5. Target your app
6. Send test message

### 5.2 Backend Testing
Use your backend endpoint to send test notifications to specific devices.

## 6. Common Issues & Solutions

### Issue: "Push notification permission not granted"
- Ensure you're testing on a real device (not simulator for iOS)
- Check that permissions are properly requested
- For iOS, ensure APNs certificates are configured

### Issue: Token not registering
- Verify `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) are correctly placed
- Check Firebase project configuration
- Ensure internet connectivity

### Issue: Notifications not received on Android
- Check that the app is in background or closed
- Verify notification channels are created
- Check Android manifest configuration

### Issue: Notifications not received on iOS
- Ensure APNs certificates are valid
- Check that the device token is properly registered
- Verify background modes are enabled

## 7. Production Considerations

### Security
- Never expose Firebase server keys in client-side code
- Use Firebase Admin SDK on your backend only
- Validate all incoming requests

### Performance
- Batch notifications when sending to multiple users
- Implement proper error handling and retry logic
- Monitor notification delivery rates

### User Experience
- Respect user preferences and notification settings
- Provide clear value in notifications
- Allow users to disable notifications if desired

## 8. Next Steps

1. Complete Firebase project setup
2. Configure Android and iOS projects
3. Implement backend endpoints
4. Test with real devices
5. Set up monitoring and analytics

For more detailed information, refer to:
- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Capacitor Push Notifications Plugin](https://capacitorjs.com/docs/apis/push-notifications)
