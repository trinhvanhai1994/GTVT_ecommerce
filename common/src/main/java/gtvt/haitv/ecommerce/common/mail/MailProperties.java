package gtvt.haitv.ecommerce.common.mail;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "mail")
@Getter
@Setter
public class MailProperties {

    private boolean enabled = false;
    private String from = "";
    private String fromName = "Nava";
    private String storeUrl = "http://localhost:5173";
    private String brevoApiKey = "";
    private String brevoApiBaseUrl = "https://api.brevo.com";
}
