package com.esyifa.app;

import android.content.Context;
import android.content.SharedPreferences;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;

/** Simpanan kecil: token peranti, nama/role, dan ID order yang dah "cing". */
final class Prefs {
    private static final String FILE = "esyifa";
    private static final int MAX_SEEN = 400;

    private Prefs() {}

    private static SharedPreferences sp(Context c) {
        return c.getSharedPreferences(FILE, Context.MODE_PRIVATE);
    }

    static String token(Context c) { return sp(c).getString("token", null); }
    static String role(Context c) { return sp(c).getString("role", ""); }
    static String name(Context c) { return sp(c).getString("name", ""); }

    static void saveLogin(Context c, String token, String name, String role) {
        sp(c).edit().putString("token", token).putString("name", name).putString("role", role).apply();
    }

    static void clearLogin(Context c) {
        sp(c).edit().remove("token").remove("name").remove("role").remove("seen").remove("seeded").apply();
    }

    static boolean seeded(Context c) { return sp(c).getBoolean("seeded", false); }
    static void setSeeded(Context c) { sp(c).edit().putBoolean("seeded", true).apply(); }

    static LinkedHashSet<String> seen(Context c) {
        String raw = sp(c).getString("seen", "");
        LinkedHashSet<String> set = new LinkedHashSet<>();
        if (!raw.isEmpty()) set.addAll(Arrays.asList(raw.split(",")));
        return set;
    }

    static void saveSeen(Context c, LinkedHashSet<String> set) {
        List<String> list = new ArrayList<>(set);
        if (list.size() > MAX_SEEN) list = list.subList(list.size() - MAX_SEEN, list.size());
        sp(c).edit().putString("seen", String.join(",", list)).apply();
    }

    static boolean loudMode(Context c) { return sp(c).getBoolean("loud", false); }
    static void setLoudMode(Context c, boolean v) { sp(c).edit().putBoolean("loud", v).apply(); }

    /** Halaman order ikut role. */
    static String ordersPath(Context c) {
        return "marketer".equals(role(c)) ? "/dashboard/marketer/orders" : "/dashboard/admin/pesakit-berbayar";
    }
}
