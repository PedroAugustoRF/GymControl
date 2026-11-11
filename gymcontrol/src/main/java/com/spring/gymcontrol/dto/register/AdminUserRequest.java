package com.spring.gymcontrol.dto.register;

import com.spring.gymcontrol.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdminUserRequest(
        @NotBlank String nome,
        @NotBlank @Email String email,
        @NotBlank String cpf,
        String contato,
        @NotBlank @Size(min = 6) String password,
        @NotNull Role role
) {}
