package com.mauro.tracemenow;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import org.eclipse.paho.android.service.MqttAndroidClient;
import org.eclipse.paho.client.mqttv3.DisconnectedBufferOptions;
import org.eclipse.paho.client.mqttv3.IMqttActionListener;
import org.eclipse.paho.client.mqttv3.IMqttToken;
import org.eclipse.paho.client.mqttv3.MqttCallbackExtended;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;

public class OnPremiseMqtt {
    private MqttAndroidClient mqttAndroidClient;
    private String serverUri, serverPort, clientId;
    private MqttConnectOptions mqttConnectOptions;

    private static final String LOG_TAG = "[MQTT]";

    private boolean flag = false;

    public OnPremiseMqtt(Activity activity, Context context, String serverUri, String serverPort, MqttCallbackExtended callback) {
        this.serverUri = serverUri;
        this.serverPort = serverPort;
        SharedPreferences sharedPref = activity.getPreferences(Context.MODE_PRIVATE);
        this.clientId = sharedPref.getString("uuid", null);

        mqttAndroidClient = new MqttAndroidClient(context, serverUri, clientId);
        mqttAndroidClient.setCallback(callback);

        mqttConnectOptions = new MqttConnectOptions();
        mqttConnectOptions.setAutomaticReconnect(true);
        mqttConnectOptions.setCleanSession(false);
    }

    public void connect() {
        try {
            //addToHistory("Connecting to " + serverUri);
            mqttAndroidClient.connect(mqttConnectOptions, null, new IMqttActionListener() {
                @Override
                public void onSuccess(IMqttToken asyncActionToken) {
                    DisconnectedBufferOptions disconnectedBufferOptions = new DisconnectedBufferOptions();
                    disconnectedBufferOptions.setBufferEnabled(true);
                    disconnectedBufferOptions.setBufferSize(100);
                    disconnectedBufferOptions.setPersistBuffer(false);
                    disconnectedBufferOptions.setDeleteOldestMessages(false);
                    mqttAndroidClient.setBufferOpts(disconnectedBufferOptions);
                    // subscribeToTopic();
                }

                @Override
                public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                    Log.e(LOG_TAG, "Not able to connect to the broker");
                }
            });
        } catch (MqttException ex){
            ex.printStackTrace();
        }
    }

    public String getClientId() {
        return clientId.toUpperCase();
    }

    public void getNewDeviceNotification(){
        try {
            mqttAndroidClient.subscribe("notify/new", 0, null, new IMqttActionListener() {
                @Override
                public void onSuccess(IMqttToken asyncActionToken) {
                    Log.i(LOG_TAG, "Subscribed!");
                }

                @Override
                public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                    Log.i(LOG_TAG, "Failed to subscribe");
                }
            });

        } catch (MqttException ex){
            System.err.println("Exception whilst subscribing");
            ex.printStackTrace();
        }
    }

    public void getDeleteDeviceNotification(){
        try {
            mqttAndroidClient.subscribe("notify/delete", 0, null, new IMqttActionListener() {
                @Override
                public void onSuccess(IMqttToken asyncActionToken) {
                    Log.i(LOG_TAG, "Subscribed!");
                }

                @Override
                public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                    Log.i(LOG_TAG, "Failed to subscribe");
                }
            });

        } catch (MqttException ex) {
            System.err.println("Exception whilst subscribing");
            ex.printStackTrace();
        }
    }

    public void getLocationNotification(){
        String payload = "{\"uuid\": \""+clientId.toUpperCase()+"\"}";
        try {
            MqttMessage message = new MqttMessage();
            message.setPayload(payload.getBytes());
            mqttAndroidClient.publish("device/location", message);
        } catch (MqttException e) {
            System.err.println("Error Publishing: " + e.getMessage());
            e.printStackTrace();
        }
        if(!flag) {
            try {
                mqttAndroidClient.subscribe("notify/location/"+clientId.toUpperCase(), 0, null, new IMqttActionListener() {
                    @Override
                    public void onSuccess(IMqttToken asyncActionToken) {
                        Log.i(LOG_TAG, "Subscribed!");
                    }

                    @Override
                    public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                        Log.i(LOG_TAG, "Failed to subscribe");
                    }
                });
                flag = true;
            } catch (MqttException ex) {
                System.err.println("Exception whilst subscribing");
                ex.printStackTrace();
            }
        }
    }

    public void getPositionNotification(){
        try {
            mqttAndroidClient.subscribe("notify/position/"+clientId.toUpperCase(), 0, null, new IMqttActionListener() {
                @Override
                public void onSuccess(IMqttToken asyncActionToken) {
                    Log.i(LOG_TAG, "Subscribed!");
                }

                @Override
                public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                    Log.i(LOG_TAG, "Failed to subscribe");
                }
            });

        } catch (MqttException ex) {
            System.err.println("Exception whilst subscribing");
            ex.printStackTrace();
        }
    }

    public void getCustomNotification(String topic) {
        try {
            mqttAndroidClient.subscribe(topic, 0, null, new IMqttActionListener() {
                @Override
                public void onSuccess(IMqttToken asyncActionToken) {
                    Log.i(LOG_TAG, "Subscribed!");
                }

                @Override
                public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                    Log.i(LOG_TAG, "Failed to subscribe");
                }
            });

        } catch (MqttException ex) {
            System.err.println("Exception whilst subscribing");
            ex.printStackTrace();
        }
    }

    public void publishTo(String topic, String payload) {
        try {
            MqttMessage message = new MqttMessage();
            message.setPayload(payload.getBytes());
            mqttAndroidClient.publish(topic, message);
        } catch (MqttException e) {
            System.err.println("Error Publishing: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void removeNewDeviceNotification() {
        try {
            mqttAndroidClient.unsubscribe("notify/new");
        } catch (MqttException ex) {
            System.err.println("Exception whilst unsubscribing");
            ex.printStackTrace();
        }
    }

    public void removeDeleteDevicesNotification() {
        try {
            mqttAndroidClient.unsubscribe("notify/delete");
        } catch (MqttException ex) {
            System.err.println("Exception whilst unsubscribing");
            ex.printStackTrace();
        }
    }

    public void removeGetLocation() {
        try {
            mqttAndroidClient.unsubscribe("notify/location/"+clientId.toUpperCase());
        } catch (MqttException ex) {
            System.err.println("Exception whilst unsubscribing");
            ex.printStackTrace();
        }
    }

    public void removeGetPosition() {
        try {
            mqttAndroidClient.unsubscribe("notify/position/"+clientId.toUpperCase());
        } catch (MqttException ex) {
            System.err.println("Exception whilst unsubscribing");
            ex.printStackTrace();
        }
    }

    public void removeCustomNotification(String topic) {
        try {
            mqttAndroidClient.unsubscribe(topic);
        } catch (MqttException ex) {
            System.err.println("Exception whilst unsubscribing");
            ex.printStackTrace();
        }
    }
}
