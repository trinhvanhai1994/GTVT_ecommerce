package gtvt.haitv.ecommerce.ops.service;

import gtvt.haitv.ecommerce.ops.catalog.ServiceCatalog;
import gtvt.haitv.ecommerce.ops.catalog.ServiceDef;
import gtvt.haitv.ecommerce.ops.config.OpsProperties;
import gtvt.haitv.ecommerce.ops.docker.ProcessRunner;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class LogService {

    private final ServiceCatalog catalog;
    private final OpsProperties properties;
    private final ProcessRunner runner;
    private final RestClient http = RestClient.create();

    public LogService(ServiceCatalog catalog, OpsProperties properties, ProcessRunner runner) {
        this.catalog = catalog;
        this.properties = properties;
        this.runner = runner;
    }

    public String tail(String id, int lines, String filter) {
        ServiceDef def = catalog.find(id).orElseThrow(() -> new IllegalArgumentException("Unknown service: " + id));
        int n = Math.max(20, Math.min(lines, 2000));
        String raw;
        if ("actuator".equalsIgnoreCase(def.getLogs())) {
            raw = actuatorLog(def);
        } else {
            raw = dockerLog(def, n);
        }
        List<String> all = Arrays.asList(raw.split("\\R"));
        List<String> filtered = filterLines(all, filter);
        int from = Math.max(0, filtered.size() - n);
        return String.join("\n", filtered.subList(from, filtered.size()));
    }

    private String actuatorLog(ServiceDef def) {
        String url = properties.isDockerNetwork()
                ? first(def.getLogfileUrl(), def.getLogfileUrlHost())
                : first(def.getLogfileUrlHost(), def.getLogfileUrl());
        if (url == null) {
            return dockerLog(def, 200);
        }
        try {
            String body = http.get().uri(url).retrieve().body(String.class);
            return body == null ? "(empty)" : body;
        } catch (Exception e) {
            return "DOWN · " + e.getMessage() + "\n\n--- fallback docker logs ---\n" + dockerLog(def, 200);
        }
    }

    private String dockerLog(ServiceDef def, int n) {
        ProcessRunner.Result r = runner.run(repo(), runner.docker(
                "logs", "--tail", String.valueOf(n), def.getContainerName()), 20);
        if (!r.ok() && r.stdout().isBlank()) {
            return "Cannot read logs: " + r.stderr();
        }
        return (r.stdout() + r.stderr()).trim();
    }

    private List<String> filterLines(List<String> lines, String filter) {
        if (filter == null || filter.isBlank()) {
            return lines;
        }
        String f = filter.toLowerCase();
        List<String> out = new ArrayList<>();
        for (String line : lines) {
            if (line.toLowerCase().contains(f)) {
                out.add(line);
            }
        }
        return out.isEmpty() ? lines : out;
    }

    private Path repo() {
        return Path.of(properties.getRepoRoot()).toAbsolutePath().normalize();
    }

    private static String first(String a, String b) {
        if (a != null && !a.isBlank()) {
            return a;
        }
        if (b != null && !b.isBlank()) {
            return b;
        }
        return null;
    }
}
