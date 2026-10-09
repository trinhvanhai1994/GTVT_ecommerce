package gtvt.haitv.ecommerce.ops;

import gtvt.haitv.ecommerce.ops.config.OpsProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(OpsProperties.class)
public class OpsControlPlaneApplication {

    public static void main(String[] args) {
        SpringApplication.run(OpsControlPlaneApplication.class, args);
    }
}
