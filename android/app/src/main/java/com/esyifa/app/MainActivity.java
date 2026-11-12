package com.esyifa.app;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.PowerManager;
import android.provider.MediaStore;
import android.provider.Settings;
import android.util.Base64;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.FrameLayout;
import android.widget.Toast;

import java.io.OutputStream;

public class MainActivity extends Activity {
    static final String EXTRA_PATH = "path";
    private static final int REQ_FILE = 11;
    private static final int REQ_NOTIF = 12;

    private WebView web;
    private ProgressBar progress;
    private ValueCallback<Uri[]> fileCallback;
    private boolean tokenRefreshed = false;
    private long lastTokenTry = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        OrderWatchService.ensureChannels(this);

        FrameLayout root = new FrameLayout(this);
        web = new WebView(this);
        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setMax(100);
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));
        root.addView(progress, new FrameLayout.LayoutParams(-1, 8));
        setContentView(root);

        CookieManager cm = CookieManager.getInstance();
        cm.setAcceptCookie(true);
        cm.setAcceptThirdPartyCookies(web, true);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setSupportZoom(true);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setUserAgentString(s.getUserAgentString() + " ESyifaApp/" + BuildConfig.VERSION_NAME);

        web.addJavascriptInterface(new Bridge(), "EsyifaApp");
        web.setWebViewClient(new Client());
        web.setWebChromeClient(new Chrome());
        web.setDownloadListener((url, ua, cd, mime, len) -> download(url, ua, cd, mime));

        if (savedInstanceState != null) {
            web.restoreState(savedInstanceState);
        } else {
            web.loadUrl(BuildConfig.BASE_URL + startPath(getIntent()));
        }

        askNotificationPermission();
        if (Prefs.token(this) != null) OrderWatchService.start(this);
    }

    private String startPath(Intent i) {
        String p = i == null ? null : i.getStringExtra(EXTRA_PATH);
        return p != null ? p : "/dashboard";
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        String p = intent.getStringExtra(EXTRA_PATH);
        if (p != null) web.loadUrl(BuildConfig.BASE_URL + p);
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    // ── Menu ────────────────────────────────────────────────────────────────
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        menu.add(0, 1, 0, "🧾 Order").setShowAsAction(MenuItem.SHOW_AS_ACTION_ALWAYS);
        menu.add(0, 2, 1, "🏠 Dashboard");
        menu.add(0, 3, 2, "🔄 Muat semula");
        menu.add(0, 4, 3, "🔔 Uji bunyi Cing!");
        menu.add(0, 5, 4, "🔊 Bunyi walaupun mod senyap").setCheckable(true);
        menu.add(0, 6, 5, "ℹ️ Status notifikasi");
        menu.add(0, 7, 6, "⛔ Hentikan notifikasi order");
        return true;
    }

    @Override
    public boolean onPrepareOptionsMenu(Menu menu) {
        menu.findItem(5).setChecked(Prefs.loudMode(this));
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case 1: web.loadUrl(BuildConfig.BASE_URL + Prefs.ordersPath(this)); return true;
            case 2: web.loadUrl(BuildConfig.BASE_URL + "/dashboard"); return true;
            case 3: web.reload(); return true;
            case 4: Sound.play(this, Prefs.loudMode(this)); return true;
            case 5:
                Prefs.setLoudMode(this, !Prefs.loudMode(this));
                toast(Prefs.loudMode(this) ? "Bunyi Cing akan keluar walaupun telefon senyap" : "Bunyi ikut kelantangan notifikasi");
                return true;
            case 6: showStatus(); return true;
            case 7:
                new AlertDialog.Builder(this)
                        .setMessage("Hentikan notifikasi order di telefon ini? Anda boleh hidupkan semula dengan buka Dashboard.")
                        .setPositiveButton("Hentikan", (d, w) -> {
                            Prefs.clearLogin(this);
                            OrderWatchService.stop(this);
                            tokenRefreshed = true; // jangan daftar semula automatik sesi ini
                            toast("Notifikasi order dihentikan");
                        })
                        .setNegativeButton("Batal", null)
                        .show();
                return true;
        }
        return super.onOptionsItemSelected(item);
    }

    private void showStatus() {
        boolean on = Prefs.token(this) != null;
        PowerManager pm = getSystemService(PowerManager.class);
        boolean batteryOk = pm.isIgnoringBatteryOptimizations(getPackageName());
        String msg = on
                ? "✅ Notifikasi order AKTIF\nAkaun: " + Prefs.name(this) + " (" + Prefs.role(this) + ")"
                : "❌ Notifikasi order belum aktif.\nLog masuk & buka Dashboard untuk aktifkan.";
        msg += "\n\nPenjimat bateri: " + (batteryOk ? "✅ dikecualikan" : "⚠️ masih aktif — notifikasi mungkin lambat bila skrin tutup");
        AlertDialog.Builder b = new AlertDialog.Builder(this).setTitle("Status").setMessage(msg).setPositiveButton("OK", null);
        if (!batteryOk) b.setNeutralButton("Kecualikan bateri", (d, w) -> askBatteryExemption());
        b.show();
    }

    // ── Kebenaran ───────────────────────────────────────────────────────────
    private void askNotificationPermission() {
        if (Build.VERSION.SDK_INT >= 33
                && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ_NOTIF);
        }
    }

    private void askBatteryExemption() {
        PowerManager pm = getSystemService(PowerManager.class);
        if (pm.isIgnoringBatteryOptimizations(getPackageName())) return;
        try {
            Intent i = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
            i.setData(Uri.parse("package:" + getPackageName()));
            startActivity(i);
        } catch (Exception e) {
            try { startActivity(new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)); } catch (Exception ignored) {}
        }
    }

    // ── Token peranti: diambil guna sesi login dalam WebView ────────────────
    private void maybeRegisterDevice(String url) {
        if (tokenRefreshed || url == null || !url.startsWith(BuildConfig.BASE_URL + "/dashboard")) return;
        long now = System.currentTimeMillis();
        if (now - lastTokenTry < 4000) return;
        lastTokenTry = now;
        web.evaluateJavascript(
                "fetch('/api/app/device-token',{method:'POST',credentials:'include'})" +
                ".then(function(r){return r.json()})" +
                ".then(function(d){EsyifaApp.onDeviceToken(JSON.stringify(d))})" +
                ".catch(function(e){})", null);
    }

    private class Bridge {
        @JavascriptInterface
        public void onDeviceToken(String json) {
            try {
                org.json.JSONObject d = new org.json.JSONObject(json);
                if (!d.optBoolean("success")) return;
                tokenRefreshed = true;
                boolean firstTime = Prefs.token(MainActivity.this) == null;
                Prefs.saveLogin(MainActivity.this, d.getString("token"), d.optString("name"), d.optString("role"));
                runOnUiThread(() -> {
                    OrderWatchService.start(MainActivity.this);
                    if (firstTime) {
                        toast("🔔 Notifikasi order aktif — Cing! bila order masuk");
                        askBatteryExemption();
                    }
                });
            } catch (Exception ignored) {}
        }

        @JavascriptInterface
        public void saveBase64(String dataUrl, String fileName) {
            try {
                int comma = dataUrl.indexOf(',');
                String meta = dataUrl.substring(5, comma); // mime;base64
                String mime = meta.split(";")[0];
                byte[] bytes = Base64.decode(dataUrl.substring(comma + 1), Base64.DEFAULT);
                String name = (fileName == null || fileName.isEmpty()) ? "esyifa-" + System.currentTimeMillis() : fileName;
                ContentValues v = new ContentValues();
                v.put(MediaStore.Downloads.DISPLAY_NAME, name);
                v.put(MediaStore.Downloads.MIME_TYPE, mime.isEmpty() ? "application/octet-stream" : mime);
                v.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                try (OutputStream os = getContentResolver().openOutputStream(uri)) { os.write(bytes); }
                runOnUiThread(() -> toast("Disimpan dalam Downloads: " + name));
            } catch (Exception e) {
                runOnUiThread(() -> toast("Gagal simpan fail"));
            }
        }
    }

    // ── Muat turun (CSV, PDF label, dll.) ───────────────────────────────────
    private void download(String url, String ua, String contentDisposition, String mime) {
        if (url.startsWith("blob:") || url.startsWith("data:")) {
            String js = "(function(){var u=" + org.json.JSONObject.quote(url) + ";" +
                    "var a=document.querySelector('a[href=\"'+u+'\"]');var n=a&&a.download?a.download:'';" +
                    "fetch(u).then(function(r){return r.blob()}).then(function(b){var f=new FileReader();" +
                    "f.onloadend=function(){EsyifaApp.saveBase64(f.result,n)};f.readAsDataURL(b)})})()";
            web.evaluateJavascript(js, null);
            return;
        }
        if (Build.VERSION.SDK_INT < 29) {
            toast("Muat turun memerlukan Android 10 ke atas");
            return;
        }
        try {
            String name = URLUtil.guessFileName(url, contentDisposition, mime);
            DownloadManager.Request r = new DownloadManager.Request(Uri.parse(url));
            r.addRequestHeader("Cookie", CookieManager.getInstance().getCookie(url));
            r.addRequestHeader("User-Agent", ua);
            r.setMimeType(mime);
            r.setTitle(name);
            r.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            r.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, name);
            getSystemService(DownloadManager.class).enqueue(r);
            toast("Memuat turun " + name);
        } catch (Exception e) {
            toast("Gagal muat turun");
        }
    }

    private class Client extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
            Uri u = req.getUrl();
            String scheme = u.getScheme();
            String host = u.getHost();
            Uri base = Uri.parse(BuildConfig.BASE_URL);
            boolean internal = ("https".equals(scheme) || "http".equals(scheme))
                    && host != null && (host.equals(base.getHost()) || host.endsWith("." + base.getHost()));
            if (internal) return false;
            // WhatsApp, telefon, Waze, link luar → app lain
            try {
                if ("intent".equals(scheme)) {
                    startActivity(Intent.parseUri(u.toString(), Intent.URI_INTENT_SCHEME));
                } else {
                    startActivity(new Intent(Intent.ACTION_VIEW, u));
                }
            } catch (ActivityNotFoundException | java.net.URISyntaxException e) {
                if ("https".equals(scheme) || "http".equals(scheme)) return false;
                toast("Tiada app untuk buka pautan ini");
            }
            return true;
        }

        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
            progress.setVisibility(View.VISIBLE);
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            progress.setVisibility(View.GONE);
            CookieManager.getInstance().flush();
            maybeRegisterDevice(url);
        }

        @Override
        public void doUpdateVisitedHistory(WebView view, String url, boolean isReload) {
            // Next.js tukar halaman tanpa reload — semak juga di sini
            maybeRegisterDevice(url);
        }
    }

    private class Chrome extends WebChromeClient {
        @Override
        public void onProgressChanged(WebView view, int p) {
            progress.setProgress(p);
            progress.setVisibility(p < 100 ? View.VISIBLE : View.GONE);
        }

        @Override
        public void onReceivedTitle(WebView view, String title) {
            if (getActionBar() != null) getActionBar().setSubtitle(null);
        }

        @Override
        public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> cb, FileChooserParams params) {
            if (fileCallback != null) fileCallback.onReceiveValue(null);
            fileCallback = cb;
            try {
                startActivityForResult(params.createIntent(), REQ_FILE);
            } catch (ActivityNotFoundException e) {
                fileCallback = null;
                return false;
            }
            return true;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQ_FILE && fileCallback != null) {
            fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
            fileCallback = null;
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    private void toast(String m) {
        Toast.makeText(this, m, Toast.LENGTH_LONG).show();
    }
}
