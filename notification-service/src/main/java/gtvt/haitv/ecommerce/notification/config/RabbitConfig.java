package gtvt.haitv.ecommerce.notification.config;

import gtvt.haitv.ecommerce.common.event.OrderEvent;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "spring.rabbitmq.host")
public class RabbitConfig {
    @Bean
    public TopicExchange ecommerceExchange() {
        return new TopicExchange(OrderEvent.EXCHANGE, true, false);
    }

    @Bean
    public Queue notificationQueue() {
        return new Queue(OrderEvent.QUEUE, true);
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, TopicExchange ecommerceExchange) {
        return BindingBuilder.bind(notificationQueue).to(ecommerceExchange).with(OrderEvent.ROUTING_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
