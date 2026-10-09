package gtvt.haitv.ecommerce.ops.web.dto;

public class ApiEnvelope<T> {
    private boolean success = true;
    private String message;
    private T data;

    public static <T> ApiEnvelope<T> ok(T data) {
        ApiEnvelope<T> e = new ApiEnvelope<>();
        e.data = data;
        e.message = "OK";
        return e;
    }

    public static <T> ApiEnvelope<T> fail(String message) {
        ApiEnvelope<T> e = new ApiEnvelope<>();
        e.success = false;
        e.message = message;
        return e;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
}
