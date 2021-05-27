package com.mobileapp;

import android.app.Activity;
import android.app.TimePickerDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.icu.util.Calendar;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.text.InputType;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TimePicker;

import androidx.annotation.RequiresApi;

import com.tracemenow.BleSetup;
import java.io.IOException;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class Register extends Activity {

    private int mHour, mMinute;
    private EditText name, startShift, endShift;
    private Button register;

    // Server settings
    private static final String ipAddress = "192.168.1.115";
    private static final String serverPort = "8888";

    protected BleSetup bleSetup;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        bleSetup = new BleSetup(this, this);

        bleSetup.startTransmitting();
        bleSetup.stopTransmitting();

        name = (EditText)findViewById(R.id.name);
        startShift = (EditText)findViewById(R.id.startShift);
        endShift = (EditText)findViewById(R.id.endShift);
        register = (Button)findViewById(R.id.register);
        startShift.setShowSoftInputOnFocus(false);
        startShift.setInputType(InputType.TYPE_NULL);
        startShift.setFocusable(false);
        endShift.setShowSoftInputOnFocus(false);
        endShift.setInputType(InputType.TYPE_NULL);
        endShift.setFocusable(false);

        register.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                new RegisterCall().execute();
            }
        });
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    public void setTime(View v) {
        // Get Current Time
        final Calendar c = Calendar.getInstance();
        mHour = c.get(Calendar.HOUR_OF_DAY);
        mMinute = c.get(Calendar.MINUTE);

        // Launch Time Picker Dialog
        TimePickerDialog timePickerDialog = new TimePickerDialog(this,
                new TimePickerDialog.OnTimeSetListener() {

                    @Override
                    public void onTimeSet(TimePicker view, int hourOfDay, int minute) {
                        view.setIs24HourView(true);
                        if(v == startShift)
                            startShift.setText(hourOfDay + ":" + minute);
                        else
                            endShift.setText(hourOfDay + ":" + minute);
                    }
                }, mHour, mMinute, false);
        timePickerDialog.show();
    }

    private class RegisterCall extends AsyncTask<Void, Void, String> {

        @Override
        protected String doInBackground(Void... voids) {
            OkHttpClient client = new OkHttpClient();

            String json = "{\"uuid\":\""+bleSetup.getClientId()+"\",\"name\":\""+name.getText()+"\", \"startShift\": \""+startShift.getText()+"\", \"endShift\": \""+endShift.getText()+"\"}";

            RequestBody body = RequestBody.create(MediaType.parse("application/json"), json);

            Request post = new Request.Builder()
                    .url("http://" + ipAddress + ":" + serverPort + "/newEmployee")
                    .post(body)
                    .build();

            try {
                Response res = client.newCall(post).execute();
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

            Log.i("[REST CALL]", res);

            SharedPreferences sharedPref = getSharedPreferences("app", Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = sharedPref.edit();
            editor.putString("name", String.valueOf(name.getText()));
            editor.putString("startShift", startShift.getText().toString());
            editor.putString("endShift", endShift.getText().toString());
            editor.apply();

            Intent i = new Intent(Register.this, MainActivity.class);
            startActivity(i);
            finish();
        }
    }
}