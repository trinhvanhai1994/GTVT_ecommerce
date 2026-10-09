package gtvt.haitv.ecommerce.common.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "jwt")
@Getter
@Setter
public class JwtProperties {

    private String secret = "change-me-to-a-long-random-secret-at-least-256-bits";
    private long expirationMs = 86400000L;
}
