package com.mauro.badgemarkingapp;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
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

        createNotificationChannel();
        SharedPreferences sharedPref = getSharedPreferences("app", Context.MODE_PRIVATE);

        name = (TextView)findViewById(R.id.name);
        startShift = (TextView)findViewById(R.id.startShift);
        endShift = (TextView)findViewById(R.id.endShift);
        active = (Switch)findViewById(R.id.active);

        name.setText(sharedPref.getString("name", "err"));
        startShift.setText(sharedPref.getString("startShift", "err"));
        endShift.setText(sharedPref.getString("endShift", "err"));

        bleSetup = new BleSetup(this, this);
        active.setChecked(true);
        bleSetup.startTransmitting();

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
                    Log.i("[ON MQTT MESSAGE]", message.toString());
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

        if(sharedPref.getString("left", null) != null) {
            Log.i("[RITARDO]", "Non va bene...");
            try {
                askForReason(sharedPref.getString("left", null));
            } catch (JSONException e) {
                e.printStackTrace();
            }
        } else {
            Log.i("[RITARDO]", "Tutto apposto!");
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        bleSetup.stopTransmitting();
    }

    public void changeStatus(View v) {
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

        String received = (String) jsonObject.getString("uuid");
        String internal = (String) bleSetup.getClientId();
        String msg = (String) jsonObject.getString("message");

        if (received.equals(internal)) {
            SharedPreferences sharedPref = getSharedPreferences("app", Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = sharedPref.edit();
            editor.putString("left", message);
            editor.apply();

            AlertDialog.Builder builder = new AlertDialog.Builder(this);
            builder.setTitle(msg);

            final EditText input = new EditText(this);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.MATCH_PARENT);
            input.setLayoutParams(lp);
            builder.setView(input);
            builder.setCancelable(false);

            builder.setPositiveButton("Submit", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    String json = "{ \"uuid\": \"" + internal + "\", \"name\": \"" + name.getText() + "\", \"message\": \"" + input.getText() + "\" }";
                    mqttClient.publishTo("employee/ask/response", json);
                    editor.remove("left");
                    editor.apply();
                }
            });

            builder.show();

            showNotification("Left shift", "Tell us why you're leaving", new Intent(MainActivity.this, MainActivity.class));
        }
    }

    private void showNotification(String title, String content, Intent intent) {
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent, 0);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, "0")
                .setSmallIcon(R.mipmap.icon_badge)
                .setContentTitle(title)
                .setContentText(content)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true);

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this);
        // notificationId is a unique int for each notification that you must define
        notificationManager.notify(0, builder.build());
    }

    private void createNotificationChannel() {
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "badge-notifications";
            String description = "badge-notifications";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel("0", name, importance);
            channel.setDescription(description);
            // Register the channel with the system; you can't change the importance
            // or other notification behaviors after this
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

}