package com.spring.gymcontrol.dto.exercicio;

import com.spring.gymcontrol.enums.Agrupamento;
import lombok.Builder;

@Builder
public record ExercicioResponse(
        Long id,
        String nome,
        Agrupamento agrupamento,
        String maquina
) {}