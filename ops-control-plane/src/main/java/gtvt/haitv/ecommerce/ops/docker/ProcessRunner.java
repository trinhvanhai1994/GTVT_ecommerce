package gtvt.haitv.ecommerce.ops.docker;

import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Component
public class ProcessRunner {

    public record Result(int exitCode, String stdout, String stderr) {
        public boolean ok() {
            return exitCode == 0;
        }
    }

    public Result run(Path workDir, List<String> command, long timeoutSeconds) {
        try {
            ProcessBuilder pb = new ProcessBuilder(command);
            if (workDir != null) {
                pb.directory(workDir.toFile());
            }
            pb.redirectErrorStream(false);
            Process p = pb.start();
            StringBuilder out = new StringBuilder();
            StringBuilder err = new StringBuilder();
            try (BufferedReader bo = new BufferedReader(new InputStreamReader(p.getInputStream(), StandardCharsets.UTF_8));
                 BufferedReader be = new BufferedReader(new InputStreamReader(p.getErrorStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = bo.readLine()) != null) {
                    out.append(line).append('\n');
                }
                while ((line = be.readLine()) != null) {
                    err.append(line).append('\n');
                }
            }
            boolean finished = p.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            if (!finished) {
                p.destroyForcibly();
                return new Result(124, out.toString(), err + "\nTIMEOUT after " + timeoutSeconds + "s");
            }
            return new Result(p.exitValue(), out.toString(), err.toString());
        } catch (Exception e) {
            return new Result(1, "", e.getMessage() == null ? e.toString() : e.getMessage());
        }
    }

    public Result runStreaming(Path workDir, List<String> command, long timeoutSeconds, StringBuilder liveLog) {
        try {
            ProcessBuilder pb = new ProcessBuilder(command);
            if (workDir != null) {
                pb.directory(workDir.toFile());
            }
            pb.redirectErrorStream(true);
            Process p = pb.start();
            try (BufferedReader bo = new BufferedReader(new InputStreamReader(p.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = bo.readLine()) != null) {
                    liveLog.append(line).append('\n');
                }
            }
            boolean finished = p.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            if (!finished) {
                p.destroyForcibly();
                liveLog.append("TIMEOUT after ").append(timeoutSeconds).append("s\n");
                return new Result(124, liveLog.toString(), "TIMEOUT");
            }
            return new Result(p.exitValue(), liveLog.toString(), "");
        } catch (Exception e) {
            String msg = e.getMessage() == null ? e.toString() : e.getMessage();
            liveLog.append(msg).append('\n');
            return new Result(1, liveLog.toString(), msg);
        }
    }

    public List<String> docker(String... args) {
        List<String> cmd = new ArrayList<>();
        cmd.add("docker");
        for (String a : args) {
            cmd.add(a);
        }
        return cmd;
    }

    public List<String> compose(String... args) {
        List<String> cmd = new ArrayList<>();
        cmd.add("docker");
        cmd.add("compose");
        for (String a : args) {
            cmd.add(a);
        }
        return cmd;
    }
}
