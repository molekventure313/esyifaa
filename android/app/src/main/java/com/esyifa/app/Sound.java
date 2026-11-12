package com.esyifa.app;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.net.Uri;

/** Main bunyi "cing!" terus (bukan melalui saluran notifikasi). */
final class Sound {
    private Sound() {}

    static Uri uri(Context c) {
        return Uri.parse("android.resource://" + c.getPackageName() + "/" + R.raw.cha_ching);
    }

    /** @param loud true = guna saluran penggera (berbunyi walaupun telefon mod senyap) */
    static void play(Context c, boolean loud) {
        try {
            MediaPlayer mp = new MediaPlayer();
            mp.setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(loud ? AudioAttributes.USAGE_ALARM : AudioAttributes.USAGE_NOTIFICATION_EVENT)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build());
            mp.setDataSource(c, uri(c));
            mp.setOnCompletionListener(MediaPlayer::release);
            mp.setOnErrorListener((p, w, e) -> { p.release(); return true; });
            mp.prepare();
            mp.start();
        } catch (Exception ignored) {
        }
    }
}
