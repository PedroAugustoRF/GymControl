package com.spring.gymcontrol.dto.maquina;

import lombok.Builder;

@Builder
public record MaquinaResponse(
        Long id,
        String nome,
        String fabricante
) {}