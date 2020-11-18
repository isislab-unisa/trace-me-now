package com.mauro.tracemenow_client;

import android.os.AsyncTask;
import android.os.Bundle;

import com.amazonaws.mobileconnectors.iot.AWSIotMqttNewMessageCallback;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.snackbar.Snackbar;
import com.mauro.tracemenow.AWSMqtt;
import com.mauro.tracemenow.BleSetup;
import com.mauro.tracemenow.OnPremiseMqtt;
import com.mauro.tracemenow.RestCalls;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import android.util.Log;
import android.view.View;
import android.widget.TextView;

import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallbackExtended;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

import org.eclipse.paho.client.mqttv3.MqttCallbackExtended;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

import static com.amazonaws.mobile.auth.core.internal.util.ThreadUtils.runOnUiThread;

public class MainActivity extends AppCompatActivity {

    private static final String LOG_TAG = "[IOT CORE]";

    private static final String ipAddress = "192.168.1.115";
    private static final String mosquittoPort = "1883";
    private static final String serverPort = "8000";

    private OnPremiseMqtt mqttClient;
    private AWSMqtt awsClient;

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

        // Instantiate a new BLE object, without specifying minor and major values
        BleSetup ble = new BleSetup(this, this);
        // Instantiate a new BLE object by specifying its minor and major values
        BleSetup bleSetup = new BleSetup(this, this, 0, 0);
        // Start transmission
        ble.startTransmitting();
        //Stop transmission
        ble.stopTransmitting();

        /* Here starts the IoT core configuration and connection, as well as topics subscriptions.
         * You can define the behaviour for each topic message reception.
         * You can even subscribe to a custom topic.
         * NOTE: if you use AWSMqtt, you won't use OnPremiseMqtt and vice versa.
         */

        awsClient = new AWSMqtt(this, this, "a26sbz9d6nds4r-ats.iot.us-east-1.amazonaws.com", "us-east-1:fb46622a-bcf0-4b7b-92f9-3161f47af674");
        awsClient.connect();

        /* By calling this method, you will subscribe to the 'notify/new' topic and you will receive a message every time a new device comes in
         * You can specify the behaviour when this message comes in in the run() method, which will run in a separate thread.
         */
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

        /* By calling this method, you will subscribe to the 'notify/delete' topic and you will receive a message every time a device leaves the system
         * You can specify the behaviour when this message comes in in the run() method, which will run in a separate thread.
         */
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

        /* Each time you will call this method, you will receive your current location once.
         * You can specify the behaviour when this message comes in in the run() method, which will run in a separate thread.
         */
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

        /* By calling this method, receive you updated current location continuously until you unsubscribe from it.
         * You can specify the behaviour when this message comes in in the run() method, which will run in a separate thread.
         */
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

        /* By calling this method, you will receive a notification everytime your device changes room/raspberry
         * You can specify the behaviour when this message comes in in the messageArrived() method specified before, which will run in a separate thread.
         */
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

        /* By calling this method, you will subscribe to your custom topic, specified as a parameter, and you will receive a message every time something is published on it
         * You can specify the behaviour when this message comes in in the run() method, which will run in a separate thread.
         */
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

        // By calling this method, you will unsubscribe from the 'notify/new' topic and you won't receive such a notification anymore.
        awsClient.removeNewDeviceNotification();

        // By calling this method, you will unsubscribe from the 'notify/delete' topic and you won't receive such a notification anymore.
        awsClient.removeDeleteDevicesNotification();

        // By calling this method, you will unsubscribe from the 'notify/location/uuid' topic and you won't receive such a notification anymore.
        awsClient.removeLocationNotification();

        // By calling this method, you will unsubscribe from the 'notify/position/uuid' topic and you won't receive such a notification anymore.
        awsClient.removePositionNotification();

        // By calling this method, you will unsubscribe from the 'notify/change/uuid' topic and you won't receive such a notification anymore.
        awsClient.removeChangeNotification();

        // By calling this method, you will unsubscribe from the topic specified as a parameter.
        awsClient.removeCustomNotification("custom/topic");

        /* Here starts the on premise MQTT configuration and connection, as well as topics subscriptions.
         * You can define the behaviour for each topic message reception.
         * You can even subscribe to a custom topic.
         * NOTE: if you use OnPremiseMqtt, you won't use AWSMqtt and vice versa.
         */

        /* You first have to define a callback with a method for each specific action.
         * If you want to receive a message from a specific topic, you have to define it in the messageArrived() method and add an if with your desired topic,
         * and inside it define a specific behaviour.
         * Then you can connect to the broker and subscribe to the topics.
         */
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

        // Create a new object by specifying the activity, context, ip address, port, and the callback defined previously
        mqttClient = new OnPremiseMqtt(this, this, ipAddress, mosquittoPort, callback);

        // Connect to the broker
        mqttClient.connect();

        /* By calling this method, you will subscribe to the 'notify/new' topic and you will receive a message every time a new device comes in
         * You can specify the behaviour when this message comes in in the messageArrived() method specified before, which will run in a separate thread.
         */
        mqttClient.getNewDeviceNotification();

        /* By calling this method, you will subscribe to the 'notify/delete' topic and you will receive a message every time a device leaves the system
         * You can specify the behaviour when this message comes in in the messageArrived() method specified before, which will run in a separate thread.
         */
        mqttClient.getDeleteDeviceNotification();

        /* Each time you will call this method, you will receive your current location once.
         * You can specify the behaviour when this message comes in in the messageArrived() method specified before, which will run in a separate thread.
         */
        mqttClient.getLocationNotification();

        /* By calling this method, you will receive your updated current location continuously until you unsubscribe from it.
         * You can specify the behaviour when this message comes in in the messageArrived() method specified before, which will run in a separate thread.
         */
        mqttClient.getPositionNotification();

        /* By calling this method, you will receive a notification everytime your device changes room/raspberry
         * You can specify the behaviour when this message comes in in the messageArrived() method specified before, which will run in a separate thread.
         */
        mqttClient.getChangeNotification();

        /* By calling this method, you will subscribe to your custom topic, specified as a parameter, and you will receive a message every time something is published on it
         * You can specify the behaviour when this message comes in in the messageArrived() method specified before, which will run in a separate thread.
         */
        mqttClient.getCustomNotification("custom/topic");

        // By calling this method, you will unsubscribe from the 'notify/new' topic and you won't receive such a notification anymore.
        mqttClient.removeNewDeviceNotification();

        // By calling this method, you will unsubscribe from the 'notify/delete' topic and you won't receive such a notification anymore.
        mqttClient.removeDeleteDevicesNotification();

        // By calling this method, you will unsubscribe from the 'notify/location/uuid' topic and you won't receive such a notification anymore.
        mqttClient.removeLocationNotification();

        // By calling this method, you will unsubscribe from the 'notify/position/uuid' topic and you won't receive such a notification anymore.
        mqttClient.removePositionNotification();

        // By calling this method, you will unsubscribe from the 'notify/change/uuid' topic and you won't receive such a notification anymore.
        mqttClient.removeChangeNotification();

        // By calling this method, you will unsubscribe from the topic specified as a parameter.
        mqttClient.removeCustomNotification("custom/topic");

        /* Here is an example of how to use provided APIs using OkHttpClient library.
         * This is just an example, it does not belong to the framework, sinc it is just a Rest API call.
         */

        /* Rest API request should run in an AsyncTask, since an HTTP request is asynchronous.
         * Here is how you run it.
         */
        new Get().execute();
    }

    // AsyncTasks are defined in an external class or in a nested class. In both cases it must extend AsyncTask.
    private class Get extends AsyncTask<Void, Void, String> {

        @Override
        protected String doInBackground(Void... voids) {
            OkHttpClient client = new OkHttpClient();

            Request get = new Request.Builder()
                    .url("http://" + ipAddress + ":" + serverPort + "/getDevices") // NOTE: use https:// if your server is running on HTTPS
                    .build();

            try {
                Response res = client.newCall(get).execute();
                return res.body().string();
            } catch (IOException e) {
                e.printStackTrace();
                return null;
            }
        }

        @Override
        protected void onPostExecute(String res) {
            super.onPostExecute(res);

            if (res == null) return;

            JSONObject jsonObject = null;
            try {
                jsonObject = new JSONObject(res);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            Log.i("REST CALL", jsonObject.toString());
        }
    }
}