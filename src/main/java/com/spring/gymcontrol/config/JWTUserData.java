package com.spring.gymcontrol.config;

import com.spring.gymcontrol.enums.Role;
import lombok.Builder;

@Builder
public record JWTUserData(long userId, String email, Role role) {
}