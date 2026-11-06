package com.spring.gymcontrol.dto.treino;

import com.spring.gymcontrol.dto.itemtreino.ItemTreinoResponse;
import com.spring.gymcontrol.enums.DiasSemana;
import lombok.Builder;

import java.util.List;

@Builder
public record TreinoResponse(
        Long id,
        DiasSemana diaSemana,
        List<ItemTreinoResponse> itens
) {}