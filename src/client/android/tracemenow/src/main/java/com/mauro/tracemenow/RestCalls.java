package com.mauro.tracemenow;

import android.os.AsyncTask;
import android.util.Log;
import android.widget.TextView;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class RestCalls {
    private String url;
    protected JSONObject result = null;

    public RestCalls(String url, String port) {
        this.url = "http://"+url+":"+port;
        System.out.println(this.url);
    }

    public JSONObject getDevices() {
        new Get().execute(url+"/getDevices");
        while(result == null);
        return result;
    }

    private class Get extends AsyncTask<String, Void, Void> {

        @Override
        protected Void doInBackground(String... params) {
            result = null;
            OkHttpClient client = new OkHttpClient();

            Request get = new Request.Builder()
                    .url(params[0])
                    .build();

            Response res;

            try {
                res = client.newCall(get).execute();
            } catch (IOException e) {
                e.printStackTrace();
                return null;
            }

            JSONObject jsonObject = null;
            try {
                jsonObject = new JSONObject(res.body().toString());
            } catch (JSONException e) {
                e.printStackTrace();
            }
            result = jsonObject;

            return null;
        }
    }
}
