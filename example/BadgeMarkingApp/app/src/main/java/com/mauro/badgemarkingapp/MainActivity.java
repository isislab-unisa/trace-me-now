package com.mauro.badgemarkingapp;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Context;
import android.content.DialogInterface;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Switch;
import android.widget.TextView;

import com.mauro.tracemenow.BleSetup;
import com.mauro.tracemenow.OnPremiseMqtt;

import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallbackExtended;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.json.JSONException;
import org.json.JSONObject;

public class MainActivity extends AppCompatActivity {

    private BleSetup bleSetup;
    private OnPremiseMqtt mqttClient;

    private TextView name, startShift, endShift;
    private Switch active;

    // Server settings
    private static final String ipAddress = "192.168.1.115";
    private static final String serverPort = "8888";
    private static final String mosquittoPort = "1883";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        name = (TextView)findViewById(R.id.name);
        startShift = (TextView)findViewById(R.id.startShift);
        endShift = (TextView)findViewById(R.id.endShift);
        active = (Switch)findViewById(R.id.active);

        SharedPreferences sharedPref = getSharedPreferences("app", Context.MODE_PRIVATE);
        // SharedPreferences.Editor editor = sharedPref.edit();

        name.setText(sharedPref.getString("name", "err"));
        startShift.setText(sharedPref.getString("startShift", "err"));
        endShift.setText(sharedPref.getString("endShift", "err"));

        bleSetup = new BleSetup(this, this);
        bleSetup.startTransmitting();
        active.setChecked(true);

        MqttCallbackExtended callback = new MqttCallbackExtended() {
            @Override
            public void connectComplete(boolean reconnect, String serverURI) {
                if (reconnect) {
                    // re-subscribe to topics
                    mqttClient.getCustomNotification("employee/ask");
                } else {

                }
            }

            @Override
            public void connectionLost(Throwable cause) {

            }

            @Override
            public void messageArrived(String topic, MqttMessage message) throws Exception {
                if(topic.equals("employee/ask")) {
                    askForReason(message.toString());
                }
            }

            @Override
            public void deliveryComplete(IMqttDeliveryToken token) {

            }
        };

        mqttClient = new OnPremiseMqtt(this, this, ipAddress, mosquittoPort, callback);
        mqttClient.connect();
        mqttClient.getCustomNotification("employee/ask");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        bleSetup.stopTransmitting();
    }

    public void activate(View v) {
        if(!active.isChecked()) {
            active.setChecked(false);
            bleSetup.stopTransmitting();
        } else {
            active.setChecked(true);
            bleSetup.startTransmitting();
        }
    }

    private void askForReason(String message) throws JSONException {

        JSONObject jsonObject = null;
        try {
            jsonObject = new JSONObject(message);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        String recevied = (String) jsonObject.getString("uuid");
        String internal = (String) bleSetup.getClientId();

        if (recevied.equals(internal)) {

            AlertDialog.Builder builder = new AlertDialog.Builder(this);
            builder.setTitle(jsonObject.getString("message"));

            final EditText input = new EditText(this);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.MATCH_PARENT);
            input.setLayoutParams(lp);
            builder.setView(input);
            builder.setCancelable(false);

            builder.setPositiveButton("Submit", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    String json = "{ \"uuid\": \"" + internal + "\", \"reason\": \"" + input.getText() + "\" }";
                    mqttClient.publishTo("employee/ask/response", json);
                }
            });

            builder.show();
        }
    }
}