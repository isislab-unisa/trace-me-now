package com.mauro.tracemenow;

import org.json.JSONObject;

public interface Observer {
    public JSONObject update(Object o);
}
