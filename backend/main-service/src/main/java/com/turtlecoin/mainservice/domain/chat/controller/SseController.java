package com.turtlecoin.mainservice.domain.chat.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.turtlecoin.mainservice.domain.chat.service.SseService;
import com.turtlecoin.mainservice.domain.user.entity.User;
import com.turtlecoin.mainservice.domain.user.service.JWTService;
import com.turtlecoin.mainservice.domain.user.service.UserService;
import com.turtlecoin.mainservice.domain.user.util.JWTUtil;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/main/notifications")
@RequiredArgsConstructor
public class SseController {
	private final SseService sseService;
	private final UserService userService;
	private final JWTUtil jwtUtil;

	@GetMapping(value = "/sse/subscribe/{id}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
	public SseEmitter subscribe(@PathVariable Long id, @RequestHeader HttpHeaders header) {
		// String accessToken = header.getFirst("Authorization").split("Bearer ")[1].split(" ")[0];
		// String userId = jwtUtil.getUsernameFromToken(accessToken);
		//
		// User user = userService.getUserByEmail(userId);
		//
		// // 본인만 본인 SSE에 연결가능함
		// if(user != null && user.getId().equals(id)){
		// 	return sseService.subscribe(id);
		// }
		// else{
		// 	return null;
		// }
		return sseService.subscribe(id);
	}

	@PostMapping("/send-data/{id}")
	public void sendData(@PathVariable Long id) {
		sseService.notify(id, "data");
	}
}
