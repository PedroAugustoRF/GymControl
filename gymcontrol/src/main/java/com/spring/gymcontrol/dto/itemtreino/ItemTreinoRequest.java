package com.spring.gymcontrol.dto.itemtreino;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record ItemTreinoRequest(
        @NotNull Long exercicioId,
        @NotNull @Positive Integer series,
        @NotNull @Positive Integer repeticoes,
        @NotNull @PositiveOrZero BigDecimal carga,
        @NotNull @PositiveOrZero Integer ordem
) {}