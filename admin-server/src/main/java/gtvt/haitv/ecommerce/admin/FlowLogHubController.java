package gtvt.haitv.ecommerce.admin;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
public class FlowLogHubController {

    private final Map<String, String> services;
    private final RestClient http = RestClient.create();

    public FlowLogHubController(FlowLogProperties properties) {
        this.services = properties.getServices();
    }

    @GetMapping(value = "/flow", produces = MediaType.TEXT_HTML_VALUE)
    public String flowPage() {
        StringBuilder body = new StringBuilder();
        for (Map.Entry<String, String> e : services.entrySet()) {
            body.append("<section><h2>").append(e.getKey()).append("</h2><pre>");
            body.append(escape(tail(e.getValue()))).append("</pre></section>");
        }
        return """
                <!doctype html>
                <html lang="vi"><head>
                <meta charset="utf-8"/>
                <meta http-equiv="refresh" content="3"/>
                <title>Flow logs</title>
                <style>
                  body{margin:0;background:#0b0d12;color:#d7e0d7;font:13px/1.45 ui-monospace,Consolas,monospace}
                  header{padding:16px 22px;background:#12151c;border-bottom:1px solid #222;position:sticky;top:0}
                  header a{color:#c8ff3d}
                  main{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:12px}
                  section{background:#10141a;border:1px solid #222;border-radius:10px;overflow:hidden}
                  h2{margin:0;padding:8px 12px;font:600 12px/1.2 sans-serif;letter-spacing:.08em;color:#9dff6a;background:#161b22}
                  pre{margin:0;padding:10px 12px;max-height:280px;overflow:auto;white-space:pre-wrap}
                </style></head>
                <body>
                <header>Flow logs · auto 3s · <a href="/">Spring Boot Admin</a></header>
                <main>%s</main>
                </body></html>
                """.formatted(body);
    }

    private String tail(String base) {
        try {
            String raw = http.get().uri(base + "/actuator/logfile").retrieve().body(String.class);
            if (raw == null || raw.isBlank()) {
                return "(empty)";
            }
            List<String> keep = new ArrayList<>();
            for (String line : raw.split("\\R")) {
                if (line.contains("] start ") || line.contains("] end ") || line.contains("] HTTP ")
                        || line.contains(" FAIL ") || line.matches(".*] \\d+ .*")) {
                    keep.add(line);
                }
            }
            List<String> src = keep.isEmpty() ? List.of(raw.split("\\R")) : keep;
            int from = Math.max(0, src.size() - 40);
            return String.join("\n", src.subList(from, src.size()));
        } catch (Exception e) {
            return "DOWN · " + e.getMessage();
        }
    }

    private static String escape(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
