package com.mauro.tracemenow;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.amazonaws.auth.CognitoCachingCredentialsProvider;
import com.amazonaws.mobileconnectors.iot.AWSIotMqttClientStatusCallback;
import com.amazonaws.mobileconnectors.iot.AWSIotMqttManager;
import com.amazonaws.mobileconnectors.iot.AWSIotMqttNewMessageCallback;
import com.amazonaws.mobileconnectors.iot.AWSIotMqttQos;
import com.amazonaws.regions.Regions;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

import static com.amazonaws.mobile.auth.core.internal.util.ThreadUtils.runOnUiThread;

public class AWSMqtt {
    private JSONObject message;

    private Activity activity;
    private Context context;

    private String clientId;
    private String customerEndpoint;
    private String cognitoPoolId;
    private static final Regions MY_REGION = Regions.US_EAST_1;

    protected AWSIotMqttManager mqttManager;
    private CognitoCachingCredentialsProvider credentialsProvider;

    private static final String LOG_TAG = "[IOT CORE]";

    private boolean flag = false;

    public AWSMqtt(Activity activity, Context context, String customerEndpoint, String cognitoPoolId) {
        this.activity = activity;
        this.context = context;

        this.customerEndpoint = customerEndpoint;
        this.cognitoPoolId = cognitoPoolId;

        SharedPreferences sharedPref = activity.getSharedPreferences("app", Context.MODE_PRIVATE);
        clientId = sharedPref.getString("uuid", null);

        credentialsProvider = new CognitoCachingCredentialsProvider(
                context,
                this.cognitoPoolId,
                MY_REGION
        );

        mqttManager = new AWSIotMqttManager(clientId, this.customerEndpoint);
    }

    public void connect() {
        mqttManager.connect(credentialsProvider, new AWSIotMqttClientStatusCallback() {
            @Override
            public void onStatusChanged(final AWSIotMqttClientStatus status, final Throwable throwable) {
                Log.d(LOG_TAG, "Status = " + String.valueOf(status));

                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        if (status == AWSIotMqttClientStatus.Connecting) {
                            Log.i(LOG_TAG, "Connecting...");
                        } else if (status == AWSIotMqttClientStatus.Connected) {
                            Log.i(LOG_TAG, "Connected");
                        } else if (status == AWSIotMqttClientStatus.Reconnecting) {
                            if (throwable != null) {
                                Log.e(LOG_TAG, "Connection error.", throwable);
                            }
                            Log.i(LOG_TAG, "Reconnecting");
                        } else if (status == AWSIotMqttClientStatus.ConnectionLost) {
                            if (throwable != null) {
                                Log.e(LOG_TAG, "Connection error.", throwable);
                                throwable.printStackTrace();
                            }
                            Log.i(LOG_TAG, "Disconnected");
                        } else {
                            Log.i(LOG_TAG, "Disconnected");
                        }
                    }
                });
            }
        });
    }

    public String getClientId() {
        return clientId.toUpperCase();
    }

    public void getNewDeviceNotification(AWSIotMqttNewMessageCallback callback) {
        await();
        mqttManager.subscribeToTopic("notify/new", AWSIotMqttQos.QOS0, callback);
    }

    public void getDeleteDeviceNotification(AWSIotMqttNewMessageCallback callback) {
        await();
        mqttManager.subscribeToTopic("notify/delete", AWSIotMqttQos.QOS0, callback);
    }

    public void getLocationNotification(AWSIotMqttNewMessageCallback callback) {
        await();
        String payload = "{\"uuid\": \""+clientId.toUpperCase()+"\"}";
        mqttManager.publishString(payload, "device/loaction", AWSIotMqttQos.QOS0);
        if(!flag)
            mqttManager.subscribeToTopic("notify/location/"+getClientId(), AWSIotMqttQos.QOS0, callback);
    }

    public void getPositionNotification(AWSIotMqttNewMessageCallback callback) {
        await();
        mqttManager.subscribeToTopic("notify/position/"+getClientId(), AWSIotMqttQos.QOS0, callback);
    }

    public void getChangeNotification(AWSIotMqttNewMessageCallback callback) {
        await();
        mqttManager.subscribeToTopic("notify/change/"+getClientId(), AWSIotMqttQos.QOS0, callback);
    }

    public void getCustomNotification(String topic, AWSIotMqttNewMessageCallback callback) {
        await();
        mqttManager.subscribeToTopic(topic, AWSIotMqttQos.QOS0, callback);
    }

    public void publishTo(String topic, String payload) {
        mqttManager.publishString(payload, topic, AWSIotMqttQos.QOS0);
    }

    public void removeNewDeviceNotification() {
        mqttManager.unsubscribeTopic("notify/new");
    }

    public void removeDeleteDevicesNotification() {
        mqttManager.unsubscribeTopic("notify/delete");
    }

    public void removeLocationNotification() {
        mqttManager.unsubscribeTopic("notify/location/"+getClientId());
    }

    public void removePositionNotification() {
        mqttManager.unsubscribeTopic("notify/position/"+getClientId());
    }

    public void removeChangeNotification() {
        mqttManager.unsubscribeTopic("notify/change/"+getClientId());
    }

    public void removeCustomNotification(String topic) {
        mqttManager.unsubscribeTopic(topic);
    }

    private void await() {
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
