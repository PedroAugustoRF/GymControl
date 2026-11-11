package com.spring.gymcontrol.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserRequest(
        @NotBlank String nome,
        @NotBlank @Email String email,
        @NotBlank String cpf,
        String contato
) {}