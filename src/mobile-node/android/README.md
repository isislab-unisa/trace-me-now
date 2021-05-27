## Android Library

TraceMeNow provides a library to implement a mobile application that will turn any BLE device into a BLE beacon, i.e., a node that continuously sends BLE packets in broadcast. 

# Table of Contents
- [Installation](#installation)
- [BleSetup](#blesetup)
- [OnPremiseMqtt](#onpremisemqtt)
- [AwsMqtt](#awsmqtt)

## Installation

To use the library, create a new Android Studio project and add the following in the root folder `build.gradle` file at the end of repositories:

```gradle
allprojects {
    repositories {
        ...
        maven { url 'https://jitpack.io' }
    }
}
```

Then add the following dependencies:

```gradle
dependencies {
    ...
    implementation 'com.github.spike322:trace-me-now-android-client:0.0.5'
    implementation 'org.eclipse.paho:org.eclipse.paho.client.mqttv3:1.1.0'
    implementation 'org.eclipse.paho:org.eclipse.paho.android.service:1.1.1'
}
```

Finally, add to the `AndroidManifest.xml` file:

```xml
    <uses-feature
        android:name="android.hardware.bluetooth_le"
        android:required="true" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN"/>
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
    <uses-permission android:name="android.permission.WAKE_LOCK"/>
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/style"
        android:usesCleartextTraffic="true">
        <service android:name="org.eclipse.paho.android.service.MqttService">
        </service>
        ...
    <application/>
```


This library allow the configuration of the BLE transmission and the communication with the application module.

*An example on how to use the library is available in `src/client/android/app/src/main/java/com/tracemenow_client/MainActivity.java`.*

## BleSetup

The `BleSetup` allows checking if bluetooth is enabled and if the device supports BLE technology. It includess two ways to instantiate a new object.
The first one allows to specify the `minor` and `major` values while the second generates them randomly.

```java
BleSetup bleSetup = new BleSetup(activity, context, 0, 0);
```

```java
BleSetup bleSetup = new BleSetup(activity, context);
```

The following method start the transmission. The smartphone will continously send BLE packets in broadcast. The methods check if bluetooth is enabled, asking to activate it if not. It also check if the device supports BLE. If so, it returns `TRUE`, `FALSE` otherwise.

```java
bleSetup.startTransmitting();
```

The following method stop the transmission.

```java
bleSetup.stopTransmitting();
```

## OnPremiseMqtt

The `OnPremiseMqtt` allows to receive notifications from the system when using an on-premise back-end. It includes methods to define a behaviour for each notification, as well as disable reception of notifications.

*More informations about the notification system are avaible in [on-premise notification system](https://github.com/isislab-unisa/trace-me-now/tree/main/src/on-premise#notification-system) or in [AWS notification system](https://github.com/isislab-unisa/trace-me-now/tree/main/src/cloud/aws#notification-system).*

The first thing to do is defining a callback that specifies the behaviour when a message arrives.

```java
MqttCallbackExtended callback = new MqttCallbackExtended() {
            @Override
            public void connectComplete(boolean reconnect, String serverURI) {
                if (reconnect) {
                    // re-subscribe to topics
                } else {

                }
            }

            @Override
            public void connectionLost(Throwable cause) {

            }

            @Override
            public void messageArrived(String topic, MqttMessage message) throws Exception {
                if(topic.equals("notify/new")) {
                    Log.i(LOG_TAG, message.toString());
                }
                if(topic.equals("notify/delete")) {
                    Log.i(LOG_TAG, message.toString());
                }
                if(topic.equals("notify/location/"+bleSetup.getClientId())) {
                    Log.i(LOG_TAG, message.toString());
                }
                if(topic.equals("notify/position/"+bleSetup.getClientId())) {
                    Log.i(LOG_TAG, message.toString());
                }
                if(topic.equals("custom/topic")) {
                    Log.i(LOG_TAG, message.toString());
                }
            }

            @Override
            public void deliveryComplete(IMqttDeliveryToken token) {

            }
        };
```

*UUID is always available using `bleSetup.getClientId()`, or `mqttClient.getClientId()`, or `awsClient.getClientId()`*.

The `messageArrived()` method allows to check from which topic the message arrives and define a specific behaviour.

MQTT Client creation needs the activity, context, ip address, port, and the callback defined previously, as showed below:

```java
OnPremiseMqtt mqttClient = new OnPremiseMqtt(activity, context, ipAddress, mosquittoPort, callback);
```

The following command allows the connection with the broker:

```java
mqttClient.connect();
```

Once connected, the device can subscribe to [default events](#notification-system) to receive notifications using the following methods.

Method to subscribe to the *notify/new* topic to receive a message every time a new device is detected. The behavior in response to the event can be defined in the `messageArrived()` method specified before.

```java
mqttClient.getNewDeviceNotification();
```

Method to subscribe to the *notify/delete* topic to receive a message everytime a device leaves the system. The behavior in response to the event can be defined in the `messageArrived()` method specified before.

```java
mqttClient.getDeleteDeviceNotification();
```

Method to receive the current device location. The behavior in response to the event can be defined in the `messageArrived()` method specified before.

```java
mqttClient.getLocationNotification();
```

Method to subscribe to the *notify/position/uuid* topic to receive a message every time the device moves. The current location of the device is updated continously. The behavior in response to the event can be defined in the `messageArrived()` method specified before.

```java
mqttClient.getPositionNotification();
```

Method to subscribe to the *notify/change/uuid* to receive a notification everytime the device changes *room* or *trackingNodeId*. The behavior in response to the event can be defined in the `messageArrived()` method specified before.

```java
mqttClient.getChangeNotification();
```

Method to subscribe to a custom topic specified as the parameter. Every message published on it will be received. The behavior in response to the event can be defined in the `messageArrived()` method specified before.

```java
mqttClient.getCustomNotification("custom/topic");
```

Method to unsubscribe from the *notify/new* topic.

```java
mqttClient.removeNewDeviceNotification();
```

Method to unsubscribe from the *notify/delete* topic.

```java
mqttClient.removeDeleteDevicesNotification();
```

Method to unsubscribe from the *notify/location/uuid* topic.

```java
mqttClient.removeLocationNotification();
```

Method to unsubscribe from the *notify/position/uuid* topic.


```java
mqttClient.removePositionNotification();
```

Method to unsubscribe from the *notify/change/uuid* topic.


```java
mqttClient.removeChangeNotification();
```

Method to unsubribe from the custom topic specified as the parameter.

```java
mqttClient.removeCustomNotification("custom/topic");
```

Method to publish a message to a specific topic.

```java
mqttClient.publishTo("custom/topic", "message");
```

## AwsMqtt

The `AwsMqtt` allows to receive notifications from the system, when using a cloud back-end running on AWS, and to define a behaviour for each notification, as well as disable reception of notifications.

*More informations about the notification system are avaible in [on-premise notification system](https://github.com/isislab-unisa/trace-me-now/tree/main/src/on-premise#notification-system) or in [AWS notification system](https://github.com/isislab-unisa/trace-me-now/tree/main/src/cloud/aws#notification-system).*

The first thing to do is to instantiate an object of the `AwsMqtt` class specifying the activity, context, your customer endpoint, and the cognito pool id. 

```java
AWSMqtt awsClient = new AWSMqtt(activity, context, "*****.amazonaws.com", "us-east-1:*****");
```

The following method allows to connect to the IoT Core platform:

```java
awsClient.connect();
```

*UUID is always available using `bleSetup.getClientId()`, or `mqttClient.getClientId()`, or `awsClient.getClientId()`*.

Once connected, the device can subscribe to [default events](#notification-system) to receive notifications using the following methods.

Method to subscribe to the *notify/new* topic to receive a message every time a new device is detected. The subscription to a new topic requires to specify of a new behavior in a callback. This can be done in the `run()` method that is executed when a new message is received.


```java
awsClient.getNewDeviceNotification(new AWSIotMqttNewMessageCallback() {
            @Override
            public void onMessageArrived(String topic, byte[] data) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            String message = new String(data, "UTF-8");
                            Log.d(LOG_TAG, "Message arrived:");
                            Log.d(LOG_TAG, "   Topic: " + topic);
                            Log.d(LOG_TAG, " Message: " + message);

                            JSONObject jsonObject = null;
                            try {
                                jsonObject = new JSONObject(message);
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }

                            JSONObject device = jsonObject.getJSONObject("device");
                        } catch (UnsupportedEncodingException | JSONException e) {
                            Log.e(LOG_TAG, "Message encoding error.", e);
                        }
                    }
                });
            }
        });
```

Method to subscribe to the *notify/delete* topic to receive a message everytime a device leaves the system. The subscription to a new topic requires to specify of a new behavior in a callback. This can be done in the `run()` method that is executed when a new message is received.


```java
awsClient.getDeleteDeviceNotification(new AWSIotMqttNewMessageCallback() {
            @Override
            public void onMessageArrived(String topic, byte[] data) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            String message = new String(data, "UTF-8");
                            Log.d(LOG_TAG, "Message arrived:");
                            Log.d(LOG_TAG, "   Topic: " + topic);
                            Log.d(LOG_TAG, " Message: " + message);

                            JSONObject jsonObject = null;
                            try {
                                jsonObject = new JSONObject(message);
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }

                            JSONObject device = jsonObject.getJSONObject("device");
                        } catch (UnsupportedEncodingException | JSONException e) {
                            Log.e(LOG_TAG, "Message encoding error.", e);
                        }
                    }
                });
            }
        });
```

Method to receive the current device location. The subscription to a new topic requires to specify of a new behavior in a callback. This can be done in the `run()` method that is executed when a new message is received.

```java
awsClient.getLocationNotification(new AWSIotMqttNewMessageCallback() {
              @Override
              public void onMessageArrived(String topic, byte[] data) {
                  runOnUiThread(new Runnable() {
                      @Override
                      public void run() {
                          try {
                              String message = new String(data, "UTF-8");
                              Log.d(LOG_TAG, "Message arrived:");
                              Log.d(LOG_TAG, "   Topic: " + topic);
                              Log.d(LOG_TAG, " Message: " + message);

                              JSONObject jsonObject = null;
                              try {
                                  jsonObject = new JSONObject(message);
                              } catch (JSONException e) {
                                  e.printStackTrace();
                              }

                              JSONObject device = jsonObject.getJSONObject("device");
                          } catch (UnsupportedEncodingException | JSONException e) {
                              Log.e(LOG_TAG, "Message encoding error.", e);
                          }
                      }
                  });
              }
        });
```

Method to subscribe to the *notify/position/uuid* topic to receive a message every time the device moves. The current location of the device is updated continously. The subscription to a new topic requires to specify of a new behavior in a callback. This can be done in the `run()` method that is executed when a new message is received.

```java
awsClient.getPositionNotification(new AWSIotMqttNewMessageCallback() {
            @Override
            public void onMessageArrived(String topic, byte[] data) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            String message = new String(data, "UTF-8");
                            Log.d(LOG_TAG, "Message arrived:");
                            Log.d(LOG_TAG, "   Topic: " + topic);
                            Log.d(LOG_TAG, " Message: " + message);

                            JSONObject jsonObject = null;
                            try {
                                jsonObject = new JSONObject(message);
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }

                            JSONObject device = jsonObject.getJSONObject("device");
                        } catch (UnsupportedEncodingException | JSONException e) {
                            Log.e(LOG_TAG, "Message encoding error.", e);
                        }
                    }
                });
            }
        });
```

Method to subscribe to the *notify/change/uuid* to receive a notification everytime the device changes *room* or *trackingNodeId*. The subscription to a new topic requires to specify of a new behavior in a callback. This can be done in the `run()` method that is executed when a new message is received.


```java
awsClient.getChangeNotification(new AWSIotMqttNewMessageCallback() {
            @Override
            public void onMessageArrived(String topic, byte[] data) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            String message = new String(data, "UTF-8");
                            Log.d(LOG_TAG, "Message arrived:");
                            Log.d(LOG_TAG, "   Topic: " + topic);
                            Log.d(LOG_TAG, " Message: " + message);

                            JSONObject jsonObject = null;
                            try {
                                jsonObject = new JSONObject(message);
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }

                            JSONObject device = jsonObject.getJSONObject("device");
                        } catch (UnsupportedEncodingException | JSONException e) {
                            Log.e(LOG_TAG, "Message encoding error.", e);
                        }
                    }
                });
            }
        });
```

Method to subscribe to a custom topic specified as the parameter. Every message published on it will be received. The subscription to a new topic requires to specify of a new behavior in a callback. This can be done in the `run()` method that is executed when a new message is received.

```java
awsClient.getCustomNotification("custom/topic", new AWSIotMqttNewMessageCallback() {
            @Override
            public void onMessageArrived(String topic, byte[] data) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            String message = new String(data, "UTF-8");
                            Log.d(LOG_TAG, "Message arrived:");
                            Log.d(LOG_TAG, "   Topic: " + topic);
                            Log.d(LOG_TAG, " Message: " + message);

                            JSONObject jsonObject = null;
                            try {
                                jsonObject = new JSONObject(message);
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }

                            JSONObject value = jsonObject.getJSONObject("value");
                        } catch (UnsupportedEncodingException | JSONException e) {
                            Log.e(LOG_TAG, "Message encoding error.", e);
                        }
                    }
                });
            }
        });
```


Method to unsubscribe from the *notify/new* topic.

```java
awsClient.removeNewDeviceNotification();
```

Method to unsubscribe from the *notify/delete* topic.

```java
awsClient.removeDeleteDevicesNotification();
```

Method to unsubscribe from the *notify/location/uuid* topic.

```java
awsClient.removeLocationNotification();
```

Method to unsubscribe from the *notify/position/uuid* topic.

```java
awsClient.removePositionNotification();
```

Method to unsubscribe from the *notify/change/uuid* topic.

```java
awsClient.removeChangeNotification();
```

Method to unsubribe from the custom topic specified as the parameter.

```java
awsClient.removeCustomNotification("custom/topic");
```

Method to publish a message to a specific topic.

```java
awsClient.publishTo("custom/topic", "message");
```
