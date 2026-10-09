package gtvt.haitv.ecommerce.common.api;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class ErrorResponse {

    private boolean success = false;
    private String message;
    private String code;
    private Instant timestamp = Instant.now();

    public ErrorResponse(String message, String code) {
        this.message = message;
        this.code = code;
    }
}
