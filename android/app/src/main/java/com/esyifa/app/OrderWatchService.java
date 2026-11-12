package com.esyifa.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Servis latar depan: semak /api/app/feed setiap 20 saat. Order baru → bunyi "cing!" + notifikasi.
 * Pegang partial wake lock supaya semakan berjalan walaupun skrin tertutup.
 */
public class OrderWatchService extends Service {
    static final String CH_WATCH = "watch";
    static final String CH_ORDER = "order_v2";
    private static final int ID_ONGOING = 1;
    private static final long INTERVAL_SEC = 20;

    private ScheduledExecutorService exec;
    private PowerManager.WakeLock wakeLock;
    private int orderNotifId = 1000;
    private String lastStatus = "Menyambung…";

    static void start(Context c) {
        if (Prefs.token(c) == null) return;
        Intent i = new Intent(c, OrderWatchService.class);
        try {
            c.startForegroundService(i);
        } catch (Exception ignored) {
            // Android 12+ boleh tolak mula dari latar belakang — akan cuba lagi bila app dibuka
        }
    }

    static void stop(Context c) {
        c.stopService(new Intent(c, OrderWatchService.class));
    }

    static void ensureChannels(Context c) {
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        NotificationChannel watch = new NotificationChannel(CH_WATCH, "Pemantauan order", NotificationManager.IMPORTANCE_MIN);
        watch.setDescription("Notifikasi tetap semasa app memantau order");
        watch.setShowBadge(false);
        nm.createNotificationChannel(watch);

        // Bunyi dimainkan sendiri oleh app (Sound.play) supaya mod "bunyi kuat" boleh atasi mod senyap
        NotificationChannel order = new NotificationChannel(CH_ORDER, "Order baru", NotificationManager.IMPORTANCE_HIGH);
        order.setDescription("Order baru masuk — cing!");
        order.setSound(null, null);
        order.enableVibration(true);
        order.setVibrationPattern(new long[]{0, 120, 80, 220});
        nm.createNotificationChannel(order);
    }

    @Override
    public void onCreate() {
        super.onCreate();
        ensureChannels(this);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (Prefs.token(this) == null) {
            stopSelf();
            return START_NOT_STICKY;
        }
        Notification n = ongoing(lastStatus);
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(ID_ONGOING, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        } else {
            startForeground(ID_ONGOING, n);
        }
        if (wakeLock == null) {
            PowerManager pm = getSystemService(PowerManager.class);
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "esyifa:orderwatch");
            wakeLock.setReferenceCounted(false);
            wakeLock.acquire();
        }
        if (exec == null) {
            exec = Executors.newSingleThreadScheduledExecutor();
            exec.scheduleWithFixedDelay(this::pollSafe, 0, INTERVAL_SEC, TimeUnit.SECONDS);
        }
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        if (exec != null) exec.shutdownNow();
        exec = null;
        if (wakeLock != null && wakeLock.isHeld()) wakeLock.release();
        wakeLock = null;
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }

    private void pollSafe() {
        try {
            poll();
        } catch (Exception e) {
            updateOngoing("Tiada sambungan — cuba lagi…");
        }
    }

    private void poll() throws Exception {
        String token = Prefs.token(this);
        if (token == null) { stopSelf(); return; }

        HttpURLConnection con = (HttpURLConnection) new URL(BuildConfig.BASE_URL + "/api/app/feed").openConnection();
        con.setConnectTimeout(15000);
        con.setReadTimeout(15000);
        con.setRequestProperty("Authorization", "Bearer " + token);
        con.setRequestProperty("Accept", "application/json");
        int code = con.getResponseCode();
        if (code == 401 || code == 403) {
            Prefs.clearLogin(this);
            notifySimple("Notifikasi order terhenti", "Sila log masuk semula dalam app E-Syifa.");
            stopSelf();
            return;
        }
        if (code != 200) { updateOngoing("Pelayan sibuk (" + code + ") — cuba lagi…"); return; }

        JSONObject res = new JSONObject(readAll(con.getInputStream()));
        JSONArray orders = res.getJSONArray("orders");
        JSONObject today = res.optJSONObject("today");
        String todayLine = today == null ? "" :
                "Hari ini: " + today.optInt("count") + " order · " + rm(today.optDouble("total"));

        LinkedHashSet<String> seen = Prefs.seen(this);
        boolean firstRun = !Prefs.seeded(this);
        List<JSONObject> fresh = new ArrayList<>();
        // Feed disusun terbaru dulu — balikkan supaya notifikasi ikut turutan masa
        for (int i = orders.length() - 1; i >= 0; i--) {
            JSONObject o = orders.getJSONObject(i);
            String id = o.getString("id");
            if (seen.add(id) && !firstRun) fresh.add(o);
        }
        Prefs.saveSeen(this, seen);
        if (firstRun) Prefs.setSeeded(this);

        if (!fresh.isEmpty()) {
            Sound.play(this, Prefs.loudMode(this));
            int shown = 0;
            for (JSONObject o : fresh) {
                if (shown++ >= 5) break;
                notifyOrder(o, todayLine);
            }
            if (fresh.size() > 5) {
                notifySimple("💰 " + fresh.size() + " order baru!", todayLine);
            }
        }
        updateOngoing(todayLine.isEmpty() ? "Memantau order…" : todayLine);
    }

    private void notifyOrder(JSONObject o, String todayLine) {
        String type = "cod".equals(o.optString("payment_type")) ? "COD" : "FPX";
        String product = o.optString("product", "");
        if (product.equals("null")) product = "";
        String title = "💰 Cing! Order baru " + rm(o.optDouble("amount", 0));
        String text = o.optString("name", "Pelanggan") + " · " + type + (product.isEmpty() ? "" : " · " + product);
        Notification n = new Notification.Builder(this, CH_ORDER)
                .setSmallIcon(R.drawable.ic_stat_coin)
                .setColor(0xFF0F7A4A)
                .setContentTitle(title)
                .setContentText(text)
                .setStyle(new Notification.BigTextStyle().bigText(text + (todayLine.isEmpty() ? "" : "\n" + todayLine)))
                .setContentIntent(openApp(Prefs.ordersPath(this), orderNotifId))
                .setAutoCancel(true)
                .setCategory(Notification.CATEGORY_MESSAGE)
                .build();
        getSystemService(NotificationManager.class).notify(orderNotifId++, n);
        if (orderNotifId > 1900) orderNotifId = 1000;
    }

    private void notifySimple(String title, String text) {
        Notification n = new Notification.Builder(this, CH_ORDER)
                .setSmallIcon(R.drawable.ic_stat_coin)
                .setColor(0xFF0F7A4A)
                .setContentTitle(title)
                .setContentText(text)
                .setContentIntent(openApp(Prefs.ordersPath(this), 999))
                .setAutoCancel(true)
                .build();
        getSystemService(NotificationManager.class).notify(999, n);
    }

    private void updateOngoing(String status) {
        lastStatus = status;
        getSystemService(NotificationManager.class).notify(ID_ONGOING, ongoing(status));
    }

    private Notification ongoing(String status) {
        return new Notification.Builder(this, CH_WATCH)
                .setSmallIcon(R.drawable.ic_stat_coin)
                .setColor(0xFF0F7A4A)
                .setContentTitle("E-Syifa · memantau order")
                .setContentText(status)
                .setOngoing(true)
                .setContentIntent(openApp(null, 1))
                .build();
    }

    private PendingIntent openApp(String path, int reqCode) {
        Intent i = new Intent(this, MainActivity.class);
        i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        if (path != null) i.putExtra(MainActivity.EXTRA_PATH, path);
        return PendingIntent.getActivity(this, reqCode, i,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static String rm(double v) {
        NumberFormat f = NumberFormat.getNumberInstance(new Locale("ms", "MY"));
        f.setMinimumFractionDigits(v % 1 == 0 ? 0 : 2);
        f.setMaximumFractionDigits(2);
        return "RM" + f.format(v);
    }

    private static String readAll(InputStream in) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buf = new byte[8192];
        int n;
        while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
        in.close();
        return out.toString(StandardCharsets.UTF_8.name());
    }
}
