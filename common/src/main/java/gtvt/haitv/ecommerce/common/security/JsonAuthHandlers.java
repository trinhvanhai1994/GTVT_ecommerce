package gtvt.haitv.ecommerce.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import gtvt.haitv.ecommerce.common.api.ErrorResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;

import java.io.IOException;

public final class JsonAuthHandlers {

    private static final ObjectMapper MAPPER = new ObjectMapper().findAndRegisterModules();

    private JsonAuthHandlers() {
    }

    public static AuthenticationEntryPoint unauthorized() {
        return (request, response, authException) -> write(response, 401, "UNAUTHORIZED", "Unauthorized");
    }

    public static AccessDeniedHandler forbidden() {
        return (request, response, accessDeniedException) -> write(response, 403, "FORBIDDEN", "Forbidden");
    }

    private static void write(HttpServletResponse response, int status, String code, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        MAPPER.writeValue(response.getOutputStream(), new ErrorResponse(message, code));
    }
}
