package com.spring.gymcontrol.dto.exercicio;

import com.spring.gymcontrol.enums.Agrupamento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ExercicioRequest(
        @NotBlank String nome,
        @NotNull Agrupamento agrupamento,
        Long maquinaId
) {}