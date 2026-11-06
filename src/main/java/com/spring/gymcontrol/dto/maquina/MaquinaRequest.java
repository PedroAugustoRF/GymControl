package com.spring.gymcontrol.dto.maquina;

import jakarta.validation.constraints.NotBlank;

public record MaquinaRequest(
        @NotBlank String nome,
        String fabricante
) {}