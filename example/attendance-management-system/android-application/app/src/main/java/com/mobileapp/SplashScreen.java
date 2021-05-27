package com.mobileapp;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;

public class SplashScreen extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash_screen);
        new Loading().execute();
    }

    private class Loading extends AsyncTask<String, Void, String> {

        @Override
        protected String doInBackground(String... params) {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.interrupted();
            }

            return "";
        }

        @Override
        protected void onPostExecute(String result) {
            SharedPreferences sharedPref = getSharedPreferences("app", Context.MODE_PRIVATE);
            String name = sharedPref.getString("name", null);
            Log.i("[NAME]", ""+name);
            Intent i;
            if (name != null) {
                i = new Intent(SplashScreen.this, MainActivity.class);
            }
            else{
                i = new Intent(SplashScreen.this, Register.class);
            }

            //i.putExtra("data", result);
            startActivity(i);
            finish();
        }

        @Override
        protected void onPreExecute() {}

        @Override
        protected void onProgressUpdate(Void... values) {}
    }
}