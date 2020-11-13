package com.mauro.tracemenow;

import android.util.Log;

import com.amazonaws.mobileconnectors.iot.AWSIotMqttNewMessageCallback;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;

import static com.amazonaws.mobile.auth.core.internal.util.ThreadUtils.runOnUiThread;

public class Example {
    private static final String LOG_TAG = "[IOT CORE]";

    public static void main(String args[]) {
        AWSMqtt mqttClient = new AWSMqtt(null, null, "", "");

        mqttClient.newDeviceNotification(new AWSIotMqttNewMessageCallback() {
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
    }
}
