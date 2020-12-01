## Android Library

The Android Library helps you in building your application, which will be used as the target for people tracking and localization, and it will be the end client as well.

# Table of Contents
- [Configuration](#configuration)
- [BleSetup](#blesetup)
- [OnPremiseMqtt](#onpremisemqtt)
- [AwsMqtt](#awsmqtt)

## Configuration

In order to use this library, create a new Android Studio project and add the following in your root `build.gradle` at the end of repositories

```gradle
allprojects {
    repositories {
        ...
        maven { url 'https://jitpack.io' }
    }
}
```

and add the dependency

```gradle
dependencies {
        implementation 'com.github.spike322:tracemenow-android-library:Tag'
}
```

Now you're ready to go! 

This library helps you to configure BLE transmission and allows you to communicate with your serverless or serverful back-end.

It offers three classes: `BleSetup`, `OnPremiseMqtt`, and `AWSMqtt`.

*If you want to have a more clear idea on how to use this library, please have a look to `src/client/android/app/src/main/java/com/mauro/tracemenow_client/MainActivity.java`, there is an example on how to use everything.*

## BleSetup

The `BleSetup` allows you to check if bluetooth is enabled and if your device supports BLE technology. All you have to do is to instantiate a new object of this class, and you can do it in two different ways:

```java
BleSetup bleSetup = new BleSetup(activity, context, 0, 0);
```
or
```java
BleSetup bleSetup = new BleSetup(activity, context);
```
The first one allows you to specify the `minor` and `major` values, in case you need some specific ones. In the second case they will be generated at a random.

Then you can call

```java
bleSetup.startTransmitting();
```
to initiate the transmittion. Your smartphone will continuously send BLE packets in broadcast.

When you start the transmission, it will check if your bluetooth is enabled - and in that case it will ask you to activate it - and if your device supports BLE technology. If so, it will return a `true` value, `false` otherwise.

In order to stop the transmission, you can use

```java
bleSetup.stopTransmitting();
```
## OnPremiseMqtt

The `OnPremiseMqtt` allows you to receive notifications from the system, when using an on-premise back-end, and to define a behaviour for each notification, as well as remove reception of notifications.

**NOTE: if you use OnPremiseMqtt, you won't use AWSMqtt and vice versa.**

*If you want to know more about the notification system, please take a look to [Notification System](#notification-system).*

Here, first thing you have to do is to define a callback, which mainly defines the behaviour when a message arrives

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
                if(topic.equals("notify/location/"+mqttClient.getClientId())) {
                    Log.i(LOG_TAG, message.toString());
                }
                if(topic.equals("notify/position/"+mqttClient.getClientId())) {
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

In the `messageArrived()` method you can check from which topic the message arrives and define a specific behaviour.

Now you can instantiate your mqtt client

```java
OnPremiseMqtt mqttClient = new OnPremiseMqtt(activity, context, ipAddress, mosquittoPort, callback);
```

specifying the activity, context, ip address, port, and the callback defined previously. For example, if you are using it in your main activity, you could just use `this` instead of activity and context.

Once this is done, you're able to connect to the broker

```java
mqttClient.connect();
```

Now that you are connected, you might want to subscribe to some (or even all) of the [default events](#notification-system) in order to receive notifications, or you might want to get some custom notification.

```java
mqttClient.getNewDeviceNotification();
```

By calling this method, you will subscribe to the *'notify/new'* topic and you will receive a message every time a new device comes in.
You can specify the behaviour when this message comes in in the `messageArrived()` method specified before, which will run in a separate thread.

```java
mqttClient.getDeleteDeviceNotification();
```

By calling this method, you will subscribe to the *'notify/delete'* topic and you will receive a message every time a device leaves the system.
You can specify the behaviour when this message comes in in the `messageArrived()` method specified before, which will run in a separate thread.

```java
mqttClient.getLocationNotification();
```

Each time you will call this method, you will receive your current location once.
You can specify the behaviour when this message comes in in the `messageArrived()` method specified before, which will run in a separate thread.

```java
mqttClient.getPositionNotification();
```

By calling this method, you will receive your updated current location continuously until you unsubscribe from it.
You can specify the behaviour when this message comes in in the `messageArrived()` method specified before, which will run in a separate thread.

```java
mqttClient.getChangeNotification();
```

By calling this method, you will receive a notification everytime your device changes *room/raspberry*.
You can specify the behaviour when this message comes in in the `messageArrived()` method specified before, which will run in a separate thread.

```java
mqttClient.getCustomNotification("custom/topic");
```

By calling this method, you will subscribe to your custom topic, specified as a parameter, and you will receive a message every time something is published on it.
You can specify the behaviour when this message comes in in the `messageArrived()` method specified before, which will run in a separate thread.

At some point, you might don't want to receive some notification anymore, so you can unsubscribe to topics.

```java
mqttClient.removeNewDeviceNotification();
```

By calling this method, you will unsubscribe from the *'notify/new'* topic and you won't receive such a notification anymore.

```java
mqttClient.removeDeleteDevicesNotification();
```

By calling this method, you will unsubscribe from the *'notify/delete'* topic and you won't receive such a notification anymore.

```java
mqttClient.removeLocationNotification();
```

By calling this method, you will unsubscribe from the *'notify/location/uuid'* topic and you won't receive such a notification anymore.

```java
mqttClient.removePositionNotification();
```

By calling this method, you will unsubscribe from the *'notify/position/uuid'* topic and you won't receive such a notification anymore.

```java
mqttClient.removeChangeNotification();
```

By calling this method, you will unsubscribe from the 'notify/change/uuid' topic and you won't receive such a notification anymore.

```java
mqttClient.removeCustomNotification("custom/topic");
```

By calling this method, you will unsubscribe from the topic specified as a parameter.

## AwsMqtt

The `AwsMqtt` allows you to receive notifications from the system, when using a serverless back-end running on AWS, and to define a behaviour for each notification, as well as remove reception of notifications.

**NOTE: if you use AWSMqtt, you won't use OnPremiseMqtt and vice versa.**

*If you want to know more about the notification system, please take a look to [Notification System](#notification-system).*

First thing you have to do is to instantiate an object of the `AwsMqtt` class

```java
AWSMqtt awsClient = new AWSMqtt(activity, context, "*****.amazonaws.com", "us-east-1:*****");
```

specifying the activity, context, your customer endpoint, and the cognito pool id. For example, if you are using it in your main activity, you could just use `this` instead of activity and context.

Once this is done, you're able to connect to the IoT Core platform

```java
awsClient.connect();
```

Now that you are connected, you might want to subscribe to some (or even all) of the [default events](#notification-system) in order to receive notifications, or you might want to get some custom notification.

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
By calling this method, you will subscribe to the *'notify/new'* topic and you will receive a message every time a new device comes in.
Everytime you subscribe to a new topic, you have to define a new behaviour in a callback.
You can specify the behaviour when this message arrives in the `run()` method specified before, which will run in a separate thread.

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

By calling this method, you will subscribe to the *'notify/delete'* topic and you will receive a message every time a device leaves the system.
Everytime you subscribe to a new topic, you have to define a new behaviour in a callback.
You can specify the behaviour when this message arrives in the `run()` method specified before, which will run in a separate thread.

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

Each time you will call this method, you will receive your current location once.
Everytime you subscribe to a new topic, you have to define a new behaviour in a callback.
You can specify the behaviour when this message arrives in the `run()` method specified before, which will run in a separate thread.

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
By calling this method, you will receive your updated current location continuously until you unsubscribe from it. Everytime you subscribe to a new topic, you have to define a new behaviour in a callback.
You can specify the behaviour when this message arrives in the `run()` method specified before, which will run in a separate thread.

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

By calling this method, you will receive a notification everytime your device changes *room/raspberry*. Everytime you subscribe to a new topic, you have to define a new behaviour in a callback.
You can specify the behaviour when this message arrives in the `run()` method specified before, which will run in a separate thread.

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

By calling this method, you will subscribe to your custom topic, specified as a parameter, and you will receive a message every time something is published on it. Everytime you subscribe to a new topic, you have to define a new behaviour in a callback.
You can specify the behaviour when this message arrives in the `run()` method specified before, which will run in a separate thread.

At some point, you might don't want to receive some notification anymore, so you can unsubscribe to topics.

```java
awsClient.removeNewDeviceNotification();
```

By calling this method, you will unsubscribe from the *'notify/new'* topic and you won't receive such a notification anymore.

```java
awsClient.removeDeleteDevicesNotification();
```

By calling this method, you will unsubscribe from the *'notify/delete'* topic and you won't receive such a notification anymore.

```java
awsClient.removeLocationNotification();
```

By calling this method, you will unsubscribe from the *'notify/location/uuid'* topic and you won't receive such a notification anymore.

```java
awsClient.removePositionNotification();
```

By calling this method, you will unsubscribe from the *'notify/position/uuid'* topic and you won't receive such a notification anymore.

```java
awsClient.removeChangeNotification();
```

By calling this method, you will unsubscribe from the 'notify/change/uuid' topic and you won't receive such a notification anymore.

```java
awsClient.removeCustomNotification("custom/topic");
```

By calling this method, you will unsubscribe from the topic specified as a parameter.