package com.mauro.tracemenow_client;

import android.os.Bundle;

import com.amazonaws.mobileconnectors.iot.AWSIotMqttNewMessageCallback;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.snackbar.Snackbar;
import com.mauro.tracemenow.AWSMqtt;
import com.mauro.tracemenow.BleSetup;
import com.mauro.tracemenow.OnPremiseMqtt;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import android.util.Log;
import android.view.View;

import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallbackExtended;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;

import org.eclipse.paho.android.service.MqttAndroidClient;
import org.eclipse.paho.client.mqttv3.MqttCallbackExtended;

import static com.amazonaws.mobile.auth.core.internal.util.ThreadUtils.runOnUiThread;

public class MainActivity extends AppCompatActivity {

    private static final String LOG_TAG = "[IOT CORE]";

    private OnPremiseMqtt mqttClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        FloatingActionButton fab = findViewById(R.id.fab);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Snackbar.make(view, "Replace with your own action", Snackbar.LENGTH_LONG)
                        .setAction("Action", null).show();
            }
        });

        BleSetup ble = new BleSetup(this, this);
        ble.startTransmitting();

        /*AWSMqtt mqttClient = new AWSMqtt(this, this, "a26sbz9d6nds4r-ats.iot.us-east-1.amazonaws.com", "us-east-1:fb46622a-bcf0-4b7b-92f9-3161f47af674");
        mqttClient.connect();

        mqttClient.getNewDeviceNotification(new AWSIotMqttNewMessageCallback() {
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

                            JSONObject device = jsonObject.getJSONObject("devices");
                        } catch (UnsupportedEncodingException | JSONException e) {
                            Log.e(LOG_TAG, "Message encoding error.", e);
                        }
                    }
                });
            }
        });

        mqttClient.getDeleteDeviceNotification(new AWSIotMqttNewMessageCallback() {
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

        mqttClient.getCustomNotification("custom/topic", new AWSIotMqttNewMessageCallback() {
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
        });*/

        /*********************************************************************************************************************/

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
                if(topic == "notify/new") {
                    System.out.println(message.toString());
                } else if(topic == "notify/delete") {

                } else if(topic == "notify/location/"+mqttClient.getClientId()) {

                } else if(topic == "notify/position/"+mqttClient.getClientId()) {

                }
            }

            @Override
            public void deliveryComplete(IMqttDeliveryToken token) {

            }
        };

        mqttClient = new OnPremiseMqtt(this, this, "192.168.1.198", "1883", callback);
    }
}