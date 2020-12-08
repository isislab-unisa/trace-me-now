package com.mauro.tracemenow;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.AdvertiseSettings;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;

import java.util.Random;
import java.util.UUID;

import com.uriio.beacons.Beacons;
import com.uriio.beacons.model.Beacon;
import com.uriio.beacons.model.iBeacon;

public class BleSetup {
    private Beacon iBeacon;
    private int min, maj = -1;
    private UuidUtils uuidUtils;
    private byte[] uuidBeacon;
    private Activity activity;
    private Context context;

    private SharedPreferences sharedPref;

    public BleSetup(Activity activity, Context context) {
        this.activity = activity;
        this.context = context;
        initialize();
    }

    public BleSetup(Activity activity, Context context, int min, int maj) {
        this.activity = activity;
        this.context = context;
        this.min = min;
        this.maj = maj;
        initialize();
    }

    protected void initialize() {
        String s;

        if (min == -1 && maj == -1) {
            Random r = new Random();
            int min = r.nextInt(65536);
            int maj = r.nextInt(65536);
        }
        uuidUtils = new UuidUtils();

        sharedPref = activity.getSharedPreferences("app", Context.MODE_PRIVATE);
        s = sharedPref.getString("uuid", null);

        if (s == null) {
            SharedPreferences.Editor editor = sharedPref.edit();
            s = UUID.randomUUID().toString();
            editor.putString("uuid", s);
            editor.apply();
        }

        uuidBeacon = uuidUtils.asBytes(s);
    }

    public boolean startTransmitting() {
        if(checkBluetooth()) {
            Beacons.initialize(context);

            iBeacon = new iBeacon(uuidBeacon, maj, min, AdvertiseSettings.ADVERTISE_MODE_BALANCED, AdvertiseSettings.ADVERTISE_TX_POWER_MEDIUM, "iBeacon");

            iBeacon.start();

            return true;
        } else {
            return false;
        }
    }

    public void stopTransmitting() {
        iBeacon.stop();
    }

    private boolean checkBluetooth() {
        // Use this check to determine whether BLE is supported on the device. Then you can selectively disable BLE-related features.
        if (!this.activity.getPackageManager().hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)) {
            return false;
        }

        // Initializes Bluetooth adapter.
        final BluetoothManager bluetoothManager = (BluetoothManager) this.activity.getSystemService(Context.BLUETOOTH_SERVICE);
        BluetoothAdapter bluetoothAdapter = bluetoothManager.getAdapter();

        // Ensures Bluetooth is available on the device and it is enabled. If not, displays a dialog requesting user permission to enable Bluetooth.
        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            this.activity.startActivityForResult(enableBtIntent, 1);
        }

        return true;
    }

    public String getClientId() {
        return sharedPref.getString("uuid", null);
    }
}
