package gtvt.haitv.ecommerce.cart.client;

import feign.RequestInterceptor;
import gtvt.haitv.ecommerce.common.log.FlowLog;
import org.springframework.stereotype.Component;

@Component
public class FeignCorrelationInterceptor implements RequestInterceptor {

    @Override
    public void apply(feign.RequestTemplate template) {
        String cid = FlowLog.cid();
        if (cid != null) {
            template.header(FlowLog.HEADER, cid);
        }
    }
}
