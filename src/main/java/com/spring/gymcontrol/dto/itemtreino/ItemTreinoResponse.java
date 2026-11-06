package com.spring.gymcontrol.dto.itemtreino;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record ItemTreinoResponse(
        Long id,
        Integer ordem,
        String exercicio,
        String maquina,
        Integer series,
        Integer repeticoes,
        BigDecimal carga
) {}