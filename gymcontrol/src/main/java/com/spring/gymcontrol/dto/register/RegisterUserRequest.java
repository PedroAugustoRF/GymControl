package com.spring.gymcontrol.dto.register;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterUserRequest(@NotBlank(message = "Nome Obrigatório") String nome,
                                  @NotBlank(message = "Email Obrigatório") @Email(message = "Email Inválido") String email,
                                  @NotBlank(message = "CPF Obrigatório") String cpf,
                                  String contato,
                                  @NotBlank(message = "Senha Obrigatória") @Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres") String password) {
}