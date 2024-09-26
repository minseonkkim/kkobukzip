package com.turtlecoin.auctionservice.domain.websocket.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
//    private final WebSocketHandShakeInterceptor handshakeInterceptor;
//    private final JwtChannelInterceptor jwtChannelInterceptor;
//
//    public WebSocketConfig(WebSocketHandShakeInterceptor handshakeInterceptor, JwtChannelInterceptor jwtChannelInterceptor) {
//        this.handshakeInterceptor = handshakeInterceptor;
//        this.jwtChannelInterceptor = jwtChannelInterceptor;
//    }
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/sub"); //메세지 받을 때 경로
        config.setApplicationDestinationPrefixes("/pub"); //메세지 보낼 때 경로
    }
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/auction") //우리의 endpoint
                .setAllowedOrigins("*");
        System.out.println("registry: "+registry);
//                .addInterceptors(handshakeInterceptor); // 핸드셰이크 인터셉터 추가
    }
    @Override
    public void configureClientInboundChannel(org.springframework.messaging.simp.config.ChannelRegistration registration) {
//        registration.interceptors(jwtChannelInterceptor); // STOMP 메시지 인터셉터 추가
    }

}