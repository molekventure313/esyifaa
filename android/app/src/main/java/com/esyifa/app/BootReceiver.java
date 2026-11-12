package com.esyifa.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Hidupkan semula pemantauan order selepas telefon restart / app dikemas kini. */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        OrderWatchService.start(context);
    }
}
