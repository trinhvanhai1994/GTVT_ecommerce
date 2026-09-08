package gtvt.haitv.ecommerce.order.dto;

import jakarta.validation.constraints.NotBlank;

public class CheckoutRequest {
    @NotBlank private String shippingName;
    @NotBlank private String shippingPhone;
    @NotBlank private String shippingAddress;
    @NotBlank private String paymentMethod;
    private boolean simulatePaymentFailure;

    public String getShippingName() { return shippingName; }
    public void setShippingName(String shippingName) { this.shippingName = shippingName; }
    public String getShippingPhone() { return shippingPhone; }
    public void setShippingPhone(String shippingPhone) { this.shippingPhone = shippingPhone; }
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public boolean isSimulatePaymentFailure() { return simulatePaymentFailure; }
    public void setSimulatePaymentFailure(boolean simulatePaymentFailure) { this.simulatePaymentFailure = simulatePaymentFailure; }
}
