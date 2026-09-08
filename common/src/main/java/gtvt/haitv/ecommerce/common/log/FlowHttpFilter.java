package gtvt.haitv.ecommerce.common.log;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class FlowHttpFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger("flow");

    @Value("${spring.application.name:service}")
    private String serviceName;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String p = request.getRequestURI();
        return p.startsWith("/actuator")
                || p.startsWith("/v3/api-docs")
                || p.startsWith("/swagger")
                || p.equals("/info")
                || p.equals("/error");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        FlowLog.svc(serviceName);
        String cid = FlowLog.ensureCid(request.getHeader(FlowLog.HEADER));
        response.setHeader(FlowLog.HEADER, cid);
        long t0 = System.currentTimeMillis();
        try {
            chain.doFilter(request, response);
        } finally {
            int status = response.getStatus();
            log.info("HTTP {} {} -> {} {}ms", request.getMethod(), request.getRequestURI(), status,
                    System.currentTimeMillis() - t0);
            FlowLog.clear();
        }
    }
}
