package gtvt.haitv.ecommerce.common.log;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

import java.util.UUID;

public final class FlowLog {

    public static final String CID = "cid";
    public static final String SVC = "svc";
    public static final String HEADER = "X-Correlation-Id";

    private static final Logger log = LoggerFactory.getLogger("flow");

    private final String fn;
    private int step;

    private FlowLog(String fn) {
        this.fn = fn;
        log.info("start {}", fn);
    }

    public static FlowLog start(String fn) {
        return new FlowLog(fn);
    }

    public FlowLog step(String msg) {
        log.info("{} {}", ++step, msg);
        return this;
    }

    public void end(String result) {
        log.info("end {} {}", fn, result);
    }

    public void endOk() {
        end("ok");
    }

    public void fail(String reason) {
        log.warn("end {} FAIL {}", fn, reason);
    }

    public void fail(Throwable t) {
        String reason = t.getClass().getSimpleName();
        if (t instanceof gtvt.haitv.ecommerce.common.exception.ApiException) {
            reason = ((gtvt.haitv.ecommerce.common.exception.ApiException) t).getCode();
        }
        fail(reason);
    }

    public static String ensureCid(String incoming) {
        if (incoming != null && !incoming.isBlank()) {
            String cid = incoming.trim();
            MDC.put(CID, cid);
            return cid;
        }
        String cid = UUID.randomUUID().toString().substring(0, 8);
        MDC.put(CID, cid);
        return cid;
    }

    public static void svc(String name) {
        if (name != null && !name.isBlank()) {
            MDC.put(SVC, name);
        }
    }

    public static String cid() {
        return MDC.get(CID);
    }

    public static void clear() {
        MDC.remove(CID);
        MDC.remove(SVC);
    }
}
