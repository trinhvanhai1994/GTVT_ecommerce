package gtvt.haitv.ecommerce.common.api;

import java.time.Instant;

public class ErrorResponse {

    private boolean success = false;
    private String message;
    private String code;
    private Instant timestamp = Instant.now();

    public ErrorResponse() {
    }

    public ErrorResponse(String message, String code) {
        this.message = message;
        this.code = code;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
