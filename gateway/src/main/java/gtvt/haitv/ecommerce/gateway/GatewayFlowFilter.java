package gtvt.haitv.ecommerce.gateway;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

import static org.springframework.cloud.gateway.support.ServerWebExchangeUtils.GATEWAY_ROUTE_ATTR;

@Component
public class GatewayFlowFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger("flow");
    private static final String HEADER = "X-Correlation-Id";

    @Value("${spring.application.name:GATEWAY}")
    private String serviceName;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        if (path.startsWith("/actuator")) {
            return chain.filter(exchange);
        }
        String incoming = exchange.getRequest().getHeaders().getFirst(HEADER);
        String cid = (incoming == null || incoming.isBlank())
                ? UUID.randomUUID().toString().substring(0, 8)
                : incoming.trim();
        ServerHttpRequest req = exchange.getRequest().mutate().header(HEADER, cid).build();
        ServerWebExchange ex = exchange.mutate().request(req).build();
        ex.getResponse().getHeaders().set(HEADER, cid);

        Route route = ex.getAttribute(GATEWAY_ROUTE_ATTR);
        String method = req.getMethod().name();
        String routeId = route == null ? "?" : route.getId();
        String uri = route == null ? "?" : String.valueOf(route.getUri());
        long t0 = System.currentTimeMillis();

        log.info("[{}] [{}] start {} {}", serviceName, cid, method, path);
        log.info("[{}] [{}] 1 route {} -> {}", serviceName, cid, routeId, uri);

        return chain.filter(ex).doFinally(sig -> {
            Integer code = ex.getResponse().getStatusCode() == null
                    ? null
                    : ex.getResponse().getStatusCode().value();
            log.info("[{}] [{}] end {} {} {} {}ms", serviceName, cid, method, path,
                    code == null ? "-" : code, System.currentTimeMillis() - t0);
        });
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
