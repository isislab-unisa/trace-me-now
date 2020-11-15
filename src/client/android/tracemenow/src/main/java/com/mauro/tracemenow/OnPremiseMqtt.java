package com.mauro.tracemenow;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.util.Log;

import org.eclipse.paho.android.service.MqttAndroidClient;
import org.eclipse.paho.client.mqttv3.DisconnectedBufferOptions;
import org.eclipse.paho.client.mqttv3.IMqttActionListener;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.IMqttToken;
import org.eclipse.paho.client.mqttv3.MqttCallbackExtended;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;

public class OnPremiseMqtt {
    protected MqttAndroidClient mqttAndroidClient;
    private String serverUri, serverPort, clientId;
    private MqttConnectOptions mqttConnectOptions;

    private Activity activity;
    private Context context;

    private static final String LOG_TAG = "[MQTT]";

    protected boolean flag = false;

    public OnPremiseMqtt(Activity activity, Context context, String serverUri, String serverPort, MqttCallbackExtended callback) {
        this.serverUri = serverUri;
        this.serverPort = serverPort;
        this.activity = activity;
        this.context = context;
        SharedPreferences sharedPref = this.activity.getPreferences(Context.MODE_PRIVATE);
        this.clientId = sharedPref.getString("uuid", null);

        String uri = "tcp://"+this.serverUri+":"+this.serverPort;

        MemoryPersistence mPer = new MemoryPersistence();

        mqttAndroidClient = new MqttAndroidClient(this.context, uri, clientId, mPer);
        mqttAndroidClient.setCallback(callback);

        mqttConnectOptions = new MqttConnectOptions();
        mqttConnectOptions.setAutomaticReconnect(true);
        mqttConnectOptions.setCleanSession(false);
    }

    public void connect() {
        try {
            //addToHistory("Connecting to " + serverUri);
            mqttAndroidClient.connect(mqttConnectOptions, context, new IMqttActionListener() {
                @Override
                public void onSuccess(IMqttToken asyncActionToken) {
                    DisconnectedBufferOptions disconnectedBufferOptions = new DisconnectedBufferOptions();
                    disconnectedBufferOptions.setBufferEnabled(true);
                    disconnectedBufferOptions.setBufferSize(100);
                    disconnectedBufferOptions.setPersistBuffer(false);
                    disconnectedBufferOptions.setDeleteOldestMessages(false);
                    mqttAndroidClient.setBufferOpts(disconnectedBufferOptions);
                    Log.i(LOG_TAG, "Connected to the broker");
                }

                @Override
                public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                    Log.e(LOG_TAG, "Not able to connect to the broker");
                }
            });
        } catch (MqttException ex) {
            ex.printStackTrace();
        }
    }

    public String getClientId() {
        return clientId.toUpperCase();
    }

    public void getNewDeviceNotification() {
        new Subscribe().execute("notify/new");
    }

    public void getDeleteDeviceNotification(){
        new Subscribe().execute("notify/delete");
    }

    public void getLocationNotification(){
        String payload = "{\"uuid\": \""+getClientId()+"\"}";
        String[] params = {"notify/location/"+getClientId(), payload, "device/location"};
        new Subscribe().execute(params);
    }

    public void getPositionNotification(){
        new Subscribe().execute("notify/position/"+getClientId());
    }

    public void getChangeNotification(){
        new Subscribe().execute("notify/change/"+getClientId());
    }

    public void getCustomNotification(String topic) {
        new Subscribe().execute(topic);
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

    public void removeLocationNotification() {
        try {
            mqttAndroidClient.unsubscribe("notify/location/"+getClientId());
        } catch (MqttException ex) {
            System.err.println("Exception whilst unsubscribing");
            ex.printStackTrace();
        }
    }

    public void removePositionNotification() {
        try {
            mqttAndroidClient.unsubscribe("notify/position/"+getClientId());
        } catch (MqttException ex) {
            System.err.println("Exception whilst unsubscribing");
            ex.printStackTrace();
        }
    }

    public void removeChangeNotification() {
        try {
            mqttAndroidClient.unsubscribe("notify/change/"+getClientId());
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

    private class Subscribe extends AsyncTask<String, Void, Void> {

        @Override
        protected Void doInBackground(String... params) {
            while(!mqttAndroidClient.isConnected());
            if(params.length == 1) {
                try {
                    mqttAndroidClient.subscribe(params[0], 0);
                    Log.i(LOG_TAG, "Subscribed to " + params[0] + "!");
                } catch (MqttException ex) {
                    System.err.println("Exception whilst subscribing");
                    ex.printStackTrace();
                }
            } else {
                try {
                    MqttMessage message = new MqttMessage();
                    message.setPayload(params[1].getBytes());
                    mqttAndroidClient.publish(params[2], message);
                } catch (MqttException e) {
                    System.err.println("Error Publishing: " + e.getMessage());
                    e.printStackTrace();
                }
                try {
                    mqttAndroidClient.subscribe(params[0], 0);
                    Log.i(LOG_TAG, "Subscribed to " + params[0] + "!");
                } catch (MqttException ex) {
                    System.err.println("Exception whilst subscribing");
                    ex.printStackTrace();
                }
            }
            return null;
        }
    }
}
