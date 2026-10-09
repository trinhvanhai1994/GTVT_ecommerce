package gtvt.haitv.ecommerce.common.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@EnableConfigurationProperties(MailProperties.class)
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final MailProperties properties;
    private final RestClient restClient;

    public EmailService(MailProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.create();
    }

    public String storeUrl() {
        String url = properties.getStoreUrl();
        if (url == null || url.isBlank()) {
            return "http://localhost:5173";
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    /**
     * Sends email via Brevo when enabled + API key present; otherwise logs a mock and returns true.
     */
    public boolean send(String to, String subject, String body) {
        if (to == null || to.isBlank()) {
            return false;
        }
        if (!properties.isEnabled()
                || properties.getBrevoApiKey() == null
                || properties.getBrevoApiKey().isBlank()) {
            log.info("[MOCK EMAIL] to={} subject={} body=\n{}", to, subject, body);
            return true;
        }
        String from = properties.getFrom();
        if (from == null || from.isBlank()) {
            log.warn("[EMAIL] MAIL_FROM is empty; skip send to={}", to);
            return false;
        }
        try {
            String base = properties.getBrevoApiBaseUrl();
            if (base == null || base.isBlank()) {
                base = "https://api.brevo.com";
            }
            if (base.endsWith("/")) {
                base = base.substring(0, base.length() - 1);
            }
            restClient.post()
                    .uri(base + "/v3/smtp/email")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("api-key", properties.getBrevoApiKey())
                    .body(Map.of(
                            "sender", Map.of(
                                    "name", properties.getFromName() == null ? "Nava" : properties.getFromName(),
                                    "email", from),
                            "to", List.of(Map.of("email", to)),
                            "subject", subject == null ? "" : subject,
                            "textContent", body == null ? "" : body))
                    .retrieve()
                    .toBodilessEntity();
            log.info("[EMAIL] sent to={} subject={}", to, subject);
            return true;
        } catch (Exception e) {
            log.warn("[EMAIL] failed to={}: {}", to, e.getMessage());
            return false;
        }
    }
}
