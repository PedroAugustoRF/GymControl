package com.spring.gymcontrol.dto.user;

import com.spring.gymcontrol.enums.Role;
import lombok.Builder;

@Builder
public record UserResponse(
        Long id,
        String nome,
        String email,
        String cpf,
        String contato,
        Role role
) {}