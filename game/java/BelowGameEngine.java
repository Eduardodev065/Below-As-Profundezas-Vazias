import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/** Persistent Java gameplay service. Input/output is a line protocol for Electron. */
public final class BelowGameEngine {
    private static final class BossState {
        double timer = 0, aimX = 0, aimY = 0, orbit = 0;
        int phase = 0;
        boolean aware = false;
    }
    private static final Map<String, BossState> BOSSES = new HashMap<>();

    public static void main(String[] args) throws Exception {
        Locale.setDefault(Locale.ROOT);
        BufferedReader input = new BufferedReader(new InputStreamReader(System.in));
        String line;
        while ((line = input.readLine()) != null) {
            String id = line.contains("|") ? line.substring(0, line.indexOf('|')) : "0";
            try { System.out.println(tick(line)); }
            catch (Exception ignored) { System.out.println(id + "|{}"); }
        }
    }

    private static String tick(String line) {
        String[] a = line.split("\\|", -1);
        String id = a[0], key = a[1], kind = a[2];
        double x = n(a[3]), y = n(a[4]), px = n(a[5]), py = n(a[6]);
        int depth = Math.max(1, (int)n(a[7]));
        double dt = Math.max(0, Math.min(.08, n(a[8])));
        BossState s = BOSSES.computeIfAbsent(key, ignored -> new BossState());
        double dx = px - x, dy = py - y, dist = Math.hypot(dx, dy);
        double ux = dx / Math.max(1, dist), uy = dy / Math.max(1, dist);
        double speed = 1 + .15 * (depth - 1), vx = 0, vy = 0;
        String event = "";
        boolean warning = false;
        s.timer += dt;
        if (dist > 620 && !s.aware) return id + "|{\"vx\":0,\"vy\":0,\"event\":\"\",\"warning\":false}";
        s.aware = true;
        switch (kind) {
            case "root":
                if (dist > 60) { vx = ux * 40 * speed; vy = uy * 40 * speed; }
                if (s.timer > 3.6) { s.timer = 0; event = "wave"; }
                break;
            case "wolf":
                if (s.phase == 0) {
                    vx = ux * 70 * speed; vy = uy * 70 * speed;
                    if (s.timer > 2.2) { s.phase = 1; s.timer = 0; s.aimX = ux; s.aimY = uy; }
                } else if (s.phase == 1) {
                    warning = true;
                    if (s.timer > .6) { s.phase = 2; s.timer = 0; }
                } else {
                    vx = s.aimX * 430; vy = s.aimY * 430;
                    if (s.timer > .45) { s.phase = 0; s.timer = 0; }
                }
                break;
            case "wisp":
                s.orbit += dt * .8;
                double ox = px + Math.cos(s.orbit) * 230, oy = py + Math.sin(s.orbit) * 230;
                vx = (ox - x) * 2; vy = (oy - y) * 2;
                if (s.timer > 1.8) { s.timer = 0; event = "fan"; }
                break;
            default:
                if (dist > 80) { vx = ux * 48 * speed; vy = uy * 48 * speed; }
                if (s.timer > 3.2) { s.timer = 0; event = "summon_wave"; }
        }
        String result = String.format(Locale.ROOT,
                "{\"vx\":%.3f,\"vy\":%.3f,\"event\":\"%s\",\"warning\":%s,\"aimX\":%.4f,\"aimY\":%.4f}",
                vx, vy, event, warning, s.aimX, s.aimY);
        return id + "|" + result;
    }

    private static double n(String value) { return Double.parseDouble(value); }
}
