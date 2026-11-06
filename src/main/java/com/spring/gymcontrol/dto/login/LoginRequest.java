package com.spring.gymcontrol.dto.login;

import jakarta.validation.constraints.NotEmpty;

public record LoginRequest(@NotEmpty(message = "Email Obrigatório") String email,
                           @NotEmpty(message = "Senha Obrigatória") String password) {
}
